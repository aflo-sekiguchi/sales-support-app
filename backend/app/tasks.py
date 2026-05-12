from .celery_app import celery_app
import imaplib
from app.database import SessionLocal
from email import message_from_bytes
from .models.email import Email, EmailSyncStatus, EmailAttachment
from email.header import decode_header
from email.utils import parsedate_to_datetime
from sqlalchemy import select, delete
from datetime import datetime
from .schemas.email import EmailResponseGemini
from redis import Redis
from bs4 import BeautifulSoup
from google.genai import Client
from app.core.config import settings
import bleach
import textwrap
import os
import logging


host = settings.REDIS_HOST
redis_port = settings.REDIS_PORT
redis = Redis(host=host, port=redis_port, db=0)
IMAP_HOST = settings.IMAP_HOST
IMAP_PORT = settings.IMAP_PORT
IMAP_USER = settings.IMAP_USER
IMAP_PASSWORD = settings.IMAP_PASSWORD
GEMINI_API_KEY = settings.GEMINI_API_KEY

logger = logging.getLogger(__name__)

@celery_app.task(name="sync_emails")
def sync_emails():
    logger.info("=== sync_emails start ===")
    """
	IMAPサーバとDBのメールを同期するタスク
	- サーバ上に存在しないメールはDBから削除
	- 新しいメールはDBに追加
	"""

    # --- 排他制御 ---
    lock = redis.lock("sync_emails_lock", timeout=86400)
    if not lock.acquire(blocking=False):
        return {"status": "skipped", "reason": "already_running"}

    # 初期化
    db = None
    imap = None

    try:
        db = SessionLocal()

        # --- IMAPサーバ接続 ---
        imap = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        imap.login(IMAP_USER, IMAP_PASSWORD)
        imap.select("INBOX")
        # from_date = datetime.now() - timedelta(days=4)
        from_date = datetime(2025, 12, 8)
        from_date_str = from_date.strftime("%d-%b-%Y")
        # --- サーバ上の全UIDを取得 ---
        status, messages = imap.uid("search", None, f"ON {from_date_str}")
        if status != "OK":
            return {"error": "メール検索に失敗"}

        server_uids = set(uid.decode() for uid in messages[0].split())  # bytesのセット
        local_uids = set(db.scalars(select(Email.uid)).all())

        # --- サーバにないメールをDBから削除 ---
        deleted_uids = local_uids - server_uids
        if deleted_uids:
            db.execute(delete(Email).where(Email.uid.in_(deleted_uids)))

        # --- 新しいメールを取得して保存 ---
        new_uids = server_uids - local_uids
        for uid in sorted(list(new_uids)):
            # ヘッダー取得
            status, header_data = imap.uid("fetch", uid, "(BODY[HEADER])")
            if status != "OK" or not header_data:
                continue

            # 本文取得
            status, body_data = imap.uid("fetch", uid, "(BODY[TEXT])")
            if status != "OK" or not body_data:
                continue

            raw_msg = header_data[0][1] + body_data[0][1]
            msg = message_from_bytes(raw_msg)

            from_addr = decode_mime_header(msg.get("From", ""))
            subject = decode_mime_header(msg.get("Subject", ""))
            date_str = msg.get("Date")
            received_at = parsedate_to_datetime(date_str) if date_str else None

            # 本文抽出
            body = ""
            body_text = ""
            attachment_list = []

            if msg.is_multipart():
                html_text = ""
                plane_text = ""
                html_body = ""
                plain_body = ""
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))

                    # 添付ファイル処理
                    if "attachment" in content_disposition.lower():
                        raw_filename = part.get_filename()
                        filename = decode_mime_header(raw_filename)

                        payload = part.get_payload(decode=True)

                        dir_path = f"/app/uploads/{uid}"
                        os.makedirs(dir_path, exist_ok=True)

                        save_path = os.path.join(dir_path, filename)
                        public_path = os.path.join(f"/app/files/{uid}", filename)

                        with open(save_path, "wb") as f:
                            f.write(payload)

                        # DB にメタ情報だけ記録
                        attachment_list.append(
                            EmailAttachment(
                                file_name=filename,
                                file_path=public_path,
                                mime_type=part.get_content_type(),
                                size=len(payload),
                            )
                        )

                    # text/plain → そのまま取得
                    if content_type == "text/plain":
                        charset = part.get_content_charset() or "utf-8"
                        plain_body += part.get_payload(decode=True).decode(
                            charset, errors="ignore"
                        )
                        plane_text += plain_body

                    # text/html → BeautifulSoupでタグ除去して取得
                    elif content_type == "text/html":
                        charset = part.get_content_charset() or "utf-8"
                        html = part.get_payload(decode=True).decode(
                            charset, errors="ignore"
                        )
                        soup = BeautifulSoup(html, "html.parser")
                        html_text += soup.get_text()
                        # 💡 style, script, meta, link を削除してから sanitize
                        for tag in soup(["style", "script", "meta", "link"]):
                            tag.decompose()
                        html_body += sanitize_html(str(soup))

                # HTML があれば優先、なければテキスト
                body = html_body if html_body else plain_body
                body_text = plane_text if plane_text else html_text

            else:
                # 非multipartメール
                charset = msg.get_content_charset() or "utf-8"
                payload = msg.get_payload(decode=True).decode(charset, errors="ignore")

                # text/html の場合も考慮
                if msg.get_content_type() == "text/html":
                    soup = BeautifulSoup(payload, "html.parser")
                    body_text = soup.get_text()
                    for tag in soup(["style", "script", "meta", "link"]):
                        tag.decompose()
                    body = sanitize_html(str(soup))
                else:
                    body = payload
                    body_text = plain_body

            # skills = pickup_skills(body_text)

            # GeminiAPIに本文を投げる処理
            prompt = f"""
			以下のメール本文を解析し、次の3点を実行してください。

			1. メールカテゴリの判定
			- 「人材紹介メール」（候補者を紹介する内容） → "engineer"
			- 「求人メール」（案件やポジションを提示する内容） → "job"
			- 判定できない場合 → "unknown"

			2. 本文に含まれる “ハードスキルのみ” を抽出
			【抽出ルール】
			- 対象：技術スタックに該当するハードスキルのみ
				例：python, react, aws, docker, fastapi, node.js, gcp など
			- 日本語を含むスキル名は、アルファベット部分のみを抽出
				例：生成AI → "ai", Cisco機器 → "cisco"
			- 本文に出現した単語のみ使用し、推測による補完は禁止
			- スペースを含む技術名は一語として扱う
				例："Azure OpenAI" → "azure openai"
			- アルファベット表記のスキルは、大小文字や記号の有無に関係なくすべて小文字で返す
				例：Python → "python", React Native → "react native", Next.js → "next.js"
			- 以下は除外する
				・ソフトスキル（コミュニケーション、リーダーシップ、問題解決力 など）
				・日本語のみ表記のスキル（画像認識、クラウド開発 など）

			3. 本文に金額の記載がある場合、最小値と最大値を抽出
			- 月額・時給・年収など形式は問わない
			- 抽出する値は整数のみ（例：400000）
			- 見つからない場合は null を返す

			出力は **必ず JSON のみ** を返してください。
			説明文・注釈・余計なテキストは一切含めないでください。

			---
			[メール本文]
			{body_text}

			---
			[出力仕様]
			- category: "engineer" | "job" | "unknown"
			- skills: 抽出したハードスキルのリスト（すべて小文字）
			- price_min: 金額の最小値（int または null）
			- price_max: 金額の最大値（int または null）

			---
			[出力例]
			{{
			"category": "job",
			"skills": ["python", "django"],
			"price_min": 400000,
			"price_max": 700000
			}}
			"""
            prompt = textwrap.dedent(prompt)
            # The client gets the API key from the environment variable `GEMINI_API_KEY`.
            client = Client(api_key=GEMINI_API_KEY)

            # Geminiレスポンス
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": EmailResponseGemini.model_json_schema(),
                },
            )

            print(response.text)
            print(type(response.text))

            parsed = EmailResponseGemini.model_validate_json(response.text)

            # --- DB保存 ---
            email_record = Email(
                uid=uid,
                from_address=from_addr,
                subject=subject,
                received_at=received_at,
                body=body,
                category=parsed.category,
                skills=parsed.skills,
                price_min=parsed.price_min,
                price_max=parsed.price_max,
                ai_confidence=0.5,
            )
            db.add(email_record)
            db.flush()

            for attachment in attachment_list:
                attachment.email_id = email_record.id
                db.add(attachment)

            logger.info(uid)

        # result + email_list を返す
        added = len(new_uids)
        deleted = len(deleted_uids)
        remaining = len(server_uids)

        result = {
            "status": "synced",
            "added": added,
            "deleted": deleted,
            "remaining": remaining,
        }

        # --- EmailSyncStatus の更新 ---
        # 更新があれば実行
        if added != 0 or deleted != 0:
            # id=1 の行を取得。存在しなければ作成
            sync_status = db.get(EmailSyncStatus, 1)
            if not sync_status:
                sync_status = EmailSyncStatus(id=1)
            sync_status.last_updated_at = datetime.now()
            sync_status.added = added
            sync_status.deleted = deleted
            sync_status.remaining = remaining
            db.merge(sync_status)  # 存在すれば更新、なければ追加

        db.commit()

        return result

    except Exception as e:
        if db:
            db.rollback()
        return {"error": str(e)}

    finally:
        if db:
            db.close()
        if imap:
            try:
                imap.logout()
            except Exception:
                pass
        if lock.locked():
            try:
                lock.release()
            except redis.exceptions.LockNotOwnedError:
                pass  # 他のプロセスによりロックが解放済み


def decode_mime_header(header_value):
    """
    メールのヘッダーデコード関数
    param header_value: メールのヘッダ名
    return: デコードされた文字列
    """
    if not header_value:
        return ""
    decoded_parts = decode_header(header_value)
    decoded_string = ""
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            decoded_string += part.decode(encoding or "utf-8", errors="ignore")
        else:
            decoded_string += part
    return decoded_string


def sanitize_html(html: str) -> str:
    """
    必要なタグを許可

    param html: str
    return: str
    """
    allowed_tags = bleach.sanitizer.ALLOWED_TAGS | {
        "table",
        "tr",
        "td",
        "tbody",
        "thead",
        "span",
        "div",
        "p",
        "img",
        "a",
        "br",
    }

    # 無効なタグはタグ内のテキストのみ取り出される
    clean_html = bleach.clean(html, tags=allowed_tags, strip=True)

    return clean_html


# マスタデータ（キーワード一覧）
MASTER_WORDS = ["apple", "banana", "orange", "python", "fastapi"]


def pickup_skills(data: str):
    """
    スキルセット検索関数
    引数の文字列からマスタと一致するスキルを抽出する

    param data: str
    return: str[]
    """
    text = data.text.lower()  # 小文字化して比較しやすく
    hits = []

    for word in MASTER_WORDS:
        if word.lower() in text:
            hits.append(word)

    return hits


# redis接続確認用
@celery_app.task(name="ping_redis")
def ping_redis():
    from redis import Redis

    r = Redis(host="redis", port=redis_port, db=0)
    return r.ping()

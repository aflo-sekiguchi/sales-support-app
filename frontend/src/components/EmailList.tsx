import { useEffect, useRef } from "react";
import type { EmailListProps } from "../types";

const EmailList: React.FC<EmailListProps> = ({
  title,
  emails,
  onEmailClick,
  scrollPosition,
  onScrollChange,
  currentPage,
  onPageChange,
}) => {
  const emailsPerPage = 50;

  const totalPages =
    emails?.length === 0 ? 1 : Math.ceil((emails?.length ?? 1) / emailsPerPage);
  const startIndex = (currentPage - 1) * emailsPerPage;
  const endIndex = Math.min(startIndex + emailsPerPage, emails?.length ?? 0);
  const currentEmails = emails?.slice(startIndex, endIndex);

  const scrollRef = useRef<HTMLUListElement | null>(null);

  // ✅ ページが切り替わったときにスクロールを先頭に戻す
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentPage]); // ← currentPageが変わるたびに実行

  // スクロール位置復元
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollPosition;
        }
      }, 0);
    }
  }, [scrollPosition]); // ← scrollPositionが変わるたびに実行

  // スクロール時に位置を親へ通知
  const onScroll = () => {
    if (scrollRef.current) {
      onScrollChange(scrollRef.current.scrollTop);
    }
  };

  // ページ移動用関数
  const goToPage = (page: number) => {
    onPageChange(page);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
        <h5 className="mb-0">{title}</h5>
        <small className="text-muted">
          {emails?.length === 0
            ? "0件"
            : `${startIndex + 1}–${endIndex} / ${emails?.length}`}
        </small>
      </div>

      <ul
        ref={scrollRef}
        className="list-group flex-grow-1 overflow-auto mail-list"
        onScroll={onScroll}
      >
        {currentEmails?.map((email) => (
          <li
            key={email.id}
            className="list-group-item mail-hover"
            onClick={() => onEmailClick(email)}
          >
            <strong>{email.subject || "(件名なし)"}</strong>
            <br />
            <small>From: {email.from_address}</small>
            <br />
            <small>{new Date(email.received_at).toLocaleString()}</small>
          </li>
        ))}

        {currentEmails?.length === 0 && (
          <li className="list-group-item text-center text-muted">
            メールがありません
          </li>
        )}
      </ul>

      {/* ✅ ページネーション */}
      {
        <div className="mt-3 d-flex justify-content-center align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => goToPage(1)}
            title="最初のページへ"
          >
            «
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            title="前のページへ"
          >
            ‹
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            title="次のページへ"
          >
            ›
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(totalPages)}
            title="最後のページへ"
          >
            »
          </button>
        </div>
      }
    </>
  );
};

export default EmailList;

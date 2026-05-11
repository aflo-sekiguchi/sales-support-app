import { useState, useEffect, useRef } from "react";
import axios from "axios";
import type { Email, MailCategory, SearchedEmails, EmailSyncStatus, Attachment } from "../types";
import isEqual from "lodash/isEqual";

export const useMailManager = () => {
  const [activeTab, setActiveTab] = useState<MailCategory>("engineer");
  const [allEmails, setAllEmails] = useState<Email[] | null>(null);
  const [selectedEngineerEmail, setSelectedEngineerEmail] = useState<Email | null>(null);
  const [selectedJobEmail, setSelectedJobEmail] = useState<Email | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matchedEmails, setMatchedEmails] = useState<Email[] | null>(null);
  const [pages, setPages] = useState({ engineer: 1, job: 1 });
  const [scrollPositions, setScrollPositions] = useState({ engineer: 0, job: 0 });
  const [newSkill, setNewSkill] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);  
  const [query, setQuery] = useState("");
  const [searchedEmails, setSearchedEmails] = useState<SearchedEmails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [emailSyncStatus, setEmailSyncStatus] = useState<EmailSyncStatus>();

  const scrollRef = useRef<HTMLUListElement | null>(null);

  // --- メール取得 ---
  useEffect(() => {
    axios
      .get<Email[]>("http://localhost:8000/emails/all")
      .then((res) => setAllEmails(res.data))
      .catch((err) => console.error("API取得エラー:", err));
  }, [emailSyncStatus]);

  // --- メール分類 ---
  const engineerEmails = searchedEmails?.engineer ?? (allEmails?.filter((e) => e.category === "engineer") ?? []);
  const jobEmails = searchedEmails?.job ?? (allEmails?.filter((e) => e.category === "job") ?? []);

  // --- スクロール・ページ管理 ---
  const onPageChange = (type: MailCategory, page: number) => {
    setPages((prev) => ({ ...prev, [type]: page }));
  };
  const onScrollChange = (type: MailCategory, pos: number) => {
    setScrollPositions((prev) => ({ ...prev, [type]: pos }));
  };

  // --- スキル操作 ---
  const onToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // --- マッチングAPI ---
  const onMatchEmails = async () => {
    const selectedLeftEmail = activeTab === "engineer" ? selectedEngineerEmail : selectedJobEmail;
    const setSelectedRightEmail = activeTab === "engineer" ? setSelectedJobEmail : setSelectedEngineerEmail;

    if (!selectedLeftEmail) {
      alert("マッチング元メールが選択されていません。");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/emails/match", {
        category: selectedLeftEmail.category,
        skills: selectedSkills,
      });

      setMatchedEmails(response.data);
      setSelectedRightEmail(null);
      console.log("マッチ結果:", response.data);
    } catch (error) {
      console.error("マッチAPI呼び出しエラー:", error);
    }
  };

  // --- マッチングリセット ---
  const onResetMatchedEmails = () => {
    setMatchedEmails(null);
  };

  // --- マッチングリスト切り替え時の初期化--- 
  useEffect(() => {
    const setSelectedRightEmail = activeTab === "engineer" ? setSelectedJobEmail : setSelectedEngineerEmail;
    const rightEmailsCategory = activeTab === "engineer" ? "job" : "engineer";
    setSelectedRightEmail(null);
    onPageChange(rightEmailsCategory, 1);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [matchedEmails]);

  // --- 検索API ---
  const searchEmails = async (query: string, category: MailCategory): Promise<Email[]> => {
    try {
      const response = await axios.post("http://localhost:8000/emails/search", {
        query, // ← JSON.stringify不要
        category,
      });

      return response.data; // axiosは自動でJSONをパースしてくれる
    } catch (error: any) {
      console.error("Failed to fetch emails:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to fetch emails from API"
      );
    }
  };

  // --- 検索関数 ---
  const onSearch = async () => {
    setLoading(true);
    setSearchError(null);
    try {
      const data = await searchEmails(query, activeTab);
      setSearchedEmails((prev) => ({...prev ?? {}, [activeTab]: data}));
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 検索結果リセット関数
  const onResetSearch = () => {
    setSearchedEmails((prev) => ({...prev, [activeTab]: null}));
  }

  // 選択されたメールを初期化する
  useEffect(() => {
    const setSelectedLeftEmail = activeTab === "engineer" ? setSelectedEngineerEmail : setSelectedJobEmail;
    setSelectedLeftEmail(null);
    onPageChange(activeTab, 1);
  }, [searchedEmails]);

  // --- メールリスト同期関数 ---
  const onSyncEmails =  async () => {
    try {
      const response = await axios.post("http://localhost:8000/emails/sync-emails");
      return
    } catch (error: any) {
      // エラーハンドリング
      if (axios.isAxiosError(error)) {
        console.error("APIエラー:", error.response?.data || error.message);
      } else {
        console.error("不明なエラー:", error);
      }
      throw error;
    }
  }

  // --- メールリストの更新有無ステータスを確認する関数 ---
  const fetchStatus = async () => {
    try {
      const response = await axios.post<EmailSyncStatus>("http://localhost:8000/emails/email-sync-status");
        setEmailSyncStatus((prev) => (
          isEqual(prev, response.data) ? prev : response.data
        )
      );
    } catch (error) {
      console.error("Failed to fetch email sync status:", error);
    }
  };

  // --- 定期的にメールリストをメールサーバと同期する関数 ---
  const useEmailSyncStatus = () => {
    useEffect(() => {
      // 5分ごと（300,000ms）
      const intervalId = setInterval(fetchStatus, 5 * 60 * 1000);

      // クリーンアップ
      return () => clearInterval(intervalId);
    }, []);

    return emailSyncStatus;
  };

  // --- ファイルダウンロードAPI ---
  const onDownloadFile = async (uid: string, attachment: Attachment) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/emails/files",
        {
          uid: uid,
          file_name: attachment.file_name,
          mime_type: attachment.mime_type,
        },
        {
          responseType: "blob", // これが重要
        }
      );

      const blob = new Blob([response.data], { type: attachment.mime_type });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.file_name);
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to download email attchment:", error);
    }
  }

  return {
    activeTab,
    setActiveTab,
    engineerEmails,
    jobEmails,
    selectedEngineerEmail,
    setSelectedEngineerEmail,
    selectedJobEmail,
    setSelectedJobEmail,
    selectedSkills,
    setSelectedSkills,
    onToggleSkill,
    matchedEmails,
    onMatchEmails,
    onResetMatchedEmails,
    pages,
    onPageChange,
    scrollPositions,
    onScrollChange,
    newSkill,
    setNewSkill,
    isAdding,
    setIsAdding,
    setQuery,
    searchedEmails,
    onSearch,
    onResetSearch,
    onSyncEmails,
    useEmailSyncStatus,
    onDownloadFile,
  };
};

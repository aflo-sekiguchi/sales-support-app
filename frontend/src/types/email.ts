export type MailCategory = "engineer" | "job";
import type { Dispatch, SetStateAction } from "react";

export type Email = {
  id: number;
  uid: string;
  from_address: string;
  subject: string;
  received_at: string;
  category: MailCategory;
  body?: string;
  skills?: string[];
  // price_min?: number;
  // price_max?: number;
  // ai_confidence?: number;
  attachments: Attachment[];
};

export type Attachment = {
  id: number;
  email_id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  size: number;
};

export type EmailDetailProps = {
  email: Email;
  onBack: () => void;
  onDownloadFile: (email_id: string, attachment: Attachment) => void;
};

export type EmailListProps = {
  title: string;
  emails: Email[] | null;
  onEmailClick: (email: Email) => void;
  scrollPosition: number;
  onScrollChange: (pos: number) => void;
  currentPage: number;
  onPageChange: (p: number) => void;
};

export type SearchSectionProps = {
  leftSkills: string[];
  rightSkills: string[];
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onMatchEmails: () => Promise<void>;
  onResetMatch: () => void;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  matchedEmails: Email[] | null;
  activeTab: MailCategory;
  setQuery: (query: string) => void;
  onSearch: () => void;
  onResetSearch: () => void;
};

export type SkillsTagSectionProps = {
  skills: string[];
  selectedSkills: string[];
  newSkill?: string;
  isAdding?: boolean;
  editable?: boolean; // ← 左側のみ true（追加機能あり）
  onToggleSkill?: (skill: string) => void;
  onAddSkill?: () => void;
  onToggleIsAdding?: () => void;
  onChangeSkillInput?: (value: string) => void;
  title: string;
};

export type SearchedEmails = {
  engineer?: Email[];
  job?: Email[];
};

export type EmailSyncStatus = {
  last_updated_at: string | null;
};

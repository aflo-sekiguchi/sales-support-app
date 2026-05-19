import type { MailCategory } from "./email";

export type HeaderProps = {
  activeTab: MailCategory;
  onTabChange: (tab: MailCategory) => void;
  onResetMatch: () => void;
  onSyncEmails: () => void;
  handleLogout: () => void;
};

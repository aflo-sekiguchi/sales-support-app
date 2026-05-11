import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import SearchSection from "./components/SearchSection";
import EmailList from "./components/EmailList";
import EmailDetail from "./components/EmailDetail";
import { useMailManager } from "./hooks/useMailManager";

const App: React.FC = () => {
  const {
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
    onSearch,
    onResetSearch,
    onSyncEmails,
    useEmailSyncStatus,
    onDownloadFile,
  } = useMailManager();

  useEmailSyncStatus();
  const isEngineerLeft = activeTab === "engineer";
  const selectedLeftEmail = isEngineerLeft
    ? selectedEngineerEmail
    : selectedJobEmail;
  const selectedRightEmail = isEngineerLeft
    ? selectedJobEmail
    : selectedEngineerEmail;

  return (
    <div>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onResetMatch={onResetMatchedEmails}
        onSyncEmails={onSyncEmails}
      />
      <div className="d-flex w-100 flex-fill">
        <SearchSection
          leftSkills={selectedLeftEmail?.skills || []}
          rightSkills={selectedRightEmail?.skills || []}
          selectedSkills={selectedSkills}
          onToggleSkill={onToggleSkill}
          onMatchEmails={onMatchEmails}
          onResetMatch={onResetMatchedEmails}
          newSkill={newSkill}
          setNewSkill={setNewSkill}
          isAdding={isAdding}
          setIsAdding={setIsAdding}
          matchedEmails={matchedEmails}
          activeTab={activeTab}
          setQuery={setQuery}
          onSearch={onSearch}
          onResetSearch={onResetSearch}
        />

        {(isEngineerLeft
          ? (["engineer", "job"] as const)
          : (["job", "engineer"] as const)
        ).map((type, index) => {
          const isEngineer = type === "engineer";
          const title = isEngineer ? "人材一覧" : "求人一覧";
          const emails = isEngineer ? engineerEmails : jobEmails;
          const selectedEmail = isEngineer
            ? selectedEngineerEmail
            : selectedJobEmail;
          const setSelectedEmail = isEngineer
            ? setSelectedEngineerEmail
            : setSelectedJobEmail;
          const scrollPos = isEngineer
            ? scrollPositions.engineer
            : scrollPositions.job;
          const currentPage = isEngineer ? pages.engineer : pages.job;
          const onPageChangeForType = (page: number) =>
            onPageChange(type, page);

          return (
            <div key={type} className="d-flex flex-fill flex-column p-3 w-50">
              {selectedEmail ? (
                <EmailDetail
                  email={selectedEmail}
                  onBack={() => {
                    setSelectedEmail(null);
                    if (index === 0) {
                      setSelectedSkills([]); // 選択スキルをリセット
                      setNewSkill("");
                      setIsAdding(false);
                    }
                  }}
                  onDownloadFile={onDownloadFile}
                />
              ) : (
                <EmailList
                  title={title}
                  emails={index === 1 && matchedEmails ? matchedEmails : emails}
                  onEmailClick={(email) => {
                    setSelectedEmail(email); // 選択されたemailをセット
                    if (index === 0) setSelectedSkills(email.skills || []); // メールクリック時、選択スキルをセット
                  }}
                  scrollPosition={scrollPos}
                  onScrollChange={(pos) => onScrollChange(type, pos)}
                  currentPage={currentPage}
                  onPageChange={onPageChangeForType}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;

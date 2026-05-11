import { Form, Button } from "react-bootstrap";
import type { SearchSectionProps, Email } from "../types";
import { useSkillsManager } from "../hooks/useSkillsManager";
import SkillsTagSection from "./SkillsTagSection";

const SearchSection: React.FC<SearchSectionProps> = ({
  leftSkills,
  rightSkills,
  selectedSkills,
  onToggleSkill,
  onMatchEmails,
  onResetMatch,
  newSkill,
  setNewSkill,
  isAdding,
  setIsAdding,
  matchedEmails,
  activeTab,
  setQuery,
  onSearch,
  onResetSearch,
}) => {
  const {
    variableLeftSkills,
    onAddSkill,
    onToggleIsAdding,
    onChangeSkillInput,
  } = useSkillsManager(
    leftSkills,
    onToggleSkill,
    newSkill,
    setNewSkill,
    setIsAdding,
  );

  const leftSkillTitle = activeTab === "engineer" ? "人材" : "求人";
  const rightSkillTitle = activeTab === "engineer" ? "求人" : "人材";

  return (
    <div className="border-end bg-light search-containner flex-fill">
      <Form>
        <div className="border-bottom p-3">
          <h5>検索</h5>
          <Form.Group className="mb-3">
            <Form.Label>キーワード</Form.Label>
            <Form.Control
              type="text"
              placeholder="検索ワードを入力"
              onChange={(e) => setQuery(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" className="w-100" onClick={onSearch}>
              検索
            </Button>

            <Button variant="primary" className="w-100" onClick={onResetSearch}>
              リセット
            </Button>
          </div>
        </div>

        <div className="p-3">
          {/* 🔖 スキルタグ一覧 */}
          <div className="mb-3">
            <h5>マッチング</h5>
            <SkillsTagSection
              skills={variableLeftSkills}
              selectedSkills={selectedSkills}
              editable={true} // ← 追加・クリック可能
              newSkill={newSkill}
              isAdding={isAdding}
              onToggleSkill={onToggleSkill}
              onAddSkill={onAddSkill}
              onToggleIsAdding={onToggleIsAdding}
              onChangeSkillInput={onChangeSkillInput}
              title={leftSkillTitle}
            />

            <div>
              <SkillsTagSection
                skills={rightSkills}
                selectedSkills={selectedSkills}
                editable={false}
                title={rightSkillTitle}
              />
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              className="w-100"
              onClick={onMatchEmails}
              disabled={matchedEmails !== null}
            >
              マッチング
            </Button>
            <Button
              variant="primary"
              className="w-100"
              onClick={onResetMatch}
              disabled={matchedEmails === null}
            >
              リセット
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default SearchSection;

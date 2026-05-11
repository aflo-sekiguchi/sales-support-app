import type React from "react";
import { Form, Badge } from "react-bootstrap";
import type { SkillsTagSectionProps } from "../types";

const SkillsTagSection: React.FC<SkillsTagSectionProps> = ({
  skills,
  selectedSkills,
  onToggleSkill,
  newSkill,
  isAdding,
  editable,
  onAddSkill,
  onToggleIsAdding,
  onChangeSkillInput,
  title
}) => {
  return(
    <div className="d-flex mb-3 flex-column gap-2">
      <Form.Label className="skill-label">{title}スキル</Form.Label>
      {skills.length > 0 && (
        <>
          <div className="d-flex flex-wrap gap-2 skill-contailer">
            {skills.map((skill) => {
              const isActive = selectedSkills.includes(skill);
              return (
                <Badge
                  key={skill}
                  bg={isActive ? "primary" : "secondary"}
                  className={`search-tag ${editable ? "search-tag-left" : ""}`}
                  onClick={editable && onToggleSkill? () => onToggleSkill(skill) : undefined}
                >
                  {skill}
                </Badge>
              );
            })}

            {/* 編集可能モード（左側）のみ + ボタンを表示 */}
            {editable && (
              <Badge
                key="addSkill"
                bg={isAdding ? "secondary" : "primary"}
                className="search-tag-left"
                onClick={onToggleIsAdding}
              >
                +
              </Badge>
            )}
          </div>

          {/* 新規スキル追加フォーム */}
          {editable && isAdding && (
            <Form.Control
              type="text"
              size="sm"
              value={newSkill}
              onChange={(e) => onChangeSkillInput?.(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddSkill?.() }
              autoFocus
              style={{ width: "100px" }}
            />
          )}
        </>
      )}
    </div>
  )
} 
export default SkillsTagSection;

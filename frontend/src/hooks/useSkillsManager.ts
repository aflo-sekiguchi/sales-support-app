// src/hooks/useSearchManager.ts
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const useSkillsManager = (
  leftSkills: string[],
  onToggleSkill: (skill: string) => void,
  newSkill: string,
  setNewSkill: (value: string) => void,
  setIsAdding: Dispatch<SetStateAction<boolean>>,
) => {
  const [variableLeftSkills, setVariableLeftSkills] = useState(leftSkills);

  // 左スキルが外部で変更された場合に同期
  useEffect(() => {
    setVariableLeftSkills(leftSkills);
  }, [leftSkills]);

  // スキル追加
  const onAddSkill = () => {
    if (newSkill.trim() === "") {
      onToggleIsAdding();
      return;
    }

    if (!variableLeftSkills.includes(newSkill)) {
      setVariableLeftSkills([...variableLeftSkills, newSkill]);
      onToggleSkill(newSkill); // 追加時に即選択状態にする
    }

    setNewSkill("");
    onToggleIsAdding();
  };

  // 小文字変換
  const onChangeSkillInput = (value: string) => {
    setNewSkill(value.toLowerCase());
  };

  // 検索セクションのスキルタグ追加入力フォームの開閉
  const onToggleIsAdding = () => {
    setIsAdding((prev) => !prev);
  };

  return {
    variableLeftSkills,
    onAddSkill,
    onToggleIsAdding,
    onChangeSkillInput,
  };
};

import { SubjectData } from "./types";

export function transformSubjectData(subjectData: SubjectData) {
  return Object.entries(subjectData).map(([value, label]) => ({
    value,
    label,
  }));
}

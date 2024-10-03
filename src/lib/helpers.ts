import { SubjectData } from "./types";

export function transformSubjectData(subjectData: SubjectData) {
  return Object.entries(subjectData).map(([value, label]) => ({
    value,
    label,
  }));
}

export function formatTimeAgo(date: Date) {
  const now = new Date().getTime();
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec${diffInSeconds === 1 ? "" : "s"} ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (diffInSeconds < 31104000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  } else if (diffInSeconds < 311040000) {
    const years = Math.floor(diffInSeconds / 31104000);
    return `${years} yr${years === 1 ? "" : "s"} ago`;
  } else {
    const decades = Math.floor(diffInSeconds / 311040000);
    return `${decades} decade${decades === 1 ? "" : "s"} ago`;
  }
}

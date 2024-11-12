import { LeaderboardEntry, SubjectData } from "./types";

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

export function formatQuestionType(type: string) {
  switch (type) {
    case "boolean":
      return "True/False";
    case "mcq":
      return "Multiple Choice";
    case "short":
      return "Fill in the Blank";
    default:
      return type;
  }
}

export function parseQuestionType(formattedType: string): string {
  switch (formattedType) {
    case "True/False":
      return "boolean";
    case "Multiple Choice":
      return "mcq";
    case "Fill in the Blank":
      return "short";
    default:
      return formattedType;
  }
}

export function questionTypeIcon(type: string) {
  switch (type) {
    case "boolean":
      return "Scale";
    case "mcq":
      return "Check";
    case "short":
      return "RectangleEllipsis";
    default:
      return "HelpCircle";
  }
}

export function getLoadingStates(questionType: string) {
  switch (questionType) {
    case "multiple-choice":
      return [
        { text: "Initializing quiz setup..." },
        { text: "Loading question templates..." },
        { text: "Fetching multiple-choice question pool..." },
        { text: "Randomizing question selection..." },
        { text: "Generating question text..." },
        { text: "Adding answer choices..." },
        { text: "Reviewing multiple-choice questions..." },
        { text: "Finalizing quiz data..." },
        { text: "Almost done! Wrapping up..." },
      ];
    case "true-false":
      return [
        { text: "Initializing quiz setup..." },
        { text: "Loading question templates..." },
        { text: "Fetching true/false question pool..." },
        { text: "Generating true/false statements..." },
        { text: "Setting up correct answers..." },
        { text: "Reviewing true/false questions..." },
        { text: "Finalizing quiz data..." },
        { text: "Almost done! Wrapping up..." },
      ];
    case "identification":
      return [
        { text: "Initializing quiz setup..." },
        { text: "Loading question templates..." },
        { text: "Fetching identification question pool..." },
        { text: "Generating question prompts..." },
        { text: "Reviewing identification questions..." },
        { text: "Finalizing quiz data..." },
        { text: "Almost done! Wrapping up..." },
      ];
    default:
      return [
        { text: "Initializing quiz setup..." },
        { text: "Loading question templates..." },
        { text: "Fetching question pool..." },
        { text: "Generating questions..." },
        { text: "Compiling quiz data..." },
        { text: "Finalizing quiz structure..." },
        { text: "Almost done! Wrapping up..." },
      ];
  }
}

export function getDarkerShade(color: string, percent: number) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

export function calculateRanks(data: LeaderboardEntry[]): Map<string, number> {
  const ranks = new Map<string, number>();
  let currentRank = 1;

  for (let i = 0; i < data.length; i++) {
    if (i > 0 && data[i].score < data[i - 1].score) {
      currentRank = i + 1;
    }
    ranks.set(data[i].id, currentRank);
  }

  return ranks;
}

export const calculateClassAccuracy = (leaderboardData: LeaderboardEntry[]) => {
  if (leaderboardData.length === 0) return 0;
  const totalRight = leaderboardData.reduce(
    (sum, entry) => sum + entry.right_answer,
    0,
  );
  const totalQuestions = leaderboardData.reduce(
    (sum, entry) => sum + entry.right_answer + entry.wrong_answer,
    0,
  );
  return totalQuestions > 0 ? (totalRight / totalQuestions) * 100 : 0;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

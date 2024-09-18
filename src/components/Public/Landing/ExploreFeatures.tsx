import { Timeline } from "@/components/Shared/timeline";

const data = [
  {
    title: "AI-Powered Quiz Creation",
    description:
      "Upload a PDF, and our AI instantly generates quizzes. Save time and effort.",
    content: <p>Content Here</p>,
  },
  {
    title: "Customizable Quiz Types",
    description:
      "Choose from multiple formats: True/False, Multiple Choice, Matching, and more. Flexibility for any class.",
    content: <p>Content Here</p>,
  },
  {
    title: "Gamified Learning Experience",
    description:
      "Turn learning into a game. Keep students engaged and motivated with interactive quizzes.",
    content: <p>Content Here</p>,
  },
  {
    title: "Leaderboard for Competitive Learning",
    description:
      "Real-time ranking boosts competition. Students compete for top spots, driving continuous improvement.",
    content: <p>Content Here</p>,
  },
  {
    title: "Interactive & User-Friendly Design",
    description:
      "Gaming-inspired design. Intuitive and fun for students and educators alike.",
    content: <p>Content Here</p>,
  },
];

export default function ExploreFeatures() {
  return (
    <div className="-mx-6 w-screen bg-zinc-50 px-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16">
      <Timeline data={data} />
    </div>
  );
}

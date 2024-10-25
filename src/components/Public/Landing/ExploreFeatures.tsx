import { Timeline } from "@/components/Shared/timeline";

const data = [
  {
    title: "AI-Powered Quiz Creation",
    description:
      "Upload a PDF, and our AI instantly generates quizzes. Save time and effort.",
    content: (
      <video
        autoPlay
        muted
        loop
        className="rounded-3xl border-8 border-blue-800"
      >
        <source src="/videos/snippet-1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
  },
  {
    title: "Customizable Quiz Types",
    description:
      "Choose from multiple formats: True/False, Multiple Choice, Matching, and more. Flexibility for any class.",
    content: (
      <video
        autoPlay
        muted
        loop
        className="rounded-3xl border-8 border-cyan-800"
      >
        <source src="/videos/snippet-2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
  },
  {
    title: "Gamified Learning Experience",
    description:
      "Turn learning into a game. Keep students engaged and motivated with interactive quizzes.",
    content: (
      <video
        autoPlay
        muted
        loop
        className="rounded-3xl border-8 border-yellow-800"
      >
        <source src="/videos/snippet-3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
  },
  {
    title: "Leaderboard for Competitive Learning",
    description:
      "Real-time ranking boosts competition. Students compete for top spots, driving continuous improvement.",
    content: (
      <video
        autoPlay
        muted
        loop
        className="rounded-3xl border-8 border-purple-800"
      >
        <source src="/videos/snippet-4.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
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
    <div
      id="explore"
      className="-mx-6 w-screen px-6 py-24 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16"
    >
      <Timeline data={data} />
    </div>
  );
}

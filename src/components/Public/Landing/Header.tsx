import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
      <div>
        <p className="text-sm md:text-base">Welcome to EduQuest</p>
        <h1 className="mt-2 text-5xl md:text-7xl">
          The{" "}
          <span className="relative">
            best{" "}
            <Sparkles className="absolute -left-4 top-2 size-4 fill-yellow-500 text-yellow-500 md:-left-6 md:size-6" />
          </span>{" "}
          platform where
          <br />
          <span className="relative font-serif font-semibold italic text-purple-900 dark:text-purple-500">
            Knowledge
            <img
              src="/hash.png"
              className="absolute -left-4 top-0 w-8 rotate-2 md:-left-7 md:-top-2 md:w-14"
            />
          </span>{" "}
          and{" "}
          <span className="relative z-10 font-serif font-semibold italic text-yellow-500">
            Play
            <img
              src="/arrow-down.png"
              className="absolute -bottom-8 -right-8 z-0 w-14 rotate-[20deg] md:-bottom-14 md:-right-14 md:w-24"
            />
            <br />
          </span>{" "}
          Come Together
        </h1>
      </div>
      <div className="relative w-1/2 text-xs md:text-sm">
        <p className="relative z-20 opacity-80">
          We combine learning and fun with AI-generated quizzes for students and
          educators. Upload files, and let AI do the rest.
        </p>
        <img
          src="/arrow-to-sign.png"
          className="absolute -bottom-16 left-12 z-10 hidden w-24 rotate-90 md:block"
        />
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
      <div>
        <p className="text-sm md:text-base">Welcome to EduQuest</p>
        <h1 className="mt-2 text-5xl md:text-7xl">
          The best platform where <br />
          <span className="relative font-serif font-semibold italic text-purple-900 dark:text-purple-500">
            Knowledge
          </span>{" "}
          and{" "}
          <span className="relative font-serif font-semibold italic text-yellow-600 dark:text-yellow-500">
            Play
            <br />
          </span>{" "}
          Come Together
        </h1>
      </div>
      <p className="w-1/2 text-xs opacity-80 md:text-sm">
        We combine learning and fun with AI-generated quizzes for students and
        educators. Upload files, and let AI do the rest.
      </p>
    </div>
  );
}

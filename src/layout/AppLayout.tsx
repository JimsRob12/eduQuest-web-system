import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "@/components/Shared/Footer";
import Navbar from "@/components/Shared/Navbar";
import { useAuth } from "@/contexts/AuthProvider";
import QuizNavbar from "@/components/Auth/Professor/Quiz/quiz-navbar";
import QuizEditQuestionNavbar from "@/components/Auth/Professor/Quiz/question-navbar";
import Loader from "@/components/Shared/Loader";
import { PixelatedBackground } from "@/components/Shared/PixelatedBackground";

function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isProfessorQuizRoute, setIsProfessorQuizRoute] = useState(false);
  const [isQuizEditQuestionRoute, setIsQuizEditQuestionRoute] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isProfessor = user?.role === "professor";
    const isQuizRoute = location.pathname.startsWith("/professor/quiz");
    setIsProfessorQuizRoute(isProfessor && isQuizRoute);
    const quizEditQuestionPattern =
      /^\/professor\/quiz\/[^/]+\/question\/[^/]+\/edit$/;
    setIsQuizEditQuestionRoute(quizEditQuestionPattern.test(location.pathname));

    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [user, location.pathname]);

  const renderNavbar = () => {
    if (isQuizEditQuestionRoute) {
      return <QuizEditQuestionNavbar />;
    } else if (isProfessorQuizRoute) {
      return <QuizNavbar />;
    } else {
      return <Navbar />;
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
      <PixelatedBackground isDarkMode={isDarkMode} />
      <div className="relative z-0 flex h-full flex-col">
        <div className="sticky top-0 z-10 bg-zinc-50 px-6 dark:bg-zinc-900 md:px-12 lg:px-16">
          {renderNavbar()}
        </div>
        <div className="flex-1 overflow-auto px-6 md:px-12 lg:px-16">
          <main
            className={`-mx-6 h-full w-screen px-6 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16 ${
              (isProfessorQuizRoute || isQuizEditQuestionRoute) &&
              "bg-zinc-200/95 dark:bg-zinc-800/95"
            }`}
          >
            <Outlet />
          </main>
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default AppLayout;

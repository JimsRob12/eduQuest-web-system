import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "@/components/Shared/Footer";
import Navbar from "@/components/Shared/Navbar";
import { useAuth } from "@/contexts/AuthProvider";
import QuizNavbar from "@/components/Auth/Professor/Quiz/quiz-navbar";
import QuizEditQuestionNavbar from "@/components/Auth/Professor/Quiz/quiz-edit-question-navbar";

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isProfessorQuizRoute, setIsProfessorQuizRoute] = useState(false);
  const [isQuizEditQuestionRoute, setIsQuizEditQuestionRoute] = useState(false);

  useEffect(() => {
    const isProfessor = user?.role === "professor";
    const isQuizRoute = location.pathname.startsWith("/professor/quiz");
    setIsProfessorQuizRoute(isProfessor && isQuizRoute);

    // Check if the current route matches the quiz edit question pattern
    const quizEditQuestionPattern =
      /^\/professor\/quiz\/[^/]+\/question\/[^/]+\/edit$/;
    setIsQuizEditQuestionRoute(quizEditQuestionPattern.test(location.pathname));
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

  return (
    <div className="flex h-screen w-screen flex-col overflow-x-hidden bg-zinc-50 px-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 md:px-12 lg:px-16">
      {renderNavbar()}
      <main
        className={`flex-1 overflow-y-auto ${
          (isProfessorQuizRoute || isQuizEditQuestionRoute) &&
          "-mx-6 w-screen bg-zinc-200 px-6 dark:bg-zinc-800 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16"
        }`}
      >
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default AppLayout;

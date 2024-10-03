import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Footer from "@/components/Shared/Footer";
import Navbar from "@/components/Shared/Navbar";
import { useAuth } from "@/contexts/AuthProvider";
import QuizNavbar from "@/components/Auth/Professor/Quiz/quiz-navbar";

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isProfessorQuizRoute, setIsProfessorQuizRoute] = useState(false);

  useEffect(() => {
    const isProfessor = user?.role === "professor";
    const isQuizRoute = location.pathname.startsWith("/professor/quiz");
    setIsProfessorQuizRoute(isProfessor && isQuizRoute);
  }, [user, location.pathname]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-x-hidden bg-zinc-50 px-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 md:px-12 lg:px-16">
      {isProfessorQuizRoute ? <QuizNavbar /> : <Navbar />}
      <main
        className={`flex-1 overflow-y-auto ${isProfessorQuizRoute && "-mx-6 w-screen bg-zinc-200 px-6 dark:bg-zinc-800 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16"}`}
      >
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default AppLayout;

import { Outlet } from "react-router-dom";

import Footer from "@/components/Shared/Footer";
import Navbar from "@/components/Shared/Navbar";
import { useAuth } from "@/contexts/AuthProvider";
import QuizNavbar from "@/components/Auth/Professor/Quiz/quiz-navbar";

function AppLayout() {
  const { user } = useAuth();

  const isProfessor = user?.role === "professor";
  const isProfessorQuizRoute =
    location.pathname.startsWith("/professor/quiz") && isProfessor;

  return (
    <div className="flex h-screen w-screen flex-col overflow-x-hidden bg-zinc-50 px-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 md:px-12 lg:px-16">
      {isProfessorQuizRoute ? <QuizNavbar /> : <Navbar />}
      <main className="h-full w-full">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default AppLayout;

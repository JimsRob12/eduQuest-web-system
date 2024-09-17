import { Outlet } from "react-router-dom";

import Footer from "@/components/Shared/Footer";
import Navbar from "@/components/Shared/Navbar";
import { ModeToggle } from "@/components/Shared/theme-toggle";

const AppLayout = () => {
  return (
    <div className="h-screen w-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
      <Navbar />
      <ModeToggle />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;

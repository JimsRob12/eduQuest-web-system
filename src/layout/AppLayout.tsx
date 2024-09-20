import { Outlet } from "react-router-dom";

import Footer from "@/components/Shared/Footer";
import Navbar from "@/components/Shared/Navbar";

function AppLayout() {
  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-50 px-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 md:px-12 lg:px-16">
      <Navbar />
      <main className="h-full w-full">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default AppLayout;

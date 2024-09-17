import { Outlet } from "react-router-dom";

import Footer from "@/components/Shared/Footer";
import Navbar from "@/components/Shared/Navbar";
import { ModeToggle } from "@/components/Shared/theme-toggle";

const AppLayout = () => {
  return (
    <div className="app-container">
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

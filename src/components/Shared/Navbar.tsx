import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Loader2, Menu, Plus, X } from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import { useAuth } from "@/contexts/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { createQuiz } from "@/services/api/apiQuiz";
import toast from "react-hot-toast";

const PUBLIC_NAV_ITEMS = [
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/faq", label: "FAQ" },
  { path: "/terms", label: "Terms" },
  { path: "/privacy", label: "Privacy Policy" },
];

const AUTH_NAV_ITEMS = [
  { path: "/home", label: "Home" },
  { path: "/activity", label: "Activity" },
  { path: "/reports", label: "Reports" },
];

const AUTH_NAV_ITEMS2 = [
  { path: "/profile", label: "Profile" },
  { path: "/settings", label: "Settings" },
];

const AUTH_ITEMS: {
  path: string;
  label: string;
  variant:
    | "secondary"
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "ghost";
}[] = [
  { path: "/login", label: "Log in", variant: "secondary" },
  { path: "/signup", label: "Sign up", variant: "default" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = user ? AUTH_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  const { mutate: createNewQuiz, isPending: isCreatingQuiz } = useMutation({
    mutationFn: () => {
      if (user) {
        return createQuiz(user.id);
      }
      throw new Error("User is not authenticated");
    },
    onSuccess: (data) => {
      if (data) {
        navigate(`/professor/quiz/${data.quiz_id}/generate-quiz`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create quiz: ${error.message}`);
    },
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to log out: ${errorMessage}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const NavItem = ({ to, label }: { to: string; label: string }) => (
    <NavLink to={to} onClick={closeMenu}>
      {label}
    </NavLink>
  );

  const isProfessor = user?.role === "professor";

  return (
    <>
      <nav className="relative z-50 flex w-full items-center justify-between bg-zinc-50 py-4 dark:bg-zinc-900">
        <ul className="flex items-center gap-8">
          <NavLink to="/" onClick={closeMenu}>
            <img src="/edu-quest-logo.png" alt="Logo" className="w-14" />
          </NavLink>
          <li className="hidden items-center gap-4 md:flex">
            {navItems.map(({ path, label }) => (
              <NavItem key={path} to={path} label={label} />
            ))}
          </li>
        </ul>
        <ul className="flex items-center gap-2">
          <ModeToggle />
          <li className="hidden gap-2 md:flex">
            {user ? (
              <>
                {isProfessor && (
                  <Button
                    onClick={() => createNewQuiz()}
                    className="gap-1 px-3"
                    disabled={isCreatingQuiz}
                  >
                    {isCreatingQuiz ? (
                      "Creating..."
                    ) : (
                      <>
                        <Plus size={16} /> Create Quiz
                      </>
                    )}
                  </Button>
                )}
                <DropdownMenu
                  open={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                  modal={false}
                >
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`flex size-8 cursor-pointer items-center justify-center rounded-full bg-gray-200 p-1 transition-transform duration-300 ease-in-out dark:bg-purple-800 ${
                        isDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      {isDropdownOpen ? <X size={20} /> : <Menu size={20} />}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={10}>
                    <DropdownMenuLabel className="flex flex-col">
                      <p className="flex gap-1">{user.name}</p>
                      <p className="text-xs font-normal">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      {isLoggingOut ? "Logging out.." : "Log out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              AUTH_ITEMS.map(({ path, label, variant }) => (
                <NavLink key={path} to={path} onClick={closeMenu}>
                  <Button variant={variant}>{label}</Button>
                </NavLink>
              ))
            )}
          </li>
          <div
            className={`block cursor-pointer transition-transform duration-300 ease-in-out md:hidden ${
              isMenuOpen ? "rotate-180" : "rotate-0"
            }`}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </div>
        </ul>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 top-[5rem] z-40 h-full w-full bg-zinc-50 text-zinc-900 transition-transform duration-500 ease-in-out dark:bg-zinc-900 dark:text-zinc-50 ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          className={`mx-8 mt-2 border-t-2 pt-8 md:mx-12 lg:mx-16 ${!user ? "space-y-8" : "space-y-4"}`}
        >
          <ul className="flex flex-col gap-4">
            {navItems.map(({ path, label }) => (
              <NavItem key={path} to={path} label={label} />
            ))}
          </ul>
          <ul
            className={`flex flex-col gap-4 ${!user && "w-full items-center"}`}
          >
            {user ? (
              <>
                {AUTH_NAV_ITEMS2.map(({ path, label }) => (
                  <NavLink key={path} to={path}>
                    {label}
                  </NavLink>
                ))}
                <button
                  className="flex w-fit items-center gap-1"
                  onClick={() => logout()}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging out..
                    </>
                  ) : (
                    "Log out"
                  )}
                </button>
              </>
            ) : (
              AUTH_ITEMS.map(({ path, label, variant }) => (
                <NavLink key={path} to={path} onClick={closeMenu}>
                  <Button variant={variant} className="h-fit w-64 py-3">
                    {label}
                  </Button>
                </NavLink>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

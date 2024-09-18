import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallToActionButtons() {
  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <NavLink to="/signup">
        <Button className="relative flex h-fit w-60 items-center gap-1 rounded-md px-6 py-3 text-lg font-normal shadow-[-4px_4px_0px_#3b1b55] transition-all duration-300 hover:-translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[-4px_4px_0px_#aaa4b1] dark:hover:shadow-none md:w-full">
          Sign up <ChevronRight />
          <img
            src="/arrow-to-sign.png"
            className="absolute -left-12 -top-24 z-10 hidden w-24 rotate-90 md:block"
          />
        </Button>
      </NavLink>
      <NavLink to="/login">
        <Button
          variant="secondary"
          className="flex h-fit w-60 items-center gap-1 rounded-md px-6 py-3 text-lg font-normal shadow-[-4px_4px_0px_#aaa4b1] transition-all duration-300 hover:-translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[-4px_4px_0px_#3b1b55] dark:hover:shadow-none md:w-full"
        >
          Login <ChevronRight />
        </Button>
      </NavLink>
    </div>
  );
}

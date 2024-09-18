import { motion, Variants } from "framer-motion";
import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const buttonFadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.5,
      ease: "easeInOut",
    },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

export default function CallToActionButtons() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col gap-2 md:flex-row"
    >
      <NavLink to="/explore">
        <motion.div custom={0} variants={buttonFadeIn}>
          <Button className="relative flex h-fit w-60 items-center gap-1 rounded-md px-6 py-3 text-lg font-normal shadow-[-4px_4px_0px_#3b1b55] transition-all duration-300 hover:-translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[-4px_4px_0px_#aaa4b1] dark:hover:shadow-none md:w-full">
            Explore <ChevronRight />
            <motion.img
              custom={2}
              variants={buttonFadeIn}
              src="/arrow-to-sign.png"
              className="absolute -left-12 -top-24 z-10 hidden w-24 md:block"
              animate={{ rotate: 90 }}
            />
          </Button>
        </motion.div>
      </NavLink>
      <NavLink to="/faq">
        <motion.div custom={1} variants={buttonFadeIn}>
          <Button
            variant="secondary"
            className="flex h-fit w-60 items-center gap-1 rounded-md px-6 py-3 text-lg font-normal shadow-[-4px_4px_0px_#aaa4b1] transition-all duration-300 hover:-translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[-4px_4px_0px_#3b1b55] dark:hover:shadow-none md:w-full"
          >
            Learn More <ChevronRight />
          </Button>
        </motion.div>
      </NavLink>
    </motion.div>
  );
}
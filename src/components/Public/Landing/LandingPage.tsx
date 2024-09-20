import { motion, Variants } from "framer-motion";

import Header from "./Header";
import CallToActionButtons from "./CallToActionButtons";
import ExploreFeatures from "./ExploreFeatures";

const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.5,
      delayChildren: 2,
    },
  },
};

export default function LandingPage() {
  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="my-8 flex h-[calc(100%-12rem)] w-full flex-col items-center justify-center space-y-8"
      >
        <Header />
        <CallToActionButtons />
      </motion.div>
      <ExploreFeatures />
      <div className="-mx-6 w-screen bg-zinc-50 px-6 py-24 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-xl bg-purple-500 px-8 py-8 text-purple-50 md:px-12 lg:px-16">
          <h1 className="mb-6 text-center text-5xl font-black md:text-7xl">
            <span className="text-zinc-900">let's get</span>
            <br />
            <span className="relative z-20">started now</span>
          </h1>
          <CallToActionButtons
            align="center"
            hideArrow
            firstButtonNavLink="NavLink"
            firstButtonText="Sign up"
            firstButtonTo="/signup"
            secondButtonText="Login"
            secondButtonTo="/login"
          />
        </div>
      </div>
    </>
  );
}

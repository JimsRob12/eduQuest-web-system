import { motion, Variants } from "framer-motion";

import Header from "./Header";
import CallToActionButtons from "./CallToActionButtons";
import ExploreFeatures from "./ExploreFeatures";
import Recap from "./Recap";
import { BlogCarousel } from "./BlogsCarousel";

const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.5,
      delayChildren: 2,
    },
  },
};

const wiggle: Variants = {
  animate: {
    rotate: [0, 7, -5, 5, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: "loop",
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
        className="relative my-8 flex h-[calc(100%-12rem)] w-full flex-col items-center justify-center space-y-8"
      >
        <motion.img
          src="/eyy.png"
          className="absolute -bottom-3 right-14 z-10 w-16 md:bottom-8 md:right-28 md:w-44"
          variants={wiggle}
          animate="animate"
        />
        <img
          src="/eyy-extension.png"
          className="absolute -bottom-12 -right-10 z-0 w-32 md:-right-28 md:w-80"
          // variants={slightWiggle}
          // animate="animate"
        />
        <Header />
        <CallToActionButtons />
      </motion.div>
      <ExploreFeatures />
      <BlogCarousel />
      <Recap />
    </>
  );
}

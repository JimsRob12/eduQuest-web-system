import { motion, Variants } from "framer-motion";
import CallToActionButtons from "./CallToActionButtons";
import Header from "./Header";

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
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="my-8 flex h-[calc(100%-12rem)] w-full flex-col items-center justify-center space-y-8"
      >
        <Header />
        <CallToActionButtons />
      </motion.section>
    </>
  );
}

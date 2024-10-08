import {
  motion,
  Variants,
  useViewportScroll,
  useTransform,
} from "framer-motion";
import { Sparkles } from "lucide-react";

const textFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
    },
  }),
};

const elementFadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.25,
      duration: 0.5,
    },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.2,
    },
  },
};

const splitText = (text: string) => {
  return text.split("").map((char, index) => (
    <motion.span
      key={index}
      custom={index}
      variants={textFadeIn}
      className="inline-block"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ));
};

export default function Header() {
  const { scrollY } = useViewportScroll();
  const rotate = useTransform(scrollY, [0, 300], [0, 360]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex w-full flex-col items-center justify-center space-y-6 text-center"
    >
      <motion.div>
        <motion.p custom={0} className="text-sm md:text-base">
          {splitText("Welcome to Quiz Bee with You")}
        </motion.p>
        <motion.h1 custom={1} className="mt-2 text-5xl md:text-7xl">
          {splitText("The ")}
          <span className="relative">
            {splitText("best")}
            <motion.div
              custom={2}
              variants={elementFadeIn}
              className="absolute -left-4 top-2 size-4 fill-yellow-500 text-yellow-500 md:-left-6 md:size-6"
              style={{ rotate }}
            >
              <Sparkles />
            </motion.div>
          </span>{" "}
          {splitText("platform where")}
          <br />
          <motion.span
            custom={3}
            className="relative font-serif font-semibold italic text-purple-900 dark:text-purple-500"
          >
            {splitText("Knowledge")}
            <motion.img
              custom={4}
              variants={elementFadeIn}
              src="/hash.png"
              className="absolute -left-4 top-0 w-8 rotate-2 md:-left-7 md:-top-2 md:w-14"
            />
          </motion.span>{" "}
          {splitText("and")}
          <motion.span
            custom={5}
            className="relative z-10 font-serif font-semibold italic text-yellow-500"
          >
            {" "}
            {splitText("Play")}
            <br />
            <motion.img
              custom={6}
              variants={elementFadeIn}
              src="/arrow-down.png"
              className="absolute -bottom-8 -right-8 z-0 w-14 md:-bottom-14 md:-right-14 md:w-24"
              animate={{ rotate: 20 }}
            />
          </motion.span>{" "}
          {splitText("Come Together")}
        </motion.h1>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="relative w-1/2 text-xs md:text-sm"
      >
        <motion.p className="relative z-20 opacity-80">
          {splitText(
            "We combine learning and fun with AI-generated quizzes for students and educators. Upload files, and let AI do the rest.",
          )}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

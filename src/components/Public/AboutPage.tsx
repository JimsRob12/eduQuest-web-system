import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

interface TextContentProps {
  children: ReactNode;
  className?: string;
}

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  className = "",
}) => (
  <h2 className={`text-2xl md:text-4xl ${className}`}>
    {title}
    <br />
    <span className="opacity-50">{subtitle}</span>
  </h2>
);

const TextContent: React.FC<TextContentProps> = ({
  children,
  className = "",
}) => <p className={`text-xs md:text-sm ${className}`}>{children}</p>;

const Image: React.FC<ImageProps> = ({ src, alt = "", className = "" }) => (
  <img src={src} alt={alt} className={`w-full rounded-xl ${className}`} />
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, when: "beforeChildren" },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.1, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 60, damping: 12 },
  },
  exit: { x: -50, opacity: 0, transition: { duration: 0.3 } },
};

const AboutPage: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="mt-8"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-xs text-purple-900 dark:text-purple-50 md:text-sm">
          About Us
        </h1>
      </motion.header>

      <motion.section
        className="mt-4 grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_0.5fr]"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <SectionHeader
            title="Transforming Learning with"
            subtitle="Quiz Bee with You"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <TextContent>
            Quiz Bee with You is an innovative web-based quiz maker designed to
            revolutionize the learning experience by leveraging Natural Language
            Processing (NLP) and Question-Answering Model algorithms.
          </TextContent>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Image
            src="/images/about-1.png"
            alt="Learning transformation"
            className="rounded-br-[5rem]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Image
            src="/images/about-2.png"
            alt="Learning transformation"
            className="h-full rounded-br-[5rem] object-cover"
          />
        </motion.div>
      </motion.section>

      <motion.section
        className="mt-16 grid grid-cols-1 items-center gap-4 md:grid-cols-[0.8fr_1fr]"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <SectionHeader
            title="Powered by"
            subtitle="Cutting-Edge NLP Technology"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <TextContent className="self-end">
            By integrating cutting-edge NLP technology, Quiz Bee with You can
            analyze course content, extract key concepts, and generate relevant,
            high-quality quiz questions tailored to the lesson.
          </TextContent>
        </motion.div>
        <motion.div
          className="text-xs md:col-start-2 md:text-sm"
          variants={itemVariants}
        >
          <TextContent>
            Our mission is to enhance the teaching and learning process by:
          </TextContent>
          <ul className="ml-4 list-disc">
            <li>Reducing the time spent on manual quiz creation.</li>
            <li>Improving assessment accuracy.</li>
            <li>Fostering better engagement with course content.</li>
          </ul>
        </motion.div>
      </motion.section>

      <motion.section
        className="my-16 grid grid-cols-1 items-center gap-8 md:grid-cols-2"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Image
            src="/images/about-3.png"
            alt="Creating quizzes"
            className="rounded-br-[5rem]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SectionHeader title="A Smarter Way" subtitle="to Create Quizzes" />
          <TextContent>
            Quiz Bee with You can analyze course content, extract key concepts,
            and generate relevant, high-quality quiz questions tailored to the
            lesson.
          </TextContent>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default AboutPage;

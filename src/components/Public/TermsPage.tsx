import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70 } },
};

export default function TermsPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-16 grid h-[calc(100%-4rem)] md:grid-cols-2"
    >
      <motion.div variants={itemVariants}>
        <motion.h1
          className="text-5xl font-bold md:text-7xl"
          variants={itemVariants}
        >
          Terms & Conditions
        </motion.h1>
        <motion.p
          className="text-xs opacity-60 md:text-sm"
          variants={itemVariants}
        >
          Last Updated: Sept. 27, 2024
        </motion.p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="h-[calc(100vh-15rem)] space-y-4 overflow-y-auto font-default text-xs md:text-sm"
      >
        <motion.p variants={itemVariants}>
          By accessing and using the Quiz Bee with You platform, you agree to
          comply with the following terms and conditions:
        </motion.p>
        <motion.ol
          variants={containerVariants}
          className="ml-4 list-decimal space-y-2"
        >
          {/* List Items */}
          {termsData.map((term, index) => (
            <motion.li key={index} variants={itemVariants}>
              <strong>{term.title}</strong>
              <p>{term.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </motion.div>
  );
}

const termsData = [
  {
    title: "Use of the Platform",
    description:
      "You may use the platform solely for educational purposes, such as generating quizzes based on provided course content. Any misuse, unauthorized distribution, or manipulation of the platform's functions is prohibited.",
  },
  {
    title: "Account Responsibility",
    description:
      "You are responsible for maintaining the security of your account and any activity that occurs under your login credentials. Please notify us immediately of any unauthorized use of your account.",
  },
  {
    title: "Content Ownership",
    description:
      "Any course materials uploaded to the platform remain your intellectual property. However, by using the platform, you grant us permission to process this content solely for the purpose of generating quizzes.",
  },
  {
    title: "Limitations of Liability",
    description:
      "We aim to provide the best service possible; however, we do not guarantee the platform will be error-free or available at all times. We are not liable for any damages, data loss, or service interruptions.",
  },
  {
    title: "Modifications to the Service",
    description:
      "We reserve the right to modify or discontinue any features of the platform at any time, with or without notice.",
  },
  {
    title: "Governing Law",
    description:
      "These Terms and Conditions are governed by the laws of [Insert Country/State], without regard to its conflict of laws principles.",
  },
];

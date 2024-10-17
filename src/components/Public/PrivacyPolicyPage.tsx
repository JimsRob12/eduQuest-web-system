import { motion } from "framer-motion";
import { Separator } from "../ui/separator";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70 } },
};

export default function PrivacyPolicyPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-[0.8fr_auto_1fr] md:gap-8"
    >
      {/* Left Section: Title and Intro */}
      <motion.div variants={itemVariants}>
        <motion.h1
          className="text-5xl font-bold md:text-7xl"
          variants={itemVariants}
        >
          Privacy Policy
        </motion.h1>
        <motion.p
          className="text-xs opacity-60 md:text-sm"
          variants={itemVariants}
        >
          Last Updated: Sept. 27, 2024
        </motion.p>
        <motion.p className="mt-4 text-xs md:text-sm" variants={itemVariants}>
          At <strong>Quiz Bee with You</strong>, we value your privacy and are
          committed to protecting your personal information. This Privacy Policy
          outlines how we collect, use, and safeguard your data.
        </motion.p>
      </motion.div>

      {/* Vertical Separator */}
      <motion.div variants={itemVariants}>
        <Separator orientation="vertical" />
      </motion.div>

      {/* Right Section: Content */}
      <motion.div
        variants={containerVariants}
        className="space-y-4 overflow-y-auto font-default text-xs md:h-[calc(100vh-12rem)] md:text-sm"
      >
        {/* Each Content Section */}
        {policyData.map(({ title, content, isList }, index) => (
          <motion.div key={index} variants={itemVariants}>
            <strong>{title}</strong>
            {isList && Array.isArray(content) ? (
              <ul className="ml-4 list-disc">
                {content.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>{content}</p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

const policyData = [
  {
    title: "Information We Collect",
    content:
      "We collect personal information when you register an account, upload course materials, or interact with the platform. This may include your name, email address, and educational content.",
    isList: false,
  },
  {
    title: "How We Use Your Information",
    content: [
      "To create and manage your account",
      "To generate quizzes based on your course materials",
      "To improve our platform’s functionality and user experience",
      "To communicate with you regarding updates and support",
    ],
    isList: true,
  },
  {
    title: "Data Protection",
    content:
      "We use industry-standard encryption and security protocols to protect your data from unauthorized access. Your content is stored securely and is only used for the purposes of the platform.",
    isList: false,
  },
  {
    title: "Third-Party Services",
    content:
      "We may use third-party services for analytics and hosting. These services are bound by confidentiality agreements and are not permitted to use your data for any purpose other than supporting our platform.",
    isList: false,
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, modify, or delete your personal data at any time by contacting us. You can also unsubscribe from our communications via the provided links in our emails.",
    isList: false,
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy periodically. Any changes will be posted on this page, and you will be notified if significant changes are made.",
    isList: false,
  },
];

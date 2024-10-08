import React from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "../ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.1, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 60, damping: 12 },
  },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
};

const EmailVerification: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "your email address";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="flex h-[calc(100%-5rem)] items-center justify-center"
    >
      <motion.div
        className="w-full max-w-md rounded-lg bg-zinc-200 p-8 shadow-lg dark:bg-zinc-800"
        variants={itemVariants}
      >
        <motion.h2
          className="mb-4 text-center text-2xl font-bold"
          variants={itemVariants}
        >
          Email Verification
        </motion.h2>
        <motion.p className="mb-6 text-center" variants={itemVariants}>
          We've sent a verification email to{" "}
          <span className="text-purple-700">{email}</span>.
          <br />
          Please check your inbox and follow the instructions to verify your
          account.
        </motion.p>
        <motion.div className="flex justify-center" variants={itemVariants}>
          <NavLink to="/login">
            <Button variant="outline">Back to Login</Button>
          </NavLink>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmailVerification;

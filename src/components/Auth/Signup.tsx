import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.1, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { x: 50, opacity: 0, scale: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 60, damping: 12 },
  },
  exit: { x: -50, opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

const Signup: React.FC = () => {
  const { signUp, googleSignUp } = useAuth();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsSigningUp(true);

    try {
      await signUp(data.email, data.password);
      toast.success(
        "Successfully signed up! Please check your email for confirmation.",
      );

      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningUp(true);

    try {
      await googleSignUp();
      toast.success("Successfully signed up with Google!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="mt-8 grid h-[calc(100%-8rem)] items-center gap-8 md:mt-14 md:grid-cols-[1fr_0.8fr] md:gap-16"
    >
      <motion.div className="h-full w-full" variants={itemVariants}>
        <motion.img
          src="https://placehold.co/600x400"
          alt="Signup visual"
          className="hidden h-full w-full rounded-xl object-cover md:block"
          variants={itemVariants}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <motion.div variants={containerVariants}>
          <motion.h1
            className="text-lg font-semibold text-purple-700"
            variants={itemVariants}
          >
            EduQuest
          </motion.h1>

          <motion.div variants={itemVariants}>
            <h2 className="text-5xl font-bold md:text-7xl">
              Let's get started
            </h2>
            <div className="flex items-center gap-1 text-sm opacity-60">
              <p>Already have an account? Let's</p>
              <NavLink to="/login">
                <Button variant={"link"} className="h-fit p-0">
                  Login!
                </Button>
              </NavLink>
            </div>
          </motion.div>
        </motion.div>

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
                onChange={onRecaptchaChange}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full" disabled={isSigningUp}>
                {isSigningUp ? "Registering..." : "Register"}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={(e) => {
                  handleGoogleSignIn();
                  e.preventDefault();
                }}
                className="flex w-full gap-2"
                variant={"outline"}
                disabled={isSigningUp}
              >
                <img
                  width="24"
                  height="24"
                  src="https://img.icons8.com/fluency/24/google-logo.png"
                  alt="google-logo"
                />
                {isSigningUp ? "Signing up..." : "Sign up with Google"}
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </motion.div>
    </motion.div>
  );
};

export default Signup;

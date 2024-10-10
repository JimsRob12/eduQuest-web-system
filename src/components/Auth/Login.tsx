import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthProvider";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";

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

const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

    setIsLoggingIn(true);
    try {
      await login(data.email, data.password);
      toast.success("Successfully Logged In!");

      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    await googleLogin();
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="mt-8 grid h-[calc(100%-4rem)] items-center gap-8 md:grid-cols-[0.8fr_1fr] md:gap-16"
    >
      <motion.div className="space-y-8" variants={itemVariants}>
        <h1 className="text-lg font-semibold text-purple-700">
          Quiz Bee with You
        </h1>

        <div>
          <motion.h2
            className="text-5xl font-bold md:text-7xl"
            variants={itemVariants}
          >
            Welcome Back
          </motion.h2>
          <motion.div
            className="flex items-center gap-1 text-sm opacity-60"
            variants={itemVariants}
          >
            <p>Don't have an account?</p>
            <NavLink to="/signup">
              <Button variant={"link"} className="h-fit p-0">
                Sign Up
              </Button>
            </NavLink>
          </motion.div>
        </div>

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
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Login"}
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
                disabled={isLoggingIn}
              >
                <img
                  width="24"
                  height="24"
                  src="https://img.icons8.com/fluency/24/google-logo.png"
                  alt="google-logo"
                />
                {isLoggingIn ? "Logging in..." : "Sign in with Google"}
              </Button>
            </motion.div>
          </motion.form>
        </Form>

        <motion.p className="text-sm" variants={itemVariants}>
          By signing in, you agree to our{" "}
          <NavLink to="/terms">
            <Button variant={"link"} className="h-fit p-0">
              Terms of Service
            </Button>
          </NavLink>{" "}
          and{" "}
          <NavLink to="/privacy">
            <Button variant={"link"} className="h-fit p-0">
              Privacy Policy
            </Button>
          </NavLink>
        </motion.p>
      </motion.div>

      <motion.img
        src="https://placehold.co/600x400"
        alt="Login visual"
        className="hidden h-full w-full rounded-xl object-cover md:block"
        variants={itemVariants}
      />
    </motion.div>
  );
};

export default Login;

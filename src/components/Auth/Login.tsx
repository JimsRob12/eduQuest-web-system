/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthProvider";

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
import { NavLink } from "react-router-dom";
import { IconBrandGoogle } from "@tabler/icons-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const Login: React.FC = () => {
  const [error, setError] = useState<string>("");
  const { login, googleLogin } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError("");
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await googleLogin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-8 grid h-[calc(100%-8rem)] items-center gap-4 md:mt-14 md:grid-cols-[0.5fr_1fr] md:gap-8">
      <div className="space-y-8">
        <h1 className="text-lg font-semibold text-purple-700">EduQuest</h1>
        <div>
          <h2 className="text-5xl font-bold md:text-7xl">Welcome Back</h2>
          <div className="flex items-center gap-1 text-sm opacity-60">
            <p>Don't have an account?</p>
            <Button variant={"link"} className="h-fit p-0">
              Sign Up
            </Button>{" "}
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button
              onClick={(e) => {
                handleGoogleSignIn();
                e.preventDefault();
              }}
              className="flex w-full gap-2"
              variant={"outline"}
            >
              <IconBrandGoogle />
              Sign in with Google
            </Button>
          </form>
        </Form>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-sm">
          By signing in, you agree to our{" "}
          <NavLink to="/terms">
            <Button variant={"link"} className="h-fit p-0">
              Terms of Service
            </Button>{" "}
          </NavLink>
          and{" "}
          <NavLink to="/privacy">
            <Button variant={"link"} className="h-fit p-0">
              Privacy Policy
            </Button>
          </NavLink>
        </p>
      </div>
      <img
        src="https://placehold.co/600x400"
        className="hidden h-full w-full rounded-xl object-cover md:block"
      />
    </div>
  );
};

export default Login;

import { Session } from "@supabase/supabase-js";
import supabase from "../supabase";
import { checkEmailExists } from "../util/checkEmail";
import { insertNewAccount } from "../util/insertNewAccount";

export const getInitialSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
};

export const signInWithEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const signUpWithEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const existingStudent = await checkEmailExists(email, "students");
  if (existingStudent) {
    throw new Error("Email already exists in the students table.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  if (data.user) {
    await insertNewAccount(data.user.id, data.user.email || "", "students");
  }

  return data;
};

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw new Error(error.message);
  return true;
};

export const handleSessionChange = async (session: Session) => {
  if (session?.user?.id) {
    const existingStudent = await checkEmailExists(
      session.user.email || "",
      "students",
    );
    if (!existingStudent) {
      await insertNewAccount(
        session.user.id,
        session.user.email || "",
        "students",
      );
    }
  }
  return session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
};

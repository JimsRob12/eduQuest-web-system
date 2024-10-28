/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "",
        school: "",
        avatar_url: "",
        role: "",
      },
    },
  });
  if (error) throw new Error(error.message);

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
    const existingUser = await checkEmailExists(session.user.email || "");
    if (!existingUser) {
      await insertNewAccount(session.user.id, session.user.email || "");
    }
  }
  return session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
};

export async function updateUser({
  currentPassword,
  password,
  fullname,
  school,
  avatar,
}: {
  currentPassword?: string;
  password?: string;
  fullname?: string;
  school?: string;
  avatar?: File;
}) {
  let updateData: any = {};

  // If attempting to change password, verify current password first
  if (password) {
    if (!currentPassword) {
      throw new Error("Current password is required to change password");
    }

    // Verify current password using signInWithPassword
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email || "",
      password: currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    updateData = { password };
  }

  // Handle profile data updates
  if (fullname || school) {
    updateData = {
      data: {
        ...(fullname && { name: fullname }),
        ...(school && { school }),
      },
    };
  }

  // Update user data
  const { data, error } = await supabase.auth.updateUser(updateData);
  if (error) throw new Error(error.message);
  if (!avatar) return data;

  // Handle avatar upload
  const filename = `avatar-${data?.user.id}-${Math.random()}`;
  const { error: storageError } = await supabase.storage
    .from("images")
    .upload(filename, avatar);

  if (storageError) throw new Error(storageError.message);

  // Update user with new avatar URL
  const { data: updatedUser, error: urlError } = await supabase.auth.updateUser(
    {
      data: {
        picture: `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/images/${filename}`,
        avatar: `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/images/${filename}`,
      },
    },
  );

  if (urlError) throw new Error(urlError.message);
  return updatedUser;
}

export const updateRole = async ({ role }: { role: string }) => {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      role: role,
    },
  });

  if (error) throw new Error(error.message);

  return data;
};

export const updateEmail = async ({ email }: { email: string }) => {
  const { data, error } = await supabase.auth.updateUser({
    email: email,
  });

  if (error) throw new Error(error.message);

  return data;
};

export const getUser = async () => {
  if (!getInitialSession()) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  const user = data?.user;
  return user;
};

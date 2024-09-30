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
        avatar_url : "",
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
    const existingUser = await checkEmailExists(
      session.user.email || ""      
    );
    if (!existingUser) {      
      await insertNewAccount(
        session.user.id,
        session.user.email || ""        
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

export const updateUser = async ({
  full_name,
  school,
  avatar_url,
  role
}: {
  full_name: string,
  school: string,
  avatar_url: string,
  role: string, 
}) => {

  const { data, error } = await supabase.auth.updateUser({
    data: { 
      full_name: full_name,
      school: school,
      avatar_url : avatar_url,
      role: role,    }
  })

  if (error) throw new Error(error.message);

  return data;
}

export const updatePassword = async ({
  password
} : {
  password: string
}) => {
  const { data, error } = await supabase.auth.updateUser({
    password: password,
    nonce: '123456'
  })
  
  if (error) throw new Error(error.message);

  return data;
}

export const updateEmail = async ({
  email
} : {
  email: string
}) => {

  const { data, error } = await supabase.auth.updateUser({
    email: email
  })
  
  if (error) throw new Error(error.message);

  return data;
}

export const getUser = async () => {

  if (!getInitialSession()) return null

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  const user = data?.user;
  return user;
}
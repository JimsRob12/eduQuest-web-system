/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getInitialSession,
  handleSessionChange,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
} from "@/services/api/apiAuth";

interface User {
  id: string;
  email: string;
  // role: "professor" | "student";
}

interface AuthContextProps {
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  googleSignUp: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const signUpMutation = useMutation({
    mutationFn: signUpWithEmail,
    onSuccess: (data) => {
      if (data.session) {
        handleSessionChange(data.session).then((session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
            });
            queryClient.invalidateQueries({ queryKey: ["session"] });
          }
        });
      } else {
        console.error("Sign up error: Session is null");
      }
    },
    onError: (error: any) => {
      console.error("Sign up error:", error.message);
    },
  });

  const signInWithEmailMutation = useMutation({
    mutationFn: signInWithEmail,
    onSuccess: (data) => {
      const { session } = data;
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          // role: "student",
        });
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
  });

  const signInWithGoogleMutation = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  useEffect(() => {
    const fetchInitialSession = async () => {
      const session = await getInitialSession();
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          // role: "student", // Example role, adjust based on your app logic
        });
      }
    };
    fetchInitialSession();
  }, []);

  const signUp = async (email: string, password: string) => {
    await signUpMutation.mutateAsync({ email, password });
  };

  const googleSignUp = async () => {
    await signInWithGoogleMutation.mutateAsync();
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailMutation.mutateAsync({ email, password });
  };

  const googleLogin = async () => {
    await signInWithGoogleMutation.mutateAsync();
  };

  const logout = async () => {
    await signOutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{ user, signUp, googleSignUp, login, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

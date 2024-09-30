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
  updateRole,
} from "@/services/api/apiAuth";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: "professor" | "student" | null;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  setUserRole: (role: "professor" | "student") => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Mutation for signing up with email
  const signUpMutation = useMutation({
    mutationFn: signUpWithEmail,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      if (data.session) {
        queryClient.invalidateQueries({ queryKey: ["session"] });
      } else {
        toast.error("Sign up error: Session is null");
      }
    },
    onSettled: () => setLoading(false),
    onError: (error: any) => {
      toast.error(`Sign up error: ${error.message}`);
    },
  });

  // Mutation for signing in with email
  const signInWithEmailMutation = useMutation({
    mutationFn: signInWithEmail,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      const { session } = data;
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || "",
          role: session.user.user_metadata.role || null,
        });
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
    onSettled: () => setLoading(false),
  });

  // Mutation for Google sign-in
  const signInWithGoogleMutation = useMutation({
    mutationFn: signInWithGoogle,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onSettled: () => setLoading(false),
  });

  // Mutation for signing out
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      setUser(null);
      toast.success("Successfully Logged Out");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onSettled: () => setLoading(false),
  });

  // Mutation for updating the user role
  const updateUserRoleMutation = useMutation({
    mutationFn: updateRole,
    onMutate: () => setLoading(true),
    onSuccess: (data, variables) => {
      if (user) {
        setUser({
          ...user,
          role: ["professor", "student"].includes(variables.role)
            ? (variables.role as "professor" | "student")
            : null,
        });
        toast.success(`User role updated to ${variables.role}`);
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
    onSettled: () => setLoading(false),
    onError: (error: any) => {
      toast.error(`Role update error: ${error.message}`);
    },
  });

  // Fetch initial session when component mounts
  useEffect(() => {
    const fetchInitialSession = async () => {
      setLoading(true);
      const session = await getInitialSession();
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || "",
          role: session.user.user_metadata.role || null,
        });
      }
      setLoading(false);
    };
    fetchInitialSession();
  }, []);

  const signUp = async (email: string, password: string) => {
    await signUpMutation.mutateAsync({ email, password });
  };

  const googleSignUp = async () => {
    await signInWithGoogleMutation.mutateAsync();
  };

  // Function to update the user's role
  const setUserRole = async (role: "professor" | "student") => {
    await updateUserRoleMutation.mutateAsync({ role });
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
      value={{
        user,
        loading,
        signUp,
        googleSignUp,
        setUserRole,
        login,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

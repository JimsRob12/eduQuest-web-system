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
import { User } from "@/lib/types";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  initialized: boolean;
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
  const [initialized, setInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for signing up with email
  const signUpMutation = useMutation({
    mutationFn: signUpWithEmail,
    onSuccess: (data) => {
      if (data.session) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata.name || "",
          role: data.session.user.user_metadata.role || null,
          avatar:
            data.session.user.user_metadata.picture ||
            "https://cdn.vectorstock.com/i/1000v/95/74/graduation-cap-student-avatar-pixel-art-cartoon-vector-17509574.jpg",
        });
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
  });

  // Mutation for signing in with email
  const signInWithEmailMutation = useMutation({
    mutationFn: signInWithEmail,
    onSuccess: (data) => {
      const { session } = data;
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || "",
          role: session.user.user_metadata.role || null,
          avatar:
            data.session.user.user_metadata.picture ||
            "https://cdn.vectorstock.com/i/1000v/95/74/graduation-cap-student-avatar-pixel-art-cartoon-vector-17509574.jpg",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  // Mutation for Google sign-in
  const signInWithGoogleMutation = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  // Mutation for signing out
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  // Mutation for updating the user role
  const updateUserRoleMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: (data, variables) => {
      if (user) {
        setUser({
          ...user,
          role: ["professor", "student"].includes(variables.role)
            ? (variables.role as "professor" | "student")
            : null,
        });
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
    onError: (error: any) => {
      toast.error(`Role update error: ${error.message}`);
    },
  });

  // Fetch initial session when component mounts
  useEffect(() => {
    const fetchInitialSession = async () => {
      const session = await getInitialSession();
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || "",
          role: session.user.user_metadata.role || null,
          avatar:
            session.user.user_metadata.picture ||
            "https://cdn.vectorstock.com/i/1000v/95/74/graduation-cap-student-avatar-pixel-art-cartoon-vector-17509574.jpg",
        });
      }
      setInitialized(true);
    };
    fetchInitialSession();

    const { data: authListener } = handleSessionChange((session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || "",
          role: session.user.user_metadata.role || null,
          avatar:
            session.user.user_metadata.picture ||
            "https://cdn.vectorstock.com/i/1000v/95/74/graduation-cap-student-avatar-pixel-art-cartoon-vector-17509574.jpg",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
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

  const loading =
    !initialized ||
    signUpMutation.isPending ||
    signInWithEmailMutation.isPending ||
    signInWithGoogleMutation.isPending ||
    signOutMutation.isPending ||
    updateUserRoleMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
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

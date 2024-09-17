import { createContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: "professor" | "student";
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Temporary simulation of login
    if (email === "professor@test.com" && password === "password123") {
      setUser({
        id: "1",
        email: "professor@test.com",
        role: "professor",
      });
    } else if (email === "student@test.com" && password === "password123") {
      setUser({
        id: "2",
        email: "student@test.com",
        role: "student",
      });
    } else {
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

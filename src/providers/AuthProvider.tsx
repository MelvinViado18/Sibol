"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user"
  walletAddress?: string;
  avatar?: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: User["role"]) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database (in real app, this would be a backend)
const STORAGE_KEY = "sibol_users";
const CURRENT_USER_KEY = "sibol_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load users from localStorage
  const getUsers = (): User[] => {
    if (typeof window === "undefined") return [];
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  };

  // Save users to localStorage
  const saveUsers = (users: User[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  // Check if user is logged in on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Sign up new user
  const signup = async (
    name: string,
    email: string,
    password: string,
    role: User["role"]
  ): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      setIsLoading(false);
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    
    // Save user to "database"
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after signup
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    }
    setUser(newUser);
    setIsLoading(false);
    
    return true;
  };

  // Login user
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsers();
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      if (typeof window !== "undefined") {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
      }
      setUser(foundUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  // Logout user
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    setUser(null);
    router.push("/");
  };

  // Update user data
  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
      setUser(updatedUser);
      
      // Also update in users array
      const users = getUsers();
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
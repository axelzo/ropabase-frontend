"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
// Import the specific API functions
import { login as apiLogin, register as apiRegister } from "@/lib/api";
import { toast } from "sonner";

// Define the shape of the context data
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: Record<string, unknown>) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem("jwt_token");
    if (token) {
      setIsAuthenticated(true);
      console.log("[AuthContext] Token encontrado al iniciar:", token);
    } else {
      setIsAuthenticated(false);
      console.log("[AuthContext] No se encontró token al iniciar");
    }
    setIsLoading(false);
  }, []);

  const login = async (data: Record<string, unknown>) => {
    try {
      console.log("[AuthContext] Intentando login con datos:", data);
      // Use the imported apiLogin function
      const responseData = await apiLogin(data);
      console.log("[AuthContext] Respuesta de login:", responseData);
      if (responseData.token) {
        localStorage.setItem("jwt_token", responseData.token);
        console.log(
          "[AuthContext] Token guardado en localStorage:",
          responseData.token
        );
        setIsAuthenticated(true);
        console.log(
          "[AuthContext] Usuario autenticado, redirigiendo a /"
        );
        router.push("/");
      }
    } catch (error) {
      console.error("[AuthContext] Login fallido", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const register = async (data: Record<string, unknown>) => {
    try {
      console.log("[AuthContext] Intentando registro con datos:", data);
      // Use the imported apiRegister function
      await apiRegister(data);
      console.log("[AuthContext] Registro exitoso, redirigiendo a /login");
      router.push("/login");
    } catch (error) {
      console.error("[AuthContext] Registro fallido", error);
      alert("Registration failed. Please try again.");
    }
  };

  const logout = () => {
    console.log("[AuthContext] Logout iniciado");
    localStorage.removeItem("jwt_token");
    console.log("[AuthContext] Token eliminado de localStorage");
    setIsAuthenticated(false);
    console.log("[AuthContext] Usuario desautenticado, redirigiendo a /login");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

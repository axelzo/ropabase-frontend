"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
// Importa las funciones de API necesarias para auth
import {
  login as apiLogin,
  register as apiRegister,
  apiLogout,
  checkAuth,
} from "@/lib/api";
import { toast } from "sonner";

// Define la forma del valor que expone el contexto a los componentes
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: Record<string, unknown>) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

// Crea el contexto con valor inicial undefined.
// El hook useAuth() se encarga de validar que se use dentro del Provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Estado de autenticación: comienza en false hasta verificar con el backend
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // isLoading: true mientras se verifica la sesión al cargar la app.
  // Los componentes protegidos esperan a que sea false antes de redirigir.
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ── Verificación inicial de sesión ─────────────────────────────────────────
  // Al montar el Provider, intenta renovar el accessToken usando el refreshToken
  // que puede existir en las cookies HTTP-only del navegador.
  // Esto reemplaza la verificación antigua de localStorage que usaba "jwt_token".
  //   - Si el refresh tiene éxito → el usuario tiene sesión activa.
  //   - Si falla (token expirado o sin sesión) → el usuario no está autenticado.
  useEffect(() => {
    const verifySession = async () => {
      try {
        await checkAuth(); // POST /auth/refresh
        setIsAuthenticated(true);
        console.log("[AuthContext] Sesión activa verificada con refresh token");
      } catch {
        // No hay sesión válida; es el estado inicial esperado para usuarios nuevos
        setIsAuthenticated(false);
        console.log("[AuthContext] Sin sesión activa al iniciar");
      } finally {
        // Termina la carga sin importar el resultado
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // ── Listener del evento 'auth:logout' ─────────────────────────────────────
  // El interceptor de respuesta en api.ts emite este evento cuando el refresh
  // automático falla (ambos tokens expirados). Así cualquier componente que
  // haga una petición protegida puede desencadenar el cierre de sesión global
  // sin necesidad de pasar callbacks entre capas.
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log("[AuthContext] Sesión expirada detectada por el interceptor");
      setIsAuthenticated(false);
      router.push("/login");
    };

    // Registra el listener en el objeto window
    window.addEventListener("auth:logout", handleSessionExpired);

    // Limpieza: elimina el listener cuando el Provider se desmonta
    return () => {
      window.removeEventListener("auth:logout", handleSessionExpired);
    };
  }, [router]);

  // ── Login ──────────────────────────────────────────────────────────────────
  // Envía las credenciales al backend. Si son válidas, el servidor establece
  // las cookies accessToken y refreshToken (HTTP-only) en la respuesta.
  // Ya no se almacena ningún token en localStorage; las cookies son invisibles
  // para el código JS y el navegador las envía automáticamente en cada petición.
  const login = async (data: Record<string, unknown>) => {
    try {
      console.log("[AuthContext] Intentando login con datos:", data);
      await apiLogin(data); // El servidor setea las cookies en la respuesta
      setIsAuthenticated(true);
      console.log("[AuthContext] Login exitoso, redirigiendo a /dashboard");
      router.push("/dashboard");
    } catch (error) {
      console.error("[AuthContext] Login fallido", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  // Crea la cuenta del usuario. No inicia sesión automáticamente;
  // redirige al login para que el usuario se autentique manualmente.
  const register = async (data: Record<string, unknown>) => {
    try {
      console.log("[AuthContext] Intentando registro con datos:", data);
      await apiRegister(data);
      console.log("[AuthContext] Registro exitoso, redirigiendo a /login");
      router.push("/login");
    } catch (error) {
      console.error("[AuthContext] Registro fallido", error);
      alert("Registration failed. Please try again.");
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  // Llama al backend para invalidar el refreshToken en la base de datos
  // y borrar ambas cookies del navegador. Aunque la petición falle (p.ej.
  // sin conexión), limpia el estado local para proteger la UI.
  const logout = async () => {
    console.log("[AuthContext] Logout iniciado");
    try {
      await apiLogout(); // POST /auth/logout → invalida el token en la BD y borra cookies
      console.log("[AuthContext] Logout completado en el servidor");
    } catch (error) {
      // Si el servidor no responde, igual cerramos la sesión en el cliente
      console.warn("[AuthContext] Error al llamar logout en el servidor:", error);
    } finally {
      setIsAuthenticated(false);
      console.log("[AuthContext] Usuario desautenticado, redirigiendo a /login");
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto.
// Lanza un error descriptivo si se usa fuera del Provider.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

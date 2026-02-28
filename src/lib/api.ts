import axios from 'axios';

// Endpoints de autenticación que NO deben disparar el intento de refresh automático.
// Si una petición a estos URLs falla con 401, se rechaza directamente sin reintentar.
const AUTH_URLS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout'];

// Bandera global: evita que múltiples peticiones fallen en simultáneo y disparen
// varios refreshes al mismo tiempo. Solo se hace un refresh a la vez.
let isRefreshing = false;

// Cola de peticiones que llegaron con 401 mientras ya se estaba ejecutando un refresh.
// Una vez que el refresh termina, todas se reintentan (o rechazan) juntas.
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Procesa la cola de peticiones pendientes cuando el refresh termina.
// Si "error" es nulo, significa que el refresh fue exitoso → resuelve cada promesa.
// Si "error" tiene valor, el refresh falló → rechaza cada promesa con ese error.
const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  // Limpia la cola después de procesarla
  failedQueue = [];
};

// Instancia de Axios compartida por toda la app.
// - baseURL: apunta al backend usando la variable de entorno de Next.js.
// - withCredentials: permite que el navegador envíe y reciba cookies HTTP-only
//   automáticamente en cada petición (necesario para accessToken y refreshToken).
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ─── Interceptor de respuesta ────────────────────────────────────────────────
// Captura los errores 401 (token expirado) y ejecuta el flujo de silent refresh:
//   1. Llama a POST /auth/refresh (usa el refreshToken de la cookie automáticamente).
//   2. Si tiene éxito, reintenta la petición original con el nuevo accessToken.
//   3. Si falla (refresh token también expirado), emite el evento 'auth:logout'
//      para que el AuthContext cierre la sesión y redirija al login.
api.interceptors.response.use(
  // Las respuestas exitosas pasan sin modificación
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Verifica si la URL que falló es un endpoint de auth.
    // Estos se excluyen para evitar bucles infinitos:
    // p.ej. si /auth/refresh devuelve 401, no debemos intentar refreshear de nuevo.
    const isAuthUrl = AUTH_URLS.some((url) => originalRequest?.url?.includes(url));

    // Solo intentamos el refresh si:
    //   - El servidor devolvió 401 (token inválido o expirado)
    //   - La petición no es de auth (isAuthUrl = false)
    //   - No es un reintento previo (_retry evita bucles)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {

      // Si ya hay un refresh en curso, encola esta petición para que espere
      // y se reintente una vez que el refresh termine
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))   // Reintenta la petición original
          .catch((err) => Promise.reject(err));
      }

      // Marca la petición como reintento para no caer en un bucle
      originalRequest._retry = true;
      // Indica que ya hay un refresh en progreso
      isRefreshing = true;

      try {
        // Solicita un nuevo accessToken usando el refreshToken de la cookie.
        // El backend establece el nuevo accessToken como cookie HTTP-only.
        await api.post('/auth/refresh');

        // Refresh exitoso: desbloquea la cola y reintenta la petición original
        processQueue(null);
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh fallido: el refreshToken también expiró o fue invalidado.
        // Rechaza todas las peticiones en cola con el error.
        processQueue(refreshError);

        // Emite un evento global para que el AuthContext detecte que la sesión
        // expiró y redirija al usuario a /login sin importar en qué componente esté.
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:logout'));
        }

        return Promise.reject(refreshError);

      } finally {
        // Siempre libera la bandera al terminar, tanto si tuvo éxito como si falló
        isRefreshing = false;
      }
    }

    // Para cualquier otro error (400, 403, 500, etc.) lo deja pasar tal cual
    return Promise.reject(error);
  }
);

export default api;


// ─── Auth API ────────────────────────────────────────────────────────────────

// Inicia sesión: el backend valida las credenciales y establece las cookies
// accessToken (15 min) y refreshToken (7 días) como HTTP-only.
// La respuesta solo contiene { message, userId }, el token nunca llega al JS.
export const login = async (credentials: Record<string, unknown>) => {
  const response = await api.post('/auth/login', credentials, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

// Registra un nuevo usuario. No establece sesión; redirige al login después.
export const register = async (data: Record<string, unknown>) => {
  const response = await api.post('/auth/register', data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

// Cierra sesión: el backend invalida el refreshToken en la base de datos
// y borra ambas cookies del navegador.
export const apiLogout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Verifica si el usuario tiene una sesión activa al cargar la app.
// Intenta renovar el accessToken usando el refreshToken de la cookie.
// Si tiene éxito → hay sesión. Si falla (401) → no hay sesión válida.
export const checkAuth = async () => {
  await api.post('/auth/refresh');
};


// ─── Clothing API ────────────────────────────────────────────────────────────

export interface ClothingFilters {
  category?: string;
  brand?: string;
  color?: string;
  name?: string;
}

// Obtiene la lista de prendas. Elimina los filtros vacíos antes de enviar.
export const getClothingItems = async (filters?: ClothingFilters) => {
  const cleanFilters = filters
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    : {};
  const response = await api.get('/clothing', { params: cleanFilters });
  return response.data;
};

// Crea una nueva prenda. Usa FormData para soportar el envío de imágenes.
export const addClothingItem = async (item: FormData) => {
  const response = await api.post('/clothing', item, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Actualiza una prenda existente por su ID.
export const updateClothingItem = async (id: string, data: FormData) => {
  const response = await api.put(`/clothing/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Elimina una prenda por su ID.
export const deleteClothingItem = async (id: string) => {
  const response = await api.delete(`/clothing/${id}`);
  return response.data;
};

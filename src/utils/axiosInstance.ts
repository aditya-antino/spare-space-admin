import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ROUTES } from "@/constants";
import { store } from "@/store";
import { clearUser, setUser } from "@/store/slices/userSlice";
import { toast } from "sonner";
import {
  encryptRequest,
  decryptResponse,
  isEncrypted,
} from "@/utils/encryption";

const ENABLE_ENCRYPTION =
  import.meta.env.VITE_PUBLIC_ENABLE_ENCRYPTION === "true";
const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL;
const PLACES_API_KEY = import.meta.env.VITE_PUBLIC_PLACES_API_KEY;
const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY;

const TOKEN_EXPIRED_MESSAGE = "Token is Expired";
const REFRESH_TOKEN_EXPIRED_MESSAGE = "Refresh Token expired";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleSessionExpired = () => {
  if (typeof window === "undefined") return;
  store.dispatch(clearUser());
  toast.error("Your session has expired. Please log in again.");
  setTimeout(() => window.location.replace(ROUTES.login), 1500);
};

// Endpoints whose **requests** should NOT be encrypted
const NON_ENCRYPTED_ENDPOINTS: string[] = [
  "admin/booking-activity", // statistics.services.ts
];

const isNonEncryptedEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return NON_ENCRYPTED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(API_KEY && { "x-api-key": API_KEY }),
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.user.tokenID;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (PLACES_API_KEY) {
      config.headers["x-api-key"] = PLACES_API_KEY;
    }

    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const roleId = path.includes("host") ? 2 : 3;
      config.headers["x-role-id"] = String(roleId);
    }

    // Skip encryption if explicitly requested on this call
    if ((config as any).skipEncryption) {
      return config;
    }

    // Skip encryption for specific endpoints
    if (isNonEncryptedEndpoint(config.url)) {
      return config;
    }

    if (
      ENABLE_ENCRYPTION &&
      config.data !== undefined &&
      config.data !== null
    ) {
      try {
        if (
          !(config.data instanceof FormData) &&
          !(config.data instanceof Blob) &&
          !(config.data instanceof ArrayBuffer)
        ) {
          let dataToEncrypt = config.data;
          if (typeof config.data === "string") {
            try {
              dataToEncrypt = JSON.parse(config.data);
            } catch {
              // If not valid JSON, encrypt as string
            }
          }
          config.data = encryptRequest(dataToEncrypt);
          config.headers["X-Encrypted"] = "true";
        }
      } catch (error) {
        console.error("Failed to encrypt request:", error);
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Skip decryption if explicitly requested on this call
    if ((response.config as any)?.skipEncryption) {
      return response;
    }

    if (ENABLE_ENCRYPTION && response.data) {
      try {
        const headerEncrypted =
          response.headers["x-encrypted"] === "true" ||
          response.headers["X-Encrypted"] === "true";
        const encryptedString =
          (response.data as any)?.encryptData ||
          (response.data as any)?.encryptedData;
        const hasEncryptedData =
          encryptedString && typeof encryptedString === "string";
        const shouldDecrypt = headerEncrypted || hasEncryptedData;

        if (shouldDecrypt) {
          response.data = decryptResponse(response.data);
        }
      } catch (error) {
        console.error("Failed to decrypt response:", error);
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (ENABLE_ENCRYPTION && error?.response?.data) {
      try {
        const errorData = error.response.data as any;
        const errorHeaderEncrypted =
          error.response.headers["x-encrypted"] === "true" ||
          error.response.headers["X-Encrypted"] === "true";
        const errorEncryptedString =
          errorData?.encryptData || errorData?.encryptedData;
        const errorHasEncryptedData =
          errorEncryptedString &&
          typeof errorEncryptedString === "string" &&
          isEncrypted(errorEncryptedString);
        const shouldDecryptError =
          errorHeaderEncrypted || errorHasEncryptedData;

        if (shouldDecryptError) {
          error.response.data = decryptResponse(errorData);
        }
      } catch (decryptError) {
        console.error("Failed to decrypt error response:", decryptError);
      }
    }

    const message: string =
      (error?.response?.data as any)?.message ||
      (error?.response?.data as any)?.data?.message ||
      (error?.response?.data as any)?.error ||
      "";

    // Refresh Token expired → logout
    if (message === REFRESH_TOKEN_EXPIRED_MESSAGE) {
      handleSessionExpired();
      return Promise.reject(error?.response?.data);
    }

    // Token expiry → Attempt Refresh
    if (
      (error?.response?.status === 401 || message === TOKEN_EXPIRED_MESSAGE) &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const refreshToken = state.user.refreshToken;

      if (!refreshToken) {
        handleSessionExpired();
        return Promise.reject(error?.response?.data);
      }

      try {
        const response = await axiosInstance.post("/auth/refresh-token", {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        if (accessToken) {
          store.dispatch(
            setUser({
              user: state.user.user!,
              accessToken,
              refreshToken: newRefreshToken || refreshToken,
            }),
          );
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error?.response?.data || error);
  },
);

export { axiosInstance };

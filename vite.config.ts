import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    define: {
      __IS_SANDBOX__: JSON.stringify(isDevelopment),
    },

    server: {
      allowedHosts: ["admin.sparespace.co.in"],
      host: true,
      cors: true,
      port: 3000,
    },

    build: {
      sourcemap: true,

      chunkSizeWarningLimit: 1500,

      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            ui: ["lucide-react"],
            charts: ["recharts"],
            utils: ["lodash"],
          },
        },
      },
    },

    preview: {
      port: 5173,
      host: true,
      strictPort: true,
    },
  };
});

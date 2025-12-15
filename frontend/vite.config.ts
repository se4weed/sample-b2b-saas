import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const backendOrigin = (process.env.VITE_BACKEND_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
const isHttpsBackend = backendOrigin.startsWith("https://");
const proxyTarget = `${backendOrigin}/api`;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()] as any,
  build: {
    assetsDir: "assets",
    // Disable sourcemaps in production to avoid security warnings
    sourcemap: process.env.NODE_ENV === "development",
  },
  // As also defined in react-router.config.ts, this tells Vite that
  // the app is served from the "/assets/" sub-path.
  base: "/frontend/",

  // These are settings for the dev server.
  server: {
    // In production and preview mode, the API server (Rails) and the assets
    // will be served from the same port number (typically 80 for production and 3000 for preview).
    //
    // However, when using the vite development server, assets will be served from port 5173,
    // and the API server will be on port 3000 (Rails default).
    // The use of different ports complicates CORS settings and cookie handling.
    //
    // To work around this, Vite provides a proxy mode that can receive API requests
    // on port (5173) and forward them to the Rails server (port 3000).
    // From the browser's viewpoint, all communications including API requests to the Rails server
    // will now happen on port 5173, so CORS will no longer be necessary.
    proxy: {
      // Any requests starting with "/api" will be forwarded according to
      // the following rules.
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
        secure: !isHttpsBackend,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});

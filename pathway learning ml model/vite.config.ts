import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "./client"),
  server: {
    host: "::",
    port: 5173,
    fs: {
      allow: [
        path.resolve(__dirname, "./client"),
        path.resolve(__dirname, "./shared"),
      ],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  let expressApp: any = null;
  
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Create Express app synchronously so it's available immediately
      // We need to wait for httpServer to be available
      if (server.httpServer && !expressApp) {
        const { app } = createServer(server.httpServer);
        expressApp = app;
        
        // Add Express app as middleware BEFORE Vite's default middleware
        // This ensures API routes are handled by Express first
        server.middlewares.use((req, res, next) => {
          // Only handle API routes with Express
          if (req.url?.startsWith("/api/")) {
            // Track if response was sent
            let responseSent = false;
            
            // Override res.end to track when response is sent
            const originalEnd = res.end.bind(res);
            res.end = function(...args: any[]) {
              responseSent = true;
              return originalEnd(...args);
            };
            
            // Call Express app as middleware
            app(req, res, (err: any) => {
              if (err) {
                console.error("Express middleware error:", err);
                if (!responseSent) {
                  res.status(500).json({ error: "Internal server error" });
                }
              } else if (!responseSent) {
                // If Express didn't handle the request, pass to Vite
                next();
              }
            });
          } else {
            // Pass non-API routes to Vite
            next();
          }
        });
      } else if (!server.httpServer) {
        // If httpServer isn't available yet, wait for it
        return () => {
          if (server.httpServer && !expressApp) {
            const { app } = createServer(server.httpServer);
            expressApp = app;
            
            server.middlewares.use((req, res, next) => {
              if (req.url?.startsWith("/api/")) {
                let responseSent = false;
                const originalEnd = res.end.bind(res);
                res.end = function(...args: any[]) {
                  responseSent = true;
                  return originalEnd(...args);
                };
                
                app(req, res, (err: any) => {
                  if (err) {
                    console.error("Express middleware error:", err);
                    if (!responseSent) {
                      res.status(500).json({ error: "Internal server error" });
                    }
                  } else if (!responseSent) {
                    next();
                  }
                });
              } else {
                next();
              }
            });
          }
        };
      }
    },
  };
}

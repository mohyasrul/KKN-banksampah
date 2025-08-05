import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg", "offline.html"],
      manifest: {
        name: "Bank Sampah RW 10",
        short_name: "BankSampah",
        description:
          "Aplikasi manajemen tabungan hijau untuk RW 10 Desa Cidatar",
        theme_color: "#22c55e",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}"],
        skipWaiting: true, // Immediately activate new service worker
        clientsClaim: true, // Take control of all clients immediately
        maximumFileSizeToCacheInBytes: 5000000, // 5MB limit
        runtimeCaching: [
          // Cache navigation requests (SPA routing)
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: "NetworkFirst",
            options: {
              cacheName: "navigation-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          // Cache the main HTML document
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          // Cache Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          // Cache Supabase API calls with offline fallback
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          // Cache static assets
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Cache JS and CSS with StaleWhileRevalidate for faster updates
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "js-css-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
        // Additional configuration for offline support
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // Cleanup old caches
        cleanupOutdatedCaches: true,
      },
      // Enable development service worker for testing
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

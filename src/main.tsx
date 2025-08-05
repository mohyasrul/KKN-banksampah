import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enhanced PWA Service Worker registration with offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // First try to register the Vite PWA service worker
      let registration = await navigator.serviceWorker.register("/sw.js");
      
      console.log("PWA: Service Worker registered successfully", registration);

      // Listen for service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker available
              console.log("New service worker available");
              
              // Notify user about update (you can customize this)
              if (confirm("Aplikasi telah diperbarui. Refresh untuk mendapatkan versi terbaru?")) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }
            }
          });
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SW_UPDATED") {
          window.location.reload();
        }
      });

    } catch (error) {
      console.log("PWA: Service Worker registration failed", error);
      
      // Fallback: try to register custom service worker
      try {
        await navigator.serviceWorker.register("/sw-custom.js");
        console.log("Custom Service Worker registered as fallback");
      } catch (fallbackError) {
        console.log("Fallback Service Worker registration also failed", fallbackError);
      }
    }
  });
}

// Initialize app with offline detection
const initializeApp = () => {
  const root = createRoot(document.getElementById("root")!);
  
  // Check if we're starting offline
  if (!navigator.onLine) {
    console.log("Starting in offline mode");
  }

  root.render(<App />);
};

// Enhanced error handling for offline scenarios
window.addEventListener("error", (event) => {
  console.error("App error:", event.error);
  
  // If it's a network error and we're offline, handle gracefully
  if (!navigator.onLine && event.error?.message?.includes("fetch")) {
    console.log("Network error in offline mode - handled gracefully");
    event.preventDefault();
  }
});

// Listen for online/offline events
window.addEventListener("online", () => {
  console.log("App is back online");
  // You could trigger data sync here
});

window.addEventListener("offline", () => {
  console.log("App is now offline");
});

// Start the app
initializeApp();

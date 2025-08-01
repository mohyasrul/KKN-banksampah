import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register PWA Service Worker with update handling
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "PWA: Service Worker registered successfully",
          registration
        );

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "SW_UPDATED") {
            // Service worker has been updated, refresh the page
            window.location.reload();
          }
        });
      })
      .catch((error) => {
        console.log("PWA: Service Worker registration failed", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);

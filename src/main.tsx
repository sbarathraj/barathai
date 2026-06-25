import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register service worker with auto-update support
registerSW({
  onNeedRefresh() {
    // New content available — auto-reload in standalone PWA mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.info("[BarathAI PWA] App ready to work offline");
  },
});

createRoot(document.getElementById("root")!).render(<App />);

import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./hooks/useThemeMode.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "glass",
          style: { borderRadius: "0.875rem" },
        }}
      />
    </ThemeProvider>
  </StrictMode>,
);

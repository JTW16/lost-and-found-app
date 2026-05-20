import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./app/App.tsx";
import { AppProvider } from "./app/context/AppContext.tsx";
import { AuthProvider } from "./app/context/AuthContext.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AppProvider>
      <App />
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { fontFamily: "inherit", fontSize: "14px" } }}
      />
    </AppProvider>
  </AuthProvider>
);
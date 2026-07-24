import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { startSyncManager } from "./offline/core/syncManager";

export default function App() {
  useEffect(() => {
    startSyncManager();
  }, []);

  return <AppRoutes />;
}
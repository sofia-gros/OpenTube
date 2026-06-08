import { useEffect } from "preact/hooks";
import AppRouter from "./router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./lib/db";
import "./app.css";

export function App() {
  const darkMode = useLiveQuery(
    async () => {
      const setting = await db.settings.get("darkMode");
      return setting ? setting.value : false;
    },
    []
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return <AppRouter />;
}

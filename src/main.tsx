import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

async function enableMocking() {
  // Dev-only: intercept API calls locally.
  if (!import.meta.env.DEV) return;
  const rawUseMocks = import.meta.env.VITE_USE_MOCKS;
  const useMocks = String(rawUseMocks || "").toLowerCase() === "true";
  if (rawUseMocks === undefined || rawUseMocks === "") {
    console.error(
      [
        "[MSW] Missing VITE_USE_MOCKS env var.",
        "Fix:",
        "1) Create .env.local in the project root (same folder as package.json)",
        "2) Add: VITE_USE_MOCKS=true",
        "3) Restart: npm run dev",
      ].join("\n")
    );
  }
  if (!useMocks) {
    console.log("[MSW] Mocking disabled");
    return;
  }
  const { worker } = await import("./mock/browser");
  await worker.start({ onUnhandledRequest: "warn" });
  try {
    const response = await fetch("/mockServiceWorker.js", { cache: "no-store" });
    if (!response.ok) {
      console.warn(
        `[MSW] mockServiceWorker.js not found (${response.status}). Run: npx msw init public/`
      );
    }
  } catch (error) {
    console.warn("[MSW] Failed to check mockServiceWorker.js", error);
  }
  console.log("[MSW] Mocking enabled");
}

enableMocking().then(() => {
  console.log("DEV:", import.meta.env.DEV);
  console.log("VITE_USE_MOCKS:", import.meta.env.VITE_USE_MOCKS);
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

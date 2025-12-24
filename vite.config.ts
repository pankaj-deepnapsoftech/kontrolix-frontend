import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    assetsInclude: ["**/*.csv"],
    define: {
      "process.env": env,
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        react: path.resolve(process.cwd(), "node_modules/react"),
        "react-dom": path.resolve(process.cwd(), "node_modules/react-dom"),
      },
    },
  };
});

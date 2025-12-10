import { defineConfig } from "vite";
import { resolve } from "path";

// (Optional) Opening behavior. Vite uses your system opener; this env can help on some setups.
// process.env.BROWSER = "google-chrome"; // or "chrome" / comment out if not needed.

export default defineConfig({
  base: "/", // Adjust if your app is served from a subpath
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    assetsDir: "assets",
  },
  server: {
    hmr: { overlay: true },
    open: true,
    port: 4000, // change if you prefer 5173
  },
});

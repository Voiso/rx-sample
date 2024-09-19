import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "rx-sample",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["effector", "rxjs"],
    },
  },
  plugins: [dts({ rollupTypes: true })],
});

import { defineConfig, mergeConfig } from "vitest/config";
import {defineViteConfig} from "smartbundle";

export default defineConfig(async () => {
  const viteConfig = await defineViteConfig();

  return mergeConfig(viteConfig, {
    test: {},
  });
});

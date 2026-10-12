import convexPlugin from "@convex-dev/eslint-plugin";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist/**", "convex/_generated/**", "src/routeTree.gen.ts"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
  },
  ...convexPlugin.configs.recommended,
]);

import convexPlugin from "@convex-dev/eslint-plugin";
import { defineConfig } from "eslint/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  {
    ignores: ["dist/**", "convex/_generated/**", "src/routeTree.gen.ts"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
  },
  ...convexPlugin.configs.recommended,
  {
    files: ["convex/**/*.ts"],
    ignores: ["convex/_generated/**"],
    languageOptions: {
      parserOptions: {
        project: "./convex/tsconfig.json",
        tsconfigRootDir: rootDir,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@convex-dev/require-access-control": "error",
    },
  },
]);

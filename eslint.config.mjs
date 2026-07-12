import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "desktop/**",
    ".turbo/**",
    "client/**",
    "mobile/**",
    "client/next-env.d.ts",
    "*.js",
    "scripts/**",
    "server/src/generated/**",
  ]),
  ...tseslint.config(
    {
      files: ["server/**/*.ts", "packages/**/*.ts"],
      extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
      rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
      },
    },
    eslintConfigPrettier
  ),
]);

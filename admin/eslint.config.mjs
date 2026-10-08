import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: tsPlugin.configs.recommended.rules,
  },
  {
    ignores: [".next/**", "node_modules/**", "test-results/**", "playwright-report/**"],
  },
];

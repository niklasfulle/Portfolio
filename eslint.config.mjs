import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "node_modules/**",
    "admin/**",
    "output/**",
    "out/**",
    "build/**",
    ".scannerwork/**",
    "next-env.d.ts",
  ]),
]);

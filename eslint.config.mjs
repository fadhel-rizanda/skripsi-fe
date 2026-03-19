import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 1. Ubah 'any' jadi warning aja
      "@typescript-eslint/no-explicit-any": "warn",

      // 2. Ubah error karakter kutipan (') jadi warning
      "react/no-unescaped-entities": "warn",

      // 3. Ubah error Math.random di render (purity) jadi warning
      "react-hooks/purity": "warn",
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

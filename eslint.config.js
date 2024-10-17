const tsParser = require("@typescript-eslint/parser");
const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  {
    ignores: ["node_modules/**"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        browser: "readonly",
        node: "readonly",
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      "no-console": "off",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn"],
      eqeqeq: ["error", "always"],
      curly: "error",
      "no-var": "error",
      "prefer-const": "error",
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
];

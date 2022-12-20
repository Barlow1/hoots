module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
    "@remix-run/eslint-config",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "react-in-jsx-scope": 0,
    "react/jsx-filename-extension": [1, { extensions: [".jsx", "tsx"] }],
    "jsx-a11y/label-has-associated-control": 0,
    "react/jsx-props-no-spreading": 0,
    "react/prop-types": 0,
    "import/extensions": 0,
    "react/require-default-props": 0,
    "@typescript-eslint/no-unused-vars": 2,
    "react/jsx-no-useless-fragment": 0,
    "react/display-name": 0,
    "no-underscore-dangle": 0,
    "react/no-unescaped-entities": 0
  },
};

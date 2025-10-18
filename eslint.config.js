import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js"


export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  { settings: { react: { version: "detect" } } },
  { ignores: ["dist/*"] },
  { rules: { 
    'react/react-in-jsx-scope': 'off',
    'no-unused-expressions': 'off',
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unused-expressions": "off"
  } },
];

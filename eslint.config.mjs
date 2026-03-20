import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: ["node_modules/**", ".next/**", "prep-apps/**", "prep-docs/**"]
  },
  ...nextVitals
];

export default config;

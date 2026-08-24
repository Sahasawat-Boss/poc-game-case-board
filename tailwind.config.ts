import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        desk: { DEFAULT: "#2A2018", dark: "#150F0A" },
        manila: { DEFAULT: "#E4D2A9", hi: "#F1E3C1", sh: "#C9B487" },
        ink: { DEFAULT: "#2C2015", soft: "#6E5B41" },
        stamp: "#A8332A",
        brass: "#C99A3E",
        okgreen: "#3E7A52",
        term: { DEFAULT: "#151109", fg: "#EBDCB6" },
      },
      fontFamily: {
        display: ["var(--font-display)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

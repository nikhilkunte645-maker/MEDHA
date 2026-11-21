import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Neon-Glass Theme Tokens
        surface: {
          deep: "#0e0e13",
          DEFAULT: "#131318",
          elevated: "#1b1b20",
          secondary: "#1f1f25",
          higher: "#2a292f",
          highest: "#35343a",
        },
        text: {
          primary: "#e4e1e9",
          secondary: "#cbc3d7",
        },
        outline: {
          DEFAULT: "#958ea0",
          variant: "#494454",
        },
        accent: {
          primary: "#d0bcff",
          primaryContainer: "#a078ff",
          secondary: "#5de6ff",
          secondaryContainer: "#00cbe6",
          tertiary: "#ffb0cd",
          tertiaryContainer: "#f751a1",
          error: "#ffb4ab",
        },
        mastery: {
          mastered: "#38D99A",
          learning: "#F3B94F",
          atRisk: "#FF657A",
          unassessed: "#565E71",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Space Grotesk", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        neonPrimary: "0 0 20px -3px rgba(208, 188, 255, 0.35)",
        neonSecondary: "0 0 20px -3px rgba(93, 230, 255, 0.35)",
        neonAtRisk: "0 0 20px -3px rgba(255, 101, 122, 0.4)",
        neonMastered: "0 0 20px -3px rgba(56, 217, 154, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;

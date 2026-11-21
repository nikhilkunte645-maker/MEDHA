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
        background: "#080b14",
        surface: {
          DEFAULT: "#0f1523",
          elevated: "#151d30",
          border: "#1e293b",
          hover: "#243147",
        },
        brand: {
          violet: "#8b5cf6",
          cyan: "#06b6d4",
          purple: "#a855f7",
          glow: "rgba(139, 92, 246, 0.15)",
        },
        mastery: {
          weak: "#ef4444",
          developing: "#f59e0b",
          proficient: "#10b981",
          strong: "#059669",
          unassessed: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

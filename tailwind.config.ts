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
        // "The Intelligent Learning Studio" Core Design Tokens
        canvas: "#F7F7F4",
        surface: {
          deep: "#F7F7F4", // Studio paper canvas foundation
          DEFAULT: "#FFFFFF", // Crisp white surface
          elevated: "#FFFFFF",
          secondary: "#F0F1F4", // Soft neutral wash
          higher: "#F8F9FD", // Soft cobalt highlight wash
          highest: "#E8E9ED", // Hairline border
        },
        text: {
          primary: "#171923", // Deep warm charcoal ink
          secondary: "#697080", // Refined editorial slate
          muted: "#9CA3AF", // Soft caption slate
          inverse: "#FFFFFF",
        },
        outline: {
          DEFAULT: "#D1D5DB",
          variant: "#E8E9ED", // Delicate 1px structural border
        },
        accent: {
          primary: "#435FE8", // Intelligent studio cobalt
          primaryHover: "#344ECC",
          primaryContainer: "#435FE8",
          primaryLight: "#EEF2FF",
          secondary: "#168F83", // Scientific inquiry teal
          secondaryContainer: "#168F83",
          secondaryLight: "#E6F7F5",
          tertiary: "#E9A63A", // Conceptual amber
          tertiaryContainer: "#E9A63A",
          warm: "#E9A63A",
          warmLight: "#FEF3C7",
          error: "#EF4444",
        },
        mastery: {
          mastered: "#10B981", // Vibrant emerald
          masteredLight: "#ECFDF5",
          learning: "#F59E0B", // Warm amber
          learningLight: "#FFFBEB",
          atRisk: "#EF4444", // Coral red
          atRiskLight: "#FEF2F2",
          unassessed: "#94A3B8", // Balanced slate
          unassessedLight: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Manrope", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)",
        float: "0 12px 24px -4px rgba(0, 0, 0, 0.08)",
        cobalt: "0 4px 14px 0 rgba(67, 95, 232, 0.22)",
        teal: "0 4px 14px 0 rgba(22, 143, 131, 0.22)",
        neonPrimary: "0 4px 14px 0 rgba(67, 95, 232, 0.20)",
        neonSecondary: "0 4px 14px 0 rgba(22, 143, 131, 0.20)",
        neonAtRisk: "0 4px 14px 0 rgba(239, 68, 68, 0.20)",
        neonMastered: "0 4px 14px 0 rgba(16, 185, 129, 0.20)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
export default config;
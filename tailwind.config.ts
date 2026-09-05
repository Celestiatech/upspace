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
        background: "var(--background)",
        foreground: "var(--foreground)",
        neon: {
          cyan: "#00f0ff",
          purple: "#9d4edd",
          emerald: "#10b981",
          gold: "#f59e0b",
          rose: "#f43f5e",
          blue: "#3b82f6"
        },
        cyber: {
          dark: "#07090e",
          darker: "#030407",
          card: "rgba(13, 17, 28, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
          glow: "rgba(0, 240, 255, 0.15)"
        }
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(0, 240, 255, 0.3)",
        "glow-gold": "0 0 25px -5px rgba(245, 158, 11, 0.35)",
        "glow-purple": "0 0 25px -5px rgba(157, 78, 221, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "'Bricolage Grotesque'", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "'Bricolage Grotesque'", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050816",
        card: "#0F172A",
        primary: "#3B82F6",
        accent: "#06B6D4",
        success: "#10B981",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(59, 130, 246, 0.45)",
        card: "0 10px 40px -10px rgba(2, 6, 23, 0.8), 0 0 0 1px rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(90deg, #3B82F6 0%, #06B6D4 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        scan: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        scan: "scan 3s linear infinite alternate",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

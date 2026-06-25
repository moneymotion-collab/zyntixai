import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        info: "#60a5fa",
        danger: "#f87171",
        dark: "#06080f",
        card: "#0f1420",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #8b5cf6 100%)",
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0, 0, 0, 0.35)",
        glow: "0 0 40px rgba(99, 102, 241, 0.15)",
      },
    },
  },
  plugins: [],
}

export default config

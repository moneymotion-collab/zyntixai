import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#a3e635",
        info: "#60a5fa",
        danger: "#f87171",
        dark: "#09090b",
        card: "#18181b",
      },
    },
  },
  plugins: [],
}

export default config
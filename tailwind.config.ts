import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0e7490",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1f2937",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#4b5563",
        },
        accent: {
          DEFAULT: "#f3f4f6",
          foreground: "#1f2937",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#0e7490",
      },
      animation: {
        bounce: "bounce 1s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF7F2",
        foreground: "#1A1A1A",
        brand: {
          DEFAULT: "#C4956A",
          light: "#D4AA87",
          lighter: "#E8D5C8",
          dark: "#A07850",
          darker: "#7A5C3A",
        },
        muted: {
          DEFAULT: "#F5F0EB",
          foreground: "#6B6259",
        },
        accent: {
          DEFAULT: "#E8D5C8",
          foreground: "#5E4F44",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        border: "#E8E2DA",
        input: "#E8E2DA",
        ring: "#C4956A",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FAFAFA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        "warm-sm": "0 1px 3px rgba(196, 149, 106, 0.12)",
        "warm-md": "0 4px 16px rgba(196, 149, 106, 0.16)",
        "warm-lg": "0 8px 32px rgba(196, 149, 106, 0.20)",
        "warm-xl": "0 16px 48px rgba(196, 149, 106, 0.24)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

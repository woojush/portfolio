import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a", // deep slate blue (calm)
        foreground: "#e5e7eb", // soft gray for text
        accent: "#38bdf8", // light sky blue for subtle accents
        warmBeige: "#f5e9da",
        softGreen: "#9fb59b"
      }
    }
  },
  plugins: []
};

export default config;



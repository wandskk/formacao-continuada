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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bcdeff",
          300: "#8eccff",
          400: "#58b0fa",
          500: "#3190f4",
          600: "#1b73e8",
          700: "#145cb9",
          800: "#144c96",
          900: "#164179",
          950: "#0e294f",
        },
      },
    },
  },
  plugins: [],
};

export default config;

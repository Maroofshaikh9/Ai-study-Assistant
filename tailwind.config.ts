import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f4",
          100: "#d5ebe3",
          200: "#add7c8",
          500: "#14806f",
          600: "#0f6b5c",
          700: "#0c584c",
          800: "#0a453c",
          900: "#07332c",
        },
      },
    },
  },
  plugins: [],
};

export default config;

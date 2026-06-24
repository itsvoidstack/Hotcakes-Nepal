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
        cream: "#F5F0EA",
        "warm-white": "#FAF7F3",
        espresso: "#2A1D16",
        mocha: "#6B5B52",
        roasted: "#A97A4C",
        "dark-roast": "#8B623A",
        latte: "#E8DDD2",
        olive: "#6F7B58",
        "muted-red": "#A85A52",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

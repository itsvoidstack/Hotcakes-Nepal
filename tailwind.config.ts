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
        cream: "#F7F4EF",
        "warm-white": "#FCFBF8",
        espresso: "#2E221B",
        mocha: "#5E5248",
        roasted: "#6B4A32",
        "dark-roast": "#513625",
        latte: "#E8DED2",
        olive: "#6F7B58",
        "muted-red": "#A85A52",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-plus-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

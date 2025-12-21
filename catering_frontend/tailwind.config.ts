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
        clay: "#f4ede1",
        sand: "#e6d0b1",
        pine: "#0f4c3a",
        sage: "#94b49f",
        ember: "#d75f4b",
        ink: "#142022",
      },
      fontFamily: {
        sans: ["var(--font-sora)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        code: ["var(--font-space-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 20px 45px rgba(20,32,34,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;

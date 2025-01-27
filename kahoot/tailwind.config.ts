import type { Config } from "tailwindcss";

export default {
  content: [
    "./*",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/animated/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/create/**/*.{js,ts,jsx,tsx,mdx}", // Fix applied here
    "./app/play/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/play/[id]/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // extend: {
    //   colors: {
    //     background: "var(--background)",
    //     foreground: "var(--foreground)",
    //   },
    // },
  },
  plugins: [],
} satisfies Config;

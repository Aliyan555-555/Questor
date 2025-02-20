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
    extend: {
      colors: {
       blue_1:'#002F49',
       red_1:"#D62829",
       yalow_1:"#FBA732"
      },
      fontSize: {
        sm: '0.750rem',
        base: '1rem',
        xl: '1.333rem',
        '2xl': '1.777rem',
        '3xl': '2.369rem',
        '4xl': '3.158rem',
        '5xl': '4.210rem',
      },
      fontFamily: {
        heading: 'Open Sans',
        body: 'Open Sans',
      },
      fontWeight: {
        normal: '400',
        bold: '700',
      },
    },
  },
  plugins: [],
} satisfies Config;

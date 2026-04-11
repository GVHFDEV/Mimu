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
        mimu: {
          forest: '#4F6D45',
          sprout: '#A6B89E',
          oak: '#8B7355',
          linen: '#F5F5F0',
          obsidian: '#1A1A1A',
        },
      },
      fontFamily: {
        display: ['Cocogoose', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {

          "primary": "#01a2ff",

          "secondary": "#004e85",

          "accent": "#05ac9c",

          "neutral": "#1d283a",

          "base-100": "#e8e9ed",

          "info": "#0ca6e9",

          "success": "#2bd4bd",

          "warning": "#f4c152",

          "error": "#fb6f84",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};

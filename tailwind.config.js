/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        shakespeare: {
          50: "#fdf8f6",
          100: "#4eabd1", //normal
          200: "#eaddd7",
          300: "#e0cec7",
          400: "#d2bab0",
          500: "#bfa094",
          600: "#a18072",
          700: "#977669",
          800: "#846358",
          900: "#43302b",
        },
        powderBlue: {
          50: "#fdfeff",
          100: "#b0e0e6",
          300: "#3db2c0",
          400: "#318e99",
          600: "#18464c",
        },
        offWhite: "#fafafa",
      },
      boxShadow: {
        subtle: "0px 0px 6px rgb(0 0 0 / 30%)",
        subtleWhite: "0 0 3px rgb(250 250 250 / 20%)",
      },
    },
  },
  darkMode: "media",
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

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
          100: "#4eabd1",
          200: "#267393",
          400: "#113442",
        },
        powderBlue: {
          50: "#fdfeff",
          100: "#b0e0e6",
          200: "#63c2cd",
          250: "#4fbac7",
          300: "#3db2c0",
          400: "#318e99",
          500: "#246a73",
          600: "#18464c",
        },
        offWhite: "#fafafa",
        rebel: "#3c1206",
      },
      boxShadow: {
        subtle: "0px 0px 6px rgb(0 0 0 / 30%)",
        subtleWhite: "0 0 3px rgb(250 250 250 / 20%)",
      },
    },
  },
  darkMode: "media",
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("expanded", "&[data-expanded=true]");
      addVariant("selected", "&[data-selected=true]");
    }),
  ],
};

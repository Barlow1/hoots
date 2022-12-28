const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  darkMode: ["class", '[class="dark"]'], // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          900: "#4c1d95",
          800: "#5b21b6",
          700: "#6D29EF",
          600: "#7c3aed",
          500: "#8b5cf6",
          400: "#a78bfa",
          300: "#c4b5fd",
          200: "#ddd6fe",
          100: "#ede9fe",
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms'),
  ]
  // ...
};

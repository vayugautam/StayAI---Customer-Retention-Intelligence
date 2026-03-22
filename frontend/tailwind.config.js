/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        amber: "#f5a623",
        teal: "#00d4aa",
        "bg-base": "#080c12",
        "bg-surface": "#0d1420",
        "bg-card": "#0f1928",
      },
    },
  },
  plugins: [],
};

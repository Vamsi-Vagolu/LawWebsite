/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lawBlue: "#1E3A8A",
        lawGold: "#F59E0B",
        lawGrayLight: "#F3F4F6",
        lawGrayDark: "#374151",
        lawFooter: "#111827",
        lawLink: "#2563EB",
      },
    },
  },
  plugins: [],
};

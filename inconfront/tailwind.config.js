/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/dashboard/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "green-table": "#99C986",
        "button-table": "#AC8C7E",
        "yellow-inactive": "#F6D523",
        "flash-yellow": "#FFFF00", // Añadido color amarillo para el flash
        "custom-blue": "#5C7891", // Color personalizado para bordes e íconos
      },
      fontFamily: {
        "zen-kaku": ['"zen kaku gothic antique"', "sans-serif"],
      },
      keyframes: {
        swing: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-15deg)" },
          "40%": { transform: "rotate(10deg)" },
          "60%": { transform: "rotate(-10deg)" },
          "80%": { transform: "rotate(5deg)" },
        },
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-50%) translateX(-50%)" },
          "100%": { opacity: 1, transform: "translateY(0) translateX(-50%)" },
        },
      },
      animation: {
        swing: "swing 1s infinite",
        "slide-down": "slideDown 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

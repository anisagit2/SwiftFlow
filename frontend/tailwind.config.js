/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { 
        primary: "#006c46", 
        secondary: "#00d68f", 
        background: "#f7faf8", 
        surface: "#ffffff" 
      },
      fontFamily: { 
        headline: ["Space Grotesk", "sans-serif"], 
        body: ["Inter", "sans-serif"] 
      }
    },
  },
  plugins: [],
}

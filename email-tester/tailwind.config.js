/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#0f0f17",
          card: "#13131e",
          hover: "#1a1a28",
        },
        accent: {
          cyan: "#00d4ff",
          green: "#00ff88",
          red: "#ff3366",
          yellow: "#ffd600",
          purple: "#8b5cf6",
        },
        border: {
          subtle: "#1e1e30",
          active: "#2a2a45",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        accent: "var(--accent)",
        muted: "var(--text-muted)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        critical: "var(--critical)",
      },
      textColor: {
        DEFAULT: "var(--text)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "3px",
        lg: "4px",
      },
    },
  },
  plugins: [],
};

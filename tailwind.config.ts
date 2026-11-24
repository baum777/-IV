import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "brand-gold": "var(--brand-gold)",
        "brand-gold-light": "var(--brand-gold-light)",
        gold: "var(--brand-gold)",
        "gold-light": "var(--brand-gold-light)",
        "agent-m01": "var(--agent-m01)",
        "agent-m02": "var(--agent-m02)",
        "agent-m03": "var(--agent-m03)",
        "agent-m04": "var(--agent-m04)",
        m01: "var(--agent-m01)",
        m02: "var(--agent-m02)",
        m03: "var(--agent-m03)",
        m04: "var(--agent-m04)",
        positive: "var(--positive)",
        negative: "var(--negative)",
        warning: "var(--warning)",
        unknown: "var(--unknown)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "3px",
        lg: "4px",
      },
      maxWidth: {
        shell: "1440px",
        prose: "72ch",
      },
      letterSpacing: {
        label: "0.18em",
      },
      keyframes: {
        "seal-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "seal-breathe": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.8" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "seal-rotate": "seal-rotate 120s linear infinite",
        "seal-breathe": "seal-breathe 8s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

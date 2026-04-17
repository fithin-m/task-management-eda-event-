import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/store/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Avatar background colors - ensure they're never purged
    "bg-indigo-600",
    "bg-blue-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
    "bg-teal-600",
    "bg-pink-600",
    // Avatar ring colors
    "ring-indigo-300",
    "ring-blue-300",
    "ring-violet-300",
    "ring-emerald-300",
    "ring-rose-300",
    "ring-amber-300",
    "ring-teal-300",
    "ring-pink-300",
  ],
  theme: {
    extend: {
      colors: {
        // Taskhub design tokens
        bg: {
          app: "#f0f2f5",
          card: "#ffffff",
          sidebar: "#ffffff",
        },
        brand: {
          DEFAULT: "#4F46E5",
          light: "#EEF2FF",
          dark: "#3730A3",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          light: "#F3F4F6",
        },
        status: {
          todo: "#6B7280",
          "todo-bg": "#F3F4F6",
          inprogress: "#3B82F6",
          "inprogress-bg": "#EFF6FF",
          completed: "#10B981",
          "completed-bg": "#ECFDF5",
          overdue: "#EF4444",
          "overdue-bg": "#FEF2F2",
        },
        priority: {
          low: "#10B981",
          "low-bg": "#ECFDF5",
          medium: "#F59E0B",
          "medium-bg": "#FFFBEB",
          high: "#EF4444",
          "high-bg": "#FEF2F2",
        },
        project: {
          purple: "#8B5CF6",
          yellow: "#F59E0B",
          green: "#10B981",
          pink: "#EC4899",
          teal: "#14B8A6",
          orange: "#F97316",
          blue: "#3B82F6",
          red: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["24px", { fontWeight: "500", lineHeight: "1.3" }],
        heading: ["18px", { fontWeight: "600", lineHeight: "1.4" }],
        subheading: ["15px", { fontWeight: "500", lineHeight: "1.5" }],
        body: ["14px", { fontWeight: "400", lineHeight: "1.6" }],
        caption: ["12px", { fontWeight: "400", lineHeight: "1.5" }],
        mono: ["12px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        sidebar: "1px 0 0 #E5E7EB",
      },
      spacing: {
        "4.5": "18px",
        "13": "52px",
        "15": "60px",
        "18": "72px",
      },
    },
  },
  plugins: [],
};

export default config;

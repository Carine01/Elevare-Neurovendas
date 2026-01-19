/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Brand Colors - Elevare NeuroVendas (Indigo Primary Palette)
        brand: {
          // Primary Indigo
          indigo: {
            900: '#312e81', // Dark indigo
            800: '#3730a3', // Medium dark indigo
            700: '#4338ca', // Standard indigo
            600: '#4f46e5', // Primary indigo (#4F46E5)
            500: '#6366f1', // Light indigo
            400: '#818cf8', // Lighter indigo
            300: '#a5b4fc', // Very light indigo
            200: '#c7d2fe', // Pale indigo
            100: '#e0e7ff', // Very pale indigo
            50: '#eef2ff',  // Lightest indigo
          },
          // Gold accent
          gold: {
            900: '#92400e',
            800: '#b45309',
            700: '#d97706',
            600: '#f59e0b',
            500: '#D4A853', // Primary gold (#D4A853)
            400: '#fbbf24',
            300: '#fcd34d',
            200: '#fde68a',
            100: '#fef3c7',
            50: '#fffbeb',
          },
          // Gray text tones
          gray: {
            900: '#111827', // Very dark gray
            800: '#1f2937', // Dark gray (#1F2937)
            700: '#374151',
            600: '#4b5563', // Medium gray (#4B5563)
            500: '#6b7280',
            400: '#9ca3af',
            300: '#d1d5db',
            200: '#e5e7eb',
            100: '#f3f4f6',
            50: '#f9fafb',
          },
        },
        primary: {
          DEFAULT: "#4f46e5", // Indigo primary
          foreground: "#ffffff",
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // Primary
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#D4A853", // Gold accent
          foreground: "#1f2937", // Dark gray text
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#D4A853', // Primary gold
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#92400e',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Gray scale for text
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem", // 12px for buttons
        "2xl": "1rem", // 16px for cards
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        'gradient-accent': 'linear-gradient(135deg, #D4A853 0%, #f59e0b 100%)',
        'gradient-indigo-violet': 'linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #a5b4fc 100%)',
      },
      boxShadow: {
        'indigo-sm': '0 1px 2px 0 rgba(79, 70, 229, 0.05)',
        'indigo': '0 1px 3px 0 rgba(79, 70, 229, 0.1), 0 1px 2px 0 rgba(79, 70, 229, 0.06)',
        'indigo-md': '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)',
        'indigo-lg': '0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05)',
        'indigo-xl': '0 20px 25px -5px rgba(79, 70, 229, 0.1), 0 10px 10px -5px rgba(79, 70, 229, 0.04)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a66c2',
          dark: '#084e96',
          light: '#3b82f6',
        },
        secondary: {
          DEFAULT: '#6b7280',
          dark: '#4b5563',
          light: '#9ca3af',
        },
        success: {
          DEFAULT: '#16a34a',
          dark: '#15803d',
          light: '#22c55e',
        },
        warning: {
          DEFAULT: '#eab308',
          dark: '#ca8a04',
          light: '#facc15',
        },
        danger: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          light: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};

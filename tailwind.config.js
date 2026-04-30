/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        textMain: '#1A1A1A',
        vowlinkGray: '#F9F9F9',
        borderGray: '#E5E5E5'
      },
      fontFamily: {
        mono: ['ui-monospace', 'SF Mono', 'SFMono-Regular', 'IBM Plex Mono', 'monospace'],
      },
      borderWidth: {
        '0.5': '0.5px',
      }
    },
  },
  plugins: [],
}

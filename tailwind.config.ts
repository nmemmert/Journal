import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        journal: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4dba8',
          300: '#ecc270',
          400: '#e5a53e',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          'Georgia',
          'Charter',
          'Bitstream Charter',
          'Sitka Text',
          'Cambria',
          'serif',
        ],
      },
      screens: {
        xs: '390px',
        sm: '428px',
        md: '768px',
        lg: '1024px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top':    'env(safe-area-inset-top)',
      },
      boxShadow: {
        'card':  '0 1px 4px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.05)',
        'card-lg': '0 4px 16px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}

export default config

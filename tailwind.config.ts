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
          50: '#faf8f5',
          100: '#f3ede4',
          200: '#e8ddd0',
          300: '#d4c3ab',
          400: '#b89f83',
          500: '#9d7f5e',
          600: '#7d6047',
          700: '#5e4735',
          800: '#3e2e22',
          900: '#1f1710',
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
        'safe-top': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}

export default config

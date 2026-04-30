import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        red: 'var(--red)',
        'red-dark': 'var(--red-dark)',
        'red-light': 'var(--red-light)',
        offwhite: 'var(--offwhite)',
        ink: 'var(--ink)',
        'ink-mid': 'var(--ink-mid)',
        'ink-soft': 'var(--ink-soft)',
        border: 'var(--border)',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

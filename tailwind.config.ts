import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0F0F0F',
        volt:     '#FFFD02',
        field:    '#F4F4F0',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'volt': '0 0 24px rgba(255,253,2,0.35)',
        'volt-lg': '0 0 40px rgba(255,253,2,0.25)',
      },
    },
  },
  plugins: [],
}

export default config

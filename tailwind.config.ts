import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF7',
        canvas: '#F4F1EA',
        surface: '#FFFDF7',
        elevated: '#FFFFFF',
        border: '#DED7C8',
        rule: '#C8BEAA',
        ink: '#1F2421',
        'text-primary': '#1F2421',
        'text-secondary': '#5D625A',
        'text-muted': '#8D887A',
        accent: '#23684A',
        'accent-dark': '#164531',
        'accent-soft': '#E4EEE6',
        ember: '#B45F2A',
        'ember-soft': '#F3E1D3',
        data: '#315B7A',
        brand: {
          blue: '#23684A',
          teal: '#315B7A',
          'blue-dark': '#164531',
          'teal-dark': '#24445B',
        },
        success: '#23684A',
        warning: '#B45F2A',
        danger: '#A23B3B',
        info: '#315B7A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

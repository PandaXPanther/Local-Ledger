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
        background: '#F7F1E3',
        canvas: '#EFE7D3',
        surface: '#FCF8EE',
        elevated: '#FFFEF9',
        border: '#DFD4BB',
        rule: '#C6B795',
        ink: '#181410',
        cream: '#F3EBD8',
        'text-primary': '#1C1712',
        'text-secondary': '#5C5340',
        'text-muted': '#857A61',
        accent: '#E8540A',
        'accent-dark': '#BC4104',
        'accent-soft': '#F8E2CE',
        'accent-bright': '#FF6A1F',
        ember: '#8C6D1F',
        'ember-soft': '#EFE6C8',
        data: '#33586E',
        machine: '#12100B',
        'machine-panel': '#1D1913',
        'machine-line': '#332C1E',
        up: '#3FA372',
        down: '#E06552',
        brand: {
          blue: '#E8540A',
          teal: '#33586E',
          'blue-dark': '#BC4104',
          'teal-dark': '#24455B',
        },
        success: '#1E6B4A',
        warning: '#8C6D1F',
        danger: '#B3372E',
        info: '#33586E',
      },
      fontFamily: {
        sans: ['Author', 'Fraunces', 'Georgia', 'serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

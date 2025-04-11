import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' }
        }
      },
      animation: {
        'caret-blink': 'caret-blink 1.25s ease-out infinite'
      }
    }
  },
  darkMode: ['class', '[data-theme^="dark-"]'],
  plugins: [
    require('tailwindcss-animate'),
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              '50': '#dfeaff',
              '100': '#b3ccff',
              '200': '#86aeff',
              '300': '#5990ff',
              '400': '#2d72ff',
              '500': '#0054ff',
              '600': '#0045d2',
              '700': '#0037a6',
              '800': '#002879',
              '900': '#00194d',
              foreground: '#fff',
              DEFAULT: '#0054ff'
            }
          }
        },
        dark: {
          colors: {
            primary: {
              '50': '#254329',
              '100': '#3f7145',
              '200': '#599f61',
              '300': '#73cd7d',
              '400': '#93d89a',
              '500': '#b2e4b8',
              '600': '#d2efd5',
              '700': '#f1faf2',
              foreground: '#000',
              DEFAULT: '#599f61'
            }
          }
        }
      },
      layout: {
        fontSize: {
          tiny: '0.75rem',
          small: '0.875rem',
          medium: '1rem',
          large: '1.125rem'
        },
        lineHeight: {
          tiny: '1rem',
          small: '1.25rem',
          medium: '1.5rem',
          large: '1.75rem'
        },
        radius: {
          small: '0.5rem',
          medium: '0.75rem',
          large: '0.875rem'
        },
        borderWidth: {
          small: '1px',
          medium: '2px',
          large: '3px'
        },
        disabledOpacity: '0.5',
        dividerWeight: '1',
        hoverOpacity: '0.9'
      }
    })
  ]
} satisfies Config;

export default config;

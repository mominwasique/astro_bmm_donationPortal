/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#0071bb',
        primaryHover: '#4791c1',
        secondary: '#4791c1',
        secondaryHover: 'rgba(235, 191, 103, 1)',
        text: {
          primary: '#333132',
          secondary: '#113D3E',
        },
      },
    },
  },
  plugins: [],
}

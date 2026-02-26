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
                primary: {
                    DEFAULT: '#B08D57', // Gold/Brass color for Eclat
                    dark: '#8C6F42',
                    light: '#D4B98E',
                },
                secondary: '#1A1A1A',
            },
            fontFamily: {
                hand: ['var(--font-architects)'],
            },
        },
    },
    plugins: [],
};
export default config;

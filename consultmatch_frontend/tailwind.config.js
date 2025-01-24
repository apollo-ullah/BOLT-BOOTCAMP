/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-dark': 'var(--color-primary-dark)',
                'primary': 'var(--color-primary)',
                'primary-light': 'var(--color-primary-light)',
                'primary-lighter': 'var(--color-primary-lighter)',
                secondary: 'var(--color-secondary)',
                'secondary-dark': 'var(--color-secondary-dark)',
            },
            backgroundImage: {
                'gradient-primary': 'var(--gradient-primary)',
                'gradient-hover': 'var(--gradient-hover)',
            },
            textColor: {
                'dark': 'var(--color-text-dark)',
                'light': 'var(--color-text-light)',
                'muted': 'var(--color-text-muted)',
            }
        },
    },
    plugins: [],
} 
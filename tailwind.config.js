/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'eq-bg': '#1a1a1a',
                'eq-primary': '#4a9eff',
                'eq-secondary': '#2d2d2d',
                'eq-border': '#3a3a3a',
                'eq-text': '#e0e0e0',
            },
        },
    },
    plugins: [],
}

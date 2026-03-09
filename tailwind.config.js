/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: "hsl(var(--accent))",
                dark: "hsl(var(--dark))",
                light: "hsl(var(--light))",
            },
            fontFamily: {
                sans: ['DM Sans', 'sans-serif'],
                display: ['Instrument Serif', 'serif'],
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}

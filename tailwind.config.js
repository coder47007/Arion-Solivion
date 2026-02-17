/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Quicksand', 'sans-serif'], // Softer, friendlier font
                display: ['Orbitron', 'sans-serif'], // Kept for the AI/Tech feel
            },
            colors: {
                caribbean: {
                    deep: '#083344',
                    ocean: '#0e7490',
                    turquoise: '#2dd4bf',
                    sand: '#fef3c7',
                    coral: '#fb7185',
                    sun: '#fbbf24',
                }
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-up': 'floatUp 25s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px) rotate(2deg)' },
                },
                floatUp: {
                    '0%': { transform: 'translateY(120vh) rotate(0deg) scale(0.8)', opacity: '0' },
                    '10%': { opacity: '0.6' },
                    '90%': { opacity: '0.6' },
                    '100%': { transform: 'translateY(-20vh) rotate(20deg) scale(1.1)', opacity: '0' },
                }
            }
        },
    },
    plugins: [],
}

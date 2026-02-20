/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#000000',
                secondary: '#1e293b',
                accent: '#d4af37', // Metallic Gold to match logo
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
    layers: {
        components: {
            ".btn": {
                "@apply px-4 py-2 rounded transition-colors": {},
            },
            ".btn-primary": {
                "@apply bg-blue-500 text-white hover:bg-blue-600": {},
            },
            ".btn-secondary": {
                "@apply bg-gray-500 text-white hover:bg-gray-600": {},
            },
            ".btn-danger": {
                "@apply bg-red-500 text-white hover:bg-red-600": {},
            },
            ".btn-success": {
                "@apply bg-green-500 text-white hover:bg-green-600": {},
            },
            ".form-input": {
                "@apply w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent":
                    {},
            },
            ".form-label": {
                "@apply block text-sm font-medium mb-1": {},
            },
            ".error-text": {
                "@apply text-red-500 text-sm mt-1": {},
            },
        },
    },
};

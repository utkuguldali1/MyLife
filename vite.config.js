import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Vite settings: React support + Tailwind CSS
// base: './' makes the built files load from any folder,
// so the app also works on GitHub Pages (e.g. username.github.io/repo-name/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})

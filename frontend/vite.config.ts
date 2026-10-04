import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // React is installed in both the workspace and frontend package trees.
    // Keep linked/parent dependencies on the same React instance as the app.
    dedupe: ['react', 'react-dom'],
  },
})

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  base: "/my-tanks/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'radix-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-switch', '@radix-ui/react-select', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', '@radix-ui/react-label'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false
  }
})

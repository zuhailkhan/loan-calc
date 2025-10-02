import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Generate sourcemaps for production debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Rollup options for optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            return 'vendor';
          }
        },
        // Asset file naming with hash for cache busting
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
    // Minification settings (rolldown has built-in minification)
    minify: true,
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Preview server configuration
  preview: {
    port: 5000,
    strictPort: true,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@service': path.resolve(__dirname, './src/service'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@context': path.resolve(__dirname, './src/context'),
      '@enums': path.resolve(__dirname, './src/enums'),
    }
  },

  // Build optimizations
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production for smaller builds
    minify: 'esbuild',
    target: 'es2015',

    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('gsap')) {
              return 'animations';
            }
            if (id.includes('@preline/collapse')) {
              return 'ui';
            }
          }
        },
      },
    },

    // Compression and size warnings
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: false, // Faster builds
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Listen on all addresses
    open: false,

    // API proxy for development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Preview server (for testing production builds locally)
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false,
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: [],
  },
})

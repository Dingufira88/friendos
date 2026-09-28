import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.FRIENDOS_PAGES === 'true' ? '/friendos/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules[\\/](@rarefriends|viem|@noble|abitype|ox)[\\/]/.test(id)) return 'wallet'
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/node_modules[\\/](zustand|zod)[\\/]/.test(id)) return 'state'
          return 'vendor'
        },
      },
    },
  },
})

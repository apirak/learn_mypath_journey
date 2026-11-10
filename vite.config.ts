import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const abs = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// <MyPath> comes from the sibling repo's source (ADR-0001). dedupe keeps one
// React: the SDK files would otherwise pick up learn_mypath/node_modules/react.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [{ find: /^@learn\/mypath$/, replacement: abs('../learn_mypath/packages/mypath/src/index.ts') }],
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5180, fs: { allow: ['..'] } },
})

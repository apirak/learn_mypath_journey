import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const abs = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// <MyPath> comes from a vendored copy of the SDK source (ADR-0001, `pnpm sync`
// refreshes it). dedupe keeps one React for the SDK files.
export default defineConfig({
  // GitHub Pages serves the build from the root of the custom domain
  // learn-mypath-journey.apirak.com (set in the repo's Pages settings).
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [{ find: /^@learn\/mypath$/, replacement: abs('./vendor/mypath/src/index.ts') }],
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5180 },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Separate build target from the main site: this compiles web/src/sfwidgets/mount.tsx +
// React into ONE self-contained IIFE script (plus one CSS file), suitable for upload as a
// Salesforce Static Resource and loaded into an LWC via lightning/platformResourceLoader.
// Run with: pnpm build:sfwidget (see package.json)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-sfwidget',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/sfwidgets/mount.tsx'),
      name: 'InviteRequestReactWidget',
      formats: ['iife'],
      fileName: () => 'inviteRequestRecordPage.js',
    },
    rollupOptions: {
      output: {
        // No externals — React must be bundled IN, there's no CDN/global React available
        // inside the Salesforce page for it to resolve against.
        assetFileNames: 'inviteRequestRecordPage.[ext]',
      },
    },
  },
})

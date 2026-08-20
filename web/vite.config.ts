import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      mdExtensions: ['.md'],
      mdxExtensions: ['.mdx'],
    }),
    react(),
  ],
  server: {
    // learning/ lives one level above this Vite project's root (repo-root/learning),
    // per instruction.md's repo layout — allow the dev server to read outside web/.
    fs: { allow: ['..'] },
  },
})

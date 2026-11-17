/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH lets the same build serve a user site ("/") or a project site ("/research-portfolio/").
const base = process.env.BASE_PATH ?? '/';

// Canonical/OG URLs. Override with SITE_URL when deploying to a project site or custom domain.
const siteUrl = (process.env.SITE_URL ?? 'https://archowdhury328-cloud.github.io/').replace(/\/?$/, '/');

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    },
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1250,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('@react-three')) return 'r3f';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/data/**', 'src/hooks/**', 'src/components/**', 'src/scenes/SceneShell.tsx', 'src/scenes/SceneBoundary.tsx', 'src/scenes/SceneFallback.tsx'],
      exclude: ['src/data/types.ts'],
      reporter: ['text-summary', 'text', 'json-summary'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 70 },
    },
  },
});

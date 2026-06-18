import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';

export default defineConfig({
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    react(),
    // Please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
    nitro({
      preset: 'netlify',
    }),
  ],
  resolve: {
    alias: {
      tslib: 'tslib/tslib.es6.js',
    },
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
});

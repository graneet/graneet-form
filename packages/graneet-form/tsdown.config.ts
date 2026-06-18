// oxlint-disable-next-line import/no-nodejs-modules
import { copyFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';
import type { InlineConfig } from 'tsdown';

const isProduction = (options: InlineConfig) => options.env?.['NODE_ENV'] === 'production';

export default defineConfig((options) => ({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  exports: true,
  format: ['esm'],
  minify: isProduction(options),
  onSuccess: () => {
    copyFileSync('../../README.md', 'README.md');
  },
  publint: true,
  sourcemap: !isProduction(options),
  splitting: true,
  target: 'es2020',
  treeshake: true,
  watch: !isProduction(options),
}));

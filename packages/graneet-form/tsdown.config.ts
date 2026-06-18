// oxlint-disable-next-line import/no-nodejs-modules
import { copyFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';
import type { Options } from 'tsdown';

const isProduction = (options: Options) => options.env?.['NODE_ENV'] === 'production';

export default defineConfig((options) => ({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  minify: isProduction(options),
  onSuccess: () => {
    copyFileSync('../../README.md', 'README.md');
  },
  sourcemap: !isProduction(options),
  splitting: true,
  target: 'es2020',
  treeshake: true,
  watch: !isProduction(options),
}));

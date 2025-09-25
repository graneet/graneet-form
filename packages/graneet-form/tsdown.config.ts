import { copyFileSync } from 'node:fs';
import { defineConfig, type Options } from 'tsdown';

const isProduction = (options: Options) => options.env?.NODE_ENV === 'production';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2020',
  clean: true,
  splitting: true,
  treeshake: true,
  watch: !isProduction(options),
  sourcemap: !isProduction(options),
  minify: isProduction(options),
  dts: true,
  onSuccess: async () => {
    copyFileSync('../../README.md', 'README.md');
  },
}));

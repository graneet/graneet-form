// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, Options } from 'tsup';

const isProduction = (options: Options) => options.env?.NODE_ENV === 'production';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  splitting: true,
  treeshake: true,
  watch: !isProduction(options),
  sourcemap: !isProduction(options),
  minify: isProduction(options),
  dts: true,
}));

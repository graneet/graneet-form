import { type Options, defineConfig } from 'tsup';

const isProduction = (options: Options) => options.env?.NODE_ENV === 'production';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'es6',
  clean: true,
  splitting: true,
  treeshake: true,
  watch: !isProduction(options),
  sourcemap: !isProduction(options),
  minify: isProduction(options),
  dts: true,
}));

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Runtime tests (none yet, but ready for them).
    include: ['src/**/*.test.{ts,tsx}'],
    typecheck: {
      // Type-level tests written with `expectTypeOf` / `assertType`.
      enabled: true,
      include: ['src/**/*.test-d.{ts,tsx}'],
      tsconfig: './tsconfig.json',
    },
  },
});

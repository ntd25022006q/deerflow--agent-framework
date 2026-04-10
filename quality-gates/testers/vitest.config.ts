import { defineConfig } from 'vitest/config';

/**
 * DEERFLOW Vitest Configuration v1.0
 *
 * Quality Gate Thresholds:
 *   - Lines:      80%
 *   - Functions:  80%
 *   - Branches:   80%
 *   - Statements: 80%
 *
 * Any threshold miss will fail the CI pipeline.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/types/**',
        '**/*.d.ts',
        'tests/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/mocks/**',
        '**/fixtures/**',
        '**/__mocks__/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});

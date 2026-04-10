import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vitest configuration for Next.js projects
 *
 * Features:
 * - jsdom environment for component testing
 * - Path alias resolution matching tsconfig.json
 * - Coverage thresholds: 80% (branches, functions, lines, statements)
 * - Setup files for testing-library matchers
 * - CSS module support
 */
export default defineConfig({
  plugins: [react()],

  test: {
    // ─── Environment ───────────────────────────────────────
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],

    // ─── File Discovery ────────────────────────────────────
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'e2e/**/*',
      '**/*.e2e.{ts,tsx}',
    ],

    // ─── Execution ─────────────────────────────────────────
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    fakeTimers: {
      shouldAdvanceTime: true,
    },

    // ─── Coverage ──────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',

      include: [
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.{ts,js}',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/**/types/*.ts',
        'src/app/layout.tsx',
        'src/app/not-found.tsx',
        'src/app/globals.css',
        'src/middleware.ts',
      ],

      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },

      // Per-file thresholds for strict enforcement
      perFile: true,
    },

    // ─── Snapshot Handling ─────────────────────────────────
    snapshotSerializers: [],

    // ─── Timeout ───────────────────────────────────────────
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },

  // ─── Path Resolution ─────────────────────────────────────
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/lib/hooks'),
      '@/utils': path.resolve(__dirname, './src/lib/utils'),
      '@/api': path.resolve(__dirname, './src/lib/api'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/domain': path.resolve(__dirname, './src/domain'),
      '@/application': path.resolve(__dirname, './src/application'),
      '@/infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@/presentation': path.resolve(__dirname, './src/presentation'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },

  // ─── CSS Handling ────────────────────────────────────────
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});

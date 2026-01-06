import path from 'node:path';
import { defineConfig, type UserConfigExport } from 'vitest/config';

const config: UserConfigExport = defineConfig({
  test: {
    testTimeout: 0,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});

export default config;

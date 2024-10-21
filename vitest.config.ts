import path from 'path';
import { UserConfigExport, defineConfig } from 'vitest/config';

const config: UserConfigExport = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

export default config;

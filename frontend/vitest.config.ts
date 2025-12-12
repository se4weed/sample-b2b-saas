import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig, type ViteUserConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()] as ViteUserConfig['plugins'],
  resolve: {
    alias: {
      '~': path.join(__dirname, 'app/'),
      'spec/': path.join(__dirname, 'spec/'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './spec/setupTests.ts',
    testTimeout: 6000,
    passWithNoTests: true,
  },
})

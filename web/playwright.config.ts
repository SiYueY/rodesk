import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './visual',
  timeout: 120_000,
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://127.0.0.1:5187',
    launchOptions: {
      ...(existsSync('/usr/bin/google-chrome') ? { executablePath: '/usr/bin/google-chrome' } : {}),
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: './node_modules/.bin/vite --host 127.0.0.1 --port 5187 --strictPort',
    url: 'http://127.0.0.1:5187/call',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

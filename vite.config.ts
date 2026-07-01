import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';
import { createPwaPrecachePlugin } from './build/createPwaPrecachePlugin';

export default defineConfig(() => {
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        copy({
          targets: [
            { src: 'README.md', dest: 'dist' },
            { src: 'node_modules/pdfjs-dist/cmaps', dest: 'dist' }
          ],
          hook: 'writeBundle' // Copy after bundle is written
        }),
        createPwaPrecachePlugin()
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      }
    };
});

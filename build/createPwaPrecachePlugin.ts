import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const PRECACHE_TOKEN = 'const PRECACHE_ASSETS = [];';
const VERSION_TOKEN = '__PWA_CACHE_VERSION__';

const shouldPrecache = (fileName: string) => {
  return !fileName.endsWith('.map') && !fileName.endsWith('.html');
};

export const createPwaPrecachePlugin = (): Plugin => {
  let assets: string[] = [];

  return {
    name: 'pdf-to-jpg-pwa-precache',
    apply: 'build',
    generateBundle(_, bundle) {
      assets = Object.values(bundle)
        .map((item) => item.fileName)
        .filter(shouldPrecache)
        .map((fileName) => `./${fileName}`)
        .sort();
    },
    closeBundle() {
      const swPath = path.resolve(process.cwd(), 'dist/sw.js');
      if (!existsSync(swPath)) return;

      const cacheVersion = new Date().toISOString().replace(/[:.]/g, '-');
      const source = readFileSync(swPath, 'utf8')
        .replace(VERSION_TOKEN, cacheVersion)
        .replace(PRECACHE_TOKEN, `const PRECACHE_ASSETS = ${JSON.stringify(assets, null, 2)};`);

      writeFileSync(swPath, source);
    },
  };
};

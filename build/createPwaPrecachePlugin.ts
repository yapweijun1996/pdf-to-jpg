import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const PRECACHE_TOKEN = 'const PRECACHE_ASSETS = [];';
const VERSION_TOKEN = '__PWA_CACHE_VERSION__';

const shouldPrecache = (fileName: string) => {
  return !fileName.endsWith('.map') && !fileName.endsWith('.html');
};

const collectDistFiles = (directory: string, prefix: string): string[] => {
  if (!existsSync(directory)) return [];

  return readdirSync(directory)
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry);
      const relativePath = `${prefix}/${entry}`;

      if (statSync(absolutePath).isDirectory()) {
        return collectDistFiles(absolutePath, relativePath);
      }

      return shouldPrecache(relativePath) ? [`./${relativePath}`] : [];
    })
    .sort();
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

      const cMapAssets = collectDistFiles(path.resolve(process.cwd(), 'dist/cmaps'), 'cmaps');
      const precacheAssets = [...new Set([...assets, ...cMapAssets])].sort();
      const cacheVersion = new Date().toISOString().replace(/[:.]/g, '-');
      const source = readFileSync(swPath, 'utf8')
        .replace(VERSION_TOKEN, cacheVersion)
        .replace(PRECACHE_TOKEN, `const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets, null, 2)};`);

      writeFileSync(swPath, source);
    },
  };
};

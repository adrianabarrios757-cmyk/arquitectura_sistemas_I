import { cp, mkdir } from 'node:fs/promises';
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await cp(new URL('../src/index.js', import.meta.url), new URL('../dist/index.js', import.meta.url));
console.log('Librería compartida compilada en dist/.');

import { cp, mkdir } from 'node:fs/promises';
const dest = new URL('../dist/', import.meta.url);
await mkdir(dest, { recursive: true });
await cp(new URL('../index.html', import.meta.url), new URL('../dist/index.html', import.meta.url));
await cp(new URL('../src/', import.meta.url), new URL('../dist/src/', import.meta.url), { recursive: true });
await mkdir(new URL('../dist/shared/', import.meta.url), { recursive: true });
await cp(new URL('../../../packages/shared/src/index.js', import.meta.url), new URL('../dist/shared/index.js', import.meta.url));
console.log('Frontend preparado en dist/.');

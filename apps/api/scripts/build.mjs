import { cp, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
execFileSync(process.execPath, ['--check', 'src/server.js'], { stdio: 'inherit' });
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await cp(new URL('../src/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
console.log('Backend preparado en dist/.');

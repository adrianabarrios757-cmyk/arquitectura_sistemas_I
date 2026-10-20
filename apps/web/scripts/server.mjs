import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const sharedRoot = resolve(root, '../../packages/shared/src');
const isDist = process.argv.includes('--dist');
const webRoot = isDist ? join(root, 'dist') : root;
const port = Number(process.env.WEB_PORT || 3000);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
  const isShared = pathname.startsWith('/shared/');
  const base = isShared ? (isDist ? join(webRoot, 'shared') : sharedRoot) : webRoot;
  const relative = isShared ? pathname.slice('/shared/'.length) : pathname.slice(1);
  const filename = resolve(base, relative || 'index.html');
  if (filename !== base && !filename.startsWith(base + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    if (!(await stat(filename)).isFile()) throw new Error('Not a file');
    const contents = await readFile(filename);
    res.writeHead(200, { 'Content-Type': `${mime[extname(filename)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(contents);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Archivo no encontrado.');
  }
}).listen(port, () => console.log(`Frontend listo: http://localhost:${port}${isDist ? ' (producción)' : ''}`));

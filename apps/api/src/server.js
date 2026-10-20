import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { CATEGORIES, formatGTQ, inventorySummary, stockStatus, validateProduct } from '@barrios/shared';
import { createStore } from './store.js';

function respond(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function statusPage(products) {
  const total = inventorySummary(products);
  const rows = products.slice(0, 6).map(product => {
    const status = stockStatus(product.stock);
    return `<tr><td>${escapeHtml(product.name)}</td><td>${escapeHtml(product.category)}</td><td>${formatGTQ(product.price)}</td><td>${product.stock}</td><td><span class="tag ${status.tone}">${status.label}</span></td></tr>`;
  }).join('');
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>StockLab API | Estado del servidor</title><style>
    :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b1220;color:#f0f3fb;font-family:Inter,system-ui,Arial,sans-serif}main{max-width:1100px;margin:auto;padding:58px 28px}.eyebrow{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8aa0bf}.top{display:flex;justify-content:space-between;align-items:center;gap:16px}.online{background:#123e35;color:#74e5ba;border:1px solid #246750;border-radius:999px;padding:10px 15px;font-size:13px}h1{font-size:42px;letter-spacing:-1.5px;margin:14px 0}p{color:#9badc7;line-height:1.6}.panel{background:#141f31;border:1px solid #2a364a;border-radius:18px;padding:24px;margin-top:22px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:26px}.metric{background:#17253b;border-radius:14px;padding:21px}.metric small{color:#98abc5}.metric strong{display:block;margin-top:8px;font-size:28px}.accent{color:#6ccab2}table{width:100%;border-collapse:collapse}th{text-align:left;color:#8c9fba;text-transform:uppercase;font-size:11px;letter-spacing:1px}th,td{padding:15px;border-bottom:1px solid #28394f;font-size:13px}tr:last-child td{border:0}.tag{padding:6px 9px;border-radius:8px;white-space:nowrap}.success{background:#164138;color:#7ce9bd}.warning{background:#493a1d;color:#ffc871}.danger{background:#472630;color:#ff97a3}code{color:#88e4ce;background:#243447;border-radius:6px;padding:3px 6px}a{color:#8bead2;text-decoration:none}.foot{font-size:13px;margin-top:25px}@media(max-width:700px){.metrics{grid-template-columns:1fr}h1{font-size:31px}.tablewrap{overflow-x:auto}.top{align-items:flex-start}}
  </style></head><body><main><div class="top"><div class="eyebrow">FERRETERÍA BARRIOS / SERVICIOS</div><span class="online">● Servidor activo</span></div><h1>API de inventario <span class="accent">funcionando.</span></h1><p>Aplicación backend de Node.js · Puerto 3001 · Respuestas JSON y validaciones con la librería <code>@barrios/shared</code>.</p><div class="metrics"><div class="metric"><small>Productos registrados</small><strong>${total.products}</strong></div><div class="metric"><small>Stock bajo o agotado</small><strong>${total.lowStock}</strong></div><div class="metric"><small>Valor de inventario</small><strong>${formatGTQ(total.totalValue)}</strong></div></div><section class="panel"><div class="top"><h2>Vista de datos reales de la API</h2><div class="eyebrow">/api/products</div></div><div class="tablewrap"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Existencia</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div></section><p class="foot">Endpoints: <a href="/api/health">/api/health</a> · <a href="/api/products">/api/products</a> · <a href="/api/summary">/api/summary</a> · <a href="/api/categories">/api/categories</a></p><p class="foot">Los valores de moneda y estados se calculan con la misma librería que utiliza el frontend.</p></main></body></html>`;
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 50000) throw new Error('El cuerpo de la solicitud es muy grande.');
  }
  try { return JSON.parse(body || '{}'); }
  catch { throw new Error('El cuerpo debe ser JSON válido.'); }
}

export function createApiServer({ store = createStore() } = {}) {
  return createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    const match = /^\/api\/products\/(\d+)$/.exec(pathname);
    try {
      if (req.method === 'GET' && pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(statusPage(store.list()));
      } else if (req.method === 'GET' && pathname === '/api/health') {
        respond(res, 200, { ok: true, application: '@barrios/api', sharedLibrary: '@barrios/shared' });
      } else if (req.method === 'GET' && pathname === '/api/products') {
        respond(res, 200, store.list());
      } else if (req.method === 'GET' && pathname === '/api/summary') {
        respond(res, 200, inventorySummary(store.list()));
      } else if (req.method === 'GET' && pathname === '/api/categories') {
        respond(res, 200, CATEGORIES);
      } else if (req.method === 'POST' && pathname === '/api/products') {
        const result = validateProduct(await readJson(req));
        if (!result.valid) { respond(res, 400, { errors: result.errors }); return; }
        respond(res, 201, store.add(result.data));
      } else if (req.method === 'PATCH' && match) {
        const data = await readJson(req);
        const delta = Number(data.delta);
        if (!Number.isInteger(delta) || ![-1, 1].includes(delta)) {
          respond(res, 400, { error: 'delta debe ser 1 o -1.' }); return;
        }
        const result = store.changeStock(Number(match[1]), delta);
        if (result === null) respond(res, 404, { error: 'Producto no encontrado.' });
        else if (result === false) respond(res, 400, { error: 'No se permiten existencias negativas.' });
        else respond(res, 200, result);
      } else if (req.method === 'DELETE' && match) {
        if (!store.remove(Number(match[1]))) respond(res, 404, { error: 'Producto no encontrado.' });
        else { res.writeHead(204); res.end(); }
      } else {
        respond(res, 404, { error: 'Ruta no encontrada.' });
      }
    } catch (error) {
      respond(res, 400, { error: error.message || 'Solicitud incorrecta.' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3001);
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`API lista: http://localhost:${port}`);
    console.log(`Productos: http://localhost:${port}/api/products`);
  });
}

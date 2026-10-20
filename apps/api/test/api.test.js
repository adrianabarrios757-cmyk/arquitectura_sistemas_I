import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApiServer } from '../src/server.js';

async function withApi(callback) {
  const server = createApiServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await callback(base); }
  finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}

test('API responde y utiliza librería compartida', async () => {
  await withApi(async base => {
    const health = await (await fetch(`${base}/api/health`)).json();
    assert.equal(health.ok, true);
    assert.equal(health.sharedLibrary, '@barrios/shared');
    const products = await (await fetch(`${base}/api/products`)).json();
    const summary = await (await fetch(`${base}/api/summary`)).json();
    assert.equal(summary.products, products.length);
    assert.equal(summary.lowStock, 3);
    assert.match(await (await fetch(base)).text(), /Stock bajo/);
  });
});

test('puede agregar y actualizar un producto', async () => {
  await withApi(async base => {
    const created = await fetch(`${base}/api/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Cinta métrica', category: 'Herramientas', price: 35, stock: 2 })
    });
    assert.equal(created.status, 201);
    const product = await created.json();
    const patched = await fetch(`${base}/api/products/${product.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: 1 })
    });
    assert.equal((await patched.json()).stock, 3);
  });
});

test('validaciones y rutas inexistentes', async () => {
  await withApi(async base => {
    const invalid = await fetch(`${base}/api/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X', category: 'Otro', price: -1, stock: -2 })
    });
    assert.equal(invalid.status, 400);
    assert.equal((await fetch(`${base}/sin-ruta`)).status, 404);
    const negative = await fetch(`${base}/api/products/107`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: -1 })
    });
    assert.equal(negative.status, 400);
  });
});

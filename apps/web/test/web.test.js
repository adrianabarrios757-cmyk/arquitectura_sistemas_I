import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardData, filterProducts, productView } from '../src/view-model.js';

const sample = [
  { id: 1, name: 'Martillo', sku: 'HER-01', category: 'Herramientas', price: 100, stock: 8 },
  { id: 2, name: 'Brocha', sku: 'PIN-02', category: 'Pintura', price: 25, stock: 3 },
  { id: 3, name: 'Cable', sku: 'ELE-03', category: 'Electricidad', price: 10, stock: 0 }
];

test('frontend calcula tarjetas mediante la librería compartida', () => {
  const result = dashboardData(sample);
  assert.equal(result.products, 3);
  assert.equal(result.lowStock, 2);
  assert.equal(result.totalValue, 875);
  assert.match(result.totalValueLabel, /875[.,]00/);
});

test('frontend filtra por búsqueda, categoría y estado', () => {
  assert.equal(filterProducts(sample, { query: 'her-01' }).length, 1);
  assert.equal(filterProducts(sample, { category: 'Pintura' }).length, 1);
  assert.equal(filterProducts(sample, { status: 'danger' })[0].name, 'Cable');
});

test('frontend muestra correctamente el estado del producto', () => {
  const result = productView(sample[1]);
  assert.equal(result.status.label, 'Stock bajo');
  assert.match(result.priceLabel, /25[.,]00/);
});

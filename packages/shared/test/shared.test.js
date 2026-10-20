import test from 'node:test';
import assert from 'node:assert/strict';
import { formatGTQ, inventorySummary, stockStatus, validateProduct } from '../src/index.js';

test('moneda de Guatemala', () => {
  assert.match(formatGTQ(125), /125[.,]00/);
});

test('estados de inventario', () => {
  assert.equal(stockStatus(0).label, 'Agotado');
  assert.equal(stockStatus(3).label, 'Stock bajo');
  assert.equal(stockStatus(12).label, 'Disponible');
});

test('resumen de inventario', () => {
  assert.deepEqual(inventorySummary([
    { price: 10, stock: 2 }, { price: 5, stock: 8 }
  ]), { products: 2, units: 10, lowStock: 1, totalValue: 60 });
});

test('validación de productos', () => {
  assert.equal(validateProduct({ name: 'Martillo', category: 'Herramientas', price: 50, stock: 5 }).valid, true);
  assert.equal(validateProduct({ name: 'A', category: 'Otro', price: -5, stock: -1 }).valid, false);
});

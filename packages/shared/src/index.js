/** Funciones compartidas por el frontend y el backend. */
export const CATEGORIES = Object.freeze([
  'Herramientas', 'Materiales', 'Electricidad', 'Pintura'
]);

export const MINIMUM_STOCK = 5;

export function formatGTQ(value) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency', currency: 'GTQ', minimumFractionDigits: 2
  }).format(Number(value) || 0);
}

export function stockStatus(stock) {
  const value = Number(stock);
  if (value <= 0) return { label: 'Agotado', tone: 'danger' };
  if (value <= MINIMUM_STOCK) return { label: 'Stock bajo', tone: 'warning' };
  return { label: 'Disponible', tone: 'success' };
}

export function inventorySummary(products) {
  const list = Array.isArray(products) ? products : [];
  return {
    products: list.length,
    units: list.reduce((acc, item) => acc + Number(item.stock || 0), 0),
    lowStock: list.filter(item => Number(item.stock) <= MINIMUM_STOCK).length,
    totalValue: list.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.stock || 0), 0)
  };
}

export function validateProduct(payload) {
  const errors = [];
  const name = String(payload?.name ?? '').trim();
  const category = String(payload?.category ?? '');
  const price = Number(payload?.price);
  const stock = Number(payload?.stock);

  if (name.length < 2 || name.length > 70) errors.push('El nombre debe tener entre 2 y 70 caracteres.');
  if (!CATEGORIES.includes(category)) errors.push('Seleccione una categoría válida.');
  if (payload?.price === '' || payload?.price == null || !Number.isFinite(price) || price < 0) {
    errors.push('El precio debe ser un número positivo o cero.');
  }
  if (payload?.stock === '' || payload?.stock == null || !Number.isInteger(stock) || stock < 0) {
    errors.push('El stock debe ser un número entero positivo o cero.');
  }

  return { valid: errors.length === 0, errors, data: { name, category, price, stock } };
}

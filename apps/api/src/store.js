export const demoProducts = [
  { id: 101, name: 'Martillo de acero', sku: 'HER-001', category: 'Herramientas', price: 85, stock: 24 },
  { id: 102, name: 'Cemento Portland 42.5 kg', sku: 'MAT-002', category: 'Materiales', price: 93.50, stock: 48 },
  { id: 103, name: 'Taladro inalámbrico', sku: 'HER-003', category: 'Herramientas', price: 785, stock: 4 },
  { id: 104, name: 'Cable eléctrico 12 AWG', sku: 'ELE-004', category: 'Electricidad', price: 8.75, stock: 66 },
  { id: 105, name: 'Pintura látex blanca 1 gal', sku: 'PIN-005', category: 'Pintura', price: 189, stock: 11 },
  { id: 106, name: 'Llave ajustable 10 pulg', sku: 'HER-006', category: 'Herramientas', price: 115, stock: 3 },
  { id: 107, name: 'Tomacorriente doble', sku: 'ELE-007', category: 'Electricidad', price: 32, stock: 0 },
  { id: 108, name: 'Brocha profesional 3 pulg', sku: 'PIN-008', category: 'Pintura', price: 28.50, stock: 19 }
];

export function createStore(initial = demoProducts) {
  let products = structuredClone(initial);
  let nextId = Math.max(100, ...products.map(product => product.id)) + 1;
  return {
    list: () => structuredClone(products),
    find: id => products.find(product => product.id === id),
    add: data => {
      const product = { id: nextId++, sku: `NVO-${String(nextId - 1).padStart(3, '0')}`, ...data };
      products.push(product);
      return structuredClone(product);
    },
    changeStock: (id, quantity) => {
      const product = products.find(item => item.id === id);
      if (!product) return null;
      if (!Number.isInteger(quantity) || product.stock + quantity < 0) return false;
      product.stock += quantity;
      return structuredClone(product);
    },
    remove: id => {
      const before = products.length;
      products = products.filter(product => product.id !== id);
      return products.length !== before;
    }
  };
}

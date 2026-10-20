import { formatGTQ, inventorySummary, stockStatus } from '@barrios/shared';

export function dashboardData(products) {
  const summary = inventorySummary(products);
  return {
    ...summary,
    totalValueLabel: formatGTQ(summary.totalValue),
    productsLabel: String(summary.products),
    unitsLabel: String(summary.units),
    lowStockLabel: String(summary.lowStock)
  };
}

export function filterProducts(products, { query = '', category = '', status = '' } = {}) {
  const search = query.trim().toLocaleLowerCase('es');
  return products.filter(product => {
    const matchesSearch = !search || `${product.name} ${product.sku}`.toLocaleLowerCase('es').includes(search);
    const matchesCategory = !category || product.category === category;
    const matchesStatus = !status || stockStatus(product.stock).tone === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

export function productView(product) {
  return {
    ...product,
    priceLabel: formatGTQ(product.price),
    status: stockStatus(product.stock)
  };
}

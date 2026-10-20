import { CATEGORIES, validateProduct } from '@barrios/shared';
import { dashboardData, filterProducts, productView } from './view-model.js';

const API_URL = window.__API_URL__ || 'http://localhost:3001';
let products = [];
let toastTimer;
const $ = selector => document.querySelector(selector);

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function showToast(message, isError = false) {
  const box = $('#toast');
  box.textContent = message;
  box.className = `toast visible ${isError ? 'error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('visible'), 3300);
}

function render() {
  const data = dashboardData(products);
  $('#stat-products').textContent = data.productsLabel;
  $('#stat-units').textContent = data.unitsLabel;
  $('#stat-low').textContent = data.lowStockLabel;
  $('#stat-value').textContent = data.totalValueLabel;
  $('#sidebar-count').textContent = String(products.length);
  $('#products-title-count').textContent = String(products.length);
  const filtered = filterProducts(products, {
    query: $('#search').value, category: $('#filter-category').value, status: $('#filter-status').value
  });
  $('#table-summary').textContent = `Mostrando ${filtered.length} de ${products.length} productos`;
  $('#products-body').innerHTML = filtered.length ? filtered.map(item => {
    const product = productView(item);
    const initial = escapeHtml(product.name.charAt(0).toUpperCase());
    return `<tr><td><div class="product-cell"><div class="product-icon">${initial}</div><div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)}</small></div></div></td><td><span class="category-pill">${escapeHtml(product.category)}</span></td><td class="price-cell">${escapeHtml(product.priceLabel)}</td><td><span class="stock-count">${product.stock}</span><span class="unit-label"> uds.</span></td><td><span class="stock-badge ${product.status.tone}"><span class="badge-dot">●</span> ${product.status.label}</span></td><td><div class="stock-actions"><button data-action="remove" data-id="${product.id}" title="Disminuir una unidad" aria-label="Disminuir stock de ${escapeHtml(product.name)}">−</button><button data-action="add" data-id="${product.id}" title="Aumentar una unidad" aria-label="Aumentar stock de ${escapeHtml(product.name)}">+</button></div></td></tr>`;
  }).join('') : '<tr><td colspan="6" class="empty-cell">No se encontraron productos con esos filtros.</td></tr>';
}

async function apiFetch(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.error || payload?.errors?.[0] || 'Error en la solicitud.');
  return payload;
}

async function refresh() {
  try {
    products = await apiFetch('/api/products');
    render();
    $('.api-badge').textContent = '● Conectado a API';
    $('.api-badge').classList.remove('disconnected');
  } catch (error) {
    $('.api-badge').textContent = '● Sin conexión a API';
    $('.api-badge').classList.add('disconnected');
    $('#products-body').innerHTML = '<tr><td colspan="6" class="empty-cell">No se pudo conectar a la API. Ejecuta npm run dev desde la raíz.</td></tr>';
    showToast(error.message, true);
  }
}

function toggleModal(open) {
  $('#modal').hidden = !open;
  if (open) $('#product-form [name="name"]').focus();
}

for (const category of CATEGORIES) {
  for (const selector of ['#filter-category', '#new-category']) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    $(selector).append(option);
  }
}

$('#search').addEventListener('input', render);
$('#filter-category').addEventListener('change', render);
$('#filter-status').addEventListener('change', render);
$('#open-form').addEventListener('click', () => toggleModal(true));
$('#close-form').addEventListener('click', () => toggleModal(false));
$('#cancel-form').addEventListener('click', () => toggleModal(false));
$('#modal').addEventListener('click', event => { if (event.target.id === 'modal') toggleModal(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') toggleModal(false); });

$('#product-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const input = Object.fromEntries(form.entries());
  const result = validateProduct(input);
  if (!result.valid) return showToast(result.errors[0], true);
  try {
    await apiFetch('/api/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result.data)
    });
    toggleModal(false);
    event.target.reset();
    $('#search').value = '';
    $('#filter-category').value = '';
    $('#filter-status').value = '';
    await refresh();
    showToast('Producto agregado correctamente.');
  } catch (error) { showToast(error.message, true); }
});

$('#products-body').addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  button.disabled = true;
  try {
    await apiFetch(`/api/products/${button.dataset.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: button.dataset.action === 'add' ? 1 : -1 })
    });
    await refresh();
    showToast('Existencias actualizadas.');
  } catch (error) {
    button.disabled = false;
    showToast(error.message, true);
  }
});

refresh();

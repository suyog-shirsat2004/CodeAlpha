/**
 * api.js — drop this in your project and import it in index.html
 * Connects the Bazaar frontend to the CodeAlpha Express.js backend.
 *
 * Usage: replace the mock PRODUCTS array in index.html with real API calls.
 * Base URL: change BASE_URL to your deployed backend or keep localhost for dev.
 */

const BASE_URL = 'http://localhost:5000/api';

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('token');
export const isLoggedIn = () => !!getToken();

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem('token', data.token);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem('token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  window.location.reload();
}

// ─── Products ──────────────────────────────────────────────────────────────────

/**
 * Fetch products with optional filters.
 * @param {Object} opts - { keyword, category, minPrice, maxPrice, sort, page, limit }
 */
export async function fetchProducts(opts = {}) {
  const params = new URLSearchParams();
  Object.entries(opts).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, v); });

  const res = await fetch(`${BASE_URL}/products?${params}`);
  return res.json();
  // Returns: { success, total, page, pages, products: [...] }
}

export async function fetchProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  return res.json();
}

// ─── Cart (backend cart for logged-in users) ───────────────────────────────────

export async function fetchCart() {
  const res = await fetch(`${BASE_URL}/cart`, { headers: authHeaders() });
  return res.json();
}

export async function addToCartAPI(productId, quantity = 1) {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  return res.json();
}

export async function updateCartItemAPI(itemId, quantity) {
  const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  });
  return res.json();
}

export async function removeCartItemAPI(itemId) {
  const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export async function placeOrderAPI(shippingAddress, paymentMethod = 'COD') {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ shippingAddress, paymentMethod }),
  });
  return res.json();
}

export async function fetchMyOrders() {
  const res = await fetch(`${BASE_URL}/orders/my`, { headers: authHeaders() });
  return res.json();
}

// ─── How to swap mock data for real API ───────────────────────────────────────
/*
  In index.html, replace the setTimeout init block with:

  async function init() {
    // Fetch products from backend
    const { products } = await fetchProducts({ sort: 'newest', limit: 12 });
    window.PRODUCTS = products;   // make available globally
    renderCategories();
    renderProducts();

    // If user is logged in, load their backend cart
    if (isLoggedIn()) {
      const { cart: backendCart } = await fetchCart();
      cart = backendCart.items.map(i => ({
        id:    i.product._id,
        qty:   i.quantity,
        itemId: i._id,       // needed for update/remove calls
      }));
      updateCartBadge();
      renderCart();
    }
  }

  init();
*/

# CodeAlpha E-Commerce Store

Full-stack e-commerce application with a Django REST API backend and a responsive HTML/CSS/JS frontend deployed on GitHub Pages.

**Live site:** [https://suyog-shirsat2004.github.io/CodeAlpha/](https://suyog-shirsat2004.github.io/CodeAlpha/)

---

## Live Demo

| Page | URL |
|------|-----|
| Live App | [https://suyog-shirsat2004.github.io/CodeAlpha/](https://suyog-shirsat2004.github.io/CodeAlpha/) |
| Backend API | `https://codealpha-ecommerce-backend.onrender.com` *(deploy `backend/` to Render)* |
| GitHub Repo | [View on GitHub](https://github.com/suyog-shirsat2004/CodeAlpha/tree/main/task-1%20Simple%20E-commerce%20Store) |

---

## Features

### Frontend (fully functional on GitHub Pages via localStorage)

- **Product catalog** — 12 mock products displayed in a responsive grid with images, prices, ratings, and badges
- **Search & filter** — real-time search by name, category filter buttons (All / Apparel / Accessories / Footwear / Fitness / Lifestyle / Bags / Electronics), price range slider (₹0–₹5,000)
- **Sort** — by newest, price low-to-high, price high-to-low, rating, name A–Z
- **Shopping cart** — slide-out drawer, quantity increment/decrement, per-item total, subtotal + shipping, "Proceed to Checkout" button
- **Wishlist** — heart icon toggle on product cards, persisted to localStorage
- **Auth system** — register/login modal with name/email/password fields, session stored in localStorage
- **Checkout flow** — modal with shipping form (name, street, city, state, pincode, phone), validates all fields, creates order with unique ID
- **Order history** (tab in single-page app) — click "Orders" in nav to toggle between shop and order views; shows user card with avatar/name/email, full order list with items, quantities, prices, subtotal, shipping, grand total, delivery address, phone, and order status
- **Toast notifications** — success/error feedback overlays
- **Responsive design** — mobile-first layout adapts to all screen sizes
- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript; single-file architecture (everything in `index.html`)

### Backend (Django REST API — run locally)

- **Auth** — register, login (JWT), get profile, change password
- **Products** — list, detail, create, update, delete, search, filter by category, sort
- **Reviews** — list, create (authenticated users only)
- **Cart** — get, add item, update qty, remove item, clear
- **Orders** — place (authenticated, with stock check), my orders, list all (admin), update status, cancel
- **Seed command** — populates 6 products + admin user

---

## Quick Start

### Frontend (standalone — no backend needed)

```bash
cd frontend
npx serve .
```

Open `http://localhost:3000`. All data (cart, wishlist, orders, auth) is stored in your browser's localStorage.

### Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver 0.0.0.0:5000
```

API at `http://localhost:5000/api/`

### Admin Credentials (after running seed)

- **Email:** `admin@codealpha.com`
- **Password:** `Admin@123`

---

## Project Structure

```
task-1 Simple E-commerce Store/
├── backend/                  # Django REST API
│   ├── api/
│   │   ├── management/commands/
│   │   │   └── seed.py      # Database seeder (6 products + admin)
│   │   ├── __init__.py
│   │   ├── admin.py          # Admin panel config
│   │   ├── apps.py
│   │   ├── models.py         # User, Product, Review, Cart, CartItem, Order, OrderItem
│   │   ├── serializers.py    # DRF serializers
│   │   ├── urls.py           # All API endpoint routes (20+)
│   │   └── views.py          # All view functions (auth, products, cart, orders)
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
└── frontend/                 # Static HTML/CSS/JS (deployed to GitHub Pages)
    ├── index.html            # Single-page app: shop + orders tabs (product grid, cart, wishlist, auth, checkout, order history)
    └── api.js                # Backend API client functions (unused while backend is local)
```

---

## Design

- **Unified light palette** — soft blue accent (`#5b9bd5`) on white backgrounds, minimal color variety
- **Single accent color** — all interactive elements (buttons, links, badges, statuses) use the same blue, removing the previous gold/yellow multi-color scheme
- **Subtle surfaces** — backgrounds and cards use the lightest grays (`#f8f8fa`, `#f0f0f2`) for a clean, airy feel
- **Soft borders & shadows** — reduced opacity on all borders and overlays for a gentler visual hierarchy
- **Consistent type** — Playfair Display headings + DM Sans body text throughout

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (vanilla), JavaScript (vanilla) |
| Backend | Python, Django, Django REST Framework |
| Database | SQLite (local) |
| Auth | localStorage mock (frontend) / JWT (backend) |
| Deployment | GitHub Pages (frontend), Render (backend — pending) |

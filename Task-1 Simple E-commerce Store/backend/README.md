# CodeAlpha E-Commerce — Django Backend

Full REST API for a complete e-commerce store with JWT auth, products, cart, and orders.

## Tech Stack
- **Python + Django** — server framework
- **SQLite** — database (zero configuration)
- **Django REST Framework** — API views & serializers
- **SimpleJWT** — JWT authentication
- **django-cors-headers** — CORS support

---

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run migrations (creates SQLite database)
```bash
python manage.py migrate
```

### 3. Seed the database (adds sample products + admin user)
```bash
python manage.py seed
# Admin login: admin@codealpha.com / Admin@123
```

### 4. Start the server
```bash
python manage.py runserver 0.0.0.0:5000
```

Server runs on `http://localhost:5000` — API at `http://localhost:5000/api/`

---

## Run Frontend (separate terminal)

```bash
cd 'Task-1 Simple E-commerce Store\frontend'
npx serve .
```

Open the URL shown (usually `http://localhost:3000`).

---

## Project Structure

```
backend/
├── config/
│   ├── __init__.py
│   ├── settings.py     # Django settings
│   ├── urls.py         # Root URL config
│   └── wsgi.py
├── api/
│   ├── models.py       # User, Product, Cart, Order, Review
│   ├── serializers.py  # DRF serializers
│   ├── views.py        # All API views
│   ├── urls.py         # API routes
│   ├── permissions.py  # Custom permissions
│   ├── admin.py        # Admin panel config
│   └── management/
│       └── commands/
│           └── seed.py # Database seeder
├── media/              # Uploaded files
├── db.sqlite3          # SQLite database (auto-created)
├── manage.py
└── requirements.txt
```

---

## API Reference

> All protected routes require: `Authorization: Bearer <token>`

### Auth  `/api/auth/`

| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | `/register/`         | ❌    | Register new user        |
| POST   | `/login/`            | ❌    | Login, get JWT token     |
| GET    | `/me/`               | ✅    | Get logged-in user       |
| PUT    | `/me/update/`        | ✅    | Update name / address    |
| PUT    | `/change-password/`  | ✅    | Change password          |

**Register body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "admin@codealpha.com", "password": "Admin@123" }
```

**Login response:**
```json
{ "success": true, "token": "eyJ...", "user": { "id": 1, "name": "Admin", "role": "admin" } }
```

---

### Products  `/api/products/`

| Method | Endpoint                  | Auth        | Description                    |
|--------|---------------------------|-------------|--------------------------------|
| GET    | `/`                       | ❌           | List all products (with filter)|
| GET    | `/categories/`            | ❌           | Get all distinct categories    |
| GET    | `/<id>/`                  | ❌           | Get single product             |
| POST   | `/create/`                | 🔒 Admin    | Create product                 |
| PUT    | `/<id>/update/`           | 🔒 Admin    | Update product                 |
| DELETE | `/<id>/delete/`           | 🔒 Admin    | Delete product                 |
| POST   | `/<id>/reviews/`          | ✅ User     | Add review                     |

**Query params for GET /:**
- `keyword` — search in name
- `category` — filter by category
- `minPrice`, `maxPrice` — price range
- `sort` — `newest`, `oldest`, `price-asc`, `price-desc`, `rating`
- `page`, `limit` — pagination (default: page=1, limit=12)

**Example:** `GET /api/products/?keyword=shoes&category=Footwear&sort=price-asc&page=1&limit=6`

---

### Cart  `/api/cart/`

All routes require user login.

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/`                   | Get current user's cart  |
| POST   | `/add/`               | Add item to cart         |
| PUT    | `/<itemId>/`          | Update item quantity     |
| DELETE | `/<itemId>/remove/`   | Remove single item       |
| DELETE | `/clear/`             | Clear entire cart        |

**Add to cart body:**
```json
{ "product_id": 1, "quantity": 2 }
```

**Update item body:**
```json
{ "quantity": 3 }
```

---

### Orders  `/api/orders/`

| Method | Endpoint             | Auth       | Description               |
|--------|----------------------|------------|---------------------------|
| POST   | `/`                  | ✅ User    | Place order from cart     |
| GET    | `/my/`               | ✅ User    | Get my orders             |
| GET    | `/<id>/`             | ✅ User    | Get single order          |
| GET    | `/all/`              | 🔒 Admin   | Get all orders            |
| PUT    | `/<id>/status/`      | 🔒 Admin   | Update order status       |
| PUT    | `/<id>/cancel/`      | ✅ User    | Cancel my order           |

**Place order body:**
```json
{
  "shipping_name": "John Doe",
  "shipping_street": "42 MG Road",
  "shipping_city": "Mumbai",
  "shipping_state": "Maharashtra",
  "shipping_pincode": "400001",
  "shipping_phone": "9876543210",
  "payment_method": "COD"
}
```

**Update status body (admin):**
```json
{ "order_status": "Shipped" }
```
Valid statuses: `Processing → Confirmed → Shipped → Delivered`  or  `Cancelled`

---

## Live Demo

🌐 **Frontend:** `https://codealpha-ecommerce-frontend.netlify.app` *(coming soon — deploy index.html to Netlify)*
🔧 **Backend API:** `https://codealpha-ecommerce-backend.onrender.com` *(coming soon — deploy to Render)*

---

## Default Admin Credentials (after seed)
- **Email:** admin@codealpha.com
- **Password:** Admin@123

# 🛍️ CodeAlpha E-Commerce Store

Full-stack e-commerce application with a Django REST API backend and a responsive HTML/CSS/JS frontend.

## 🔗 Live Demo

- **Frontend (GitHub Pages):** [https://suyog-shirsat2004.github.io/CodeAlpha/](https://suyog-shirsat2004.github.io/CodeAlpha/)
- **Orders Page:** [https://suyog-shirsat2004.github.io/CodeAlpha/orders.html](https://suyog-shirsat2004.github.io/CodeAlpha/orders.html)
- **Backend API:** `https://codealpha-ecommerce-backend.onrender.com` *(deploy `backend/` to Render)*
- **GitHub:** [https://github.com/suyog-shirsat2004/CodeAlpha/tree/main/task-1%20Simple%20E-commerce%20Store](https://github.com/suyog-shirsat2004/CodeAlpha/tree/main/task-1%20Simple%20E-commerce%20Store)

## 🚀 Quick Start

### Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver 0.0.0.0:5000
```

API at `http://localhost:5000/api/`

### Frontend

```bash
cd frontend
npx serve .
```

Open `http://localhost:3000` in your browser.

### Admin Credentials (after seed)

- **Email:** admin@codealpha.com
- **Password:** Admin@123

---

## 📁 Project Structure

```
task-1 Simple E-commerce Store/
├── backend/          # Django REST API
│   ├── api/          # App: models, views, serializers, urls
│   ├── config/       # Django project settings
│   ├── manage.py
│   └── requirements.txt
└── frontend/         # Static HTML/CSS/JS
    ├── index.html     # Main shop page
    ├── orders.html    # Order history page
    └── api.js         # Backend API client
```

## ✨ Features

- Product listing with search, filter, sort & pagination
- Shopping cart with quantity controls
- Wishlist (persisted to localStorage)
- User registration & JWT login
- Order placement with stock management
- Admin product & order management
- Responsive design (mobile-first)
- Toast notifications

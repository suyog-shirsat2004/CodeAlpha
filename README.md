# CodeAlpha — Full-Stack Development Internship

A collection of 4 full-stack web applications built during the CodeAlpha internship. Each task increases in complexity from a vanilla e-commerce store to a real-time communication app with WebRTC video calling.

---

## Tasks Overview

| # | Project | Frontend | Backend | Database | Auth | Live Demo |
|---|---------|----------|---------|----------|------|-----------|
| 1 | [Simple E-commerce Store](./Task-1%20Simple%20E-commerce%20Store/) | HTML/CSS/JS | Django + DRF (Python) | SQLite | JWT | [Demo](https://suyog-shirsat2004.github.io/CodeAlpha/Task-1/) |
| 2 | [Social Media Platform (ShareSphere)](./Task-2%20Social%20Media%20Platform/) | HTML/CSS/JS + Bootstrap 5 | Express.js (Node) | JSON file / localStorage | Session / Mock | [Demo](https://suyog-shirsat2004.github.io/CodeAlpha/Task-2/) |
| 3 | [Project Management Tool](./Task-3-Project-Management-Tool/) | React 18 + Tailwind CSS | Express.js (Node) | SQLite | JWT | [Demo](https://suyog-shirsat2004.github.io/CodeAlpha/Task-3/) |
| 4 | [Real-Time Communication App](./Task-4-Real-Time-Communication-App/) | React 18 + Tailwind CSS | Express.js + Socket.io (Node) | SQLite | JWT | [Demo](https://suyog-shirsat2004.github.io/CodeAlpha/Task-4/) |

---

## Task 1 — Simple E-commerce Store

Full-stack e-commerce app ("Bazaar") with product catalog, cart, wishlist, checkout, order history, and Django admin panel.

**Stack:** Django REST Framework, SQLite, vanilla HTML/CSS/JS  
**Setup:** `cd Task-1\ Simple\ E-commerce\ Store/backend && pip install -r requirements.txt && python manage.py migrate && python manage.py seed && python manage.py runserver`

[→ View details](Task-1%20Simple%20E-commerce%20Store/README.md)

---

## Task 2 — Social Media Platform (ShareSphere)

Full-stack social media app with user profiles, posts, comments, likes, follows, media uploads, and session-based auth. Includes a mock API mode for client-only operation.

**Stack:** Express.js, vanilla HTML/CSS/JS + Bootstrap 5  
**Setup:** `cd Task-2\ Social\ Media\ Platform/backend && npm install && node server.js`  
**Mock mode:** `cd Task-2\ Social\ Media\ Platform/frontend && npx serve .`

[→ View details](Task-2%20Social%20Media%20Platform/README.md)

---

## Task 3 — Project Management Tool

Kanban-style project management tool with drag-and-drop boards, team collaboration, task priorities, due dates, and dark/light mode.

**Stack:** React 18, Tailwind CSS, Express.js, SQLite, JWT  
**Setup:** `cd Task-3-Project-Management-Tool/backend && npm install && npm run dev` and `cd Task-3-Project-Management-Tool/frontend && npm install && npm start`  
**Standalone (no backend):** The GitHub Pages demo uses a localStorage-based mock API — works fully client-side.

[→ View details](Task-3-Project-Management-Tool/README.md)

---

## Task 4 — Real-Time Communication App

Multi-user video conferencing app with WebRTC, screen sharing, collaborative whiteboard, encrypted file sharing, and real-time chat.

**Stack:** React 18, Tailwind CSS, Express.js + Socket.io, WebRTC, SQLite, JWT, AES-256 encryption  
**Setup:** `cd Task-4-Real-Time-Communication-App/backend && npm install && npm run dev` and `cd Task-4-Real-Time-Communication-App/frontend && npm install && npm start`

[→ View details](Task-4-Real-Time-Communication-App/README.md)

---

## Deployment

All four frontends are deployed via GitHub Pages from the [`docs/`](./docs/) directory.

| Task | URL |
|------|-----|
| Task 1 | [suyog-shirsat2004.github.io/CodeAlpha/Task-1/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-1/) |
| Task 2 | [suyog-shirsat2004.github.io/CodeAlpha/Task-2/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-2/) |
| Task 3 | [suyog-shirsat2004.github.io/CodeAlpha/Task-3/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-3/) |
| Task 4 | [suyog-shirsat2004.github.io/CodeAlpha/Task-4/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-4/) |

---

**Author:** Suyog Madhav Shirsat

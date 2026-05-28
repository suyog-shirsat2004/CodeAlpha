# ProjectFlow — Project Management Tool

A full-stack **Kanban-style Project Management Tool** built with **Express, React, SQLite, and Node.js**.

**Live demo:** [suyog-shirsat2004.github.io/CodeAlpha/Task-3/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-3/) *(runs entirely in-browser with mock API — no backend needed)*

> **Task 3** — Collaborative tool similar to Trello/Asana with drag-and-drop boards, team collaboration, task assignments, and commenting.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based registration & login
- Protected routes (frontend + backend)
- Persisted auth state with localStorage

### 📊 Dashboard
- Overview of all your projects
- Project statistics (total, active, completed)
- Create / delete projects with color picker
- Dark / Light mode toggle

### 🎯 Kanban Board
- 4 columns: **To Do**, **In Progress**, **Review**, **Done**
- Drag and drop tasks between columns
- Real-time status updates

### 📋 Task Management
- Create, edit, and delete tasks
- Assign tasks to team members
- Priority levels (Low, Medium, High, Urgent)
- Due dates with visual overdue indicators
- Detailed description

### 💬 Comments
- Add comments to any task
- See who commented and when

### 👥 Team Collaboration
- Add / remove team members from projects
- Search users by name or email
- View project members with avatar initials

---

## 🏗 Project Structure

```
Task-3-Project-Management-Tool/
│
├── frontend/              # React App (Bootstrap 5)
│   ├── src/
│   │   ├── components/    # Navbar, TaskCard, TaskModal, AddMemberModal
│   │   ├── context/       # AuthContext
│   │   ├── services/      # API client + full mock API + seed data
│   │   ├── pages/         # Login, Register, Dashboard, ProjectBoard
│   │   └── ...
│   ├── public/
│   ├── build/             # Production build (deployed to GitHub Pages)
│   └── package.json
│
├── backend/               # Express API Server
│   ├── config/            # DB connection, env keys
│   ├── controllers/       # auth, project, task, comment logic
│   ├── middleware/         # JWT auth middleware
│   ├── models/            # User, Project, Task, Comment schemas
│   ├── routes/            # API route definitions
│   ├── server.js          # Entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 How to Run

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

---

### Demo Mode (No Backend Required)

The app auto-detects when running on GitHub Pages / Vercel / Netlify and uses a **full mock API** backed by `localStorage`. Demo users are seeded on first visit:

| User  | Email           | Password |
|-------|-----------------|----------|
| kiran | kiran@demo.com  | 123456   |
| rahul | rahul@demo.com  | 123456   |
| sonu  | sonu@demo.com   | 123456   |

---

### Step 1: Start the Backend (Terminal 1)

```bash
cd "Task-3-Project-Management-Tool/backend"
npm install
npm run dev
```

Wait for: `Server running on port 5000`

---

### Step 2: Start the Frontend (Terminal 2)

```bash
cd "Task-3-Project-Management-Tool/frontend"
npm install
npm start
```

Open `http://localhost:3000` in your browser.

> **Note:** On `localhost` the app connects to the real backend. To force mock mode, set `REACT_APP_USE_MOCK=true`.

---

### Step 3: Using the App

1. **Register** a new account (or use demo users in mock mode)
2. **Create a Project** from the dashboard
3. **Add Team Members** — search for other users and add them inside a project
4. **Create Tasks** using the **+** button on any Kanban column
5. **Drag & Drop** tasks between columns to update status
6. **Click a task** to edit details, assign it, set a due date, or add comments

---

### Quick Reference

| Terminal | Where | Command | Runs On |
|----------|-------|---------|---------|
| **#1** | `backend/` | `npm run dev` | `http://localhost:5000` |
| **#2** | `frontend/` | `npm start` | `http://localhost:3000` |

---

### Environment Variables (`backend/.env`)

```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_in_production
```

### Environment Variables (`frontend/.env`)

```
REACT_APP_USE_MOCK=true          # Force mock API mode
REACT_APP_API_URL=http://localhost:5000/api  # Custom backend URL
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/profile` | Update user profile |
| GET | `/api/auth/search?q=` | Search users by name or email |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project (cascading) |
| POST | `/api/projects/:id/members` | Add a member |
| DELETE | `/api/projects/:id/members/:userId` | Remove a member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:projectId` | Get all tasks for a project |
| POST | `/api/tasks/project/:projectId` | Create a task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| PUT | `/api/tasks/reorder` | Batch reorder tasks |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/task/:taskId` | Get comments for a task |
| POST | `/api/comments/task/:taskId` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router v6, Bootstrap 5, Axios, react-hot-toast, date-fns |
| **Backend** | Node.js, Express.js, JWT (jsonwebtoken), bcryptjs, better-sqlite3 |
| **Database** | SQLite (file-based, zero config) |
| **Mock API** | Full localStorage-based mock (auto-detects GitHub Pages) |
| **Auth** | JWT (JSON Web Tokens) |
| **Drag & Drop** | HTML5 Drag and Drop API |

---

## ✅ Completed Requirements

- [x] Create group projects
- [x] Assign tasks to team members
- [x] Comment and communicate within tasks
- [x] Full-stack with authentication system
- [x] Kanban project boards with drag-and-drop
- [x] Backend to manage users, projects, tasks, comments
- [x] Priority levels and due dates
- [x] Dark / Light mode
- [x] User search and team management

# Project Management Tool

A full-stack **Kanban-style Project Management Tool** built with **Express, React, SQLite, and Node.js**.

**Live demo:** [suyog-shirsat2004.github.io/CodeAlpha/Task-3/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-3/) *(frontend UI — run backend locally for full features)*

> **Task 3** — Collaborative tool similar to Trello/Asana with drag-and-drop boards, team collaboration, task assignments, and commenting.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based registration & login
- Protected routes (frontend + backend)
- Persisted auth state with localStorage

### 📊 Dashboard
- Overview of all your projects
- Project statistics (total tasks, completed, overdue)
- Create / delete projects
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
- Detailed description & subtasks

### 💬 Comments
- Add comments to any task
- See who commented and when

### 👥 Team Collaboration
- Add / remove team members from projects
- Search users by name or email
- View project members

---

## 🏗 Project Structure

```
Task-3-Project-Management-Tool/
│
├── frontend/              # React App (Tailwind CSS)
│   ├── src/
│   │   ├── components/    # Navbar, TaskCard, TaskModal, etc.
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Login, Register, Dashboard, ProjectBoard
│   │   └── ...
│   ├── public/
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

---

### Step 3: Using the App

1. **Register** a new account
2. **Create a Project** from the dashboard
3. **Add Team Members** — register another user (incognito), then search and add them inside a project
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

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user (protected) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |
| POST | `/api/projects/:id/members` | Add a member |
| DELETE | `/api/projects/:id/members/:userId` | Remove a member |
| GET | `/api/projects/search-users` | Search users by name/email |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | Get all tasks for a project |
| POST | `/api/projects/:projectId/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:taskId/comments` | Get comments for a task |
| POST | `/api/tasks/:taskId/comments` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Axios, react-hot-toast, react-icons, date-fns |
| **Backend** | Node.js, Express.js, JWT (jsonwebtoken), bcryptjs, better-sqlite3 |
| **Database** | SQLite (file-based, zero config) |
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

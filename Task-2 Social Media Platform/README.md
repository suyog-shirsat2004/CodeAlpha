# ShareSphere — Social Media Platform

Full-stack social media application with an Express.js backend and a responsive HTML/CSS/JS frontend.

**Live site:** [suyog-shirsat2004.github.io/CodeAlpha/Task-2/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-2/) *(frontend only — run backend locally for full features)*

---

## Live Demo

| Page | URL |
|------|-----|
| Live App | [suyog-shirsat2004.github.io/CodeAlpha/Task-2/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-2/) *(frontend only)* |
| GitHub Repo | [View on GitHub](https://github.com/suyog-shirsat2004/CodeAlpha/tree/main/Task-2%20Social%20Media%20Platform) |
| Home / Feed | `http://localhost:3000/` |
| Profile | `http://localhost:3000/profile.html` |
| Login / Register | `http://localhost:3000/login.html` |

---

## Features

### User Profiles
- Profile image upload (avatar with camera button on hover)
- Display name, username, and bio
- Followers & following counts with clickable lists
- Follow / Unfollow button on other users' profiles
- Edit profile (display name, bio) with emoji picker

### Posts & Comments
- Create posts with text content
- Upload images (jpg, png, gif, webp) and videos (mp4, webm)
- Embed media via URL (image or video URL)
- Drag-and-drop media upload support
- Preview media before posting
- Edit own posts (text content + media URL)
- Delete own posts
- Like/unlike posts with confetti animation
- Add comments on posts
- Delete comments (comment author or post author)

### Follow System
- Follow / Unfollow users from profile page
- Suggested users sidebar on feed with quick follow toggle
- Click stats to view Following / Followers lists
- Unfollow from within Following list modal

### Feed
- Chronological feed showing posts from followed users + own posts
- Emoji picker for post content and bio editing
- Responsive two-column layout (feed + suggested users)

### Authentication
- Register with username and password
- Login / Logout with session-based auth
- Protected routes redirect to login page

---

## Quick Start

### Frontend (standalone — no backend needed)

```bash
cd frontend
npx serve .
```

Open `http://localhost:3000`. The landing page will show, but features requiring the backend (auth, feed, posts, comments, likes, follows) will not work.

### Backend & Frontend (single server — full features)

```bash
cd backend
npm install
node server.js
```

Open `http://localhost:3000`. The Express server serves both the REST API and the static frontend files.


## Project Structure

```
Task-2 Social Media Platform/
├── backend/
│   ├── server.js           # Express server (API + static file serving)
│   ├── package.json        # Dependencies
│   ├── db.json             # JSON file database (users, posts, comments, follows, likes)
│   └── uploads/            # Uploaded media files (avatars, post images/videos)
└── frontend/
    ├── index.html           # Home / Feed page (post creator, feed, suggested users, landing)
    ├── login.html           # Login / Register page
    ├── profile.html         # Profile page (hero, edit profile, posts/likes tabs, follow modals)
    ├── css/
    │   └── style.css        # Complete stylesheet (animations, responsive, variables)
    └── js/
        └── app.js           # Frontend application logic (auth, feed, profile, posts, comments)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (vanilla), JavaScript (vanilla), Bootstrap 5.3, Bootstrap Icons |
| Backend | Node.js, Express.js |
| Database | JSON file (`db.json`) |
| File Uploads | Multer (disk storage) |
| Auth | express-session (cookie-based sessions) |
| Animations | CSS keyframes (confetti, particles, fade-in, glow) |


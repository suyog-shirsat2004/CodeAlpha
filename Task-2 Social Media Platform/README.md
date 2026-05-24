# ShareSphere — Social Media Platform

Full-stack social media application with an Express.js backend and a responsive HTML/CSS/JS frontend.

**Live site:** *(requires local server — see Quick Start below)*

---

## Live Demo

| Page | URL |
|------|-----|
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

### Backend & Frontend (single server)

```bash
cd backend
npm install
node server.js
```

Open `http://localhost:3000` in your browser. The Express server serves both the REST API and the static frontend files.

---

## Test Accounts

| Username | Password | Display Name |
|----------|----------|-------------|
| `suyog2004` | `suyog2004` | suyog2004 |
| `rahuljadhav` | `pass123` | Rahul Jadhav |
| `pranavpatil2423` | `pass123` | Pranav Patil |
| `kiranshinde0806` | `pass123` | Kiran Shinde |
| `kartiki2321` | `pass123` | Kartiki |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Register new user |
| POST | `/api/login` | No | Login |
| POST | `/api/logout` | No | Logout |
| GET | `/api/me` | Yes | Get current user |
| GET | `/api/users` | No | List all users |
| GET | `/api/users/:id` | No | Get user profile |
| GET | `/api/users/:id/following` | No | Get users followed by :id |
| GET | `/api/users/:id/followers` | No | Get followers of :id |
| PUT | `/api/profile` | Yes | Update profile (displayName, bio) |
| POST | `/api/upload-avatar` | Yes | Upload profile image |
| POST | `/api/follow/:id` | Yes | Follow user |
| POST | `/api/unfollow/:id` | Yes | Unfollow user |
| POST | `/api/posts` | Yes | Create post |
| PUT | `/api/posts/:id` | Yes | Edit own post |
| GET | `/api/posts/feed` | Yes | Get feed (followed + own posts) |
| GET | `/api/posts/user/:userId` | No | Get posts by user |
| GET | `/api/posts/liked/:userId` | No | Get liked posts by user |
| DELETE | `/api/posts/:id` | Yes | Delete own post |
| POST | `/api/upload` | Yes | Upload media file |
| POST | `/api/like/:postId` | Yes | Like post |
| POST | `/api/unlike/:postId` | Yes | Unlike post |
| GET | `/api/comments/:postId` | No | Get comments on post |
| POST | `/api/comments/:postId` | Yes | Add comment |
| DELETE | `/api/comments/:commentId` | Yes | Delete comment (author or post owner) |

---

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

---

## Design

- **Warm orange accent** (`#ff6b35`) as primary interactive color
- **Purple-blue gradient** (`#a855f7` → `#3b82f6`) for brand identity
- **Dark teal backgrounds** (`#004e64`) for hero sections with contrast
- **Cream background** (`#fdf6ed`) for page body with warm card surfaces
- **Fredoka** headings + **Inter** body text for modern, friendly typography
- **Glassmorphism navbar** with backdrop blur and animated gradient border
- **Particle effects** in hero sections + **confetti** on likes

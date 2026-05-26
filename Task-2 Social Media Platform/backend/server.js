const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 8) + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  }
});

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'social-key-2024',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(UPLOADS_DIR));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  next();
}

/* ---- AUTH ---- */
app.post('/api/register', (req, res) => {
  const { username, password, displayName, bio } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const db = readDB();
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username taken' });
  }

  const user = { id: id(), username, password, displayName: displayName || username, bio: bio || '', avatar: '' };
  db.users.push(user);
  writeDB(db);
  req.session.userId = user.id;
  res.json({ user: { id: user.id, username: user.username, displayName: user.displayName } });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  req.session.userId = user.id;
  res.json({ user: { id: user.id, username: user.username, displayName: user.displayName } });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, username: user.username, displayName: user.displayName, bio: user.bio, avatar: user.avatar } });
});

/* ---- USERS ---- */
app.get('/api/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const followerCount = db.follows.filter(f => f.followingId === user.id).length;
  const followingCount = db.follows.filter(f => f.followerId === user.id).length;
  const isFollowing = req.session.userId ? db.follows.some(f => f.followerId === req.session.userId && f.followingId === user.id) : false;

  res.json({ user: { id: user.id, username: user.username, displayName: user.displayName, bio: user.bio, avatar: user.avatar, followerCount, followingCount, isFollowing } });
});

app.get('/api/users', (req, res) => {
  const db = readDB();
  let users = db.users.map(u => ({
    id: u.id, username: u.username, displayName: u.displayName, bio: u.bio, avatar: u.avatar,
    followerCount: db.follows.filter(f => f.followingId === u.id).length,
    isFollowing: req.session.userId ? db.follows.some(f => f.followerId === req.session.userId && f.followingId === u.id) : false
  }));
  if (req.session.userId) {
    users = users.filter(u => u.id !== req.session.userId);
  }
  res.json({ users });
});

/* ---- PROFILE ---- */
app.put('/api/profile', requireAuth, (req, res) => {
  const { displayName, bio } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === req.session.userId);
  if (displayName) user.displayName = displayName;
  if (bio !== undefined) user.bio = bio;
  writeDB(db);
  res.json({ user: { id: user.id, username: user.username, displayName: user.displayName, bio: user.bio, avatar: user.avatar } });
});

app.post('/api/upload-avatar', requireAuth, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const db = readDB();
  const user = db.users.find(u => u.id === req.session.userId);
  const url = '/uploads/' + req.file.filename;
  user.avatar = url;
  writeDB(db);
  res.json({ avatar: url });
});

/* ---- FOLLOW ---- */
app.post('/api/follow/:id', requireAuth, (req, res) => {
  const db = readDB();
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  if (req.session.userId === req.params.id) return res.status(400).json({ error: 'Cannot follow yourself' });

  const existing = db.follows.find(f => f.followerId === req.session.userId && f.followingId === req.params.id);
  if (existing) return res.status(400).json({ error: 'Already following' });

  db.follows.push({ id: id(), followerId: req.session.userId, followingId: req.params.id });
  writeDB(db);
  res.json({ ok: true });
});

app.post('/api/unfollow/:id', requireAuth, (req, res) => {
  const db = readDB();
  db.follows = db.follows.filter(f => !(f.followerId === req.session.userId && f.followingId === req.params.id));
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/users/:id/following', (req, res) => {
  const db = readDB();
  const followingIds = db.follows.filter(f => f.followerId === req.params.id).map(f => f.followingId);
  const users = db.users.filter(u => followingIds.includes(u.id)).map(u => ({
    id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar,
    isFollowing: req.session.userId ? db.follows.some(f => f.followerId === req.session.userId && f.followingId === u.id) : false
  }));
  res.json({ users });
});

app.get('/api/users/:id/followers', (req, res) => {
  const db = readDB();
  const followerIds = db.follows.filter(f => f.followingId === req.params.id).map(f => f.followerId);
  const users = db.users.filter(u => followerIds.includes(u.id)).map(u => ({
    id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar,
    isFollowing: req.session.userId ? db.follows.some(f => f.followerId === req.session.userId && f.followingId === u.id) : false
  }));
  res.json({ users });
});

/* ---- POSTS ---- */
app.post('/api/posts', requireAuth, (req, res) => {
  const { content, imageUrl, videoUrl } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });

  const db = readDB();
  const post = { id: id(), userId: req.session.userId, content, imageUrl: imageUrl || '', videoUrl: videoUrl || '', createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0 };
  db.posts.unshift(post);
  writeDB(db);
  res.json({ post });
});

app.post('/api/posts/upload', requireAuth, upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { content } = req.body;
  const isVideo = /mp4|webm|mov/i.test(path.extname(req.file.filename).slice(1));
  const db = readDB();
  const post = {
    id: id(), userId: req.session.userId, content: content || '',
    imageUrl: isVideo ? '' : '/uploads/' + req.file.filename,
    videoUrl: isVideo ? '/uploads/' + req.file.filename : '',
    createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0
  };
  db.posts.unshift(post);
  writeDB(db);
  res.json({ post });
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const isVideo = /mp4|webm|mov/i.test(path.extname(req.file.filename).slice(1));
  res.json({ url: '/uploads/' + req.file.filename, type: isVideo ? 'video' : 'image' });
});

app.get('/api/posts', requireAuth, (req, res) => {
  const db = readDB();
  let posts = db.posts.map(p => {
    const user = db.users.find(u => u.id === p.userId);
    const isLiked = db.likes.some(l => l.postId === p.id && l.userId === req.session.userId);
    return { ...p, user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar } : null, isLiked };
  });
  res.json({ posts });
});

app.get('/api/posts/feed', requireAuth, (req, res) => {
  const db = readDB();
  const followingIds = db.follows.filter(f => f.followerId === req.session.userId).map(f => f.followingId);
  followingIds.push(req.session.userId);

  let posts = db.posts
    .filter(p => followingIds.includes(p.userId))
    .map(p => {
      const user = db.users.find(u => u.id === p.userId);
      const isLiked = db.likes.some(l => l.postId === p.id && l.userId === req.session.userId);
      return { ...p, user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar } : null, isLiked };
    });
  res.json({ posts });
});

app.get('/api/posts/user/:userId', (req, res) => {
  const db = readDB();
  let posts = db.posts
    .filter(p => p.userId === req.params.userId)
    .map(p => {
      const user = db.users.find(u => u.id === p.userId);
      const isLiked = req.session.userId ? db.likes.some(l => l.postId === p.id && l.userId === req.session.userId) : false;
      return { ...p, user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar } : null, isLiked };
    });
  res.json({ posts });
});

app.delete('/api/posts/:postId', requireAuth, (req, res) => {
  const db = readDB();
  const postIdx = db.posts.findIndex(p => p.id === req.params.postId);
  if (postIdx === -1) return res.status(404).json({ error: 'Post not found' });
  if (db.posts[postIdx].userId !== req.session.userId) {
    return res.status(403).json({ error: 'Not your post' });
  }
  const removed = db.posts.splice(postIdx, 1)[0];
  db.comments = db.comments.filter(c => c.postId !== removed.id);
  db.likes = db.likes.filter(l => l.postId !== removed.id);
  writeDB(db);
  res.json({ ok: true });
});

app.put('/api/posts/:postId', requireAuth, (req, res) => {
  const { content, imageUrl, videoUrl } = req.body;
  const db = readDB();
  const post = db.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.userId !== req.session.userId) return res.status(403).json({ error: 'Not your post' });
  if (content !== undefined) post.content = content;
  if (imageUrl !== undefined) post.imageUrl = imageUrl;
  if (videoUrl !== undefined) post.videoUrl = videoUrl;
  writeDB(db);
  res.json({ post });
});

app.get('/api/posts/liked/:userId', (req, res) => {
  const db = readDB();
  const likedPostIds = db.likes.filter(l => l.userId === req.params.userId).map(l => l.postId);
  let posts = db.posts
    .filter(p => likedPostIds.includes(p.id))
    .map(p => {
      const user = db.users.find(u => u.id === p.userId);
      const isLiked = true;
      return { ...p, user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar } : null, isLiked };
    });
  res.json({ posts });
});

/* ---- LIKES ---- */
app.post('/api/like/:postId', requireAuth, (req, res) => {
  const db = readDB();
  const post = db.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const existing = db.likes.find(l => l.postId === req.params.postId && l.userId === req.session.userId);
  if (existing) return res.status(400).json({ error: 'Already liked' });

  db.likes.push({ id: id(), postId: req.params.postId, userId: req.session.userId });
  post.likeCount = db.likes.filter(l => l.postId === req.params.postId).length;
  writeDB(db);
  res.json({ likeCount: post.likeCount });
});

app.post('/api/unlike/:postId', requireAuth, (req, res) => {
  const db = readDB();
  db.likes = db.likes.filter(l => !(l.postId === req.params.postId && l.userId === req.session.userId));
  const post = db.posts.find(p => p.id === req.params.postId);
  if (post) post.likeCount = db.likes.filter(l => l.postId === req.params.postId).length;
  writeDB(db);
  res.json({ likeCount: post ? post.likeCount : 0 });
});

/* ---- COMMENTS ---- */
app.get('/api/comments/:postId', (req, res) => {
  const db = readDB();
  const post = db.posts.find(p => p.id === req.params.postId);
  const comments = db.comments
    .filter(c => c.postId === req.params.postId)
    .map(c => {
      const user = db.users.find(u => u.id === c.userId);
      return { ...c, user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar } : null };
    });
  res.json({ comments, postUserId: post ? post.userId : null });
});

app.post('/api/comments/:postId', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });

  const db = readDB();
  const post = db.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = { id: id(), postId: req.params.postId, userId: req.session.userId, content, createdAt: new Date().toISOString() };
  db.comments.push(comment);
  post.commentCount = db.comments.filter(c => c.postId === req.params.postId).length;
  writeDB(db);
  res.json({ comment });
});

app.delete('/api/comments/:commentId', requireAuth, (req, res) => {
  const db = readDB();
  const idx = db.comments.findIndex(c => c.id === req.params.commentId);
  if (idx === -1) return res.status(404).json({ error: 'Comment not found' });
  const comment = db.comments[idx];
  const post = db.posts.find(p => p.id === comment.postId);
  const isCommentAuthor = comment.userId === req.session.userId;
  const isPostAuthor = post && post.userId === req.session.userId;
  if (!isCommentAuthor && !isPostAuthor) return res.status(403).json({ error: 'Not authorized' });
  db.comments.splice(idx, 1);
  if (post) post.commentCount = db.comments.filter(c => c.postId === comment.postId).length;
  writeDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`ShareSphere running at http://localhost:${PORT}`);
});

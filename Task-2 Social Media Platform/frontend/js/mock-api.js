(function () {
  var LS_KEY = 'sharesphere_db';
  var SESSION_KEY = 'sharesphere_session';
  var realFetch = window.fetch.bind(window);

  function initDB() {
    var saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
    return {
      users: [
        { id: 'usr01rahul', username: 'rahuljadhav', password: 'pass123', displayName: 'Rahul Jadhav', bio: '', avatar: '' },
        { id: 'usr02pranav', username: 'pranavpatil2423', password: 'pass123', displayName: 'Pranav Patil', bio: '', avatar: '' },
        { id: 'usr03kiran', username: 'kiranshinde0806', password: 'pass123', displayName: 'Kiran Shinde', bio: '', avatar: '' },
        { id: 'usr04kartiki', username: 'kartiki2321', password: 'pass123', displayName: 'Kartiki', bio: '', avatar: '' }
      ],
      posts: [
        { id: 'p001', userId: 'usr01rahul', content: 'Just finished building a new React component! 🚀', imageUrl: '', videoUrl: '', createdAt: '2026-05-25T10:00:00.000Z', likeCount: 3, commentCount: 1 },
        { id: 'p002', userId: 'usr03kiran', content: 'New design system palette — what do you think?', imageUrl: '', videoUrl: '', createdAt: '2026-05-25T09:00:00.000Z', likeCount: 2, commentCount: 0 },
        { id: 'p003', userId: 'usr01rahul', content: 'Anyone else excited for the new framework release?', imageUrl: '', videoUrl: '', createdAt: '2026-05-25T08:00:00.000Z', likeCount: 2, commentCount: 0 }
      ],
      comments: [
        { id: 'c001', postId: 'p001', userId: 'usr03kiran', content: 'Looks great! 🔥', createdAt: '2026-05-25T10:30:00.000Z' }
      ],
      follows: [
        { id: 'f001', followerId: 'usr01rahul', followingId: 'usr03kiran' }
      ],
      likes: [
        { id: 'l001', postId: 'p001', userId: 'usr02pranav' },
        { id: 'l002', postId: 'p001', userId: 'usr03kiran' },
        { id: 'l003', postId: 'p002', userId: 'usr01rahul' },
        { id: 'l004', postId: 'p003', userId: 'usr03kiran' }
      ]
    };
  }

  function readDB() {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || initDB();
  }

  function writeDB(db) {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  }

  function getSession() {
    return localStorage.getItem(SESSION_KEY);
  }

  function setSession(userId) {
    localStorage.setItem(SESSION_KEY, userId);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function getUserSafe(user) {
    return { id: user.id, username: user.username, displayName: user.displayName, bio: user.bio || '', avatar: user.avatar || '' };
  }

  function jsonResponse(data, status) {
    return new Response(JSON.stringify(data), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function errorResponse(msg, status) {
    return jsonResponse({ error: msg }, status || 400);
  }

  function requireAuth(req) {
    var userId = getSession();
    if (!userId) return null;
    var db = readDB();
    var user = db.users.find(function (u) { return u.id === userId; });
    return user || null;
  }

  window.fetch = function (url, opts) {
    opts = opts || {};
    var urlStr = typeof url === 'string' ? url : url.url;
    var method = (opts.method || 'GET').toUpperCase();
    var path = urlStr.replace(/^https?:\/\/[^\/]+/, '');

    if (path.indexOf('/api/') !== 0) {
      return realFetch(url, opts);
    }

    return realFetch(url, opts).catch(function () {
      try {
        return handleAPI(path, method, opts);
      } catch (e) {
        return Promise.resolve(errorResponse(e.message, 500));
      }
    });
  };

  function handleAPI(path, method, opts) {
    var db, user, userId, body, parts, match;

    if (path === '/api/register' && method === 'POST') {
      body = JSON.parse(opts.body || '{}');
      if (!body.username || !body.password) return Promise.resolve(errorResponse('Username and password required'));
      db = readDB();
      if (db.users.some(function (u) { return u.username === body.username; })) {
        return Promise.resolve(errorResponse('Username taken'));
      }
      user = { id: genId(), username: body.username, password: body.password, displayName: body.displayName || body.username, bio: body.bio || '', avatar: '' };
      db.users.push(user);
      writeDB(db);
      setSession(user.id);
      return Promise.resolve(jsonResponse({ user: getUserSafe(user) }));
    }

    if (path === '/api/login' && method === 'POST') {
      body = JSON.parse(opts.body || '{}');
      db = readDB();
      user = db.users.find(function (u) { return u.username === body.username && u.password === body.password; });
      if (!user) return Promise.resolve(errorResponse('Invalid credentials'));
      setSession(user.id);
      return Promise.resolve(jsonResponse({ user: getUserSafe(user) }));
    }

    if (path === '/api/logout' && method === 'POST') {
      clearSession();
      return Promise.resolve(jsonResponse({ ok: true }));
    }

    if (path === '/api/me' && method === 'GET') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      return Promise.resolve(jsonResponse({ user: getUserSafe(user) }));
    }

    if (path === '/api/users' && method === 'GET') {
      db = readDB();
      userId = getSession();
      var allUsers = db.users.map(function (u) {
        return {
          id: u.id, username: u.username, displayName: u.displayName, bio: u.bio, avatar: u.avatar,
          followerCount: db.follows.filter(function (f) { return f.followingId === u.id; }).length,
          isFollowing: userId ? db.follows.some(function (f) { return f.followerId === userId && f.followingId === u.id; }) : false
        };
      });
      if (userId) allUsers = allUsers.filter(function (u) { return u.id !== userId; });
      return Promise.resolve(jsonResponse({ users: allUsers }));
    }

    match = path.match(/^\/api\/users\/([^\/]+)$/);
    if (match && method === 'GET') {
      db = readDB();
      user = db.users.find(function (u) { return u.id === match[1]; });
      if (!user) return Promise.resolve(errorResponse('User not found', 404));
      userId = getSession();
      var followerCount = db.follows.filter(function (f) { return f.followingId === user.id; }).length;
      var followingCount = db.follows.filter(function (f) { return f.followerId === user.id; }).length;
      var isFollowing = userId ? db.follows.some(function (f) { return f.followerId === userId && f.followingId === user.id; }) : false;
      return Promise.resolve(jsonResponse({
        user: { id: user.id, username: user.username, displayName: user.displayName, bio: user.bio, avatar: user.avatar, followerCount: followerCount, followingCount: followingCount, isFollowing: isFollowing }
      }));
    }

    match = path.match(/^\/api\/users\/([^\/]+)\/following$/);
    if (match && method === 'GET') {
      db = readDB();
      userId = getSession();
      var followingIds = db.follows.filter(function (f) { return f.followerId === match[1]; }).map(function (f) { return f.followingId; });
      var followingUsers = db.users.filter(function (u) { return followingIds.indexOf(u.id) !== -1; }).map(function (u) {
        return {
          id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar,
          isFollowing: userId ? db.follows.some(function (f) { return f.followerId === userId && f.followingId === u.id; }) : false
        };
      });
      return Promise.resolve(jsonResponse({ users: followingUsers }));
    }

    match = path.match(/^\/api\/users\/([^\/]+)\/followers$/);
    if (match && method === 'GET') {
      db = readDB();
      userId = getSession();
      var followerIds = db.follows.filter(function (f) { return f.followingId === match[1]; }).map(function (f) { return f.followerId; });
      var followerUsers = db.users.filter(function (u) { return followerIds.indexOf(u.id) !== -1; }).map(function (u) {
        return {
          id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar,
          isFollowing: userId ? db.follows.some(function (f) { return f.followerId === userId && f.followingId === u.id; }) : false
        };
      });
      return Promise.resolve(jsonResponse({ users: followerUsers }));
    }

    if (path === '/api/profile' && method === 'PUT') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      body = JSON.parse(opts.body || '{}');
      db = readDB();
      var dbUser = db.users.find(function (u) { return u.id === user.id; });
      if (body.displayName) dbUser.displayName = body.displayName;
      if (body.bio !== undefined) dbUser.bio = body.bio;
      writeDB(db);
      return Promise.resolve(jsonResponse({ user: getUserSafe(dbUser) }));
    }

    if (path === '/api/upload-avatar' && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      var dbUser = db.users.find(function (u) { return u.id === user.id; });
      return parseFormData(opts).then(function (fields) {
        var file = fields.avatar;
        if (!file) return errorResponse('No file uploaded');
        var dataUrl = file.dataUrl;
        dbUser.avatar = dataUrl;
        writeDB(db);
        return jsonResponse({ avatar: dataUrl });
      });
    }

    match = path.match(/^\/api\/follow\/(.+)$/);
    if (match && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      if (user.id === match[1]) return Promise.resolve(errorResponse('Cannot follow yourself'));
      db = readDB();
      if (db.follows.some(function (f) { return f.followerId === user.id && f.followingId === match[1]; })) {
        return Promise.resolve(errorResponse('Already following'));
      }
      db.follows.push({ id: genId(), followerId: user.id, followingId: match[1] });
      writeDB(db);
      return Promise.resolve(jsonResponse({ ok: true }));
    }

    match = path.match(/^\/api\/unfollow\/(.+)$/);
    if (match && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      db.follows = db.follows.filter(function (f) { return !(f.followerId === user.id && f.followingId === match[1]); });
      writeDB(db);
      return Promise.resolve(jsonResponse({ ok: true }));
    }

    if (path === '/api/posts' && method === 'GET') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      var allPosts = buildPosts(db, getSession());
      allPosts.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
      return Promise.resolve(jsonResponse({ posts: allPosts }));
    }

    if (path === '/api/posts' && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      body = JSON.parse(opts.body || '{}');
      if (!body.content || !body.content.trim()) return Promise.resolve(errorResponse('Content required'));
      db = readDB();
      var post = { id: genId(), userId: user.id, content: body.content, imageUrl: body.imageUrl || '', videoUrl: body.videoUrl || '', createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0 };
      db.posts.unshift(post);
      writeDB(db);
      return Promise.resolve(jsonResponse({ post: post }));
    }

    if (path === '/api/posts/feed' && method === 'GET') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      var followingIds = db.follows.filter(function (f) { return f.followerId === user.id; }).map(function (f) { return f.followingId; });
      followingIds.push(user.id);
      var feedPosts = db.posts
        .filter(function (p) { return followingIds.indexOf(p.userId) !== -1; })
        .map(function (p) { return enrichPost(p, db, getSession()); })
        .sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
      return Promise.resolve(jsonResponse({ posts: feedPosts }));
    }

    if (path === '/api/posts/upload' && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      return parseFormData(opts).then(function (fields) {
        var file = fields.media;
        if (!file) return errorResponse('No file uploaded');
        db = readDB();
        var isVideo = file.type && file.type.indexOf('video') === 0;
        var newPost = {
          id: genId(), userId: user.id, content: fields.content || '',
          imageUrl: isVideo ? '' : (file.dataUrl || ''),
          videoUrl: isVideo ? (file.dataUrl || '') : '',
          createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0
        };
        db.posts.unshift(newPost);
        writeDB(db);
        return jsonResponse({ post: newPost });
      });
    }

    if (path === '/api/upload' && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      return parseFormData(opts).then(function (fields) {
        var file = fields.file;
        if (!file) return errorResponse('No file uploaded');
        var isVideo = file.type && file.type.indexOf('video') === 0;
        return jsonResponse({ url: file.dataUrl, type: isVideo ? 'video' : 'image' });
      });
    }

    match = path.match(/^\/api\/posts\/user\/(.+)$/);
    if (match && method === 'GET') {
      db = readDB();
      var userPosts = db.posts
        .filter(function (p) { return p.userId === match[1]; })
        .map(function (p) { return enrichPost(p, db, getSession()); })
        .sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
      return Promise.resolve(jsonResponse({ posts: userPosts }));
    }

    match = path.match(/^\/api\/posts\/liked\/(.+)$/);
    if (match && method === 'GET') {
      db = readDB();
      var likedIds = db.likes.filter(function (l) { return l.userId === match[1]; }).map(function (l) { return l.postId; });
      var likedPosts = db.posts
        .filter(function (p) { return likedIds.indexOf(p.id) !== -1; })
        .map(function (p) { return enrichPost(p, db, getSession()); });
      return Promise.resolve(jsonResponse({ posts: likedPosts }));
    }

    match = path.match(/^\/api\/posts\/([^\/]+)$/);
    if (match && method === 'DELETE') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      var idx = db.posts.findIndex(function (p) { return p.id === match[1]; });
      if (idx === -1) return Promise.resolve(errorResponse('Post not found', 404));
      if (db.posts[idx].userId !== user.id) return Promise.resolve(errorResponse('Not your post', 403));
      db.posts.splice(idx, 1);
      db.comments = db.comments.filter(function (c) { return c.postId !== match[1]; });
      db.likes = db.likes.filter(function (l) { return l.postId !== match[1]; });
      writeDB(db);
      return Promise.resolve(jsonResponse({ ok: true }));
    }

    match = path.match(/^\/api\/posts\/([^\/]+)$/);
    if (match && method === 'PUT') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      body = JSON.parse(opts.body || '{}');
      db = readDB();
      var editPost = db.posts.find(function (p) { return p.id === match[1]; });
      if (!editPost) return Promise.resolve(errorResponse('Post not found', 404));
      if (editPost.userId !== user.id) return Promise.resolve(errorResponse('Not your post', 403));
      if (body.content !== undefined) editPost.content = body.content;
      if (body.imageUrl !== undefined) editPost.imageUrl = body.imageUrl;
      if (body.videoUrl !== undefined) editPost.videoUrl = body.videoUrl;
      writeDB(db);
      return Promise.resolve(jsonResponse({ post: editPost }));
    }

    match = path.match(/^\/api\/like\/(.+)$/);
    if (match && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      var likePost = db.posts.find(function (p) { return p.id === match[1]; });
      if (!likePost) return Promise.resolve(errorResponse('Post not found', 404));
      if (db.likes.some(function (l) { return l.postId === match[1] && l.userId === user.id; })) {
        return Promise.resolve(errorResponse('Already liked'));
      }
      db.likes.push({ id: genId(), postId: match[1], userId: user.id });
      likePost.likeCount = db.likes.filter(function (l) { return l.postId === match[1]; }).length;
      writeDB(db);
      return Promise.resolve(jsonResponse({ likeCount: likePost.likeCount }));
    }

    match = path.match(/^\/api\/unlike\/(.+)$/);
    if (match && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      db.likes = db.likes.filter(function (l) { return !(l.postId === match[1] && l.userId === user.id); });
      var unlikePost = db.posts.find(function (p) { return p.id === match[1]; });
      if (unlikePost) unlikePost.likeCount = db.likes.filter(function (l) { return l.postId === match[1]; }).length;
      writeDB(db);
      return Promise.resolve(jsonResponse({ likeCount: unlikePost ? unlikePost.likeCount : 0 }));
    }

    match = path.match(/^\/api\/comments\/(.+)$/);
    if (match && method === 'GET') {
      db = readDB();
      var postForComments = db.posts.find(function (p) { return p.id === match[1]; });
      var comments = db.comments
        .filter(function (c) { return c.postId === match[1]; })
        .map(function (c) {
          var cu = db.users.find(function (u) { return u.id === c.userId; });
          return { id: c.id, postId: c.postId, userId: c.userId, content: c.content, createdAt: c.createdAt, user: cu ? { id: cu.id, username: cu.username, displayName: cu.displayName, avatar: cu.avatar } : null };
        });
      return Promise.resolve(jsonResponse({ comments: comments, postUserId: postForComments ? postForComments.userId : null }));
    }

    match = path.match(/^\/api\/comments\/(.+)$/);
    if (match && method === 'POST') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      body = JSON.parse(opts.body || '{}');
      if (!body.content || !body.content.trim()) return Promise.resolve(errorResponse('Content required'));
      db = readDB();
      var commentPost = db.posts.find(function (p) { return p.id === match[1]; });
      if (!commentPost) return Promise.resolve(errorResponse('Post not found', 404));
      var comment = { id: genId(), postId: match[1], userId: user.id, content: body.content, createdAt: new Date().toISOString() };
      db.comments.push(comment);
      commentPost.commentCount = db.comments.filter(function (c) { return c.postId === match[1]; }).length;
      writeDB(db);
      return Promise.resolve(jsonResponse({ comment: comment, commentCount: commentPost.commentCount }));
    }

    match = path.match(/^\/api\/comments\/([^\/]+)$/);
    if (match && method === 'DELETE') {
      user = requireAuth();
      if (!user) return Promise.resolve(errorResponse('Not logged in', 401));
      db = readDB();
      var ci = db.comments.findIndex(function (c) { return c.id === match[1]; });
      if (ci === -1) return Promise.resolve(errorResponse('Comment not found', 404));
      var commentToDelete = db.comments[ci];
      var commentPost = db.posts.find(function (p) { return p.id === commentToDelete.postId; });
      var isCommentAuthor = commentToDelete.userId === user.id;
      var isPostAuthor = commentPost && commentPost.userId === user.id;
      if (!isCommentAuthor && !isPostAuthor) return Promise.resolve(errorResponse('Not authorized', 403));
      db.comments.splice(ci, 1);
      if (commentPost) commentPost.commentCount = db.comments.filter(function (c) { return c.postId === commentToDelete.postId; }).length;
      writeDB(db);
      return Promise.resolve(jsonResponse({ ok: true }));
    }

    return realFetch(url || path, opts);
  }

  function parseFormData(opts) {
    return new Promise(function (resolve, reject) {
      if (!opts.body || typeof opts.body === 'string') {
        resolve({});
        return;
      }
      if (typeof opts.body.forEach === 'function') {
        var fields = {};
        var pending = 0;
        var resolved = false;
        opts.body.forEach(function (value, key) {
          if (value instanceof File) {
            pending++;
            var reader = new FileReader();
            reader.onload = function () {
              fields[key] = { dataUrl: reader.result, type: value.type, name: value.name };
              pending--;
              if (pending === 0 && !resolved) { resolved = true; resolve(fields); }
            };
            reader.onerror = function () {
              if (!resolved) { resolved = true; resolve(fields); }
            };
            reader.readAsDataURL(value);
          } else {
            fields[key] = value;
          }
        });
        if (pending === 0) resolve(fields);
      } else {
        resolve({});
      }
    });
  }

  function buildPosts(db, sessionId) {
    return db.posts.map(function (p) { return enrichPost(p, db, sessionId); });
  }

  function enrichPost(p, db, sessionId) {
    var pu = db.users.find(function (u) { return u.id === p.userId; });
    var isLiked = sessionId ? db.likes.some(function (l) { return l.postId === p.id && l.userId === sessionId; }) : false;
    return { id: p.id, userId: p.userId, content: p.content, imageUrl: p.imageUrl, videoUrl: p.videoUrl, createdAt: p.createdAt, likeCount: p.likeCount, commentCount: p.commentCount, user: pu ? { id: pu.id, username: pu.username, displayName: pu.displayName, avatar: pu.avatar } : null, isLiked: isLiked };
  }

  if (!localStorage.getItem(LS_KEY)) {
    writeDB(initDB());
  }
})();

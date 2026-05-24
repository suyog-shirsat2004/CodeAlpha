(function () {
  var SK = 'sharesphere_data';

  var SEED_USERS = [
    { id: 'seed1', username: 'rahuljadhav', password: 'pass123', displayName: 'Rahul Jadhav', bio: 'Web developer & photographer', avatar: '' },
    { id: 'seed2', username: 'pranavpatil2423', password: 'pass123', displayName: 'Pranav Patil', bio: 'Full-stack dev | Music lover', avatar: '' },
    { id: 'seed3', username: 'kiranshinde0806', password: 'pass123', displayName: 'Kiran Shinde', bio: 'UI/UX designer', avatar: '' },
    { id: 'seed4', username: 'kartiki2321', password: 'pass123', displayName: 'Kartiki', bio: 'Digital artist', avatar: '' }
  ];
  var SEED_POSTS = [
    { id: 'sp1', userId: 'seed1', content: 'Just finished building a new React component! 🚀', imageUrl: '', videoUrl: '', createdAt: new Date(Date.now() - 3600000).toISOString(), likeCount: 3, commentCount: 1 },
    { id: 'sp2', userId: 'seed2', content: 'Beautiful sunset from the terrace today 🌅', imageUrl: '', videoUrl: '', createdAt: new Date(Date.now() - 7200000).toISOString(), likeCount: 5, commentCount: 2 },
    { id: 'sp3', userId: 'seed3', content: 'New design system palette — what do you think?', imageUrl: '', videoUrl: '', createdAt: new Date(Date.now() - 10800000).toISOString(), likeCount: 2, commentCount: 0 },
    { id: 'sp4', userId: 'seed4', content: 'Working on a digital portrait commission 🎨', imageUrl: '', videoUrl: '', createdAt: new Date(Date.now() - 14400000).toISOString(), likeCount: 7, commentCount: 3 },
    { id: 'sp5', userId: 'seed1', content: 'Anyone else excited for the new framework release?', imageUrl: '', videoUrl: '', createdAt: new Date(Date.now() - 18000000).toISOString(), likeCount: 1, commentCount: 0 }
  ];
  var SEED_COMMENTS = [
    { id: 'sc1', postId: 'sp1', userId: 'seed2', content: 'Looks great! 🔥', createdAt: new Date(Date.now() - 3000000).toISOString() },
    { id: 'sc2', postId: 'sp2', userId: 'seed1', content: 'Stunning view!', createdAt: new Date(Date.now() - 6000000).toISOString() },
    { id: 'sc3', postId: 'sp2', userId: 'seed4', content: 'Where is this?', createdAt: new Date(Date.now() - 5000000).toISOString() },
    { id: 'sc4', postId: 'sp4', userId: 'seed3', content: 'Love the colors!', createdAt: new Date(Date.now() - 8000000).toISOString() },
    { id: 'sc5', postId: 'sp4', userId: 'seed1', content: 'Amazing work 🔥', createdAt: new Date(Date.now() - 7000000).toISOString() },
    { id: 'sc6', postId: 'sp4', userId: 'seed2', content: 'Incredible detail!', createdAt: new Date(Date.now() - 4000000).toISOString() }
  ];
  var SEED_LIKES = [
    { id: 'sl1', postId: 'sp1', userId: 'seed2' },
    { id: 'sl2', postId: 'sp1', userId: 'seed3' },
    { id: 'sl3', postId: 'sp1', userId: 'seed4' },
    { id: 'sl4', postId: 'sp2', userId: 'seed1' },
    { id: 'sl5', postId: 'sp2', userId: 'seed3' },
    { id: 'sl6', postId: 'sp2', userId: 'seed4' },
    { id: 'sl7', postId: 'sp2', userId: 'seed2' },
    { id: 'sl8', postId: 'sp3', userId: 'seed1' },
    { id: 'sl9', postId: 'sp3', userId: 'seed4' },
    { id: 'sl10', postId: 'sp4', userId: 'seed1' },
    { id: 'sl11', postId: 'sp4', userId: 'seed2' },
    { id: 'sl12', postId: 'sp4', userId: 'seed3' },
    { id: 'sl13', postId: 'sp5', userId: 'seed2' }
  ];
  var SEED_FOLLOWS = [
    { id: 'sf1', followerId: 'seed1', followingId: 'seed2' },
    { id: 'sf2', followerId: 'seed1', followingId: 'seed3' },
    { id: 'sf3', followerId: 'seed2', followingId: 'seed1' },
    { id: 'sf4', followerId: 'seed3', followingId: 'seed1' },
    { id: 'sf5', followerId: 'seed4', followingId: 'seed1' }
  ];

  function freshDB() {
    return { users: SEED_USERS.slice(), posts: SEED_POSTS.slice(), comments: SEED_COMMENTS.slice(), likes: SEED_LIKES.slice(), follows: SEED_FOLLOWS.slice(), _n: 100, _s: null, _v: 1 };
  }

  function db() {
    var raw = localStorage.getItem(SK);
    if (!raw) {
      localStorage.setItem(SK, JSON.stringify(freshDB()));
      return JSON.parse(localStorage.getItem(SK));
    }
    var d = JSON.parse(raw);
    if (!d._v) {
      var oldSession = d._s;
      var oldUsers = d.users || [];
      var f = freshDB();
      var existingUsernames = {};
      f.users.forEach(function (u) { existingUsernames[u.username] = true; });
      oldUsers.forEach(function (u) {
        if (!existingUsernames[u.username]) { f.users.unshift(u); }
      });
      f._s = d._s;
      localStorage.setItem(SK, JSON.stringify(f));
      return JSON.parse(localStorage.getItem(SK));
    }
    return d;
  }

  function sv(d) { localStorage.setItem(SK, JSON.stringify(d)); return d; }

  function id() { var d = db(); var i = String(d._n++); sv(d); return i; }

  function user(d, uid) { return d.users.find(function (u) { return u.id === uid; }); }

  function cur(d) { return d._s ? user(d, d._s) : null; }

  function affix(posts, d, uid) {
    return posts.map(function (p) {
      var u = user(d, p.userId);
      var liked = uid ? d.likes.some(function (l) { return l.postId === p.id && l.userId === uid; }) : false;
      return Object.assign({}, p, {
        user: u ? { id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar } : null,
        isLiked: liked
      });
    });
  }

  function auth(d) { if (!d._s) throw new Error('Not logged in'); return d._s; }

  function jr(s, data) { return new Response(JSON.stringify(data), { status: s, headers: { 'Content-Type': 'application/json' } }); }

  function pStrip(url) {
    if (typeof url === 'string') return url;
    return url.url;
  }

  function pathOnly(url) {
    var s = pStrip(url);
    var a = document.createElement('a');
    a.href = s;
    return a.pathname;
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  var orig = window.fetch;
  window.fetch = async function (input, init) {
    init = init || {};
    var url = pStrip(input);
    var method = (init.method || 'GET').toUpperCase();
    var body = {};
    var isForm = false;

    if (init.body && typeof init.body === 'string') { try { body = JSON.parse(init.body); } catch (e) { } }
    if (init.body instanceof FormData) { isForm = true; }

    if (url.indexOf('/api/') === -1) return orig(input, init);

    var path = pathOnly(url);
    var d = db();

    try {
      /* ---- AUTH ---- */
      if (path === '/api/register' && method === 'POST') {
        if (!body.username || !body.password) return jr(400, { error: 'Username and password required' });
        if (d.users.some(function (u) { return u.username === body.username; })) return jr(400, { error: 'Username taken' });
        var nu = { id: id(), username: body.username, password: body.password, displayName: body.displayName || body.username, bio: body.bio || '', avatar: '' };
        d.users.push(nu);
        d._s = nu.id;
        sv(d);
        return jr(200, { user: { id: nu.id, username: nu.username, displayName: nu.displayName } });
      }

      if (path === '/api/login' && method === 'POST') {
        var u = d.users.find(function (x) { return x.username === body.username && x.password === body.password; });
        if (!u) return jr(400, { error: 'Invalid credentials' });
        d._s = u.id;
        sv(d);
        return jr(200, { user: { id: u.id, username: u.username, displayName: u.displayName } });
      }

      if (path === '/api/logout' && method === 'POST') {
        d._s = null;
        sv(d);
        return jr(200, { ok: true });
      }

      if (path === '/api/me' && method === 'GET') {
        var uid2 = auth(d);
        var u2 = user(d, uid2);
        if (!u2) return jr(404, { error: 'User not found' });
        return jr(200, { user: { id: u2.id, username: u2.username, displayName: u2.displayName, bio: u2.bio, avatar: u2.avatar } });
      }

      /* ---- USERS ---- */
      var m1 = path.match(/^\/api\/users\/([^/]+)$/);
      if (m1 && method === 'GET') {
        var u3 = user(d, m1[1]);
        if (!u3) return jr(404, { error: 'User not found' });
        var fc = d.follows.filter(function (f) { return f.followingId === u3.id; }).length;
        var fwc = d.follows.filter(function (f) { return f.followerId === u3.id; }).length;
        var fol = d._s ? d.follows.some(function (f) { return f.followerId === d._s && f.followingId === u3.id; }) : false;
        return jr(200, { user: { id: u3.id, username: u3.username, displayName: u3.displayName, bio: u3.bio, avatar: u3.avatar, followerCount: fc, followingCount: fwc, isFollowing: fol } });
      }

      if (path === '/api/users' && method === 'GET') {
        var us = d.users.map(function (u) {
          return {
            id: u.id, username: u.username, displayName: u.displayName, bio: u.bio, avatar: u.avatar,
            followerCount: d.follows.filter(function (f) { return f.followingId === u.id; }).length,
            isFollowing: d._s ? d.follows.some(function (f) { return f.followerId === d._s && f.followingId === u.id; }) : false
          };
        });
        if (d._s) us = us.filter(function (u) { return u.id !== d._s; });
        return jr(200, { users: us });
      }

      /* ---- PROFILE ---- */
      if (path === '/api/profile' && method === 'PUT') {
        var uid3 = auth(d);
        var u4 = user(d, uid3);
        if (body.displayName) u4.displayName = body.displayName;
        if (body.bio !== undefined) u4.bio = body.bio;
        sv(d);
        return jr(200, { user: { id: u4.id, username: u4.username, displayName: u4.displayName, bio: u4.bio, avatar: u4.avatar } });
      }

      /* ---- FOLLOW ---- */
      var m2 = path.match(/^\/api\/follow\/(.+)$/);
      if (m2 && method === 'POST') {
        var uid4 = auth(d);
        if (uid4 === m2[1]) return jr(400, { error: 'Cannot follow yourself' });
        if (!user(d, m2[1])) return jr(404, { error: 'User not found' });
        if (d.follows.some(function (f) { return f.followerId === uid4 && f.followingId === m2[1]; })) return jr(400, { error: 'Already following' });
        d.follows.push({ id: id(), followerId: uid4, followingId: m2[1] });
        sv(d);
        return jr(200, { ok: true });
      }

      var m3 = path.match(/^\/api\/unfollow\/(.+)$/);
      if (m3 && method === 'POST') {
        var uid5 = auth(d);
        d.follows = d.follows.filter(function (f) { return !(f.followerId === uid5 && f.followingId === m3[1]); });
        sv(d);
        return jr(200, { ok: true });
      }

      var m4 = path.match(/^\/api\/users\/([^/]+)\/following$/);
      if (m4 && method === 'GET') {
        var fids = d.follows.filter(function (f) { return f.followerId === m4[1]; }).map(function (f) { return f.followingId; });
        var us2 = d.users.filter(function (u) { return fids.indexOf(u.id) !== -1; }).map(function (u) {
          return {
            id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar,
            isFollowing: d._s ? d.follows.some(function (f) { return f.followerId === d._s && f.followingId === u.id; }) : false
          };
        });
        return jr(200, { users: us2 });
      }

      var m5 = path.match(/^\/api\/users\/([^/]+)\/followers$/);
      if (m5 && method === 'GET') {
        var fids2 = d.follows.filter(function (f) { return f.followingId === m5[1]; }).map(function (f) { return f.followerId; });
        var us3 = d.users.filter(function (u) { return fids2.indexOf(u.id) !== -1; }).map(function (u) {
          return {
            id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar,
            isFollowing: d._s ? d.follows.some(function (f) { return f.followerId === d._s && f.followingId === u.id; }) : false
          };
        });
        return jr(200, { users: us3 });
      }

      /* ---- POSTS ---- */
      if (path === '/api/posts' && method === 'POST') {
        var uid6 = auth(d);
        if (!body.content || !body.content.trim()) return jr(400, { error: 'Content required' });
        var p = { id: id(), userId: uid6, content: body.content, imageUrl: body.imageUrl || '', videoUrl: body.videoUrl || '', createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0 };
        d.posts.unshift(p);
        sv(d);
        return jr(200, { post: p });
      }

      if (path === '/api/upload' && method === 'POST' && isForm) {
        auth(d);
        var file = init.body.get('file');
        if (!file) return jr(400, { error: 'No file uploaded' });
        var dataUrl = await readFile(file);
        var isVid = file.type.startsWith('video/');
        return jr(200, { url: dataUrl, type: isVid ? 'video' : 'image' });
      }

      if (path === '/api/posts/feed' && method === 'GET') {
        var uid7 = auth(d);
        var fIds = d.follows.filter(function (f) { return f.followerId === uid7; }).map(function (f) { return f.followingId; });
        fIds.push(uid7);
        var ps = d.posts.filter(function (p) { return fIds.indexOf(p.userId) !== -1; });
        ps = affix(ps, d, uid7);
        return jr(200, { posts: ps });
      }

      var m6 = path.match(/^\/api\/posts\/user\/(.+)$/);
      if (m6 && method === 'GET') {
        var ps2 = d.posts.filter(function (p) { return p.userId === m6[1]; });
        ps2 = affix(ps2, d, d._s || null);
        return jr(200, { posts: ps2 });
      }

      var m7 = path.match(/^\/api\/posts\/([^/]+)$/);
      if (m7 && method === 'DELETE') {
        var uid8 = auth(d);
        var idx = d.posts.findIndex(function (p) { return p.id === m7[1]; });
        if (idx === -1) return jr(404, { error: 'Post not found' });
        if (d.posts[idx].userId !== uid8) return jr(403, { error: 'Not your post' });
        var rem = d.posts.splice(idx, 1)[0];
        d.comments = d.comments.filter(function (c) { return c.postId !== rem.id; });
        d.likes = d.likes.filter(function (l) { return l.postId !== rem.id; });
        sv(d);
        return jr(200, { ok: true });
      }

      if (m7 && method === 'PUT') {
        var uid9 = auth(d);
        var p2 = d.posts.find(function (p) { return p.id === m7[1]; });
        if (!p2) return jr(404, { error: 'Post not found' });
        if (p2.userId !== uid9) return jr(403, { error: 'Not your post' });
        if (body.content !== undefined) p2.content = body.content;
        if (body.imageUrl !== undefined) p2.imageUrl = body.imageUrl;
        if (body.videoUrl !== undefined) p2.videoUrl = body.videoUrl;
        sv(d);
        return jr(200, { post: p2 });
      }

      var m8 = path.match(/^\/api\/posts\/liked\/(.+)$/);
      if (m8 && method === 'GET') {
        var lpIds = d.likes.filter(function (l) { return l.userId === m8[1]; }).map(function (l) { return l.postId; });
        var ps3 = d.posts.filter(function (p) { return lpIds.indexOf(p.id) !== -1; });
        ps3 = ps3.map(function (p) {
          var u = user(d, p.userId);
          return Object.assign({}, p, { user: u ? { id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar } : null, isLiked: true });
        });
        return jr(200, { posts: ps3 });
      }

      /* ---- LIKES ---- */
      var m9 = path.match(/^\/api\/like\/(.+)$/);
      if (m9 && method === 'POST') {
        var uid10 = auth(d);
        var p3 = d.posts.find(function (p) { return p.id === m9[1]; });
        if (!p3) return jr(404, { error: 'Post not found' });
        if (d.likes.some(function (l) { return l.postId === p3.id && l.userId === uid10; })) return jr(400, { error: 'Already liked' });
        d.likes.push({ id: id(), postId: p3.id, userId: uid10 });
        p3.likeCount = d.likes.filter(function (l) { return l.postId === p3.id; }).length;
        sv(d);
        return jr(200, { likeCount: p3.likeCount });
      }

      var m10 = path.match(/^\/api\/unlike\/(.+)$/);
      if (m10 && method === 'POST') {
        var uid11 = auth(d);
        d.likes = d.likes.filter(function (l) { return !(l.postId === m10[1] && l.userId === uid11); });
        var p4 = d.posts.find(function (p) { return p.id === m10[1]; });
        if (p4) p4.likeCount = d.likes.filter(function (l) { return l.postId === p4.id; }).length;
        sv(d);
        return jr(200, { likeCount: p4 ? p4.likeCount : 0 });
      }

      /* ---- COMMENTS ---- */
      var m11 = path.match(/^\/api\/comments\/(.+)$/);
      if (m11 && method === 'GET') {
        var p5 = d.posts.find(function (p) { return p.id === m11[1]; });
        var cs = d.comments.filter(function (c) { return c.postId === m11[1]; }).map(function (c) {
          var u = user(d, c.userId);
          return Object.assign({}, c, { user: u ? { id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar } : null });
        });
        return jr(200, { comments: cs, postUserId: p5 ? p5.userId : null });
      }

      if (m11 && method === 'POST') {
        var uid12 = auth(d);
        if (!body.content || !body.content.trim()) return jr(400, { error: 'Content required' });
        var p6 = d.posts.find(function (p) { return p.id === m11[1]; });
        if (!p6) return jr(404, { error: 'Post not found' });
        var com = { id: id(), postId: m11[1], userId: uid12, content: body.content, createdAt: new Date().toISOString() };
        d.comments.push(com);
        p6.commentCount = d.comments.filter(function (c) { return c.postId === p6.id; }).length;
        sv(d);
        return jr(200, { comment: com });
      }

      if (m11 && method === 'DELETE') {
        var uid13 = auth(d);
        var ci = d.comments.findIndex(function (c) { return c.id === m11[1]; });
        if (ci === -1) return jr(404, { error: 'Comment not found' });
        var com2 = d.comments[ci];
        var p7 = d.posts.find(function (p) { return p.id === com2.postId; });
        var isCA = com2.userId === uid13;
        var isPA = p7 && p7.userId === uid13;
        if (!isCA && !isPA) return jr(403, { error: 'Not authorized' });
        d.comments.splice(ci, 1);
        if (p7) p7.commentCount = d.comments.filter(function (c) { return c.postId === com2.postId; }).length;
        sv(d);
        return jr(200, { ok: true });
      }

      /* ---- AVATAR UPLOAD ---- */
      if (path === '/api/upload-avatar' && method === 'POST' && isForm) {
        var uid14 = auth(d);
        var file2 = init.body.get('avatar');
        if (!file2) return jr(400, { error: 'No file uploaded' });
        var du = await readFile(file2);
        var u5 = user(d, uid14);
        u5.avatar = du;
        sv(d);
        return jr(200, { avatar: du });
      }

      return jr(404, { error: 'Not found' });
    } catch (e) {
      if (e.message === 'Not logged in') return jr(401, { error: 'Not logged in' });
      return jr(500, { error: e.message });
    }
  };
})();

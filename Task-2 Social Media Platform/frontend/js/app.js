let __currentUserId = null;

function setNavAvatar(user) {
  var el = document.getElementById('nav-avatar');
  var icon = document.getElementById('nav-person-icon');
  if (!el || !icon) return;
  if (user) {
    el.style.display = 'inline-flex';
    el.textContent = getInitials(user.displayName || user.username);
    icon.style.display = 'none';
  } else {
    el.style.display = 'none';
    icon.style.display = 'inline-block';
  }
}

async function api(url, opts = {}) {
  const res = await fetch(url, { ...opts, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...opts.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function getInitials(name) { return (name || 'U').charAt(0).toUpperCase(); }

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h';
  const days = Math.floor(hours / 24);
  return days + 'd';
}

function getQueryParam(name) { return new URLSearchParams(window.location.search).get(name); }

async function checkAuth() {
  try { const d = await api('/api/me'); return d.user; }
  catch { return null; }
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function fireConfetti() {
  const c = document.getElementById('confetti-container');
  if (!c) return;
  const colors = ['#6c5ce7','#fd79a8','#00b894','#fdcb6e','#e17055','#0984e3','#a29bfe'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const s = 6 + Math.random() * 8;
    p.style.width = s + 'px';
    p.style.height = s * (0.4 + Math.random() * 0.6) + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    p.style.animationDuration = (2 + Math.random() * 2) + 's';
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    c.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

function createParticles(containerId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const s = 4 + Math.random() * 10;
    p.style.width = s + 'px';
    p.style.height = s + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '0';
    p.style.animationDuration = (6 + Math.random() * 14) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    c.appendChild(p);
  }
}

/* ============================================
   EMOJI PICKER
   ============================================ */
const EMOJIS = ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤔','🤐','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🥳','😎','🧐','🤓','😈','👿','👹','👺','💀','☠️','👻','👽','👾','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾','👋','🤚','✋','🖐','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💪','✍️','💅','👀','👁','👄','👅','💋','❤️','🧡','💛','💚','💙','💜','🖤','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','🔥','⭐','✨','💫','🌟','🎉','🎊','🎈','🎁','🎀','🕊️','🏆','🥇','🥈','🥉','🏅','🎖️','🎗️','🎵','🎶','🎤','🎧','🎼'];

function buildEmojiPicker(pickerId, inputId) {
  const picker = document.getElementById(pickerId);
  if (!picker) return;
  picker.innerHTML = '';
  EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.textContent = e;
    btn.type = 'button';
    btn.onclick = () => {
      const input = document.getElementById(inputId);
      if (input) {
        const start = input.selectionStart;
        input.value = input.value.slice(0, start) + e + input.value.slice(input.selectionEnd);
        input.focus();
        input.selectionStart = input.selectionEnd = start + e.length;
      }
      picker.style.display = 'none';
    };
    picker.appendChild(btn);
  });
}

function setupEmojiPicker(btnId, pickerId) {
  const btn = document.getElementById(btnId);
  const picker = document.getElementById(pickerId);
  if (!btn || !picker) return;
  btn.onclick = (e) => {
    e.stopPropagation();
    const rect = btn.getBoundingClientRect();
    picker.style.top = (rect.bottom + 4) + 'px';
    picker.style.left = Math.max(4, rect.left) + 'px';
    if (!picker.style.display || picker.style.display === 'none') {
      picker.style.display = 'grid';
    } else {
      picker.style.display = 'none';
    }
  };
}

document.addEventListener('click', (e) => {
  document.querySelectorAll('.emoji-picker').forEach(p => {
    if (!p.contains(e.target) && !e.target.matches('.emoji-trigger')) {
      p.style.display = 'none';
    }
  });
});

/* ============================================
   NAVBAR
   ============================================ */
const nav = document.getElementById('main-nav');
if (nav) {
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
}

/* ============================================
   LOGOUT
   ============================================ */
document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await api('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

/* ============================================
   LOGIN PAGE
   ============================================ */
if (window.location.pathname === '/login.html') {
  let isRegister = false;
  const errorDiv = document.getElementById('auth-error');
  const title = document.getElementById('auth-title');
  const submitBtn = document.getElementById('auth-submit');
  const switchText = document.getElementById('auth-switch-text');

  document.getElementById('auth-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    isRegister = !isRegister;
    title.textContent = isRegister ? 'Create Account' : 'Welcome Back';
    submitBtn.textContent = isRegister ? 'Sign Up' : 'Sign In';
    switchText.innerHTML = isRegister
      ? 'Already have an account? <a href="#" id="auth-toggle" class="fw-semibold">Sign In</a>'
      : 'New here? <a href="#" id="auth-toggle" class="fw-semibold">Create Account</a>';
  });

  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.classList.add('d-none');
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!username || !password) {
      errorDiv.textContent = 'Please fill in all fields';
      errorDiv.classList.remove('d-none');
      return;
    }
    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      await api(endpoint, { method: 'POST', body: JSON.stringify({ username, password }) });
      window.location.href = '/';
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.remove('d-none');
    }
  });
}

/* ============================================
   FEED PAGE
   ============================================ */
if (window.location.pathname === '/') {
  let currentUser = null;
  let pendingMediaUrl = '';
  let pendingMediaType = '';

  async function initFeed() {
    currentUser = await checkAuth();
    if (currentUser) {
      __currentUserId = currentUser.id;
      document.getElementById('auth-section').style.display = 'block';
      document.getElementById('landing-section').style.display = 'none';
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('logout-btn').style.display = 'inline-block';
      setNavAvatar(currentUser);
      document.getElementById('poster-avatar').textContent = getInitials(currentUser.displayName);
      loadFeed();
      loadSuggested();
    } else {
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('landing-section').style.display = 'block';
      document.getElementById('login-btn').style.display = 'inline-block';
      document.getElementById('logout-btn').style.display = 'none';
      createParticles('landing-particles');
    }
  }

  function showMediaPreview(url, type) {
    const preview = document.getElementById('media-preview');
    const img = document.getElementById('preview-img');
    const video = document.getElementById('preview-video');
    preview.style.display = 'block';
    if (type === 'video') {
      img.style.display = 'none';
      video.style.display = 'block';
      video.src = url;
    } else {
      video.style.display = 'none';
      img.style.display = 'block';
      img.src = url;
    }
  }

  async function createPost() {
    const content = document.getElementById('post-input');
    if (!content.value.trim() && !pendingMediaUrl) return;
    const payload = { content: content.value };
    if (pendingMediaUrl) {
      payload.imageUrl = pendingMediaType === 'image' ? pendingMediaUrl : '';
      payload.videoUrl = pendingMediaType === 'video' ? pendingMediaUrl : '';
    }
    try {
      await api('/api/posts', { method: 'POST', body: JSON.stringify(payload) });
      content.value = '';
      pendingMediaUrl = '';
      pendingMediaType = '';
      document.getElementById('media-preview').style.display = 'none';
      document.getElementById('media-upload').value = '';
      loadFeed();
    } catch (err) { alert(err.message); }
  }

  async function loadFeed() {
    try {
      const data = await api('/api/posts/feed');
      const container = document.getElementById('feed-container');
      if (data.posts.length === 0) {
        document.getElementById('empty-feed').style.display = 'block';
        container.innerHTML = '';
      } else {
        document.getElementById('empty-feed').style.display = 'none';
        container.innerHTML = renderPosts(data.posts);
      }
    } catch { }
  }

  async function loadSuggested() {
    try {
      const data = await api('/api/users');
      const container = document.getElementById('suggested-users');
      if (data.users.length === 0) {
        container.innerHTML = '<p class="text-muted small mb-0">No other users yet.</p>';
        return;
      }
      container.innerHTML = data.users.slice(0, 5).map((u, i) => `
        <div class="suggested-user" style="animation-delay:${i * 0.08}s">
          <div class="su-avatar">${u.avatar ? `<img src="${u.avatar}">` : getInitials(u.displayName)}</div>
          <div class="su-info">
            <a href="/profile.html?id=${u.id}" class="su-name">${escHtml(u.displayName)}</a>
            <div class="su-username">@${escHtml(u.username)}</div>
          </div>
          <button class="btn btn-sm rounded-pill ${u.isFollowing ? 'btn-outline-danger' : 'btn-primary'}" onclick="suggestedFollow('${u.id}', this)">${u.isFollowing ? 'Unfollow' : 'Follow'}</button>
        </div>
      `).join('');
    } catch { }
  }

  document.getElementById('media-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      pendingMediaUrl = data.url;
      pendingMediaType = data.type;
      showMediaPreview(data.url, data.type);
    } catch (err) { alert('Upload failed: ' + err.message); }
  });

  let dragCounter = 0;
  document.body.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (dragCounter === 1) document.getElementById('drop-zone-overlay').style.display = 'flex';
  });
  document.body.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) document.getElementById('drop-zone-overlay').style.display = 'none';
  });
  document.body.addEventListener('dragover', (e) => e.preventDefault());
  document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    document.getElementById('drop-zone-overlay').style.display = 'none';
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      document.getElementById('media-upload').files = e.dataTransfer.files;
      document.getElementById('media-upload').dispatchEvent(new Event('change'));
    }
  });

  buildEmojiPicker('emoji-picker', 'post-input');
  setupEmojiPicker('emoji-btn', 'emoji-picker');

  document.getElementById('url-embed-btn')?.addEventListener('click', () => {
    const el = document.getElementById('url-input');
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
  });

  document.getElementById('embed-url-btn')?.addEventListener('click', () => {
    const url = document.getElementById('embed-url').value.trim();
    if (!url) return;
    const isVideo = /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
    pendingMediaUrl = url;
    pendingMediaType = isVideo ? 'video' : 'image';
    showMediaPreview(url, pendingMediaType);
    document.getElementById('url-input').style.display = 'none';
    document.getElementById('embed-url').value = '';
  });

  document.getElementById('clear-media')?.addEventListener('click', () => {
    pendingMediaUrl = '';
    pendingMediaType = '';
    document.getElementById('media-preview').style.display = 'none';
    document.getElementById('preview-img').style.display = 'none';
    document.getElementById('preview-video').style.display = 'none';
    document.getElementById('media-upload').value = '';
  });

  document.getElementById('post-btn')?.addEventListener('click', createPost);

  initFeed();
}

async function followInList(userId, btn) {
  const following = btn.textContent.trim() === 'Unfollow';
  try {
    await api((following ? '/api/unfollow/' : '/api/follow/') + userId, { method: 'POST' });
    btn.textContent = following ? 'Follow' : 'Unfollow';
    btn.className = `btn btn-sm rounded-pill ${following ? 'btn-primary' : 'btn-outline-danger'}`;
  } catch (err) { alert(err.message); }
}

async function suggestedFollow(userId, btn) {
  const following = btn.textContent.trim() === 'Unfollow';
  try {
    await api((following ? '/api/unfollow/' : '/api/follow/') + userId, { method: 'POST' });
    btn.textContent = following ? 'Follow' : 'Unfollow';
    btn.className = `btn btn-sm rounded-pill ${following ? 'btn-primary' : 'btn-outline-danger'}`;
  } catch (err) { alert(err.message); }
}

/* ============================================
   RENDER POSTS
   ============================================ */
function renderPosts(posts) {
  if (posts.length === 0) return '<div class="card shadow-sm border-0 rounded-4 p-4 text-center"><p class="text-muted mb-0">No posts yet.</p></div>';
  return '<div class="card shadow-sm border-0 rounded-4 p-3">' + posts.map((p, i) => {
    const user = p.user;
    return `
    <div class="post-item" style="animation-delay:${i * 0.06}s">
      <div class="post-header">
        <div class="post-avatar">${user && user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : (user ? getInitials(user.displayName) : '?')}</div>
        <div class="post-header-info">
          <a href="/profile.html?id=${user ? user.id : ''}" class="post-author">${user ? escHtml(user.displayName) : 'Unknown'}</a>
          <div class="post-time">${timeAgo(p.createdAt)}</div>
        </div>
      ${__currentUserId && user && user.id === __currentUserId ? `<div class="post-header-actions"><button class="post-edit-btn" onclick="openEditPost('${p.id}')" title="Edit"><i class="bi bi-pencil"></i></button><button class="post-delete-btn" onclick="deletePost('${p.id}')" title="Delete"><i class="bi bi-trash3"></i></button></div>` : ''}
      </div>
      ${p.content ? `<div class="post-text">${escHtml(p.content)}</div>` : ''}
      ${p.imageUrl ? `<div class="post-media"><img src="${p.imageUrl}" alt="" loading="lazy"></div>` : ''}
      ${p.videoUrl ? `<div class="post-media"><video src="${p.videoUrl}" controls preload="metadata"></video></div>` : ''}
      <div class="post-actions">
        <button class="${p.isLiked ? 'liked' : ''}" onclick="toggleLike('${p.id}', this)">${p.isLiked ? '❤️' : '♡'} <span>${p.likeCount || 0}</span></button>
        <button onclick="openComments('${p.id}')">💬 <span>${p.commentCount || 0}</span></button>
      </div>
    </div>`;
  }).join('') + '</div>';
}

async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;
  try {
    await api('/api/posts/' + postId, { method: 'DELETE' });
    window.location.reload();
  } catch (err) { alert(err.message); }
}

let editingPostId = null;

async function openEditPost(postId) {
  editingPostId = postId;
  const modal = new bootstrap.Modal(document.getElementById('edit-post-modal'));
  const posts = document.querySelectorAll('.post-item');
  for (const el of posts) {
    const btn = el.querySelector('[onclick*="' + postId + '"]');
    if (btn) {
      const textEl = el.querySelector('.post-text');
      const mediaEl = el.querySelector('.post-media img, .post-media video');
      const urlEl = el.querySelector('.post-media img');
      document.getElementById('edit-post-content').value = textEl ? textEl.textContent : '';
      document.getElementById('edit-post-url').value = urlEl ? urlEl.src : '';
      break;
    }
  }
  document.getElementById('edit-post-save').onclick = async () => {
    const content = document.getElementById('edit-post-content').value;
    const imageUrl = document.getElementById('edit-post-url').value;
    try {
      await api('/api/posts/' + editingPostId, {
        method: 'PUT',
        body: JSON.stringify({ content, imageUrl, videoUrl: '' })
      });
      modal.hide();
      window.location.reload();
    } catch (err) { alert(err.message); }
  };
  modal.show();
}

/* ============================================
   LIKE
   ============================================ */
async function toggleLike(postId, btn) {
  try {
    const wasLiked = btn.classList.contains('liked');
    const data = wasLiked
      ? await api('/api/unlike/' + postId, { method: 'POST' })
      : await api('/api/like/' + postId, { method: 'POST' });
    btn.classList.toggle('liked');
    if (!wasLiked) {
      btn.classList.add('like-btn-anim');
      setTimeout(() => btn.classList.remove('like-btn-anim'), 400);
      fireConfetti();
    }
    btn.innerHTML = (btn.classList.contains('liked') ? '❤️' : '♡') + ' <span>' + data.likeCount + '</span>';
  } catch { }
}

/* ============================================
   COMMENTS
   ============================================ */
let activePostId = null;
let commentModal = null;

async function openComments(postId) {
  activePostId = postId;
  if (!commentModal) commentModal = new bootstrap.Modal(document.getElementById('comment-modal'));
  commentModal.show();
  await loadComments(postId);

  buildEmojiPicker('comment-emoji-picker', 'comment-input');
  setupEmojiPicker('comment-emoji-btn', 'comment-emoji-picker');

  document.getElementById('comment-btn').onclick = async () => {
    const input = document.getElementById('comment-input');
    if (!input.value.trim()) return;
    try {
      const data = await api('/api/comments/' + postId, { method: 'POST', body: JSON.stringify({ content: input.value }) });
      input.value = '';
      await loadComments(postId);
      document.querySelectorAll('.post-actions button').forEach(b => {
        if (b.innerHTML.includes('💬')) {
          const span = b.querySelector('span');
          if (span) span.textContent = parseInt(span.textContent) + 1;
        }
      });
    } catch { }
  };
}

async function loadComments(postId) {
  try {
    const data = await api('/api/comments/' + postId);
    const container = document.getElementById('comments-list');
    const postUserId = data.postUserId;
    if (data.comments.length === 0) {
      container.innerHTML = '<p class="text-muted small mb-0">No comments yet.</p>';
    } else {
      container.innerHTML = data.comments.map(c => {
        const canDelete = __currentUserId && (c.userId === __currentUserId || postUserId === __currentUserId);
        return `
        <div class="comment-item">
          <div class="d-flex align-items-center gap-2 mb-1">
            <a href="/profile.html?id=${c.user.id}" class="comment-author">${escHtml(c.user.displayName)}</a>
            <span class="comment-time">${timeAgo(c.createdAt)}</span>
            ${canDelete ? `<button class="comment-delete-btn" onclick="deleteComment('${c.id}')" title="Delete"><i class="bi bi-x"></i></button>` : ''}
          </div>
          <div class="comment-text">${escHtml(c.content)}</div>
        </div>`;
      }).join('');
    }
  } catch { }
}

async function deleteComment(commentId) {
  if (!confirm('Delete this comment?')) return;
  try {
    await api('/api/comments/' + commentId, { method: 'DELETE' });
    if (activePostId) loadComments(activePostId);
  } catch (err) { alert(err.message); }
}

/* ============================================
   PROFILE PAGE
   ============================================ */
if (window.location.pathname === '/profile.html') {
  let currentUser = null, viewedUserId = null;

  async function initProfile() {
    currentUser = await checkAuth();
    if (currentUser) {
      __currentUserId = currentUser.id;
      document.getElementById('logout-btn').style.display = 'inline-block';
      setNavAvatar(currentUser);
    }
    const queryId = getQueryParam('id');
    if (!currentUser && !queryId) { window.location.href = '/login.html'; return; }
    viewedUserId = queryId || currentUser.id;
    createParticles('profile-particles');
    loadProfile(viewedUserId);
  }

  async function loadProfile(userId) {
    try {
      const data = await api('/api/users/' + userId);
      const u = data.user;
      viewedUserId = u.id;

      document.getElementById('profile-display').textContent = u.displayName;
      document.getElementById('profile-username').textContent = '@' + u.username;
      document.getElementById('profile-bio').textContent = u.bio || 'No bio yet.';

      const avatarEl = document.getElementById('profile-avatar');
      if (u.avatar) {
        avatarEl.style.background = `url("${u.avatar}") center/cover no-repeat`;
        avatarEl.textContent = '';
      } else {
        avatarEl.style.background = '';
        avatarEl.textContent = getInitials(u.displayName);
      }

      const editAvatarEl = document.getElementById('edit-profile-avatar');
      if (editAvatarEl) {
        if (u.avatar) {
          editAvatarEl.style.background = `url("${u.avatar}") center/cover no-repeat`;
          editAvatarEl.textContent = '';
        } else {
          editAvatarEl.style.background = '';
          editAvatarEl.textContent = getInitials(u.displayName);
        }
      }

      const uploadLabel = document.getElementById('avatar-upload-label');
      if (uploadLabel) {
        uploadLabel.style.display = (currentUser && userId === currentUser.id) ? 'flex' : 'none';
      }

      document.getElementById('profile-followers').textContent = u.followerCount;
      document.getElementById('profile-following').textContent = u.followingCount;

      document.getElementById('profile-followers').parentElement.onclick = () => openFollowersModal(viewedUserId);
      document.getElementById('profile-following').parentElement.onclick = () => openFollowingModal(viewedUserId);

      const actionsDiv = document.getElementById('profile-actions');
      actionsDiv.innerHTML = '';

      const postsRes = await api('/api/posts/user/' + userId);
      document.getElementById('profile-post-count').textContent = postsRes.posts.length;

      const postsContainer = document.getElementById('profile-posts');
      postsContainer.innerHTML = renderPosts(postsRes.posts);

      loadLikedPosts(userId);

      if (currentUser && userId === currentUser.id) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-outline-light btn-sm rounded-pill';
        editBtn.innerHTML = '<i class="bi bi-pencil me-1"></i> Edit Profile';
        editBtn.onclick = () => {
          const editDiv = document.getElementById('edit-section');
          editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
          editDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.getElementById('edit-display').value = u.displayName;
          document.getElementById('edit-bio').value = u.bio || '';
          const editAvatarEl = document.getElementById('edit-profile-avatar');
          if (editAvatarEl) {
            if (u.avatar) {
              editAvatarEl.style.background = `url("${u.avatar}") center/cover no-repeat`;
              editAvatarEl.textContent = '';
            } else {
              editAvatarEl.style.background = '';
              editAvatarEl.textContent = getInitials(u.displayName);
            }
          }
        };
        actionsDiv.appendChild(editBtn);
      } else if (currentUser) {
        const btn = document.createElement('button');
        btn.className = `btn ${u.isFollowing ? 'btn-outline-light' : 'btn-primary'} btn-sm rounded-pill`;
        btn.innerHTML = u.isFollowing
          ? '<i class="bi bi-person-dash me-1"></i> Unfollow'
          : '<i class="bi bi-person-plus me-1"></i> Follow';
        btn.onclick = async () => {
          await api((u.isFollowing ? '/api/unfollow/' : '/api/follow/') + userId, { method: 'POST' });
          loadProfile(userId);
        };
        actionsDiv.appendChild(btn);
      }
    } catch (err) {
      document.getElementById('profile-posts').innerHTML = '<div class="card shadow-sm border-0 rounded-4 p-4"><p class="text-muted mb-0">Error loading profile.</p></div>';
    }
  }

  async function loadLikedPosts(userId) {
    try {
      const data = await api('/api/posts/liked/' + userId);
      const container = document.getElementById('profile-likes');
      container.innerHTML = data.posts.length > 0 ? renderPosts(data.posts) : '<div class="card shadow-sm border-0 rounded-4 p-4 text-center"><p class="text-muted mb-0">No liked posts yet.</p></div>';
    } catch {
      document.getElementById('profile-likes').innerHTML = '<div class="card shadow-sm border-0 rounded-4 p-4 text-center"><p class="text-muted mb-0">Could not load likes.</p></div>';
    }
  }

  async function openFollowingModal(userId) {
    try {
      const data = await api('/api/users/' + userId + '/following');
      const modal = new bootstrap.Modal(document.getElementById('following-modal'));
      const list = document.getElementById('following-list');
      if (data.users.length === 0) {
        list.innerHTML = '<p class="text-muted small mb-0">Not following anyone yet.</p>';
      } else {
        list.innerHTML = data.users.map(u => `
          <div class="follow-user-item">
            <div class="fu-avatar">${u.avatar ? `<img src="${u.avatar}">` : getInitials(u.displayName)}</div>
            <div class="fu-info">
              <a href="/profile.html?id=${u.id}" class="fu-name">${escHtml(u.displayName)}</a>
              <div class="fu-username">@${escHtml(u.username)}</div>
            </div>
            ${currentUser && u.id !== currentUser.id ? `<button class="btn btn-sm rounded-pill ${u.isFollowing ? 'btn-outline-danger' : 'btn-primary'}" onclick="followInList('${u.id}', this)">${u.isFollowing ? 'Unfollow' : 'Follow'}</button>` : ''}
          </div>
        `).join('');
      }
      modal.show();
    } catch { }
  }

  async function openFollowersModal(userId) {
    try {
      const data = await api('/api/users/' + userId + '/followers');
      const modal = new bootstrap.Modal(document.getElementById('followers-modal'));
      const list = document.getElementById('followers-list');
      if (data.users.length === 0) {
        list.innerHTML = '<p class="text-muted small mb-0">No followers yet.</p>';
      } else {
        list.innerHTML = data.users.map(u => `
          <div class="follow-user-item">
            <div class="fu-avatar">${u.avatar ? `<img src="${u.avatar}">` : getInitials(u.displayName)}</div>
            <div class="fu-info">
              <a href="/profile.html?id=${u.id}" class="fu-name">${escHtml(u.displayName)}</a>
              <div class="fu-username">@${escHtml(u.username)}</div>
            </div>
            ${currentUser && u.id !== currentUser.id ? `<button class="btn btn-sm rounded-pill ${u.isFollowing ? 'btn-outline-danger' : 'btn-primary'}" onclick="followInList('${u.id}', this)">${u.isFollowing ? 'Unfollow' : 'Follow'}</button>` : ''}
          </div>
        `).join('');
      }
      modal.show();
    } catch { }
  }

  document.getElementById('avatar-upload')?.addEventListener('change', async () => {
    const file = document.getElementById('avatar-upload').files[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res = await fetch('/api/upload-avatar', { method: 'POST', credentials: 'same-origin', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const avatarEl = document.getElementById('profile-avatar');
      avatarEl.style.background = `url("${data.avatar}?t=${Date.now()}") center/cover no-repeat`;
      avatarEl.textContent = '';
    } catch (err) { alert(err.message); }
  });

  let pendingEditAvatar = null;

  document.getElementById('edit-avatar-upload')?.addEventListener('change', async () => {
    const file = document.getElementById('edit-avatar-upload').files[0];
    if (!file) return;
    pendingEditAvatar = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const el = document.getElementById('edit-profile-avatar');
      el.style.background = `url("${e.target.result}") center/cover no-repeat`;
      el.textContent = '';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
    try {
      if (pendingEditAvatar) {
        const form = new FormData();
        form.append('avatar', pendingEditAvatar);
        const res = await fetch('/api/upload-avatar', { method: 'POST', credentials: 'same-origin', body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const heroAvatar = document.getElementById('profile-avatar');
        heroAvatar.style.background = `url("${data.avatar}?t=${Date.now()}") center/cover no-repeat`;
        heroAvatar.textContent = '';
        pendingEditAvatar = null;
      }
      await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: document.getElementById('edit-display').value,
          bio: document.getElementById('edit-bio').value
        })
      });
      document.getElementById('profile-display').textContent = document.getElementById('edit-display').value;
      document.getElementById('profile-bio').textContent = document.getElementById('edit-bio').value || 'No bio yet.';
      setNavAvatar({ displayName: document.getElementById('edit-display').value, username: '' });
      document.getElementById('edit-section').style.display = 'none';
    } catch (err) { alert(err.message); }
  });

  buildEmojiPicker('edit-emoji-picker', 'edit-bio');
  setupEmojiPicker('edit-emoji-btn', 'edit-emoji-picker');

  initProfile();
}

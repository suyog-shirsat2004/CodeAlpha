const STORE = {
  _get(key) {
    try { return JSON.parse(localStorage.getItem(`pf_${key}`) || '[]'); }
    catch { return []; }
  },
  _set(key, data) { localStorage.setItem(`pf_${key}`, JSON.stringify(data)); },
  _genId() { return crypto.randomUUID(); },
  _now() { return new Date().toISOString(); },

  users: {
    all() { return STORE._get('users'); },
    save(u) { STORE._set('users', u); },
  },
  projects: {
    all() { return STORE._get('projects'); },
    save(p) { STORE._set('projects', p); },
  },
  tasks: {
    all() { return STORE._get('tasks'); },
    save(t) { STORE._set('tasks', t); },
  },
  comments: {
    all() { return STORE._get('comments'); },
    save(c) { STORE._set('comments', c); },
  },
};

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return {}; }
}

function makeErr(msg, status = 400) {
  const e = new Error(msg);
  e.response = { data: { message: msg }, status };
  throw e;
}

function toPublic(u) {
  return { _id: u._id, name: u.name, email: u.email, avatar: u.avatar || '' };
}

function popMembers(ids) {
  const users = STORE.users.all();
  return (ids || []).map(id => {
    const u = users.find(x => x._id === id);
    return u ? toPublic(u) : { _id: id };
  });
}

function popOwner(id) {
  if (!id) return null;
  const u = STORE.users.all().find(x => x._id === id);
  return u ? toPublic(u) : { _id: id };
}

function makeToken(userId) {
  return btoa(JSON.stringify({ id: userId, t: Date.now() }));
}

export const authAPI = {
  async register(data) {
    const users = STORE.users.all();
    if (users.find(u => u.email === data.email)) makeErr('User already exists with this email');
    if (data.password.length < 6) makeErr('Password must be at least 6 characters');
    const user = { _id: STORE._genId(), name: data.name, email: data.email, password: data.password, avatar: '', role: 'user', createdAt: STORE._now(), updatedAt: STORE._now() };
    users.push(user);
    STORE.users.save(users);
    return { data: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, token: makeToken(user._id) } };
  },

  async login(data) {
    const users = STORE.users.all();
    const user = users.find(u => u.email === data.email && u.password === data.password);
    if (!user) makeErr('Invalid email or password', 401);
    return { data: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, token: makeToken(user._id) } };
  },

  async getMe() {
    const stored = getStoredUser();
    if (!stored._id) makeErr('Not authorized', 401);
    const user = STORE.users.all().find(u => u._id === stored._id);
    if (!user) makeErr('User not found', 401);
    return { data: toPublic(user) };
  },

  async searchUsers(q) {
    const query = q.toLowerCase();
    return { data: STORE.users.all().filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)).slice(0, 10).map(toPublic) };
  },
};

export const projectAPI = {
  async create(data) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const proj = { _id: STORE._genId(), projectName: data.projectName, description: data.description || '', owner: s._id, members: [s._id], status: 'active', color: data.color || '#6366f1', createdAt: STORE._now(), updatedAt: STORE._now() };
    const projects = STORE.projects.all();
    projects.push(proj);
    STORE.projects.save(projects);
    return { data: { ...proj, members: popMembers(proj.members), owner: popOwner(proj.owner) } };
  },

  async getAll() {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    return { data: STORE.projects.all().filter(p => p.owner === s._id || (p.members || []).includes(s._id)).map(p => ({ ...p, members: popMembers(p.members), owner: popOwner(p.owner) })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) };
  },

  async getOne(id) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const p = STORE.projects.all().find(x => x._id === id);
    if (!p) makeErr('Project not found', 404);
    const e = { ...p, members: popMembers(p.members), owner: popOwner(p.owner) };
    if (!e.members.some(m => m._id === s._id) && e.owner._id !== s._id) makeErr('Not authorized to access this project', 403);
    return { data: e };
  },

  async update(id, data) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const projects = STORE.projects.all();
    const idx = projects.findIndex(p => p._id === id);
    if (idx === -1) makeErr('Project not found', 404);
    if (projects[idx].owner !== s._id) makeErr('Only the project owner can update', 403);
    Object.assign(projects[idx], data, { updatedAt: STORE._now() });
    STORE.projects.save(projects);
    return { data: { ...projects[idx], members: popMembers(projects[idx].members), owner: popOwner(projects[idx].owner) } };
  },

  async delete(id) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const projects = STORE.projects.all();
    const idx = projects.findIndex(p => p._id === id);
    if (idx === -1) makeErr('Project not found', 404);
    if (projects[idx].owner !== s._id) makeErr('Only the project owner can delete', 403);
    const taskIds = STORE.tasks.all().filter(t => t.project === id).map(t => t._id);
    projects.splice(idx, 1);
    STORE.projects.save(projects);
    STORE.tasks.save(STORE.tasks.all().filter(t => t.project !== id));
    STORE.comments.save(STORE.comments.all().filter(c => !taskIds.includes(c.task)));
    return { data: { message: 'Project removed' } };
  },

  async addMember(id, userId) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const projects = STORE.projects.all();
    const idx = projects.findIndex(p => p._id === id);
    if (idx === -1) makeErr('Project not found', 404);
    if (projects[idx].owner !== s._id) makeErr('Only the project owner can add members', 403);
    if ((projects[idx].members || []).includes(userId)) makeErr('User is already a member');
    projects[idx].members = [...(projects[idx].members || []), userId];
    projects[idx].updatedAt = STORE._now();
    STORE.projects.save(projects);
    return { data: { ...projects[idx], members: popMembers(projects[idx].members), owner: popOwner(projects[idx].owner) } };
  },

  async removeMember(id, memberId) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const projects = STORE.projects.all();
    const idx = projects.findIndex(p => p._id === id);
    if (idx === -1) makeErr('Project not found', 404);
    if (projects[idx].owner !== s._id) makeErr('Only the project owner can remove members', 403);
    if (projects[idx].owner === memberId) makeErr('Cannot remove the project owner');
    projects[idx].members = (projects[idx].members || []).filter(m => m !== memberId);
    projects[idx].updatedAt = STORE._now();
    STORE.projects.save(projects);
    return { data: { ...projects[idx], members: popMembers(projects[idx].members), owner: popOwner(projects[idx].owner) } };
  },
};

export const taskAPI = {
  async getByProject(projectId) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    return { data: STORE.tasks.all().filter(t => t.project === projectId).sort((a, b) => (a.order || 0) - (b.order || 0)).map(t => ({ ...t, assignedTo: t.assignedTo ? popOwner(t.assignedTo) : null, createdBy: popOwner(t.createdBy) })) };
  },

  async create(projectId, data) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const pt = STORE.tasks.all().filter(t => t.project === projectId && t.status === (data.status || 'todo'));
    const mo = pt.length > 0 ? Math.max(...pt.map(t => t.order || 0)) : -1;
    const task = { _id: STORE._genId(), title: data.title, description: data.description || '', project: projectId, assignedTo: data.assignedTo || null, status: data.status || 'todo', priority: data.priority || 'medium', dueDate: data.dueDate || null, order: mo + 1, createdBy: s._id, createdAt: STORE._now(), updatedAt: STORE._now() };
    const tasks = STORE.tasks.all();
    tasks.push(task);
    STORE.tasks.save(tasks);
    return { data: { ...task, assignedTo: task.assignedTo ? popOwner(task.assignedTo) : null, createdBy: popOwner(task.createdBy) } };
  },

  async getOne(id) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const task = STORE.tasks.all().find(t => t._id === id);
    if (!task) makeErr('Task not found', 404);
    return { data: { ...task, assignedTo: task.assignedTo ? popOwner(task.assignedTo) : null, createdBy: popOwner(task.createdBy) } };
  },

  async update(id, data) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const tasks = STORE.tasks.all();
    const idx = tasks.findIndex(t => t._id === id);
    if (idx === -1) makeErr('Task not found', 404);
    Object.assign(tasks[idx], data, { updatedAt: STORE._now() });
    STORE.tasks.save(tasks);
    return { data: { ...tasks[idx], assignedTo: tasks[idx].assignedTo ? popOwner(tasks[idx].assignedTo) : null, createdBy: popOwner(tasks[idx].createdBy) } };
  },

  async delete(id) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const tasks = STORE.tasks.all();
    const idx = tasks.findIndex(t => t._id === id);
    if (idx === -1) makeErr('Task not found', 404);
    tasks.splice(idx, 1);
    STORE.tasks.save(tasks);
    STORE.comments.save(STORE.comments.all().filter(c => c.task !== id));
    return { data: { message: 'Task removed' } };
  },

  async reorder(data) {
    const tasks = STORE.tasks.all();
    for (const t of data.tasks || []) {
      const idx = tasks.findIndex(x => x._id === t._id);
      if (idx !== -1) { tasks[idx].order = t.order; tasks[idx].status = t.status; tasks[idx].updatedAt = STORE._now(); }
    }
    STORE.tasks.save(tasks);
    return { data: { message: 'Tasks reordered' } };
  },
};

export const commentAPI = {
  async getByTask(taskId) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    return { data: STORE.comments.all().filter(c => c.task === taskId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(c => ({ ...c, user: popOwner(c.user) })) };
  },

  async create(taskId, message) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    if (!message || !message.trim()) makeErr('Comment message is required');
    const c = { _id: STORE._genId(), task: taskId, user: s._id, message: message.trim(), createdAt: STORE._now(), updatedAt: STORE._now() };
    const comments = STORE.comments.all();
    comments.push(c);
    STORE.comments.save(comments);
    return { data: { ...c, user: popOwner(c.user) } };
  },

  async delete(id) {
    const s = getStoredUser();
    if (!s._id) makeErr('Not authorized', 401);
    const comments = STORE.comments.all();
    const idx = comments.findIndex(c => c._id === id);
    if (idx === -1) makeErr('Comment not found', 404);
    if (comments[idx].user !== s._id) makeErr('Not authorized to delete this comment', 403);
    comments.splice(idx, 1);
    STORE.comments.save(comments);
    return { data: { message: 'Comment removed' } };
  },
};

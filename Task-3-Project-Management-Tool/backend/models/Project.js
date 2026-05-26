const db = require('../config/db');

const TABLE = 'projects';

function lookupUsers(idsArray, selectFields) {
  if (!idsArray || idsArray.length === 0) return [];
  const fields = selectFields ? selectFields.split(' ').filter(Boolean) : [];
  return idsArray.map(id => {
    const user = db.findById('users', id);
    if (!user) return { _id: id };
    if (fields.length > 0) {
      const obj = { _id: user._id };
      for (const f of fields) {
        if (f in user) obj[f] = user[f];
      }
      return obj;
    }
    return { ...user };
  });
}

function lookupUser(id, selectFields) {
  if (!id) return null;
  const user = db.findById('users', id);
  if (!user) return { _id: id };
  const fields = selectFields ? selectFields.split(' ').filter(Boolean) : [];
  if (fields.length > 0) {
    const obj = { _id: user._id };
    for (const f of fields) {
      if (f in user) obj[f] = user[f];
    }
    return obj;
  }
  return { ...user };
}

function parseMembers(project) {
  if (!project) return null;
  if (typeof project.members === 'string') {
    try { project.members = JSON.parse(project.members); } catch { project.members = []; }
  }
  return project;
}

function stringifyMembers(data) {
  if (Array.isArray(data.members)) {
    data.members = data.members.map(m => typeof m === 'object' && m._id ? m._id : m);
    data.members = JSON.stringify(data.members);
  }
  return data;
}

function wrap(projectData) {
  if (!projectData) return null;
  const doc = { ...projectData };
  parseMembers(doc);

  doc.save = async function () {
    const data = {};
    for (const k of Object.keys(this)) {
      if (!['save', 'populate', 'deleteOne'].includes(k)) {
        data[k] = this[k];
      }
    }
    stringifyMembers(data);
    return wrap(db.updateRow(TABLE, this._id, data));
  };

  doc.populate = async function (path, selectFields) {
    if (path === 'members') {
      this.members = lookupUsers(this.members, selectFields);
    } else if (path === 'owner') {
      this.owner = lookupUser(this.owner, selectFields);
    }
    return this;
  };

  doc.deleteOne = async function () {
    db.removeMany('tasks', { project: this._id });
    db.removeMany('comments', { task: this._id, _project: this._id });
    const d = db.getDb();
    d.prepare(`DELETE FROM comments WHERE task IN (SELECT _id FROM tasks WHERE project = ?)`).run(this._id);
    return db.remove(TABLE, this._id);
  };

  return doc;
}

class Query {
  constructor(executor) {
    this._executor = executor;
    this._select = null;
    this._sort = null;
    this._limit = null;
    this._populate = [];
  }

  select(fields) { this._select = fields; return this; }
  sort(sortObj) { this._sort = sortObj; return this; }
  limit(n) { this._limit = n; return this; }
  populate(path, s) { this._populate.push({ path, select: s }); return this; }

  then(resolve, reject) {
    return this._executor(this).then(resolve, reject);
  }

  catch(reject) {
    return this._executor(this).catch(reject);
  }
}

function applyPopulate(doc, populateArr) {
  if (!doc) return null;
  for (const p of populateArr) {
    if (p.path === 'members') {
      doc.members = lookupUsers(doc.members, p.select);
    } else if (p.path === 'owner') {
      doc.owner = lookupUser(doc.owner, p.select);
    }
  }
  return doc;
}

function applyPopulateArr(docs, populateArr) {
  return docs.map(d => applyPopulate(d, populateArr));
}

const Project = {
  create: async function (data) {
    const docData = {
      _id: db.genId(),
      projectName: data.projectName,
      description: data.description || '',
      owner: data.owner,
      members: JSON.stringify(data.members || []),
      status: 'active',
      color: data.color || '#6366f1',
      createdAt: db.now(),
      updatedAt: db.now()
    };
    const doc = db.insert(TABLE, docData);
    return wrap(doc);
  },

  find: function (conditions = {}) {
    return new Query(async (q) => {
      let docs = db.findAll(TABLE, conditions, { sort: q._sort, limit: q._limit });
      docs = docs.map(wrap);
      docs = applyPopulateArr(docs, q._populate);
      return docs;
    });
  },

  findById: function (id) {
    return new Query(async (q) => {
      let doc = db.findById(TABLE, id);
      doc = wrap(doc);
      doc = applyPopulate(doc, q._populate);
      return doc;
    });
  }
};

module.exports = Project;

const db = require('../config/db');

const TABLE = 'tasks';

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

function applyPopulateToTask(task, populateArr) {
  if (!task) return null;
  for (const p of populateArr || []) {
    if (p.path === 'assignedTo') {
      task.assignedTo = lookupUser(task.assignedTo, p.select);
    } else if (p.path === 'createdBy') {
      task.createdBy = lookupUser(task.createdBy, p.select);
    }
  }
  return task;
}

function applySelect(doc, selectStr) {
  if (!selectStr || !doc) return doc;
  if (selectStr.startsWith('+')) return doc;
  if (selectStr.startsWith('-')) {
    const result = { ...doc };
    delete result[selectStr.slice(1)];
    return result;
  }
  const fields = selectStr.split(' ').filter(Boolean);
  const result = {};
  for (const f of fields) {
    if (f in doc) result[f] = doc[f];
  }
  return result;
}

function wrap(taskData) {
  if (!taskData) return null;
  const doc = { ...taskData };

  doc.save = async function () {
    const data = {};
    for (const k of Object.keys(this)) {
      if (!['save', 'populate', 'deleteOne'].includes(k)) {
        data[k] = this[k];
      }
    }
    return wrap(db.updateRow(TABLE, this._id, data));
  };

  doc.populate = async function (arr) {
    for (const p of arr || []) {
      if (p.path === 'assignedTo') {
        this.assignedTo = lookupUser(this.assignedTo, p.select);
      } else if (p.path === 'createdBy') {
        this.createdBy = lookupUser(this.createdBy, p.select);
      }
    }
    return this;
  };

  doc.deleteOne = async function () {
    db.removeMany('comments', { task: this._id });
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

const Task = {
  create: async function (data) {
    const docData = {
      _id: db.genId(),
      title: data.title,
      description: data.description || '',
      project: data.project,
      assignedTo: data.assignedTo || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      order: data.order || 0,
      createdBy: data.createdBy,
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
      docs = docs.map(d => applyPopulateToTask(d, q._populate));
      return docs;
    });
  },

  findById: function (id) {
    return new Query(async (q) => {
      let doc = db.findById(TABLE, id);
      doc = wrap(doc);
      doc = applyPopulateToTask(doc, q._populate);
      if (q._select) doc = applySelect(doc, q._select);
      return doc;
    });
  },

  findOne: function (conditions) {
    return new Query(async (q) => {
      let docs = db.findAll(TABLE, conditions, { sort: q._sort, limit: 1 });
      let doc = docs.length > 0 ? docs[0] : null;
      doc = wrap(doc);
      doc = applyPopulateToTask(doc, q._populate);
      if (q._select) doc = applySelect(doc, q._select);
      return doc;
    });
  },

  deleteMany: async function (conditions) {
    return db.removeMany(TABLE, conditions);
  },

  bulkWrite: async function (operations) {
    const d = db.getDb();
    const updateMany = d.transaction((ops) => {
      for (const op of ops) {
        const filter = op.updateOne.filter;
        const update = op.updateOne.update;
        if (update.$set) {
          const keys = Object.keys(update.$set);
          const vals = Object.values(update.$set);
          vals.push(filter._id);
          const setClause = keys.map(k => `"${k}" = ?`).join(', ');
          d.prepare(`UPDATE ${TABLE} SET ${setClause} WHERE _id = ?`).run(...vals);
        }
      }
    });
    updateMany(operations);
  }
};

module.exports = Task;

const db = require('../config/db');

const TABLE = 'comments';

function lookupUser(id, selectFields) {
  if (!id) return { _id: id };
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

function applyPopulateToComment(comment, populateArr) {
  if (!comment) return null;
  for (const p of populateArr || []) {
    if (p.path === 'user') {
      comment.user = lookupUser(comment.user, p.select);
    }
  }
  return comment;
}

function wrap(commentData) {
  if (!commentData) return null;
  const doc = { ...commentData };

  doc.save = async function () {
    const data = {};
    for (const k of Object.keys(this)) {
      if (!['save', 'populate', 'deleteOne'].includes(k)) {
        data[k] = this[k];
      }
    }
    return wrap(db.updateRow(TABLE, this._id, data));
  };

  doc.populate = async function (path, selectFields) {
    if (path === 'user') {
      this.user = lookupUser(this.user, selectFields);
    }
    return this;
  };

  doc.deleteOne = async function () {
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

const Comment = {
  create: async function (data) {
    const docData = {
      _id: db.genId(),
      task: data.task,
      user: data.user,
      message: data.message,
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
      docs = docs.map(d => applyPopulateToComment(d, q._populate));
      return docs;
    });
  },

  findById: async function (id) {
    return wrap(db.findById(TABLE, id));
  }
};

module.exports = Comment;

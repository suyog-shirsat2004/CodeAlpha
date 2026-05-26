const db = require('../config/db');
const bcrypt = require('bcryptjs');

const TABLE = 'users';

function wrap(userData) {
  if (!userData) return null;
  const doc = { ...userData };

  doc.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  };

  doc.toJSON = function () {
    const obj = { ...this };
    delete obj.password;
    delete obj.matchPassword;
    delete obj.toJSON;
    delete obj.save;
    delete obj.populate;
    delete obj.deleteOne;
    return obj;
  };

  doc.save = async function () {
    const data = {};
    for (const k of Object.keys(this)) {
      if (!['matchPassword', 'toJSON', 'save', 'populate', 'deleteOne'].includes(k)) {
        data[k] = this[k];
      }
    }
    return wrap(db.updateRow(TABLE, this._id, data));
  };

  doc.deleteOne = async function () {
    return db.remove(TABLE, this._id);
  };

  doc.populate = async function () {
    return this;
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
  populate() { return this; }

  then(resolve, reject) {
    return this._executor(this).then(resolve, reject);
  }

  catch(reject) {
    return this._executor(this).catch(reject);
  }
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
  if (!('_id' in result) && '_id' in doc) result._id = doc._id;
  return result;
}

function wrapQuery(doc) {
  return wrap(doc);
}

const User = {
  findOne: function (conditions) {
    return new Query(async (q) => {
      let docs = db.findAll(TABLE, conditions, { sort: q._sort, limit: 1 });
      let doc = docs.length > 0 ? docs[0] : null;
      doc = wrap(doc);
      if (q._select) doc = applySelect(doc, q._select);
      return doc;
    });
  },

  findById: function (id) {
    return new Query(async (q) => {
      let doc = db.findById(TABLE, id);
      doc = wrap(doc);
      if (q._select) doc = applySelect(doc, q._select);
      return doc;
    });
  },

  create: async function (data) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, salt);
    const doc = db.insert(TABLE, {
      _id: db.genId(),
      name: data.name,
      email: data.email,
      password: hashed,
      avatar: '',
      role: 'user',
      createdAt: db.now(),
      updatedAt: db.now()
    });
    return wrap(doc);
  },

  find: function (conditions = {}) {
    return new Query(async (q) => {
      let docs = db.findAll(TABLE, conditions, { sort: q._sort, limit: q._limit });
      docs = docs.map(wrap);
      if (q._select) docs = docs.map(d => applySelect(d, q._select));
      return docs;
    });
  }
};

module.exports = User;

const bcrypt = require('bcryptjs');
const db = require('../config/db');

const TABLE = 'users';

const User = {
  findOne: function (conditions) {
    const doc = db.findOne(TABLE, conditions);
    return doc;
  },

  findById: function (id) {
    return db.findById(TABLE, id);
  },

  findAll: function (conditions = {}) {
    return db.findAll(TABLE, conditions);
  },

  create: async function (data) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, salt);
    return db.insert(TABLE, {
      _id: db.genId(),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashed,
      avatar: data.avatar || '',
      createdAt: db.now(),
      updatedAt: db.now(),
    });
  },

  update: function (id, data) {
    return db.update(TABLE, id, data);
  },
};

module.exports = User;

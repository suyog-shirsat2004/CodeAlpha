const db = require('../config/db');

const TABLE = 'rooms';

const Room = {
  findOne: function (conditions) {
    const doc = db.findOne(TABLE, conditions);
    if (doc) {
      doc.participants = JSON.parse(doc.participants || '[]');
      doc.isActive = !!doc.isActive;
    }
    return doc;
  },

  findById: function (id) {
    const doc = db.findById(TABLE, id);
    if (doc) {
      doc.participants = JSON.parse(doc.participants || '[]');
      doc.isActive = !!doc.isActive;
    }
    return doc;
  },

  findAll: function (conditions = {}) {
    return db.findAll(TABLE, conditions).map(doc => {
      doc.participants = JSON.parse(doc.participants || '[]');
      doc.isActive = !!doc.isActive;
      return doc;
    });
  },

  create: function (data) {
    const doc = db.insert(TABLE, {
      _id: db.genId(),
      name: data.name,
      code: data.code,
      host: data.host,
      participants: JSON.stringify(data.participants || []),
      isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
      createdAt: db.now(),
      updatedAt: db.now(),
    });
    if (doc) {
      doc.participants = JSON.parse(doc.participants || '[]');
      doc.isActive = !!doc.isActive;
    }
    return doc;
  },

  update: function (id, data) {
    if (data.participants && Array.isArray(data.participants)) {
      data.participants = JSON.stringify(data.participants);
    }
    const doc = db.update(TABLE, id, data);
    if (doc) {
      doc.participants = JSON.parse(doc.participants || '[]');
      doc.isActive = !!doc.isActive;
    }
    return doc;
  },
};

module.exports = Room;

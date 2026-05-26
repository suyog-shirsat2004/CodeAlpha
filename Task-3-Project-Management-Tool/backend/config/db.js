const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      _id TEXT PRIMARY KEY,
      projectName TEXT NOT NULL,
      description TEXT DEFAULT '',
      owner TEXT NOT NULL,
      members TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      color TEXT DEFAULT '#6366f1',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (owner) REFERENCES users(_id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      _id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      project TEXT NOT NULL,
      assignedTo TEXT,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      dueDate TEXT,
      "order" INTEGER DEFAULT 0,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (project) REFERENCES projects(_id),
      FOREIGN KEY (assignedTo) REFERENCES users(_id),
      FOREIGN KEY (createdBy) REFERENCES users(_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      _id TEXT PRIMARY KEY,
      task TEXT NOT NULL,
      user TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (task) REFERENCES tasks(_id),
      FOREIGN KEY (user) REFERENCES users(_id)
    );

    CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner);
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task);
  `);
}

function genId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function findOne(table, conditions) {
  const d = getDb();
  const keys = Object.keys(conditions);
  const vals = Object.values(conditions);
  const where = keys.map(k => `"${k}" = ?`).join(' AND ');
  return d.prepare(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`).get(...vals) || null;
}

function findAll(table, conditions = {}, options = {}) {
  const d = getDb();
  const params = [];
  let sql = `SELECT * FROM ${table}`;
  const clauses = [];

  if (conditions.$or) {
    const orClauses = conditions.$or.map(cond => {
      return '(' + Object.entries(cond).map(([k, v]) => {
        if (v && typeof v === 'object' && '$regex' in v) {
          params.push(`%${v.$regex}%`);
          return `"${k}" LIKE ?`;
        }
        if (k === 'members') {
          params.push(`%"${v}"%`);
          return `"${k}" LIKE ?`;
        }
        params.push(v);
        return `"${k}" = ?`;
      }).join(' AND ') + ')';
    });
    clauses.push('(' + orClauses.join(' OR ') + ')');
    delete conditions.$or;
  }

  const andKeys = Object.keys(conditions);
  if (andKeys.length > 0) {
    const andClauses = andKeys.map(k => {
      const v = conditions[k];
      if (v && typeof v === 'object' && '$regex' in v) {
        params.push(`%${v.$regex}%`);
        return `"${k}" LIKE ?`;
      }
      params.push(v);
      return `"${k}" = ?`;
    }).join(' AND ');
    clauses.push(andClauses);
  }

  if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');

  if (options.sort) {
    const sk = Object.keys(options.sort)[0];
    const sd = options.sort[sk] === -1 ? 'DESC' : 'ASC';
    sql += ` ORDER BY "${sk}" ${sd}`;
  }

  if (options.limit) sql += ` LIMIT ${options.limit}`;

  return d.prepare(sql).all(...params);
}

function findById(table, id) {
  const d = getDb();
  return d.prepare(`SELECT * FROM ${table} WHERE _id = ?`).get(id) || null;
}

function insert(table, data) {
  const d = getDb();
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const cols = keys.map(k => `"${k}"`).join(', ');
  const ph = keys.map(() => '?').join(', ');
  d.prepare(`INSERT INTO ${table} (${cols}) VALUES (${ph})`).run(...vals);
  return findById(table, data._id);
}

function updateRow(table, id, data) {
  const d = getDb();
  data.updatedAt = now();
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const set = keys.map(k => `"${k}" = ?`).join(', ');
  d.prepare(`UPDATE ${table} SET ${set} WHERE _id = ?`).run(...vals, id);
  return findById(table, id);
}

function remove(table, id) {
  const d = getDb();
  return d.prepare(`DELETE FROM ${table} WHERE _id = ?`).run(id);
}

function removeMany(table, conditions) {
  const d = getDb();
  const keys = Object.keys(conditions);
  const vals = Object.values(conditions);
  const where = keys.map(k => `"${k}" = ?`).join(' AND ');
  return d.prepare(`DELETE FROM ${table} WHERE ${where}`).run(...vals);
}

function search(table, field, query, limit = 10) {
  const d = getDb();
  const sql = `SELECT * FROM ${table} WHERE "${field}" LIKE ? LIMIT ${limit}`;
  return d.prepare(sql).all(`%${query}%`);
}

function searchMulti(table, fields, query, limit = 10) {
  const d = getDb();
  const likeClauses = fields.map(f => `"${f}" LIKE ?`).join(' OR ');
  const sql = `SELECT * FROM ${table} WHERE (${likeClauses}) LIMIT ${limit}`;
  const params = fields.map(() => `%${query}%`);
  return d.prepare(sql).all(...params);
}

module.exports = { getDb, genId, now, findOne, findAll, findById, insert, updateRow, remove, removeMany, search, searchMulti };

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;

async function getDb() {
  if (!db) {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=ON');
    initTables();
  }
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      host TEXT NOT NULL,
      participants TEXT DEFAULT '[]',
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  saveDb();
}

function genId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function findOne(table, conditions) {
  const keys = Object.keys(conditions);
  const vals = Object.values(conditions);
  const where = keys.map(k => `"${k}" = ?`).join(' AND ');
  const stmt = db.prepare(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`);
  stmt.bind(vals);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function findById(table, id) {
  return findOne(table, { _id: id });
}

function findAll(table, conditions = {}) {
  const keys = Object.keys(conditions);
  const vals = Object.values(conditions);
  let sql = `SELECT * FROM ${table}`;
  if (keys.length > 0) {
    const where = keys.map(k => `"${k}" = ?`).join(' AND ');
    sql += ` WHERE ${where}`;
  }
  const stmt = db.prepare(sql);
  stmt.bind(vals);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function insert(table, data) {
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const cols = keys.map(k => `"${k}"`).join(', ');
  const ph = keys.map(() => '?').join(', ');
  db.run(`INSERT INTO ${table} (${cols}) VALUES (${ph})`, vals);
  saveDb();
  return findById(table, data._id);
}

function updateRow(table, id, data) {
  data.updatedAt = now();
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const set = keys.map(k => `"${k}" = ?`).join(', ');
  db.run(`UPDATE ${table} SET ${set} WHERE _id = ?`, [...vals, id]);
  saveDb();
  return findById(table, id);
}

function remove(table, id) {
  db.run(`DELETE FROM ${table} WHERE _id = ?`, [id]);
  saveDb();
}

module.exports = { getDb, genId, now, findOne, findById, findAll, insert, update: updateRow, remove };

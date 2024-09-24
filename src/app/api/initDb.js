import sqlite3 from "sqlite3";

export function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("messages.db", (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

export async function initDb() {
  let db;
  try {
    db = await openDb();
    console.log("Database opened successfully in initDb");

    await db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        points INTEGER DEFAULT 0,
        avatar TEXT
      )`);
    console.log("Users table created or already exists");

    await db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatname TEXT,
      nameColor TEXT,
      chatbadges TEXT,
      backgroundColor TEXT,
      textColor TEXT,
      chatmessage TEXT,
      chatimg TEXT,
      hasDonation TEXT,
      membership TEXT,
      subtitle TEXT,
      textonly BOOLEAN,
      type TEXT,
      event BOOLEAN,
      tid INTEGER,
      mid INTEGER,
      sourceImg TEXT,
      logo TEXT,
      processed BOOLEAN DEFAULT 0,
      rating INTEGER DEFAULT 0
    )`);
    console.log("Messages table created or already exists");
  } finally {
    if (db) {
      db.close();
      console.log("Database closed in initDb");
    }
  }
}

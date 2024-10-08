import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";

import { openDb } from "../api/initDb";

function insertMessage(db, message) {
  return new Promise((resolve, reject) => {
    db.run(`
        INSERT INTO messages (
          chatname, nameColor, chatbadges, backgroundColor, textColor,
          chatmessage, chatimg, hasDonation, membership, subtitle,
          textonly, type, event, tid, mid, sourceImg, logo, processed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        message.chatname,
        message.nameColor,
        JSON.stringify(message.chatbadges),
        message.backgroundColor,
        message.textColor,
        message.chatmessage,
        message.chatimg,
        message.hasDonation,
        message.membership,
        '',
        message.textonly,
        message.type,
        message.event,
        message.tid,
        message.id,
        message.sourceImg,
        message.logo,
        false // Set processed to false initially
      ], function (err) {
        if (err) reject(err);
        else {
          // Update or insert user into users table
          db.run(
            `INSERT INTO users (name) VALUES (?) ON CONFLICT (name) DO UPDATE SET points = points + 1`,
            [message.chatname],
            function (err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        }
      });
  });
}

export async function POST(request) {
console.log("POST request received");

let db;
try {
  db = await openDb();
  console.log("Database opened successfully");

  const body = await request.json();

  await new Promise((resolve, reject) => {
    db.run("BEGIN TRANSACTION", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const lastId = await insertMessage(db, body);

  await new Promise((resolve, reject) => {
    db.run("COMMIT", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  console.log("Message inserted successfully, row ID:", lastId);
  return NextResponse.json({ message: "Message saved successfully", id: lastId });
} catch (error) {
  console.error("Error processing request:", error);
  if (db) {
    await new Promise((resolve) => {
      db.run("ROLLBACK", () => resolve());
    }).catch((rollbackErr) => {
      console.error("Error rolling back transaction:", rollbackErr);
    });
  }
  return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
} finally {
  if (db) {
    await new Promise((resolve) => {
      db.close((err) => {
        if (err) console.error("Error closing database:", err);
        else console.log("Database closed");
        resolve();
      });
    });
  }
}
}

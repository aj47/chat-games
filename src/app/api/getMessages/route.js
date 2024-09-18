import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";

// Global variable to hold the SSE response stream
let sseResponseStream;

export async function GET(request) {
  const res = NextResponse.json({ messages: [] }); // Initial empty response

  // Set SSE headers
  res.headers.set('Content-Type', 'text/event-stream');
  res.headers.set('Cache-Control', 'no-cache');
  res.headers.set('Connection', 'keep-alive');

  const db = new sqlite3.Database("messages.db", (err) => {
    if (err) {
      console.error("Error opening database:", err);
      res.body.write(` ${JSON.stringify({ error: "Failed to open database" })}\n\n`);
      res.body.close();
      return;
    }

    console.log("Database opened successfully");

    // Send initial messages
    db.all("SELECT * FROM messages ORDER BY id ASC", [], (err, rows) => {
      if (err) {
        console.error("Error fetching initial messages:", err);
        res.body.write(` ${JSON.stringify({ error: "Failed to fetch messages" })}\n\n`);
      } else {
        res.body.write(` ${JSON.stringify({ messages: rows })}\n\n`);
      }
    });

    // Store the response stream for later use in the POST handler
    sseResponseStream = res.body;

    // Close the database connection when the response stream closes
    res.body.on('close', () => {
      db.close((err) => {
        if (err) console.error("Error closing database:", err);
        else console.log("Database closed");
      });
    });
  });

  return res;
}

// Modify the POST handler to send new messages to the SSE stream
export async function POST(request) {
  console.log("POST request received");
  
  let db;
  try {
    db = await openDb();
    console.log("Database opened successfully");

    const body = await request.json();
    console.log("Received message:", body);

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

    // Send the new message to the SSE stream
    if (sseResponseStream) {
      db.get("SELECT * FROM messages WHERE id = ?", [lastId], (err, row) => {
        if (err) {
          console.error("Error fetching inserted message:", err);
        } else {
          sseResponseStream.write(` ${JSON.stringify({ messages: [row] })}\n\n`);
        }
      });
    }

    return NextResponse.json({ message: "Message saved successfully", id: lastId });
  } catch (error) {
    console.error("Error processing request:", error);
    if (db) {
      await new Promise((resolve) => {
        db.run("ROLLBACK", () => resolve());
      }).catch(rollbackErr => {
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

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("messages.db", (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function insertMessage(db, message) {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
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
    logo TEXT
  )`, (err) => {
    if (err) reject(err);
    else {
      db.run(`
        INSERT INTO messages (
          chatname, nameColor, chatbadges, backgroundColor, textColor,
          chatmessage, chatimg, hasDonation, membership, subtitle,
          textonly, type, event, tid, mid, sourceImg, logo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        message.subtitle,
        message.textonly,
        message.type,
        message.event,
        message.tid,
        message.id,
        message.sourceImg,
        message.logo
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    }
  });
  });
}

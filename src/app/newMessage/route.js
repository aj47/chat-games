import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";

export async function POST(request) {
  console.log("POST request received");
  
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database("messages.db", (err) => {
      if (err) {
        console.error("Error opening database:", err);
        resolve(NextResponse.json({ error: "Failed to open database" }, { status: 500 }));
        return;
      }
      console.log("Database opened successfully");
    });

    try {
      const body = await request.json();
      console.log("Received message:", body);

      // Create a table if it doesn't exist
      db.run(
        `CREATE TABLE IF NOT EXISTS messages (
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
        )`,
        (err) => {
          if (err) {
            console.error("Error creating table:", err);
            resolve(NextResponse.json({ error: "Failed to create table" }, { status: 500 }));
            return;
          }
          console.log("Table created or already exists");
        }
      );

      db.run("BEGIN TRANSACTION");

      // Insert the message into the database
      db.run(
        `INSERT INTO messages (
          chatname,
          nameColor,
          chatbadges,
          backgroundColor,
          textColor,
          chatmessage,
          chatimg,
          hasDonation,
          membership,
          subtitle,
          textonly,
          type,
          event,
          tid,
          mid,
          sourceImg,
          logo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          body.chatname,
          body.nameColor,
          JSON.stringify(body.chatbadges),
          body.backgroundColor,
          body.textColor,
          body.chatmessage,
          body.chatimg,
          body.hasDonation,
          body.membership,
          body.subtitle,
          body.textonly,
          body.type,
          body.event,
          body.tid,
          body.id,
          body.sourceImg,
          body.logo
        ],
        function(err) {
        if (err) {
          console.error("Error inserting message:", err);
          db.run("ROLLBACK");
          resolve(NextResponse.json({ error: "Failed to save message" }, { status: 500 }));
        } else {
          console.log("Message inserted successfully, row ID:", this.lastID);
          db.run("COMMIT", (commitErr) => {
            if (commitErr) {
              console.error("Error committing transaction:", commitErr);
              db.run("ROLLBACK");
              resolve(NextResponse.json({ error: "Failed to commit message" }, { status: 500 }));
            } else {
              console.log("Transaction committed successfully");
              resolve(NextResponse.json({ message: "Message saved successfully" }));
            }
          });
        }
      });
    } catch (error) {
      console.error("Error processing request:", error);
      resolve(NextResponse.json({ error: "Failed to process request" }, { status: 500 }));
    } finally {
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
        } else {
          console.log("Database closed");
        }
      });
    }
  });
}

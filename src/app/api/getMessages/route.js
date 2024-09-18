import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";

export async function GET(request) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("messages.db", (err) => {
      if (err) {
        console.error("Error opening database:", err);
        resolve(NextResponse.json({ error: "Failed to open database" }, { status: 500 }));
        return;
      }
      console.log("Database opened successfully");

      db.all("SELECT * FROM messages ORDER BY id DESC LIMIT 25", [], (err, rows) => {
        if (err) {
          console.error("Error fetching messages:", err);
          resolve(NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ messages: rows }));
        }

        db.close((err) => {
          if (err) {
            console.error("Error closing database:", err);
          } else {
            console.log("Database closed");
          }
        });
      });
    });
  });
}

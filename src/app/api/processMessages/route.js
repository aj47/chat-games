import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": process.env.YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
  }
});

export async function GET(request) {
  const db = new sqlite3.Database("messages.db", (err) => {
    if (err) {
      console.error("Error opening database:", err);
      return NextResponse.json({ error: "Failed to open database" }, { status: 500 });
    }

    db.all(`SELECT * FROM messages WHERE processed = 0`, [], async (err, rows) => {
      if (err) {
        console.error("Error fetching unprocessed messages:", err);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
      }

      for (const message of rows) {
        try {
          const completion = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [
              { role: "user", content: message.chatmessage }
            ],
          });

          const responseMessage = completion.choices[0].message.content;

          // Update the message in the database with the processed response and set processed to true
          db.run(`UPDATE messages SET subtitle = ?, processed = 1 WHERE id = ?`, [responseMessage, message.id], (err) => {
            if (err) {
              console.error("Error updating message:", err);
            } else {
              console.log(`Message ${message.id} processed and updated successfully.`);
            }
          });
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error);
          // Handle error, e.g., log it, retry later, etc.
        }
      }

      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
        }
      });

      return NextResponse.json({ message: "Messages processed" });
    });
  });
}

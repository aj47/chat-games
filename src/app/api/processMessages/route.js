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

    db.all(`SELECT * FROM messages WHERE processed = 0 ORDER BY id ASC LIMIT 50`, [], async (err, rows) => {
      if (err) {
        console.error("Error fetching unprocessed messages:", err);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
      }

      console.log(rows);

      if (rows.length === 0) {
        db.close((err) => {
          if (err) {
            console.error("Error closing database:", err);
          }
        });
        return NextResponse.json({ message: "No unprocessed messages found" });
      }

      try {
        const nonEmptyMessages = rows.filter(msg => msg.chatmessage.trim() !== "");

        if (nonEmptyMessages.length === 0) {
          for (const msg of rows) {
            db.run(`UPDATE messages SET processed = 1 WHERE id = ?`, [msg.id], (err) => {
              if (err) {
                console.error("Error updating message:", err);
              } else {
                console.log(`Message ${msg.id} marked as processed.`);
              }
            });
          }
          db.close((err) => {
            if (err) {
              console.error("Error closing database:", err);
            }
          });
          return NextResponse.json({ message: "All messages are empty, marked as processed" });
        }

        const completion = await openai.chat.completions.create({
          model: "google/gemini-flash-1.5-exp",
          messages: [
            { role: "system", content: "You are a tech streamer's co-host. Rate each message out of 10 and provide a very short summary as to why it's good or bad. A good comment is one that can be made into content related to technology, especially software. The response should be in JSON format with the following schema: [{\"id\": <message_id>, \"rating\": <rating>, \"reason\": <summary>}]." },
            { role: "user", content: JSON.stringify(nonEmptyMessages) }
          ],
          response_format: { type: "json_object" }
        });
        console.log(JSON.stringify(completion));

        const responseJson = JSON.parse(completion.choices[0].message.content);

        for (const response of responseJson) {
          const { id, rating, reason } = response;
          db.run(`UPDATE messages SET subtitle = ?, rating = ?, processed = 1 WHERE id = ?`, [reason, rating, id], (err) => {
            if (err) {
              console.error("Error updating message:", err);
            } else {
              console.log(`Message ${id} processed and updated successfully.`);
              if (rating > 6) {
                db.run(`UPDATE users SET points = points + 10 WHERE name = ?`, [msg.chatname], (err) => {
                  if (err) {
                    console.error("Error updating user points:", err);
                  } else {
                    console.log(`User ${msg.chatname} points incremented by 10.`);
                  }
                });
              }
            }
            if (err) {
              console.error("Error updating message:", err);
            } else {
              console.log(`Message ${id} processed and updated successfully.`);
            }
          });
        }

        for (const msg of rows.filter(msg => msg.chatmessage.trim() === "")) {
          db.run(`UPDATE messages SET processed = 1 WHERE id = ?`, [msg.id], (err) => {
            if (err) {
              console.error("Error updating message:", err);
            } else {
              console.log(`Message ${msg.id} marked as processed.`);
            }
          });
        }
      } catch (error) {
        console.error("Error processing messages:", error);
        // Handle error, e.g., log it, retry later, etc.
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

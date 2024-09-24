import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL,
    "X-Title": process.env.YOUR_SITE_NAME,
  }
});

export async function GET(request) {
  let db;
  try {
    db = await open({
      filename: "messages.db",
      driver: sqlite3.Database
    });

    const rows = await db.all(`SELECT * FROM messages WHERE processed = 0 ORDER BY id ASC LIMIT 50`);
    console.log(rows);

    if (rows.length === 0) {
      return NextResponse.json({ message: "No unprocessed messages found" });
    }

    const nonEmptyMessages = rows.filter(msg => msg.chatmessage.trim() !== "");

    if (nonEmptyMessages.length === 0) {
      await Promise.all(rows.map(msg => 
        db.run(`UPDATE messages SET processed = 1 WHERE id = ?`, [msg.id])
      ));
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

    await Promise.all(responseJson.map(async (response) => {
      const { id, rating, reason } = response;
      await db.run(`UPDATE messages SET subtitle = ?, rating = ?, processed = 1 WHERE id = ?`, [reason, rating, id]);
      console.log(`Message ${id} processed and updated successfully.`);
      if (rating > 6) {
        const msg = rows.find(m => m.id === id);
        if (msg) {
          await db.run(`UPDATE users SET points = points + 10 WHERE name = ?`, [msg.chatname]);
          console.log(`User ${msg.chatname} points incremented by 10.`);
        }
      }
    }));

    await Promise.all(rows.filter(msg => msg.chatmessage.trim() === "").map(msg =>
      db.run(`UPDATE messages SET processed = 1 WHERE id = ?`, [msg.id])
    ));

    return NextResponse.json({ message: "Messages processed" });
  } catch (error) {
    console.error("Error processing messages:", error);
    return NextResponse.json({ error: "Failed to process messages" }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

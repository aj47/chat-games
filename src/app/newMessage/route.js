import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";

export async function POST(request) {
  const db = new sqlite3.Database("messages.db");

  // Create a table if it doesn't exist
  db.run(
    "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)"
  );

  try {
    const { message } = await request.json();

    // Insert the message into the database
    db.run("INSERT INTO messages (message) VALUES (?)", message);

    return NextResponse.json({ message: "Message saved successfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  } finally {
    db.close();
  }
}

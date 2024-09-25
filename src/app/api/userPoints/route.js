import { NextResponse } from "next/server";
import { openDb } from "../initDb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  let db;
  try {
    db = await openDb();
    const result = await new Promise((resolve, reject) => {
      db.get("SELECT points FROM users WHERE name = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (result) {
      return NextResponse.json({ points: result.points });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json({ error: "Failed to fetch user points" }, { status: 500 });
  } finally {
    if (db) {
      await new Promise((resolve) => db.close(() => resolve()));
    }
  }
}

export async function POST(request) {
  const { username, action } = await request.json();

  if (!username || !action) {
    return NextResponse.json({ error: "Username and action are required" }, { status: 400 });
  }

  let db;
  try {
    db = await openDb();
    await new Promise((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    let pointsChange = 0;
    if (action === "tts") {
      pointsChange = -10;
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET points = points + ? WHERE name = ?",
        [pointsChange, username],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (result === 0) {
      await new Promise((resolve) => db.run("ROLLBACK", () => resolve()));
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json({ success: true, pointsChange });
  } catch (error) {
    console.error("Error updating user points:", error);
    if (db) {
      await new Promise((resolve) => db.run("ROLLBACK", () => resolve()));
    }
    return NextResponse.json({ error: "Failed to update user points" }, { status: 500 });
  } finally {
    if (db) {
      await new Promise((resolve) => db.close(() => resolve()));
    }
  }
}

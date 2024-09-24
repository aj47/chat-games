import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  let db;
  try {
    db = await open({
      filename: 'messages.db',
      driver: sqlite3.Database
    });

    const leaderboard = await db.all(`
      SELECT name as user, points, avatar
      FROM users
      ORDER BY points DESC
      LIMIT 10
    `);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}

import Database from 'better-sqlite3'
import path from 'path';

const db = new Database(path.resolve('data/database.sqlite'), { verbose: console.log });

export const getNumberOfFollowersByUserId = (userId: string) => {
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM follows WHERE followed_id = ?
    `);
    const row = stmt.get(userId) as { count: number };
    return row.count;
}

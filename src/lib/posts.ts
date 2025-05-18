import Database from 'better-sqlite3'
import path from 'path';

const db = new Database(path.resolve('data/database.sqlite'), { verbose: console.log });

export const getNumberOfPostsByUserId = (userId: string) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM posts p WHERE p.user_id = ?');
    const row = stmt.get(userId) as { count: number };
    return row.count;
}

export const getPostsByUserId = (userId: string) => {
    const stmt = db.prepare(`
        SELECT p.id, p.created_at, p.last_activity_at, pv.title, pv.description, pv.code, pv.language
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    `);
    return stmt.all(userId);
}

export const createPost = async (
    userId: string,
    title: string, 
    description: string, 
    code: string,
    language: string,
) => {
    const insertPost = db.prepare(`
        INSERT INTO posts (user_id, created_at, last_activity_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const insertVersion = db.prepare(`
        INSERT INTO post_versions (post_id, title, description, code, language, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction(() => {
        const result = insertPost.run(userId);
        const postId = result.lastInsertRowid;

        insertVersion.run(postId, title, description, code, language);

        return postId;
    });

    return transaction();
}

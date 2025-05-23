import { getSecret } from 'astro:env/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getUserById } from './users';
import type { Comment } from '../types/Comment';

const db = new Database(path.resolve(getSecret("DB_FILE") || 'data/database.sqlite'));

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
    const stmt = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC');
    const comments = stmt.all(postId) as Comment[];
    const commentsWithUser = await Promise.all(comments.map(async (comment: Comment) => {
        const user = await getUserById(comment.user_id);
        if (!user) {
            throw new Error(`User with ID ${comment.user_id} not found`);
        }
        return {
            ...comment,
            user,
        };
    }));
    return commentsWithUser;
}

export async function addComment(postId: number, userId: string, content: string): Promise<Comment> {
    const stmt = db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)');
    const result = stmt.run(postId, userId, content);
    const select = db.prepare('SELECT * FROM comments WHERE id = ?');
    const newComment = select.get(result.lastInsertRowid) as Comment;
    const user = await getUserById(userId);
    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }
    return {
        ...newComment,
        user,
    };
}

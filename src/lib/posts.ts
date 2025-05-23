import { turso } from './db';
import type { PostPreviewType, PostMiniPreviewType, PostRowWithUser } from '../types/Post';
import { getUserById } from './users';

export const checkIfPostExists = async (postId: string) => {
    const { rows } = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM posts WHERE id = ?',
        args: [postId],
    });
    return Number(rows[0]?.count ?? 0) > 0;
};

export const getNumberOfPostsByUserId = async (userId: string) => {
    const { rows } = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM posts p WHERE p.user_id = ?',
        args: [userId],
    });
    return Number(rows[0]?.count ?? 0);
};

export const getPosts = async (userId: string, page: number, limit: number): Promise<PostPreviewType[]> => {
    const offset = (page - 1) * limit;
    const { rows } = await turso.execute({
        sql: `SELECT p.id, pv.title, pv.description, pv.code, pv.language, pv.dependencies, p.user_id, EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked, EXISTS (SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved FROM posts p JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        args: [userId, userId, limit, offset],
    });
    const posts = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        return {
            id: String(row.id),
            title: String(row.title),
            description: String(row.description),
            code: String(row.code),
            language: String(row.language),
            dependencies: row.dependencies ? String(row.dependencies).split(',') : [],
            liked: Boolean(row.liked),
            saved: Boolean(row.saved),
            username: user?.username || 'Unknown',
        };
    }));
    return posts;
};

export const getPostById = async (postId: string): Promise<PostPreviewType | null> => {
    const { rows } = await turso.execute({
        sql: `SELECT p.id, pv.title, pv.description, pv.code, pv.language, pv.dependencies, p.user_id, EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked, EXISTS (SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved FROM posts p JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at WHERE p.id = ?`,
        args: [postId, postId, postId],
    });
    const row = rows[0];
    if (!row) return null;
    const user = await getUserById(String(row.user_id));
    return {
        id: String(row.id),
        title: String(row.title),
        description: String(row.description),
        code: String(row.code),
        language: String(row.language),
        dependencies: row.dependencies ? String(row.dependencies).split(',') : [],
        liked: Boolean(row.liked),
        saved: Boolean(row.saved),
        username: user?.username || 'Unknown',
    };
};

export const getPostsBySearch = async (userId: string, search: string): Promise<PostPreviewType[]> => {
    const { rows } = await turso.execute({
        sql: `SELECT p.id, pv.title, pv.description, pv.code, pv.language, pv.dependencies, p.user_id, EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked, EXISTS (SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved FROM posts p JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at WHERE pv.title LIKE ? OR pv.description LIKE ? ORDER BY p.created_at DESC LIMIT 10`,
        args: [userId, userId, `%${search}%`, `%${search}%`],
    });
    const posts = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        return {
            id: String(row.id),
            title: String(row.title),
            description: String(row.description),
            code: String(row.code),
            language: String(row.language),
            dependencies: row.dependencies ? String(row.dependencies).split(',') : [],
            liked: Boolean(row.liked),
            saved: Boolean(row.saved),
            username: user?.username || 'Unknown',
        };
    }));
    return posts;
};

export const getPostsByUserId = async (userId: string): Promise<PostPreviewType[]> => {
    const { rows } = await turso.execute({
        sql: `SELECT p.id, pv.title, pv.description, pv.code, pv.language, pv.dependencies, p.user_id, EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked, EXISTS (SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved FROM posts p JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at WHERE p.user_id = ? ORDER BY p.created_at DESC`,
        args: [userId, userId, userId],
    });
    const posts = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        return {
            id: String(row.id),
            title: String(row.title),
            description: String(row.description),
            code: String(row.code),
            language: String(row.language),
            dependencies: row.dependencies ? String(row.dependencies).split(',') : [],
            liked: Boolean(row.liked),
            saved: Boolean(row.saved),
            username: user?.username || 'Unknown',
        };
    }));
    return posts;
};

export const getPostsLikedByUserId = async (userId: string): Promise<PostPreviewType[]> => {
    const { rows } = await turso.execute({
        sql: `SELECT p.id, pv.title, pv.description, pv.code, pv.language, pv.dependencies, p.user_id, EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked, EXISTS (SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved FROM posts p JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at JOIN likes l ON l.post_id = p.id WHERE l.user_id = ? ORDER BY p.created_at DESC`,
        args: [userId, userId, userId],
    });
    const posts = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        return {
            id: String(row.id),
            title: String(row.title),
            description: String(row.description),
            code: String(row.code),
            language: String(row.language),
            dependencies: row.dependencies ? String(row.dependencies).split(',') : [],
            liked: Boolean(row.liked),
            saved: Boolean(row.saved),
            username: user?.username || 'Unknown',
        };
    }));
    return posts;
};

export const getPostsMostLiked = async (): Promise<PostMiniPreviewType[]> => {
    const { rows } = await turso.execute('SELECT p.id, pv.title, pv.language, COUNT(l.post_id) as likes FROM posts p JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at LEFT JOIN likes l ON l.post_id = p.id GROUP BY p.id, pv.title, pv.language ORDER BY likes DESC, p.created_at DESC LIMIT 3');
    return rows.map((row: any) => ({
        id: String(row.id),
        title: String(row.title),
        language: String(row.language),
        likes: Number(row.likes),
    }));
};

export const getPostsSavedByUserId = async (userId: string): Promise<PostPreviewType[]> => {
    const { rows } = await turso.execute({
        sql: `SELECT p.id, pv.title, pv.description, pv.code, pv.language, pv.dependencies, p.user_id, EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked, EXISTS (SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved FROM posts p JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at JOIN saved_posts s ON s.post_id = p.id WHERE s.user_id = ? ORDER BY p.created_at DESC`,
        args: [userId, userId, userId],
    });
    const posts = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        return {
            id: String(row.id),
            title: String(row.title),
            description: String(row.description),
            code: String(row.code),
            language: String(row.language),
            dependencies: row.dependencies ? String(row.dependencies).split(',') : [],
            liked: Boolean(row.liked),
            saved: Boolean(row.saved),
            username: user?.username || 'Unknown',
        };
    }));
    return posts;
};

export const createPost = async (
    userId: string,
    title: string,
    description: string,
    code: string,
    language: string,
    dependencies: string[]
) => {
    const { rows } = await turso.execute({
        sql: 'INSERT INTO posts (user_id, created_at, last_activity_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
        args: [userId],
    });
    const postId = rows[0]?.id;
    await turso.execute({
        sql: 'INSERT INTO post_versions (post_id, title, description, code, language, dependencies, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        args: [postId, title, description, code, language, dependencies.join(',')],
    });
    return postId;
};

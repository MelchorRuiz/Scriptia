import Database from 'better-sqlite3'
import path from 'path';
import { getUserById } from './users';
import type { User, UserPreviewType } from '../types/User';

const db = new Database(path.resolve('data/database.sqlite'), { verbose: console.log });

export const getNumberOfFollowersByUserId = (userId: string) => {
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM follows WHERE followed_id = ?
    `);
    const row = stmt.get(userId) as { count: number };
    return row.count;
}

export const getFollowersByUserId = async (userId: string): Promise<User[]> => {
    const stmt = db.prepare(`
        SELECT follower_id as user_id, created_at FROM follows WHERE followed_id = ?
    `);
    const rows = stmt.all(userId) as { user_id: string, created_at: string }[];
    const users = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        user.created_at = row.created_at;
        return user;
    }));
    return users;
}

export const getFollowingByUserId = async (userId: string): Promise<User[]> => {
    const stmt = db.prepare(`
        SELECT followed_id as user_id, created_at FROM follows WHERE follower_id = ?
    `);
    const rows = stmt.all(userId) as { user_id: string, created_at: string }[];
    const users = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        user.created_at = row.created_at;
        return user;
    }));
    return users;
}

export const isFollowing = (followerId: string, followedId: string): boolean => {
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followed_id = ?
    `);
    const row = stmt.get(followerId, followedId) as { count: number };
    return row.count > 0;
}

export const getMoreFollowedUsers = async (): Promise<UserPreviewType[]> => {
    const stmt = db.prepare(`
        SELECT 
            followed_id as user_id, 
            COUNT(follower_id) as followers
        FROM follows
        GROUP BY followed_id
        ORDER BY followers DESC
        LIMIT 3
    `);
    const rows = stmt.all() as { user_id: string; followers: number }[];
    const users = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
            ...user,
            followers: row.followers
        };
    }));
    return users;
}

export const createFollow = (followerId: string, followedId: string) => {
    const stmt = db.prepare(`
        INSERT INTO follows (follower_id, followed_id) 
        VALUES (?, ?)
    `);
    stmt.run(followerId, followedId);
}

export const deleteFollow = (followerId: string, followedId: string) => {
    const stmt = db.prepare(`
        DELETE FROM follows 
        WHERE follower_id = ? AND followed_id = ?
    `);
    stmt.run(followerId, followedId);
}

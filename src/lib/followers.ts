import { turso } from './db';
import { getUserById } from './users';
import type { User, UserPreviewType } from '../types/User';

export const getNumberOfFollowersByUserId = async (userId: string) => {
    const { rows } = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE followed_id = ?',
        args: [userId],
    });
    return Number(rows[0]?.count ?? 0);
};

export const getFollowersByUserId = async (userId: string): Promise<User[]> => {
    const { rows } = await turso.execute({
        sql: 'SELECT follower_id as user_id, created_at FROM follows WHERE followed_id = ?',
        args: [userId],
    });
    const users = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        if (!user) {
            throw new Error(`User with id ${row.user_id} not found`);
        }
        user.created_at = String(row.created_at);
        return user;
    }));
    return users;
};

export const getFollowingByUserId = async (userId: string): Promise<User[]> => {
    const { rows } = await turso.execute({
        sql: 'SELECT followed_id as user_id, created_at FROM follows WHERE follower_id = ?',
        args: [userId],
    });
    const users = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        if (!user) {
            throw new Error(`User with id ${row.user_id} not found`);
        }
        user.created_at = String(row.created_at);
        return user;
    }));
    return users;
};

export const isFollowing = async (followerId: string, followedId: string): Promise<boolean> => {
    const { rows } = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followed_id = ?',
        args: [followerId, followedId],
    });
    return Number(rows[0]?.count ?? 0) > 0;
};

export const getMoreFollowedUsers = async (): Promise<UserPreviewType[]> => {
    const { rows } = await turso.execute('SELECT followed_id as user_id, COUNT(follower_id) as followers FROM follows GROUP BY followed_id ORDER BY followers DESC LIMIT 3');
    const users = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        if (!user) {
            throw new Error(`User with id ${row.user_id} not found`);
        }
        return {
            ...user,
            followers: Number(row.followers)
        };
    }));
    return users;
};

export const createFollow = async (followerId: string, followedId: string) => {
    await turso.execute({
        sql: 'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)',
        args: [followerId, followedId],
    });
};

export const deleteFollow = async (followerId: string, followedId: string) => {
    await turso.execute({
        sql: 'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
        args: [followerId, followedId],
    });
};

export interface PostPreviewType {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    dependencies: string[];
    liked: boolean;
    saved: boolean;
    username: string; // Added username field
}

export interface PostMiniPreviewType {
    id: string;
    title: string;
    language: string;
    likes: number;
}

export interface PostRowWithUser {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    dependencies: string;
    liked: boolean;
    saved: boolean;
    user_id: string;
}
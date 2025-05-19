export interface User {
    id: string;
    username: string;
    image_url: string;
    created_at: string;
}

export interface UserPreviewType {
    id: string;
    username: string;
    image_url: string;
    followers: number;
}
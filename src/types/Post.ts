export interface PostPreviewType {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    dependencies: string[];
    liked: boolean;
    saved: boolean;
}

export interface PostMiniPreviewType {
    id: string;
    title: string;
    language: string;
    likes: number;
}
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import type { PostPreviewType } from '../types/Post';

interface PostPreviewProps {
    post: PostPreviewType;
}

export default function PostPreview({ post }: PostPreviewProps) {
    const { id, title, description, code, liked, saved } = post;
    const [like, setLike] = useState(liked);
    const [save, setSave] = useState(saved);

    interface ButtonEvent extends React.MouseEvent<HTMLButtonElement, MouseEvent> {}

    const handleLike = (e: ButtonEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fetch(`/api/posts/${id}/like`, {
            method: like ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setLike(!like);
    };
    const handleSave = (e: ButtonEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fetch(`/api/posts/${id}/save`, {
            method: save ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setSave(!save);
    };

    return (
        <a href={`/post/${id}`} className="text-white ring-2 ring-gray-700 rounded-lg p-4 flex flex-col gap-2 max-h-64 overflow-y-hidden relative pb-16">
            <h3 className="text-xl font-bold">
                {title}
            </h3>
            <p className="text-base text-gray-400">
                {description}
            </p>
            <CodeMirror
                value={code}
                theme="dark"
                className='overflow-x-auto overflow-y-hidden *:w-fit *:min-w-full relative'
                extensions={[langs.shell()]}
                editable={false}
                basicSetup={{ searchKeymap: false, foldGutter: false }}
            />
            <div className='flex justify-around gap-4 mt-2 absolute bottom-0 left-0 right-0 py-2 w-full bg-neutral-900'>
                <button className='flex items-center justify-center gap-2 p-2 hover:ring-1 cursor-pointer rounded-lg' onClick={handleLike}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${like ? 'text-red-600 fill-red-600' : 'text-white'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    <label className='sr-only lg:not-sr-only cursor-pointer text-sm'>Me gusta</label>
                </button>
                <button className='flex items-center justify-center gap-2 p-2 hover:ring-1 cursor-pointer rounded-lg'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                    <label className='sr-only lg:not-sr-only cursor-pointer text-sm'>Comentarios</label>
                </button>
                <button className='flex items-center justify-center gap-2 p-2 hover:ring-1 cursor-pointer rounded-lg' onClick={handleSave}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${save ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    <label className='sr-only lg:not-sr-only cursor-pointer text-sm'>Guardar</label>
                </button>
            </div>
        </a>
    );
}
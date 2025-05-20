import { useState, useEffect } from "react";
import type { Comment } from "../types/Comment";

export default function Comments({ postId, comments }: { postId: string, comments: Comment[] }) {
    const [commentsList, setCommentsList] = useState<Comment[]>(comments);
    const [showErrors, setShowErrors] = useState(false);
    const [newComment, setNewComment] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowErrors(true);

        if (!newComment) {
            return;
        }

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postId, content: newComment }),
            });

            if (response.ok) {
                setNewComment("");
                setShowErrors(false);
                const newCommentData= await response.json();
                setCommentsList((prevComments) => [newCommentData, ...prevComments]);
            } else {
                console.error('Error adding comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };


    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="mb-3">
                <div className="mb-3">
                    <div className='flex items-center gap-2 mb-2'>
                        <label htmlFor="comment" className="block font-medium text-neutral-300">Escribe un comentario: </label>
                        {showErrors && !newComment && (
                            <label className="text-red-500 text-sm">* El comentario es obligatorio</label>
                        )}
                    </div>
                    <textarea
                        id="comment"
                        rows={2}
                        className="block p-2.5 w-full rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-neutral-100 focus:ring-neutral-500 focus:border-neutral-500 focus-visible:outline-none"
                        placeholder="Escribe algo..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    >
                    </textarea>
                </div>
                <div className="mb-3">
                    <button type="submit" className="text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 cursor-pointer flex items-center gap-2">
                        Agregar comentario
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </form>
            <div className="mb-3">
                {commentsList.length > 0 ? (
                    commentsList.map((comment) => (
                        <div
                            key={comment.id}
                            className="p-4 mb-4 rounded-lg shadow-md flex gap-4 items-center"
                        >
                            <img
                                src={comment.user.image_url}
                                alt={comment.user.username}
                                className="size-10 rounded-full"
                            />
                            <div className="w-full">
                                <div className="flex flex-col lg:flex-row justify-between w-full">
                                    <p className="text-neutral-300">
                                        <strong>@{comment.user.username}</strong>
                                    </p>
                                    <p className="text-neutral-400 text-sm">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <p className="text-neutral-100 text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-neutral-400">No hay comentarios aún.</p>
                )}
            </div>
        </div>
    );
}
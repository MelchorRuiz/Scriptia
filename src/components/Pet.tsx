import { useState, useEffect } from "react";

export function Pet() {
    const [isOpen, setIsOpen] = useState(() => {
        const stored = sessionStorage.getItem("petIsOpen");
        return stored === null ? true : stored === "true";
    });

    useEffect(() => {
        sessionStorage.setItem("petIsOpen", isOpen.toString());
    }, [isOpen]);

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`hidden lg:block fixed bottom-1 right-10 bg-neutral-900 z-50 ring-neutral-400 ring-1 rounded-2xl ${!isOpen && "translate-y-72"} transition-all duration-300`}>
            <button
                className="cursor-pointer bg-neutral-400 rounded-t-2xl w-full flex justify-center"
                onClick={handleClick}
            >
                {isOpen ? (
                    <div className="flex items-center gap-2 py-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                        Cerrar
                    </div>
                ) : (
                    <div className="flex items-center gap-2 py-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                        Abrir
                    </div>
                )}
            </button>
            <img className="p-3 size-72 opacity-70" src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnBjbzJzd3R4ZzdkYWIyeW5oYm5wYTQxNXZqaXBoOXc1Z2F4azA5dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HCkbgKLdLWq3OCV8YM/giphy.gif" alt="" />
        </div>
    );
}
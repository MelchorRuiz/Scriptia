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
        <div className={`hidden lg:block fixed bottom-1 right-1 bg-neutral-900 z-50 ring-neutral-400 ring-1 rounded-2xl ${!isOpen && "translate-y-62"} transition-all duration-300`}>
            <div className="flex justify-center bg-neutral-400 rounded-t-2xl">
                <button 
                    className="cursor-pointer"
                    onClick={handleClick}
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                    )}
                </button>
            </div>
            <img className="p-3 size-60 opacity-50" src="/pet.gif" alt="" />
        </div>
    );
}
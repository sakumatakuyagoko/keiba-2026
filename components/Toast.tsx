"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
    message: string | null;
    onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [message, onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    key={message}
                    className="fixed top-3 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none"
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                >
                    <div className="bg-yellow-500 text-black font-bold text-lg px-5 py-3 rounded-full shadow-2xl border-2 border-white">
                        {message}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

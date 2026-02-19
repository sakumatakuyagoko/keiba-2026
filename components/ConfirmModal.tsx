"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isAlert?: boolean; // If true, only show OK button
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isAlert = false }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={isAlert ? onConfirm : onCancel}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative bg-gray-900 border border-white/20 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center"
            >
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">{message}</p>

                <div className="flex gap-3 justify-center">
                    {!isAlert && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl bg-gray-800 text-white font-bold border border-white/10 hover:bg-gray-700 active:scale-95 transition-all"
                        >
                            キャンセル
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold shadow-lg hover:bg-yellow-400 active:scale-95 transition-all"
                    >
                        OK
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

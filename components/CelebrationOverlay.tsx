import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type CelebrationType = 'win' | 'loss';

interface CelebrationOverlayProps {
    type: CelebrationType | null;
    onClose: () => void;
}

export function CelebrationOverlay({ type, onClose }: CelebrationOverlayProps) {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

    useEffect(() => {
        if (type === 'win') {
            // Generate random particles for fireworks effect
            const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF69B4'];
            const newParticles = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                color: colors[Math.floor(Math.random() * colors.length)],
            }));
            setParticles(newParticles);
        }
    }, [type]);

    return (
        <AnimatePresence>
            {type && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="absolute top-8 right-8 text-white/50 hover:text-white"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="text-center relative pointer-events-none">
                        {type === 'win' ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="relative z-10"
                                >
                                    <div className="text-6xl md:text-8xl mb-4">🎉</div>
                                    <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-yellow-300 animate-gradient-x drop-shadow-lg filter">
                                        Congratulations!
                                    </h2>
                                    <p className="text-2xl text-white mt-4 font-bold">おめでとうございます！</p>
                                    <p className="text-xl text-yellow-400 mt-2 font-bold">プラス収支達成！</p>
                                </motion.div>

                                {/* Simple Fireworks / Particles */}
                                {particles.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0 }}
                                        animate={{
                                            x: p.x,
                                            y: p.y,
                                            scale: [0, 1, 0],
                                            opacity: [1, 0]
                                        }}
                                        transition={{
                                            duration: 1.5 + Math.random(),
                                            ease: "easeOut",
                                            repeat: Infinity,
                                            repeatDelay: Math.random() * 2
                                        }}
                                        style={{ backgroundColor: p.color }}
                                        className="absolute w-3 h-3 rounded-full"
                                    />
                                ))}
                            </>
                        ) : (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="text-6xl md:text-8xl mb-4">💪</div>
                                <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md">
                                    Don't Mind!
                                </h2>
                                <p className="text-xl text-gray-300 mt-4 font-bold">次はきっと勝てる！</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

"use client";

import { motion } from "framer-motion";
import { Bet } from "@/lib/types";
import { MOCK_RACES } from "@/lib/mock";
import { TrendingUp, Award } from "lucide-react";

interface NewsTickerProps {
    bets: Bet[];
    users: { id: string; name: string }[];
}

export function NewsTicker({ bets, users }: NewsTickerProps) {
    // Get latest 5 bets
    const sourceBets = [...bets].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    // Ensure we have enough content to scroll smoothly. 
    // If only 1-2 bets, duplication helps. 
    // We will render this list TWICE side-by-side for the seamless loop.
    const loopBets = [...sourceBets, ...sourceBets];

    if (loopBets.length === 0) return null;

    // Helper to render the bet items
    const renderBets = () => loopBets.map((bet, i) => {
        const user = users.find(u => u.id === bet.userId);
        const race = MOCK_RACES.find(r => r.id === bet.raceId);
        const raceName = race
            ? `${race.location === "Kokura" ? "小倉" : race.location === "Tokyo" ? "東京" : "阪神"}${race.raceNumber}R`
            : bet.raceId;

        const profit = bet.returnAmount - bet.investment;
        const isWin = profit > 0;

        return (
            <div key={`${bet.id}-${i}`} className="flex items-center gap-2 text-lg font-bold shrink-0">
                <span className="text-white flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    {user?.name || "Unknown"}:
                </span>
                <span className="text-yellow-100 bg-gray-800 px-2 rounded text-sm mx-1 border border-gray-600">
                    {raceName}
                </span>
                <span className={isWin ? "text-yellow-400 text-xl flex items-center gap-1" : "text-gray-400"}>
                    {isWin ? <TrendingUp className="w-5 h-5" /> : null}
                    {isWin ? "WIN!" : ""}
                </span>
                <span className={isWin ? "text-yellow-400" : "text-gray-400"}>
                    ({profit > 0 ? "+" : ""}{profit}円)
                </span>
            </div>
        );
    });

    return (
        <div className="bg-black border-y-2 border-yellow-500 overflow-hidden py-2 flex relative">
            {/* Seamless Loop: Two identical divs sliding left */}
            <motion.div
                className="flex gap-12 px-6 shrink-0"
                initial={{ x: 0 }}
                animate={{ x: "-100%" }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            >
                {renderBets()}
            </motion.div>
            <motion.div
                className="flex gap-12 px-6 shrink-0"
                initial={{ x: 0 }}
                animate={{ x: "-100%" }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            >
                {renderBets()}
            </motion.div>
        </div>
    );
}

"use client";

import { HTMLMotionProps, motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { LeaderboardEntry, User } from "@/lib/types";
import { useState } from "react";

interface RankingCardProps extends HTMLMotionProps<"div"> {
    entry: LeaderboardEntry;
    index: number;
    currentUser: User | null;
}

// JRA Colors
const WAKU_BG_COLORS = [
    "bg-white text-black",   // 1
    "bg-black text-white",   // 2
    "bg-red-600 text-white", // 3
    "bg-blue-600 text-white",// 4
    "bg-yellow-400 text-black", // 5
    "bg-green-600 text-white",  // 6
    "bg-orange-500 text-black", // 7
    "bg-pink-400 text-black",   // 8
];

const getWakuColorClass = (horseNumber: number) => {
    // 12 Horses Logic
    if (horseNumber === 1) return WAKU_BG_COLORS[0];
    if (horseNumber === 2) return WAKU_BG_COLORS[1];
    if (horseNumber === 3) return WAKU_BG_COLORS[2];
    if (horseNumber === 4) return WAKU_BG_COLORS[3];
    if (horseNumber === 5 || horseNumber === 6) return WAKU_BG_COLORS[4];
    if (horseNumber === 7 || horseNumber === 8) return WAKU_BG_COLORS[5];
    if (horseNumber === 9 || horseNumber === 10) return WAKU_BG_COLORS[6];
    if (horseNumber === 11 || horseNumber === 12) return WAKU_BG_COLORS[7];
    return "bg-gray-500";
};

export function RankingCard({ entry, index, currentUser, className, ...props }: RankingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const horseNumber = index + 1;
    const wakuClass = getWakuColorClass(horseNumber);
    const isMe = currentUser?.id === entry.id;

    const handleToggle = () => {
        if (isMe) setIsExpanded(!isExpanded);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={clsx(
                "flex flex-col bg-white border-b border-gray-600 transition-colors",
                className
            )}
            onClick={handleToggle} // Click anywhere on the card container
            {...props}
        >
            {/* Top Row */}
            <div className={clsx(
                "flex items-stretch min-h-[50px] w-full",
                isMe ? "cursor-pointer hover:bg-yellow-50" : ""
            )}>
                {/* 1. Waku / No */}
                <div className={clsx("w-10 flex items-center justify-center font-black text-xl border-r border-gray-400 shrink-0", wakuClass)}>
                    {horseNumber}
                </div>

                {/* 2. Name & Jockey (Single Line) */}
                <div className="flex-1 px-3 flex items-center border-r border-gray-300 min-w-0 transition-colors relative">
                    <div className="font-bold text-black text-lg truncate w-full flex items-center gap-2">
                        <span className="truncate">{entry.name} <span className="text-base">【{entry.jockey}】</span></span>
                        {isMe && (
                            <span className="shrink-0 text-xs bg-yellow-100 text-yellow-800 border border-yellow-500 px-1 rounded flex items-center">
                                YOU {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                            </span>
                        )}
                    </div>
                </div>

                {/* 3. Rank */}
                <div className="w-12 flex flex-col items-center justify-center border-r border-gray-300 bg-black text-yellow-400 font-black text-xl shrink-0">
                    {entry.rank}
                </div>

                {/* 4. Return Rate */}
                <div className={clsx(
                    "w-20 flex items-center justify-center font-bold text-lg border-r border-gray-300 shrink-0",
                    entry.returnRate > 0 ? "bg-blue-100/50 text-blue-800" :
                        entry.returnRate < 0 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"
                )}>
                    {entry.returnRate.toFixed(1)}%
                </div>

                {/* 5. Mark */}
                <div className="w-10 flex flex-col items-center justify-center bg-black gap-1 border-l border-gray-500 shrink-0">
                    {entry.isKing && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                    {entry.rank === 1 && <span className="text-xl">👑</span>}
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50"
                        onClick={(e) => {
                            e.stopPropagation(); // Avoid double toggle if logic is complex, but here simplistic toggle is fine.
                            setIsExpanded(false); // Make explicit close on click inside detail
                        }}
                    >
                        <div className="p-4 grid grid-cols-2 gap-4 border-t border-gray-200 shadow-inner cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-xs text-gray-500 font-bold mb-1">総投資額</div>
                                <div className="text-lg font-black font-mono text-gray-800">
                                    ¥{entry.totalInvestment.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-xs text-gray-500 font-bold mb-1">総回収額</div>
                                <div className="text-lg font-black font-mono text-green-700">
                                    ¥{entry.totalReturn.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-xs text-gray-500 font-bold mb-1">収益</div>
                                <div className={clsx("text-lg font-black font-mono", entry.netProfit >= 0 ? "text-blue-600" : "text-red-500")}>
                                    ¥{entry.netProfit.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-xs text-gray-500 font-bold mb-1">回収率</div>
                                <div className={clsx("text-lg font-black font-mono", entry.returnRate >= 100 ? "text-blue-600" : "text-gray-800")}>
                                    {entry.returnRate.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

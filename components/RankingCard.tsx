"use client";

import { HTMLMotionProps, motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { LeaderboardEntry, User, Bet } from "@/lib/types";
import { useState, useEffect } from "react";
import { fetchUserBets } from "@/lib/api";
import { MOCK_RACES } from "@/lib/mock";

interface RankingCardProps extends HTMLMotionProps<"div"> {
    entry: LeaderboardEntry;
    index: number;
    currentUser: User | null;
    onEditBet?: (bet: Bet) => void;
    lastBetUpdate?: number;
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

export function RankingCard({ entry, index, currentUser, className, onEditBet, lastBetUpdate, ...props }: RankingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const horseNumber = index + 1;
    const wakuClass = getWakuColorClass(horseNumber);
    const isMe = currentUser?.id === entry.id;
    const [history, setHistory] = useState<Bet[]>([]);

    const handleToggle = () => {
        if (isMe) setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        if (isExpanded && isMe) {
            fetchUserBets(entry.id).then(setHistory);
        }
    }, [isExpanded, isMe, entry.id, lastBetUpdate]);

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
                "flex items-stretch min-h-[44px] w-full",
                isMe ? "cursor-pointer hover:bg-yellow-50" : ""
            )}>
                {/* 1. Waku / No */}
                <div className={clsx("w-10 flex items-center justify-center font-black text-xl border-r border-gray-400 shrink-0", wakuClass)}>
                    {horseNumber}
                </div>

                {/* 2. Name & Jockey (Two Lines) */}
                <div className="flex-1 px-2 flex items-center border-r border-gray-300 min-w-0 transition-colors relative py-1">
                    <div className="flex flex-col justify-center w-full min-w-0 leading-tight">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-black text-sm truncate">{entry.name}</span>
                            {isMe && (
                                <span className="shrink-0 text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-500 px-1 rounded flex items-center h-4">
                                    YOU {isExpanded ? <ChevronUp className="w-2 h-2 ml-0.5" /> : <ChevronDown className="w-2 h-2 ml-0.5" />}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-600 truncate">【{entry.jockey}】</span>
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
                    {Math.round(entry.returnRate)}%
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
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gray-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                                <div className="relative z-10">
                                    <div className="text-xs text-gray-500 font-bold mb-1">総投資額</div>
                                    <div className="text-lg font-black font-mono text-gray-800">
                                        ¥{entry.totalInvestment.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                                <div className="relative z-10">
                                    <div className="text-xs text-gray-500 font-bold mb-1">総回収額</div>
                                    <div className="text-lg font-black font-mono text-blue-600">
                                        ¥{entry.totalReturn.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className={clsx("absolute top-0 right-0 w-16 h-16 rounded-bl-full -mr-8 -mt-8 z-0", entry.netProfit >= 0 ? "bg-blue-50" : "bg-red-50")}></div>
                                <div className="relative z-10">
                                    <div className="text-xs text-gray-500 font-bold mb-1">収益</div>
                                    <div className={clsx("text-lg font-black font-mono", entry.netProfit >= 0 ? "text-blue-600" : "text-red-500")}>
                                        ¥{entry.netProfit.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className={clsx("absolute top-0 right-0 w-16 h-16 rounded-bl-full -mr-8 -mt-8 z-0", entry.returnRate >= 100 ? "bg-blue-50" : "bg-gray-100")}></div>
                                <div className="relative z-10">
                                    <div className="text-xs text-gray-500 font-bold mb-1">回収率</div>
                                    <div className={clsx("text-lg font-black font-mono", entry.returnRate >= 100 ? "text-blue-600" : "text-gray-800")}>
                                        {Math.round(entry.returnRate)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="p-4 border-t border-gray-200">
                            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">戦績履歴 (クリックして修正)</h3>
                            <div className="space-y-2">
                                {(() => {
                                    // 1. Deduplicate (Keep latest per raceId)
                                    const latestBets = new Map<string, Bet>();
                                    history.forEach(bet => {
                                        const existing = latestBets.get(bet.raceId);
                                        if (!existing || new Date(bet.timestamp) > new Date(existing.timestamp)) {
                                            latestBets.set(bet.raceId, bet);
                                        }
                                    });

                                    // 2. Sort by Race Time (asc)
                                    const sortedHistory = Array.from(latestBets.values()).sort((a, b) => {
                                        const rA = MOCK_RACES.find(r => r.id === a.raceId);
                                        const rB = MOCK_RACES.find(r => r.id === b.raceId);
                                        if (!rA || !rB) return 0;

                                        // Compare Times "HH:MM"
                                        const timeA = rA.startTime || "00:00";
                                        const timeB = rB.startTime || "00:00";
                                        const [hA, mA] = timeA.split(":").map(Number);
                                        const [hB, mB] = timeB.split(":").map(Number);
                                        if (hA !== hB) return hA - hB;
                                        return mA - mB;
                                    });

                                    return sortedHistory.map((bet) => {
                                        const race = MOCK_RACES.find(r => r.id === bet.raceId);
                                        let raceName = bet.raceId;
                                        if (race) {
                                            const locName = race.location === "Kokura" ? "小倉" : race.location === "Tokyo" ? "東京" : "阪神";
                                            raceName = `${locName}${race.raceNumber}R`;
                                        }

                                        // Color Logic
                                        let bgClass = "bg-white";
                                        if (bet.returnAmount > bet.investment) bgClass = "bg-[#d0eaff] border-blue-200"; // Light Blue (Win)
                                        else if (bet.returnAmount < bet.investment) bgClass = "bg-[#ffe4e4] border-red-200"; // Light Red (Lose)
                                        else bgClass = "bg-white border-gray-200"; // Draw

                                        return (
                                            <div
                                                key={bet.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditBet?.(bet);
                                                }}
                                                className={clsx(
                                                    "p-3 rounded-lg border flex justify-between items-center text-sm cursor-pointer transition-colors shadow-sm",
                                                    bgClass,
                                                    "hover:opacity-80"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-800 bg-white/50 px-2 py-1 rounded border border-black/5 text-xs shadow-sm shadow-black/5">
                                                        {raceName}
                                                    </span>
                                                    <span className="text-gray-500 text-xs font-mono">
                                                        {race?.startTime || ""}
                                                    </span>
                                                </div>
                                                <div className="flex gap-6 font-mono text-base items-center">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500 font-sans leading-none mb-0.5">投資(円)</span>
                                                        <span className="text-gray-800 font-bold">
                                                            {bet.investment.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500 font-sans leading-none mb-0.5">回収(円)</span>
                                                        <span className={clsx(
                                                            "font-black",
                                                            bet.returnAmount > 0 ? "text-blue-600" : "text-gray-400"
                                                        )}>
                                                            {bet.returnAmount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                {history.length === 0 && (
                                    <div className="text-center text-gray-400 text-xs py-2">履歴なし</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

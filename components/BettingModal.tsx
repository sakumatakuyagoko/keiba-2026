"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Lock, Info } from "lucide-react";
import { Race, User } from "@/lib/types";
import { MOCK_RACES, MOCK_USERS } from "@/lib/mock";
import { fetchUsers } from "@/lib/api";
import clsx from "clsx";

interface BettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (bet: { userId: string; raceId: string; investment: number; returnAmount: number }) => void;
}

// Fixed Order List
const ORDERED_NAMES = [
    "ウグイスバレー", "ニンゲンビレッジ", "チェンジドライバ", "エセドバイオー",
    "サイレントイナバ", "ブームオレタ", "ツチサカ", "イトウ",
    "ハンケン", "アサミハズバンド", "オオクボハグルマ", "キンパチティーチャ"
];

export function BettingModal({ isOpen, onClose, onSubmit }: BettingModalProps) {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form State
    const [selectedLocation, setSelectedLocation] = useState<"Kokura" | "Tokyo" | "Hanshin">("Kokura");
    const [selectedRaceNum, setSelectedRaceNum] = useState<number>(11);
    const [investment, setInvestment] = useState<string>("");
    const [returnAmount, setReturnAmount] = useState<string>("");

    // Guest Auth
    const [guestPin, setGuestPin] = useState("");
    const [guestError, setGuestError] = useState(false);

    useEffect(() => {
        const load = async () => {
            const u = await fetchUsers();
            // Sort
            const sorted = u.sort((a, b) => {
                const indexA = ORDERED_NAMES.indexOf(a.name);
                const indexB = ORDERED_NAMES.indexOf(b.name);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
            setUsers(sorted);

            const saved = localStorage.getItem('currentUser');
            if (saved) {
                const parsed = JSON.parse(saved);
                setCurrentUser(parsed);
                setSelectedUser(parsed);
            }
        };
        load();
    }, []);

    if (!isOpen) return null;

    // Get Current Race Info
    const currentRace = MOCK_RACES.find(r => r.location === selectedLocation && r.raceNumber === selectedRaceNum);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        const raceId = currentRace?.id || `${selectedLocation.toLowerCase()}${selectedRaceNum}`;

        onSubmit({
            userId: selectedUser.id,
            raceId,
            investment: Number(investment) || 0,
            returnAmount: Number(returnAmount) || 0,
        });

        setInvestment("");
        setReturnAmount("");
        onClose();
    };

    const handleGuestLogin = () => {
        if (!selectedUser) return;
        if (guestPin === selectedUser.pin) {
            setCurrentUser(selectedUser);
        } else {
            setGuestError(true);
            setTimeout(() => setGuestError(false), 500);
        }
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const u = users.find(user => user.id === e.target.value);
        setSelectedUser(u || null);
        setGuestPin("");
        setGuestError(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#004d25]">
                    <h2 className="font-bold text-white text-lg">戦績報告</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-6">
                    {/* User Selection */}
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase">馬名【ジョッキー】</label>
                        {currentUser ? (
                            <div className="w-full bg-gray-800 text-white p-3 rounded-xl border border-white/10 font-bold flex justify-between items-center">
                                <span>{currentUser.name} 【{currentUser.jockey}】</span>
                                <Lock className="w-4 h-4 text-green-500" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <select
                                    className="w-full bg-gray-800 text-white p-3 rounded-xl border border-white/10 font-bold appearance-none"
                                    onChange={handleUserChange}
                                    value={selectedUser?.id || ""}
                                >
                                    <option value="">-- 選択してください --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} 【{u.jockey}】
                                        </option>
                                    ))}
                                </select>

                                {selectedUser && (
                                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="password"
                                            value={guestPin}
                                            onChange={e => setGuestPin(e.target.value)}
                                            className={clsx(
                                                "flex-1 bg-black border rounded-lg px-3 py-2 text-white font-mono outline-none",
                                                guestError ? "border-red-500" : "border-white/20"
                                            )}
                                            placeholder="PIN"
                                        />
                                        <button
                                            onClick={handleGuestLogin}
                                            className="bg-yellow-500 text-black font-bold px-4 rounded-lg"
                                        >
                                            OK
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Show Form only if Authenticated */}
                    {currentUser && (
                        <>
                            {/* Race Selector */}
                            <div className="space-y-2">
                                <label className="text-xs text-white/50 uppercase">レース場・R</label>
                                <div className="flex gap-2 p-1 bg-gray-800 rounded-xl">
                                    {(["Kokura", "Tokyo", "Hanshin"] as const).map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => setSelectedLocation(loc)}
                                            className={clsx(
                                                "flex-1 py-4 text-lg font-black rounded-lg transition-colors",
                                                selectedLocation === loc ? "bg-white text-black shadow-lg transform scale-105" : "text-white/50 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {loc === "Kokura" ? "小倉" : loc === "Tokyo" ? "東京" : "阪神"}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-6 gap-2 mt-2">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedRaceNum(i + 1)}
                                            className={clsx(
                                                "aspect-square rounded-lg text-sm font-bold flex items-center justify-center border",
                                                selectedRaceNum === i + 1
                                                    ? "bg-yellow-500 border-yellow-500 text-black"
                                                    : "border-white/10 hover:border-white/30 text-white/70"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                {/* Race Details */}
                                <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                    <Info className="w-5 h-5 text-yellow-500 shrink-0" />
                                    <div className="text-sm">
                                        <div className="font-bold text-white">
                                            {currentRace?.name || `${selectedLocation} ${selectedRaceNum}R`}
                                        </div>
                                        {currentRace && (
                                            <div className="text-gray-400 text-xs mt-0.5">
                                                {currentRace.conditions} / 発走 {currentRace.startTime}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Amounts - Side by Side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-white/50 uppercase">投資額 (円)</label>
                                    <input
                                        type="tel"
                                        pattern="[0-9]*"
                                        value={investment}
                                        onChange={(e) => setInvestment(e.target.value)}
                                        className="w-full bg-gray-800 text-white text-2xl font-mono p-3 rounded-xl border border-white/10 focus:border-yellow-500 outline-none placeholder:text-gray-700 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-white/50 uppercase">回収額 (円)</label>
                                    <input
                                        type="tel"
                                        pattern="[0-9]*"
                                        value={returnAmount}
                                        onChange={(e) => setReturnAmount(e.target.value)}
                                        className="w-full bg-gray-800 text-white text-2xl font-mono p-3 rounded-xl border border-white/10 focus:border-green-500 outline-none placeholder:text-gray-700 text-center"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {currentUser && (
                    <div className="p-4 border-t border-white/10 bg-gray-800">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all text-lg"
                        >
                            報告する
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Lock, Info } from "lucide-react";
import { Race, User, Bet } from "@/lib/types";
import { MOCK_RACES, MOCK_USERS } from "@/lib/mock";
import clsx from "clsx";
import { fetchUsers, fetchUserBets } from "@/lib/api";

interface BettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (bet: { userId: string; raceId: string; investment: number; returnAmount: number }) => void;
    isAdmin?: boolean;
    initialData?: Bet | null;
    isBettingClosed?: boolean;
}

// Fixed Order List
// Fixed Order List (Jockey Name)
const ORDERED_JOCKEYS = [
    "原田", "矢橋", "岡本", "安井",
    "稲葉", "櫛部", "土坂", "伊藤",
    "冨田", "大橋", "大久保", "佐久間"
];

export function BettingModal({ isOpen, onClose, onSubmit, isAdmin = false, initialData, isBettingClosed = false }: BettingModalProps) {
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
                const indexA = ORDERED_JOCKEYS.indexOf(a.jockey);
                const indexB = ORDERED_JOCKEYS.indexOf(b.jockey);
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

    useEffect(() => {
        if (isOpen && initialData && users.length > 0) {
            // Pre-fill form from initialData
            const u = users.find(user => user.id === initialData.userId);
            if (u) {
                setSelectedUser(u);
                setCurrentUser(u); // Auto-login if editing
            }

            // Parse raceId (e.g. "k01" -> location="Kokura", num=1)
            const r = MOCK_RACES.find(mr => mr.id === initialData.raceId);
            if (r) {
                setSelectedLocation(r.location);
                setSelectedRaceNum(r.raceNumber);
            }

            setInvestment(initialData.investment.toLocaleString());
            setReturnAmount(initialData.returnAmount.toLocaleString());
        } else if (isOpen && !initialData) {
            // Reset if opening fresh
            setInvestment("");
            setReturnAmount("");
        }
    }, [isOpen, initialData, users]);

    if (!isOpen) return null;

    // Get Current Race Info
    const currentRace = MOCK_RACES.find(r => r.location === selectedLocation && r.raceNumber === selectedRaceNum);

    // Close All Lock
    if (isBettingClosed && !isAdmin) {
        // Force close or show blocked message override in render
    }

    // Locking Logic
    const isLocked = (() => {
        if (isAdmin) return false;
        if (!currentRace?.startTime) return false;

        // Parse "HH:MM" (Japan Time)
        const [hours, minutes] = currentRace.startTime.split(":").map(Number);
        const now = new Date();
        // Create race date object (assuming today)
        const raceDate = new Date();
        raceDate.setHours(hours, minutes, 0, 0);

        // If race time is NOT passed yet, lock it (Prevent accidental input before race)
        return now < raceDate;
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        if (isBettingClosed && !isAdmin) {
            alert("全投票締め切り済みです。結果発表をお待ちください。");
            return;
        }
        if (isLocked) {
            alert("このレースはまだ発走していないため報告できません。");
            return;
        }

        const raceId = currentRace?.id || `${selectedLocation.toLowerCase()}${selectedRaceNum}`;

        // Duplicate Check only if not editing (or check if changed?)
        // If initialData exists and matches current selection, skip duplicate check?
        // Actually simplest is: if editing, we are "re-submitting", so just warn if it's a DIFFERENT new bet, 
        // but here we are conceptually "overwriting" logic. 
        // Let's keep duplicate check but suppress it if we are editing the SAME race/user.

        // But for now, let's keep it simple. If editing, we allow re-submission.
        // We can just confirm.

        if (!initialData) {
            const userBets = await fetchUserBets(selectedUser.id);
            const hasBet = userBets.some(b => b.raceId === raceId);

            if (hasBet) {
                if (!confirm("このレースはすでに報告済みです。上書きして修正しますか？")) {
                    return;
                }
            }
        }

        // Parse amounts (remove commas)
        const investmentVal = Number(investment.replace(/,/g, ''));
        const returnVal = Number(returnAmount.replace(/,/g, ''));

        onSubmit({
            userId: selectedUser.id,
            raceId,
            investment: investmentVal || 0,
            returnAmount: returnVal || 0,
        });

        // Close is handled by parent or here? Parent handles state, but we should call onClose
        // onSubmit in parent calls setBets etc.
        // wait, parent closes modal in handleAddBet? No.
        // BettingModal calls onClose at end of submit.

        setInvestment("");
        setReturnAmount("");
        onClose();
    };

    // Number Formatting Helpers
    const formatNumber = (val: string) => {
        const num = val.replace(/[^0-9]/g, '');
        if (!num) return "";
        return Number(num).toLocaleString();
    };

    const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvestment(formatNumber(e.target.value));
    };

    const handleReturnAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReturnAmount(formatNumber(e.target.value));
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
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        // Check lock status for each race button
                                        const raceNum = i + 1;
                                        const r = MOCK_RACES.find(ra => ra.location === selectedLocation && ra.raceNumber === raceNum);
                                        let isBtnLocked = false;
                                        if (!isAdmin && r?.startTime) {
                                            const [h, m] = r.startTime.split(":").map(Number);
                                            const d = new Date();
                                            const rd = new Date();
                                            rd.setHours(h, m, 0, 0);
                                            if (d < rd) isBtnLocked = true;
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedRaceNum(raceNum)}
                                                disabled={isBtnLocked}
                                                className={clsx(
                                                    "aspect-square rounded-lg text-sm font-bold flex items-center justify-center border transition-all",
                                                    selectedRaceNum === raceNum
                                                        ? "bg-yellow-500 border-yellow-500 text-black scale-110 shadow-lg z-10"
                                                        : isBtnLocked
                                                            ? "bg-gray-800 border-transparent text-gray-600 cursor-not-allowed"
                                                            : "border-white/10 hover:border-white/30 text-white/70"
                                                )}
                                            >
                                                {raceNum}
                                            </button>
                                        );
                                    })}
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
                                        onChange={handleInvestmentChange}
                                        className="w-full bg-gray-800 text-white text-3xl font-bold font-mono p-3 rounded-xl border border-white/10 focus:border-yellow-500 outline-none placeholder:text-gray-700 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-white/50 uppercase">回収額 (円)</label>
                                    <input
                                        type="tel"
                                        pattern="[0-9]*"
                                        value={returnAmount}
                                        onChange={handleReturnAmountChange}
                                        className="w-full bg-gray-800 text-white text-3xl font-bold font-mono p-3 rounded-xl border border-white/10 focus:border-green-500 outline-none placeholder:text-gray-700 text-center"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            {isLocked && (
                                <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl text-center text-sm font-bold border border-blue-500/20">
                                    ℹ️ このレースはまだ発走していません
                                </div>
                            )}
                            {isBettingClosed && !isAdmin && (
                                <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-center text-sm font-bold border border-red-500/20">
                                    ⛔ 全投票締め切り済み
                                </div>
                            )}
                        </>
                    )}
                </div>

                {currentUser && (
                    <div className="p-4 border-t border-white/10 bg-gray-800">
                        <button
                            onClick={handleSubmit}
                            disabled={isLocked || (isBettingClosed && !isAdmin)}
                            className={clsx(
                                "w-full font-bold py-4 rounded-xl shadow-lg transition-all text-lg",
                                isLocked || (isBettingClosed && !isAdmin)
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-500 text-white active:scale-95"
                            )}
                        >
                            {isBettingClosed && !isAdmin ? "受付終了" : (isLocked ? "未発走" : "報告する")}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { RankingCard } from "@/components/RankingCard";
import { BettingModal } from "@/components/BettingModal";
import { NewsTicker } from "@/components/NewsTicker";
import { MOCK_BETS, MOCK_USERS } from "@/lib/mock";
import { LeaderboardEntry, Bet, User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, User as UserIcon, Star } from "lucide-react";
import Link from "next/link";
import { fetchBets, fetchUsers } from "@/lib/api";
import { supabase } from "@/lib/supabase";

// Fixed Order List
const ORDERED_NAMES = [
  "ウグイスバレー", "ニンゲンビレッジ", "チェンジドライバ", "エセドバイオー",
  "サイレントイナバ", "ブームオレタ", "ツチサカ", "イトウ",
  "ハンケン", "アサミハズバンド", "オオクボハグルマ", "キンパチティーチャ"
];

export default function Home() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load User from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // Initial Fetch
  useEffect(() => {
    const loadData = async () => {
      const [uArgs, bArgs] = await Promise.all([fetchUsers(), fetchBets()]);

      // Sort users by ORDERED_NAMES by name string
      const sortedUsers = uArgs.sort((a, b) => {
        const indexA = ORDERED_NAMES.indexOf(a.name);
        const indexB = ORDERED_NAMES.indexOf(b.name);
        // If name not in list (edited?), put at end
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      setUsers(sortedUsers);
      setBets(bArgs);
    };
    loadData();
  }, []);

  // Realtime
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const channel = supabase
      .channel('realtime bets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bets' }, (payload) => {
        const newBet: Bet = {
          id: payload.new.id,
          userId: payload.new.user_id,
          raceId: payload.new.race_id,
          investment: payload.new.investment,
          return_amount: payload.new.return_amount,
          timestamp: payload.new.created_at
        } as any; // Cast for snake_case confusion in type vs mock

        // Actually fetchBets returns camelCase. Supabase payload is snake_case.
        // We need to ensure we map correctly.
        const mappedBet: Bet = {
          id: payload.new.id,
          userId: payload.new.user_id,
          raceId: payload.new.race_id,
          investment: payload.new.investment,
          returnAmount: payload.new.return_amount,
          timestamp: payload.new.created_at
        };

        setBets(prev => [...prev, mappedBet]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    // 1. Process Valid Bets (Latest per User+Race)
    // Group by userId + raceId
    const latestBetsMap = new Map<string, Bet>();

    bets.forEach(bet => {
      const key = `${bet.userId}-${bet.raceId}`;
      const existing = latestBetsMap.get(key);
      if (!existing || new Date(bet.timestamp) > new Date(existing.timestamp)) {
        latestBetsMap.set(key, bet);
      }
    });

    // Convert back to array of valid bets
    const validBets = Array.from(latestBetsMap.values());

    // 2. Calculate Stats
    const entries: LeaderboardEntry[] = users.map((user) => {
      const userBets = validBets.filter((b) => b.userId === user.id);
      const totalInvestment = userBets.reduce((sum, b) => sum + b.investment, 0);
      const totalReturn = userBets.reduce((sum, b) => sum + b.returnAmount, 0);
      const netProfit = totalReturn - totalInvestment;

      // User Request: 100% baseline. 0/1000 -> 0%. 1000/1000 -> 100%.
      const returnRate = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

      return {
        ...user,
        totalInvestment,
        totalReturn,
        netProfit,
        returnRate,
        rank: 0,
        isKing: false,
      };
    });

    // 3. Determine King (Max Investment)
    const maxInvestment = Math.max(...entries.map((e) => e.totalInvestment));
    entries.forEach((e) => {
      if (e.totalInvestment === maxInvestment && maxInvestment > 0) {
        e.isKing = true;
      }
    });

    // 4. Determine Rank
    // Rules: ReturnRate DESC -> Investment DESC
    const rankedEntries = [...entries].sort((a, b) => {
      if (b.returnRate !== a.returnRate) {
        return b.returnRate - a.returnRate;
      }
      return b.totalInvestment - a.totalInvestment;
    });

    // Assign Ranks
    let currentRank = 1;
    rankedEntries.forEach((entry, i) => {
      if (i > 0) {
        const prev = rankedEntries[i - 1];
        if (prev.returnRate === entry.returnRate && prev.totalInvestment === entry.totalInvestment) {
          // Same rank
        } else {
          currentRank = i + 1;
        }
      }
      // Update original entry object
      const original = entries.find(e => e.id === entry.id);
      if (original) original.rank = currentRank;
    });

    // Final leaderboard strictly follows ORDERED_NAMES (which is `users` order)
    setLeaderboard(entries);
  }, [bets, users]);

  const handleAddBet = async (newBetData: { userId: string; raceId: string; investment: number; returnAmount: number }) => {
    const { createBet } = await import("@/lib/api");
    const user = users.find(u => u.id === newBetData.userId);
    await createBet({
      ...newBetData,
      user_name: user ? `${user.name} 【${user.jockey}】` : "Unknown"
    });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const newBet: Bet = { id: Math.random().toString(), ...newBetData, timestamp: new Date().toISOString() };
      setBets(prev => [...prev, newBet]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#004d25] text-white font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#002812] via-[#00401b] to-[#002812] p-4 border-b border-[#001a0a] flex justify-between items-center relative shadow-xl overflow-hidden">
        {/* Shine Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

        <h1 className="text-lg font-black tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10 flex items-center gap-1">
          鶯谷杯
          <span className="flex items-center text-yellow-400">
            <span className="mx-1 text-xl">🏆</span>
            <span className="text-base">小倉2026</span>
          </span>
        </h1>
        <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors border border-white/20 z-10">
          <UserIcon className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-bold truncate max-w-[120px]">
            {currentUser ? currentUser.name : "ログイン"}
          </span>
        </Link>
      </header>

      {/* News Ticker */}
      <NewsTicker bets={bets} users={users} />

      {/* Helper Header + Legend */}
      <div className="flex items-center text-xs font-bold text-gray-300 bg-[#003318] border-b border-gray-600 py-2">
        <div className="w-10 text-center border-r border-gray-600">No</div>

        {/* Name Header + Legend Combined */}
        <div className="flex-1 px-3 border-r border-gray-600 flex justify-between items-center">
          <span>馬名【ジョッキー】</span>
          {/* Legend moved here */}
          <div className="flex gap-3 scale-90 origin-right">
            <div className="flex items-center gap-1">
              <span className="text-base">👑</span> 1位
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 投資王
            </div>
          </div>
        </div>

        <div className="w-12 text-center border-r border-gray-600">順位</div>
        <div className="w-20 text-center border-r border-gray-600">回収率</div>
        <div className="w-10 text-center">印</div>
      </div>

      {/* Main List */}
      <main className="flex-1 pb-24 bg-[#004d25]">
        <AnimatePresence>
          {leaderboard.map((entry, index) => (
            <RankingCard key={entry.id} entry={entry} index={index} currentUser={currentUser} />
          ))}
        </AnimatePresence>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-4 rounded-full shadow-lg flex items-center justify-center border-2 border-white"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BettingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddBet} />
        )}
      </AnimatePresence>
    </div>
  );
}

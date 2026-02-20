"use client";

import { useEffect, useState, useMemo } from "react";

import { RankingCard } from "@/components/RankingCard";
import { BettingModal } from "@/components/BettingModal";
import { NewsTicker } from "@/components/NewsTicker";
import { AdminControls } from "@/components/AdminControls";
import { ConfirmModal } from "@/components/ConfirmModal";
import { MOCK_BETS, MOCK_USERS } from "@/lib/mock";
import { LeaderboardEntry, Bet, User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, User as UserIcon, Star } from "lucide-react";
import Link from "next/link";
import { fetchBets, fetchUsers, fetchSystemStatus } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";

// Fixed Order List
// Fixed Order List (Jockey Name)
const ORDERED_JOCKEYS = [
  "原田", "矢橋", "岡本", "安井",
  "稲葉", "櫛部", "土坂", "伊藤",
  "冨田", "大橋", "大久保", "佐久間"
];

export default function Home() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [lastBetUpdate, setLastBetUpdate] = useState<number>(Date.now());

  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [showClosedAlert, setShowClosedAlert] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'win' | 'loss' | null>(null);

  // Load User from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // Initial Fetch
  useEffect(() => {
    const loadData = async () => {
      const [uArgs, bArgs, sysArgs] = await Promise.all([fetchUsers(), fetchBets(), fetchSystemStatus()]);

      // Sort users by ORDERED_JOCKEYS (Fixed order)
      const sortedUsers = uArgs.sort((a, b) => {
        const indexA = ORDERED_JOCKEYS.indexOf(a.jockey);
        const indexB = ORDERED_JOCKEYS.indexOf(b.jockey);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      setUsers(sortedUsers);
      setBets(bArgs);
      setIsBettingClosed(sysArgs.isBettingClosed);
    };
    loadData();
  }, []);

  // Realtime
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const channel = supabase
      .channel('realtime bets')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, (payload) => {
        setIsBettingClosed(payload.new.is_betting_closed);
      })
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
          investment: Number(payload.new.investment),
          returnAmount: Number(payload.new.return_amount),
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
      const key = `${bet.userId} -${bet.raceId} `;
      const existing = latestBetsMap.get(key);
      if (!existing || new Date(bet.timestamp) > new Date(existing.timestamp)) {
        latestBetsMap.set(key, bet);
      }
    });

    // Convert back to array of valid bets
    const validBets = Array.from(latestBetsMap.values());

    // 2. Calculate Stats
    // Helper to safely parse numbers (handle "300,000" strings)
    const cleanNumber = (val: any) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return Number(val.replace(/,/g, ''));
      return 0;
    };

    const statsEntries: LeaderboardEntry[] = users.map((user) => {
      const userBets = validBets.filter((b) => b.userId === user.id);
      const totalInvestment = userBets.reduce((sum, b) => sum + cleanNumber(b.investment), 0);
      const totalReturn = userBets.reduce((sum, b) => sum + cleanNumber(b.returnAmount), 0);
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
    // Use reduce to find max to avoid spread operator limits or issues
    const maxInvestment = statsEntries.reduce((max, e) => Math.max(max, e.totalInvestment), 0);

    // Create new array with isKing flag (Immutable)
    const entriesWithKing = statsEntries.map(e => ({
      ...e,
      isKing: maxInvestment > 0 && e.totalInvestment === maxInvestment
    }));

    // 4. Determine Rank
    // Rules: ReturnRate DESC -> Investment DESC
    const rankedEntries = [...entriesWithKing].sort((a, b) => {
      if (b.returnRate !== a.returnRate) {
        return b.returnRate - a.returnRate;
      }
      return b.totalInvestment - a.totalInvestment;
    });

    // Assign Ranks
    const entriesWithRank: LeaderboardEntry[] = [];
    rankedEntries.forEach((entry, i) => {
      let rank = i + 1;
      if (i > 0) {
        const prev = rankedEntries[i - 1];
        if (prev.returnRate === entry.returnRate && prev.totalInvestment === entry.totalInvestment) {
          // Check the previously added entry in the new list
          rank = entriesWithRank[i - 1].rank;
        }
      }
      entriesWithRank.push({ ...entry, rank });
    });

    // Final leaderboard must follow the ORDERED_JOCKEYS (which is `users` order) or just keep `users` order?
    // The original code mapped `entries` back to `setLeaderboard`. 
    // `entries` was created from `users.map`.
    // So we need to restore the original order of `users`.
    const finalLeaderboard = users.map(user => {
      const ranked = entriesWithRank.find(r => r.id === user.id);
      return ranked || { ...user, totalInvestment: 0, totalReturn: 0, netProfit: 0, returnRate: 0, rank: 999, isKing: false };
    });

    setLeaderboard(finalLeaderboard);
  }, [bets, users]);

  const handleAddBet = async (newBetData: { userId: string; raceId: string; investment: number; returnAmount: number }) => {
    if (isBettingClosed && !isAdmin) {
      alert("全投票締め切り済みです。");
      return;
    }
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
    setLastBetUpdate(Date.now());

    // Celebration Logic
    const profit = newBetData.returnAmount - newBetData.investment;
    if (profit > 0) {
      setCelebrationType('win');
    } else {
      setCelebrationType('loss');
    }
  };

  const handleEditBet = (bet: Bet) => {
    setEditingBet(bet);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBet(null);
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

      {/* Ticker */}
      <NewsTicker bets={bets} users={users} customMessage={(() => {
        if (!isBettingClosed) return null;

        // Result Logic
        const sorted = [...leaderboard].sort((a, b) => {
          // Priority: ReturnRate desc -> Investment desc (Same as main leaderboard)
          if (b.returnRate !== a.returnRate) {
            return b.returnRate - a.returnRate;
          }
          return b.totalInvestment - a.totalInvestment;
        });

        if (sorted.length === 0) return "全投票締め切り。結果確定しました。";

        const first = sorted[0];
        const second = sorted[1];
        const third = sorted[2];

        // Investment King
        // Use local sort to find king for ticker (robust calculation again if needed, or rely on leaderboard)
        // But leaderboard update acts on state, which might be async. 
        // Safer to recalculate max from current leaderboard state if available.
        const king = [...leaderboard].sort((a, b) => b.totalInvestment - a.totalInvestment)[0];

        // Format: 投資王 [Name]さん（投資王） -> Hide amount for everyone in ticker
        return `全投票締め切り。結果確定しました。　　優勝 ${first?.name || "-"} さん（${Math.round(first?.returnRate || 0)}％）　　準優勝 ${second?.name || "-"} さん（${Math.round(second?.returnRate || 0)}％）　　３位 ${third?.name || "-"} さん（${Math.round(third?.returnRate || 0)}％）　　投資王 ${king?.name || "-"}さん（投資王）　でした。おめでとうございます！`;
      })()} />

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
            <RankingCard
              key={entry.id}
              entry={entry}
              index={index}
              currentUser={currentUser}
              onEditBet={handleEditBet}
              lastBetUpdate={lastBetUpdate}
            />
          ))}
        </AnimatePresence>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (isBettingClosed && !isAdmin) {
              setShowClosedAlert(true);
              return;
            }
            setIsModalOpen(true);
          }}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-4 rounded-full shadow-lg flex items-center justify-center border-2 border-white"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BettingModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSubmit={handleAddBet}
            isAdmin={isAdmin}
            initialData={editingBet}
          />
        )}
      </AnimatePresence>

      <AdminControls
        isAdmin={isAdmin}
        isBettingClosed={isBettingClosed}
        onLogin={async (pass) => {
          if (pass === "1155") {
            setIsAdmin(true);

            const u = await fetchUsers();
            // Sort by ORDERED_JOCKEYS (Fixed order)
            const sortedUsers = u.sort((a, b) => {
              const indexA = ORDERED_JOCKEYS.indexOf(a.jockey);
              const indexB = ORDERED_JOCKEYS.indexOf(b.jockey);
              return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
            setUsers(sortedUsers);
            const b = await fetchBets();
            setBets(b);
            const { isBettingClosed: fetchedIsBettingClosed } = await fetchSystemStatus();
            setIsBettingClosed(fetchedIsBettingClosed);
            return true;
          }
          return false;
        }}
        onLogout={() => setIsAdmin(false)}
      />

      <ConfirmModal
        isOpen={showClosedAlert}
        title="投票受付終了"
        message={"全ての投票は締め切られました。\n結果発表をお待ちください。"}
        isAlert={true}
        onConfirm={() => setShowClosedAlert(false)}
        onCancel={() => setShowClosedAlert(false)}
      />

      <CelebrationOverlay
        type={celebrationType}
        onClose={() => setCelebrationType(null)}
      />
    </div>
  );
}


"use client";

import { sortUsers } from "@/lib/users";
import { Toast, ToastData } from "@/components/Toast";
import { MOCK_RACES } from "@/lib/mock";
import { createKyotoTournament, setSavedArchives } from "@/lib/history";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";

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
import { fetchBets, fetchUsers, fetchSystemStatus, fetchSavedArchives, saveTournamentArchive } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { HistoryModal } from "@/components/HistoryModal";
import { HelpModal } from "@/components/HelpModal";
import Image from "next/image";
import { Trophy, HelpCircle } from "lucide-react";


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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [, setArchivesVersion] = useState(0); // re-render after saved results load
  const closeToast = useCallback(() => setToast(null), []);

  // Latest values for the realtime handlers (subscribed once)
  const usersRef = useRef<User[]>(users);
  const currentUserRef = useRef<User | null>(currentUser);
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // Results saved when a past tournament was closed
  useEffect(() => {
    fetchSavedArchives().then(a => { setSavedArchives(a); setArchivesVersion(v => v + 1); });
  }, []);

  const reloadUsersAndBets = async () => {
    const [u, b] = await Promise.all([fetchUsers(), fetchBets()]);
    setUsers(sortUsers(u));
    setBets(b);
  };

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
      const sortedUsers = sortUsers(uArgs);
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

        // Notify others (no amounts)
        if (mappedBet.userId !== currentUserRef.current?.id) {
          const reporter = usersRef.current.find(u => u.id === mappedBet.userId);
          const race = MOCK_RACES.find(r => r.id === mappedBet.raceId);
          const raceName = race ? `${race.location === "Kyoto" ? "京都" : "東京"}${race.raceNumber}R` : "レース";
          if (reporter) {
            // Rate only (same basis as the ranking); amounts stay private
            const { investment, returnAmount } = mappedBet;
            if (investment > 0 && returnAmount > investment) {
              setToast({ kind: "win", message: `🎉 ${reporter.name}さん ${raceName} WIN ${Math.round((returnAmount / investment) * 100)}%` });
            } else if (investment > 0 && returnAmount < investment) {
              setToast({ kind: "lose", message: `💧 ${reporter.name}さん ${raceName} LOSE ${Math.round((returnAmount / investment) * 100)}%` });
            } else if (investment > 0) {
              setToast({ kind: "even", message: `😐 ${reporter.name}さん ${raceName} EVEN 100%` });
            } else {
              setToast({ kind: "info", message: `🏇 ${reporter.name}さんが ${raceName} を報告！` });
            }
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        reloadUsersAndBets(); // participants added / deleted / reordered by admin
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
      <header className="bg-gradient-to-r from-[#002812] via-[#00401b] to-[#002812] pl-1 pr-4 py-1 border-b border-[#001a0a] flex justify-between items-center relative shadow-xl overflow-hidden min-h-[72px]">
        {/* Shine Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

        <h1 className="z-10 flex items-center h-full">
          <Image
            src="/logo.svg"
            alt="鶯谷杯"
            width={352}
            height={70}
            className="h-[70px] w-auto object-contain"
          />
        </h1>
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1 px-2.5 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-colors border border-white/20 text-white font-bold text-xs sm:text-sm"
            title="使い方"
            aria-label="使い方"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">使い方</span>
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-yellow-600/30 to-amber-600/30 hover:from-yellow-600/50 hover:to-amber-600/50 backdrop-blur-sm rounded-full transition-all border border-yellow-500/40 text-yellow-300 font-bold text-xs sm:text-sm shadow-md"
            title="歴代大会の記録を見る"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>歴代記録</span>
          </button>
          <Link href="/login" className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors border border-white/20">
            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <span className="text-xs sm:text-sm font-bold truncate max-w-[90px] sm:max-w-[120px]">
              {currentUser ? currentUser.name : "ログイン"}
            </span>
          </Link>
        </div>
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
        users={users}
        onUsersChanged={reloadUsersAndBets}
        onBettingClosed={async () => {
          // Save the final results to the history
          const archive = createKyotoTournament(leaderboard, { final: true });
          if (!archive) return;
          const { error } = await saveTournamentArchive(archive);
          if (error) alert("結果を歴代記録に保存できませんでした。\nSupabaseで supabase/update_v2.sql を実行してください。\n" + error.message);
          else alert("最終結果を歴代記録に保存しました。");
        }}
        onLogin={async (pass) => {
          if (pass === "1155") {
            setIsAdmin(true);

            const u = await fetchUsers();
            // Sort by ORDERED_JOCKEYS (Fixed order)
            const sortedUsers = sortUsers(u);
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

      <Toast message={toast} onClose={closeToast} />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentLeaderboard={leaderboard}
        currentUser={currentUser}
      />
    </div>
  );
}


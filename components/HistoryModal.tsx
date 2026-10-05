"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Trophy, Star, Crown, Calendar, MapPin, Award, Flame,
    TrendingUp, Sparkles, Lock, Unlock, ChevronRight, ArrowLeft,
    BarChart3, UserCheck, ShieldCheck
} from "lucide-react";
import {
    getAllTournaments,
    getCareerReturnRateRanking,
    getCareerInvestmentTop3,
    getChampionRanking,
    getJockeyPersonalDetail,
    JockeyPersonalDetail
} from "@/lib/history";
import { LeaderboardEntry, User, TournamentArchive } from "@/lib/types";
import clsx from "clsx";

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLeaderboard?: LeaderboardEntry[];
    currentUser?: User | null;
}

export function HistoryModal({
    isOpen,
    onClose,
    currentLeaderboard,
    currentUser
}: HistoryModalProps) {
    const [activeTab, setActiveTab] = useState<string>("hof");
    const [selectedJockey, setSelectedJockey] = useState<string | null>(null);

    if (!isOpen) return null;

    // 進行中の京都大会を含む全データ集計
    const { tournaments, hasCurrentKyoto } = getAllTournaments(currentLeaderboard);
    const careerReturnRanking = getCareerReturnRateRanking(currentLeaderboard);
    const careerInvestmentTop3 = getCareerInvestmentTop3(currentLeaderboard);
    const topCareerChamp = careerReturnRanking[0]; // 通算回収率1位
    const currentTournament = tournaments.find(t => t.id === activeTab);

    // 選択されたジョッキーの個人カルテ詳細
    const selectedDetail: JockeyPersonalDetail | null = selectedJockey
        ? getJockeyPersonalDetail(selectedJockey, currentLeaderboard)
        : null;

    // ログイン中の本人かどうか（名寄せ冨田・富田対応）
    const isSelectedUserCurrentLogin = (jockeyName: string) => {
        if (!currentUser) return false;
        const normSelected = jockeyName === "富田" ? "冨田" : jockeyName;
        const normLogin = currentUser.jockey === "富田" ? "冨田" : currentUser.jockey;
        return normSelected === normLogin;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-2xl max-h-[92vh] bg-gradient-to-b from-[#0a2312] via-[#04170b] to-[#010b05] text-white rounded-2xl shadow-2xl border border-yellow-500/30 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-3.5 sm:p-5 border-b border-white/10 flex justify-between items-center bg-black/40">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-xl border border-yellow-500/40">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-xl font-black tracking-wide flex items-center gap-2">
                                    歴代大会アーカイブ
                                    <span className="text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/40 font-bold">
                                        通算記録
                                    </span>
                                </h2>
                                <p className="text-[11px] sm:text-xs text-gray-400">
                                    過去全大会＋今回京都の通算成績＆公式記録
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1.5 p-2 sm:p-3 overflow-x-auto bg-black/60 border-b border-white/10 scrollbar-none">
                        <button
                            onClick={() => {
                                setActiveTab("hof");
                                setSelectedJockey(null);
                            }}
                            className={clsx(
                                "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5",
                                activeTab === "hof"
                                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/20 scale-105"
                                    : "text-gray-300 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <Crown className="w-3.5 h-3.5" /> 殿堂・通算ランキング
                        </button>

                        {[...tournaments].reverse().map(t => {
                            const isLive = t.id === "kyoto_2026";
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setActiveTab(t.id);
                                        setSelectedJockey(null);
                                    }}
                                    className={clsx(
                                        "px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                                        activeTab === t.id
                                            ? isLive
                                                ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105"
                                                : "bg-white text-black shadow-lg scale-105"
                                            : isLive
                                            ? "text-red-400 bg-red-950/40 border border-red-500/40 hover:bg-red-900/50"
                                            : "text-gray-300 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {isLive && (
                                        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                                    )}
                                    {t.edition} {t.venue}
                                    {isLive && <span className="text-[10px] font-black text-red-200">LIVE</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6">
                        {/* ================= 個人カルテ詳細ビュー ================= */}
                        {selectedDetail ? (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                {/* Back to Ranking Button */}
                                <button
                                    onClick={() => setSelectedJockey(null)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-yellow-500/30 transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    通算ランキング一覧に戻る
                                </button>

                                {/* Personal Header Card */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-black/60 to-black/80 border-2 border-yellow-500/40 shadow-xl relative overflow-hidden">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl sm:text-2xl font-black text-white">
                                                    {selectedDetail.horse}
                                                </span>
                                                <span className="text-base sm:text-lg font-bold text-yellow-300">
                                                    【{selectedDetail.jockey}】
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                <span className="text-xs bg-white/10 text-gray-200 px-2.5 py-0.5 rounded-full font-bold">
                                                    通算出場 {selectedDetail.participations}回
                                                </span>
                                                {selectedDetail.wins > 0 && (
                                                    <span className="text-xs bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1">
                                                        <Crown className="w-3 h-3" /> 優勝 {selectedDetail.wins}回
                                                    </span>
                                                )}
                                                {selectedDetail.kingCount > 0 && (
                                                    <span className="text-xs bg-purple-500/25 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-purple-400" /> 投資王 {selectedDetail.kingCount}回
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right bg-black/40 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-white/5 sm:border-0">
                                            <div className="text-[11px] text-yellow-200/80 font-bold uppercase tracking-wider">
                                                通算回収率
                                            </div>
                                            <div className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-amber-300">
                                                {selectedDetail.careerReturnRate.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats 3 Column */}
                                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                                        <div className="bg-white/5 p-2 rounded-xl">
                                            <div className="text-[10px] text-gray-400">過去最高回収率</div>
                                            <div className="text-sm sm:text-base font-black font-mono text-yellow-400 mt-0.5">
                                                {selectedDetail.bestReturnRate.toFixed(1)}%
                                            </div>
                                            <div className="text-[9px] text-gray-400 truncate">
                                                {selectedDetail.bestEdition}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-xl">
                                            <div className="text-[10px] text-gray-400">3位以内（馬券圏）</div>
                                            <div className="text-sm sm:text-base font-black text-white mt-0.5">
                                                {selectedDetail.podiums}回
                                            </div>
                                            <div className="text-[9px] text-gray-400">
                                                連対・入着率 {Math.round((selectedDetail.podiums / selectedDetail.participations) * 100)}%
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-xl">
                                            <div className="text-[10px] text-gray-400">通算タイトル</div>
                                            <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
                                                {selectedDetail.wins + selectedDetail.kingCount}冠
                                            </div>
                                            <div className="text-[9px] text-gray-400">
                                                勝{selectedDetail.wins} / 投{selectedDetail.kingCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 各回の回収率推移バーグラフ */}
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-yellow-300">
                                            <BarChart3 className="w-4 h-4 text-yellow-400" />
                                            各大会の回収率推移グラフ
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            破線: 100%基準ライン
                                        </span>
                                    </div>

                                    {/* 縦棒グラフコンテナ */}
                                    <div className="relative pt-6 pb-2 px-2 bg-black/50 rounded-xl border border-white/5">
                                        {/* 100% Line */}
                                        <div
                                            className="absolute left-0 right-0 border-b border-dashed border-yellow-400/50 pointer-events-none z-10 flex justify-end pr-2"
                                            style={{ bottom: "45%" }}
                                        >
                                            <span className="text-[9px] font-bold text-yellow-400/80 -mt-3.5">
                                                100% 損益分岐
                                            </span>
                                        </div>

                                        {/* Bars */}
                                        <div className="flex items-end justify-around gap-2 h-36 relative z-20">
                                            {selectedDetail.history.map((h, idx) => {
                                                // 最大値を300%程度としてスケール計算（最小5%, 最大100%）
                                                const maxRef = Math.max(...selectedDetail.history.map(x => x.returnRate), 150);
                                                const heightPercent = Math.min(Math.max((h.returnRate / maxRef) * 90, 6), 95);
                                                const isOver100 = h.returnRate >= 100;

                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                                                        {/* Tooltip on hover */}
                                                        <div className="text-[10px] font-black font-mono mb-1 transition-transform group-hover:scale-110">
                                                            <span className={clsx(
                                                                isOver100 ? "text-yellow-400" : "text-gray-400"
                                                            )}>
                                                                {h.returnRate.toFixed(1)}%
                                                            </span>
                                                        </div>

                                                        {/* Bar */}
                                                        <div
                                                            style={{ height: `${heightPercent}%` }}
                                                            className={clsx(
                                                                "w-full max-w-[42px] rounded-t-md transition-all duration-300 relative",
                                                                isOver100
                                                                    ? "bg-gradient-to-t from-yellow-600 via-yellow-400 to-amber-300 shadow-md shadow-yellow-500/30"
                                                                    : "bg-gradient-to-t from-slate-700 to-slate-500",
                                                                h.isCurrent && "ring-2 ring-red-500 animate-pulse"
                                                            )}
                                                        >
                                                            {h.rank === 1 && (
                                                                <Crown className="w-3.5 h-3.5 text-yellow-300 absolute -top-4 left-1/2 -translate-x-1/2" />
                                                            )}
                                                        </div>

                                                        {/* Label */}
                                                        <div className="text-center mt-2">
                                                            <div className="text-[10px] font-bold text-gray-300 whitespace-nowrap">
                                                                {h.edition}
                                                            </div>
                                                            <div className="text-[9px] text-gray-400">
                                                                {h.isCurrent ? "京都LIVE" : h.venue}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-yellow-300/90 mt-0.5">
                                                                {h.rank}位
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 🔒/🔓 投資額データ（本人限定開示機能！） */}
                                <div className={clsx(
                                    "p-4 rounded-xl border relative overflow-hidden transition-all",
                                    isSelectedUserCurrentLogin(selectedDetail.jockey)
                                        ? "bg-gradient-to-br from-emerald-950/40 via-black/60 to-emerald-900/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                                        : "bg-black/30 border-white/10"
                                )}>
                                    {isSelectedUserCurrentLogin(selectedDetail.jockey) ? (
                                        /* 🔓 ログイン本人限定の特別開示 */
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/40">
                                                        <Unlock className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
                                                            あなただけの限定開示データ
                                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30">
                                                                本人認証済
                                                            </span>
                                                        </h4>
                                                        <p className="text-[10px] text-gray-400">
                                                            ※この金額はログイン中のあなたにのみ表示されています
                                                        </p>
                                                    </div>
                                                </div>
                                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                            </div>

                                            {/* 本人の投資額サマリー */}
                                            <div className="grid grid-cols-3 gap-2 p-3 bg-black/50 rounded-xl border border-emerald-500/20 text-center">
                                                <div>
                                                    <div className="text-[10px] text-gray-400">通算投資総額</div>
                                                    <div className="text-xs sm:text-sm font-bold font-mono text-gray-200 mt-0.5">
                                                        ¥{selectedDetail.careerInvestment.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-400">通算回収総額</div>
                                                    <div className="text-xs sm:text-sm font-bold font-mono text-yellow-300 mt-0.5">
                                                        ¥{selectedDetail.careerReturn.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-400">通算純損益</div>
                                                    <div className={clsx(
                                                        "text-xs sm:text-sm font-black font-mono mt-0.5",
                                                        selectedDetail.careerNetProfit > 0
                                                            ? "text-emerald-400"
                                                            : selectedDetail.careerNetProfit === 0
                                                            ? "text-gray-300"
                                                            : "text-red-400"
                                                    )}>
                                                        {selectedDetail.careerNetProfit > 0 ? "+" : ""}
                                                        ¥{selectedDetail.careerNetProfit.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 各回の内訳リスト */}
                                            <div className="space-y-1.5 mt-2">
                                                <div className="text-[11px] font-bold text-gray-300 px-1">
                                                    各大会の投資内訳明細
                                                </div>
                                                <div className="divide-y divide-white/5 bg-black/40 rounded-lg overflow-hidden border border-white/5">
                                                    {selectedDetail.history.map((h, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-[11px] px-3 py-2">
                                                            <span className="font-bold text-gray-300">
                                                                {h.edition} {h.venue}
                                                                {h.isCurrent && <span className="text-red-400 font-bold ml-1">(進行中)</span>}
                                                            </span>
                                                            <div className="flex items-center gap-3 font-mono">
                                                                <span className="text-gray-400">
                                                                    投資 ¥{h.investment.toLocaleString()}
                                                                </span>
                                                                <span className="text-yellow-300">
                                                                    回収 ¥{h.returnAmount.toLocaleString()}
                                                                </span>
                                                                <span className={clsx(
                                                                    "font-bold w-16 text-right",
                                                                    h.netProfit > 0 ? "text-emerald-400" : h.netProfit === 0 ? "text-gray-400" : "text-red-400"
                                                                )}>
                                                                    {h.netProfit > 0 ? "+" : ""}¥{h.netProfit.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* 🔒 他人のデータ（非開示） */
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400">
                                                    <Lock className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                                                        投資額データ（非公開）
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                                        ※掛け金の多寡を気にせず楽しむため、具体的な投資額は本人のみに開示されます
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-purple-300/80 font-mono tracking-wider bg-black/40 px-3 py-1.5 rounded-lg border border-purple-400/20 shrink-0">
                                                投資額　？？？？？
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === "hof" ? (
                            /* ================= 殿堂・通算ランキング ビュー ================= */
                            <div className="space-y-6">

                                {/* 1. 通算回収率チャンピオン（最上位にドーンと目立たせる！） */}
                                {topCareerChamp && (
                                    <div
                                        onClick={() => setSelectedJockey(topCareerChamp.jockey)}
                                        className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-yellow-500/25 via-amber-600/15 to-black/60 border-2 border-yellow-400/60 shadow-xl shadow-yellow-500/15 relative overflow-hidden cursor-pointer hover:border-yellow-300 transition-all group"
                                    >
                                        <Trophy className="w-28 h-28 text-yellow-500/10 absolute -right-3 -bottom-3 pointer-events-none group-hover:scale-110 transition-transform" />
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full shadow-md">
                                                <Crown className="w-3.5 h-3.5" /> 歴代通算回収率チャンピオン
                                            </div>
                                            <span className="text-[11px] font-bold text-yellow-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-yellow-400/30 flex items-center gap-1">
                                                詳細を見る <ChevronRight className="w-3 h-3" />
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-3">
                                            <div>
                                                <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-2">
                                                    <span>{topCareerChamp.horse}</span>
                                                    <span className="text-sm sm:text-base font-bold text-yellow-200">
                                                        【{topCareerChamp.jockey}】
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                                                    <span>出場 {topCareerChamp.participations}回</span>
                                                    <span>•</span>
                                                    <span className="text-yellow-300 font-bold">優勝 {topCareerChamp.wins}回</span>
                                                </div>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <div className="text-[11px] text-yellow-200/80 font-bold uppercase tracking-wider">
                                                    通算回収率
                                                </div>
                                                <div className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-amber-300 drop-shadow">
                                                    {topCareerChamp.careerReturnRate.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. 通算回収率ランク表（全員分） - 本会の最高栄誉 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2.5 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-yellow-500/20 rounded-md">
                                                <TrendingUp className="w-4 h-4 text-yellow-400" />
                                            </div>
                                            <h3 className="text-sm sm:text-base font-black text-yellow-300 uppercase tracking-wide">
                                                通算回収率ランク表（全員）
                                            </h3>
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            ※行タップで個人の成績推移カルテを表示
                                        </span>
                                    </div>

                                    {/* テーブル */}
                                    <div className="bg-black/40 rounded-xl border border-yellow-500/20 overflow-hidden shadow-lg">
                                        {/* ヘッダー */}
                                        <div className="flex items-center text-xs font-bold text-gray-300 px-3 py-2.5 bg-black/70 border-b border-white/10">
                                            <span className="w-10 text-center">順位</span>
                                            <span className="flex-1">馬名（ジョッキー）</span>
                                            <span className="w-14 text-center">出場</span>
                                            <span className="w-14 text-center">優勝</span>
                                            <span className="w-24 text-right">通算回収率</span>
                                            <span className="w-6"></span>
                                        </div>

                                        {/* ボディ */}
                                        <div className="divide-y divide-white/5">
                                            {careerReturnRanking.map((u, i) => {
                                                const isOver100 = u.careerReturnRate >= 100;
                                                const isUser = isSelectedUserCurrentLogin(u.jockey);
                                                return (
                                                    <div
                                                        key={u.jockey}
                                                        onClick={() => setSelectedJockey(u.jockey)}
                                                        className={clsx(
                                                            "flex items-center text-xs sm:text-sm px-3 py-2.5 transition-all cursor-pointer group",
                                                            isUser
                                                                ? "bg-yellow-500/15 border-l-4 border-yellow-400 font-bold"
                                                                : i === 0
                                                                ? "bg-yellow-500/10 border-l-4 border-yellow-500/60"
                                                                : i <= 2
                                                                ? "bg-white/5 hover:bg-white/10"
                                                                : "hover:bg-white/10"
                                                        )}
                                                    >
                                                        <span className="w-10 text-center font-bold">
                                                            {i === 0 ? "👑 1" : i === 1 ? "🥈 2" : i === 2 ? "🥉 3" : `${i + 1}`}
                                                        </span>
                                                        <span className="flex-1 font-bold truncate flex items-center gap-1.5">
                                                            <span className="text-white truncate group-hover:text-yellow-300 transition-colors">
                                                                {u.horse}
                                                            </span>
                                                            <span className="text-gray-400 text-xs shrink-0">【{u.jockey}】</span>
                                                            {isUser && (
                                                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 rounded shrink-0">
                                                                    あなた
                                                                </span>
                                                            )}
                                                            {isOver100 && (
                                                                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/15 border border-yellow-500/30 px-1.5 py-0.2 rounded hidden xs:inline shrink-0">
                                                                    プラス
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="w-14 text-center text-xs text-gray-300 font-semibold">
                                                            {u.participations}回
                                                        </span>
                                                        <span className="w-14 text-center text-xs">
                                                            {u.wins > 0 ? (
                                                                <span className="font-bold text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/30">
                                                                    {u.wins}勝
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500">-</span>
                                                            )}
                                                        </span>
                                                        <span
                                                            className={clsx(
                                                                "w-24 text-right font-black font-mono text-sm sm:text-base",
                                                                isOver100 ? "text-yellow-400 font-extrabold" : "text-gray-300"
                                                            )}
                                                        >
                                                            {u.careerReturnRate.toFixed(1)}%
                                                        </span>
                                                        <span className="w-6 text-right text-gray-500 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all">
                                                            <ChevronRight className="w-4 h-4 inline" />
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. 通算投資額トップ３（1位を大きく目立たせる！） */}
                                <div className="pt-2 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                                            <h3 className="text-sm font-black text-purple-300 uppercase tracking-wide">
                                                通算投資額トップ３
                                            </h3>
                                        </div>
                                        <span className="text-[11px] text-gray-400">
                                            ※掛け金金額は非表示
                                        </span>
                                    </div>

                                    {/* 1位を特大・2位と3位を横並びにするメリハリレイアウト */}
                                    <div className="space-y-3">
                                        {/* 🥇 1位：特大カード */}
                                        {careerInvestmentTop3[0] && (
                                            <div
                                                onClick={() => setSelectedJockey(careerInvestmentTop3[0].jockey)}
                                                className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-purple-600/30 via-indigo-900/40 to-black/60 border-2 border-purple-400/60 shadow-lg shadow-purple-500/15 relative overflow-hidden cursor-pointer hover:border-purple-300 transition-all group"
                                            >
                                                <Star className="w-24 h-24 text-purple-400/10 absolute -right-2 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform" />
                                                <div className="flex items-center justify-between">
                                                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-xs px-3 py-1 rounded-full shadow">
                                                        <Star className="w-3.5 h-3.5 fill-white" /> 通算投資王 1位
                                                    </div>
                                                    <span className="text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                        <Flame className="w-3 h-3 text-orange-400" /> 投資王{careerInvestmentTop3[0].kingCount}回獲得
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                                                    <div>
                                                        <div className="text-lg sm:text-xl font-black text-white group-hover:text-purple-200 transition-colors">
                                                            {careerInvestmentTop3[0].horse}
                                                            <span className="text-sm font-bold text-gray-300 ml-1.5">
                                                                【{careerInvestmentTop3[0].jockey}】
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-0.5">
                                                            出場回数：{careerInvestmentTop3[0].participations}回
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-bold text-purple-300 font-mono tracking-wider bg-black/40 px-3 py-1.5 rounded-lg border border-purple-400/30 self-start sm:self-auto">
                                                        投資額　？？？？？
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 🥈 2位 & 🥉 3位：コンパクト2カラム */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {careerInvestmentTop3.slice(1, 3).map((k, idx) => (
                                                <div
                                                    key={k.jockey}
                                                    onClick={() => setSelectedJockey(k.jockey)}
                                                    className={clsx(
                                                        "p-3 rounded-xl border relative overflow-hidden bg-black/30 cursor-pointer hover:border-purple-400/60 transition-all group",
                                                        idx === 0
                                                            ? "border-slate-400/30"
                                                            : "border-amber-600/30"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-gray-300">
                                                            {idx === 0 ? "🥈 2位" : "🥉 3位"}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            投資王{k.kingCount}回
                                                        </span>
                                                    </div>

                                                    <div className="mt-1.5">
                                                        <div className="text-sm font-bold text-white truncate group-hover:text-purple-200 transition-colors">
                                                            {k.horse}
                                                            <span className="text-xs text-gray-400 ml-1">
                                                                【{k.jockey}】
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                                        <span className="text-gray-400 text-[11px]">出場 {k.participations}回</span>
                                                        <span className="text-purple-300/80 font-mono text-[11px] font-bold">
                                                            投資額　？？？？？
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : currentTournament ? (
                            /* ================= 過去／今回の各回順位表 ビュー ================= */
                            <div className="space-y-4">
                                {/* Tournament Info Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                            {currentTournament.edition} {currentTournament.name}
                                            {currentTournament.id === "kyoto_2026" && (
                                                <span className="text-xs bg-red-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
                                                    LIVE 進行中
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                                                {currentTournament.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-green-400" />
                                                {currentTournament.venue}競馬場
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Highlight Cards: Champion & King */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Champion Card */}
                                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-transparent border border-yellow-500/40 relative overflow-hidden">
                                        <Crown className="w-16 h-16 text-yellow-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">
                                            <Crown className="w-4 h-4" /> {currentTournament.id === "kyoto_2026" ? "暫定首位" : "優勝（回収率チャンピオン）"}
                                        </div>
                                        <div className="text-base font-black text-white truncate">
                                            {currentTournament.champion.horse}
                                            <span className="text-xs font-bold text-gray-300 ml-1.5">
                                                【{currentTournament.champion.jockey}】
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-yellow-400 font-mono">
                                                {currentTournament.champion.returnRate.toFixed(1)}%
                                            </span>
                                            {currentTournament.champion.returnRate >= 100 && (
                                                <span className="text-xs font-bold text-yellow-300/80 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/30">
                                                    プラス収支
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Investment King Card */}
                                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent border border-purple-500/40 relative overflow-hidden">
                                        <Star className="w-16 h-16 text-purple-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                                            <Star className="w-4 h-4 text-purple-400 fill-purple-400" /> {currentTournament.id === "kyoto_2026" ? "暫定投資王" : "投資王"}
                                        </div>
                                        <div className="text-base font-black text-white truncate">
                                            {currentTournament.king.horse}
                                            <span className="text-xs font-bold text-gray-300 ml-1.5">
                                                【{currentTournament.king.jockey}】
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs font-bold text-purple-200 font-mono tracking-wider">
                                            投資額　？？？？？
                                        </div>
                                    </div>
                                </div>

                                {/* 各回の順位表（金額非表示・回収率順） */}
                                <div className="space-y-1">
                                    <div className="flex text-xs font-bold text-gray-400 px-3 py-1.5 bg-black/40 rounded-lg">
                                        <span className="w-10 text-center">順位</span>
                                        <span className="flex-1">馬名【ジョッキー】</span>
                                        <span className="w-20 text-center">勝敗状況</span>
                                        <span className="w-24 text-right">回収率</span>
                                    </div>

                                    {currentTournament.results.map((r) => {
                                        const isProfit = r.netProfit > 0;
                                        return (
                                            <div
                                                key={r.jockey}
                                                onClick={() => setSelectedJockey(r.jockey)}
                                                className={clsx(
                                                    "flex items-center text-xs sm:text-sm px-3 py-2.5 rounded-lg border transition-colors cursor-pointer group",
                                                    r.rank === 1
                                                        ? "bg-yellow-500/10 border-yellow-500/30"
                                                        : r.rank <= 3
                                                        ? "bg-white/5 border-white/10"
                                                        : "bg-black/20 border-white/5",
                                                    "hover:bg-white/10"
                                                )}
                                            >
                                                <span className="w-10 text-center font-bold">
                                                    {r.rank === 1 ? "👑 1" : r.rank === 2 ? "🥈 2" : r.rank === 3 ? "🥉 3" : r.rank}
                                                </span>
                                                <span className="flex-1 font-bold truncate flex items-center gap-1">
                                                    <span className="text-white group-hover:text-yellow-300 transition-colors">{r.horse}</span>
                                                    <span className="text-gray-400 text-xs">【{r.jockey}】</span>
                                                    {r.isKing && (
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-purple-500/30 text-purple-300 border border-purple-400/40 px-1.5 py-0.2 rounded-full font-bold ml-1">
                                                            <Star className="w-3 h-3 text-purple-400 fill-purple-400" /> 投資王
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="w-20 text-center text-xs font-bold">
                                                    {isProfit ? (
                                                        <span className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-md">
                                                            勝ち
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">トントン/負け</span>
                                                    )}
                                                </span>
                                                <span
                                                    className={clsx(
                                                        "w-24 text-right font-black font-mono text-sm sm:text-base",
                                                        isProfit ? "text-yellow-400" : "text-gray-300"
                                                    )}
                                                >
                                                    {r.returnRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-black/40 border-t border-white/10 flex justify-between items-center">
                        <div className="text-[11px] text-gray-400">
                            {selectedDetail ? (
                                <button
                                    onClick={() => setSelectedJockey(null)}
                                    className="text-yellow-400 hover:underline flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" /> 一覧に戻る
                                </button>
                            ) : (
                                <span>※行をタップして詳細カルテを表示</span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                            閉じる
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

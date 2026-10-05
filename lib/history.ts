import archiveData from './history_archive.json';
import { TournamentArchive, TournamentResult, LeaderboardEntry } from './types';

export const TOURNAMENT_ARCHIVES: TournamentArchive[] = archiveData.tournaments as TournamentArchive[];

// 殿堂入り集計
export type HallOfFameStats = {
    jockey: string;
    wins: number;
    kingCount: number;
    podiums: number; // 3位以内
    participations: number;
    winEditions: string[];
    kingEditions: string[];
};

export type CareerStats = {
    jockey: string;
    horse: string;
    totalInvestment: number;
    totalReturn: number;
    careerReturnRate: number;
    participations: number;
    wins: number;
    kingCount: number;
    podiums: number;
};

export type TournamentHistoryPoint = {
    edition: string;
    tournamentId: string;
    tournamentName: string;
    venue: string;
    date: string;
    horse: string;
    rank: number;
    returnRate: number;
    investment: number;
    returnAmount: number;
    netProfit: number;
    isKing: boolean;
    isCurrent?: boolean;
};

export type JockeyPersonalDetail = {
    jockey: string;
    horse: string;
    participations: number;
    wins: number;
    kingCount: number;
    podiums: number;
    bestReturnRate: number;
    bestEdition: string;
    careerInvestment: number;
    careerReturn: number;
    careerReturnRate: number;
    careerNetProfit: number;
    history: TournamentHistoryPoint[];
};

// 進行中の第5回（京都大会）データを TournamentArchive 形式に変換
export function createKyotoTournament(currentLeaderboard?: LeaderboardEntry[]): TournamentArchive | null {
    if (!currentLeaderboard || currentLeaderboard.length === 0) return null;

    const hasAnyBet = currentLeaderboard.some(e => e.totalInvestment > 0);
    if (!hasAnyBet) return null;

    const sorted = [...currentLeaderboard].sort((a, b) => {
        if (b.returnRate !== a.returnRate) return b.returnRate - a.returnRate;
        return b.totalInvestment - a.totalInvestment;
    });

    const maxInvestment = Math.max(...currentLeaderboard.map(e => e.totalInvestment), 0);
    const top = sorted[0];
    const king = currentLeaderboard.find(e => e.isKing) || currentLeaderboard.find(e => e.totalInvestment === maxInvestment && maxInvestment > 0) || sorted[0];

    const results: TournamentResult[] = sorted.map((e, idx) => ({
        rank: idx + 1,
        jockey: e.jockey === "富田" ? "冨田" : e.jockey,
        horse: e.name,
        returnRate: Math.round(e.returnRate * 10) / 10,
        investment: e.totalInvestment,
        returnAmount: e.totalReturn,
        netProfit: e.netProfit,
        isKing: e.isKing || (e.totalInvestment === maxInvestment && maxInvestment > 0)
    }));

    return {
        id: "kyoto_2026",
        edition: "第5回",
        name: "第5回 鶯谷杯 京都2026（進行中）",
        date: "2026/10/11",
        venue: "京都",
        champion: {
            jockey: top.jockey === "富田" ? "冨田" : top.jockey,
            horse: top.name,
            returnRate: Math.round(top.returnRate * 10) / 10,
            netProfit: top.netProfit,
            investment: top.totalInvestment,
            returnAmount: top.totalReturn
        },
        king: {
            jockey: king.jockey === "富田" ? "冨田" : king.jockey,
            horse: king.name,
            investment: king.totalInvestment
        },
        results
    };
}

// 過去4大会 ＋ 進行中の第5回を結合した全大会リストを取得
export function getAllTournaments(currentLeaderboard?: LeaderboardEntry[]): {
    tournaments: TournamentArchive[];
    hasCurrentKyoto: boolean;
} {
    const kyoto = createKyotoTournament(currentLeaderboard);
    if (kyoto) {
        return {
            tournaments: [...TOURNAMENT_ARCHIVES, kyoto],
            hasCurrentKyoto: true
        };
    }
    return {
        tournaments: TOURNAMENT_ARCHIVES,
        hasCurrentKyoto: false
    };
}

export function getHallOfFame(currentLeaderboard?: LeaderboardEntry[]): HallOfFameStats[] {
    const statsMap = new Map<string, HallOfFameStats>();
    const { tournaments } = getAllTournaments(currentLeaderboard);

    tournaments.forEach(t => {
        const champJockey = t.champion.jockey;
        const kingJockey = t.king.jockey;

        t.results.forEach(r => {
            const normalizedJockey = r.jockey === "富田" ? "冨田" : r.jockey;
            if (!statsMap.has(normalizedJockey)) {
                statsMap.set(normalizedJockey, {
                    jockey: normalizedJockey,
                    wins: 0,
                    kingCount: 0,
                    podiums: 0,
                    participations: 0,
                    winEditions: [],
                    kingEditions: [],
                });
            }
            const s = statsMap.get(normalizedJockey)!;
            s.participations += 1;
            if (r.rank === 1) {
                s.wins += 1;
                s.winEditions.push(t.edition);
            }
            if (r.rank <= 3) {
                s.podiums += 1;
            }
            if (r.isKing || normalizedJockey === kingJockey) {
                s.kingCount += 1;
                s.kingEditions.push(t.edition);
            }
        });
    });

    return Array.from(statsMap.values()).sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.podiums !== a.podiums) return b.podiums - a.podiums;
        return b.kingCount - a.kingCount;
    });
}

// 通算データ（全参加者）の集計（リアルタイム京都合算対応）
export function getCareerStats(currentLeaderboard?: LeaderboardEntry[]): CareerStats[] {
    const userMap = new Map<string, CareerStats>();
    const { tournaments } = getAllTournaments(currentLeaderboard);

    tournaments.forEach(t => {
        t.results.forEach(r => {
            const normalizedJockey = r.jockey === "富田" ? "冨田" : r.jockey;
            if (!userMap.has(normalizedJockey)) {
                userMap.set(normalizedJockey, {
                    jockey: normalizedJockey,
                    horse: r.horse,
                    totalInvestment: 0,
                    totalReturn: 0,
                    careerReturnRate: 0,
                    participations: 0,
                    wins: 0,
                    kingCount: 0,
                    podiums: 0
                });
            }
            const u = userMap.get(normalizedJockey)!;
            u.horse = r.horse; // 最新の登録馬名
            u.totalInvestment += r.investment;
            u.totalReturn += r.returnAmount;
            u.participations += 1;
            if (r.rank === 1) u.wins += 1;
            if (r.rank <= 3) u.podiums += 1;
            if (r.isKing) u.kingCount += 1;
        });
    });

    return Array.from(userMap.values()).map(u => ({
        ...u,
        careerReturnRate: u.totalInvestment > 0 ? Math.round((u.totalReturn / u.totalInvestment) * 1000) / 10 : 0
    }));
}

// 1. 通算回収率ランク表（全員分、回収率順トップから最下位まで）
export function getCareerReturnRateRanking(currentLeaderboard?: LeaderboardEntry[]): CareerStats[] {
    return [...getCareerStats(currentLeaderboard)].sort((a, b) => {
        if (b.careerReturnRate !== a.careerReturnRate) {
            return b.careerReturnRate - a.careerReturnRate;
        }
        return b.totalInvestment - a.totalInvestment;
    });
}

// 2. 通算投資額トップ3（金額非表示、出場回数・投資王受賞回数を掲示）
export function getCareerInvestmentTop3(currentLeaderboard?: LeaderboardEntry[]): CareerStats[] {
    return [...getCareerStats(currentLeaderboard)]
        .sort((a, b) => b.totalInvestment - a.totalInvestment)
        .slice(0, 3);
}

// 通算投資王ランキング（獲得回数）
export function getInvestmentKingRanking(currentLeaderboard?: LeaderboardEntry[]): HallOfFameStats[] {
    const all = getHallOfFame(currentLeaderboard);
    return all
        .filter(s => s.kingCount > 0)
        .sort((a, b) => b.kingCount - a.kingCount);
}

// 通算優勝ランキング（勝利回数）
export function getChampionRanking(currentLeaderboard?: LeaderboardEntry[]): HallOfFameStats[] {
    const all = getHallOfFame(currentLeaderboard);
    return all
        .filter(s => s.wins > 0)
        .sort((a, b) => b.wins - a.wins);
}

// 3. 個人成績カルテ（各回の回収率推移、過去最高回収率、タイトル数、本人限定投資データ）
export function getJockeyPersonalDetail(
    targetJockey: string,
    currentLeaderboard?: LeaderboardEntry[]
): JockeyPersonalDetail | null {
    const normalizedTarget = targetJockey === "富田" ? "冨田" : targetJockey;
    const { tournaments } = getAllTournaments(currentLeaderboard);

    const history: TournamentHistoryPoint[] = [];
    let careerInvestment = 0;
    let careerReturn = 0;
    let wins = 0;
    let kingCount = 0;
    let podiums = 0;
    let bestReturnRate = -1;
    let bestEdition = "-";
    let latestHorse = targetJockey;

    tournaments.forEach(t => {
        const userResult = t.results.find(r => (r.jockey === "富田" ? "冨田" : r.jockey) === normalizedTarget);
        if (userResult) {
            latestHorse = userResult.horse;
            careerInvestment += userResult.investment;
            careerReturn += userResult.returnAmount;
            if (userResult.rank === 1) wins += 1;
            if (userResult.rank <= 3) podiums += 1;
            if (userResult.isKing) kingCount += 1;

            if (userResult.returnRate > bestReturnRate) {
                bestReturnRate = userResult.returnRate;
                bestEdition = `${t.edition} ${t.venue}`;
            }

            history.push({
                edition: t.edition,
                tournamentId: t.id,
                tournamentName: t.name,
                venue: t.venue,
                date: t.date,
                horse: userResult.horse,
                rank: userResult.rank,
                returnRate: userResult.returnRate,
                investment: userResult.investment,
                returnAmount: userResult.returnAmount,
                netProfit: userResult.netProfit,
                isKing: userResult.isKing,
                isCurrent: t.id === "kyoto_2026"
            });
        }
    });

    if (history.length === 0) return null;

    const careerReturnRate = careerInvestment > 0 ? Math.round((careerReturn / careerInvestment) * 1000) / 10 : 0;
    const careerNetProfit = careerReturn - careerInvestment;

    return {
        jockey: normalizedTarget,
        horse: latestHorse,
        participations: history.length,
        wins,
        kingCount,
        podiums,
        bestReturnRate: Math.max(bestReturnRate, 0),
        bestEdition,
        careerInvestment,
        careerReturn,
        careerReturnRate,
        careerNetProfit,
        history
    };
}


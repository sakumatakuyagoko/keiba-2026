export type User = {
    id: string;
    name: string; // Horse Name
    jockey: string; // Real Name
    pin: string;
    color: string;
    sort_order?: number | null; // display order set by admin
};

export type Race = {
    id: string;
    location: "Kyoto" | "Tokyo";
    raceNumber: number;
    name?: string;
    conditions?: string; // e.g. "芝1200m"
    startTime?: string; // e.g. "10:00"
};

export type Bet = {
    id: string;
    userId: string;
    raceId: string;
    investment: number;
    returnAmount: number;
    timestamp: string;
};

export type LeaderboardEntry = User & {
    totalInvestment: number;
    totalReturn: number;
    netProfit: number;
    returnRate: number; // Percentage
    rank: number;
    isKing: boolean; // Investment King
};

export type TournamentResult = {
    rank: number;
    jockey: string;
    horse: string;
    returnRate: number;
    investment: number;
    returnAmount: number;
    netProfit: number;
    isKing: boolean;
};

export type TournamentArchive = {
    id: string;
    edition: string;
    name: string;
    date: string;
    venue: string;
    champion: {
        jockey: string;
        horse: string;
        returnRate: number;
        netProfit: number;
        investment: number;
        returnAmount: number;
    };
    king: {
        jockey: string;
        horse: string;
        investment: number;
    };
    results: TournamentResult[];
};

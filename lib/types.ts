export type User = {
    id: string;
    name: string; // Horse Name
    jockey: string; // Real Name
    pin: string;
    color: string;
};

export type Race = {
    id: string;
    location: "Kokura" | "Tokyo" | "Hanshin";
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

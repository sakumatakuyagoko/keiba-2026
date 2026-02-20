
const MOCK_USERS = [
    { id: "7", name: "ツチサカガク", jockey: "土坂" },
    { id: "12", name: "キンパチティーチャ", jockey: "佐久間" },
    // Add dummy users to fill gaps
    { id: "1", name: "User1", jockey: "J1" },
];

const MOCK_BETS = [
    // Tsuchisakagaku: 300,000
    { userId: "7", raceId: "r1", investment: 300000, returnAmount: 0, timestamp: new Date().toISOString() },
    // Kinpachi: 15,000
    { userId: "12", raceId: "r2", investment: 15000, returnAmount: 0, timestamp: new Date().toISOString() },
];

// Logic from page.tsx (simplified)
const calculate = () => {
    // 1. Process Valid Bets (Latest per User+Race)
    const latestBetsMap = new Map();
    MOCK_BETS.forEach(bet => {
        const key = `${bet.userId} -${bet.raceId} `;
        const existing = latestBetsMap.get(key);
        if (!existing || new Date(bet.timestamp) > new Date(existing.timestamp)) {
            latestBetsMap.set(key, bet);
        }
    });

    const validBets = Array.from(latestBetsMap.values());

    // 2. Calculate Stats
    const entries = MOCK_USERS.map((user) => {
        const userBets = validBets.filter((b) => b.userId === user.id);
        const totalInvestment = userBets.reduce((sum, b) => sum + Number(b.investment || 0), 0);
        return {
            ...user,
            totalInvestment,
            isKing: false,
        };
    });

    // 3. Determine King
    const maxInvestment = Math.max(...entries.map((e) => e.totalInvestment));
    console.log("Max Investment:", maxInvestment);

    entries.forEach((e) => {
        if (e.totalInvestment === maxInvestment && maxInvestment > 0) {
            e.isKing = true;
        }
    });

    return entries;
};

const result = calculate();
console.log(JSON.stringify(result, null, 2));

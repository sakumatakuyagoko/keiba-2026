const { createClient } = require('@supabase/supabase-js');
const url = 'https://kosndfksntlrcmanjyez.supabase.co';
const key = 'sb_publishable_icJtU_-znSGX3IOXYkgNeQ_3nSX0Ii-';
const supabase = createClient(url, key);

async function calculateKokuraResults() {
  const { data: users } = await supabase.from('users').select('*');
  const { data: bets } = await supabase.from('bets').select('*').order('created_at', { ascending: true });

  console.log(`Fetched ${users.length} users and ${bets.length} bets.`);

  // page.tsx と同じ集計ロジック（最新のユーザー×レースの組み合わせを有効とする）
  const latestBetsMap = new Map();
  bets.forEach(b => {
    const key = `${b.user_id}-${b.race_id}`;
    const existing = latestBetsMap.get(key);
    if (!existing || new Date(b.created_at) > new Date(existing.created_at)) {
      latestBetsMap.set(key, b);
    }
  });

  const validBets = Array.from(latestBetsMap.values());
  console.log(`Valid unique bets: ${validBets.length}`);

  const userStats = users.map(u => {
    const myBets = validBets.filter(b => b.user_id === u.id);
    const totalInvestment = myBets.reduce((sum, b) => sum + Number(b.investment || 0), 0);
    const totalReturn = myBets.reduce((sum, b) => sum + Number(b.return_amount || 0), 0);
    const netProfit = totalReturn - totalInvestment;
    const returnRate = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;
    return {
      id: u.id,
      name: u.name,
      jockey: u.jockey,
      totalInvestment,
      totalReturn,
      netProfit,
      returnRate: Math.round(returnRate * 10) / 10,
      betCount: myBets.length
    };
  });

  // 投資王
  const maxInvestment = Math.max(...userStats.map(u => u.totalInvestment));

  // 回収率降順 -> 投資額降順
  const ranked = [...userStats].sort((a, b) => {
    if (b.returnRate !== a.returnRate) return b.returnRate - a.returnRate;
    return b.totalInvestment - a.totalInvestment;
  });

  ranked.forEach((r, idx) => {
    r.rank = idx + 1;
    r.isKing = r.totalInvestment === maxInvestment && maxInvestment > 0;
  });

  console.log('\n=== 第4回 鶯谷杯 小倉2026 (2026/02/22) 最終結果 ===\n');
  console.table(ranked.map(r => ({
    '順位': `${r.rank}位`,
    '馬名': r.name,
    'ジョッキー': r.jockey,
    '回収率': `${r.returnRate}%`,
    '投資額': `¥${r.totalInvestment.toLocaleString()}`,
    '回収額': `¥${r.totalReturn.toLocaleString()}`,
    '収支': `${r.netProfit >= 0 ? '+' : ''}¥${r.netProfit.toLocaleString()}`,
    '投資王': r.isKing ? '⭐ 投資王' : ''
  })));

  // JSONファイルとしてバックアップ保存
  const fs = require('fs');
  fs.writeFileSync('kokura_2026_results.json', JSON.stringify({
    tournament: '第4回 鶯谷杯 小倉2026',
    date: '2026-02-22',
    ranked,
    allBetsCount: bets.length,
    validBetsCount: validBets.length,
    users
  }, null, 2));
  console.log('Saved to kokura_2026_results.json');
}

calculateKokuraResults();

import { db } from '../data/store.js';
import { CATEGORY_CONFIG } from '../config/constants.js';

export const netWorth = (user) => user.balance + db.stocks.filter((s) => s.ownerUserId === user.id).reduce((a, s) => a + s.currentPrice, 0);
export const leaderboard = () => db.teams.map((t) => {
  const members = db.users.filter((u) => u.teamNumber === t.teamNumber);
  const total = members.reduce((a, u) => a + netWorth(u), 0);
  const start = members.reduce((a, u) => a + u.startingBalance, 0);
  const stocksHeld = db.stocks.filter((s) => s.ownerTeamNumber === t.teamNumber).length;
  return { teamNumber: t.teamNumber, totalNetWorth: total, totalProfitLoss: total - start, stocksHeld };
}).sort((a,b)=>b.totalNetWorth-a.totalNetWorth).map((x,i)=>({rank:i+1,...x}));

export function fluctuatePrices() {
  if (db.gameState.status !== 'active' || !db.gameState.autoPriceFluctuationEnabled) return [];
  const changes = [];
  db.stocks.forEach((s) => {
    const [min,max] = CATEGORY_CONFIG[s.category].volatility;
    const pct = min + Math.random()*(max-min);
    const next = Math.max(s.minPrice, Math.min(s.maxPrice, Math.round(s.currentPrice * (1+pct))));
    if (next !== s.currentPrice) { s.currentPrice = next; s.updatedAt = new Date().toISOString(); changes.push({stockId:s.id,stockCode:s.stockCode,currentPrice:next}); }
  });
  return changes;
}

export function applyHoldingCost() {
  if (db.gameState.status !== 'active' || !db.gameState.holdingCostEnabled) return [];
  const per = Number(process.env.HOLDING_COST_PER_STOCK || 10);
  return db.users.map((u)=>{
    const count = db.stocks.filter((s)=>s.ownerUserId===u.id).length;
    if (!count) return null;
    const amt = count*per; u.balance -= amt;
    return { userId:u.id, amount:amt, description:`Holding cost deducted for ${count} stocks`};
  }).filter(Boolean);
}

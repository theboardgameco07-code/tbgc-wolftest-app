import { randomUUID } from 'uuid';
import { CATEGORY_CONFIG, GAME_DEFAULTS } from '../config/constants.js';

const names = {
  Startup: ['RocketSeed Labs','HyperNest','QuickLeap AI','Moonshot Works','IgnitePulse','NovaHatch'],
  Tech: ['CloudAxis','CodeVerse Systems','SignalStack','NeuralByte','QuantumLane','DataForge'],
  Finance: ['FinEdge Capital','TrustBridge Finance','BlueVault Holdings','SecureMint','PrimeLedger','CrestFunds'],
  PSU: ['BharatCore Utilities','National GridWorks','PublicInfra Corp','SteelRoot Industries','CivicEnergy','MetroWater']
};

const makeStock = (i, category) => {
  const code = `STK${String(i).padStart(3, '0')}`;
  const cfg = CATEGORY_CONFIG[category];
  const base = Math.floor(Math.random() * (cfg.range[1] - cfg.range[0] + 1)) + cfg.range[0];
  return {
    id: randomUUID(), stockCode: code, companyName: `${names[category][i % names[category].length]} ${i}`,
    category, riskLevel: cfg.risk, basePrice: base, currentPrice: base,
    minPrice: Math.floor(base * cfg.minMult), maxPrice: Math.floor(base * cfg.maxMult),
    ownerUserId: null, ownerTeamNumber: null, status: 'unclaimed', listedForSale: false, salePrice: null,
    listedByUserId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    transactionHistory: []
  };
};

export const db = {
  users: [], teams: Array.from({ length: Number(process.env.TEAM_COUNT || 20) }, (_, i) => ({ id: randomUUID(), teamNumber: i + 1 })),
  stocks: [], transactions: [], marketEvents: [],
  gameState: {
    status: 'not_started', currentRound: 1, roundTimeRemaining: GAME_DEFAULTS.rounds[0],
    rounds: GAME_DEFAULTS.rounds, autoPriceFluctuationEnabled: true, holdingCostEnabled: true,
    priceUpdateInterval: Number(process.env.PRICE_UPDATE_INTERVAL_MS || 60000),
    holdingCostInterval: Number(process.env.HOLDING_COST_INTERVAL_MS || 300000),
    startedAt: null, endedAt: null
  }
};

export function seedStocks() {
  db.stocks = [];
  ['Startup','Tech','Finance','PSU'].forEach((cat, idx) => {
    for (let i = 1; i <= 20; i += 1) db.stocks.push(makeStock(idx * 20 + i, cat));
  });
}

export function upsertUser({ username, teamNumber, role }) {
  let user = db.users.find((u) => u.username === username && u.teamNumber === teamNumber && u.role === role);
  if (!user) {
    user = { id: randomUUID(), username, teamNumber, role, balance: Number(process.env.STARTING_BALANCE || 10000), startingBalance: Number(process.env.STARTING_BALANCE || 10000), createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() };
    db.users.push(user);
  }
  user.lastActiveAt = new Date().toISOString();
  return user;
}

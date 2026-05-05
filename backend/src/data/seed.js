import { db, seedStocks } from './store.js';
seedStocks();
console.log(JSON.stringify({ teams: db.teams.length, stocks: db.stocks.length, sampleQr: { stockId: db.stocks[0].stockCode } }, null, 2));

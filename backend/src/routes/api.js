import express from 'express';
import { db, seedStocks, upsertUser } from '../data/store.js';
import { applyHoldingCost, fluctuatePrices, leaderboard, netWorth } from '../services/gameService.js';

export const router = express.Router();
const tx = (t) => db.transactions.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...t });

router.post('/login', (req,res)=>{
  const { username, teamNumber, role } = req.body;
  if (!/^[a-z]+\.[a-z]+$/.test(username)) return res.status(400).json({message:'Invalid username format'});
  const user = upsertUser({ username, teamNumber:Number(teamNumber), role });
  res.json({ user });
});
router.get('/users', (_,res)=>res.json(db.users));
router.get('/users/:id', (req,res)=>res.json(db.users.find(u=>u.id===req.params.id)));
router.get('/stocks', (_,res)=>res.json(db.stocks));
router.get('/stocks/:id', (req,res)=>res.json(db.stocks.find(s=>s.id===req.params.id||s.stockCode===req.params.id)));
router.get('/marketplace', (_,res)=>res.json(db.stocks.filter(s=>s.listedForSale)));
router.post('/stocks/claim', (req,res)=>{ const { userId, stockCode } = req.body; const u=db.users.find(x=>x.id===userId); const s=db.stocks.find(x=>x.stockCode===stockCode); if(!u||u.role!=='Manager') return res.status(403).json({message:'Only managers can claim'}); if(!s) return res.status(404).json({message:'Invalid stock card'}); if(s.ownerUserId) return res.status(400).json({message:'This stock has already been claimed'}); Object.assign(s,{ownerUserId:u.id,ownerTeamNumber:u.teamNumber,status:'owned'}); tx({type:'claim',toUserId:u.id,stockId:s.id,amount:s.currentPrice,description:`${u.username} claimed ${s.stockCode}`}); res.json(s);});
router.post('/stocks/list',(req,res)=>{const {userId,stockId,salePrice}=req.body; const s=db.stocks.find(x=>x.id===stockId); if(!s||s.ownerUserId!==userId) return res.status(400).json({message:'Invalid stock'}); Object.assign(s,{listedForSale:true,salePrice:Number(salePrice),listedByUserId:userId,status:'listed'}); tx({type:'list',fromUserId:userId,stockId:s.id,amount:Number(salePrice),description:`Listed ${s.stockCode}`}); res.json(s);});
router.post('/stocks/unlist',(req,res)=>{const {userId,stockId}=req.body; const s=db.stocks.find(x=>x.id===stockId&&x.ownerUserId===userId); if(!s) return res.status(400).json({message:'Invalid stock'}); s.listedForSale=false; s.salePrice=null; s.status='owned'; res.json(s);});
router.post('/stocks/buy',(req,res)=>{const {buyerId,stockId}=req.body; const b=db.users.find(x=>x.id===buyerId); const s=db.stocks.find(x=>x.id===stockId&&x.listedForSale); const seller=db.users.find(x=>x.id===s?.ownerUserId); if(!b||!s||!seller) return res.status(400).json({message:'Invalid purchase'}); if(b.teamNumber===s.ownerTeamNumber) return res.status(400).json({message:'Cannot buy from same team'}); if(b.balance<s.salePrice) return res.status(400).json({message:'Insufficient balance'}); b.balance-=s.salePrice; seller.balance+=s.salePrice; Object.assign(s,{ownerUserId:b.id,ownerTeamNumber:b.teamNumber,listedForSale:false,status:'owned'}); tx({type:'buy',fromUserId:seller.id,toUserId:b.id,stockId:s.id,amount:s.salePrice,description:`${b.username} bought ${s.stockCode}`}); res.json(s);});
router.post('/transfer-money',(req,res)=>{const {fromUserId,toUserId,amount}=req.body; const f=db.users.find(x=>x.id===fromUserId); const t=db.users.find(x=>x.id===toUserId); const a=Number(amount); if(!f||!t||f.teamNumber!==t.teamNumber||a<1||f.balance<a) return res.status(400).json({message:'Invalid transfer'}); f.balance-=a; t.balance+=a; tx({type:'transfer',fromUserId,toUserId,amount:a,description:'Team transfer'}); res.json({ok:true});});
router.get('/transactions/user/:userId',(req,res)=>res.json(db.transactions.filter(t=>t.fromUserId===req.params.userId||t.toUserId===req.params.userId)));
router.get('/transactions/team/:teamNumber',(req,res)=>{const ids=db.users.filter(u=>u.teamNumber===Number(req.params.teamNumber)).map(u=>u.id); res.json(db.transactions.filter(t=>ids.includes(t.fromUserId)||ids.includes(t.toUserId)));});
router.get('/leaderboard',(_,res)=>res.json(leaderboard()));
router.get('/game-state',(_,res)=>res.json(db.gameState));
['start','pause','resume','end'].forEach((action)=>router.post(`/game/${action}`,(_,res)=>{db.gameState.status=action==='start'?'active':action; res.json(db.gameState);}));
router.post('/game/reset',(_,res)=>{db.users=[]; db.transactions=[]; seedStocks(); db.gameState.status='not_started'; res.json({ok:true});});
router.post('/game/next-round',(_,res)=>{db.gameState.currentRound +=1; res.json(db.gameState);});
router.get('/market-events',(_,res)=>res.json(db.marketEvents));
router.post('/market-events/trigger',(req,res)=>{db.marketEvents.unshift({...req.body,id:crypto.randomUUID(),createdAt:new Date().toISOString(),triggeredBy:'admin'});res.json({ok:true});});
router.post('/market-events/custom',(req,res)=>{db.marketEvents.unshift({...req.body,id:crypto.randomUUID(),createdAt:new Date().toISOString(),triggeredBy:'admin'});res.json({ok:true});});
router.post('/admin/login',(req,res)=>res.json({ok:req.body.password===process.env.ADMIN_PASSWORD}));
router.get('/admin/overview',(_,res)=>res.json({users:db.users.length,stocks:db.stocks.length,transactions:db.transactions.length,leaderboard:leaderboard()}));
router.post('/admin/adjust-balance',(req,res)=>{const u=db.users.find(x=>x.id===req.body.userId); if(!u) return res.status(404).json({message:'User not found'}); u.balance += Number(req.body.amount); tx({type:'admin_adjustment',toUserId:u.id,amount:req.body.amount,description:'Admin balance adjustment'}); res.json(u);});
router.patch('/stocks/:id/price',(req,res)=>{const s=db.stocks.find(x=>x.id===req.params.id); if(!s) return res.status(404).json({message:'Not found'}); s.currentPrice=Math.max(s.minPrice,Math.min(s.maxPrice,Number(req.body.currentPrice))); tx({type:'price_change',stockId:s.id,amount:s.currentPrice,description:'Admin price update'}); res.json(s);});
router.post('/system/tick',(_,res)=>res.json({changes:fluctuatePrices(),holding:applyHoldingCost(),leaderboard:leaderboard()}));
router.get('/portfolio/:userId',(req,res)=>{const user=db.users.find(u=>u.id===req.params.userId); const stocks=db.stocks.filter(s=>s.ownerUserId===req.params.userId); const pv=stocks.reduce((a,s)=>a+s.currentPrice,0); res.json({user,stocks,portfolioValue:pv,netWorth:user?netWorth(user):0});});

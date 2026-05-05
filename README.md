# TBGC Wolf of Wall Street (MVP-first)

## Project Plan
1. **MVP Backend First**: build game state, user login, stock claim/list/buy, transfers, leaderboard, admin controls.
2. **MVP Frontend Next**: mobile-first login/dashboard/marketplace/leaderboard/admin screens.
3. **MVP Validation**: run backend + frontend locally and test core flow.
4. **Bonus phase**: add richer events, timer UX, projector view, CSV export.

## File Structure
- `backend/` Express + Socket.IO game server and in-memory JSON-like store.
- `frontend/` React + Vite mobile-first client.

## Setup
### One-button start (recommended)
1. `cp backend/.env.example backend/.env`
2. `npm run install:all`
3. `npm run dev`
4. Open the frontend URL (usually `http://localhost:5173`).

### Manual start (2 terminals)
Backend:
1. `cd backend`
2. `cp .env.example .env`
3. `npm install`
4. `npm run dev`

Frontend:
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open Vite URL on mobile browser (same Wi-Fi), point `VITE_API_URL` to backend host.

## MVP Features Included
- Login with `firstname.lastname`, team, role.
- Manager stock claim endpoint for QR payload `{ "stockId": "STK001" }` (map to `stockCode`).
- Manager listing/unlisting.
- Investor marketplace buy with team restriction and balance checks.
- Team transfer money.
- Portfolio and leaderboard.
- Admin login + overview + adjust balance + game status toggles.
- System tick endpoint for automatic price fluctuation and holding cost deduction.

## Seed Data
- 20 teams.
- 80 stocks (`STK001`-`STK080`) across Startup/Tech/Finance/PSU.
- Category volatility and min/max price clamps.

Run seed preview:
```bash
cd backend
npm run seed
```

## Testing (manual MVP)
1. Login as two users on different teams.
2. Manager claims stock via `/api/stocks/claim` with `stockCode`.
3. Manager lists stock, investor buys.
4. Check `/api/leaderboard` and `/api/portfolio/:userId`.
5. Trigger `/api/system/tick` to simulate market movement and holding costs.

## QR Card Generation Notes
- Generate physical QR cards with payload: `{ "stockId": "STK0XX" }`.
- Use any QR generator bulk tool and print one card per stock code.
- During scan, frontend should parse `stockId` then call claim API.

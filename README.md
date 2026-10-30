# Chess trainer

Cream-colored chess review and puzzle app (first version).

## Put it online with Cloudflare Pages
1. Upload all files in this folder to a new GitHub repository (do NOT upload node_modules or dist).
2. In Cloudflare: Workers & Pages -> Create -> Pages -> Connect to Git -> pick the repository.
3. Build command: `npm run build`   Build output directory: `dist`
4. Save and deploy. Every later push to GitHub redeploys automatically.

## Run on your own computer (optional)
```
npm install
npm run dev
```

## What works now
- Real game review with Stockfish (runs in the browser): move labels, plain-language notes, accuracy, next mistake
- Load games from a Lichess username, or paste any PGN (Chess.com games too)
- One playable sample puzzle
- Insights and Share screens (sample data)

## Next steps
A real puzzle set, saving progress, real Insights from your games, classic piece images.

## Licenses
- public/stockfish contains Stockfish.js (GPLv3, see Copying.txt in that folder).
- src/pieces.js holds the Maestro piece set by sadsnake1 (CC BY-NC-SA 4.0, non-commercial, credit required).

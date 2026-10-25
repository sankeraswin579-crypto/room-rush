# Room Rush 2.0 — upgrade files

This package updates the existing vanilla Node.js/HTML/CSS application without adding dependencies.

## Features added
- 20-second server-controlled question rounds
- 12-question quiz bank with categories
- Speed bonus (up to 50 extra points)
- +25 streak bonus from the third consecutive correct answer onward
- Server-side rejection of late/duplicate answers
- Timer display, category chips, streak indicator and final top-three podium
- Safer static path handling and basic request-size limit

## Install safely
1. Stop the running server with `Ctrl+C`.
2. Back up the current files:
   ```powershell
   Copy-Item .\server.js .\server.js.backup
   Copy-Item .\public\app.js .\public\app.js.backup
   Copy-Item .\public\style.css .\public\style.css.backup
   ```
3. Extract the ZIP into a temporary folder.
4. Copy the supplied `server.js` over the project root `server.js`.
5. Copy `public\app.js` over the project's `public\app.js`.
6. Append the contents of `public\room-rush-2.css` to the end of the existing `public\style.css` (do not replace the existing stylesheet).

## Run
```powershell
node --check .\server.js
node --check .\public\app.js
npm start
```
Open http://localhost:3000 and test with two browser windows.

## Scoring
- Correct answer: 100 base points
- Speed bonus: up to 50 points, based on remaining time
- Streak bonus: +25 points for a correct answer when the player's streak is 3 or higher
- Wrong answer: streak resets to zero

## Notes
- Rooms remain in server memory, so restarting the server clears rooms.
- The browser still polls the server; this is not a WebSocket implementation yet.
- For production deployment, add automated tests, authentication/abuse controls and shared state if running multiple server instances.

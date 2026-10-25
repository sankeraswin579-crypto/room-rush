# 🎮 Room Rush 2.0

**A real-time multiplayer trivia game where friends compete to answer questions, earn points, build streaks, and reach the top of the leaderboard.**

Room Rush is a browser-based party game built with Node.js, HTML, CSS, and JavaScript. Players can join a shared game room using a room code and compete in timed trivia rounds.

## ✨ Features

- **Multiplayer rooms** — Create a room and invite players using a room code.
- **Host controls** — The host can start the game and control question progression.
- **Timed questions** — Each question has a 20-second answer window.
- **Trivia question bank** — Questions are organized into categories.
- **Speed bonuses** — Earn additional points for answering correctly faster.
- **Streak bonuses** — Build consecutive correct answers to earn extra points.
- **Live leaderboard** — Track player scores during the game.
- **Final podium** — Highlight the top three players at the end.
- **Answer validation** — Reject duplicate, invalid, or late answers on the server.
- **Responsive interface** — Play through a browser on supported desktop and mobile screens.
- **Dark neon design** — A gaming-inspired interface with bold typography and vibrant accents.

## 🕹️ How to Play

1. Open Room Rush in a web browser.
2. Create a new game room.
3. Share the room code with friends.
4. Let other players join the room.
5. The host starts the game.
6. Answer each trivia question before the timer expires.
7. Earn points for correct answers, with additional bonuses for speed and streaks.
8. Follow the leaderboard as scores change.
9. Check the final podium to see who finishes in the top three.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Server-side JavaScript runtime |
| Node.js HTTP module | HTTP server and request handling |
| HTML5 | Game structure |
| CSS3 | Styling, responsive layout, and visual effects |
| Vanilla JavaScript | Frontend interactions and game logic |
| JSON | Trivia question and game-mode data |
| In-memory storage | Active rooms and player game state |

The application uses Node.js built-in modules for its server, so no external runtime dependencies are required for the basic server.

## 📁 Project Structure

```text
room-rush/
├── server.js
├── package.json
├── README.md
├── .gitignore
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── room-rush-2.css
│   ├── assets/
│   └── data/
│       └── game-modes.json
└── docs/
    └── UI_KIT.md
```

**File responsibilities**

- `server.js` — Creates the HTTP server, manages rooms and players, handles game actions, validates answers, and processes scoring.
- `package.json` — Defines project metadata and commands for running the application.
- `public/index.html` — Provides the main game interface.
- `public/style.css` — Contains the main visual styles.
- `public/room-rush-2.css` — Contains additional Room Rush 2.0 styling.
- `public/app.js` — Manages browser interactions, room updates, the timer display, answers, and leaderboard rendering.
- `public/assets/` — Stores the project's visual assets.
- `public/data/game-modes.json` — Defines game-mode information.
- `docs/UI_KIT.md` — Documents the user interface design system.

## ⚙️ Requirements

- Node.js installed on the computer.
- A modern web browser.
- A terminal such as Windows PowerShell.

Check the Node.js installation:

```powershell
node --version
npm --version
```

## 🚀 Installation and Setup

### 1. Clone the repository

```powershell
git clone https://github.com/sankeraswin579-crypto/room-rush.git
cd room-rush
```

### 2. Install dependencies

The current server uses Node.js built-in modules and does not require external packages for its basic functionality.

If the project contains a `package.json` with dependencies, install them using:

```powershell
npm install
```

### 3. Start the server

If `package.json` defines a start script:

```powershell
npm start
```

Alternatively, start the server directly:

```powershell
node server.js
```

### 4. Open the application

Visit:

```text
http://localhost:3000
```

The server uses port `3000` by default.

Keep the terminal running while playing.

## 🧮 Scoring System

Room Rush 2.0 introduces a scoring system designed to reward both accuracy and speed.

| Scoring component | Rule |
|---|---|
| Correct answer | 100 base points |
| Speed bonus | Up to 50 additional points |
| Streak bonus | 25 additional points when the streak bonus condition is met |
| Incorrect answer | No correct-answer points |
| Late answer | Rejected |

The speed bonus decreases according to the time taken to answer. A streak bonus is awarded when the configured consecutive-correct-answer condition is reached.

**Note:** The exact scoring implementation in `server.js` is authoritative if it differs from this documentation.

## 🏗️ Application Architecture

Room Rush uses a client-server architecture.

```text
Player's Browser
       |
       | HTTP requests
       v
Node.js HTTP Server
       |
       +-- Room Management
       |
       +-- Player Management
       |
       +-- Question and Round Logic
       |
       +-- Answer Validation
       |
       +-- Scoring and Leaderboard
       |
       v
In-Memory Game State
```

The browser communicates with the server to retrieve room and game updates. The current implementation uses polling rather than WebSockets.

## 🔒 Current Limitations

- **In-memory state:** Active rooms and scores are not persisted in a database.
- **Restart behavior:** Restarting the server clears in-memory game sessions.
- **Polling:** Browser clients periodically request updates rather than using a persistent WebSocket connection.
- **No persistent profiles:** Player accounts and long-term statistics are not stored.
- **Local development:** Other players may need a properly configured network-accessible deployment to connect from different devices.

## 🧪 Testing Checklist

Before publishing a release, verify the following:

- [ ] The server starts without errors.
- [ ] The home page loads successfully.
- [ ] A host can create a room.
- [ ] Players can join using a room code.
- [ ] The host can start a game.
- [ ] The question timer counts down correctly.
- [ ] Correct and incorrect answers are handled properly.
- [ ] Late and duplicate answers are rejected.
- [ ] Speed and streak bonuses are calculated correctly.
- [ ] The leaderboard updates correctly.
- [ ] The final podium displays the correct top three players.
- [ ] Multiple browsers can participate in the same game.
- [ ] The application works on supported mobile and desktop screen sizes.

## 🔮 Future Improvements

Potential future enhancements include:

- WebSocket-based real-time communication.
- Persistent player profiles and match history.
- Database-backed room and score storage.
- Custom question packs and difficulty levels.
- Additional game modes.
- Private rooms and improved player moderation.
- Automated tests for room management, scoring, and answer validation.
- Deployment with production-ready logging and error handling.

## 👨‍💻 Development

To run the project locally:

```powershell
node server.js
```

To check JavaScript syntax:

```powershell
node --check server.js
node --check public/app.js
```

After modifying frontend files, refresh the browser. Restart the server when changes to server-side code require it.

## 📌 Project Status

**Version:** 2.0 upgrade

Room Rush has a working local application and room-creation flow. Complete multiplayer gameplay, scoring, timer behavior, and final results should be verified using the testing checklist before being described as fully tested.

## 📄 License

No license has been specified yet. Add a `LICENSE` file if the project is intended to be distributed under an open-source license.

---

**Room Rush 2.0 — Think fast. Answer faster. Own the leaderboard.**
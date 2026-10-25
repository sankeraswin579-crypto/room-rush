# Room Rush — Multiplayer Trivia Game

Room Rush is a browser-based multiplayer trivia game built with Node.js and JavaScript. It is designed for 2–20 players, allowing users to create game rooms, share a four-character room code, and compete by answering trivia questions.

## Features

- **Multiplayer Gameplay:** Designed to support 2–20 players.
- **Room-Based Sessions:** Create a room and invite players using a four-character room code.
- **Trivia Scoring:** Earn 100 points for each correct answer.
- **Browser-Based Access:** Play through a web browser.
- **Node.js Backend:** Run the game server locally.
- **Deployment-Ready Structure:** Prepare the application for hosting on a Node.js-compatible service.

## Technology Stack

- Node.js
- JavaScript
- npm
- HTML and CSS, where used in the frontend implementation

## Getting Started

### Prerequisites

Install Node.js version 18 or newer.

Check the installed versions:

```bash
node --version
npm --version
```

### Installation

Clone the repository:

```bash
git clone https://github.com/sankeraswin579-crypto/room-rush.git
cd room-rush
```

Install dependencies:

```bash
npm install
```

### Run the Application

```bash
npm start
```

Open the following address in your browser:

http://localhost:3000

## Playing the Game

1. Start the Node.js server.
2. Open the game in a browser.
3. Create a game room.
4. Share the four-character room code with other players.
5. Join the same room from participating browsers.
6. Answer trivia questions and earn points.

The game is designed for 2–20 players. Actual behavior depends on the implemented game logic.

## Deployment Notes

The server can be deployed to a hosting service that supports Node.js applications.

For local Wi-Fi testing, other devices may connect using the host computer's local network address, provided the network and firewall allow access.

**Current storage limitation:** Active rooms are stored in server memory. Room data is lost when the server restarts. Multi-instance deployments require an appropriate shared-storage strategy or session-aware routing.

## Future Improvements

- Real-time multiplayer synchronization.
- Persistent game rooms and player sessions.
- Live leaderboards and game timers.
- Improved input validation and error handling.
- Automated testing and production monitoring.
- AI-assisted trivia question generation.

These are potential improvements, not claims that the features have already been implemented.

## Repository

GitHub: https://github.com/sankeraswin579-crypto/room-rush

## Project Purpose

Room Rush is a practical software development project focused on multiplayer application design, server-side JavaScript, game-room management, and deployment considerations.
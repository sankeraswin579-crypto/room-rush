const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const QUESTIONS = [
  { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Mercury"], correct: 1, category: "Science" },
  { q: "What is the capital city of Japan?", a: ["Seoul", "Beijing", "Tokyo", "Bangkok"], correct: 2, category: "Geography" },
  { q: "How many sides does a hexagon have?", a: ["Five", "Six", "Seven", "Eight"], correct: 1, category: "General" },
  { q: "Which language runs natively in web browsers?", a: ["Python", "C++", "Java", "JavaScript"], correct: 3, category: "Technology" },
  { q: "What is the largest ocean on Earth?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { q: "Which gas do plants absorb from the atmosphere?", a: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correct: 1, category: "Science" },
  { q: "How many minutes are in two hours?", a: ["90", "100", "120", "180"], correct: 2, category: "General" },
  { q: "Which company created the Windows operating system?", a: ["Apple", "Microsoft", "IBM", "Google"], correct: 1, category: "Technology" },
  { q: "What is the chemical symbol for gold?", a: ["Ag", "Gd", "Au", "Go"], correct: 2, category: "Science" },
  { q: "Which animal is the fastest land animal?", a: ["Lion", "Horse", "Cheetah", "Leopard"], correct: 2, category: "Nature" },
  { q: "Which continent is the Sahara Desert in?", a: ["Asia", "Africa", "Australia", "South America"], correct: 1, category: "Geography" },
  { q: "What is 9 × 7?", a: ["56", "63", "72", "69"], correct: 1, category: "Numbers" }
];

const rooms = new Map();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () => {
  let code;
  do { code = Array.from({length: 4}, () => alphabet[Math.floor(Math.random()*alphabet.length)]).join(""); }
  while (rooms.has(code));
  return code;
};
const publicRoom = (room, playerId) => ({
  code: room.code, hostId: room.hostId, status: room.status, round: room.round,
  totalRounds: room.totalRounds, deadline: room.deadline,
  players: [...room.players.values()].map(p => ({ id:p.id, name:p.name, score:p.score, answered:p.answered, connected:p.connected })),
  question: ["question", "reveal"].includes(room.status) ? { q: room.current.q, a: room.current.a, category: room.current.category } : null,
  reveal: room.status === "reveal" ? { correct: room.current.correct, explanation: "The correct answer is highlighted below." } : null,
  myId: playerId || null
});
function startServer({ port = Number(process.env.PORT) || 3000, host = "0.0.0.0" } = {}) {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  app.use(express.static(path.join(__dirname, "public")));
  app.get("/health", (_req,res) => res.json({ ok:true, game:"Room Rush" }));

  function emitRoom(room) { io.to(room.code).emit("state", publicRoom(room)); }
  function endRoom(room) {
    clearTimeout(room.timer);
    room.status = "finished";
    room.deadline = null;
    emitRoom(room);
  }
  function reveal(room) {
    if (!room || room.status !== "question") return;
    clearTimeout(room.timer);
    room.status = "reveal";
    room.deadline = Date.now() + 2500;
    emitRoom(room);
    room.timer = setTimeout(() => {
      if (!rooms.has(room.code) || room.status !== "reveal") return;
      if (room.round >= room.totalRounds) return endRoom(room);
      nextQuestion(room);
    }, 2500);
  }
  function nextQuestion(room) {
    room.round += 1;
    room.current = room.questions[room.round - 1];
    room.status = "question";
    room.deadline = Date.now() + 15000;
    for (const p of room.players.values()) p.answered = null;
    emitRoom(room);
    room.timer = setTimeout(() => reveal(room), 15000);
  }
  io.on("connection", socket => {
    socket.on("createRoom", ({ name }, cb = () => {}) => {
      const clean = String(name || "Player").trim().slice(0, 18) || "Player";
      const code = makeCode();
      const id = socket.id;
      const room = { code, hostId:id, status:"lobby", round:0, totalRounds:8, deadline:null, timer:null,
        players:new Map([[id,{id,name:clean,score:0,answered:null,connected:true}]]),
        questions:[...QUESTIONS].sort(() => Math.random()-.5).slice(0,8), current:null };
      rooms.set(code, room); socket.join(code);
      cb({ ok:true, state:publicRoom(room,id) }); emitRoom(room);
    });
    socket.on("joinRoom", ({ code, name }, cb = () => {}) => {
      code = String(code || "").trim().toUpperCase();
      const room = rooms.get(code);
      if (!room) return cb({ ok:false, error:"Room not found. Check the code and try again." });
      if (room.status !== "lobby") return cb({ ok:false, error:"This game has already started." });
      if (room.players.size >= 20) return cb({ ok:false, error:"This room is full (20 players max)." });
      const clean = String(name || "Player").trim().slice(0,18) || "Player";
      const id = socket.id;
      room.players.set(id,{id,name:clean,score:0,answered:null,connected:true});
      socket.join(code); cb({ok:true,state:publicRoom(room,id)}); emitRoom(room);
    });
    socket.on("startGame", ({code}, cb=()=>{}) => {
      const room = rooms.get(String(code||"").toUpperCase());
      if (!room) return cb({ok:false,error:"Room no longer exists."});
      if (socket.id !== room.hostId) return cb({ok:false,error:"Only the host can start the game."});
      if (room.players.size < 2) return cb({ok:false,error:"Invite at least one more player to start."});
      if (room.status !== "lobby") return cb({ok:false,error:"The game has already started."});
      nextQuestion(room); cb({ok:true});
    });
    socket.on("answer", ({code, answer}, cb=()=>{}) => {
      const room = rooms.get(String(code||"").toUpperCase());
      if (!room || room.status !== "question") return cb({ok:false,error:"This question is no longer active."});
      const p = room.players.get(socket.id);
      if (!p) return cb({ok:false,error:"You are not in this room."});
      if (p.answered !== null) return cb({ok:false,error:"Answer already submitted."});
      if (!Number.isInteger(answer) || answer < 0 || answer > 3) return cb({ok:false,error:"Invalid answer."});
      p.answered = answer;
      if (answer === room.current.correct) {
        const remaining = Math.max(0, room.deadline - Date.now());
        p.score += 100 + Math.round(remaining / 15000 * 50);
      }
      emitRoom(room); cb({ok:true});
      if ([...room.players.values()].every(x => x.answered !== null)) reveal(room);
    });
    socket.on("disconnect", () => {
      for (const room of rooms.values()) {
        if (room.players.has(socket.id)) {
          const p = room.players.get(socket.id); p.connected = false;
          // Keep the player and score for this game; rooms are cleared after completion.
          emitRoom(room);
        }
      }
    });
  });
  return new Promise(resolve => server.listen(port, host, () => resolve({app,server,io,port:server.address().port})));
}
if (require.main === module) startServer().then(({port}) => console.log(`Room Rush server running at http://localhost:${port}`));
module.exports = { startServer };

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const ROUND_SECONDS = 20;
const MAX_PLAYERS = 20;
const rooms = new Map();

const qs = [
  { category: 'Science', text: 'Which planet has the most moons currently confirmed?', options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'], answer: 1 },
  { category: 'Nature', text: 'What is the only mammal capable of true flight?', options: ['Flying squirrel', 'Sugar glider', 'Bat', 'Colugo'], answer: 2 },
  { category: 'History', text: 'Which country gifted the Statue of Liberty to the United States?', options: ['France', 'Italy', 'Spain', 'Canada'], answer: 0 },
  { category: 'Math', text: 'How many sides does a dodecagon have?', options: ['10', '11', '12', '14'], answer: 2 },
  { category: 'Geography', text: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3 },
  { category: 'Music', text: 'Which instrument has 88 keys on a standard version?', options: ['Accordion', 'Piano', 'Harpsichord', 'Organ'], answer: 1 },
  { category: 'Nature', text: 'What do bees collect from flowers to make honey?', options: ['Pollen', 'Nectar', 'Sap', 'Dew'], answer: 1 },
  { category: 'Sports', text: 'In which sport would you perform a slam dunk?', options: ['Volleyball', 'Handball', 'Basketball', 'Netball'], answer: 2 },
  { category: 'Science', text: 'What is the chemical symbol for gold?', options: ['Ag', 'Gd', 'Au', 'Go'], answer: 2 },
  { category: 'Technology', text: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Utility', 'Core Program Upload', 'Central Program User'], answer: 0 },
  { category: 'Geography', text: 'Which is the smallest continent by land area?', options: ['Europe', 'Australia', 'South America', 'Antarctica'], answer: 1 },
  { category: 'Science', text: 'How many bones are typically in an adult human body?', options: ['186', '206', '226', '246'], answer: 1 }
];

const send = (res, status, data) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(data));
};

const safe = value => String(value || 'Player')
  .trim()
  .replace(/[<>]/g, '')
  .replace(/\s+/g, ' ')
  .slice(0, 20) || 'Player';

async function read(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 100_000) throw new Error('Request body too large');
  }
  try { return JSON.parse(body || '{}'); } catch { return {}; }
}

function expireRound(room) {
  if (room.started && !room.revealed && room.i < room.questions.length &&
      Date.now() >= room.deadline) {
    room.revealed = true;
    room.players.forEach(player => {
      if (player.answered === null) player.answered = -1;
    });
  }
}

function view(room, id) {
  expireRound(room);
  const finished = room.started && room.i >= room.questions.length;
  const question = room.started && !finished ? room.questions[room.i] : null;
  const players = [...room.players.values()].map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    streak: p.streak,
    bestStreak: p.bestStreak,
    answered: p.answered,
    lastPoints: p.lastPoints
  }));

  return {
    code: room.code,
    hostId: room.host,
    players,
    started: room.started,
    finished,
    i: room.i,
    total: room.questions.length,
    revealed: room.revealed,
    deadline: room.deadline,
    serverNow: Date.now(),
    roundSeconds: ROUND_SECONDS,
    q: question ? {
      text: question.text,
      category: question.category,
      options: question.options,
      answer: room.revealed ? question.answer : null
    } : null,
    myId: id || null
  };
}

function startRound(room) {
  room.revealed = false;
  room.deadline = Date.now() + ROUND_SECONDS * 1000;
  room.players.forEach(player => {
    player.answered = null;
    player.lastPoints = 0;
  });
}

function routeError(res, status, message) {
  return send(res, status, { error: message });
}

const mime = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.html': 'text/html'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    try {
      if (req.method === 'POST' && url.pathname === '/api/rooms') {
        const body = await read(req);
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        do {
          code = Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join('');
        } while (rooms.has(code));

        const id = crypto.randomUUID();
        const room = {
          code,
          host: id,
          players: new Map([[id, {
            id, name: safe(body.name || 'Host'), score: 0,
            streak: 0, bestStreak: 0, answered: null, lastPoints: 0
          }]]),
          started: false,
          i: 0,
          revealed: false,
          deadline: null,
          questions: qs.slice()
        };
        rooms.set(code, room);
        return send(res, 201, view(room, id));
      }

      const parts = url.pathname.split('/').filter(Boolean);
      const code = (parts[2] || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) return routeError(res, 404, 'Room not found. Check the code and try again.');

      if (req.method === 'GET' && parts.length === 3) {
        const playerId = url.searchParams.get('playerId');
        if (playerId && !room.players.has(playerId)) {
          return routeError(res, 403, 'You are no longer a member of this room.');
        }
        return send(res, 200, view(room, playerId));
      }

      if (req.method === 'POST' && parts[3] === 'join') {
        const body = await read(req);
        if (room.started) return routeError(res, 409, 'This game has already started.');
        if (room.players.size >= MAX_PLAYERS) return routeError(res, 409, `This room is full (${MAX_PLAYERS} players max).`);
        const id = crypto.randomUUID();
        room.players.set(id, {
          id, name: safe(body.name), score: 0,
          streak: 0, bestStreak: 0, answered: null, lastPoints: 0
        });
        return send(res, 201, view(room, id));
      }

      if (req.method === 'POST') {
        const body = await read(req);
        const player = room.players.get(body.playerId);
        const isHost = body.playerId === room.host;
        if (!player) return routeError(res, 403, 'You are not in this room.');

        if (parts[3] === 'start' && isHost && !room.started) {
          room.started = true;
          room.i = 0;
          startRound(room);
        } else if (parts[3] === 'answer') {
          expireRound(room);
          if (!room.started || room.revealed || room.i >= room.questions.length) {
            return routeError(res, 409, 'This question is closed.');
          }
          if (Date.now() >= room.deadline) {
            expireRound(room);
            return routeError(res, 409, 'Time is up for this question.');
          }
          if (player.answered !== null) return routeError(res, 409, 'Your answer is already locked in.');
          if (!Number.isInteger(body.choice) || body.choice < 0 || body.choice >= room.questions[room.i].options.length) {
            return routeError(res, 400, 'Choose a valid answer.');
          }

          player.answered = body.choice;
          const question = room.questions[room.i];
          if (body.choice === question.answer) {
            const remaining = Math.max(0, room.deadline - Date.now());
            const speedBonus = Math.floor((remaining / (ROUND_SECONDS * 1000)) * 50);
            player.streak += 1;
            player.bestStreak = Math.max(player.bestStreak, player.streak);
            const streakBonus = player.streak >= 3 ? 25 : 0;
            player.lastPoints = 100 + speedBonus + streakBonus;
            player.score += player.lastPoints;
          } else {
            player.streak = 0;
            player.lastPoints = 0;
          }
        } else if (parts[3] === 'reveal' && isHost && room.started && room.i < room.questions.length) {
          expireRound(room);
          room.revealed = true;
          room.players.forEach(entry => {
            if (entry.answered === null) entry.answered = -1;
          });
        } else if (parts[3] === 'next' && isHost && room.revealed && room.i < room.questions.length) {
          room.i += 1;
          if (room.i < room.questions.length) startRound(room);
          else room.deadline = null;
        } else {
          return routeError(res, 403, 'That action is not allowed.');
        }
        return send(res, 200, view(room, body.playerId));
      }

      return routeError(res, 404, 'Unknown API route.');
    } catch (error) {
      return routeError(res, error.message === 'Request body too large' ? 413 : 400,
        error.message === 'Request body too large' ? error.message : 'Could not process that request.');
    }
  }

  const publicDir = path.join(__dirname, 'public');
  let relative;
  try { relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, ''); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  const filePath = path.resolve(publicDir, relative);
  if (filePath !== publicDir && !filePath.startsWith(publicDir + path.sep)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(filePath, (error, data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': (mime[path.extname(filePath)] || 'application/octet-stream') + '; charset=utf-8' });
    res.end(data);
  });
});

setInterval(() => {
  for (const [code, room] of rooms) {
    expireRound(room);
    if (Date.now() - (room.lastSeen || Date.now()) > 6 * 60 * 60 * 1000) rooms.delete(code);
  }
}, 1000).unref();

server.listen(PORT, '0.0.0.0', () => console.log(`Room Rush 2.0 on http://localhost:${PORT}`));

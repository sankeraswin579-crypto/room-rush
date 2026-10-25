const $ = id => document.getElementById(id);
let s = null, pid = null, code = '', host = false, timer = null, busy = false;
let clockTimer = null, serverOffset = 0;

const api = async (url, opt = {}) => {
  const response = await fetch(url, { headers: { 'content-type': 'application/json' }, ...opt });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'Something went wrong.');
  return data;
};
const post = (url, body = {}) => api(url, { method: 'POST', body: JSON.stringify(body) });
const name = () => $('name').value.trim() || 'Player';
const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function enter(state, isHost) {
  s = state; serverOffset = (state.serverNow || Date.now()) - Date.now(); code = state.code; pid = state.myId; host = isHost;
  $('home').classList.add('hidden');
  $('game').classList.remove('hidden');
  $('codeShow').textContent = code;
  $('role').textContent = host ? "YOU'RE THE HOST" : "YOU'RE PLAYING";
  draw();
  clearInterval(timer);
  timer = setInterval(async () => {
    try {
      const latest = await api('/api/rooms/' + code + '?playerId=' + encodeURIComponent(pid));
      if (!busy) { s = latest; serverOffset = (latest.serverNow || Date.now()) - Date.now(); draw(); }
    } catch (error) {
      $('gameError').textContent = error.message;
    }
  }, 800);
  clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 150);
}

function updateClock() {
  const el = $('roundClock');
  if (!el || !s || !s.started || s.finished || s.revealed || !s.deadline) return;
  const remaining = Math.max(0, s.deadline - (Date.now() + serverOffset));
  const seconds = Math.ceil(remaining / 1000);
  el.textContent = `00:${String(seconds).padStart(2, '0')}`;
  el.classList.toggle('urgent', seconds <= 5);
}

async function act(action, body = {}) {
  if (busy) return;
  busy = true;
  try {
    s = await post('/api/rooms/' + code + '/' + action, { playerId: pid, ...body });
    $('gameError').textContent = '';
    draw();
  } catch (error) {
    $('gameError').textContent = error.message;
  } finally {
    busy = false;
  }
}

function draw() {
  if (!s) return;
  $('count').textContent = s.players.length;
  $('codeShow').textContent = s.code;

  const sorted = s.players.slice().sort((a, b) => b.score - a.score || b.bestStreak - a.bestStreak);
  $('players').innerHTML = sorted.map((player, index) =>
    `<div class="player">
      <div class="avatar">${esc(player.name[0].toUpperCase())}</div>
      <div class="pname">${esc(player.name)}${player.id === s.hostId ? ' <small>HOST</small>' : ''}</div>
      ${s.started ? `<span class="score">${player.score}</span>` : `<span class="score">${player.answered !== null ? 'READY' : 'IN'}</span>`}
    </div>`
  ).join('');

  const content = $('content');
  const controls = $('controls');
  controls.innerHTML = '';
  $('title').textContent = s.finished ? "That's a wrap!" : s.started ? 'Quick, pick one!' : 'Waiting room';

  if (!s.started) {
    $('pill').textContent = 'WAITING FOR PLAYERS';
    content.innerHTML = `<div class="empty">
      <h3>${s.players.length < 2 ? 'Your room is ready.' : 'The crew is here.'}</h3>
      <p>Share the room code and bring everyone in.<br>Players can join on any phone or laptop.</p>
      <p class="round-hint">Up to 20 players · 20-second rounds · speed bonuses</p>
    </div>`;
    if (host) {
      const button = document.createElement('button');
      button.textContent = 'Start the game →';
      button.onclick = () => act('start');
      controls.append(button);
    } else controls.innerHTML = '<span class="note">Hang tight — the host will start soon.</span>';
    return;
  }

  if (s.finished) {
    $('pill').textContent = 'FINAL SCORES';
    const winner = sorted[0];
    content.innerHTML = `<div class="meta">${s.total} QUESTIONS PLAYED</div>
      <h3 class="question">${winner ? `${esc(winner.name)} takes the crown!` : 'Game over!'}</h3>
      <div class="podium">${sorted.slice(0, 3).map((player, index) =>
        `<div class="podium-card rank-${index + 1}">
          <span>${['🥇', '🥈', '🥉'][index]}</span>
          <b>${esc(player.name)}</b>
          <strong>${player.score} pts</strong>
          <small>Best streak: ${player.bestStreak}</small>
        </div>`).join('')}</div>
      <div class="scores">${sorted.map((player, index) =>
        `<div class="row"><span>${index + 1}. ${esc(player.name)}</span><strong>${player.score} pts</strong></div>`).join('')}</div>`;
    controls.innerHTML = '<span class="note">Thanks for playing Room Rush ✦</span>';
    return;
  }

  const me = s.players.find(player => player.id === pid);
  const answered = me && me.answered !== null;
  const question = s.q;
  $('pill').textContent = s.revealed ? 'ANSWER REVEALED' : `QUESTION ${s.i + 1} / ${s.total}`;
  const clock = s.revealed ? '<div class="round-clock stopped">ROUND COMPLETE</div>' :
    `<div class="round-clock" id="roundClock">00:${String(s.roundSeconds).padStart(2, '0')}</div>`;
  const streak = me?.streak ? `<span class="streak-chip">✦ ${me.streak} streak</span>` : '';
  content.innerHTML = `${clock}
    <div class="question-meta"><span class="category-chip">${esc(question.category || 'TRIVIA')}</span>${streak}</div>
    <div class="meta">${s.revealed ? "HERE'S HOW IT WENT" : 'TRUST YOUR FIRST GUESS'}</div>
    <h3 class="question">${esc(question.text)}</h3>
    <div class="options">${question.options.map((option, index) =>
      `<button data-i="${index}" class="option ${s.revealed && index === question.answer ? 'correct' : s.revealed && me?.answered === index ? 'wrong' : me?.answered === index ? 'selected' : ''}" ${answered || s.revealed ? 'disabled' : ''}>${String.fromCharCode(65 + index)}. ${esc(option)}</button>`
    ).join('')}</div>
    <div class="feedback">${s.revealed
      ? `Correct answer: <b>${esc(question.options[question.answer])}</b>. ${me?.answered === question.answer ? `Nice one — +${me.lastPoints} points!` : me?.answered === -1 ? 'Time ran out — no points this round.' : me?.answered === null ? 'No answer this round.' : 'Next question, next chance.'}`
      : answered ? 'Answer locked in! Waiting for the reveal…' : 'Choose your answer — it locks in right away.'}</div>`;
  content.querySelectorAll('[data-i]').forEach(button => {
    button.onclick = () => act('answer', { choice: Number(button.dataset.i) });
  });

  if (host) {
    const button = document.createElement('button');
    button.textContent = s.revealed ? (s.i + 1 === s.total ? 'See final scores →' : 'Next question →') : 'Reveal answer';
    button.onclick = () => act(s.revealed ? 'next' : 'reveal');
    controls.append(button);
    const note = document.createElement('span');
    note.className = 'note';
    note.textContent = s.revealed ? 'Scores are updated.' : `Players answered: ${s.players.filter(player => player.answered !== null).length}/${s.players.length}`;
    controls.append(note);
  } else if (s.revealed) {
    controls.innerHTML = '<span class="note">Waiting for the host to continue…</span>';
  }
  updateClock();
}

$('create').onclick = async () => {
  try { enter(await post('/api/rooms', { name: name() }), true); }
  catch (error) { $('homeError').textContent = error.message; }
};
$('join').onclick = async () => {
  const roomCode = $('code').value.trim().toUpperCase();
  if (roomCode.length !== 4) { $('homeError').textContent = 'Enter the 4-character room code.'; return; }
  try { enter(await post('/api/rooms/' + roomCode + '/join', { name: name() }), false); }
  catch (error) { $('homeError').textContent = error.message; }
};
$('code').addEventListener('input', event => {
  event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
});
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(code); $('copy').textContent = 'Copied!'; setTimeout(() => $('copy').textContent = 'Copy code', 1300); }
  catch { $('copy').textContent = code; }
};
$('leave').onclick = () => {
  clearInterval(timer);
  clearInterval(clockTimer);
  s = null;
  $('game').classList.add('hidden');
  $('home').classList.remove('hidden');
  $('gameError').textContent = '';
};

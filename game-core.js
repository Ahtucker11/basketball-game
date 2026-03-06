const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 900, H = 550;
canvas.width = W;
canvas.height = H;

// ==================== CONSTANTS ====================
const GRAVITY = 0.4;
const FLOOR_Y = H - 60;
const COURT_LEFT = 40;
const COURT_RIGHT = W - 40;
const CENTER_X = W / 2;

const HOOP_LEFT = { x: 100, y: 200, rimLeft: 75, rimRight: 125 };
const HOOP_RIGHT = { x: W - 100, y: 200, rimLeft: W - 125, rimRight: W - 75 };

const THREE_PT_LEFT = 280;
const TWO_PT_LEFT = 190;
const THREE_PT_RIGHT = W - 280;
const TWO_PT_RIGHT = W - 190;

const DIFFICULTY = {
  easy: {
    speed: 2.1, shotMin: 26, shotRange: 55, shootDelay: 72, shootDelayRand: 70,
    blockChance: 0.005, defendAggro: 0.18, dunkChance: 0,
    driveChance: 0.18, deepChance: 0.12, shotWindow: 24, contestRadius: 36,
    relocateChance: 0.04, reboundLookAhead: 8, reboundJumpChance: 0.02,
    helpJumpChance: 0.005, looseBallLookAhead: 8, missBias: 16,
  },
  medium: {
    speed: 2.95, shotMin: 46, shotRange: 34, shootDelay: 36, shootDelayRand: 34,
    blockChance: 0.035, defendAggro: 0.56, dunkChance: 0.008,
    driveChance: 0.34, deepChance: 0.2, shotWindow: 18, contestRadius: 48,
    relocateChance: 0.08, reboundLookAhead: 16, reboundJumpChance: 0.05,
    helpJumpChance: 0.014, looseBallLookAhead: 16, missBias: 8,
  },
  hard: {
    speed: 3.75, shotMin: 60, shotRange: 20, shootDelay: 18, shootDelayRand: 18,
    blockChance: 0.09, defendAggro: 0.92, dunkChance: 0.03,
    driveChance: 0.52, deepChance: 0.28, shotWindow: 14, contestRadius: 62,
    relocateChance: 0.14, reboundLookAhead: 24, reboundJumpChance: 0.08,
    helpJumpChance: 0.028, looseBallLookAhead: 24, missBias: 3,
  },
};

// ==================== SAVE SYSTEM ====================
const SAVE_KEY = 'basketballFun';
const { createDefaultSave, normalizeSave } = GameLogic;

function loadSave() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) return normalizeSave(JSON.parse(data));
  } catch (e) {}
  return createDefaultSave();
}

function writeSave() {
  try {
    save.stats.gamesPlayed = save.stats.gamesCompleted;
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {}
}
let save = loadSave();

// ==================== SHOP ITEMS ====================
const SHOP = {
  hats: [
    { id: 'none', name: 'None', price: 0 },
    { id: 'cap', name: 'Cap', price: 5 },
    { id: 'mohawk', name: 'Mohawk', price: 8 },
    { id: 'crown', name: 'Crown', price: 10 },
    { id: 'wizard', name: 'Wizard', price: 15 },
    { id: 'ninja', name: 'Ninja', price: 20 },
  ],
  balls: [
    { id: 'default', name: 'Classic', price: 0, color: '#ff6b00', line: '#cc5500' },
    { id: 'slime', name: 'Slime', price: 6, color: '#06d6a0', line: '#04a87d' },
    { id: 'bubble', name: 'Bubble', price: 6, color: '#f72585', line: '#c41e6a' },
    { id: 'ice', name: 'Ice', price: 8, color: '#4d96ff', line: '#3070cc' },
    { id: 'gold', name: 'Gold', price: 20, color: '#ffd93d', line: '#ccaa00' },
    { id: 'rainbow', name: 'Rainbow', price: 25, color: 'rainbow', line: '#888' },
  ],
  shirts: [
    { id: 'blue', name: 'Blue', price: 0, color: '#4cc9f0' },
    { id: 'red', name: 'Red', price: 4, color: '#e94560' },
    { id: 'green', name: 'Green', price: 4, color: '#06d6a0' },
    { id: 'purple', name: 'Purple', price: 4, color: '#9b5de5' },
    { id: 'orange', name: 'Orange', price: 4, color: '#ff6b00' },
    { id: 'gold', name: 'Gold', price: 12, color: '#ffd93d' },
  ],
  pants: [
    { id: 'blue', name: 'Blue', price: 0, color: '#4cc9f0' },
    { id: 'black', name: 'Black', price: 3, color: '#333' },
    { id: 'white', name: 'White', price: 3, color: '#eee' },
    { id: 'red', name: 'Red', price: 4, color: '#e94560' },
    { id: 'gold', name: 'Gold', price: 10, color: '#ffd93d' },
  ],
};

function getEquipped() {
  const shirt = SHOP.shirts.find(s => s.id === save.equipped.shirt) || SHOP.shirts[0];
  const pants = SHOP.pants.find(p => p.id === save.equipped.pants) || SHOP.pants[0];
  const b = SHOP.balls.find(b => b.id === save.equipped.ball) || SHOP.balls[0];
  return { shirt, pants, ball: b, hat: save.equipped.hat };
}

function getBallColor() {
  const eq = getEquipped();
  if (eq.ball.color === 'rainbow') return `hsl(${(Date.now() / 10) % 360}, 100%, 55%)`;
  return eq.ball.color;
}
function getBallLineColor() {
  const eq = getEquipped();
  if (eq.ball.color === 'rainbow') return `hsl(${((Date.now() / 10) + 40) % 360}, 80%, 40%)`;
  return eq.ball.line;
}

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
const MENU_TIPS = [
  'Shoot from deep for 3, mid-range for 2, paint for 1.',
  'Tap HELP for scoring rules, specials, and controls.',
  'Press P or Esc any time to pause. Press M to mute.',
  'Touch controls appear automatically on phones and tablets.',
];

let audioCtx = null;
let menuTipTimer = 0;
let menuTipIndex = 0;
const virtualKeys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, Space: false };
const activeTouchPointers = new Map();

function resizeCanvasDisplay() {
  const maxWidth = Math.max(320, window.innerWidth - 24);
  const maxHeight = Math.max(240, window.innerHeight - 24);
  let displayWidth = Math.min(W, maxWidth);
  let displayHeight = displayWidth * (H / W);
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = displayHeight * (W / H);
  }
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
}

function ensureAudio() {
  if (!save.settings.sound) return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioCtx) audioCtx = new AudioCtor();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, opts = {}) {
  const audio = ensureAudio();
  if (!audio || !freq) return;
  const start = audio.currentTime + (opts.when || 0);
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const volume = opts.volume || 0.025;
  osc.type = opts.type || 'square';
  osc.frequency.setValueAtTime(freq, start);
  if (opts.slideTo) osc.frequency.linearRampToValueAtTime(opts.slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function playSfx(name) {
  if (!save.settings.sound) return;
  if (name === 'click') playTone(620, 0.06, { slideTo: 780, volume: 0.015 });
  else if (name === 'start') {
    playTone(440, 0.07, { slideTo: 520, volume: 0.018 });
    playTone(660, 0.09, { when: 0.05, slideTo: 880, volume: 0.012 });
  } else if (name === 'countdown') playTone(420, 0.08, { type: 'triangle', slideTo: 360, volume: 0.02 });
  else if (name === 'go') {
    playTone(520, 0.08, { type: 'triangle', slideTo: 760, volume: 0.024 });
    playTone(780, 0.14, { when: 0.04, type: 'triangle', slideTo: 980, volume: 0.018 });
  } else if (name === 'shoot') playTone(290, 0.1, { type: 'sawtooth', slideTo: 430, volume: 0.02 });
  else if (name === 'cpuShoot') playTone(240, 0.08, { type: 'sawtooth', slideTo: 360, volume: 0.016 });
  else if (name === 'score') {
    playTone(660, 0.09, { type: 'triangle', slideTo: 840, volume: 0.025 });
    playTone(980, 0.12, { when: 0.05, type: 'triangle', volume: 0.02 });
  } else if (name === 'cpuScore') {
    playTone(280, 0.12, { type: 'triangle', slideTo: 220, volume: 0.022 });
    playTone(220, 0.16, { when: 0.05, type: 'triangle', slideTo: 180, volume: 0.015 });
  } else if (name === 'dunk') {
    playTone(120, 0.09, { type: 'square', slideTo: 90, volume: 0.03 });
    playTone(240, 0.08, { when: 0.04, type: 'sawtooth', slideTo: 160, volume: 0.02 });
  } else if (name === 'block') playTone(180, 0.07, { type: 'square', slideTo: 120, volume: 0.025 });
  else if (name === 'pause') playTone(400, 0.05, { type: 'square', slideTo: 320, volume: 0.016 });
  else if (name === 'resume') playTone(400, 0.05, { type: 'square', slideTo: 520, volume: 0.016 });
  else if (name === 'win') {
    playTone(660, 0.12, { type: 'triangle', volume: 0.024 });
    playTone(880, 0.16, { when: 0.08, type: 'triangle', volume: 0.02 });
    playTone(1100, 0.18, { when: 0.16, type: 'triangle', volume: 0.016 });
  } else if (name === 'lose') {
    playTone(360, 0.12, { type: 'triangle', slideTo: 300, volume: 0.02 });
    playTone(260, 0.2, { when: 0.1, type: 'triangle', slideTo: 180, volume: 0.016 });
  }
}

function clearTouchInputs() {
  activeTouchPointers.clear();
  Object.keys(virtualKeys).forEach(code => { virtualKeys[code] = false; });
}

function isPressed(code) {
  return !!keys[code] || !!virtualKeys[code];
}

function shouldUseTouchControls() {
  return isTouchDevice && save.settings.showTouchControls && (gameState === 'playing' || gameState === 'countdown');
}

function getTouchButtons() {
  return [
    { code: 'ArrowLeft', x: 28, y: H - 106, w: 84, h: 64, label: 'LEFT' },
    { code: 'ArrowRight', x: 122, y: H - 106, w: 84, h: 64, label: 'RIGHT' },
    { code: 'ArrowUp', x: W - 206, y: H - 106, w: 84, h: 64, label: 'JUMP' },
    { code: 'Space', x: W - 112, y: H - 124, w: 92, h: 82, label: 'SHOOT' },
  ];
}

function syncTouchInputs() {
  Object.keys(virtualKeys).forEach(code => { virtualKeys[code] = false; });
  for (const code of activeTouchPointers.values()) virtualKeys[code] = true;
}

function updateTouchPointer(e, releaseOnly = false) {
  if (!isTouchDevice) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top) * (H / rect.height);
  let targetCode = null;
  if (!releaseOnly && shouldUseTouchControls()) {
    const target = getTouchButtons().find(btn => mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h);
    targetCode = target ? target.code : null;
  }
  if (!targetCode) activeTouchPointers.delete(e.pointerId);
  else activeTouchPointers.set(e.pointerId, targetCode);
  syncTouchInputs();
  if (targetCode || releaseOnly) e.preventDefault();
}

function toggleSound() {
  save.settings.sound = !save.settings.sound;
  writeSave();
  if (save.settings.sound) playSfx('click');
}

function toggleTouchControls() {
  save.settings.showTouchControls = !save.settings.showTouchControls;
  clearTouchInputs();
  writeSave();
}

function setSeenHelp() {
  if (!save.settings.seenHelp) {
    save.settings.seenHelp = true;
    writeSave();
  }
}

window.addEventListener('resize', resizeCanvasDisplay);
resizeCanvasDisplay();

// ==================== GAME STATE ====================
let gameState = save.settings.seenHelp ? 'menu' : 'help'; // menu, help, shop, stats, countdown, playing, paused, gameover
let winScore = 10;
let difficulty = 'medium';
let winner = '';
let coinsEarnedThisGame = 0;
let shopTab = 'hats';
let pausedFromState = 'playing';
let lastCountdownPhase = -1;

// Countdown
let countdownTimer = 0;

// Streak / On-fire
let playerStreak = 0;
let cpuStreak = 0;
let playerOnFire = false;
let cpuOnFire = false;

// CPU outfit (randomized each game)
let cpuOutfit = { hat: 'none', shirt: '#f72585' };
function randomCpuOutfit() {
  const hats = ['none', 'none', 'cap', 'mohawk', 'crown', 'wizard', 'ninja'];
  const shirts = ['#f72585', '#e94560', '#ff6b00', '#9b5de5', '#06d6a0', '#4d96ff', '#ffd93d'];
  return {
    hat: hats[Math.floor(Math.random() * hats.length)],
    shirt: shirts[Math.floor(Math.random() * shirts.length)],
  };
}

// ==================== UI SYSTEM ====================
let clickAreas = [];
let mouseX = 0, mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (W / rect.width);
  mouseY = (e.clientY - rect.top) * (H / rect.height);
});

canvas.addEventListener('click', (e) => {
  ensureAudio();
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top) * (H / rect.height);
  for (const area of clickAreas) {
    if (mx >= area.x && mx <= area.x + area.w && my >= area.y && my <= area.y + area.h) {
      playSfx('click');
      area.onClick();
      return;
    }
  }
});

function addClick(x, y, w, h, fn) { clickAreas.push({ x, y, w, h, onClick: fn }); }
function isHover(x, y, w, h) { return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h; }

// ==================== INPUT ====================
const keys = {};
const GAME_KEYS = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'];
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  ensureAudio();
  if (GAME_KEYS.includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; if (GAME_KEYS.includes(e.code)) e.preventDefault(); });
canvas.addEventListener('pointerdown', e => { ensureAudio(); updateTouchPointer(e); }, { passive: false });
canvas.addEventListener('pointermove', e => {
  if (activeTouchPointers.has(e.pointerId)) updateTouchPointer(e);
}, { passive: false });
canvas.addEventListener('pointerup', e => updateTouchPointer(e, true), { passive: false });
canvas.addEventListener('pointercancel', e => updateTouchPointer(e, true), { passive: false });
canvas.addEventListener('contextmenu', e => e.preventDefault());

// ==================== GAME OBJECTS ====================
const ball = {
  x: CENTER_X, y: FLOOR_Y - 20, vx: 0, vy: 0, radius: 12,
  owner: null, inAir: false, scored: false,
  rotation: 0, bounceCount: 0, lastShooter: null, lastShootX: 0,
};

const player = {
  x: CENTER_X - 100, y: FLOOR_Y, w: 36, h: 50, vx: 0, vy: 0,
  speed: 4, jumpPower: -10, onGround: true, hasBall: true,
  charging: false, power: 0, maxPower: 100,
  facingRight: true, score: 0, animFrame: 0, animTimer: 0, bounceY: 0,
  airFrames: 0, jumpShotFired: false,
};
let spaceWasDown = false;

const cpu = {
  x: CENTER_X + 100, y: FLOOR_Y, w: 36, h: 50, vx: 0, vy: 0,
  speed: 2.8, jumpPower: -10, onGround: true, hasBall: false, score: 0,
  facingRight: false, animFrame: 0, animTimer: 0, bounceY: 0,
  aiTimer: 0, shootTimer: 0, targetX: 0, plan: 'mid', planTimer: 0, contestCooldown: 0,
};

// ==================== CROWD ====================
let crowd = [];
let crowdCheerTimer = 0;

function generateCrowd() {
  crowd = [];
  const shirtColors = ['#e94560','#f72585','#4cc9f0','#06d6a0','#9b5de5','#ff6b00','#ffd93d','#4d96ff','#ff85a1','#80ffdb','#fff','#ffaa00'];
  const skinTones = ['#ffd5a5','#e8b88a','#c68c53','#8d5524','#ffdbac','#f1c27d'];
  const rows = [
    { y: 28, count: 28, scale: 0.5 },
    { y: 52, count: 24, scale: 0.6 },
    { y: 82, count: 20, scale: 0.72 },
  ];
  for (const row of rows) {
    const spacing = (W - 80) / row.count;
    for (let i = 0; i < row.count; i++) {
      crowd.push({
        x: 50 + i * spacing + (Math.random() - 0.5) * spacing * 0.4,
        y: row.y + (Math.random() - 0.5) * 6,
        scale: row.scale + (Math.random() - 0.5) * 0.06,
        shirt: shirtColors[Math.floor(Math.random() * shirtColors.length)],
        skin: skinTones[Math.floor(Math.random() * skinTones.length)],
        phase: Math.random() * Math.PI * 2,
        bobSpeed: 1.5 + Math.random() * 1.5,
        hasHat: Math.random() < 0.25,
        hatColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
        armUp: false,
      });
    }
  }
}

function drawCrowd() {
  const cheering = crowdCheerTimer > 0;
  for (const c of crowd) {
    const s = c.scale;
    const bob = Math.sin(Date.now() / (300 / c.bobSpeed) + c.phase) * 2 * s;
    const cheerBob = cheering ? Math.abs(Math.sin(Date.now() / 100 + c.phase)) * 6 * s : 0;
    const y = c.y + bob - cheerBob;
    const x = c.x;
    ctx.save();
    ctx.translate(x, y);
    // Body
    ctx.fillStyle = c.shirt;
    ctx.fillRect(-6*s, 0, 12*s, 10*s);
    // Head
    ctx.fillStyle = c.skin;
    ctx.beginPath(); ctx.arc(0, -4*s, 5*s, 0, Math.PI*2); ctx.fill();
    // Arms
    if (cheering && Math.sin(Date.now()/80 + c.phase*3) > -0.3) {
      // Arms up cheering
      ctx.fillStyle = c.skin;
      ctx.fillRect(-10*s, -8*s, 4*s, 10*s);
      ctx.fillRect(6*s, -8*s, 4*s, 10*s);
    } else {
      ctx.fillStyle = c.skin;
      ctx.fillRect(-10*s, 0, 4*s, 7*s);
      ctx.fillRect(6*s, 0, 4*s, 7*s);
    }
    // Hat
    if (c.hasHat) {
      ctx.fillStyle = c.hatColor;
      ctx.fillRect(-6*s, -9*s, 12*s, 3*s);
      ctx.fillRect(-3*s, -12*s, 6*s, 4*s);
    }
    ctx.restore();
  }
}

// ==================== PARTICLES & FLOATING TEXT ====================
let particles = [];
let floatingTexts = [];
let screenShake = 0;
let scoreFlash = '';
let scoreFlashTimer = 0;
let resetTimer = 0;
let whoGetsball = 'player';

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++)
    particles.push({ x, y, vx: (Math.random()-.5)*8, vy: (Math.random()-1)*6, life: 1, color, size: Math.random()*6+2 });
}
function spawnConfetti(x, y) {
  const c = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6b00','#f72585','#4cc9f0'];
  for (let i = 0; i < 30; i++)
    particles.push({ x, y, vx: (Math.random()-.5)*12, vy: (Math.random()-1)*10, life: 1.5, color: c[Math.floor(Math.random()*c.length)], size: Math.random()*8+3 });
}
function spawnCoinParticles(x, y) {
  for (let i = 0; i < 8; i++)
    particles.push({ x, y, vx: (Math.random()-.5)*6, vy: -Math.random()*5-2, life: 1.2, color: '#ffd93d', size: Math.random()*5+4 });
}
function addFloat(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 80 });
}
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.vy += 0.15; p.x += p.vx; p.y += p.vy; p.life -= 0.02;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].y -= 0.8; floatingTexts[i].life--;
    if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
  }
}

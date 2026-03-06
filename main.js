// ==================== MAIN LOOP ====================
const FIXED_STEP_MS = 1000 / 60;
const MAX_FRAME_MS = 250;
const MAX_UPDATES_PER_FRAME = 8;
let lastFrameTime = 0;
let accumulatorMs = 0;

function update() {
  if (gameState === 'menu' || gameState === 'help') updateMenuTip();
  if (gameState === 'paused') return;
  if (gameState==='countdown') {
    const phase = Math.floor(countdownTimer / 50);
    if (phase !== lastCountdownPhase && phase < 4) {
      playSfx(phase === 3 ? 'go' : 'countdown');
      lastCountdownPhase = phase;
    }
    countdownTimer++;
    if (countdownTimer >= 200) {
      gameState='playing';
      lastCountdownPhase = -1;
    }
    updateParticles();
    return;
  }
  if (gameState!=='playing') { updateParticles(); return; }

  if (resetTimer>0) { resetTimer--; if (resetTimer===0) resetBall(whoGetsball); }
  updatePlayer(); updateCPU(); updateBall(); updateParticles();
  if (screenShake>0) screenShake-=0.5;
  if (scoreFlashTimer>0) scoreFlashTimer--;
  if (hypeTimer>0) hypeTimer--;
  if (crowdCheerTimer>0) crowdCheerTimer--;
}

function draw() {
  if (gameState==='menu') { drawMenu(); return; }
  if (gameState==='help') { drawHelp(); return; }
  if (gameState==='shop') { drawShop(); return; }
  if (gameState==='stats') { drawStats(); return; }
  if (gameState==='countdown') { drawCountdown(); return; }
  if (gameState==='paused') {
    drawMatchScene(true, false, false);
    drawPauseOverlay();
    return;
  }

  drawMatchScene();
  if (gameState==='gameover') drawGameOver();
}

function gameLoop(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const frameTime = Math.min(timestamp - lastFrameTime, MAX_FRAME_MS);
  lastFrameTime = timestamp;
  accumulatorMs += frameTime;

  let updatesThisFrame = 0;
  while (accumulatorMs >= FIXED_STEP_MS && updatesThisFrame < MAX_UPDATES_PER_FRAME) {
    update();
    accumulatorMs -= FIXED_STEP_MS;
    updatesThisFrame++;
  }
  if (updatesThisFrame === MAX_UPDATES_PER_FRAME) accumulatorMs = 0;

  updateMusic();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown',(e) => {
  if ((gameState==='playing' || gameState==='countdown' || gameState==='paused') && (e.code==='KeyP' || e.code==='Escape') && !e.repeat) {
    togglePause();
    e.preventDefault();
    return;
  }
  if (e.code==='KeyM' && !e.repeat) {
    toggleSound();
    e.preventDefault();
    return;
  }
  if (e.code==='KeyN' && !e.repeat) {
    toggleMusic();
    e.preventDefault();
    return;
  }
  if (e.code==='KeyH' && !e.repeat && (gameState==='menu' || gameState==='help')) {
    if (gameState==='help') gameState='menu';
    else { gameState='help'; setSeenHelp(); }
    e.preventDefault();
    return;
  }
  if (gameState==='gameover'&&(e.code==='Enter'||e.code==='Space')) { startGame(); e.preventDefault(); }
  if (gameState==='menu'&&e.code==='Enter') startGame();
});

generateCrowd();
requestAnimationFrame(gameLoop);

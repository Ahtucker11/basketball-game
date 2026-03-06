// ==================== GAME LOGIC ====================
function getDiff() { return DIFFICULTY[difficulty]; }

function togglePause() {
  if (gameState === 'playing' || gameState === 'countdown') {
    pausedFromState = gameState;
    gameState = 'paused';
    clearTouchInputs();
    playSfx('pause');
  } else if (gameState === 'paused') {
    gameState = pausedFromState;
    playSfx('resume');
  }
}

function finishGame(result) {
  winner = result;
  gameState = 'gameover';
  save = GameLogic.recordGameResult(save, result);
  if (result === 'player') {
    playSfx('win');
  } else {
    playSfx('lose');
  }
  writeSave();
}

function updateMenuTip() {
  menuTipTimer++;
  if (menuTipTimer >= 240) {
    menuTipTimer = 0;
    menuTipIndex = (menuTipIndex + 1) % MENU_TIPS.length;
  }
}

function startGame() {
  gameState = 'countdown';
  countdownTimer = 0;
  lastCountdownPhase = -1;
  pausedFromState = 'playing';
  if (crowd.length === 0) generateCrowd();
  player.score = 0;
  cpu.score = 0;
  coinsEarnedThisGame = 0;
  winner = '';
  particles = [];
  floatingTexts = [];
  screenShake = 0;
  scoreFlash = '';
  scoreFlashTimer = 0;
  playerStreak = 0;
  cpuStreak = 0;
  playerOnFire = false;
  cpuOnFire = false;
  cpuOutfit = randomCpuOutfit();
  cpu.speed = getDiff().speed;
  whoGetsball = 'player';
  resetTimer = 0;
  save = GameLogic.recordGameStart(save);
  setSeenHelp();
  writeSave();
  playSfx('start');
  resetBall('player');
}

function resetBall(giver) {
  ball.inAir = false; ball.scored = false; ball.vx = 0; ball.vy = 0;
  ball.bounceCount = 0; ball.lastShooter = null; ball.rotation = 0;
  if (giver === 'player') {
    ball.owner = 'player'; player.hasBall = true; cpu.hasBall = false;
    player.x = CENTER_X - 20; player.y = FLOOR_Y; cpu.x = CENTER_X + 150;
  } else {
    ball.owner = 'cpu'; cpu.hasBall = true; player.hasBall = false;
    cpu.x = CENTER_X + 20; cpu.y = FLOOR_Y; player.x = CENTER_X - 150;
  }
  player.vx = 0; player.vy = 0; player.onGround = true; player.airFrames = 0; player.jumpShotFired = false;
  cpu.vx = 0; cpu.vy = 0; cpu.onGround = true; cpu.aiTimer = 0; cpu.shootTimer = 0;
  player.charging = false; player.power = 0; spaceWasDown = false;
  player.facingRight = true; cpu.facingRight = false; cpu.targetX = CENTER_X + 80;
  ball.x = ball.owner === 'player' ? player.x : cpu.x;
  ball.y = ball.owner === 'player' ? player.y - player.h - ball.radius : cpu.y - cpu.h - ball.radius;
}

function shootBall(shooter, power, targetHoop) {
  const sx = shooter.x, sy = shooter.y - shooter.h - ball.radius;
  const dx = targetHoop.x - sx, signDx = Math.sign(dx) || 1;
  const peakY = targetHoop.y - 80;
  const hN = sy - peakY; // positive = below peak, negative = above peak
  let vy, tT;
  if (hN > 10) {
    // Normal shot from below peak
    vy = -Math.sqrt(2 * GRAVITY * hN);
    const tP = Math.abs(vy) / GRAVITY;
    const tH = Math.sqrt(Math.max(2 * (targetHoop.y - peakY) / GRAVITY, 0));
    tT = tP + tH;
  } else {
    // Elevated jump shot (at or above peak) - gentle arc to hoop
    vy = -3;
    // Solve: sy + vy*t + 0.5*g*t^2 = targetHoop.y for t
    const a = 0.5 * GRAVITY, b = vy, c = sy - targetHoop.y;
    const disc = b * b - 4 * a * c;
    tT = disc > 0 ? (-b + Math.sqrt(disc)) / (2 * a) : 30;
  }
  const nVx = Math.abs(dx) / Math.max(tT, 1);
  const pF = 0.3 + (power / 100) * 1.0;
  ball.x = sx; ball.y = sy; ball.vx = signDx * nVx * pF; ball.vy = vy;
  ball.inAir = true; ball.owner = null; ball.scored = false; ball.bounceCount = 0;
  ball.lastShooter = shooter === player ? 'player' : 'cpu';
  ball.lastShootX = sx; shooter.hasBall = false;
  spawnParticles(sx, sy, getBallColor(), 5);
  playSfx(shooter === player ? 'shoot' : 'cpuShoot');
}

function performDunk(dunker, hoop) {
  ball.x = hoop.x; ball.y = hoop.y + 5;
  ball.vx = 0; ball.vy = 8;
  ball.inAir = true; ball.owner = null; ball.scored = false; ball.bounceCount = 0;
  ball.lastShooter = dunker === player ? 'player' : 'cpu';
  ball.lastShootX = dunker.x; dunker.hasBall = false;
  screenShake = 15;
  spawnConfetti(hoop.x, hoop.y);
  addFloat(hoop.x, hoop.y - 60, 'SLAM DUNK!', '#ff6b6b');
  playSfx('dunk');
}

function getPointValue(sx, hoop) {
  return GameLogic.getPointValueForShotX(
    sx,
    hoop === HOOP_RIGHT ? 'right' : 'left',
    {
      twoLeft: TWO_PT_LEFT,
      threeLeft: THREE_PT_LEFT,
      twoRight: TWO_PT_RIGHT,
      threeRight: THREE_PT_RIGHT,
    }
  );
}

function checkScore() {
  if (ball.scored) return;
  const zones = {
    twoLeft: TWO_PT_LEFT,
    threeLeft: THREE_PT_LEFT,
    twoRight: TWO_PT_RIGHT,
    threeRight: THREE_PT_RIGHT,
  };

  // Right hoop (player)
  const rh = HOOP_RIGHT;
  if (ball.x > rh.rimLeft && ball.x < rh.rimRight && ball.y > rh.y - 5 && ball.y < rh.y + 15 && ball.vy > 0) {
    ball.scored = true;
    const outcome = GameLogic.applyScoringEvent({
      save,
      scorer: 'player',
      shotX: ball.lastShootX || ball.x,
      zones,
      scores: { player: player.score, cpu: cpu.score },
      streaks: { player: playerStreak, cpu: cpuStreak },
      onFire: { player: playerOnFire, cpu: cpuOnFire },
      winScore,
    });
    save = outcome.save;
    player.score = outcome.scores.player;
    cpu.score = outcome.scores.cpu;
    playerStreak = outcome.streaks.player;
    cpuStreak = outcome.streaks.cpu;
    playerOnFire = outcome.onFire.player;
    cpuOnFire = outcome.onFire.cpu;
    if (outcome.onFireActivated) {
      addFloat(CENTER_X, 180, 'ON FIRE!', '#ff6b00');
      screenShake = 12;
    }
    coinsEarnedThisGame += outcome.totalCoins;
    writeSave();
    scoreFlash = outcome.scoreFlash; scoreFlashTimer = 60; screenShake = Math.max(screenShake, 10);
    crowdCheerTimer = 120;
    spawnConfetti(rh.x, rh.y); spawnCoinParticles(rh.x, rh.y - 30);
    addFloat(rh.x, rh.y - 50, `+${outcome.totalCoins} coin${outcome.totalCoins > 1 ? 's' : ''}`, '#ffd93d');
    if (outcome.fireBonus) addFloat(rh.x + 60, rh.y - 30, 'fire bonus!', '#ff6b00');
    playSfx('score');
    whoGetsball = outcome.nextBallOwner; resetTimer = 90;
    if (outcome.winner) {
      finishGame(outcome.winner);
      spawnConfetti(W/2, H/2); spawnConfetti(W/2-100, H/2); spawnConfetti(W/2+100, H/2);
    }
  }

  // Left hoop (CPU)
  const lh = HOOP_LEFT;
  if (ball.x > lh.rimLeft && ball.x < lh.rimRight && ball.y > lh.y - 5 && ball.y < lh.y + 15 && ball.vy > 0) {
    ball.scored = true;
    const outcome = GameLogic.applyScoringEvent({
      save,
      scorer: 'cpu',
      shotX: ball.lastShootX || ball.x,
      zones,
      scores: { player: player.score, cpu: cpu.score },
      streaks: { player: playerStreak, cpu: cpuStreak },
      onFire: { player: playerOnFire, cpu: cpuOnFire },
      winScore,
    });
    save = outcome.save;
    player.score = outcome.scores.player;
    cpu.score = outcome.scores.cpu;
    playerStreak = outcome.streaks.player;
    cpuStreak = outcome.streaks.cpu;
    playerOnFire = outcome.onFire.player;
    cpuOnFire = outcome.onFire.cpu;
    if (outcome.onFireActivated) {
      addFloat(CENTER_X, 180, 'CPU ON FIRE!', '#ff6b00');
    }
    scoreFlash = outcome.scoreFlash; scoreFlashTimer = 60; screenShake = 8;
    crowdCheerTimer = 120;
    spawnConfetti(lh.x, lh.y);
    playSfx('cpuScore');
    whoGetsball = outcome.nextBallOwner; resetTimer = 90;
    if (outcome.winner) {
      finishGame(outcome.winner);
    }
  }
}

function checkBlock(p, who) {
  if (!ball.inAir || ball.scored || ball.owner || ball.lastShooter === who) return;
  if (Math.abs(ball.x - p.x) < 25 && Math.abs(ball.y - (p.y - p.h/2)) < 35) {
    ball.vx *= -0.6;
    ball.vy = -Math.abs(ball.vy) * 0.4 - 2;
    ball.lastShooter = null;
    screenShake = 6;
    spawnParticles(ball.x, ball.y, '#fff', 8);
    addFloat(ball.x, ball.y - 30, 'BLOCKED!', '#ff6b6b');
    playSfx('block');
  }
}

// ==================== UPDATE ====================
function updateBall() {
  if (ball.owner === 'player') { ball.x = player.x; ball.y = player.y - player.h - ball.radius; return; }
  if (ball.owner === 'cpu') { ball.x = cpu.x; ball.y = cpu.y - cpu.h - ball.radius; return; }

  ball.vy += GRAVITY; ball.x += ball.vx; ball.y += ball.vy; ball.rotation += ball.vx * 0.05;

  // Ball trail
  if (Math.random() < 0.4)
    particles.push({ x: ball.x, y: ball.y, vx: 0, vy: 0, life: 0.35, color: getBallColor(), size: ball.radius * 0.5 });
  // Fire trail
  if ((ball.lastShooter === 'player' && playerOnFire) || (ball.lastShooter === 'cpu' && cpuOnFire))
    particles.push({ x: ball.x+(Math.random()-.5)*10, y: ball.y+(Math.random()-.5)*10, vx: (Math.random()-.5)*2, vy: -Math.random()*3, life: 0.5, color: Math.random()>.5?'#ff6b00':'#ffd93d', size: Math.random()*6+3 });

  if (ball.y + ball.radius > FLOOR_Y) {
    ball.y = FLOOR_Y - ball.radius; ball.vy *= -0.6; ball.vx *= 0.8; ball.bounceCount++;
    if (Math.abs(ball.vy) < 1) ball.vy = 0;
    spawnParticles(ball.x, FLOOR_Y, '#ffaa00', 3);
  }
  if (ball.x - ball.radius < COURT_LEFT) { ball.x = COURT_LEFT + ball.radius; ball.vx *= -0.7; }
  if (ball.x + ball.radius > COURT_RIGHT) { ball.x = COURT_RIGHT - ball.radius; ball.vx *= -0.7; }
  if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -0.5; }

  // Backboard
  if (ball.x > W-75 && ball.x < W-65 && ball.y > 150 && ball.y < 220) { ball.x = W-75; ball.vx *= -0.7; spawnParticles(ball.x,ball.y,'#fff',3); }
  if (ball.x < 75 && ball.x > 65 && ball.y > 150 && ball.y < 220) { ball.x = 75; ball.vx *= -0.7; spawnParticles(ball.x,ball.y,'#fff',3); }

  // Rim - right
  const rrL=HOOP_RIGHT.rimLeft, rrR=HOOP_RIGHT.rimRight, rrY=HOOP_RIGHT.y;
  if (ball.y>rrY-8&&ball.y<rrY+8) {
    if (Math.abs(ball.x-rrL)<ball.radius+4) { ball.vx=Math.abs(ball.vx)*-0.5; ball.vy*=0.5; spawnParticles(rrL,rrY,'#e94560',3); }
    if (Math.abs(ball.x-rrR)<ball.radius+4) { ball.vx=Math.abs(ball.vx)*0.5; ball.vy*=0.5; spawnParticles(rrR,rrY,'#e94560',3); }
  }
  // Rim - left
  const rlL=HOOP_LEFT.rimLeft, rlR=HOOP_LEFT.rimRight, rlY=HOOP_LEFT.y;
  if (ball.y>rlY-8&&ball.y<rlY+8) {
    if (Math.abs(ball.x-rlL)<ball.radius+4) { ball.vx=Math.abs(ball.vx)*-0.5; ball.vy*=0.5; spawnParticles(rlL,rlY,'#e94560',3); }
    if (Math.abs(ball.x-rlR)<ball.radius+4) { ball.vx=Math.abs(ball.vx)*0.5; ball.vy*=0.5; spawnParticles(rlR,rlY,'#e94560',3); }
  }

  checkScore();
  checkBlock(player, 'player');
  checkBlock(cpu, 'cpu');

  // Pickup
  if (!ball.scored) {
    if (Math.abs(ball.x-player.x)<35 && Math.abs(ball.y-(player.y-player.h/2))<50 && !player.hasBall) {
      ball.owner='player'; player.hasBall=true; ball.inAir=false;
      spawnParticles(player.x,player.y-player.h,getEquipped().shirt.color,5);
    }
    if (ball.owner === null && Math.abs(ball.x-cpu.x)<35 && Math.abs(ball.y-(cpu.y-cpu.h/2))<50 && !cpu.hasBall) {
      ball.owner='cpu'; cpu.hasBall=true; ball.inAir=false;
      spawnParticles(cpu.x,cpu.y-cpu.h,cpuOutfit.shirt,5);
    }
  }
}

function updatePlayer() {
  if (isPressed('ArrowLeft')) { player.vx = -player.speed; player.facingRight = false; }
  else if (isPressed('ArrowRight')) { player.vx = player.speed; player.facingRight = true; }
  else player.vx *= 0.7;

  if (isPressed('ArrowUp') && player.onGround) {
    player.vy = player.jumpPower; player.onGround = false;
    player.airFrames = 0; player.jumpShotFired = false;
    spawnParticles(player.x, player.y, '#fff', 3);
  }

  // Track airborne time
  if (!player.onGround) player.airFrames++;
  else { player.airFrames = 0; player.jumpShotFired = false; }

  const shootPressed = isPressed('Space');
  const spaceJustPressed = shootPressed && !spaceWasDown;

  if (shootPressed && player.hasBall) {
    const dH = Math.abs(player.x - HOOP_RIGHT.x);
    if (!player.onGround && dH < 55) {
      // Dunk: in the air + very close to hoop
      performDunk(player, HOOP_RIGHT);
      player.charging = false; player.power = 0;
    } else if (!player.onGround && spaceJustPressed && !player.jumpShotFired && player.airFrames > 3) {
      // Jump shot: press Space while airborne (must be a fresh press, airborne 3+ frames)
      player.jumpShotFired = true;
      const jumpShotPower = 55;
      shootBall(player, jumpShotPower, HOOP_RIGHT);
      player.charging = false; player.power = 0;
      addFloat(player.x, player.y - player.h - 30, 'JUMP SHOT!', '#4cc9f0');
    } else if (player.onGround || player.charging) {
      // Ground charge (or continue charging if jumped while charging)
      player.charging = true;
      player.power = Math.min(player.power + 2.5, player.maxPower);
    }
  } else if (!shootPressed && player.charging) {
    // Release charged shot (works on ground or air if started charging on ground)
    const shotPower = Math.max(player.power, 20);
    shootBall(player, shotPower, HOOP_RIGHT);
    player.charging = false; player.power = 0;
  }

  spaceWasDown = shootPressed;

  player.vy += GRAVITY; player.x += player.vx; player.y += player.vy;
  if (player.y > FLOOR_Y) { player.y = FLOOR_Y; player.vy = 0; player.onGround = true; }
  player.x = Math.max(COURT_LEFT+player.w/2, Math.min(COURT_RIGHT-player.w/2, player.x));

  player.animTimer++;
  if (Math.abs(player.vx) > 0.5) { if (player.animTimer%8===0) player.animFrame=(player.animFrame+1)%4; }
  else player.animFrame = 0;
  player.bounceY = (player.onGround && Math.abs(player.vx)<0.5) ? Math.sin(Date.now()/300)*2 : 0;

  // Fire particles
  if (playerOnFire && Math.random() < 0.3)
    particles.push({ x:player.x+(Math.random()-.5)*20, y:player.y-player.h-5, vx:(Math.random()-.5)*2, vy:-Math.random()*3-1, life:0.4, color:Math.random()>.5?'#ff6b00':'#ffd93d', size:Math.random()*5+3 });
}

function updateCPU() {
  cpu.aiTimer++;
  const diff = getDiff();
  cpu.speed = diff.speed;

  if (cpu.hasBall) {
    // Move to shooting position
    const shootZone = THREE_PT_LEFT + 40;
    if (cpu.x > shootZone + 10) { cpu.vx = -cpu.speed; cpu.facingRight = false; }
    else if (cpu.x < shootZone - 10) { cpu.vx = cpu.speed; cpu.facingRight = true; }
    else {
      cpu.vx *= 0.5;
      cpu.shootTimer++;
      if (cpu.shootTimer > diff.shootDelay + Math.random() * diff.shootDelayRand) {
        cpu.facingRight = false;
        ball.lastShootX = cpu.x;
        const power = diff.shotMin + Math.random() * diff.shotRange;
        shootBall(cpu, power, HOOP_LEFT);
        cpu.shootTimer = 0;
      }
    }

    // Hard: attempt dunks when close to hoop
    if (diff.dunkChance > 0) {
      const dH = Math.abs(cpu.x - HOOP_LEFT.x);
      if (dH < 80 && cpu.onGround && Math.random() < diff.dunkChance) {
        cpu.vy = cpu.jumpPower; cpu.onGround = false;
      }
      if (!cpu.onGround && dH < 55 && cpu.hasBall) {
        performDunk(cpu, HOOP_LEFT);
      }
    }
  } else if (!ball.scored && ball.owner === null) {
    // Chase ball
    if (ball.x < cpu.x - 10) { cpu.vx = -cpu.speed; cpu.facingRight = false; }
    else if (ball.x > cpu.x + 10) { cpu.vx = cpu.speed; cpu.facingRight = true; }
    else cpu.vx *= 0.5;

    // Jump to block player shots
    if (ball.inAir && ball.lastShooter === 'player' && cpu.onGround) {
      const bd = Math.abs(ball.x - cpu.x);
      if (bd < 70 && ball.y < cpu.y - 20 && Math.random() < diff.blockChance) {
        cpu.vy = cpu.jumpPower; cpu.onGround = false;
      }
    }
  } else if (ball.owner === 'player') {
    // Defend: position between player and right hoop
    const defendX = player.x + (HOOP_RIGHT.x - player.x) * diff.defendAggro * 0.4;
    const clampedDefend = Math.max(player.x + 30, Math.min(COURT_RIGHT - 30, defendX));
    if (cpu.x < clampedDefend - 15) { cpu.vx = cpu.speed * 0.7; cpu.facingRight = true; }
    else if (cpu.x > clampedDefend + 15) { cpu.vx = -cpu.speed * 0.7; cpu.facingRight = false; }
    else cpu.vx *= 0.5;

    // On hard: jump when player is charging nearby
    if (diff.defendAggro > 0.7 && player.charging && cpu.onGround) {
      const distToPlayer = Math.abs(cpu.x - player.x);
      if (distToPlayer < 80 && Math.random() < 0.02) {
        cpu.vy = cpu.jumpPower; cpu.onGround = false;
      }
    }
  } else {
    // Wander
    if (cpu.aiTimer % 120 === 0) cpu.targetX = CENTER_X + 50 + Math.random() * 200;
    if (cpu.x < cpu.targetX - 15) { cpu.vx = cpu.speed * 0.6; cpu.facingRight = true; }
    else if (cpu.x > cpu.targetX + 15) { cpu.vx = -cpu.speed * 0.6; cpu.facingRight = false; }
    else cpu.vx *= 0.5;
  }

  cpu.vy += GRAVITY; cpu.x += cpu.vx; cpu.y += cpu.vy;
  if (cpu.y > FLOOR_Y) { cpu.y = FLOOR_Y; cpu.vy = 0; cpu.onGround = true; }
  cpu.x = Math.max(COURT_LEFT+cpu.w/2, Math.min(COURT_RIGHT-cpu.w/2, cpu.x));

  cpu.animTimer++;
  if (Math.abs(cpu.vx) > 0.5) { if (cpu.animTimer%8===0) cpu.animFrame=(cpu.animFrame+1)%4; }
  else cpu.animFrame = 0;
  cpu.bounceY = (cpu.onGround && Math.abs(cpu.vx)<0.5) ? Math.sin(Date.now()/300+1)*2 : 0;

  // Fire particles for CPU
  if (cpuOnFire && Math.random() < 0.3)
    particles.push({ x:cpu.x+(Math.random()-.5)*20, y:cpu.y-cpu.h-5, vx:(Math.random()-.5)*2, vy:-Math.random()*3-1, life:0.4, color:Math.random()>.5?'#ff6b00':'#ffd93d', size:Math.random()*5+3 });
}

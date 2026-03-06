// ==================== DRAWING ====================
function drawCourt() {
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#0f3460'); grad.addColorStop(1,'#16213e');
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

  // Bleacher background
  ctx.fillStyle = '#1a2744';
  ctx.fillRect(0, 10, W, 100);
  ctx.fillStyle = '#15203a';
  ctx.fillRect(0, 40, W, 70);
  ctx.fillStyle = '#111b32';
  ctx.fillRect(0, 70, W, 40);
  // Bleacher rows (seats)
  ctx.fillStyle = '#2a3a5c'; ctx.fillRect(0, 35, W, 3);
  ctx.fillStyle = '#2a3a5c'; ctx.fillRect(0, 62, W, 3);
  ctx.fillStyle = '#2a3a5c'; ctx.fillRect(0, 95, W, 3);

  // Draw crowd
  if (crowd.length > 0) drawCrowd();

  ctx.fillStyle = '#fff';
  for (let i=0;i<40;i++) {
    ctx.globalAlpha = 0.3+(Math.sin(Date.now()/500+i)+1)*0.3;
    ctx.fillRect((i*137.5+50)%W, (i*97.3+20)%(FLOOR_Y-100), 1+(i%3), 1+(i%3));
  }
  ctx.globalAlpha = 1;

  const cG = ctx.createLinearGradient(0,FLOOR_Y,0,H);
  cG.addColorStop(0,'#d4956b'); cG.addColorStop(1,'#a06030');
  ctx.fillStyle = cG; ctx.fillRect(0,FLOOR_Y,W,H-FLOOR_Y);

  ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=45) { ctx.beginPath(); ctx.moveTo(x,FLOOR_Y); ctx.lineTo(x,H); ctx.stroke(); }

  ctx.strokeStyle='#fff'; ctx.lineWidth=3;
  ctx.strokeRect(COURT_LEFT,FLOOR_Y,COURT_RIGHT-COURT_LEFT,H-FLOOR_Y);
  ctx.beginPath(); ctx.moveTo(CENTER_X,FLOOR_Y); ctx.lineTo(CENTER_X,H); ctx.stroke();
  ctx.beginPath(); ctx.arc(CENTER_X,FLOOR_Y,40,0,Math.PI); ctx.stroke();

  ctx.setLineDash([8,6]);
  ctx.strokeStyle='#ffdd57'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(THREE_PT_LEFT,FLOOR_Y); ctx.lineTo(THREE_PT_LEFT,H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(THREE_PT_RIGHT,FLOOR_Y); ctx.lineTo(THREE_PT_RIGHT,H); ctx.stroke();
  ctx.strokeStyle='#80ffdb';
  ctx.beginPath(); ctx.moveTo(TWO_PT_LEFT,FLOOR_Y); ctx.lineTo(TWO_PT_LEFT,H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(TWO_PT_RIGHT,FLOOR_Y); ctx.lineTo(TWO_PT_RIGHT,H); ctx.stroke();
  ctx.setLineDash([]);

  ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,0.4)';
  ctx.fillText('1pt',(COURT_LEFT+TWO_PT_LEFT)/2,FLOOR_Y+20);
  ctx.fillText('2pt',(TWO_PT_LEFT+THREE_PT_LEFT)/2,FLOOR_Y+20);
  ctx.fillText('3pt',(THREE_PT_LEFT+CENTER_X)/2,FLOOR_Y+20);
  ctx.fillText('3pt',(CENTER_X+THREE_PT_RIGHT)/2,FLOOR_Y+20);
  ctx.fillText('2pt',(THREE_PT_RIGHT+TWO_PT_RIGHT)/2,FLOOR_Y+20);
  ctx.fillText('1pt',(TWO_PT_RIGHT+COURT_RIGHT)/2,FLOOR_Y+20);
}

function drawHoop(hoop, side) {
  const y = hoop.y;
  ctx.fillStyle='#888';
  if (side==='left') ctx.fillRect(45,y-10,8,FLOOR_Y-y+10);
  else ctx.fillRect(W-53,y-10,8,FLOOR_Y-y+10);

  ctx.fillStyle='#fff'; ctx.strokeStyle='#333'; ctx.lineWidth=2;
  if (side==='left') { ctx.fillRect(52,y-50,10,80); ctx.strokeRect(52,y-50,10,80); }
  else { ctx.fillRect(W-62,y-50,10,80); ctx.strokeRect(W-62,y-50,10,80); }

  ctx.strokeStyle='#e94560'; ctx.lineWidth=2;
  if (side==='left') ctx.strokeRect(54,y-20,6,30);
  else ctx.strokeRect(W-60,y-20,6,30);

  ctx.strokeStyle='#e94560'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(hoop.rimLeft,y); ctx.lineTo(hoop.rimRight,y); ctx.stroke();
  ctx.fillStyle='#e94560';
  ctx.beginPath(); ctx.arc(hoop.rimLeft,y,4,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hoop.rimRight,y,4,0,Math.PI*2); ctx.fill();

  ctx.strokeStyle='#f5f5f5'; ctx.lineWidth=1.5; ctx.globalAlpha=0.7;
  for (let i=0;i<=5;i++) {
    const nx=hoop.rimLeft+(hoop.rimRight-hoop.rimLeft)*(i/5);
    const w=Math.sin(Date.now()/400+i)*2;
    ctx.beginPath(); ctx.moveTo(nx,y);
    ctx.quadraticCurveTo(nx+w,y+18,hoop.x+(nx-hoop.x)*0.3,y+30); ctx.stroke();
  }
  ctx.globalAlpha=1;
}

function drawHat(id, flip) {
  switch(id) {
    case 'cap':
      ctx.fillStyle='#e94560'; ctx.fillRect(-11,-66,22,5);
      ctx.fillRect(flip>0?4:-18,-68,14,5); break;
    case 'mohawk':
      ctx.fillStyle='#06d6a0';
      for (let i=0;i<5;i++) { const h=4+i*2; ctx.fillRect(-8+i*4,-62-h,4,h+2); } break;
    case 'crown':
      ctx.fillStyle='#ffd93d'; ctx.fillRect(-11,-67,22,7);
      ctx.fillRect(-10,-73,4,6); ctx.fillRect(-2,-75,4,8); ctx.fillRect(6,-73,4,6);
      ctx.fillStyle='#e94560'; ctx.fillRect(-1,-68,3,3); break;
    case 'wizard':
      ctx.fillStyle='#9b5de5'; ctx.beginPath();
      ctx.moveTo(-13,-62); ctx.lineTo(0,-90); ctx.lineTo(13,-62); ctx.fill();
      ctx.fillStyle='#ffd93d'; ctx.fillRect(-2,-80,5,5); break;
    case 'ninja':
      ctx.fillStyle='#333'; ctx.fillRect(-12,-60,24,14);
      ctx.fillStyle='#fff'; ctx.fillRect(-8,-56,16,3); break;
  }
}

function drawPlayerSprite(p, cfg) {
  const { shirt, pants, skin, hat, label, headband } = cfg;
  const x=p.x, y=p.y+p.bounceY, flip=p.facingRight?1:-1;
  const bob=p.animFrame%2===1?-2:0;
  ctx.save(); ctx.translate(x,y+bob);

  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0,2,18,5,0,0,Math.PI*2); ctx.fill();

  const ls=p.animFrame%2===0?0:5;
  ctx.fillStyle=pants;
  ctx.fillRect(-10-ls,-16,8,16); ctx.fillRect(2+ls,-16,8,16);
  ctx.fillStyle='#333';
  ctx.fillRect(-12-ls,-4,10,5); ctx.fillRect(0+ls,-4,10,5);

  ctx.fillStyle=shirt; ctx.fillRect(-14,-44,28,30);
  ctx.fillStyle='#fff'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
  ctx.fillText(label==='YOU'?'1':'2',0,-22);

  ctx.fillStyle=skin;
  if (p.charging) { ctx.fillRect(-18,-52,8,18); ctx.fillRect(10,-52,8,18); }
  else if (p.hasBall) { ctx.fillRect(-18*flip,-40,8,16); ctx.fillRect(10*flip,-36,8,12); }
  else { const a=Math.sin(p.animTimer/5)*4; ctx.fillRect(-18,-38+a,8,14); ctx.fillRect(10,-38-a,8,14); }

  ctx.fillStyle=skin; ctx.fillRect(-10,-58,20,16);
  ctx.fillStyle=hat!=='ninja'?(shirt==='#ffd93d'?'#ccaa00':shirt):'#333';
  ctx.fillRect(-11,-62,22,8);

  if (hat!=='ninja') {
    ctx.fillStyle='#333'; const ex=3*flip;
    ctx.fillRect(-5+ex,-54,3,4); ctx.fillRect(3+ex,-54,3,4); ctx.fillRect(-3+ex,-48,7,2);
  }
  if (hat==='none'||hat==='cap'||hat==='mohawk') {
    ctx.fillStyle=headband; ctx.fillRect(-11,-56,22,3);
  }
  drawHat(hat, flip);
  ctx.restore();

  ctx.fillStyle=shirt; ctx.font='bold 11px monospace'; ctx.textAlign='center';
  ctx.fillText(label,x,y-p.h-20+bob);
}

function drawFreeBall() {
  if (ball.owner) return;
  ctx.save(); ctx.translate(ball.x,ball.y); ctx.rotate(ball.rotation);
  ctx.shadowColor=getBallColor(); ctx.shadowBlur=8;
  ctx.fillStyle=getBallColor();
  ctx.beginPath(); ctx.arc(0,0,ball.radius,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle=getBallLineColor(); ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(-ball.radius,0); ctx.lineTo(ball.radius,0); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,ball.radius,-Math.PI*0.3,Math.PI*0.3); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,ball.radius,Math.PI*0.7,Math.PI*1.3); ctx.stroke();
  ctx.restore();
}

function drawBallOn(p) {
  if (!p.hasBall) return;
  const bx=p.x, by=p.y+p.bounceY-p.h-ball.radius-(p.charging?8:0);
  ctx.save(); ctx.translate(bx,by);
  ctx.fillStyle=getBallColor();
  ctx.beginPath(); ctx.arc(0,0,ball.radius,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=getBallLineColor(); ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(-ball.radius,0); ctx.lineTo(ball.radius,0); ctx.stroke();
  ctx.restore();
}

function drawPowerBar() {
  if (!player.charging) return;
  const bW=50,bH=8, bx=player.x-bW/2, by=player.y+player.bounceY-player.h-40;
  ctx.fillStyle='#333'; ctx.fillRect(bx-1,by-1,bW+2,bH+2);
  const g=ctx.createLinearGradient(bx,by,bx+bW,by);
  g.addColorStop(0,'#06d6a0'); g.addColorStop(0.5,'#ffd93d'); g.addColorStop(1,'#ef476f');
  ctx.fillStyle=g; ctx.fillRect(bx,by,bW*(player.power/player.maxPower),bH);
  ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.strokeRect(bx-1,by-1,bW+2,bH+2);
  ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
  ctx.fillText('POWER',player.x,by-4);
}

function drawScoreboard() {
  const eq=getEquipped();
  ctx.fillStyle='rgba(0,0,0,0.7)';
  const sW=320,sH=50,sX=CENTER_X-sW/2,sY=10;
  ctx.beginPath(); ctx.roundRect(sX,sY,sW,sH,10); ctx.fill();
  ctx.strokeStyle='#e94560'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.roundRect(sX,sY,sW,sH,10); ctx.stroke();

  ctx.fillStyle=eq.shirt.color; ctx.font='bold 28px monospace'; ctx.textAlign='center';
  ctx.fillText(player.score,CENTER_X-80,sY+36);
  ctx.fillStyle='#fff'; ctx.font='bold 16px monospace';
  ctx.fillText('VS',CENTER_X,sY+34);
  ctx.fillStyle=cpuOutfit.shirt; ctx.font='bold 28px monospace';
  ctx.fillText(cpu.score,CENTER_X+80,sY+36);

  ctx.font='bold 10px monospace';
  ctx.fillStyle=eq.shirt.color; ctx.fillText('YOU',CENTER_X-80,sY+14);
  ctx.fillStyle=cpuOutfit.shirt; ctx.fillText('CPU',CENTER_X+80,sY+14);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px monospace';
  ctx.fillText(`First to ${winScore}`,CENTER_X,sY+14);

  // Coins & streak
  ctx.fillStyle='#ffd93d'; ctx.font='bold 12px monospace'; ctx.textAlign='left';
  ctx.fillText(`${save.coins} coins`,sX+sW+10,sY+18);
  if (playerStreak >= 2) {
    ctx.fillStyle = playerOnFire ? '#ff6b00' : '#fff';
    ctx.fillText(`${playerStreak} in a row${playerOnFire?' FIRE!':''}`,sX+sW+10,sY+34);
  }

  if (scoreFlashTimer>0) {
    ctx.globalAlpha=scoreFlashTimer/60; ctx.fillStyle='#ffd93d';
    ctx.font=`bold ${30+(60-scoreFlashTimer)}px monospace`; ctx.textAlign='center';
    ctx.fillText(scoreFlash,CENTER_X,120); ctx.globalAlpha=1;
  }
}

function drawParticles() {
  for (const p of particles) { ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle=p.color; ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size); }
  ctx.globalAlpha=1;
}
function drawFloats() {
  for (const t of floatingTexts) { ctx.globalAlpha=Math.min(1,t.life/30); ctx.fillStyle=t.color; ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.fillText(t.text,t.x,t.y); }
  ctx.globalAlpha=1;
}

// ==================== BUTTON / UI HELPERS ====================
function drawBtn(x,y,w,h,text,base,tc,fs) {
  const hv=isHover(x,y,w,h), sc=hv?1.05:1, cx=x+w/2, cy=y+h/2;
  ctx.save(); ctx.translate(cx,cy); ctx.scale(sc,sc); ctx.translate(-cx,-cy);
  if (hv) { ctx.shadowColor=base; ctx.shadowBlur=12; }
  ctx.fillStyle=base; ctx.beginPath(); ctx.roundRect(x,y,w,h,10); ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.roundRect(x,y,w,h/2,[10,10,0,0]); ctx.fill();
  ctx.fillStyle=tc||'#fff'; ctx.font=`bold ${fs||18}px monospace`;
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,cx,cy+1);
  ctx.textBaseline='alphabetic'; ctx.restore();
}

function drawCoinIcon(x,y) {
  ctx.fillStyle='#ffd93d'; ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#b8860b'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillText('$',x,y+4);
  ctx.fillStyle='#ffd93d'; ctx.font='bold 18px monospace'; ctx.textAlign='left'; ctx.fillText(save.coins,x+16,y+6);
}

function drawPreview(cx,cy,sc,hat,shirt,pants) {
  ctx.save(); ctx.translate(cx,cy); ctx.scale(sc,sc);
  ctx.fillStyle=pants; ctx.fillRect(-10,-16,8,16); ctx.fillRect(2,-16,8,16);
  ctx.fillStyle='#333'; ctx.fillRect(-12,-4,10,5); ctx.fillRect(0,-4,10,5);
  ctx.fillStyle=shirt; ctx.fillRect(-14,-44,28,30);
  ctx.fillStyle='#fff'; ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillText('1',0,-22);
  ctx.fillStyle='#ffd5a5'; ctx.fillRect(-18,-38,8,14); ctx.fillRect(10,-38,8,14);
  ctx.fillStyle='#ffd5a5'; ctx.fillRect(-10,-58,20,16);
  ctx.fillStyle=shirt; ctx.fillRect(-11,-62,22,8);
  if (hat!=='ninja') { ctx.fillStyle='#333'; ctx.fillRect(-2,-54,3,4); ctx.fillRect(6,-54,3,4); ctx.fillRect(0,-48,7,2); }
  if (hat==='none'||hat==='cap'||hat==='mohawk') { ctx.fillStyle='#ffd93d'; ctx.fillRect(-11,-56,22,3); }
  drawHat(hat,1); ctx.restore();
}

function drawToggleBtn(x, y, w, label, active, color) {
  drawBtn(x, y, w, 30, label, active ? color : '#2a2f45', active ? '#000' : '#aaa', 12);
}

function drawInfoCard(x, y, w, h, title, color, lines) {
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.stroke();
  ctx.fillStyle = color; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'left';
  ctx.fillText(title, x + 16, y + 28);
  ctx.fillStyle = '#d9def2'; ctx.font = '13px monospace';
  lines.forEach((line, i) => ctx.fillText(line, x + 16, y + 56 + i * 22));
}

function drawTopRightToggles() {
  drawToggleBtn(W - 220, 18, 90, save.settings.sound ? 'SFX ON' : 'SFX OFF', save.settings.sound, '#ffd93d');
  addClick(W - 220, 18, 90, 30, () => toggleSound());
  drawToggleBtn(W - 118, 18, 98, save.settings.showTouchControls ? 'TOUCH ON' : 'TOUCH OFF', save.settings.showTouchControls, '#4cc9f0');
  addClick(W - 118, 18, 98, 30, () => toggleTouchControls());
}

function drawTouchControls() {
  if (!shouldUseTouchControls()) return;
  for (const btn of getTouchButtons()) {
    const active = !!virtualKeys[btn.code];
    ctx.fillStyle = active ? 'rgba(255,217,61,0.45)' : 'rgba(10,16,30,0.38)';
    ctx.strokeStyle = active ? '#ffd93d' : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = active ? 3 : 2;
    ctx.beginPath(); ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 18); ctx.fill();
    ctx.beginPath(); ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 18); ctx.stroke();
    ctx.fillStyle = active ? '#111' : '#fff';
    ctx.font = `bold ${btn.code === 'Space' ? 16 : 14}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 4);
  }
}

function drawPauseButton() {
  drawBtn(18, 16, 88, 34, 'PAUSE', '#2a2f45', '#fff', 12);
  addClick(18, 16, 88, 34, () => togglePause());
}

function drawMatchScene(showHint = true, allowPause = true, allowShake = true) {
  clickAreas = [];
  ctx.save();
  if (allowShake && screenShake > 0) ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);

  drawCourt(); drawHoop(HOOP_LEFT,'left'); drawHoop(HOOP_RIGHT,'right');
  drawFreeBall();

  const eq = getEquipped();
  drawPlayerSprite(player,{shirt:eq.shirt.color,pants:eq.pants.color,skin:'#ffd5a5',hat:eq.hat,label:'YOU',headband:'#ffd93d'});
  drawBallOn(player);
  drawPlayerSprite(cpu,{shirt:cpuOutfit.shirt,pants:cpuOutfit.shirt,skin:'#ffd5a5',hat:cpuOutfit.hat,label:'CPU',headband:'#ff6b6b'});
  drawBallOn(cpu);

  drawPowerBar(); drawParticles(); drawFloats(); drawScoreboard();
  if (allowPause) drawPauseButton();
  drawTouchControls();

  if (showHint) {
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Arrows / touch to move and jump | Hold SHOOT to charge | P or Esc pause | M mute', CENTER_X, H - 5);
  }
  ctx.restore();
}

// ==================== SCREENS ====================
function drawMenu() {
  clickAreas=[];
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#0f3460'); grad.addColorStop(1,'#16213e');
  ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);

  ctx.fillStyle='#fff';
  for (let i=0;i<60;i++) {
    ctx.globalAlpha=0.3+(Math.sin(Date.now()/500+i)+1)*0.3;
    ctx.fillRect((i*137.5+50)%W,(i*97.3+20)%H,1+(i%3),1+(i%3));
  }
  ctx.globalAlpha=1;

  drawTopRightToggles();

  const tb=Math.sin(Date.now()/400)*5;
  ctx.fillStyle='#ffd93d'; ctx.font='bold 44px monospace'; ctx.textAlign='center';
  ctx.fillText('BASKETBALL',CENTER_X,60+tb);
  ctx.fillStyle='#e94560'; ctx.font='bold 32px monospace';
  ctx.fillText('FUN!',CENTER_X,95+tb);
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='14px monospace';
  ctx.fillText('Arcade one-on-one with streaks, shop rewards, pause, sound, and touch controls.', CENTER_X, 122);

  const eq=getEquipped();
  drawPreview(CENTER_X,205,1.6,eq.hat,eq.shirt.color,eq.pants.color);
  ctx.fillStyle=getBallColor();
  ctx.beginPath(); ctx.arc(CENTER_X+55,175,12,0,Math.PI*2); ctx.fill();
  drawCoinIcon(CENTER_X-40,262);

  if (!save.settings.seenHelp) {
    ctx.fillStyle='rgba(255,217,61,0.15)';
    ctx.beginPath(); ctx.roundRect(CENTER_X-150, 280, 300, 28, 14); ctx.fill();
    ctx.fillStyle='#ffd93d'; ctx.font='bold 12px monospace';
    ctx.fillText('NEW HERE? TAP HELP FOR CONTROLS + SCORING.', CENTER_X, 299);
  }

  ctx.fillStyle='#fff'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
  ctx.fillText('FIRST TO:',CENTER_X-160,332);

  const opts=[5,10,15,21], oW=48,oH=34,oG=8;
  const oSX=CENTER_X-160-(opts.length*oW+(opts.length-1)*oG)/2+60;
  opts.forEach((v,i) => {
    const ox=oSX+i*(oW+oG), oy=342;
    drawBtn(ox,oy,oW,oH,String(v),winScore===v?'#06d6a0':'#334',winScore===v?'#000':'#aaa',16);
    addClick(ox,oy,oW,oH,()=>{ winScore=v; });
  });

  ctx.fillStyle='#fff'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
  ctx.fillText('DIFFICULTY:',CENTER_X+160,332);

  const diffs=['easy','medium','hard'], dColors={'easy':'#06d6a0','medium':'#ffd93d','hard':'#e94560'};
  const dW=70,dH=34,dG=8;
  const dSX=CENTER_X+160-(diffs.length*dW+(diffs.length-1)*dG)/2;
  diffs.forEach((d,i) => {
    const dx=dSX+i*(dW+dG), dy=342;
    drawBtn(dx,dy,dW,dH,d.toUpperCase(),difficulty===d?dColors[d]:'#334',difficulty===d?'#000':'#aaa',12);
    addClick(dx,dy,dW,dH,()=>{ difficulty=d; });
  });

  ctx.fillStyle='rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.roundRect(CENTER_X-310, 392, 620, 48, 12); ctx.fill();
  ctx.fillStyle='#d9def2'; ctx.font='13px monospace'; ctx.textAlign='center';
  ctx.fillText(MENU_TIPS[menuTipIndex], CENTER_X, 421);

  const bY=455, bH=50;
  drawBtn(CENTER_X-330,bY,110,bH,'HELP','#4cc9f0','#000',18);
  addClick(CENTER_X-330,bY,110,bH,()=>{ gameState='help'; setSeenHelp(); });
  drawBtn(CENTER_X-190,bY,110,bH,'SHOP','#9b5de5','#fff',18);
  addClick(CENTER_X-190,bY,110,bH,()=>{ gameState='shop'; shopTab='hats'; });
  drawBtn(CENTER_X-50,bY,110,bH,'STATS','#4d96ff','#fff',18);
  addClick(CENTER_X-50,bY,110,bH,()=>{ gameState='stats'; });
  drawBtn(CENTER_X+90,bY,180,bH,'PLAY!','#06d6a0','#000',24);
  addClick(CENTER_X+90,bY,180,bH,()=>startGame());

  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText('Arrows: move/jump | Space: charge/shoot | P/Esc: pause | M: mute | H: help',CENTER_X,H-10);
}

function drawHelp() {
  clickAreas = [];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#112244');
  grad.addColorStop(1, '#15192b');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  drawBtn(20,15,80,35,'BACK','#e94560','#fff',14);
  addClick(20,15,80,35,()=>{ gameState='menu'; });
  drawBtn(116,15,96,35,'PLAY','#06d6a0','#000',14);
  addClick(116,15,96,35,()=>startGame());
  drawTopRightToggles();

  ctx.fillStyle = '#4cc9f0'; ctx.font = 'bold 34px monospace'; ctx.textAlign = 'center';
  ctx.fillText('HOW TO PLAY', CENTER_X, 56);
  ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.font = '14px monospace';
  ctx.fillText('One file. Full arcade loop. Now with pause, sound, cleaner stats, and touch controls.', CENTER_X, 82);

  drawInfoCard(40, 110, 250, 178, 'CONTROLS', '#4cc9f0', [
    'Arrows / touch: move',
    'Up / jump button: jump',
    'Hold Space / SHOOT: charge',
    'Release to fire',
    'Air tap SHOOT: jump shot',
    'Air + near rim: dunk',
  ]);
  drawInfoCard(325, 110, 250, 178, 'SCORING', '#ffd93d', [
    'Paint finish: 1 point',
    'Mid-range stripe: 2 points',
    'Deep shot: 3 points',
    '3 straight buckets = ON FIRE',
    'Fire gives bonus coins',
    'First to target score wins',
  ]);
  drawInfoCard(610, 110, 250, 178, 'PROGRESSION', '#06d6a0', [
    'Every bucket earns coins',
    'Coins unlock cosmetics',
    'Shop purchases persist',
    'Stats track lifetime coins',
    'Completed games count cleanly',
    'Hard mode bites back',
  ]);

  drawInfoCard(70, 318, 760, 172, 'QUICK START', '#e94560', [
    '1. Pick a target score and difficulty on the menu.',
    '2. Ground charge shots are safest. Jump shots are faster. Rise near the rim to dunk.',
    '3. Pause with P or Esc if you need a break. Press M to mute instantly.',
    '4. On phones and tablets, left/right/jump/shoot buttons can appear automatically.',
    '5. Visit the shop between games, buy a new fit, and bring it into the next run.',
  ]);

  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('Press H from the menu any time to re-open this guide.', CENTER_X, H - 12);
}

function drawShop() {
  clickAreas=[];
  ctx.fillStyle='#1a1a2e'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#9b5de5'; ctx.font='bold 32px monospace'; ctx.textAlign='center'; ctx.fillText('SHOP',CENTER_X,40);

  drawBtn(20,15,80,35,'BACK','#e94560','#fff',14);
  addClick(20,15,80,35,()=>{ gameState='menu'; });
  drawTopRightToggles();
  drawCoinIcon(W-354,32);

  const tabs=['hats','balls','shirts','pants'], tW=100,tH=36,tG=10;
  const tSX=CENTER_X-(tabs.length*tW+(tabs.length-1)*tG)/2;
  tabs.forEach((t,i) => {
    const tx=tSX+i*(tW+tG), ty=60, a=shopTab===t;
    drawBtn(tx,ty,tW,tH,t.toUpperCase(),a?'#4cc9f0':'#2a2a4a',a?'#000':'#888',13);
    addClick(tx,ty,tW,tH,()=>{ shopTab=t; });
  });

  const items=SHOP[shopTab];
  const catKey=shopTab, eqKey=shopTab==='hats'?'hat':shopTab==='balls'?'ball':shopTab==='shirts'?'shirt':'pants';
  const cW=120,cH=120,cG=15;

  items.forEach((item,i) => {
    const col=i%4, row=Math.floor(i/4);
    const cx=40+col*(cW+cG), cy=115+row*(cH+cG);
    const owned=save.owned[catKey].includes(item.id);
    const equipped=save.equipped[eqKey]===item.id;
    const afford=save.coins>=item.price;

    ctx.fillStyle=equipped?'#1a4a3a':owned?'#2a2a4a':'#1e1e3a';
    ctx.strokeStyle=equipped?'#06d6a0':owned?'#555':'#333';
    ctx.lineWidth=equipped?3:1;
    ctx.beginPath(); ctx.roundRect(cx,cy,cW,cH,8); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx,cy,cW,cH,8); ctx.stroke();

    const ix=cx+cW/2, iy=cy+35;
    if (shopTab==='hats') {
      ctx.save(); ctx.translate(ix,iy); ctx.scale(1.3,1.3);
      ctx.fillStyle='#555'; ctx.fillRect(-8,-8,16,12); ctx.fillRect(-9,-12,18,6);
      drawHat(item.id,1); ctx.restore();
    } else if (shopTab==='balls') {
      const c=item.color==='rainbow'?`hsl(${(Date.now()/10)%360},100%,55%)`:item.color;
      ctx.fillStyle=c; ctx.beginPath(); ctx.arc(ix,iy,15,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=item.color==='rainbow'?`hsl(${((Date.now()/10)+40)%360},80%,40%)`:item.line;
      ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(ix-15,iy); ctx.lineTo(ix+15,iy); ctx.stroke();
    } else {
      ctx.fillStyle=item.color; ctx.beginPath(); ctx.roundRect(ix-18,iy-14,36,28,5); ctx.fill();
      if (shopTab==='shirts') { ctx.fillStyle='#fff'; ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillText('1',ix,iy+5); }
    }

    ctx.fillStyle='#fff'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
    ctx.fillText(item.name,ix,cy+75);

    if (equipped) { ctx.fillStyle='#06d6a0'; ctx.font='bold 11px monospace'; ctx.fillText('EQUIPPED',ix,cy+108); }
    else if (owned) { ctx.fillStyle='#4cc9f0'; ctx.font='bold 11px monospace'; ctx.fillText('TAP EQUIP',ix,cy+108); }
    else { ctx.fillStyle=afford?'#ffd93d':'#666'; ctx.font='bold 12px monospace'; ctx.fillText(`${item.price} coins`,ix,cy+108); }

    addClick(cx,cy,cW,cH,() => {
      if (equipped) return;
      if (owned) { save.equipped[eqKey]=item.id; writeSave(); }
      else if (afford) { save.coins-=item.price; save.owned[catKey].push(item.id); save.equipped[eqKey]=item.id; writeSave(); }
    });
  });

  const eq=getEquipped(), px=W-150;
  ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.roundRect(px-60,115,120,220,10); ctx.fill();
  ctx.fillStyle='#888'; ctx.font='11px monospace'; ctx.textAlign='center'; ctx.fillText('PREVIEW',px,135);
  drawPreview(px,260,2.0,eq.hat,eq.shirt.color,eq.pants.color);
  ctx.fillStyle=getBallColor(); ctx.beginPath(); ctx.arc(px+50,220,12,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px monospace';
  ctx.fillText('Buy once. Equip forever.', px, 360);
}

function drawStats() {
  clickAreas=[];
  ctx.fillStyle='#1a1a2e'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#4d96ff'; ctx.font='bold 36px monospace'; ctx.textAlign='center'; ctx.fillText('YOUR STATS',CENTER_X,50);

  drawBtn(20,15,80,35,'BACK','#e94560','#fff',14);
  addClick(20,15,80,35,()=>{ gameState='menu'; });
  drawTopRightToggles();

  const s=save.stats;
  const completed = s.gamesCompleted;
  const lines=[
    ['Games Started', s.gamesStarted],
    ['Games Completed', completed],
    ['Wins', s.wins],
    ['Losses', s.losses],
    ['Win Rate', completed>0?Math.round(s.wins/completed*100)+'%':'--'],
    ['Total Points', s.totalPoints],
    ['Best Streak', s.bestStreak],
    ['Lifetime Coins', s.totalCoinsEarned],
    ['Wallet', save.coins],
  ];

  lines.forEach(([label,val],i) => {
    const y=102+i*42;
    ctx.fillStyle='rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.roundRect(CENTER_X-220,y-10,440,34,8); ctx.fill();
    ctx.fillStyle='#aaa'; ctx.font='bold 15px monospace'; ctx.textAlign='left';
    ctx.fillText(label,CENTER_X-198,y+12);
    ctx.fillStyle='#fff'; ctx.textAlign='right';
    ctx.fillText(String(val),CENTER_X+198,y+12);
  });

  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText('Stats now separate started games, completed games, and lifetime coins earned.', CENTER_X, H - 14);
}

function drawCountdown() {
  drawMatchScene(true, true, false);

  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);

  const phase=Math.floor(countdownTimer/50);
  const phaseT=(countdownTimer%50)/50;
  const texts=['3','2','1','GO!'];
  const colors=['#4cc9f0','#ffd93d','#e94560','#06d6a0'];

  if (phase < 4) {
    const scale=1+Math.sin(phaseT*Math.PI)*0.3;
    const alpha=1-phaseT*0.3;
    ctx.globalAlpha=alpha;
    ctx.save(); ctx.translate(CENTER_X,H/2);
    ctx.scale(scale,scale);
    ctx.fillStyle=colors[phase];
    ctx.font=`bold ${phase===3?72:90}px monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(texts[phase],0,0);
    ctx.restore();
    ctx.globalAlpha=1;
  }

  const dColors={'easy':'#06d6a0','medium':'#ffd93d','hard':'#e94560'};
  ctx.fillStyle=dColors[difficulty]; ctx.font='bold 18px monospace'; ctx.textAlign='center';
  ctx.fillText(`${difficulty.toUpperCase()} MODE`,CENTER_X,H/2+78);
  ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='13px monospace';
  ctx.fillText('Pause any time with P / Esc.', CENTER_X, H/2 + 110);
}

function drawPauseOverlay() {
  clickAreas = [];
  ctx.fillStyle='rgba(0,0,0,0.78)'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffd93d'; ctx.font='bold 50px monospace'; ctx.textAlign='center';
  ctx.fillText('PAUSED', CENTER_X, 110);
  ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='14px monospace';
  ctx.fillText('Press P or Esc to jump back in.', CENTER_X, 138);

  drawBtn(CENTER_X-250, 180, 150, 48, 'RESUME', '#06d6a0', '#000', 16);
  addClick(CENTER_X-250, 180, 150, 48, () => togglePause());
  drawBtn(CENTER_X-75, 180, 150, 48, 'HELP', '#4cc9f0', '#000', 16);
  addClick(CENTER_X-75, 180, 150, 48, () => { gameState='help'; setSeenHelp(); });
  drawBtn(CENTER_X+100, 180, 150, 48, 'MENU', '#9b5de5', '#fff', 16);
  addClick(CENTER_X+100, 180, 150, 48, () => { clearTouchInputs(); gameState='menu'; });

  drawToggleBtn(CENTER_X-180, 248, 150, save.settings.sound ? 'SFX ON' : 'SFX OFF', save.settings.sound, '#ffd93d');
  addClick(CENTER_X-180, 248, 150, 30, () => toggleSound());
  drawToggleBtn(CENTER_X+30, 248, 150, save.settings.showTouchControls ? 'TOUCH ON' : 'TOUCH OFF', save.settings.showTouchControls, '#4cc9f0');
  addClick(CENTER_X+30, 248, 150, 30, () => toggleTouchControls());

  drawInfoCard(CENTER_X-260, 310, 520, 150, 'QUICK REF', '#4cc9f0', [
    'Hold SHOOT for grounded charge shots. Air tap SHOOT for quick jumpers.',
    'Paint = 1 point, stripe = 2 points, deep = 3 points.',
    'Three straight buckets lights you up and adds bonus coins.',
    'Touch buttons only show on touch devices when the toggle is on.',
  ]);
}

function drawGameOver() {
  clickAreas=[];
  ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(0,0,W,H);
  const isW=winner==='player';

  ctx.fillStyle=isW?'#ffd93d':'#e94560'; ctx.font='bold 56px monospace'; ctx.textAlign='center';
  ctx.fillText(isW?'YOU WIN!':'YOU LOSE!',CENTER_X,H/2-80);
  ctx.fillStyle='#fff'; ctx.font='bold 22px monospace';
  ctx.fillText(`${player.score} - ${cpu.score}`,CENTER_X,H/2-38);

  ctx.fillStyle='#ffd93d'; ctx.font='bold 18px monospace';
  ctx.fillText(`Coins this game: ${coinsEarnedThisGame}`,CENTER_X,H/2-4);
  ctx.fillStyle='#4cc9f0'; ctx.font='bold 14px monospace';
  ctx.fillText(`Lifetime coins: ${save.stats.totalCoinsEarned} | All-time best streak: ${save.stats.bestStreak}`,CENTER_X,H/2+26);

  ctx.font='14px monospace'; ctx.fillStyle=isW?'#06d6a0':'#4cc9f0';
  ctx.fillText(isW?'Amazing run! Queue up another one.' :'Great try. Tweak the loadout and run it back.',CENTER_X,H/2+54);

  const pulse=Math.sin(Date.now()/300)*0.15+0.85;
  ctx.globalAlpha=pulse;
  drawBtn(CENTER_X-210,H/2+78,190,50,'PLAY AGAIN','#06d6a0','#000',18);
  ctx.globalAlpha=1;
  addClick(CENTER_X-210,H/2+78,190,50,()=>startGame());

  drawBtn(CENTER_X+20,H/2+78,90,50,'MENU','#4cc9f0','#000',16);
  addClick(CENTER_X+20,H/2+78,90,50,()=>{ gameState='menu'; });

  drawBtn(CENTER_X+130,H/2+78,90,50,'SHOP','#9b5de5','#fff',16);
  addClick(CENTER_X+130,H/2+78,90,50,()=>{ gameState='shop'; shopTab='hats'; });

  ctx.fillStyle='rgba(255,255,255,0.32)'; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText('Press Enter or Space to play again.', CENTER_X, H - 14);
}

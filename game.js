(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const $ = id => document.getElementById(id);
  const W = 1280;
  const H = 520;
  const GROUND = 420;
  const LANES = [330, 640, 950];

  let quality = localStorage.getItem('DL_QUALITY') || 'HIGH';
  let reduced = localStorage.getItem('DL_REDUCED') === '1';
  let shakeEnabled = localStorage.getItem('DL_SHAKE') !== '0';
  let dpr = 1;
  let running = false;
  let paused = false;
  let last = 0;
  let time = 0;
  let score = 0;
  let gems = 0;
  let health = 3;
  let energy = 100;
  let rage = 0;
  let combo = 1;
  let comboTimer = 0;
  let bossCharge = 0;
  let kills = 0;
  let perfects = 0;
  let spawnTimer = .7;
  let shake = 0;
  let boss = null;

  const player = { lane: 1, x: LANES[1], y: 0, vy: 0, jumps: 0, attack: 0, dash: 0, parry: 0, invuln: 0, hurt: 0 };
  const objects = [];
  const particles = [];
  const texts = [];
  const stars = Array.from({ length: 100 }, () => ({ x: Math.random() * W, y: Math.random() * 260, r: .5 + Math.random() * 1.8, s: .2 + Math.random() * .8 }));
  const mountains = Array.from({ length: 10 }, (_, i) => ({ x: i * 150, h: 70 + Math.random() * 90 }));

  function resize() {
    const r = canvas.getBoundingClientRect();
    const cap = quality === 'LOW' ? 1 : quality === 'MEDIUM' ? 1.25 : quality === 'HIGH' ? 1.6 : 2;
    dpr = Math.min(window.devicePixelRatio || 1, cap);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function panel(id) {
    document.querySelectorAll('.dock button').forEach(b => b.classList.toggle('active', b.dataset.panel === id));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === id));
  }
  document.querySelectorAll('.dock button').forEach(b => b.addEventListener('click', () => panel(b.dataset.panel)));
  $('brandHome').addEventListener('click', () => panel('play'));
  $('quickSettings').addEventListener('click', () => panel('settings'));

  function resetRun() {
    running = true;
    paused = false;
    time = score = gems = 0;
    health = 3;
    energy = 100;
    rage = 0;
    combo = 1;
    comboTimer = 0;
    bossCharge = 0;
    kills = perfects = 0;
    spawnTimer = .55;
    shake = 0;
    boss = null;
    objects.length = particles.length = texts.length = 0;
    Object.assign(player, { lane: 1, x: LANES[1], y: 0, vy: 0, jumps: 0, attack: 0, dash: 0, parry: 0, invuln: 0, hurt: 0 });
    $('startScreen').classList.add('hidden');
    $('gameOverScreen').classList.add('hidden');
    $('pauseScreen').classList.add('hidden');
    $('runState').textContent = 'RUNNING';
    last = performance.now();
    updateHud();
  }

  function finishRun() {
    if (!running) return;
    running = false;
    paused = false;
    const best = Math.max(Number(localStorage.getItem('DL_BEST') || 0), Math.floor(score));
    localStorage.setItem('DL_BEST', String(best));
    $('finalScore').textContent = Math.floor(score).toLocaleString();
    $('finalStats').textContent = `${kills} KILLS · ${perfects} PERFECT · ${gems} GEMS`;
    $('gameOverScreen').classList.remove('hidden');
    $('runState').textContent = 'ENDED';
    updateHud();
  }

  function pause(force) {
    if (!running) return;
    paused = typeof force === 'boolean' ? force : !paused;
    $('pauseScreen').classList.toggle('hidden', !paused);
    $('runState').textContent = paused ? 'PAUSED' : 'RUNNING';
    if (!paused) last = performance.now();
  }

  $('startButton').addEventListener('click', resetRun);
  $('restartButton').addEventListener('click', resetRun);
  $('pauseBtn').addEventListener('click', () => pause());
  $('resumeButton').addEventListener('click', () => pause(false));

  function action(name) {
    if (!running || paused) return;
    if (name === 'left') player.lane = Math.max(0, player.lane - 1);
    if (name === 'right') player.lane = Math.min(2, player.lane + 1);
    if (name === 'jump' && player.jumps < 2) {
      player.vy = player.jumps ? -720 : -860;
      player.jumps++;
      burst(player.x, GROUND - 5, 5, 'dust');
    }
    if (name === 'attack') player.attack = .26;
    if (name === 'dash' && energy >= 35) {
      energy -= 35;
      player.dash = .34;
      player.invuln = .44;
      burst(player.x, GROUND - player.y - 25, 14, 'gold');
      text(player.x, GROUND - 80, 'DASH', 'cyan');
      impact(5);
    }
    if (name === 'parry' && energy >= 20) {
      energy -= 20;
      player.parry = .32;
    }
    if (name === 'rage' && rage >= 100) {
      score += 3500 * combo;
      combo = Math.min(25, combo + 4);
      rage = 0;
      burst(player.x, GROUND - 50, 35, 'violet');
      text(player.x, GROUND - 100, 'RAGE BURST!', 'gold');
      impact(10);
    }
  }

  document.querySelectorAll('[data-action]').forEach(b => b.addEventListener('pointerdown', e => {
    e.preventDefault();
    action(b.dataset.action);
  }));

  window.addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') action('left');
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') action('right');
    else if (e.code === 'Space' || e.code === 'ArrowUp') action('jump');
    else if (e.code === 'KeyF') action('attack');
    else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') action('dash');
    else if (e.code === 'KeyS') action('parry');
    else if (e.code === 'KeyR') action('rage');
    else if (e.code === 'Escape') pause();
    else if (e.code === 'Enter' && !running) resetRun();
  });

  $('quality').value = quality;
  $('reducedEffects').checked = reduced;
  $('screenShake').checked = shakeEnabled;
  $('quality').addEventListener('change', e => { quality = e.target.value; localStorage.setItem('DL_QUALITY', quality); resize(); });
  $('reducedEffects').addEventListener('change', e => { reduced = e.target.checked; localStorage.setItem('DL_REDUCED', reduced ? '1' : '0'); });
  $('screenShake').addEventListener('change', e => { shakeEnabled = e.target.checked; localStorage.setItem('DL_SHAKE', shakeEnabled ? '1' : '0'); });
  $('touchToggle').addEventListener('change', e => { document.querySelector('.touch-controls').style.display = e.target.checked ? 'flex' : 'none'; });

  function makeObject(type, lane = Math.floor(Math.random() * 3), x = W + 100) {
    const specs = {
      rock: { w: 58, h: 55, y: GROUND - 44, hp: 1 },
      enemy: { w: 62, h: 70, y: GROUND - 60, hp: 1 },
      elite: { w: 74, h: 82, y: GROUND - 68, hp: 2 },
      air: { w: 70, h: 42, y: 300, hp: 1 },
      trap: { w: 64, h: 48, y: GROUND - 40, hp: 1 },
      gem: { w: 28, h: 28, y: GROUND - 90, hp: 1 }
    };
    const s = specs[type];
    if (!s) return;
    objects.push({ type, lane, x, y: s.y, w: s.w, h: s.h, hp: s.hp, dead: false, cooldown: 0, phase: Math.random() * 6.28 });
  }

  function spawnPattern() {
    const lane = Math.floor(Math.random() * 3);
    const r = Math.random();
    if (r < .16) { makeObject('gem', lane); makeObject('rock', (lane + 1) % 3, W + 210); }
    else if (r < .34) { makeObject('enemy', lane); makeObject('air', (lane + 1) % 3, W + 260); }
    else if (r < .55) { makeObject('rock', lane); makeObject('rock', (lane + 1) % 3, W + 190); }
    else if (r < .72 && time > 8) makeObject('elite', lane);
    else makeObject('trap', lane);
  }

  function startBoss() {
    if (boss) return;
    boss = { x: W + 180, lane: 1, hp: 12, maxHp: 12, cooldown: 1.1, phase: 0 };
    text(W / 2, 120, 'JUNGLE GUARDIAN', 'boss');
    impact(9);
  }

  function burst(x, y, count, kind) {
    const n = reduced ? Math.min(5, count) : count;
    for (let i = 0; i < n; i++) {
      particles.push({ x, y, vx: (Math.random() - .5) * 420, vy: (Math.random() - .8) * 350, life: .25 + Math.random() * .55, size: 2 + Math.random() * 4, kind });
    }
  }
  function text(x, y, value, kind) { texts.push({ x, y, value, kind, life: 1 }); }
  function impact(power) { if (shakeEnabled && !reduced) shake = Math.max(shake, power); }
  function addCombo(n) { combo = Math.min(25, combo + n); comboTimer = 3.1; rage = Math.min(100, rage + n * 5); }
  function breakCombo() { combo = 1; comboTimer = 0; }

  function playerHit(o) {
    if (o.dead || player.invuln > 0) return;
    if (player.parry > 0) {
      o.dead = true;
      perfects++;
      score += 500 * combo;
      addCombo(1.5);
      rage = Math.min(100, rage + 25);
      burst(o.x, o.y, 22, 'violet');
      text(o.x, o.y - 25, 'PERFECT PARRY', 'gold');
      impact(8);
      return;
    }
    health--;
    player.invuln = 1;
    player.hurt = .45;
    breakCombo();
    burst(player.x, GROUND - 45, 16, 'red');
    text(player.x, GROUND - 75, 'HIT', 'red');
    impact(10);
    if (health <= 0) finishRun();
  }

  function defeat(o, critical) {
    if (o.dead) return;
    o.hp--;
    burst(o.x, o.y, 7, 'gold');
    if (o.hp > 0) return;
    o.dead = true;
    const elite = o.type === 'elite';
    kills += elite ? 2 : 1;
    gems += elite ? 3 : 1;
    score += (elite ? 650 : 190) * combo;
    addCombo(critical ? 1.1 : .65);
    rage = Math.min(100, rage + (elite ? 15 : 8));
    bossCharge = Math.min(100, bossCharge + (elite ? 12 : 6));
    burst(o.x, o.y, 18, 'gold');
    text(o.x, o.y - 25, critical ? 'CRITICAL KO' : 'KO', critical ? 'gold' : 'cyan');
    impact(5);
  }

  function collide(o) {
    if (o.dead || o.cooldown > 0 || o.lane !== player.lane) return;
    if (Math.abs(o.x - player.x) > o.w * .55 + 38) return;
    o.cooldown = .2;
    if (o.type === 'gem') {
      o.dead = true;
      gems++;
      score += 300 * combo;
      addCombo(.3);
      burst(o.x, o.y, 10, 'cyan');
      text(o.x, o.y - 20, '+ GEM', 'cyan');
      return;
    }
    if (o.type === 'air') {
      if (player.y > 75 || player.dash > 0) {
        o.dead = true;
        perfects++;
        score += 220 * combo;
        addCombo(.7);
        rage = Math.min(100, rage + 7);
        burst(o.x, o.y, 10, 'cyan');
        text(o.x, o.y - 20, 'PERFECT', 'gold');
      } else playerHit(o);
      return;
    }
    if (player.attack > 0 || player.dash > 0) {
      defeat(o, player.attack > 0 && player.dash <= 0);
      return;
    }
    if (player.y > 75) {
      o.dead = true;
      perfects++;
      score += 160 * combo;
      addCombo(.5);
      rage = Math.min(100, rage + 6);
      burst(o.x, o.y, 9, 'cyan');
      text(o.x, o.y - 25, 'PERFECT DODGE', 'gold');
      return;
    }
    playerHit(o);
  }

  function updateBoss(dt, speed) {
    if (!boss) return;
    boss.x = Math.max(930, boss.x - speed * .35 * dt);
    boss.phase += dt;
    boss.cooldown -= dt;
    if (boss.cooldown <= 0) {
      boss.cooldown = 1.25;
      const lane = Math.floor(Math.random() * 3);
      makeObject('air', lane, W + 80);
      if (Math.random() < .6) makeObject('rock', (lane + 1) % 3, W + 170);
    }
    if (Math.abs(boss.x - player.x) < 105 && boss.lane === player.lane) {
      if (player.attack > 0 || player.dash > 0) {
        boss.hp--;
        score += 700 * combo;
        addCombo(1);
        burst(boss.x, GROUND - 90, 12, 'gold');
        impact(7);
        if (boss.hp <= 0) {
          boss = null;
          bossCharge = 0;
          kills += 5;
          gems += 10;
          score += 5000 * combo;
          rage = 100;
          text(player.x, 150, 'BOSS DEFEATED', 'gold');
        }
      } else playerHit(boss);
    }
  }

  function update(dt) {
    time += dt;
    const speed = Math.min(1080, 440 + time * 8 + combo * 4);
    score += speed * dt * .006;
    energy = Math.min(100, energy + dt * 9);
    if (comboTimer > 0) comboTimer -= dt;
    else if (combo > 1) combo = Math.max(1, combo - dt * .65);
    rage = Math.max(0, rage - dt * .25);
    player.attack = Math.max(0, player.attack - dt);
    player.dash = Math.max(0, player.dash - dt);
    player.parry = Math.max(0, player.parry - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    player.hurt = Math.max(0, player.hurt - dt);
    player.x += (LANES[player.lane] - player.x) * Math.min(1, dt * 14);
    player.vy += 2100 * dt;
    player.y += player.vy * dt;
    if (player.y <= 0) { player.y = 0; player.vy = 0; player.jumps = 0; }
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnPattern();
      spawnTimer = Math.max(.32, .86 - time * .0032);
    }
    bossCharge = Math.min(100, bossCharge + dt * 1.35);
    if (bossCharge >= 100) startBoss();

    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      o.x -= speed * dt;
      o.cooldown -= dt;
      if (!o.dead) collide(o);
      if (!o.dead && o.x < player.x - 130) {
        o.dead = true;
        addCombo(.08);
        score += 35 * combo;
      }
      if (o.dead && o.x < -150) objects.splice(i, 1);
      else if (o.x < -150) objects.splice(i, 1);
    }
    updateBoss(dt, speed);
    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; p.life -= dt; }
    for (const t of texts) { t.y -= 28 * dt; t.life -= dt; }
    for (const s of stars) { s.x -= s.s * speed * .012 * dt; if (s.x < -5) s.x = W + Math.random() * 100; }
    shake = Math.max(0, shake - dt * 20);
    updateHud();
  }

  function updateHud() {
    $('score').textContent = Math.floor(score).toLocaleString();
    $('combo').textContent = 'x' + combo.toFixed(1);
    $('gems').textContent = gems;
    $('health').textContent = '●'.repeat(Math.max(0, health)) + '○'.repeat(Math.max(0, 3 - health));
    $('energyText').textContent = Math.floor(energy);
    $('rageText').textContent = Math.floor(rage);
    $('bossText').textContent = Math.floor(boss ? (boss.hp / boss.maxHp) * 100 : bossCharge);
    $('energyBar').style.width = energy + '%';
    $('rageBar').style.width = rage + '%';
    $('bossBar').style.width = (boss ? (boss.hp / boss.maxHp) * 100 : bossCharge) + '%';
    $('bestScore').textContent = Number(localStorage.getItem('DL_BEST') || 0).toLocaleString();
    $('objective').textContent = rage >= 100 ? 'RAGE READY — PRESS R' : boss ? 'DEFEAT THE JUNGLE GUARDIAN' : 'SURVIVE & BUILD COMBO';
  }

  function draw() {
    ctx.save();
    const sx = shake ? (Math.random() - .5) * shake : 0;
    const sy = shake ? (Math.random() - .5) * shake : 0;
    ctx.translate(sx, sy);

    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#07152c');
    sky.addColorStop(.55, '#10233a');
    sky.addColorStop(1, '#091018');
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    for (const s of stars) {
      ctx.globalAlpha = .35 + s.r * .2;
      ctx.fillStyle = '#d9f8ff';
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#142a3b';
    for (const m of mountains) {
      ctx.beginPath();
      ctx.moveTo(m.x, 330);
      ctx.lineTo(m.x + 75, 330 - m.h);
      ctx.lineTo(m.x + 150, 330);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#0a1820';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.strokeStyle = '#1d3a4d';
    ctx.lineWidth = 3;
    for (const lane of LANES) {
      ctx.beginPath();
      ctx.moveTo(lane - 70, GROUND);
      ctx.lineTo(lane - 150, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lane + 70, GROUND);
      ctx.lineTo(lane + 150, H);
      ctx.stroke();
    }

    for (const o of objects) drawObject(o);
    if (boss) drawBoss();
    drawPlayer();

    for (const p of particles) {
      if (p.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.kind === 'red' ? '#ff6178' : p.kind === 'violet' ? '#a894ff' : p.kind === 'gold' ? '#ffc56f' : '#62eaff';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const t of texts) {
      if (t.life <= 0) continue;
      ctx.globalAlpha = t.life;
      ctx.textAlign = 'center';
      ctx.font = '900 17px Arial';
      ctx.fillStyle = t.kind === 'red' ? '#ff7185' : t.kind === 'gold' || t.kind === 'boss' ? '#ffd071' : '#a9f7ff';
      ctx.fillText(t.value, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawObject(o) {
    if (o.dead) return;
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.type === 'gem') {
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#62eaff';
      ctx.fillStyle = '#62eaff';
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(15, 0); ctx.lineTo(0, 18); ctx.lineTo(-15, 0); ctx.closePath(); ctx.fill();
    } else if (o.type === 'enemy' || o.type === 'elite') {
      ctx.fillStyle = o.type === 'elite' ? '#ff9f58' : '#ff5874';
      ctx.beginPath(); ctx.arc(0, -20, o.type === 'elite' ? 35 : 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#081019'; ctx.fillRect(-14, -26, 7, 7); ctx.fillRect(7, -26, 7, 7);
    } else if (o.type === 'air') {
      ctx.fillStyle = '#ffc067'; ctx.rotate(Math.sin(time * 5 + o.phase) * .1); ctx.fillRect(-34, -14, 68, 28);
    } else {
      ctx.fillStyle = o.type === 'trap' ? '#ff5874' : '#71839a';
      ctx.beginPath(); ctx.moveTo(-28, 22); ctx.lineTo(-20, -28); ctx.lineTo(12, -40); ctx.lineTo(28, 20); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawBoss() {
    ctx.save();
    ctx.translate(boss.x, GROUND - 90);
    const pulse = 1 + Math.sin(time * 5) * .04;
    ctx.scale(pulse, pulse);
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#9d70ff';
    ctx.fillStyle = '#8656d9';
    ctx.beginPath(); ctx.arc(0, -30, 68, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.fillRect(-25, -47, 12, 12); ctx.fillRect(13, -47, 12, 12);
    ctx.fillStyle = '#281c49'; ctx.fillRect(-45, 25, 90, 15);
    ctx.fillStyle = '#ffbd68'; ctx.fillRect(-45, 25, 90 * (boss.hp / boss.maxHp), 15);
    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, GROUND - player.y - 48);
    if (player.invuln > 0 && Math.floor(player.invuln * 18) % 2 === 0) ctx.globalAlpha = .45;
    if (player.dash > 0) {
      ctx.globalAlpha = .18;
      ctx.font = '72px serif';
      ctx.fillText('🦖', -48, 28);
      ctx.globalAlpha = 1;
    }
    ctx.font = '76px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🦖', 0, 28);
    if (player.parry > 0) {
      ctx.strokeStyle = '#a894ff';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, -7, 58, 0, Math.PI * 2); ctx.stroke();
    }
    if (player.attack > 0) {
      ctx.strokeStyle = '#eaffff';
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(34, -18, 55, -1.2, 1.2); ctx.stroke();
    }
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(.032, (now - last) / 1000 || 0);
    last = now;
    if (running && !paused) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  updateHud();
  requestAnimationFrame(loop);
})();
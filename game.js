(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const $ = (id) => document.getElementById(id);

  const W = 1280;
  const H = 520;
  const GROUND = 410;
  const LANES = [330, 640, 950];

  let dpr = 1;
  let running = false;
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
  let spawnTimer = 0.8;
  let eventTimer = 7;
  let shake = 0;
  let quality = "HIGH";
  let reducedEffects = false;
  let screenShake = true;

  const player = {
    lane: 1,
    x: LANES[1],
    y: 0,
    vy: 0,
    jumps: 0,
    attack: 0,
    dash: 0,
    parry: 0,
    invuln: 0,
    hurt: 0
  };

  const objects = [];
  const particles = [];
  const floaters = [];
  const trails = [];
  const clouds = Array.from({ length: 10 }, (_, i) => ({
    x: i * 150 + Math.random() * 100,
    y: 55 + Math.random() * 100,
    s: 30 + Math.random() * 60
  }));
  const trees = Array.from({ length: 22 }, (_, i) => ({
    x: i * 70 + Math.random() * 80,
    d: Math.random(),
    s: 0.65 + Math.random() * 0.6
  }));

  let boss = null;
  let bossSpawned = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, quality === "LOW" ? 1 : 1.75);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }

  window.addEventListener("resize", resize);

  function setPanel(id) {
    document.querySelectorAll(".nav-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === id);
    });
    document.querySelectorAll(".panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === id);
    });
  }

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => setPanel(button.dataset.panel));
  });

  function resetRun() {
    running = true;
    time = 0;
    score = 0;
    gems = 0;
    health = 3;
    energy = 100;
    rage = 0;
    combo = 1;
    comboTimer = 0;
    bossCharge = 0;
    kills = 0;
    perfects = 0;
    spawnTimer = 0.65;
    eventTimer = 7;
    shake = 0;
    boss = null;
    bossSpawned = false;
    objects.length = 0;
    particles.length = 0;
    floaters.length = 0;
    trails.length = 0;
    Object.assign(player, {
      lane: 1,
      x: LANES[1],
      y: 0,
      vy: 0,
      jumps: 0,
      attack: 0,
      dash: 0,
      parry: 0,
      invuln: 0,
      hurt: 0
    });
    $("startScreen").classList.add("hidden");
    $("gameOverScreen").classList.add("hidden");
    $("runState").textContent = "RUNNING";
    last = performance.now();
    updateHud();
  }

  function finishRun() {
    if (!running) return;
    running = false;
    const best = Math.max(Number(localStorage.getItem("DL_BEST") || 0), Math.floor(score));
    localStorage.setItem("DL_BEST", String(best));
    $("finalScore").textContent = Math.floor(score).toLocaleString();
    $("finalStats").textContent = `${kills} KILLS · ${perfects} PERFECT · ${gems} GEMS`;
    $("gameOverScreen").classList.remove("hidden");
    $("runState").textContent = "ENDED";
    updateHud();
  }

  function moveLane(direction) {
    if (!running) return;
    player.lane = Math.max(0, Math.min(2, player.lane + direction));
  }

  function jump() {
    if (!running || player.jumps >= 2) return;
    player.vy = player.jumps === 0 ? -860 : -730;
    player.jumps += 1;
    burst(player.x, GROUND - 8, 5, "dust");
  }

  function attack() {
    if (running) player.attack = 0.22;
  }

  function dash() {
    if (!running || energy < 35) return;
    energy -= 35;
    player.dash = 0.34;
    player.invuln = 0.4;
    burst(player.x, GROUND - player.y - 35, 14, "orange");
    floater(player.x, GROUND - player.y - 85, "DASH", "cyan");
    impact(4);
  }

  function parry() {
    if (!running || energy < 20) return;
    energy -= 20;
    player.parry = 0.28;
  }

  function action(name) {
    if (name === "left") moveLane(-1);
    if (name === "right") moveLane(1);
    if (name === "jump") jump();
    if (name === "attack") attack();
    if (name === "dash") dash();
    if (name === "parry") parry();
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      action(button.dataset.action);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (["Space", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.code === "ArrowLeft" || event.code === "KeyA") moveLane(-1);
    else if (event.code === "ArrowRight" || event.code === "KeyD") moveLane(1);
    else if (event.code === "Space" || event.code === "ArrowUp") jump();
    else if (event.code === "KeyF") attack();
    else if (event.code === "ShiftLeft" || event.code === "ShiftRight") dash();
    else if (event.code === "KeyS") parry();
    else if (event.code === "Enter" && !running) resetRun();
  });

  $("startButton").addEventListener("click", resetRun);
  $("restartButton").addEventListener("click", resetRun);

  $("quality").addEventListener("change", (event) => {
    quality = event.target.value;
    resize();
  });
  $("reducedEffects").addEventListener("change", (event) => {
    reducedEffects = event.target.checked;
  });
  $("screenShake").addEventListener("change", (event) => {
    screenShake = event.target.checked;
  });

  function spawn(type, lane = Math.floor(Math.random() * 3), x = W + 90) {
    const specs = {
      rock: { w: 55, h: 55, y: GROUND - 45, hp: 1 },
      enemy: { w: 62, h: 72, y: GROUND - 60, hp: 1 },
      elite: { w: 72, h: 84, y: GROUND - 68, hp: 2 },
      air: { w: 70, h: 42, y: 295, hp: 1 },
      trap: { w: 64, h: 50, y: GROUND - 42, hp: 1 },
      gem: { w: 30, h: 30, y: GROUND - 90, hp: 1 }
    };
    const spec = specs[type];
    if (!spec) return;
    objects.push({ type, lane, x, y: spec.y, w: spec.w, h: spec.h, hp: spec.hp, maxHp: spec.hp, dead: false, cooldown: 0, phase: Math.random() * 6.28 });
  }

  function spawnPattern() {
    const lane = Math.floor(Math.random() * 3);
    const roll = Math.random();
    if (roll < 0.2) {
      spawn("gem", lane);
      spawn("rock", (lane + 1) % 3, W + 190);
    } else if (roll < 0.42) {
      spawn("enemy", lane);
      spawn("air", (lane + 1) % 3, W + 260);
    } else if (roll < 0.62) {
      spawn("rock", lane);
      spawn("rock", (lane + 1) % 3, W + 210);
    } else if (roll < 0.78 && time > 10) {
      spawn("elite", lane);
    } else {
      spawn("trap", lane);
    }
  }

  function spawnBoss() {
    if (boss || bossSpawned) return;
    bossSpawned = true;
    boss = { x: W + 180, y: GROUND - 115, hp: 12, maxHp: 12, lane: 1, phase: 0, cooldown: 0 };
    floater(W / 2, 145, "JUNGLE GUARDIAN", "boss");
    impact(9);
  }

  function burst(x, y, count, type) {
    let amount = count || 10;
    if (reducedEffects) amount = Math.min(5, amount);
    for (let i = 0; i < amount; i += 1) {
      particles.push({ x, y, vx: (Math.random() - 0.5) * 420, vy: (Math.random() - 0.75) * 360, life: 0.35 + Math.random() * 0.55, size: 2 + Math.random() * 4, type: type || "cyan" });
    }
  }

  function floatText(x, y, text, type) {
    floaters.push({ x, y, text, type: type || "normal", life: 1 });
  }

  function impact(amount) {
    if (screenShake && !reducedEffects) shake = Math.max(shake, amount);
  }

  function addCombo(amount, points) {
    combo = Math.min(25, combo + amount);
    comboTimer = 3.2;
    score += (points || 0) * combo;
    rage = Math.min(100, rage + amount * 5);
  }

  function breakCombo() {
    combo = 1;
    comboTimer = 0;
  }

  function damage(object) {
    if (!running || !object || object.dead) return;

    if (player.parry > 0) {
      object.hp = 0;
      perfects += 1;
      score += 450 * combo;
      addCombo(1.4, 0);
      rage = Math.min(100, rage + 20);
      burst(object.x, object.y, 22, "parry");
      floatText(object.x, object.y - 35, "PERFECT PARRY", "gold");
      impact(8);
      if (object.type === "boss") boss = null;
      else object.dead = true;
      return;
    }

    health -= 1;
    player.hurt = 0.5;
    player.invuln = 1;
    breakCombo();
    burst(player.x, GROUND - 50, 16, "red");
    floatText(player.x, GROUND - 85, "HIT", "red");
    impact(10);
    if (health <= 0) finishRun();
  }

  function defeat(object, critical) {
    if (object.dead) return;
    object.hp -= 1;
    burst(object.x, object.y, 7, "orange");
    if (object.hp > 0) return;

    object.dead = true;
    kills += object.type === "boss" ? 5 : 1;
    const base = object.type === "elite" ? 650 : 190;
    score += base * combo;
    gems += object.type === "elite" ? 3 : 1;
    addCombo(critical ? 1.1 : 0.65, 0);
    rage = Math.min(100, rage + (object.type === "elite" ? 15 : 8));
    bossCharge = Math.min(100, bossCharge + (object.type === "elite" ? 10 : 5));
    burst(object.x, object.y, 16, "orange");
    floatText(object.x, object.y - 35, critical ? "CRITICAL KO" : "KO", critical ? "gold" : "cyan");
    impact(5);
  }

  function collect(object) {
    object.dead = true;
    gems += 1;
    score += 300 * combo;
    addCombo(0.3, 0);
    burst(object.x, object.y, 9, "gem");
    floatText(object.x, object.y - 20, "+ GEM", "cyan");
  }

  function collide(object) {
    if (object.dead || object.cooldown > 0 || object.lane !== player.lane) return;
    const horizontal = Math.abs(object.x - player.x) < object.w * 0.55 + 38;
    const playerBottom = GROUND - player.y - 45;
    const vertical = Math.abs(playerBottom - object.y) < 75 || object.type === "air";
    if (!horizontal || !vertical) return;
    object.cooldown = 0.22;

    if (object.type === "gem") {
      collect(object);
      return;
    }
    if (object.type === "air") {
      if (player.y > 70 || player.dash > 0) {
        object.dead = true;
        perfects += 1;
        score += 220 * combo;
        addCombo(0.7, 0);
        rage = Math.min(100, rage + 7);
        burst(object.x, object.y, 10, "cyan");
        floatText(object.x, object.y - 20, "PERFECT", "gold");
      } else damage(object);
      return;
    }
    if (player.attack > 0 || player.dash > 0) {
      defeat(object, player.attack > 0 && player.dash <= 0);
      return;
    }
    if (player.y > 75) {
      object.dead = true;
      perfects += 1;
      score += 160 * combo;
      addCombo(0.5, 0);
      rage = Math.min(100, rage + 6);
      burst(object.x, object.y, 8, "cyan");
      floatText(object.x, object.y - 25, "PERFECT DODGE", "gold");
      return;
    }
    damage(object);
  }

  function update(dt) {
    time += dt;
    const speed = Math.min(1080, 440 + time * 8 + combo * 4);
    score += speed * dt * 0.006;
    energy = Math.min(100, energy + dt * 10);

    player.attack = Math.max(0, player.attack - dt);
    player.dash = Math.max(0, player.dash - dt);
    player.parry = Math.max(0, player.parry - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    player.hurt = Math.max(0, player.hurt - dt);

    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) breakCombo();
    }

    if (rage >= 100) {
      rage = 0;
      score += 1500 * combo;
      addCombo(1.5, 0);
      burst(player.x, GROUND - 60, 28, "rage");
      floatText(player.x, 150, "RAGE BURST", "boss");
      impact(9);
    }

    const target = LANES[player.lane];
    player.x += (target - player.x) * Math.min(1, dt * 15);
    player.vy += 2200 * dt;
    player.y += player.vy * dt;
    if (player.y <= 0) {
      player.y = 0;
      player.vy = 0;
      player.jumps = 0;
    }

    if (!boss) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnPattern();
        spawnTimer = Math.max(0.42, 0.9 - Math.min(0.35, time * 0.003));
      }
    }

    bossCharge = Math.min(100, bossCharge + dt * (time > 18 ? 0.8 : 0.3));
    if (bossCharge >= 100 && !boss) spawnBoss();

    for (let i = objects.length - 1; i >= 0; i -= 1) {
      const object = objects[i];
      object.x -= speed * dt;
      object.phase += dt * 3;
      object.cooldown = Math.max(0, object.cooldown - dt);
      if (object.type === "air") object.y = 295 + Math.sin(object.phase) * 14;
      collide(object);
      if (object.dead || object.x < -220) objects.splice(i, 1);
    }

    if (boss) {
      boss.phase += dt * 2;
      boss.x = Math.max(860, boss.x - speed * dt * 0.55);
      boss.y = GROUND - 115 + Math.sin(boss.phase) * 12;
      if (boss.x < player.x + 100 && boss.x > player.x - 150 && boss.lane === player.lane) {
        if (player.attack > 0 || player.dash > 0) {
          boss.hp -= 1;
          player.attack = 0;
          burst(boss.x, boss.y, 10, "boss");
          score += 450 * combo;
          addCombo(0.7, 0);
          impact(5);
          if (boss.hp <= 0) {
            kills += 5;
            gems += 25;
            score += 5000 * combo;
            boss = null;
            bossCharge = 0;
            bossSpawned = false;
            burst(player.x + 180, GROUND - 100, 40, "boss");
            floatText(W / 2, 120, "GUARDIAN DEFEATED", "boss");
            impact(14);
          }
        } else if (player.parry <= 0 && player.invuln <= 0) {
          damage(boss);
        }
      }
    }

    eventTimer -= dt;
    if (eventTimer <= 0 && !boss) {
      const lane = Math.floor(Math.random() * 3);
      spawn("gem", lane, W + 100);
      spawn("rock", (lane + 2) % 3, W + 240);
      eventTimer = 7 + Math.random() * 5;
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 760 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i -= 1) {
      const f = floaters[i];
      f.y -= 30 * dt;
      f.life -= dt;
      if (f.life <= 0) floaters.splice(i, 1);
    }
    if (player.dash > 0 || player.attack > 0) {
      trails.push({ x: player.x - 25, y: GROUND - player.y - 35, life: 0.2 });
    }
    for (let i = trails.length - 1; i >= 0; i -= 1) {
      trails[i].life -= dt;
      if (trails[i].life <= 0) trails.splice(i, 1);
    }

    shake = Math.max(0, shake - dt * 30);
    updateHud();
  }

  function updateHud() {
    const best = Number(localStorage.getItem("DL_BEST") || 0);
    $("score").textContent = Math.floor(score).toLocaleString();
    $("combo").textContent = `x${combo.toFixed(1)}`;
    $("gems").textContent = gems.toLocaleString();
    $("health").textContent = "●".repeat(Math.max(0, health)) + "○".repeat(Math.max(0, 3 - health));
    $("bestCard").textContent = best.toLocaleString();
    $("energyBar").style.width = `${energy}%`;
    $("rageBar").style.width = `${rage}%`;
    $("bossBar").style.width = `${boss ? Math.max(0, boss.hp / boss.maxHp * 100) : bossCharge}%`;
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#07162b");
    gradient.addColorStop(0.55, "#0b2a3b");
    gradient.addColorStop(1, "#07141b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(1010, 90, 10, 1010, 90, 140);
    glow.addColorStop(0, "#dff8ff55");
    glow.addColorStop(1, "#dff8ff00");
    ctx.fillStyle = glow;
    ctx.fillRect(850, 0, 320, 230);

    for (const cloud of clouds) {
      cloud.x -= 5 * 0.016;
      if (cloud.x < -cloud.s * 2) cloud.x = W + cloud.s;
      ctx.fillStyle = "#dff8ff12";
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.s, cloud.s * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#102b3a";
    ctx.beginPath();
    ctx.moveTo(0, 330);
    for (let x = 0; x <= W; x += 90) ctx.lineTo(x, 270 + Math.sin(x * 0.012) * 40);
    ctx.lineTo(W, 420);
    ctx.lineTo(0, 420);
    ctx.closePath();
    ctx.fill();

    for (const tree of trees) {
      const x = ((tree.x - time * (20 + tree.d * 45)) % (W + 150) + W + 150) % (W + 150) - 70;
      const base = 385 - tree.d * 35;
      const scale = tree.s * (0.65 + tree.d * 0.45);
      ctx.fillStyle = tree.d > 0.5 ? "#092832" : "#0b202a";
      ctx.fillRect(x, base - 100 * scale, 13 * scale, 100 * scale);
      ctx.beginPath();
      ctx.arc(x + 6 * scale, base - 118 * scale, 35 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 17 * scale, base - 95 * scale, 28 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    const ground = ctx.createLinearGradient(0, GROUND, 0, H);
    ground.addColorStop(0, "#152d2d");
    ground.addColorStop(1, "#06141a");
    ctx.fillStyle = ground;
    ctx.fillRect(0, GROUND, W, H - GROUND);

    ctx.strokeStyle = "#6cecff15";
    ctx.lineWidth = 2;
    for (const lane of LANES) {
      ctx.beginPath();
      ctx.moveTo(lane - 65, GROUND);
      ctx.lineTo(lane - 210, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lane + 65, GROUND);
      ctx.lineTo(lane + 210, H);
      ctx.stroke();
    }

    const lines = quality === "LOW" ? 7 : quality === "MEDIUM" ? 13 : 20;
    ctx.strokeStyle = "#b7fbff12";
    for (let i = 0; i < lines; i += 1) {
      const x = (i * 151 + time * 160) % W;
      const y = 215 + ((i * 61) % 150);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 35, y);
      ctx.stroke();
    }
  }

  function drawPlayer() {
    const x = player.x;
    const y = GROUND - player.y - 48;
    ctx.fillStyle = "#00000055";
    ctx.beginPath();
    ctx.ellipse(x, GROUND + 3, 38 - player.y * 0.02, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const trail of trails) {
      ctx.globalAlpha = trail.life * 0.7;
      ctx.font = "65px serif";
      ctx.textAlign = "center";
      ctx.fillText("🦖", trail.x, trail.y + 26);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(x, y);
    if (player.invuln > 0 && Math.floor(player.invuln * 14) % 2 === 0) ctx.globalAlpha = 0.45;
    if (rage > 75 || player.dash > 0) {
      ctx.strokeStyle = player.dash > 0 ? "#ffb657" : "#9d87ff";
      ctx.lineWidth = 5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(0, -8, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.font = "72px serif";
    ctx.textAlign = "center";
    ctx.fillText("🦖", 0, 28);
    if (player.attack > 0) {
      ctx.strokeStyle = "#ffe48b";
      ctx.lineWidth = 8;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#ffbd55";
      ctx.beginPath();
      ctx.arc(28, -20, 58, -1.15, 1.15);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    if (player.parry > 0) {
      ctx.strokeStyle = "#a58bff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -8, 58, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawObject(object) {
    if (object.dead) return;
    ctx.save();
    ctx.translate(object.x, object.y);

    if (object.type === "gem") {
      ctx.rotate(time * 2 + object.phase);
      ctx.fillStyle = "#6cecff";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#6cecff";
      ctx.beginPath();
      ctx.moveTo(0, -18); ctx.lineTo(14, 0); ctx.lineTo(0, 18); ctx.lineTo(-14, 0); ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      return;
    }

    if (object.type === "enemy" || object.type === "elite") {
      ctx.fillStyle = object.type === "elite" ? "#c9652f" : "#b94057";
      ctx.beginPath();
      ctx.arc(0, -25, object.type === "elite" ? 36 : 29, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(-14, -34, 8, 8); ctx.fillRect(7, -34, 8, 8);
      ctx.restore();
      return;
    }

    if (object.type === "air") {
      ctx.fillStyle = "#d49340";
      ctx.beginPath();
      ctx.moveTo(-38, 8); ctx.lineTo(-13, -22); ctx.lineTo(18, -18); ctx.lineTo(38, 8); ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    if (object.type === "trap") {
      ctx.fillStyle = "#d95265";
      ctx.beginPath();
      ctx.moveTo(-34, 12); ctx.lineTo(-20, -28); ctx.lineTo(-8, 12); ctx.lineTo(8, -28); ctx.lineTo(22, 12); ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.fillStyle = "#50606a";
    ctx.beginPath();
    ctx.moveTo(-30, 18); ctx.lineTo(-22, -28); ctx.lineTo(5, -42); ctx.lineTo(30, 15); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBoss() {
    if (!boss) return;
    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.fillStyle = "#64368d";
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#9d87ff55";
    ctx.beginPath();
    ctx.arc(0, -45, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.fillRect(-27, -62, 12, 12); ctx.fillRect(15, -62, 12, 12);
    ctx.fillStyle = "#27133c";
    ctx.fillRect(-38, -12, 76, 10);
    ctx.restore();
  }

  function drawEffects() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life * 1.5);
      ctx.fillStyle = p.type === "red" ? "#ff6475" : p.type === "orange" ? "#ffb657" : p.type === "parry" ? "#9d87ff" : p.type === "gem" ? "#6cecff" : "#fff";
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const f of floaters) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.textAlign = "center";
      ctx.font = "900 17px Orbitron";
      ctx.fillStyle = f.type === "red" ? "#ff6475" : f.type === "gold" ? "#ffe08a" : f.type === "boss" ? "#c6b6ff" : "#6cecff";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    drawBackground();
    for (const object of objects) drawObject(object);
    drawBoss();
    drawPlayer();
    drawEffects();
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
    last = now;
    if (running) update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // Defensive startup: a missing optional setting should never stop the game.
  try {
    quality = $("quality").value || "HIGH";
    reducedEffects = $("reducedEffects").checked;
    screenShake = $("screenShake").checked;
  } catch (error) {
    console.warn("DINO LEGENDS settings fallback", error);
  }

  resize();
  updateHud();
  render();
  requestAnimationFrame((now) => {
    last = now;
    requestAnimationFrame(loop);
  });
})();

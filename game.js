(() => {
  "use strict";

  // ============================================================
  // DINO LEGENDS v61 — NEW GAMEPLAY ENGINE
  // Skill-first combat runner with lane movement, air control,
  // attacks, dash, parry, combo decay, rage, bosses and events.
  // ============================================================

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const stage = document.getElementById("gameStage");

  const W = 1280;
  const H = 520;
  const GROUND = 408;
  const LANES = [330, 640, 950];

  let dpr = 1;
  let running = false;
  let lastTime = 0;
  let elapsed = 0;
  let score = 0;
  let gems = 0;
  let best = Number(localStorage.getItem("DL_BEST") || 0);
  let combo = 1;
  let comboTimer = 0;
  let health = 3;
  let energy = 100;
  let rage = 0;
  let bossProgress = 0;
  let kills = 0;
  let perfects = 0;
  let distance = 0;

  const player = {
    lane: 1,
    x: LANES[1],
    y: 0,
    vy: 0,
    jumps: 0,
    attack: 0,
    dash: 0,
    parry: 0,
    invulnerable: 0,
    hurt: 0,
    squash: 0,
    facing: 1
  };

  const objects = [];
  const particles = [];
  const texts = [];
  const trails = [];
  const clouds = [];
  const trees = [];

  let spawnTimer = 0.8;
  let shake = 0;
  let shakeX = 0;
  let shakeY = 0;
  let eventTimer = 8;
  let bossActive = false;
  let bossSpawned = false;
  let reducedEffects = false;
  let screenShake = true;
  let quality = "HIGH";

  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------
  // RESOLUTION / PERFORMANCE
  // ------------------------------------------------------------

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, quality === "LOW" ? 1 : 1.75);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);

  // ------------------------------------------------------------
  // WORLD DECORATION
  // ------------------------------------------------------------

  function seedWorld() {
    clouds.length = 0;
    trees.length = 0;

    for (let i = 0; i < 14; i += 1) {
      clouds.push({
        x: Math.random() * W,
        y: 55 + Math.random() * 145,
        size: 35 + Math.random() * 80,
        speed: 8 + Math.random() * 15
      });
    }

    for (let i = 0; i < 26; i += 1) {
      trees.push({
        x: Math.random() * W,
        depth: Math.random(),
        scale: 0.5 + Math.random() * 0.9
      });
    }
  }

  // ------------------------------------------------------------
  // EFFECTS
  // ------------------------------------------------------------

  function burst(x, y, count = 12, type = "cyan") {
    if (reducedEffects) count = Math.min(count, 5);

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 420,
        vy: (Math.random() - 0.8) * 360,
        life: 0.45 + Math.random() * 0.5,
        size: 2 + Math.random() * 4,
        type
      });
    }
  }

  function addText(x, y, text, type = "normal") {
    texts.push({ x, y, text, type, life: 1 });
  }

  function addTrail() {
    if (reducedEffects) return;
    trails.push({
      x: player.x,
      y: GROUND - player.y - 46,
      life: 0.22,
      scale: player.dash > 0 ? 1.3 : 0.8
    });
  }

  function screenImpact(amount = 7) {
    if (screenShake && !reducedEffects) shake = Math.max(shake, amount);
  }

  // ------------------------------------------------------------
  // RUN STATE
  // ------------------------------------------------------------

  function resetRun() {
    running = true;
    elapsed = 0;
    score = 0;
    gems = 0;
    combo = 1;
    comboTimer = 0;
    health = 3;
    energy = 100;
    rage = 0;
    bossProgress = 0;
    kills = 0;
    perfects = 0;
    distance = 0;
    spawnTimer = 0.7;
    eventTimer = 8;
    bossActive = false;
    bossSpawned = false;
    objects.length = 0;
    particles.length = 0;
    texts.length = 0;
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
      invulnerable: 0,
      hurt: 0,
      squash: 0,
      facing: 1
    });

    $("startScreen").classList.add("hidden");
    $("gameOverScreen").classList.add("hidden");
    $("runState").textContent = "RUNNING";
    lastTime = performance.now();
  }

  function finishRun() {
    if (!running) return;

    running = false;
    best = Math.max(best, Math.floor(score));
    localStorage.setItem("DL_BEST", String(best));

    $("finalScore").textContent = Math.floor(score).toLocaleString();
    $("finalStats").textContent = `${kills} KILLS · ${perfects} PERFECT · ${gems} GEMS`;
    $("gameOverScreen").classList.remove("hidden");
    $("runState").textContent = "ENDED";
    updateHud();
  }

  // ------------------------------------------------------------
  // INPUT / ABILITIES
  // ------------------------------------------------------------

  function moveLane(direction) {
    player.lane = Math.max(0, Math.min(2, player.lane + direction));
    player.facing = direction || player.facing;
    player.squash = 0.08;
  }

  function jump() {
    if (!running) return;
    if (player.jumps >= 2) return;

    player.vy = player.jumps === 0 ? -850 : -720;
    player.jumps += 1;
    burst(player.x, GROUND - player.y - 12, 5, "dust");
  }

  function attack() {
    if (!running) return;
    player.attack = 0.23;
  }

  function dash() {
    if (!running || energy < 35) return;

    energy -= 35;
    player.dash = 0.34;
    player.invulnerable = 0.38;
    player.x = LANES[player.lane];
    addText(player.x, GROUND - player.y - 85, "DASH!", "cyan");
    burst(player.x, GROUND - player.y - 42, 12, "orange");
    screenImpact(4);
  }

  function parry() {
    if (!running || energy < 20) return;

    energy -= 20;
    player.parry = 0.28;
  }

  function handleAction(action) {
    if (action === "left") moveLane(-1);
    if (action === "right") moveLane(1);
    if (action === "jump") jump();
    if (action === "attack") attack();
    if (action === "dash") dash();
    if (action === "parry") parry();
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handleAction(button.dataset.action);
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

  // ------------------------------------------------------------
  // SPAWNING
  // ------------------------------------------------------------

  function spawn(type, lane = Math.floor(Math.random() * 3), x = W + 80) {
    const data = {
      rock: { w: 54, h: 52, y: GROUND - 48, hp: 1 },
      enemy: { w: 58, h: 70, y: GROUND - 62, hp: 1 },
      elite: { w: 72, h: 84, y: GROUND - 72, hp: 2 },
      air: { w: 70, h: 42, y: 305, hp: 1 },
      trap: { w: 64, h: 50, y: GROUND - 42, hp: 1 },
      gem: { w: 30, h: 30, y: GROUND - 90, hp: 1 }
    }[type];

    if (!data) return;

    objects.push({
      type,
      lane,
      x,
      y: data.y,
      w: data.w,
      h: data.h,
      hp: data.hp,
      maxHp: data.hp,
      dead: false,
      passed: false,
      hitCooldown: 0,
      phase: Math.random() * Math.PI * 2
    });
  }

  function spawnBoss() {
    if (bossActive || bossSpawned) return;

    bossActive = true;
    bossSpawned = true;
    objects.push({
      type: "boss",
      lane: 1,
      x: W + 200,
      y: GROUND - 120,
      w: 150,
      h: 130,
      hp: 12,
      maxHp: 12,
      dead: false,
      phase: 0,
      hitCooldown: 0
    });

    addText(W * 0.5, 150, "JUNGLE GUARDIAN", "boss");
    screenImpact(10);
  }

  function spawnPattern() {
    const roll = Math.random();
    const lane = Math.floor(Math.random() * 3);

    if (roll < 0.22) {
      spawn("gem", lane);
      spawn("rock", (lane + 1) % 3, W + 180);
      return;
    }

    if (roll < 0.43) {
      spawn("enemy", lane);
      spawn("air", (lane + 1) % 3, W + 250);
      return;
    }

    if (roll < 0.62) {
      spawn("rock", lane);
      spawn("rock", (lane + 1) % 3, W + 220);
      return;
    }

    if (roll < 0.78 && elapsed > 12) {
      spawn("elite", lane);
      return;
    }

    spawn("trap", lane);
  }

  // ------------------------------------------------------------
  // COMBAT / SCORING
  // ------------------------------------------------------------

  function increaseCombo(amount, bonus = 0) {
    combo = Math.min(25, combo + amount);
    comboTimer = 3.2;
    score += bonus * combo;
    rage = Math.min(100, rage + amount * 5);
  }

  function breakCombo() {
    combo = 1;
    comboTimer = 0;
  }

  function defeat(object, perfect = false) {
    if (object.dead) return;

    object.hp -= 1;

    if (object.hp > 0) {
      burst(object.x, object.y, 7, "orange");
      screenImpact(3);
      return;
    }

    object.dead = true;
    kills += object.type === "boss" ? 5 : 1;
    bossProgress = Math.min(100, bossProgress + (object.type === "boss" ? 100 : 5));

    const base = object.type === "boss" ? 5000 : object.type === "elite" ? 600 : 180;
    score += base * combo;
    increaseCombo(perfect ? 1.25 : 0.65);
    gems += object.type === "boss" ? 25 : object.type === "elite" ? 3 : 1;
    rage = Math.min(100, rage + (object.type === "boss" ? 40 : 10));

    burst(object.x, object.y, object.type === "boss" ? 40 : 18, object.type === "boss" ? "boss" : "orange");
    addText(object.x, object.y - 40, perfect ? "CRITICAL KO" : "KO", perfect ? "gold" : "cyan");
    screenImpact(object.type === "boss" ? 14 : 6);

    if (object.type === "boss") {
      bossActive = false;
      bossProgress = 0;
      bossSpawned = false;
      addText(W / 2, 115, "GUARDIAN DEFEATED", "boss");
    }
  }

  function collectGem(object) {
    if (object.dead) return;
    object.dead = true;
    gems += 1;
    score += 300 * combo;
    increaseCombo(0.3);
    burst(object.x, object.y, 8, "gem");
    addText(object.x, object.y - 20, "+ GEM", "cyan");
  }

  function takeHit(object) {
    if (object.dead || player.invulnerable > 0) return;

    if (player.parry > 0) {
      object.dead = true;
      perfects += 1;
      score += 450 * combo;
      increaseCombo(1.4);
      rage = Math.min(100, rage + 20);
      burst(object.x, object.y, 24, "parry");
      addText(object.x, object.y - 35, "PERFECT PARRY", "gold");
      screenImpact(8);
      return;
    }

    health -= 1;
    player.hurt = 0.55;
    player.invulnerable = 1.0;
    breakCombo();
    burst(player.x, GROUND - 55, 18, "red");
    addText(player.x, GROUND - 90, "HIT", "red");
    screenImpact(11);

    if (health <= 0) finishRun();
  }

  function resolveCollision(object) {
    if (object.dead || object.hitCooldown > 0) return;
    if (object.lane !== player.lane) return;

    const playerGround = GROUND - player.y - 48;
    const objectTop = object.y - object.h;
    const horizontal = Math.abs(object.x - player.x) < (object.w * 0.55 + 38);
    const vertical = Math.abs(playerGround - objectTop) < 72 || object.type === "air";

    if (!horizontal || !vertical) return;

    object.hitCooldown = 0.25;

    if (object.type === "gem") {
      collectGem(object);
      return;
    }

    if (object.type === "air") {
      if (player.y > 70 || player.dash > 0) {
        object.dead = true;
        perfects += 1;
        score += 260 * combo;
        increaseCombo(0.8);
        rage = Math.min(100, rage + 7);
        burst(object.x, object.y, 10, "cyan");
        addText(object.x, object.y - 20, "PERFECT", "gold");
      } else {
        takeHit(object);
      }
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
      increaseCombo(0.5);
      rage = Math.min(100, rage + 6);
      burst(object.x, object.y, 9, "cyan");
      addText(object.x, object.y - 25, "PERFECT DODGE", "gold");
      return;
    }

    takeHit(object);
  }

  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------

  function update(dt) {
    elapsed += dt;
    const speed = Math.min(1080, 440 + elapsed * 9 + combo * 5);

    distance += speed * dt * 0.08;
    score += speed * dt * 0.012;

    energy = Math.min(100, energy + dt * 10);
    player.attack = Math.max(0, player.attack - dt);
    player.dash = Math.max(0, player.dash - dt);
    player.parry = Math.max(0, player.parry - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.hurt = Math.max(0, player.hurt - dt);
    player.squash = Math.max(0, player.squash - dt);

    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) breakCombo();
    }

    if (rage >= 100) {
      rage = 0;
      score += 1500 * combo;
      increaseCombo(1.5);
      addText(player.x, 155, "RAGE BURST", "boss");
      burst(player.x, GROUND - 70, 35, "rage");
      screenImpact(10);
    }

    // Smooth lane movement.
    const targetX = LANES[player.lane];
    player.x += (targetX - player.x) * Math.min(1, dt * 15);

    // Jump physics.
    player.vy += 2200 * dt;
    player.y += player.vy * dt;
    if (player.y <= 0) {
      player.y = 0;
      player.vy = 0;
      player.jumps = 0;
    }

    // Spawning becomes faster, but never so fast that the player loses control.
    if (!bossActive) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnPattern();
        const difficulty = Math.min(0.42, elapsed * 0.0035);
        spawnTimer = Math.max(0.42, 0.92 - difficulty);
      }
    }

    bossProgress = Math.min(100, bossProgress + dt * (elapsed > 18 ? 0.7 : 0.25));
    if (bossProgress >= 100 && !bossActive) spawnBoss();

    // Moving world objects.
    for (let i = objects.length - 1; i >= 0; i -= 1) {
      const object = objects[i];
      object.x -= speed * dt;
      object.phase += dt * 3;
      object.hitCooldown = Math.max(0, object.hitCooldown - dt);

      if (object.type === "boss") {
        // Boss stays visible and drifts toward the combat zone.
        object.x = Math.max(850, object.x);
        object.y = GROUND - 120 + Math.sin(object.phase) * 14;
      } else if (object.type === "air") {
        object.y += Math.sin(object.phase) * 0.7;
      }

      resolveCollision(object);

      if (!object.dead && !object.passed && object.x < player.x - 110) {
        object.passed = true;
        if (object.type !== "gem") {
          // Passing an obstacle cleanly gives a small skill reward,
          // but not enough to inflate score by simply waiting.
          score += 15 * combo;
          comboTimer = Math.max(comboTimer, 0.8);
        }
      }

      if (object.dead || object.x < -220) objects.splice(i, 1);
    }

    // Random jungle events keep runs from becoming predictable.
    eventTimer -= dt;
    if (eventTimer <= 0 && !bossActive) {
      const lane = Math.floor(Math.random() * 3);
      spawn("gem", lane, W + 100);
      spawn("rock", (lane + 2) % 3, W + 230);
      eventTimer = 7 + Math.random() * 5;
    }

    // Particles.
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 760 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Floating text.
    for (let i = texts.length - 1; i >= 0; i -= 1) {
      const text = texts[i];
      text.y -= 28 * dt;
      text.life -= dt;
      if (text.life <= 0) texts.splice(i, 1);
    }

    // Dash trail.
    if (player.dash > 0 || player.attack > 0) addTrail();
    for (let i = trails.length - 1; i >= 0; i -= 1) {
      trails[i].life -= dt;
      if (trails[i].life <= 0) trails.splice(i, 1);
    }

    shake = Math.max(0, shake - dt * 28);
    shakeX = (Math.random() - 0.5) * shake;
    shakeY = (Math.random() - 0.5) * shake;

    updateHud();
  }

  // ------------------------------------------------------------
  // HUD
  // ------------------------------------------------------------

  function updateHud() {
    $("score").textContent = Math.floor(score).toLocaleString();
    $("combo").textContent = `x${combo.toFixed(1)}`;
    $("gems").textContent = gems.toLocaleString();
    $("bestScore").textContent = best.toLocaleString();
    $("bestCard").textContent = best.toLocaleString();
    $("health").textContent = "●".repeat(Math.max(0, health)) + "○".repeat(3 - Math.max(0, health));
    $("energyBar").style.width = `${energy}%`;
    $("rageBar").style.width = `${rage}%`;
    $("bossBar").style.width = `${bossActive ? bossHealthPercent() : bossProgress}%`;
  }

  function bossHealthPercent() {
    const boss = objects.find((object) => object.type === "boss" && !object.dead);
    return boss ? Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100)) : 0;
  }

  // ------------------------------------------------------------
  // RENDERING
  // ------------------------------------------------------------

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#07152b");
    gradient.addColorStop(0.55, "#0b2940");
    gradient.addColorStop(1, "#08131f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Moon / sun glow.
    const glow = ctx.createRadialGradient(990, 100, 8, 990, 100, 120);
    glow.addColorStop(0, "#d6f5ff55");
    glow.addColorStop(1, "#d6f5ff00");
    ctx.fillStyle = glow;
    ctx.fillRect(850, 0, 280, 240);

    // Clouds.
    for (const cloud of clouds) {
      cloud.x -= cloud.speed * 0.008;
      if (cloud.x < -cloud.size * 2) cloud.x = W + cloud.size;
      ctx.fillStyle = "#dff8ff12";
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant mountains.
    ctx.fillStyle = "#102b3b";
    ctx.beginPath();
    ctx.moveTo(0, 320);
    for (let x = 0; x <= W; x += 100) {
      ctx.lineTo(x, 270 + Math.sin(x * 0.012) * 45);
    }
    ctx.lineTo(W, 420);
    ctx.lineTo(0, 420);
    ctx.closePath();
    ctx.fill();

    // Jungle trees.
    for (const tree of trees) {
      const x = (tree.x - elapsed * (25 + tree.depth * 50)) % (W + 160);
      const drawX = x < -80 ? x + W + 160 : x;
      const scale = tree.scale * (0.55 + tree.depth * 0.65);
      const base = 380 - tree.depth * 50;
      ctx.fillStyle = tree.depth > 0.5 ? "#0a2830" : "#0b202a";
      ctx.fillRect(drawX, base - 120 * scale, 15 * scale, 120 * scale);
      ctx.beginPath();
      ctx.arc(drawX + 8 * scale, base - 135 * scale, 42 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(drawX - 18 * scale, base - 110 * scale, 32 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground.
    const ground = ctx.createLinearGradient(0, GROUND, 0, H);
    ground.addColorStop(0, "#132a2b");
    ground.addColorStop(1, "#07151b");
    ctx.fillStyle = ground;
    ctx.fillRect(0, GROUND, W, H - GROUND);

    // Lane guides / perspective.
    ctx.strokeStyle = "#5ce4ee19";
    ctx.lineWidth = 2;
    for (const lane of LANES) {
      ctx.beginPath();
      ctx.moveTo(lane - 70, GROUND);
      ctx.lineTo(lane - 210, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lane + 70, GROUND);
      ctx.lineTo(lane + 210, H);
      ctx.stroke();
    }

    // Speed lines make high speed readable without flooding the canvas.
    const lineCount = quality === "LOW" ? 8 : quality === "MEDIUM" ? 14 : 22;
    ctx.strokeStyle = "#8ff7ff13";
    for (let i = 0; i < lineCount; i += 1) {
      const x = (i * 137 + elapsed * 180) % W;
      const y = 220 + ((i * 73) % 170);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 35, y);
      ctx.stroke();
    }
  }

  function drawPlayer() {
    const x = player.x;
    const y = GROUND - player.y - 48;
    const scale = player.squash > 0 ? 0.92 : 1;

    // Shadow.
    ctx.fillStyle = "#00000055";
    ctx.beginPath();
    ctx.ellipse(x, GROUND + 4, 38 + player.y * 0.03, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dash trail.
    for (const trail of trails) {
      const alpha = Math.max(0, trail.life / 0.22) * 0.25;
      ctx.globalAlpha = alpha;
      ctx.font = `${68 * trail.scale}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("🦖", trail.x - 25, trail.y + 28);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (player.invulnerable > 0 && Math.floor(player.invulnerable * 14) % 2 === 0) ctx.globalAlpha = 0.45;

    // Aura.
    if (rage > 75 || player.dash > 0) {
      ctx.strokeStyle = player.dash > 0 ? "#ffbd55" : "#9b7cff";
      ctx.lineWidth = 5;
      ctx.shadowBlur = 18;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(0, -8, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.font = "72px serif";
    ctx.textAlign = "center";
    ctx.fillText("🦖", 0, 28);

    // Attack arc.
    if (player.attack > 0) {
      ctx.strokeStyle = "#fff2a3";
      ctx.lineWidth = 8;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ffdc68";
      ctx.beginPath();
      ctx.arc(28, -20, 58, -1.15, 1.15);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Parry bubble.
    if (player.parry > 0) {
      ctx.strokeStyle = "#9d8cff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -10, 58, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawObject(object) {
    if (object.dead) return;

    const x = object.x;
    const y = object.y;
    ctx.save();
    ctx.translate(x, y);

    if (object.type === "gem") {
      ctx.rotate(elapsed * 2 + object.phase);
      ctx.fillStyle = "#67eaff";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#67eaff";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(14, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      return;
    }

    if (object.type === "boss") {
      ctx.fillStyle = "#5b2d87";
      ctx.shadowBlur = 22;
      ctx.shadowColor = "#a58bff66";
      ctx.beginPath();
      ctx.arc(0, -50, 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#f7fbff";
      ctx.fillRect(-28, -67, 12, 12);
      ctx.fillRect(16, -67, 12, 12);
      ctx.fillStyle = "#2a173e";
      ctx.fillRect(-38, -15, 76, 9);
      ctx.restore();
      return;
    }

    if (object.type === "enemy" || object.type === "elite") {
      ctx.fillStyle = object.type === "elite" ? "#c05d2d" : "#b93c52";
      ctx.shadowBlur = 12;
      ctx.shadowColor = object.type === "elite" ? "#ff9b4d55" : "#ff5f7055";
      ctx.beginPath();
      ctx.arc(0, -25, object.type === "elite" ? 36 : 29, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.fillRect(-15, -34, 8, 8);
      ctx.fillRect(7, -34, 8, 8);
      ctx.restore();
      return;
    }

    if (object.type === "air") {
      ctx.fillStyle = "#d48b39";
      ctx.beginPath();
      ctx.moveTo(-38, 8);
      ctx.lineTo(-14, -22);
      ctx.lineTo(18, -18);
      ctx.lineTo(38, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    if (object.type === "trap") {
      ctx.fillStyle = "#d94f61";
      ctx.beginPath();
      ctx.moveTo(-34, 12);
      ctx.lineTo(-20, -28);
      ctx.lineTo(-8, 12);
      ctx.lineTo(8, -28);
      ctx.lineTo(22, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // Rock / obstacle.
    ctx.fillStyle = "#4b5c67";
    ctx.beginPath();
    ctx.moveTo(-30, 18);
    ctx.lineTo(-25, -18);
    ctx.lineTo(-2, -40);
    ctx.lineTo(24, -28);
    ctx.lineTo(31, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6c7d84";
    ctx.fillRect(-12, -22, 12, 5);
    ctx.restore();
  }

  function drawEffects() {
    for (const p of particles) {
      const alpha = Math.max(0, p.life / 0.9);
      ctx.globalAlpha = alpha;
      const color = p.type === "red" ? "#ff5f70" : p.type === "orange" ? "#ffb84d" : p.type === "gold" ? "#fff1a1" : p.type === "boss" ? "#a58bff" : p.type === "parry" ? "#9d8cff" : "#67eaff";
      ctx.fillStyle = color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.font = "900 16px Orbitron, Arial";
    for (const text of texts) {
      ctx.globalAlpha = Math.max(0, text.life);
      ctx.fillStyle = text.type === "red" ? "#ff6d7c" : text.type === "gold" ? "#fff0a0" : text.type === "boss" ? "#c4b2ff" : "#7beeff";
      ctx.fillText(text.text, text.x, text.y);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawBackground();

    for (const object of objects) drawObject(object);
    drawPlayer();
    drawEffects();

    // Top-center combo feedback.
    if (running && combo >= 3) {
      ctx.textAlign = "center";
      ctx.font = "900 20px Orbitron, Arial";
      ctx.fillStyle = combo >= 15 ? "#fff0a0" : "#67eaff";
      ctx.globalAlpha = Math.min(1, 0.4 + comboTimer * 0.25);
      ctx.fillText(`x${combo.toFixed(1)} COMBO`, W / 2, 54);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ------------------------------------------------------------
  // MENUS / SETTINGS
  // ------------------------------------------------------------

  document.querySelectorAll(".menu button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".menu button").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      const panel = document.getElementById(button.dataset.panel);
      if (panel) panel.classList.add("active");
    });
  });

  $("quality").addEventListener("change", (event) => {
    quality = event.target.value;
    resizeCanvas();
  });

  $("reducedEffects").addEventListener("change", (event) => {
    reducedEffects = event.target.checked;
  });

  $("screenShake").addEventListener("change", (event) => {
    screenShake = event.target.checked;
  });

  $("startButton").addEventListener("click", resetRun);
  $("restartButton").addEventListener("click", resetRun);

  // ------------------------------------------------------------
  // MAIN LOOP
  // ------------------------------------------------------------

  function loop(now) {
    const dt = Math.min(0.032, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;

    if (running) update(dt);
    render();
    requestAnimationFrame(loop);
  }

  seedWorld();
  resizeCanvas();
  updateHud();
  render();
  requestAnimationFrame(loop);
})();

// DINO LEGENDS v61 — gameplay rebuild
(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = 1280, H = 520, GROUND = 410;
  const LANES = [300, 640, 980];
  const BEST_KEY = "DINO_LEGENDS_BEST";

  let dpr = 1, last = 0, running = false, elapsed = 0;
  let score = 0, gems = 0, combo = 1, health = 3, energy = 100;
  let lane = 1, playerX = LANES[1], playerY = 0, velocityY = 0, jumps = 0;
  let attackTimer = 0, dashTimer = 0, shieldTimer = 0, invincible = 0;
  let rage = 0, bossCharge = 0, spawnTimer = 0, kills = 0, perfects = 0;
  let shake = 0, objects = [], particles = [], texts = [], trail = [];
  let best = Number(localStorage.getItem(BEST_KEY) || 0);

  const $ = id => document.getElementById(id);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  function reset() {
    running = true;
    elapsed = score = gems = 0;
    combo = 1;
    health = 3;
    energy = 100;
    lane = 1;
    playerX = LANES[1];
    playerY = velocityY = jumps = 0;
    attackTimer = dashTimer = shieldTimer = invincible = 0;
    rage = bossCharge = 0;
    spawnTimer = 0.5;
    kills = perfects = 0;
    shake = 0;
    objects = [];
    particles = [];
    texts = [];
    trail = [];
    $("startScreen").classList.add("hidden");
    $("gameOverScreen").classList.add("hidden");
    last = performance.now();
  }

  function gameOver() {
    running = false;
    best = Math.max(best, Math.floor(score));
    localStorage.setItem(BEST_KEY, String(best));
    $("finalScore").textContent = Math.floor(score).toLocaleString();
    $("bestScore").textContent = best.toLocaleString();
    $("bestCard").textContent = best.toLocaleString();
    $("gemCard").textContent = gems.toLocaleString();
    $("gameOverScreen").classList.remove("hidden");
  }

  function addText(x, y, text, color = "#ffffff") {
    texts.push({ x, y, text, color, life: 1 });
  }

  function burst(x, y, color = "#62ecff", count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 300;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
    }
  }

  function move(dir) {
    lane = Math.max(0, Math.min(2, lane + dir));
  }

  function jump() {
    if (jumps >= 2) return;
    velocityY = jumps === 0 ? -790 : -650;
    jumps++;
    burst(playerX, GROUND - 12, "#ffffff", 5);
  }

  function attack() {
    attackTimer = 0.24;
    energy = Math.min(100, energy + 2);
  }

  function dash() {
    if (energy < 32 || dashTimer > 0) return;
    energy -= 32;
    dashTimer = 0.30;
    invincible = Math.max(invincible, 0.34);
    playerX += lane === 0 ? -100 : lane === 2 ? 100 : 0;
    playerX = Math.max(150, Math.min(W - 150, playerX));
    burst(playerX, GROUND - 45, "#ffb84d", 18);
    shake = Math.max(shake, 5);
  }

  function shield() {
    if (energy < 22) return;
    energy -= 22;
    shieldTimer = 1.25;
  }

  function spawn(type, laneIndex, x = W + 120) {
    objects.push({
      type,
      lane: laneIndex,
      x,
      y: type === "drone" ? 285 : GROUND - 52,
      hp: type === "boss" ? 7 : type === "elite" ? 2 : 1,
      dead: false,
      phase: Math.random() * Math.PI * 2
    });
  }

  function spawnPattern() {
    const r = Math.random();
    const l = Math.floor(Math.random() * 3);
    if (r < 0.20) spawn("gem", l);
    else if (r < 0.42) spawn("rock", l);
    else if (r < 0.60) spawn("enemy", l);
    else if (r < 0.72) spawn("drone", l);
    else if (r < 0.88) {
      spawn("rock", l);
      spawn("gem", (l + 1) % 3, W + 280);
    } else {
      spawn("elite", l);
      spawn("gem", (l + 2) % 3, W + 220);
    }
  }

  function spawnBoss() {
    spawn("boss", 1, W + 260);
    addText(W * 0.5, 120, "MINI BOSS INCOMING", "#ff8df5");
    burst(W * 0.65, 160, "#9b55ff", 30);
    bossCharge = -1;
  }

  function destroy(o, critical = false) {
    if (o.dead) return;
    o.hp--;
    burst(o.x, o.y, critical ? "#fff" : "#62ecff", critical ? 20 : 10);
    if (o.hp > 0) return;
    o.dead = true;
    kills++;
    bossCharge = Math.max(0, bossCharge) + (o.type === "boss" ? 100 : 5);
    rage = Math.min(100, rage + (o.type === "boss" ? 30 : 7));
    combo = Math.min(30, combo + (critical ? 1.2 : 0.55));
    score += (o.type === "boss" ? 5000 : o.type === "elite" ? 650 : 220) * combo;
    addText(o.x, o.y - 35, critical ? "CRITICAL KO" : "KO", critical ? "#ffe27a" : "#62ecff");
    shake = Math.max(shake, o.type === "boss" ? 14 : 5);
  }

  function collect(o) {
    o.dead = true;
    gems++;
    combo = Math.min(30, combo + 0.25);
    score += 300 * combo;
    rage = Math.min(100, rage + 3);
    burst(o.x, o.y, "#62ecff", 8);
  }

  function hit() {
    if (invincible > 0) return;
    if (shieldTimer > 0) {
      shieldTimer = 0;
      combo = Math.min(30, combo + 1.5);
      score += 500 * combo;
      rage = Math.min(100, rage + 12);
      addText(playerX, GROUND - 110, "PERFECT PARRY", "#8d7dff");
      burst(playerX, GROUND - 55, "#8d7dff", 24);
      shake = 8;
      return;
    }
    health--;
    combo = 1;
    invincible = 1.15;
    shake = 12;
    burst(playerX, GROUND - 45, "#ff6175", 22);
    addText(playerX, GROUND - 100, "HIT!", "#ff6175");
    if (health <= 0) gameOver();
  }

  function update(dt) {
    elapsed += dt;
    const speed = Math.min(1050, 430 + elapsed * 8 + combo * 4);

    energy = Math.min(100, energy + dt * 7.5);
    attackTimer = Math.max(0, attackTimer - dt);
    dashTimer = Math.max(0, dashTimer - dt);
    shieldTimer = Math.max(0, shieldTimer - dt);
    invincible = Math.max(0, invincible - dt);
    shake = Math.max(0, shake - dt * 25);

    playerX += (LANES[lane] - playerX) * Math.min(1, dt * 13);
    velocityY += 2050 * dt;
    playerY += velocityY * dt;
    if (playerY >= 0) {
      playerY = 0;
      velocityY = 0;
      jumps = 0;
    }

    spawnTimer -= dt;
    const interval = Math.max(0.38, 0.90 - elapsed * 0.003);
    if (spawnTimer <= 0) {
      spawnPattern();
      spawnTimer = interval;
    }

    if (bossCharge >= 100) spawnBoss();
    score += dt * speed * 0.012 * (1 + combo * 0.16);

    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      if (!o.dead) o.x -= speed * dt;
      o.phase += dt * 5;

      if (o.dead) {
        if (o.x < -180) objects.splice(i, 1);
        continue;
      }

      const sameLane = o.lane === lane;
      const close = sameLane && o.x < playerX + 78 && o.x > playerX - 95;

      if (close) {
        if (o.type === "gem") {
          collect(o);
        } else if (o.type === "drone") {
          if (playerY > 90) {
            o.dead = true;
            perfects++;
            combo = Math.min(30, combo + 0.8);
            score += 450 * combo;
            addText(o.x, o.y - 25, "PERFECT DODGE", "#62ecff");
            burst(o.x, o.y, "#62ecff", 12);
          } else if (attackTimer > 0 || dashTimer > 0) {
            destroy(o, true);
          } else {
            hit();
          }
        } else if (o.type === "enemy" || o.type === "elite" || o.type === "boss") {
          if (attackTimer > 0 || dashTimer > 0) destroy(o, attackTimer > 0);
          else if (playerY > 85) {
            o.dead = true;
            perfects++;
            combo = Math.min(30, combo + 0.5);
            score += 250 * combo;
            addText(o.x, o.y - 25, "NEAR MISS", "#ffe27a");
          } else {
            hit();
          }
        } else {
          if (playerY > 90) {
            o.dead = true;
            perfects++;
            combo = Math.min(30, combo + 0.35);
            score += 180 * combo;
            addText(o.x, o.y - 25, "PERFECT", "#62ecff");
          } else if (dashTimer > 0) {
            destroy(o, true);
          } else {
            hit();
          }
        }
      }

      if (!o.dead && o.x < playerX - 130) {
        o.dead = true;
        combo = Math.min(30, combo + 0.08);
        score += 45 * combo;
      }
      if (o.x < -180) objects.splice(i, 1);
    }

    trail.push({ x: playerX, y: playerY, life: 1 });
    if (trail.length > 14) trail.shift();
    for (const t of trail) t.life -= dt * 5;
    trail = trail.filter(t => t.life > 0);

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 700 * dt;
      p.life -= dt * 2.2;
    }
    particles = particles.filter(p => p.life > 0);

    for (const t of texts) {
      t.y -= 28 * dt;
      t.life -= dt;
    }
    texts = texts.filter(t => t.life > 0);

    updateHUD();
  }

  function updateHUD() {
    $("score").textContent = Math.floor(score).toLocaleString();
    $("gems").textContent = gems.toLocaleString();
    $("combo").textContent = `x${combo.toFixed(1)}`;
    $("bestScore").textContent = best.toLocaleString();
    $("health").textContent = "❤️".repeat(health) + "🖤".repeat(3 - health);
    if ($("gemCard")) $("gemCard").textContent = gems.toLocaleString();
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#07152b");
    gradient.addColorStop(0.55, "#102b32");
    gradient.addColorStop(1, "#071016");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Parallax mountains.
    ctx.fillStyle = "#0a2029";
    for (let i = 0; i < 8; i++) {
      const x = ((i * 260 - elapsed * 35) % (W + 300)) - 150;
      ctx.beginPath();
      ctx.moveTo(x, GROUND);
      ctx.lineTo(x + 130, 220 + (i % 3) * 25);
      ctx.lineTo(x + 280, GROUND);
      ctx.fill();
    }

    // Jungle silhouettes.
    ctx.fillStyle = "#0b3028";
    for (let i = 0; i < 14; i++) {
      const x = ((i * 110 - elapsed * 90) % (W + 150)) - 80;
      const h = 90 + (i % 4) * 25;
      ctx.fillRect(x, GROUND - h, 18, h);
      ctx.beginPath();
      ctx.arc(x + 9, GROUND - h, 46, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#0c1a20";
    ctx.fillRect(0, GROUND, W, H - GROUND);

    ctx.strokeStyle = "#294b51";
    ctx.lineWidth = 3;
    for (const laneX of LANES) {
      ctx.beginPath();
      ctx.moveTo(laneX - 70, GROUND);
      ctx.lineTo(laneX - 190, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(laneX + 70, GROUND);
      ctx.lineTo(laneX + 190, H);
      ctx.stroke();
    }

    for (let i = 0; i < 24; i++) {
      const x = (i * 193 - elapsed * 180) % W;
      ctx.fillStyle = "#b5f4d622";
      ctx.fillRect(x < 0 ? x + W : x, 40 + (i * 37) % 230, 2, 2);
    }
  }

  function drawObjects() {
    for (const o of objects) {
      if (o.dead) continue;
      ctx.save();
      ctx.translate(o.x, o.y + Math.sin(o.phase) * (o.type === "drone" ? 5 : 0));

      if (o.type === "gem") {
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#62ecff";
        ctx.fillStyle = "#62ecff";
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(18, 0);
        ctx.lineTo(0, 22);
        ctx.lineTo(-18, 0);
        ctx.closePath();
        ctx.fill();
      } else if (o.type === "boss") {
        ctx.shadowBlur = 28;
        ctx.shadowColor = "#9b55ff";
        ctx.fillStyle = "#8a4bd8";
        ctx.beginPath();
        ctx.arc(0, -48, 72, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f4d9ff";
        ctx.fillRect(-25, -66, 13, 13);
        ctx.fillRect(12, -66, 13, 13);
        ctx.fillStyle = "#2a123e";
        ctx.fillRect(-45, -5, 90, 18);
      } else if (o.type === "enemy" || o.type === "elite") {
        ctx.fillStyle = o.type === "elite" ? "#ff9d42" : "#ff4f69";
        ctx.beginPath();
        ctx.arc(0, -22, o.type === "elite" ? 34 : 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1b0b12";
        ctx.fillRect(-15, -28, 9, 9);
        ctx.fillRect(7, -28, 9, 9);
      } else if (o.type === "drone") {
        ctx.fillStyle = "#ffb84d";
        ctx.fillRect(-34, -18, 68, 28);
        ctx.fillStyle = "#fff";
        ctx.fillRect(-12, -12, 24, 7);
      } else {
        ctx.fillStyle = o.type === "rock" ? "#66798b" : "#ff5470";
        ctx.beginPath();
        ctx.moveTo(-32, 28);
        ctx.lineTo(-25, -25);
        ctx.lineTo(0, -42);
        ctx.lineTo(29, -18);
        ctx.lineTo(32, 28);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawPlayer() {
    for (const t of trail) {
      ctx.globalAlpha = t.life * 0.25;
      ctx.font = "64px serif";
      ctx.textAlign = "center";
      ctx.fillText("🦖", t.x, GROUND - t.y - 28);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(playerX, GROUND - playerY - 42);
    ctx.textAlign = "center";
    ctx.font = "72px serif";
    if (invincible > 0 && Math.floor(invincible * 16) % 2 === 0) ctx.globalAlpha = 0.45;
    ctx.fillText("🦖", 0, 30);

    if (shieldTimer > 0) {
      ctx.strokeStyle = "#8d7dff";
      ctx.lineWidth = 6;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#8d7dff";
      ctx.beginPath();
      ctx.arc(0, -3, 60, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (attackTimer > 0) {
      ctx.strokeStyle = "#ffe27a";
      ctx.lineWidth = 9;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#ffe27a";
      ctx.beginPath();
      ctx.arc(35, -20, 58, -1.2, 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    drawBackground();
    drawObjects();
    drawPlayer();

    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 5, 5);
    }
    ctx.globalAlpha = 1;

    for (const t of texts) {
      ctx.globalAlpha = t.life;
      ctx.fillStyle = t.color;
      ctx.font = "900 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    // Energy / rage bars.
    ctx.fillStyle = "#ffffff18";
    ctx.fillRect(22, H - 42, 220, 8);
    ctx.fillStyle = "#62ecff";
    ctx.fillRect(22, H - 42, 220 * energy / 100, 8);
    ctx.fillStyle = "#ffffff18";
    ctx.fillRect(22, H - 25, 220, 5);
    ctx.fillStyle = "#ff9d42";
    ctx.fillRect(22, H - 25, 220 * rage / 100, 5);

    if (rage >= 100) {
      ctx.fillStyle = "#ffe27a";
      ctx.font = "900 14px Arial";
      ctx.fillText("RAGE READY", 22, H - 55);
    }
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000 || 0);
    last = now;
    if (running) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  $("startButton").onclick = reset;
  $("restartButton").onclick = reset;
  $("leftButton").onclick = () => move(-1);
  $("rightButton").onclick = () => move(1);
  $("jumpButton").onclick = jump;
  $("dashButton").onclick = dash;
  $("shieldButton").onclick = shield;

  window.addEventListener("keydown", event => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") move(-1);
    else if (event.code === "ArrowRight" || event.code === "KeyD") move(1);
    else if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      jump();
    } else if (event.code === "ShiftLeft" || event.code === "ShiftRight") dash();
    else if (event.code === "KeyS") shield();
    else if (event.code === "KeyF") attack();
  });

  document.querySelectorAll(".menu-button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".menu-button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".content-panel").forEach(p => p.classList.remove("active"));
      button.classList.add("active");
      const panel = document.getElementById(button.dataset.panel);
      if (panel) panel.classList.add("active");
    });
  });

  $("bestScore").textContent = best.toLocaleString();
  $("bestCard").textContent = best.toLocaleString();
  draw();
  requestAnimationFrame(loop);
})();

(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const GAME_W = 1200;
  const GAME_H = 520;
  const LANES = [320, 600, 880];
  const GROUND = 410;

  let running = false;
  let gameOver = false;
  let lastTime = 0;

  let score = 0;
  let gems = 0;
  let combo = 1;
  let health = 3;
  let energy = 100;

  let lane = 1;
  let playerY = 0;
  let velocityY = 0;
  let jumps = 0;
  let shieldTime = 0;

  let elapsed = 0;
  let spawnTimer = 0;

  let objects = [];
  let particles = [];

  let bestScore = Number(localStorage.getItem("DL_BEST") || 0);

  const $ = (id) => document.getElementById(id);

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));

    ctx.setTransform(
      canvas.width / GAME_W,
      0,
      0,
      canvas.height / GAME_H,
      0,
      0
    );
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function updateHUD() {
    if ($("score")) $("score").textContent = Math.floor(score).toLocaleString();
    if ($("gems")) $("gems").textContent = gems.toLocaleString();
    if ($("combo")) $("combo").textContent = "x" + combo.toFixed(1);

    if ($("health")) {
      $("health").textContent =
        "❤️".repeat(Math.max(0, health)) +
        "🖤".repeat(Math.max(0, 3 - health));
    }

    if ($("bestScore")) {
      $("bestScore").textContent = bestScore.toLocaleString();
    }
  }

  function startGame() {
    running = true;
    gameOver = false;

    score = 0;
    gems = 0;
    combo = 1;
    health = 3;
    energy = 100;

    lane = 1;
    playerY = 0;
    velocityY = 0;
    jumps = 0;

    shieldTime = 0;

    elapsed = 0;
    spawnTimer = 0;

    objects = [];
    particles = [];

    if ($("startScreen")) $("startScreen").classList.add("hidden");
    if ($("gameOverScreen")) $("gameOverScreen").classList.add("hidden");

    updateHUD();

    lastTime = performance.now();
  }

  function endGame() {
    running = false;
    gameOver = true;

    bestScore = Math.max(bestScore, Math.floor(score));
    localStorage.setItem("DL_BEST", bestScore);

    if ($("finalScore")) {
      $("finalScore").textContent = Math.floor(score).toLocaleString();
    }

    if ($("gameOverScreen")) {
      $("gameOverScreen").classList.remove("hidden");
    }

    updateHUD();
  }

  function moveLane(direction) {
    if (!running) return;

    lane += direction;
    lane = Math.max(0, Math.min(2, lane));
  }

  function jump() {
    if (!running) return;

    if (jumps < 2) {
      velocityY = -760;
      jumps++;
      return;
    }

    // Emergency jump using energy
    if (energy >= 25) {
      energy -= 25;
      velocityY = -650;
      jumps = 1;
    }
  }

  function dash() {
    if (!running || energy < 35) return;

    energy -= 35;

    for (const object of objects) {
      if (
        object.lane === lane &&
        object.x > 100 &&
        object.x < 500 &&
        object.type !== "gem"
      ) {
        object.x -= 300;
      }
    }

    createParticles(LANES[lane], GROUND - 40, 18);
  }

  function activateShield() {
    if (!running || energy < 20) return;

    energy -= 20;
    shieldTime = 2.5;
  }

  function createParticles(x, y, amount = 10) {
    for (let i = 0; i < amount; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 280,
        vy: (Math.random() - 0.8) * 240,
        life: 1
      });
    }
  }

  function spawnObject() {
    const random = Math.random();

    let type;

    if (random < 0.48) {
      type = "rock";
    } else if (random < 0.68) {
      type = "enemy";
    } else if (random < 0.83) {
      type = "air";
    } else {
      type = "gem";
    }

    const objectLane = Math.floor(Math.random() * 3);

    objects.push({
      type,
      lane: objectLane,
      x: GAME_W + 80,

      y:
        type === "air"
          ? 285
          : type === "gem"
            ? GROUND - 100
            : GROUND - 55,

      width: type === "enemy" ? 58 : 50,
      height: type === "air" ? 32 : 55,

      passed: false
    });

    // Occasionally create a second obstacle.
    if (Math.random() < 0.18) {
      const secondLane =
        (objectLane + 1 + Math.floor(Math.random() * 2)) % 3;

      objects.push({
        type: "rock",
        lane: secondLane,
        x: GAME_W + 280,
        y: GROUND - 55,
        width: 50,
        height: 55,
        passed: false
      });
    }
  }

  function hitObstacle(object) {
    if (object.passed) return;

    object.passed = true;

    if (shieldTime > 0) {
      shieldTime = 0;
      score += 100 * combo;
      combo = Math.min(20, combo + 0.8);

      createParticles(object.x, object.y, 15);
      return;
    }

    health--;
    combo = 1;

    createParticles(LANES[lane], GROUND - 50, 20);

    if (health <= 0) {
      endGame();
    }
  }

  function collectGem(object) {
    if (object.passed) return;

    object.passed = true;

    gems++;
    score += 300 * combo;

    combo = Math.min(20, combo + 0.4);

    createParticles(object.x, object.y, 8);
  }

  function update(dt) {
    elapsed += dt;

    /*
     * Difficulty grows gradually.
     * The player should have time to learn the game first.
     */
    const speed = Math.min(900, 420 + elapsed * 6);

    score += dt * speed * 0.012 * combo;

    energy = Math.min(100, energy + dt * 7);

    shieldTime = Math.max(0, shieldTime - dt);

    /*
     * Spawn rate increases slowly.
     */
    spawnTimer -= dt;

    const spawnInterval = Math.max(
      0.42,
      0.95 - elapsed * 0.004
    );

    if (spawnTimer <= 0) {
      spawnObject();
      spawnTimer = spawnInterval;
    }

    /*
     * Gravity
     */
    velocityY += 1900 * dt;
    playerY += velocityY * dt;

    if (playerY >= 0) {
      playerY = 0;
      velocityY = 0;
      jumps = 0;
    }

    /*
     * Objects
     */
    for (let i = objects.length - 1; i >= 0; i--) {
      const object = objects[i];

      object.x -= speed * dt;

      /*
       * Player interaction zone
       */
      if (
        object.lane === lane &&
        object.x < 285 &&
        object.x > 145
      ) {
        if (object.type === "gem") {
          collectGem(object);
          objects.splice(i, 1);
          continue;
        }

        /*
         * Air obstacles are avoided by jumping.
         */
        const playerIsAirborne = playerY > 65;

        if (playerIsAirborne) {
          if (!object.passed) {
            object.passed = true;

            score += 90 * combo;
            combo = Math.min(20, combo + 0.25);
          }
        } else {
          hitObstacle(object);
        }
      }

      /*
       * Passed obstacle successfully.
       */
      if (
        !object.passed &&
        object.x < 130
      ) {
        object.passed = true;

        score += 70 * combo;
        combo = Math.min(20, combo + 0.2);
      }

      if (object.x < -120) {
        objects.splice(i, 1);
      }
    }

    /*
     * Particles
     */
    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      particle.vy += 500 * dt;
      particle.life -= dt * 2;
    }

    particles = particles.filter(
      (particle) => particle.life > 0
    );

    updateHUD();
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      GAME_H
    );

    gradient.addColorStop(0, "#050714");
    gradient.addColorStop(1, "#171b34");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    /*
     * Distant stars
     */
    ctx.fillStyle = "#ffffff44";

    for (let i = 0; i < 50; i++) {
      const x = (i * 271) % GAME_W;
      const y = (i * 97) % 240;

      ctx.fillRect(x, y, 2, 2);
    }

    /*
     * Ground
     */
    ctx.fillStyle = "#12182c";
    ctx.fillRect(
      0,
      GROUND,
      GAME_W,
      GAME_H - GROUND
    );

    /*
     * Lane separators
     */
    ctx.strokeStyle = "#62ecff25";
    ctx.lineWidth = 3;

    for (const x of LANES) {
      ctx.beginPath();
      ctx.moveTo(x - 80, GROUND);
      ctx.lineTo(x - 150, GAME_H);

      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 80, GROUND);
      ctx.lineTo(x + 150, GAME_H);

      ctx.stroke();
    }

    /*
     * Moving ground markings
     */
    ctx.strokeStyle = "#62ecff33";
    ctx.lineWidth = 3;

    const offset =
      (elapsed * 420) % 90;

    for (
      let x = -offset;
      x < GAME_W;
      x += 90
    ) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND + 8);
      ctx.lineTo(x + 45, GROUND + 8);
      ctx.stroke();
    }
  }

  function drawObjects() {
    for (const object of objects) {
      ctx.save();

      ctx.translate(
        object.x,
        object.y
      );

      if (object.type === "gem") {
        ctx.fillStyle = "#62ecff";
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#62ecff";

        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-15, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        continue;
      }

      if (object.type === "rock") {
        ctx.fillStyle = "#778298";

        ctx.beginPath();

        ctx.moveTo(-25, 25);
        ctx.lineTo(-20, -25);
        ctx.lineTo(5, -40);
        ctx.lineTo(25, -10);
        ctx.lineTo(22, 25);

        ctx.closePath();
        ctx.fill();
      }

      if (object.type === "enemy") {
        ctx.fillStyle = "#ff526d";

        ctx.beginPath();
        ctx.arc(
          0,
          -5,
          28,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#fff";

        ctx.fillRect(
          -13,
          -14,
          7,
          7
        );

        ctx.fillRect(
          6,
          -14,
          7,
          7
        );
      }

      if (object.type === "air") {
        ctx.fillStyle = "#ffb34d";

        ctx.fillRect(
          -28,
          -16,
          56,
          30
        );

        ctx.fillStyle = "#181b2d";

        ctx.fillRect(
          -9,
          -8,
          18,
          7
        );
      }

      ctx.restore();
    }
  }

  function drawPlayer() {
    ctx.save();

    ctx.translate(
      LANES[lane],
      GROUND - playerY - 35
    );

    /*
     * Shield
     */
    if (shieldTime > 0) {
      ctx.strokeStyle = "#62ecff";
      ctx.lineWidth = 5;

      ctx.beginPath();

      ctx.arc(
        0,
        -5,
        54,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }

    ctx.font = "64px serif";
    ctx.textAlign = "center";

    /*
     * Temporary character.
     * Modular skins can replace this renderer later.
     */
    ctx.fillText(
      "🦖",
      0,
      25
    );

    ctx.restore();
  }

  function drawParticles() {
    for (const particle of particles) {
      ctx.globalAlpha =
        Math.max(0, particle.life);

      ctx.fillStyle = "#62ecff";

      ctx.fillRect(
        particle.x,
        particle.y,
        4,
        4
      );
    }

    ctx.globalAlpha = 1;
  }

  function drawEnergy() {
    ctx.fillStyle = "#fff";

    ctx.font =
      "bold 15px Arial";

    ctx.fillText(
      "ENERGY " +
        Math.floor(energy),
      24,
      30
    );

    ctx.fillStyle =
      "#ffffff22";

    ctx.fillRect(
      24,
      42,
      180,
      8
    );

    ctx.fillStyle =
      "#62ecff";

    ctx.fillRect(
      24,
      42,
      180 * (energy / 100),
      8
    );
  }

  function render() {
    ctx.clearRect(
      0,
      0,
      GAME_W,
      GAME_H
    );

    drawBackground();
    drawObjects();
    drawPlayer();
    drawParticles();
    drawEnergy();
  }

  function gameLoop(time) {
    if (!running) {
      render();
      requestAnimationFrame(gameLoop);
      return;
    }

    const dt = Math.min(
      0.033,
      Math.max(
        0,
        (time - lastTime) / 1000
      )
    );

    lastTime = time;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  /*
   * UI
   */
  $("startButton")?.addEventListener(
    "click",
    startGame
  );

  $("restartButton")?.addEventListener(
    "click",
    startGame
  );

  $("jumpButton")?.addEventListener(
    "click",
    jump
  );

  $("dashButton")?.addEventListener(
    "click",
    dash
  );

  $("shieldButton")?.addEventListener(
    "click",
    activateShield
  );

  /*
   * Keyboard
   */
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.code === "Space" ||
        event.code === "ArrowUp"
      ) {
        event.preventDefault();
        jump();
      }

      if (
        event.code === "ArrowLeft" ||
        event.code === "KeyA"
      ) {
        moveLane(-1);
      }

      if (
        event.code === "ArrowRight" ||
        event.code === "KeyD"
      ) {
        moveLane(1);
      }

      if (
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight"
      ) {
        dash();
      }

      if (event.code === "KeyS") {
        activateShield();
      }
    }
  );

  /*
   * Mobile swipe
   */
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener(
    "touchstart",
    (event) => {
      const touch =
        event.changedTouches[0];

      touchStartX =
        touch.clientX;

      touchStartY =
        touch.clientY;
    },
    { passive: true }
  );

  canvas.addEventListener(
    "touchend",
    (event) => {
      const touch =
        event.changedTouches[0];

      const dx =
        touch.clientX -
        touchStartX;

      const dy =
        touch.clientY -
        touchStartY;

      if (
        Math.abs(dx) >
        Math.abs(dy)
      ) {
        if (Math.abs(dx) > 40) {
          moveLane(
            dx > 0 ? 1 : -1
          );
        }
      } else if (
        dy < -40
      ) {
        jump();
      }
    },
    { passive: true }
  );

  /*
   * Public API
   */
  window.DINO_GAME = {
    start: startGame,
    jump,
    dash,
    shield: activateShield,
    move: moveLane
  };

  updateHUD();
  render();

  requestAnimationFrame(
    gameLoop
  );
})();

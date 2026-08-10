"use strict";

/* =========================================================
   DINO LEGENDS V20
   Stable standalone game engine
========================================================= */

const $ = id => document.getElementById(id);

const canvas = $("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

if (!canvas || !ctx) {
  throw new Error("DINO LEGENDS: game canvas was not found.");
}

const SAVE_KEY = "DINO_LEGENDS_V20";

/* =========================================================
   SKINS
========================================================= */

const skinBase = [
  ["Arthur Rex", "⚔️", 0, "LEGENDARY KNIGHT"],
  ["Ghost Rex", "👻", 500000, "PHANTOM"],
  ["Price Raptor", "🎯", 900000, "ELITE OPERATIVE"],
  ["Leon Rex", "🦁", 1500000, "SURVIVOR"],
  ["Agent Rex", "🕶️", 2500000, "STEALTH"],
  ["Michael Rex", "🚗", 4000000, "OUTLAW"],
  ["CJ Rex", "🏙️", 6500000, "STREET KING"],
  ["Cyber Rex", "🤖", 10000000, "CYBER MYTHIC"],
  ["Samurai Rex", "🥷", 16000000, "SHADOW WARRIOR"],
  ["Valkyrie Rex", "🪽", 25000000, "SKY LEGEND"],
  ["Dragon Lord", "🐉", 40000000, "ANCIENT"],
  ["Demon Rex", "😈", 65000000, "INFERNAL"],
  ["Ice Emperor", "🧊", 100000000, "FROSTBORN"],
  ["Storm Emperor", "⚡", 150000000, "THUNDERBORN"],
  ["Void Emperor", "🌌", 250000000, "COSMIC"],
  ["Golden Titan", "👑", 400000000, "ROYAL"],
  ["Neon Phantom", "💠", 650000000, "NEON"],
  ["Blood Moon Rex", "🌑", 900000000, "NIGHTMARE"],
  ["Galaxy Rex", "🌠", 1500000000, "GALACTIC"],
  ["Eternal Dragon", "♾️", 3000000000, "ETERNAL"]
];

const iconSet = [
  "🐲","🦕","🦖","🐉","👾",
  "🤖","🦄","🌟","☄️","🪐",
  "💀","🪽","🔥","❄️","⚡",
  "🌌","👑","💎","🗿","🎭"
];

const skins = [...skinBase];

while (skins.length < 100) {
  const i = skins.length;

  let rarity = "EPIC";

  if (i >= 35) rarity = "LEGENDARY";
  if (i >= 60) rarity = "MYTHIC";
  if (i >= 80) rarity = "DIVINE";

  const price = Math.floor(
    3000000000 * Math.pow(1.045, i - 19)
  );

  skins.push([
    "Legendary Beast " + (i + 1),
    iconSet[i % iconSet.length],
    price,
    rarity
  ]);
}

/* =========================================================
   SAVE DATA
========================================================= */

function defaultSave() {
  return {
    gems: 2500,
    best: 0,
    skin: 0,
    owned: [0],
    used: [],
    runs: 0,

    upgrades: {
      speed: 0,
      jump: 0,
      shield: 0
    },

    missions: {
      run: 0,
      gems: 0,
      jumps: 0
    }
  };
}

function loadSave() {
  const fallback = defaultSave();

  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    return {
      ...fallback,
      ...parsed,

      owned: Array.isArray(parsed.owned)
        ? [...new Set(parsed.owned.map(Number).filter(Number.isInteger))]
        : [0],

      used: Array.isArray(parsed.used)
        ? [...new Set(parsed.used.map(String))]
        : [],

      upgrades: {
        ...fallback.upgrades,
        ...(parsed.upgrades || {})
      },

      missions: {
        ...fallback.missions,
        ...(parsed.missions || {})
      }
    };
  } catch (error) {
    console.warn("Save load failed. Creating clean save.", error);
    return fallback;
  }
}

let save = loadSave();

function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (error) {
    console.warn("Could not save game:", error);
  }
}

/* =========================================================
   REDEEM
========================================================= */

const REDEEM_CODES = Object.freeze({
  TRILLION1: 1000000000000,
  DINO100: 100,
  LEGEND500: 500,
  FANTASY1K: 1000,
  MYTHIC50K: 50000,
  LEGENDARY1M: 1000000
});

function showMessage(text, type = "") {
  const element = $("codeMessage");

  if (!element) return;

  element.textContent = text;
  element.className = "codeMessage " + type;
}

function redeem() {
  const input = $("codeInput");

  if (!input) return;

  const code = String(input.value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!code) {
    showMessage("⚠️ ENTER A REDEEM CODE", "error");
    return;
  }

  if (save.used.includes(code)) {
    showMessage("❌ THIS CODE WAS ALREADY USED", "error");
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(REDEEM_CODES, code)) {
    showMessage("❌ INVALID REDEEM CODE", "error");
    return;
  }

  const reward = REDEEM_CODES[code];

  save.gems += reward;
  save.used.push(code);

  persist();
  updateUI();

  input.value = "";

  showMessage(
    "🎉 CODE ACCEPTED! +" +
    reward.toLocaleString() +
    " GEMS",
    "success"
  );
}

/* =========================================================
   GAME STATE
========================================================= */

let running = false;
let score = 0;
let speed = 7;
let health = 3;
let combo = 1;

let lastTime = 0;
let spawnTimer = 0;
let gemTimer = 0;
let dashTimer = 0;

let shieldActive = false;

const obstacles = [];
const collectibleGems = [];

const WORLD_GROUND = 430;

const player = {
  x: 150,
  y: WORLD_GROUND - 70,
  w: 58,
  h: 70,
  vy: 0,
  jumps: 0
};

/* =========================================================
   LEVEL
========================================================= */

function getLevel() {
  return Math.max(
    1,
    Math.floor(save.best / 2500) + 1
  );
}

function getRank() {
  const level = getLevel();

  if (level >= 40) return "MYTHIC";
  if (level >= 25) return "LEGEND";
  if (level >= 15) return "ELITE";
  if (level >= 5) return "HUNTER";

  return "ROOKIE";
}

/* =========================================================
   UI
========================================================= */

function updateUI() {
  const gems = $("gems");
  const best = $("bestScore");
  const level = $("level");
  const scoreEl = $("score");
  const comboEl = $("combo");
  const healthEl = $("health");

  if (gems) {
    gems.textContent = Number(save.gems).toLocaleString();
  }

  if (best) {
    best.textContent = Math.floor(save.best).toLocaleString();
  }

  if (level) {
    level.textContent = getLevel();
  }

  if (scoreEl) {
    scoreEl.textContent = Math.floor(score).toLocaleString();
  }

  if (comboEl) {
    comboEl.textContent = "x" + combo;
  }

  if (healthEl) {
    healthEl.textContent =
      "❤️".repeat(Math.max(0, Math.min(8, health))) +
      "🖤".repeat(Math.max(0, Math.min(8, 3 - health)));
  }

  const profileLevel = $("profileLevel");
  const profileBest = $("profileBest");
  const avatar = $("avatar");
  const skinCount = $("skinCount");
  const rank = $("rank");
  const xp = $("xpBar");

  if (profileLevel) {
    profileLevel.textContent = getLevel();
  }

  if (profileBest) {
    profileBest.textContent =
      Math.floor(save.best).toLocaleString();
  }

  if (avatar) {
    avatar.textContent =
      skins[save.skin]?.[1] || "🦖";
  }

  if (skinCount) {
    skinCount.textContent =
      save.owned.length + " / " + skins.length;
  }

  if (rank) {
    rank.textContent = getRank();
  }

  if (xp) {
    xp.style.width =
      Math.min(100, (save.best % 2500) / 25) + "%";
  }
}

/* =========================================================
   SKINS
========================================================= */

function renderSkins() {
  const grid = $("skinGrid");

  if (!grid) return;

  grid.innerHTML = "";

  skins.forEach((skin, index) => {
    const owned = save.owned.includes(index);
    const equipped = save.skin === index;

    const card = document.createElement("article");

    card.className = "item skin-card";

    card.innerHTML = `
      <div class="icon skin-icon">${skin[1]}</div>
      <h3>${skin[0]}</h3>
      <small>${skin[3]}</small>

      <p>
        ${
          owned
            ? "Owned • ready to equip"
            : "Unlock this legendary champion"
        }
      </p>

      <footer>
        <span class="price">
          ${
            owned
              ? "✓ OWNED"
              : "💎 " + skin[2].toLocaleString()
          }
        </span>

        <button class="action" type="button">
          ${
            equipped
              ? "EQUIPPED"
              : owned
                ? "EQUIP"
                : "UNLOCK"
          }
        </button>
      </footer>
    `;

    const button = card.querySelector("button");

    button.addEventListener("click", () => {
      if (owned) {
        save.skin = index;
        persist();
        renderSkins();
        updateUI();
        return;
      }

      if (save.gems < skin[2]) {
        showMessage("❌ NOT ENOUGH GEMS", "error");
        return;
      }

      save.gems -= skin[2];
      save.owned.push(index);
      save.skin = index;

      persist();
      renderSkins();
      updateUI();
    });

    grid.appendChild(card);
  });
}

/* =========================================================
   MISSIONS
========================================================= */

function renderMissions() {
  const grid = $("missionGrid");

  if (!grid) return;

  const missions = [
    {
      id: "run",
      icon: "🏃",
      name: "First Adventure",
      desc: "Start 1 adventure",
      target: 1,
      reward: 500
    },
    {
      id: "gems",
      icon: "💎",
      name: "Gem Hunter",
      desc: "Collect 100 gems",
      target: 100,
      reward: 2500
    },
    {
      id: "jumps",
      icon: "🪽",
      name: "Sky Master",
      desc: "Make 25 jumps",
      target: 25,
      reward: 10000
    }
  ];

  grid.innerHTML = "";

  missions.forEach(mission => {
    const value = Number(save.missions[mission.id] || 0);

    const card = document.createElement("article");

    card.className = "item";

    card.innerHTML = `
      <div class="icon">${mission.icon}</div>
      <h3>${mission.name}</h3>
      <small>MISSION</small>

      <p>
        ${mission.desc}
        <br>
        <b>${Math.min(value, mission.target)} / ${mission.target}</b>
      </p>

      <footer>
        <span class="price">
          💎 ${mission.reward.toLocaleString()}
        </span>

        <button class="action" disabled>
          ${value >= mission.target ? "COMPLETED" : "IN PROGRESS"}
        </button>
      </footer>
    `;

    grid.appendChild(card);
  });
}

/* =========================================================
   WORLDS
========================================================= */

function renderWorlds() {
  const grid = $("worldGrid");

  if (!grid) return;

  const worlds = [
    ["🌲", "Enchanted Forest", 0, "STARTER"],
    ["🌙", "Moonlit Ruins", 2500, "LEVEL 5"],
    ["🔥", "Dragon Volcano", 10000, "LEVEL 10"],
    ["❄️", "Frozen Kingdom", 25000, "LEVEL 20"],
    ["🌌", "Astral Void", 100000, "LEVEL 40"]
  ];

  grid.innerHTML = "";

  worlds.forEach(world => {
    const unlocked = save.best >= world[2];

    const card = document.createElement("article");

    card.className = "item";

    card.innerHTML = `
      <div class="icon">${world[0]}</div>
      <h3>${world[1]}</h3>
      <small>${world[3]}</small>

      <p>
        ${
          unlocked
            ? "Realm unlocked. Ready for adventure."
            : "Reach a best score of " +
              world[2].toLocaleString() +
              "."
        }
      </p>

      <footer>
        <span class="price">
          ${unlocked ? "✓ UNLOCKED" : "🔒 LOCKED"}
        </span>

        <button
          class="action"
          type="button"
          ${unlocked ? "" : "disabled"}
        >
          ${unlocked ? "ENTER" : "LOCKED"}
        </button>
      </footer>
    `;

    grid.appendChild(card);
  });
}

/* =========================================================
   UPGRADES
========================================================= */

const upgradeConfig = {
  speed: {
    icon: "⚡",
    name: "Run Speed",
    description: "Increase movement speed",
    baseCost: 1000
  },

  jump: {
    icon: "🪽",
    name: "Double Jump+",
    description: "Higher jumps and stronger air control",
    baseCost: 1500
  },

  shield: {
    icon: "🛡️",
    name: "Shield Core",
    description: "Gain additional health",
    baseCost: 2500
  }
};

function buyUpgrade(key) {
  const config = upgradeConfig[key];

  if (!config) return;

  const currentLevel =
    Number(save.upgrades[key] || 0);

  const cost =
    config.baseCost * (currentLevel + 1);

  if (save.gems < cost) {
    showMessage("❌ NOT ENOUGH GEMS", "error");
    return;
  }

  save.gems -= cost;
  save.upgrades[key] = currentLevel + 1;

  persist();

  renderShop();
  updateUI();
}

function renderShop() {
  const grid = $("shopGrid");

  if (!grid) return;

  grid.innerHTML = "";

  Object.entries(upgradeConfig).forEach(
    ([key, config]) => {
      const level =
        Number(save.upgrades[key] || 0);

      const cost =
        config.baseCost * (level + 1);

      const card = document.createElement("article");

      card.className = "item";

      card.innerHTML = `
        <div class="icon">${config.icon}</div>
        <h3>${config.name}</h3>

        <small>
          UPGRADE LEVEL ${level}
        </small>

        <p>${config.description}</p>

        <footer>
          <span class="price">
            💎 ${cost.toLocaleString()}
          </span>

          <button
            class="action"
            type="button"
          >
            UPGRADE
          </button>
        </footer>
      `;

      card.querySelector("button")
        .addEventListener("click", () => {
          buyUpgrade(key);
        });

      grid.appendChild(card);
    }
  );
}

/* =========================================================
   TABS
========================================================= */

function setupTabs() {
  document.querySelectorAll(".tab")
    .forEach(button => {

      button.addEventListener("click", () => {

        document.querySelectorAll(".tab")
          .forEach(tab =>
            tab.classList.remove("active")
          );

        document.querySelectorAll(".panel")
          .forEach(panel =>
            panel.classList.remove("active")
          );

        button.classList.add("active");

        const panel =
          $(button.dataset.panel);

        if (panel) {
          panel.classList.add("active");
        }
      });
    });
}

/* =========================================================
   PLAYER
========================================================= */

function resetRun() {
  score = 0;

  speed =
    7 +
    Number(save.upgrades.speed || 0) * 0.5;

  health =
    3 +
    Number(save.upgrades.shield || 0);

  combo = 1;

  spawnTimer = 0;
  gemTimer = 0;
  dashTimer = 0;

  shieldActive = false;

  obstacles.length = 0;
  collectibleGems.length = 0;

  player.x = 150;
  player.y = WORLD_GROUND - player.h;
  player.vy = 0;
  player.jumps = 0;
}

function startGame() {
  if (running) return;

  resetRun();

  running = true;

  save.runs += 1;
  save.missions.run = 1;

  persist();

  $("startScreen")?.classList.add("hidden");
  $("gameOverScreen")?.classList.add("hidden");

  renderMissions();
  updateUI();

  lastTime = performance.now();

  requestAnimationFrame(gameLoop);
}

function endGame() {
  if (!running) return;

  running = false;

  save.best = Math.max(
    Number(save.best || 0),
    Math.floor(score)
  );

  persist();

  const finalScore = $("finalScore");

  if (finalScore) {
    finalScore.textContent =
      Math.floor(score).toLocaleString();
  }

  $("gameOverScreen")?.classList.remove("hidden");

  renderWorlds();
  renderMissions();
  renderShop();
  updateUI();
}

/* =========================================================
   CONTROLS
========================================================= */

function jump() {
  if (!running) return;

  if (player.jumps >= 2) return;

  player.vy =
    -(15 + Number(save.upgrades.jump || 0) * 0.7);

  player.jumps += 1;

  save.missions.jumps =
    Math.min(
      25,
      Number(save.missions.jumps || 0) + 1
    );

  persist();
  renderMissions();
}

function dash() {
  if (!running) return;

  if (dashTimer > 0) return;

  dashTimer = 32;

  score += 75;

  combo = Math.min(10, combo + 1);
}

function toggleShield() {
  if (!running) return;

  shieldActive = !shieldActive;

  updateUI();
}

/* =========================================================
   OBJECTS
========================================================= */

function spawnObjects(dt) {
  spawnTimer += dt;
  gemTimer += dt;

  const obstacleDelay =
    Math.max(
      48,
      70 - score / 1000
    );

  if (spawnTimer >= obstacleDelay) {
    obstacles.push({
      x: canvas.width + 60,
      y: WORLD_GROUND - 55,
      w: 55,
      h: 55
    });

    spawnTimer = 0;
  }

  if (gemTimer >= 28) {
    collectibleGems.push({
      x: canvas.width + 40,
      y: 150 + Math.random() * 210
    });

    gemTimer = 0;
  }
}

function collision(a, b) {
  return (
    a.x + 8 < b.x + b.w &&
    a.x + a.w - 8 > b.x &&
    a.y + 8 < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* =========================================================
   UPDATE
========================================================= */

function update(dt) {
  score += dt * 0.22;

  speed = Math.min(
    18,
    7 +
    score / 1800 +
    Number(save.upgrades.speed || 0) * 0.5
  );

  if (dashTimer > 0) {
    dashTimer -= dt;
    speed += 8;
  }

  player.vy += 0.85 * dt;
  player.y += player.vy * dt;

  if (player.y >= WORLD_GROUND - player.h) {
    player.y = WORLD_GROUND - player.h;
    player.vy = 0;
    player.jumps = 0;
  }

  spawnObjects(dt);

  for (
    let i = obstacles.length - 1;
    i >= 0;
    i--
  ) {
    const obstacle = obstacles[i];

    obstacle.x -= speed * dt;

    if (collision(player, obstacle)) {

      if (shieldActive) {
        shieldActive = false;

        obstacles.splice(i, 1);

        combo =
          Math.min(10, combo + 1);

      } else {

        health--;

        combo = 1;

        obstacles.splice(i, 1);

        if (health <= 0) {
          endGame();
          return;
        }
      }

    } else if (obstacle.x < -100) {
      obstacles.splice(i, 1);
    }
  }

  for (
    let i = collectibleGems.length - 1;
    i >= 0;
    i--
  ) {
    const gem = collectibleGems[i];

    gem.x -= speed * dt;

    const distance =
      Math.hypot(
        gem.x - player.x,
        gem.y - player.y
      );

    if (distance < 65) {

      save.gems += 25;

      save.missions.gems =
        Math.min(
          100,
          Number(save.missions.gems || 0) + 25
        );

      score += 50;

      combo =
        Math.min(10, combo + 1);

      collectibleGems.splice(i, 1);

      persist();
      renderMissions();

    } else if (gem.x < -50) {
      collectibleGems.splice(i, 1);
    }
  }

  updateUI();
}

/* =========================================================
   DRAW HELPERS
========================================================= */

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();

  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }

  ctx.fill();
}

function limb(
  x,
  y,
  w,
  h,
  rotation,
  fill,
  stroke = "#10151f"
) {
  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;

  roundedRect(
    -w / 2,
    -h / 2,
    w,
    h,
    h * 0.25
  );

  ctx.stroke();

  ctx.restore();
}

/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(x, y) {
  const id =
    Math.max(
      0,
      Math.min(
        19,
        Number(save.skin || 0) % 20
      )
    );

  const accents = [
    "#d9b36c",
    "#aeb8c8",
    "#d94848",
    "#c79b72",
    "#222b3a",
    "#9a6a38",
    "#2d4a75",
    "#28d7ff",
    "#3b263b",
    "#f1e4c7",
    "#7b4a2d",
    "#6f1b2b",
    "#bfeaff",
    "#4d8dff",
    "#8d5cff",
    "#e5b94f",
    "#18e5e5",
    "#7d1525",
    "#b85cff",
    "#d8f5ff"
  ];

  const accent = accents[id];

  const dark = "#111827";
  const metal = "#cbd5e1";

  let body = "#536b4f";
  let skin = "#748b68";

  if (id === 1) {
    body = "#8795a8";
    skin = "#b7c1d0";
  }

  if (id === 2 || id === 4) {
    body = "#263244";
    skin = "#43536b";
  }

  if (id === 7 || id === 16) {
    body = "#162d3a";
    skin = "#2bdcff";
  }

  if (id === 8) {
    body = "#302b38";
    skin = "#6e596e";
  }

  if (id === 10) {
    body = "#4b2c1c";
    skin = "#a36a3f";
  }

  if (id === 11 || id === 17) {
    body = "#351521";
    skin = "#8b2635";
  }

  if (id === 12) {
    body = "#527b8d";
    skin = "#cceeff";
  }

  if (id === 13) {
    body = "#1f3f78";
    skin = "#5aa4ff";
  }

  if (id === 14 || id === 18) {
    body = "#241b45";
    skin = "#744cff";
  }

  if (id === 15) {
    body = "#9b6a22";
    skin = "#e6bd58";
  }

  if (id === 19) {
    body = "#385a63";
    skin = "#aee8ef";
  }

  ctx.save();

  ctx.translate(x, y);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /* shadow */

  ctx.fillStyle = "rgba(0,0,0,.28)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    34,
    42,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  /* tail */

  ctx.fillStyle = skin;

  ctx.beginPath();

  ctx.moveTo(-17, 5);
  ctx.quadraticCurveTo(-48, -3, -57, 14);
  ctx.quadraticCurveTo(-39, 19, -18, 15);

  ctx.fill();

  ctx.strokeStyle = dark;
  ctx.stroke();

  /* legs */

  limb(-15, 24, 14, 34, 0.08, body);
  limb(15, 24, 14, 34, -0.08, body);

  ctx.fillStyle = dark;

  roundedRect(-25, 38, 22, 8, 4);
  roundedRect(5, 38, 22, 8, 4);

  /* torso */

  ctx.fillStyle = body;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;

  roundedRect(-26, -5, 52, 48, 15);

  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.9;

  roundedRect(-20, 2, 40, 12, 5);

  ctx.globalAlpha = 1;

  /* armor */

  if (
    id === 0 ||
    id === 8 ||
    id === 15
  ) {
    ctx.fillStyle = metal;

    roundedRect(-22, -2, 10, 35, 4);
    roundedRect(12, -2, 10, 35, 4);
  }

  if (
    id === 2 ||
    id === 4 ||
    id === 5 ||
    id === 6
  ) {
    ctx.fillStyle = dark;
    roundedRect(-24, 8, 48, 20, 5);

    ctx.fillStyle = accent;
    ctx.fillRect(-24, 8, 48, 3);
  }

  if (id === 7 || id === 16) {
    ctx.shadowBlur = 18;
    ctx.shadowColor = accent;

    ctx.strokeStyle = accent;
    ctx.strokeRect(-25, -4, 50, 47);

    ctx.shadowBlur = 0;
  }

  if (id === 11 || id === 17) {
    ctx.fillStyle = "#4b0d19";

    ctx.beginPath();

    ctx.moveTo(-25, 0);
    ctx.lineTo(25, 0);
    ctx.lineTo(15, 38);
    ctx.lineTo(-15, 38);

    ctx.closePath();
    ctx.fill();
  }

  if (id === 12 || id === 13) {
    ctx.fillStyle = metal;
    roundedRect(-25, -2, 50, 10, 4);
  }

  /* neck */

  ctx.fillStyle = skin;

  ctx.beginPath();
  ctx.arc(20, -15, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = dark;
  ctx.stroke();

  /* head */

  ctx.fillStyle = skin;

  ctx.beginPath();

  ctx.ellipse(
    25,
    -35,
    25,
    22,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle = dark;
  ctx.stroke();

  /* snout */

  ctx.fillStyle = skin;

  roundedRect(38, -32, 20, 13, 6);

  ctx.stroke();

  /* visor */

  ctx.fillStyle = "#0a0d14";

  roundedRect(25, -45, 25, 9, 4);

  ctx.fillStyle = accent;

  ctx.shadowBlur = 8;
  ctx.shadowColor = accent;

  ctx.fillRect(38, -43, 7, 3);

  ctx.shadowBlur = 0;

  /* teeth */

  ctx.fillStyle = "#fff";

  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      47 + i * 4,
      -21,
      3,
      5
    );
  }

  /* helmets */

  if (id === 0) {
    ctx.fillStyle = metal;

    ctx.beginPath();

    ctx.moveTo(5, -46);
    ctx.lineTo(22, -63);
    ctx.lineTo(45, -48);
    ctx.lineTo(30, -43);

    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(15, -59);
    ctx.lineTo(48, -55);
    ctx.stroke();
  }

  if (id === 1) {
    ctx.strokeStyle = "#d8e4ff";
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.arc(
      25,
      -35,
      28,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  if (id === 2 || id === 4) {
    ctx.fillStyle = "#151b27";

    roundedRect(5, -54, 45, 12, 5);

    ctx.fillStyle = "#222";
    ctx.fillRect(18, -58, 20, 6);
  }

  if (id === 8) {
    ctx.fillStyle = "#15101b";

    ctx.beginPath();

    ctx.moveTo(0, -52);
    ctx.lineTo(25, -68);
    ctx.lineTo(51, -52);
    ctx.lineTo(42, -45);
    ctx.lineTo(10, -45);

    ctx.closePath();

    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.stroke();
  }

  if (
    id === 10 ||
    id === 11 ||
    id === 18 ||
    id === 19
  ) {
    ctx.fillStyle = accent;

    ctx.beginPath();

    ctx.moveTo(5, -50);
    ctx.lineTo(12, -67);
    ctx.lineTo(20, -52);
    ctx.lineTo(30, -70);
    ctx.lineTo(37, -49);

    ctx.fill();

    ctx.strokeStyle = dark;
    ctx.stroke();
  }

  if (
    id === 12 ||
    id === 13 ||
    id === 14
  ) {
    ctx.fillStyle = metal;

    ctx.beginPath();

    ctx.moveTo(3, -51);
    ctx.lineTo(25, -66);
    ctx.lineTo(49, -49);
    ctx.lineTo(41, -43);
    ctx.lineTo(8, -43);

    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.fillRect(22, -64, 6, 8);
  }

  if (id === 15) {
    ctx.fillStyle = "#e9c46a";

    ctx.beginPath();

    for (let i = 0; i < 7; i++) {
      const angle =
        -Math.PI * 0.8 +
        i * Math.PI * 0.26;

      ctx.lineTo(
        25 + Math.cos(angle) * 25,
        -35 + Math.sin(angle) * 25
      );
    }

    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }

  if (id === 16) {
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(
        i * 14,
        -55
      );

      ctx.lineTo(
        10 + i * 14,
        -67
      );

      ctx.stroke();
    }
  }

  if (id === 17) {
    ctx.fillStyle = "#5c101e";

    ctx.beginPath();
    ctx.arc(25, -35, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = accent;

    ctx.beginPath();
    ctx.arc(25, -35, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#190914";

    ctx.beginPath();
    ctx.arc(25, -35, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  /* weapon */

  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;

  if (id === 0 || id === 8) {
    ctx.beginPath();

    ctx.moveTo(-26, -5);
    ctx.lineTo(-40, -30);

    ctx.stroke();

    ctx.strokeStyle = metal;
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(-43, -34);
    ctx.lineTo(-30, -8);

    ctx.stroke();
  }

  /* arms */

  limb(
    -29,
    4,
    12,
    28,
    -0.45,
    body
  );

  limb(
    29,
    4,
    12,
    28,
    0.45,
    body
  );

  ctx.fillStyle = accent;

  ctx.beginPath();
  ctx.arc(-38, 16, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(38, 16, 6, 0, Math.PI * 2);
  ctx.fill();

  /* legendary glow */

  if (id >= 14) {
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
      5,
      -12,
      58,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

/* =========================================================
   WORLD DRAW
========================================================= */

function drawWorld() {
  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );

  gradient.addColorStop(
    0,
    "#080b24"
  );

  gradient.addColorStop(
    0.55,
    "#170d30"
  );

  gradient.addColorStop(
    1,
    "#071d22"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /* stars */

  for (let i = 0; i < 90; i++) {
    ctx.fillStyle =
      i % 5 === 0
        ? "#62ecff99"
        : "#ffffff88";

    const x =
      ((i * 173 - score * 0.05) %
        canvas.width +
        canvas.width) %
      canvas.width;

    const y =
      25 + (i * 47) % 290;

    ctx.fillRect(
      x,
      y,
      2 + (i % 3),
      2 + (i % 2)
    );
  }

  /* mountains */

  ctx.fillStyle = "#183b52";

  for (let i = 0; i < 9; i++) {
    const x =
      i * 180 -
      (score * 0.03 % 180);

    ctx.beginPath();

    ctx.moveTo(x, 430);
    ctx.lineTo(
      x + 80,
      290 - (i % 2) * 50
    );
    ctx.lineTo(x + 160, 430);

    ctx.fill();
  }

  /* ground */

  ctx.fillStyle = "#102f34";

  ctx.fillRect(
    0,
    WORLD_GROUND,
    canvas.width,
    90
  );

  ctx.strokeStyle = "#65f6ff";
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(
    0,
    WORLD_GROUND
  );

  ctx.lineTo(
    canvas.width,
    WORLD_GROUND
  );

  ctx.stroke();
}

function drawObjects() {
  collectibleGems.forEach(gem => {

    ctx.fillStyle = "#61eaff";

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#61eaff";

    ctx.beginPath();

    ctx.moveTo(
      gem.x,
      gem.y - 14
    );

    ctx.lineTo(
      gem.x + 12,
      gem.y
    );

    ctx.lineTo(
      gem.x,
      gem.y + 14
    );

    ctx.lineTo(
      gem.x - 12,
      gem.y
    );

    ctx.closePath();

    ctx.fill();

    ctx.shadowBlur = 0;
  });

  obstacles.forEach(obstacle => {

    ctx.fillStyle = "#ff4f8d";

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ff4f8d";

    ctx.beginPath();

    ctx.moveTo(
      obstacle.x,
      obstacle.y + obstacle.h
    );

    ctx.lineTo(
      obstacle.x + obstacle.w / 2,
      obstacle.y
    );

    ctx.lineTo(
      obstacle.x + obstacle.w,
      obstacle.y + obstacle.h
    );

    ctx.closePath();

    ctx.fill();

    ctx.shadowBlur = 0;
  });
}

function drawGame() {
  drawWorld();
  drawObjects();

  ctx.save();

  if (shieldActive) {
    ctx.strokeStyle = "#62ecff";
    ctx.lineWidth = 5;

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#62ecff";

    ctx.beginPath();

    ctx.arc(
      player.x + 29,
      player.y + 35,
      48,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  drawCharacter(
    player.x + 29,
    player.y + 35
  );

  ctx.restore();

  if (dashTimer > 0) {

    ctx.fillStyle = "#62ecff55";

    for (let i = 1; i < 5; i++) {
      ctx.fillRect(
        player.x - i * 25,
        player.y + 25,
        14,
        4
      );
    }
  }
}

/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {
  if (!running) return;

  let dt =
    (timestamp - lastTime) / 16.67;

  lastTime = timestamp;

  dt = Math.min(
    Math.max(dt, 0),
    2
  );

  update(dt);
  drawGame();

  if (running) {
    requestAnimationFrame(gameLoop);
  }
}

/* =========================================================
   INPUT
========================================================= */

function setupControls() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.code === "Space" ||
        event.code === "ArrowUp"
      ) {
        event.preventDefault();
        jump();
      }

      if (event.code === "KeyD") {
        event.preventDefault();
        dash();
      }

      if (event.code === "KeyS") {
        event.preventDefault();
        toggleShield();
      }
    }
  );

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
    toggleShield
  );

  $("redeemButton")?.addEventListener(
    "click",
    redeem
  );

  $("codeInput")?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        event.preventDefault();
        redeem();
      }
    }
  );
}

/* =========================================================
   BOOT
========================================================= */

function boot() {
  setupTabs();
  setupControls();

  renderSkins();
  renderMissions();
  renderWorlds();
  renderShop();

  updateUI();

  resetRun();
  drawGame();

  console.log(
    "%cDINO LEGENDS V20 READY",
    "color:#62ecff;font-weight:bold;font-size:16px"
  );
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    boot,
    { once: true }
  );
} else {
  boot();
}

"use strict";

/* =========================================================
DINO LEGENDS
Stable game core
========================================================= */

const $ = id => document.getElementById(id);

const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "DINO_LEGENDS_STABLE_V1";

/* -------------------------
SAVE
------------------------- */

const defaultSave = {
gems: 2500,
best: 0,
skin: 0,
owned: [0],
usedCodes: [],
runs: 0,
upgrades: {
speed: 0,
jump: 0,
shield: 0
},
missions: {
runs: 0,
gems: 0,
jumps: 0
}
};

function loadSave() {
try {
const raw = localStorage.getItem(SAVE_KEY);

```
if (!raw) {
  return structuredClone(defaultSave);
}

const data = JSON.parse(raw);

return {
  ...structuredClone(defaultSave),
  ...data,
  owned: Array.isArray(data.owned) ? data.owned : [0],
  usedCodes: Array.isArray(data.usedCodes) ? data.usedCodes : [],
  upgrades: {
    ...defaultSave.upgrades,
    ...(data.upgrades || {})
  },
  missions: {
    ...defaultSave.missions,
    ...(data.missions || {})
  }
};
```

} catch (error) {
console.warn("Save reset:", error);
return structuredClone(defaultSave);
}
}

let save = loadSave();

function saveGame() {
try {
localStorage.setItem(SAVE_KEY, JSON.stringify(save));
} catch (error) {
console.warn("Could not save game:", error);
}
}

/* -------------------------
REDEEM
------------------------- */

const REDEEM_CODES = Object.freeze({
TRILLION1: 1000000000000,
DINO100: 100,
LEGEND500: 500,
FANTASY1K: 1000,
MYTHIC50K: 50000,
LEGENDARY1M: 1000000
});

function redeemCode() {
const input = $("codeInput");
const message = $("codeMessage");

if (!input || !message) return;

const code = input.value.trim().toUpperCase();

if (!code) {
message.textContent = "❌ ENTER A CODE";
return;
}

if (save.usedCodes.includes(code)) {
message.textContent = "❌ CODE ALREADY USED";
return;
}

if (!Object.prototype.hasOwnProperty.call(REDEEM_CODES, code)) {
message.textContent = "❌ INVALID REDEEM CODE";
return;
}

const reward = REDEEM_CODES[code];

save.gems += reward;
save.usedCodes.push(code);

saveGame();
updateUI();

input.value = "";
message.textContent =
"🎉 REDEEMED +" + reward.toLocaleString() + " GEMS";
}

/* -------------------------
SKINS
------------------------- */

const skins = [
["Arthur Rex", "⚔️", 0, "LEGENDARY"],
["Ghost Rex", "👻", 500000, "PHANTOM"],
["Price Raptor", "🎯", 900000, "ELITE"],
["Leon Rex", "🦁", 1500000, "SURVIVOR"],
["Agent Rex", "🕶️", 2500000, "STEALTH"],
["Michael Rex", "🚗", 4000000, "OUTLAW"],
["CJ Rex", "🏙️", 6500000, "STREET KING"],
["Cyber Rex", "🤖", 10000000, "MYTHIC"],
["Samurai Rex", "🥷", 16000000, "SHADOW"],
["Valkyrie Rex", "🪽", 25000000, "SKY LEGEND"],
["Dragon Lord", "🐉", 40000000, "ANCIENT"],
["Demon Rex", "😈", 65000000, "INFERNAL"],
["Ice Emperor", "🧊", 100000000, "FROST"],
["Storm Emperor", "⚡", 150000000, "THUNDER"],
["Void Emperor", "🌌", 250000000, "COSMIC"],
["Golden Titan", "👑", 400000000, "ROYAL"],
["Neon Phantom", "💠", 650000000, "NEON"],
["Blood Moon Rex", "🌑", 900000000, "NIGHTMARE"],
["Galaxy Rex", "🌠", 1500000000, "GALACTIC"],
["Eternal Dragon", "♾️", 3000000000, "ETERNAL"]
];

/* -------------------------
UI
------------------------- */

function getLevel() {
return Math.max(1, Math.floor(save.best / 2500) + 1);
}

function getRank() {
const level = getLevel();

if (level >= 40) return "MYTHIC";
if (level >= 25) return "LEGEND";
if (level >= 15) return "ELITE";
if (level >= 5) return "HUNTER";

return "ROOKIE";
}

function updateUI() {
const level = getLevel();

$("gems").textContent = save.gems.toLocaleString();
$("bestScore").textContent = Math.floor(save.best).toLocaleString();
$("level").textContent = level;

$("score").textContent = Math.floor(score).toLocaleString();
$("combo").textContent = "x" + combo;

const hearts = Math.max(0, health);
$("health").textContent =
"❤️".repeat(Math.min(8, hearts)) +
"🖤".repeat(Math.max(0, 3 - hearts));

$("profileLevel").textContent = level;
$("profileBest").textContent = Math.floor(save.best).toLocaleString();

$("avatar").textContent =
skins[save.skin] ? skins[save.skin][1] : "🦖";

$("skinCount").textContent =
save.owned.length + " / " + skins.length;

$("rank").textContent = getRank();

$("xpBar").style.width =
((save.best % 2500) / 25) + "%";
}

function message(text) {
const el = $("codeMessage");

if (el) {
el.textContent = text;
}
}

/* -------------------------
SKIN UI
------------------------- */

function renderSkins() {
const grid = $("skinGrid");

if (!grid) return;

grid.innerHTML = "";

skins.forEach((skin, index) => {
const owned = save.owned.includes(index);

```
const card = document.createElement("article");
card.className = "item skin-card";

card.innerHTML = `
  <div class="icon">${skin[1]}</div>
  <h3>${skin[0]}</h3>
  <small>${skin[3]}</small>
  <p>${owned ? "Owned • ready to equip" : "Unlock this champion"}</p>

  <footer>
    <span class="price">
      ${owned ? "✓ OWNED" : "💎 " + skin[2].toLocaleString()}
    </span>

    <button class="action" type="button">
      ${save.skin === index ? "EQUIPPED" : owned ? "EQUIP" : "UNLOCK"}
    </button>
  </footer>
`;

card.querySelector("button").addEventListener("click", () => {
  if (owned) {
    save.skin = index;
    saveGame();
    renderSkins();
    updateUI();
    return;
  }

  if (save.gems < skin[2]) {
    message("❌ NOT ENOUGH GEMS");
    return;
  }

  save.gems -= skin[2];
  save.owned.push(index);
  save.skin = index;

  saveGame();
  renderSkins();
  updateUI();
});

grid.appendChild(card);
```

});
}

/* -------------------------
MISSIONS
------------------------- */

function renderMissions() {
const grid = $("missionGrid");

if (!grid) return;

const missions = [
{
id: "runs",
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
const value = save.missions[mission.id] || 0;
const complete = value >= mission.target;

```
const card = document.createElement("article");
card.className = "item";

card.innerHTML = `
  <div class="icon">${mission.icon}</div>
  <h3>${mission.name}</h3>
  <small>MISSION</small>
  <p>
    ${mission.desc}<br>
    <b>${Math.min(value, mission.target)} / ${mission.target}</b>
  </p>

  <footer>
    <span class="price">💎 ${mission.reward.toLocaleString()}</span>
    <button class="action" type="button" disabled>
      ${complete ? "COMPLETED" : "IN PROGRESS"}
    </button>
  </footer>
`;

grid.appendChild(card);
```

});
}

/* -------------------------
WORLDS
------------------------- */

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

```
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
        : "Reach a best score of " + world[2].toLocaleString()
    }
  </p>

  <footer>
    <span class="price">
      ${unlocked ? "✓ UNLOCKED" : "🔒 LOCKED"}
    </span>

    <button class="action" type="button" ${unlocked ? "" : "disabled"}>
      ${unlocked ? "ENTER" : "LOCKED"}
    </button>
  </footer>
`;

grid.appendChild(card);
```

});
}

/* -------------------------
UPGRADES
------------------------- */

const upgradeInfo = {
speed: ["⚡", "Run Speed", "Increase movement speed", 1000],
jump: ["🪽", "Double Jump+", "Higher jumps", 1500],
shield: ["🛡️", "Shield Core", "More starting health", 2500]
};

function buyUpgrade(type) {
const info = upgradeInfo[type];
const level = save.upgrades[type] || 0;
const cost = info[3] * (level + 1);

if (save.gems < cost) {
message("❌ NOT ENOUGH GEMS");
return;
}

save.gems -= cost;
save.upgrades[type]++;

saveGame();
renderShop();
updateUI();
}

function renderShop() {
const grid = $("shopGrid");

if (!grid) return;

grid.innerHTML = "";

Object.keys(upgradeInfo).forEach(type => {
const info = upgradeInfo[type];
const level = save.upgrades[type] || 0;
const cost = info[3] * (level + 1);

```
const card = document.createElement("article");
card.className = "item";

card.innerHTML = `
  <div class="icon">${info[0]}</div>
  <h3>${info[1]}</h3>
  <small>UPGRADE LEVEL ${level}</small>
  <p>${info[2]}</p>

  <footer>
    <span class="price">💎 ${cost.toLocaleString()}</span>
    <button class="action" type="button">UPGRADE</button>
  </footer>
`;

card.querySelector("button").addEventListener("click", () => {
  buyUpgrade(type);
});

grid.appendChild(card);
```

});
}

/* -------------------------
TABS
------------------------- */

function setupTabs() {
document.querySelectorAll(".tab").forEach(button => {
button.addEventListener("click", () => {
document.querySelectorAll(".tab")
.forEach(tab => tab.classList.remove("active"));

```
  document.querySelectorAll(".panel")
    .forEach(panel => panel.classList.remove("active"));

  button.classList.add("active");

  const panel = $(button.dataset.panel);

  if (panel) {
    panel.classList.add("active");
  }
});
```

});
}

/* =========================================================
GAME
========================================================= */

let running = false;
let score = 0;
let health = 3;
let combo = 1;
let speed = 7;
let lastTime = 0;
let obstacleTimer = 0;
let gemTimer = 0;
let dashTimer = 0;
let shieldActive = false;

const ground = 430;

const player = {
x: 150,
y: ground - 70,
width: 58,
height: 70,
velocityY: 0,
jumps: 0
};

let obstacles = [];
let collectibleGems = [];

/* -------------------------
RESET
------------------------- */

function resetGame() {
score = 0;
health = 3 + save.upgrades.shield;
combo = 1;

speed = 7 + save.upgrades.speed * 0.5;

obstacleTimer = 0;
gemTimer = 0;
dashTimer = 0;
shieldActive = false;

obstacles = [];
collectibleGems = [];

player.x = 150;
player.y = ground - player.height;
player.velocityY = 0;
player.jumps = 0;

updateUI();
}

/* -------------------------
START
------------------------- */

function startGame() {
if (running) return;

console.log("DINO LEGENDS: START");

resetGame();

running = true;

save.runs++;
save.missions.runs = Math.min(1, save.missions.runs + 1);

saveGame();

const startScreen = $("startScreen");
const gameOver = $("gameOverScreen");

if (startScreen) {
startScreen.classList.add("hidden");
}

if (gameOver) {
gameOver.classList.add("hidden");
}

lastTime = performance.now();

updateUI();
renderMissions();

requestAnimationFrame(gameLoop);
}

/* -------------------------
END
------------------------- */

function endGame() {
running = false;

save.best = Math.max(save.best, Math.floor(score));

saveGame();

const finalScore = $("finalScore");

if (finalScore) {
finalScore.textContent =
Math.floor(score).toLocaleString();
}

const gameOver = $("gameOverScreen");

if (gameOver) {
gameOver.classList.remove("hidden");
}

renderWorlds();
renderMissions();
updateUI();
}

/* -------------------------
CONTROLS
------------------------- */

function jump() {
if (!running) return;

if (player.jumps < 2) {
player.velocityY =
-(15 + save.upgrades.jump * 0.7);

```
player.jumps++;

save.missions.jumps =
  Math.min(25, save.missions.jumps + 1);

saveGame();
renderMissions();
```

}
}

function dash() {
if (!running || dashTimer > 0) return;

dashTimer = 30;
score += 75;
combo = Math.min(10, combo + 1);
}

function toggleShield() {
if (!running) return;

shieldActive = !shieldActive;
}

/* -------------------------
COLLISION
------------------------- */

function collision(a, b) {
return (
a.x + 8 < b.x + b.width &&
a.x + a.width - 8 > b.x &&
a.y + 8 < b.y + b.height &&
a.y + a.height > b.y
);
}

/* -------------------------
SPAWN
------------------------- */

function spawnObjects(dt) {
obstacleTimer += dt;
gemTimer += dt;

if (obstacleTimer > 70) {
obstacles.push({
x: canvas.width + 30,
y: ground - 55,
width: 55,
height: 55
});

```
obstacleTimer = 0;
```

}

if (gemTimer > 35) {
collectibleGems.push({
x: canvas.width + 20,
y: 160 + Math.random() * 190
});

```
gemTimer = 0;
```

}
}

/* -------------------------
UPDATE
------------------------- */

function update(dt) {
score += dt * 0.22;

speed = Math.min(
18,
7 + score / 1800 + save.upgrades.speed * 0.5
);

if (dashTimer > 0) {
dashTimer -= dt;
speed += 8;
}

player.velocityY += 0.85 * dt;
player.y += player.velocityY * dt;

if (player.y >= ground - player.height) {
player.y = ground - player.height;
player.velocityY = 0;
player.jumps = 0;
}

spawnObjects(dt);

for (let i = obstacles.length - 1; i >= 0; i--) {
const obstacle = obstacles[i];

```
obstacle.x -= speed * dt;

if (collision(player, obstacle)) {
  if (shieldActive) {
    shieldActive = false;
    obstacles.splice(i, 1);
    combo = Math.min(10, combo + 1);
  } else {
    health--;
    combo = 1;
    obstacles.splice(i, 1);

    if (health <= 0) {
      endGame();
      return;
    }
  }
}

if (obstacle.x < -100) {
  obstacles.splice(i, 1);
}
```

}

for (let i = collectibleGems.length - 1; i >= 0; i--) {
const gem = collectibleGems[i];

```
gem.x -= speed * dt;

const distance = Math.hypot(
  gem.x - player.x,
  gem.y - player.y
);

if (distance < 65) {
  save.gems += 25;
  save.missions.gems =
    Math.min(100, save.missions.gems + 25);

  score += 50;
  combo = Math.min(10, combo + 1);

  collectibleGems.splice(i, 1);

  saveGame();
  renderMissions();
}

if (gem.x < -50) {
  collectibleGems.splice(i, 1);
}
```

}

updateUI();
}

/* -------------------------
PLAYER DRAW
------------------------- */

function drawPlayer() {
const x = player.x + 29;
const y = player.y + 35;

ctx.save();
ctx.translate(x, y);

/* shadow */
ctx.fillStyle = "rgba(0,0,0,.3)";
ctx.beginPath();
ctx.ellipse(0, 38, 42, 8, 0, 0, Math.PI * 2);
ctx.fill();

/* shield */
if (shieldActive) {
ctx.strokeStyle = "#62ecff";
ctx.lineWidth = 5;
ctx.shadowBlur = 25;
ctx.shadowColor = "#62ecff";

```
ctx.beginPath();
ctx.arc(0, 0, 58, 0, Math.PI * 2);
ctx.stroke();

ctx.shadowBlur = 0;
```

}

/* legs */
ctx.fillStyle = "#536b4f";

ctx.fillRect(-25, 15, 14, 30);
ctx.fillRect(11, 15, 14, 30);

/* body */
ctx.fillStyle = "#536b4f";
ctx.strokeStyle = "#111827";
ctx.lineWidth = 3;

ctx.beginPath();
ctx.roundRect(-28, -10, 56, 50, 14);
ctx.fill();
ctx.stroke();

/* armor */
ctx.fillStyle = "#62ecff";
ctx.fillRect(-22, 0, 44, 9);

/* neck */
ctx.fillStyle = "#748b68";
ctx.beginPath();
ctx.arc(20, -15, 13, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

/* head */
ctx.beginPath();
ctx.ellipse(27, -37, 26, 22, 0, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

/* snout */
ctx.beginPath();
ctx.roundRect(38, -33, 22, 14, 6);
ctx.fill();
ctx.stroke();

/* visor */
ctx.fillStyle = "#080b13";
ctx.fillRect(25, -47, 27, 10);

ctx.fillStyle = "#62ecff";
ctx.fillRect(39, -44, 8, 4);

/* eye glow */
ctx.shadowBlur = 10;
ctx.shadowColor = "#62ecff";

ctx.fillStyle = "#62ecff";
ctx.fillRect(40, -43, 6, 3);

ctx.shadowBlur = 0;

/* sword */
if (save.skin === 0) {
ctx.strokeStyle = "#cbd5e1";
ctx.lineWidth = 4;

```
ctx.beginPath();
ctx.moveTo(-30, -4);
ctx.lineTo(-50, -38);
ctx.stroke();
```

}

/* tail */
ctx.fillStyle = "#748b68";

ctx.beginPath();
ctx.moveTo(-22, 4);
ctx.quadraticCurveTo(-55, -4, -65, 13);
ctx.quadraticCurveTo(-42, 20, -18, 14);
ctx.fill();

ctx.strokeStyle = "#111827";
ctx.stroke();

ctx.restore();
}

/* -------------------------
DRAW WORLD
------------------------- */

function drawWorld() {
const gradient =
ctx.createLinearGradient(0, 0, 0, canvas.height);

gradient.addColorStop(0, "#080b24");
gradient.addColorStop(.55, "#170d30");
gradient.addColorStop(1, "#071d22");

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

/* stars */
for (let i = 0; i < 80; i++) {
const x =
((i * 173 - score * 0.05) % canvas.width + canvas.width) %
canvas.width;

```
const y = 25 + (i * 47) % 290;

ctx.fillStyle =
  i % 5 === 0 ? "#62ecff" : "#ffffff";

ctx.globalAlpha = i % 5 === 0 ? .8 : .45;
ctx.fillRect(x, y, 2, 2);
```

}

ctx.globalAlpha = 1;

/* mountains */
ctx.fillStyle = "#183b52";

for (let i = 0; i < 8; i++) {
const x =
i * 190 -
((score * .03) % 190);

```
ctx.beginPath();
ctx.moveTo(x, ground);
ctx.lineTo(x + 90, 300);
ctx.lineTo(x + 180, ground);
ctx.fill();
```

}

/* ground */
ctx.fillStyle = "#102f34";
ctx.fillRect(0, ground, canvas.width, 90);

ctx.strokeStyle = "#65f6ff";
ctx.lineWidth = 2;

ctx.beginPath();
ctx.moveTo(0, ground);
ctx.lineTo(canvas.width, ground);
ctx.stroke();

/* gems */
collectibleGems.forEach(gem => {
ctx.fillStyle = "#61eaff";
ctx.shadowBlur = 18;
ctx.shadowColor = "#61eaff";

```
ctx.beginPath();
ctx.moveTo(gem.x, gem.y - 14);
ctx.lineTo(gem.x + 12, gem.y);
ctx.lineTo(gem.x, gem.y + 14);
ctx.lineTo(gem.x - 12, gem.y);
ctx.closePath();
ctx.fill();

ctx.shadowBlur = 0;
```

});

/* obstacles */
obstacles.forEach(obstacle => {
ctx.fillStyle = "#ff4f8d";
ctx.shadowBlur = 12;
ctx.shadowColor = "#ff4f8d";

```
ctx.beginPath();
ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
ctx.lineTo(
  obstacle.x + obstacle.width / 2,
  obstacle.y
);
ctx.lineTo(
  obstacle.x + obstacle.width,
  obstacle.y + obstacle.height
);
ctx.closePath();

ctx.fill();

ctx.shadowBlur = 0;
```

});

/* dash trail */
if (dashTimer > 0) {
ctx.fillStyle = "rgba(98,236,255,.35)";

```
for (let i = 1; i < 6; i++) {
  ctx.fillRect(
    player.x - i * 25,
    player.y + 28,
    15,
    4
  );
}
```

}

drawPlayer();
}

/* -------------------------
LOOP
------------------------- */

function gameLoop(time) {
if (!running) return;

const dt = Math.min(
2,
(time - lastTime) / 16.67
);

lastTime = time;

update(dt);
drawWorld();

if (running) {
requestAnimationFrame(gameLoop);
}
}

/* =========================================================
EVENTS
========================================================= */

function setupEvents() {

/* START */
$("startButton").addEventListener("click", startGame);

/* RESTART */
$("restartButton").addEventListener("click", startGame);

/* TOUCH */
$("jumpButton").addEventListener("click", jump);
$("dashButton").addEventListener("click", dash);
$("shieldButton").addEventListener("click", toggleShield);

/* REDEEM */
$("redeemButton").addEventListener("click", redeemCode);

$("codeInput").addEventListener("keydown", event => {
if (event.key === "Enter") {
event.preventDefault();
redeemCode();
}
});

/* KEYBOARD */
document.addEventListener("keydown", event => {

```
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
```

});
}

/* =========================================================
BOOT
========================================================= */

function boot() {
console.log("DINO LEGENDS booting...");

setupEvents();
setupTabs();

renderSkins();
renderMissions();
renderWorlds();
renderShop();

updateUI();
resetGame();

drawWorld();

console.log("DINO LEGENDS READY");
}

/* Tabs */
function setupTabs() {
document.querySelectorAll(".tab").forEach(button => {
button.addEventListener("click", () => {

```
  document.querySelectorAll(".tab")
    .forEach(x => x.classList.remove("active"));

  document.querySelectorAll(".panel")
    .forEach(x => x.classList.remove("active"));

  button.classList.add("active");

  const panel = $(button.dataset.panel);

  if (panel) {
    panel.classList.add("active");
  }
});
```

});
}

/* Start */
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", boot);
} else {
boot();
}

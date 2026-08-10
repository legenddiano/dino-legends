"use strict";

/* =========================================================
DINO LEGENDS — GAME ENGINE V20
========================================================= */

const $ = id => document.getElementById(id);
const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "DINO_LEGENDS_V20";
const OLD_KEYS = ["DINO_LEGENDS_V11", "DINO_LEGENDS_V10"];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* =========================================================
SKINS
========================================================= */

const skinTemplates = [
["Arthur Rex","⚔️","LEGENDARY","#d8b56a"],
["Ghost Rex","👻","EPIC","#aab9ff"],
["Price Raptor","🎯","LEGENDARY","#4f79b8"],
["Leon Rex","🦁","EPIC","#d49a63"],
["Agent Rex","🕶️","LEGENDARY","#53647d"],
["Michael Rex","🚗","EPIC","#bd7d45"],
["CJ Rex","🏙️","LEGENDARY","#4375bb"],
["Cyber Rex","🤖","MYTHIC","#2de6ff"],
["Samurai Rex","🥷","MYTHIC","#b75dff"],
["Valkyrie Rex","🪽","MYTHIC","#dce8ff"],
["Dragon Lord","🐉","DIVINE","#ff7a32"],
["Demon Rex","😈","MYTHIC","#ff315d"],
["Ice Emperor","🧊","MYTHIC","#aeeeff"],
["Storm Emperor","⚡","MYTHIC","#5b9cff"],
["Void Emperor","🌌","DIVINE","#8e63ff"],
["Golden Titan","👑","DIVINE","#ffd75a"],
["Neon Phantom","💠","MYTHIC","#25ffff"],
["Blood Moon Rex","🌑","DIVINE","#ff315f"],
["Galaxy Rex","🌠","DIVINE","#c25cff"],
["Eternal Dragon","♾️","DIVINE","#dfffff"]
];

const iconSet = [
"🐲","🦕","🦖","🐉","👾","🤖","🦄","🌟","☄️","🪐",
"💀","🪽","🔥","❄️","⚡","🌌","👑","💎","🗿","🎭"
];

const rarityCost = {
COMMON: 0,
EPIC: 50000,
LEGENDARY: 500000,
MYTHIC: 5000000,
DIVINE: 50000000
};

const skins = skinTemplates.map((x, i) => ({
id: i,
name: x[0],
icon: x[1],
rarity: x[2],
color: x[3],
cost: i === 0 ? 0 : rarityCost[x[2]] + Math.floor(i * 37500)
}));

while (skins.length < 100) {
const i = skins.length;
const rarity =
i < 35 ? "COMMON" :
i < 60 ? "EPIC" :
i < 80 ? "LEGENDARY" :
i < 95 ? "MYTHIC" : "DIVINE";

skins.push({
id: i,
name: `${rarity} Beast ${i + 1}`,
icon: iconSet[i % iconSet.length],
rarity,
color: pick([
"#62ecff","#ff62c7","#8067ff","#ffd866",
"#67ffad","#ff6b6b","#a78bfa","#fb7185"
]),
cost: rarityCost[rarity] + Math.floor(i * 25000)
});
}

/* =========================================================
SAVE SYSTEM
========================================================= */

const defaultSave = {
version: 20,
gems: 2500,
best: 0,
skin: 0,
owned: [0],
usedCodes: [],
runs: 0,
totalGems: 2500,
totalScore: 0,
upgrades: {
speed: 0,
jump: 0,
shield: 0,
dash: 0,
magnet: 0,
combo: 0
},
missions: {},
claimedMissions: [],
settings: {
sound: true
}
};

function cloneDefault() {
return JSON.parse(JSON.stringify(defaultSave));
}

function loadSave() {
let raw = localStorage.getItem(SAVE_KEY);

if (!raw) {
for (const key of OLD_KEYS) {
const old = localStorage.getItem(key);
if (old) {
raw = old;
break;
}
}
}

let data = cloneDefault();

try {
if (raw) data = {...data, ...JSON.parse(raw)};
} catch {
data = cloneDefault();
}

data.owned = Array.isArray(data.owned) ? [...new Set(data.owned.map(Number))] : [0];
if (!data.owned.includes(0)) data.owned.unshift(0);

data.usedCodes = Array.isArray(data.usedCodes)
? [...new Set(data.usedCodes.map(x => String(x).toUpperCase()))]
: Array.isArray(data.used)
? [...new Set(data.used.map(x => String(x).toUpperCase()))]
: [];

data.upgrades = {...defaultSave.upgrades, ...(data.upgrades || {})};
data.missions = {...defaultSave.missions, ...(data.missions || {})};
data.claimedMissions = Array.isArray(data.claimedMissions)
? data.claimedMissions
: [];

data.version = 20;
return data;
}

let save = loadSave();

function persist() {
localStorage.setItem(SAVE_KEY, JSON.stringify(save));
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

function redeem() {
const input = $("codeInput");
if (!input) return;

const code = String(input.value || "")
.trim()
.replace(/\s+/g, "")
.toUpperCase();

if (!code) {
showMessage("Enter a code first.", false);
return;
}

if (save.usedCodes.includes(code)) {
showMessage("❌ This code has already been used.", false);
return;
}

const reward = REDEEM_CODES[code];

if (typeof reward !== "number") {
showMessage("❌ Invalid redeem code.", false);
return;
}

save.gems += reward;
save.totalGems += reward;
save.usedCodes.push(code);

persist();
updateUI();
input.value = "";

showMessage(
`🎉 Redeemed successfully! +${reward.toLocaleString()} gems`,
true
);
}

function showMessage(text, good = true) {
const el = $("codeMessage");
if (!el) return;

el.textContent = text;
el.classList.toggle("error", !good);
el.classList.toggle("success", good);
}

/* =========================================================
PLAYER / GAME STATE
========================================================= */

const GROUND = 430;

const player = {
x: 150,
y: GROUND - 72,
w: 60,
h: 72,
vy: 0,
jumps: 0,
invincible: 0,
dash: 0
};

let running = false;
let paused = false;
let score = 0;
let speed = 7;
let health = 3;
let combo = 1;
let comboTimer = 0;
let lastTime = 0;
let obstacleTimer = 0;
let gemTimer = 0;
let powerTimer = 0;
let worldTime = 0;

let obstacles = [];
let gems = [];
let particles = [];
let powerups = [];
let shake = 0;
let activeRarity = "ALL";

/* =========================================================
MISSIONS
========================================================= */

const missionDefinitions = [
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
},
{
id: "dash",
icon: "⚡",
name: "Speed Demon",
desc: "Use Dash 10 times",
target: 10,
reward: 15000
},
{
id: "score",
icon: "🏆",
name: "Legendary Run",
desc: "Reach 10,000 score",
target: 10000,
reward: 50000
},
{
id: "combo",
icon: "🔥",
name: "Combo Master",
desc: "Reach x10 combo",
target: 10,
reward: 100000
}
];

function missionValue(id) {
return Number(save.missions[id] || 0);
}

function missionProgress(id, value) {
save.missions[id] = Math.max(missionValue(id), value);
persist();
}

function claimMission(id) {
const m = missionDefinitions.find(x => x.id === id);
if (!m) return;

const value = missionValue(id);

if (value < m.target) return;
if (save.claimedMissions.includes(id)) return;

save.claimedMissions.push(id);
save.gems += m.reward;
save.totalGems += m.reward;

persist();
renderMissions();
updateUI();
}

function renderMissions() {
const grid = $("missionGrid");
if (!grid) return;

grid.innerHTML = "";

let completed = 0;

missionDefinitions.forEach(m => {
const value = missionValue(m.id);
const claimed = save.claimedMissions.includes(m.id);
const ready = value >= m.target;

```
if (claimed) completed++;

const percent = clamp((value / m.target) * 100, 0, 100);

const card = document.createElement("article");
card.className = `item mission-card ${ready && !claimed ? "ready" : ""}`;

card.innerHTML = `
  <div class="icon">${m.icon}</div>
  <h3>${m.name}</h3>
  <small>MISSION</small>
  <p>${m.desc}</p>

  <div class="missionProgress">
    <i style="width:${percent}%"></i>
  </div>

  <div class="missionNumbers">
    <span>${Math.min(value, m.target).toLocaleString()} / ${m.target.toLocaleString()}</span>
    <b>💎 ${m.reward.toLocaleString()}</b>
  </div>

  <footer>
    <span class="price">
      ${claimed ? "✓ CLAIMED" : ready ? "🎁 READY" : "IN PROGRESS"}
    </span>
    <button class="action" ${ready && !claimed ? "" : "disabled"}>
      ${claimed ? "CLAIMED" : ready ? "CLAIM" : "LOCKED"}
    </button>
  </footer>
`;

const button = card.querySelector("button");

if (ready && !claimed) {
  button.onclick = () => claimMission(m.id);
}

grid.appendChild(card);
```

});

const count = $("missionCount");
if (count) count.textContent = `${completed} / ${missionDefinitions.length}`;
}

/* =========================================================
LEVEL / PROFILE
========================================================= */

function getLevel() {
return Math.max(1, Math.floor(save.best / 2500) + 1);
}

function getRank() {
const l = getLevel();

if (l >= 50) return "IMMORTAL";
if (l >= 40) return "MYTHIC";
if (l >= 25) return "LEGEND";
if (l >= 15) return "ELITE";
if (l >= 5) return "HUNTER";
return "ROOKIE";
}

function getRarityName() {
return skins[save.skin]?.rarity || "COMMON";
}

/* =========================================================
UI
========================================================= */

function updateUI() {
const level = getLevel();

const values = {
gems: save.gems.toLocaleString(),
bestScore: Math.floor(save.best).toLocaleString(),
level,
score: Math.floor(score).toLocaleString(),
combo: `x${combo}`,
speedHud: speed.toFixed(1),
profileLevel: level,
profileBest: Math.floor(save.best).toLocaleString(),
profileRuns: save.runs.toLocaleString(),
statRuns: save.runs.toLocaleString(),
statGems: save.totalGems.toLocaleString(),
statSkins: save.owned.length.toLocaleString()
};

Object.entries(values).forEach(([id, value]) => {
const el = $(id);
if (el) el.textContent = value;
});

const hearts = Math.max(0, health);
const healthEl = $("health");

if (healthEl) {
healthEl.textContent =
"❤️".repeat(Math.min(8, hearts)) +
"🖤".repeat(Math.max(0, 3 - hearts));
}

const xp = save.best % 2500;
const percent = (xp / 2500) * 100;

const xpBar = $("xpBar");
if (xpBar) xpBar.style.width = `${percent}%`;

const xpText = $("xpText");
if (xpText) xpText.textContent = `${Math.floor(xp)} / 2500 XP`;

const rank = $("rank");
if (rank) rank.textContent = getRank();

const skin = skins[save.skin] || skins[0];

const avatar = $("avatar");
if (avatar) avatar.textContent = skin.icon;

const badge = $("rarityBadge");
if (badge) {
badge.textContent = skin.rarity;
badge.dataset.rarity = skin.rarity;
}

const name = $("profileName");
if (name) name.textContent = skin.name;

const skinCount = $("skinCount");
if (skinCount) skinCount.textContent = `${save.owned.length} / ${skins.length}`;

const completedMissions =
missionDefinitions.filter(m => save.claimedMissions.includes(m.id)).length;

const missionStat = $("statMissions");
if (missionStat) missionStat.textContent = completedMissions;
}

/* =========================================================
SKINS
========================================================= */

function renderSkins() {
const grid = $("skinGrid");
if (!grid) return;

grid.innerHTML = "";

skins
.filter(s => activeRarity === "ALL" || s.rarity === activeRarity)
.forEach(s => {
const owned = save.owned.includes(s.id);
const equipped = save.skin === s.id;

```
  const card = document.createElement("article");
  card.className = `item skin-card rarity-${s.rarity.toLowerCase()}`;

  card.style.setProperty("--skin-color", s.color);

  card.innerHTML = `
    <div class="skinVisual">
      <div class="skinAura"></div>
      <div class="skinCreature">${s.icon}</div>
      <span class="rarity">${s.rarity}</span>
    </div>

    <h3>${s.name}</h3>
    <small>${s.rarity} CHAMPION</small>

    <p>
      ${
        owned
          ? equipped
            ? "Currently equipped."
            : "Owned • ready to equip."
          : "Unlock this champion skin."
      }
    </p>

    <footer>
      <span class="price">
        ${owned ? "✓ OWNED" : `💎 ${s.cost.toLocaleString()}`}
      </span>

      <button class="action">
        ${equipped ? "EQUIPPED" : owned ? "EQUIP" : "UNLOCK"}
      </button>
    </footer>
  `;

  const button = card.querySelector("button");

  button.onclick = () => {
    if (equipped) return;

    if (owned) {
      save.skin = s.id;
      persist();
      renderSkins();
      updateUI();
      return;
    }

    if (save.gems < s.cost) {
      showMessage("❌ Not enough gems.", false);
      return;
    }

    save.gems -= s.cost;
    save.owned.push(s.id);
    save.skin = s.id;

    persist();
    renderSkins();
    updateUI();
  };

  grid.appendChild(card);
});
```

}

/* =========================================================
WORLDS
========================================================= */

function renderWorlds() {
const grid = $("worldGrid");
if (!grid) return;

const worlds = [
["🌲","Enchanted Forest",0,"STARTER"],
["🌙","Moonlit Ruins",2500,"LEVEL 2"],
["🔥","Dragon Volcano",10000,"LEVEL 5"],
["❄️","Frozen Kingdom",25000,"LEVEL 10"],
["🌌","Astral Void",100000,"LEVEL 20"],
["🌀","Eternal Rift",500000,"LEVEL 40"]
];

grid.innerHTML = "";

worlds.forEach(w => {
const unlocked = save.best >= w[2];

```
const card = document.createElement("article");
card.className = `item world-card ${unlocked ? "unlocked" : ""}`;

card.innerHTML = `
  <div class="icon">${w[0]}</div>
  <h3>${w[1]}</h3>
  <small>${w[3]}</small>
  <p>
    ${
      unlocked
        ? "Realm unlocked. Ready for adventure."
        : `Reach ${w[2].toLocaleString()} best score.`
    }
  </p>

  <footer>
    <span class="price">
      ${unlocked ? "✓ UNLOCKED" : "🔒 LOCKED"}
    </span>

    <button class="action" ${unlocked ? "" : "disabled"}>
      ${unlocked ? "ENTER" : "LOCKED"}
    </button>
  </footer>
`;

grid.appendChild(card);
```

});
}

/* =========================================================
UPGRADES
========================================================= */

const upgradeInfo = {
speed: {
icon: "⚡",
name: "Run Speed",
desc: "Increase your maximum movement speed.",
base: 1000
},
jump: {
icon: "🪽",
name: "Double Jump",
desc: "Increase jump power and air control.",
base: 1500
},
shield: {
icon: "🛡️",
name: "Shield Core",
desc: "Start each run with additional health.",
base: 2500
},
dash: {
icon: "💨",
name: "Dash Engine",
desc: "Increase Dash duration and power.",
base: 3500
},
magnet: {
icon: "🧲",
name: "Gem Magnet",
desc: "Increase the range used to collect gems.",
base: 4500
},
combo: {
icon: "🔥",
name: "Combo Core",
desc: "Make combo chains last longer.",
base: 6000
}
};

function upgradeCost(key) {
const level = Number(save.upgrades[key] || 0);
return upgradeInfo[key].base * (level + 1);
}

function buyUpgrade(key) {
const current = Number(save.upgrades[key] || 0);

if (current >= 10) {
showMessage("MAX LEVEL REACHED.", false);
return;
}

const cost = upgradeCost(key);

if (save.gems < cost) {
showMessage(`❌ Need ${cost.toLocaleString()} gems.`, false);
return;
}

save.gems -= cost;
save.upgrades[key] = current + 1;

persist();
renderShop();
updateUI();
}

function renderShop() {
const grid = $("shopGrid");
if (!grid) return;

grid.innerHTML = "";

Object.entries(upgradeInfo).forEach(([key, info]) => {
const level = Number(save.upgrades[key] || 0);
const maxed = level >= 10;
const cost = upgradeCost(key);

```
const card = document.createElement("article");
card.className = "item upgrade-card";

let bars = "";

for (let i = 0; i < 10; i++) {
  bars += `<i class="${i < level ? "filled" : ""}"></i>`;
}

card.innerHTML = `
  <div class="icon">${info.icon}</div>
  <h3>${info.name}</h3>
  <small>LEVEL ${level} / 10</small>
  <p>${info.desc}</p>

  <div class="upgradeBars">${bars}</div>

  <footer>
    <span class="price">
      ${maxed ? "✓ MAXED" : `💎 ${cost.toLocaleString()}`}
    </span>

    <button class="action" ${maxed ? "disabled" : ""}>
      ${maxed ? "MAX" : "UPGRADE"}
    </button>
  </footer>
`;

card.querySelector("button").onclick = () => buyUpgrade(key);
grid.appendChild(card);
```

});
}

/* =========================================================
INPUT / TABS
========================================================= */

function setupTabs() {
document.querySelectorAll(".tab").forEach(button => {
button.onclick = () => {
document.querySelectorAll(".tab")
.forEach(x => x.classList.remove("active"));

```
  document.querySelectorAll(".panel")
    .forEach(x => x.classList.remove("active"));

  button.classList.add("active");

  const panel = $(button.dataset.panel);
  if (panel) panel.classList.add("active");
};
```

});

document.querySelectorAll(".filter").forEach(button => {
button.onclick = () => {
document.querySelectorAll(".filter")
.forEach(x => x.classList.remove("active"));

```
  button.classList.add("active");
  activeRarity = button.dataset.rarity;
  renderSkins();
};
```

});
}

/* =========================================================
GAME CONTROL
========================================================= */

function resetRun() {
score = 0;
speed = 7 + save.upgrades.speed * 0.45;
health = 3 + Math.min(2, save.upgrades.shield);
combo = 1;
comboTimer = 0;

obstacleTimer = 0;
gemTimer = 0;
powerTimer = 0;

worldTime = 0;

obstacles = [];
gems = [];
particles = [];
powerups = [];

shake = 0;

player.x = 150;
player.y = GROUND - player.h;
player.vy = 0;
player.jumps = 0;
player.invincible = 0;
player.dash = 0;
}

function startGame() {
resetRun();

running = true;
paused = false;

save.runs++;
missionProgress("run", 1);

$("startScreen")?.classList.add("hidden");
$("gameOverScreen")?.classList.add("hidden");
$("pauseScreen")?.classList.add("hidden");

lastTime = performance.now();

requestAnimationFrame(gameLoop);

renderMissions();
updateUI();
}

function endGame() {
if (!running) return;

running = false;
paused = false;

const final = Math.floor(score);

save.best = Math.max(save.best, final);
save.totalScore += final;

const reward = Math.max(25, Math.floor(final / 100));

save.gems += reward;
save.totalGems += reward;

missionProgress("score", final);

persist();

$("finalScore").textContent = final.toLocaleString();
$("runReward").textContent = `+${reward.toLocaleString()} gems`;

$("gameOverScreen")?.classList.remove("hidden");

renderMissions();
renderWorlds();
renderShop();
updateUI();
}

function togglePause() {
if (!running) return;

paused = !paused;

$("pauseScreen")?.classList.toggle("hidden", !paused);

if (!paused) {
lastTime = performance.now();
requestAnimationFrame(gameLoop);
}
}

/* =========================================================
PLAYER ACTIONS
========================================================= */

function jump() {
if (!running || paused) return;

if (player.jumps < 2) {
const jumpPower = 15 + save.upgrades.jump * 0.65;

```
player.vy = -jumpPower;
player.jumps++;

missionProgress("jumps", missionValue("jumps") + 1);

spawnBurst(
  player.x + player.w / 2,
  player.y + player.h,
  "#62ecff",
  7
);
```

}
}

function dash() {
if (!running || paused || player.dash > 0) return;

player.dash = 30 + save.upgrades.dash * 4;
player.invincible = Math.max(player.invincible, 28);

score += 75;
combo = Math.min(10, combo + 1);
comboTimer = 100 + save.upgrades.combo * 10;

missionProgress("dash", missionValue("dash") + 1);

spawnBurst(
player.x,
player.y + player.h / 2,
"#ffd866",
18
);
}

function shield() {
if (!running || paused) return;

if (health <= 0) return;

player.invincible =
player.invincible > 0 ? 0 : 100 + save.upgrades.shield * 25;

spawnBurst(
player.x + player.w / 2,
player.y + player.h / 2,
"#62ecff",
12
);
}

/* =========================================================
SPAWNING
========================================================= */

function spawnObstacle() {
const type = Math.random();

if (type < 0.55) {
obstacles.push({
type: "spike",
x: 1220,
y: GROUND - 55,
w: 58,
h: 55,
damage: 1
});
} else if (type < 0.8) {
obstacles.push({
type: "wall",
x: 1220,
y: GROUND - 90,
w: 42,
h: 90,
damage: 1
});
} else {
obstacles.push({
type: "orb",
x: 1220,
y: GROUND - rand(130, 230),
w: 46,
h: 46,
damage: 1
});
}
}

function spawnGem() {
gems.push({
x: 1220,
y: rand(145, 355),
r: 12,
phase: rand(0, Math.PI * 2)
});
}

function spawnPowerup() {
const type = Math.random() < 0.5 ? "heart" : "shield";

powerups.push({
x: 1220,
y: rand(180, 340),
r: 17,
type,
phase: rand(0, Math.PI * 2)
});
}

function spawnStuff(dt) {
obstacleTimer += dt;
gemTimer += dt;
powerTimer += dt;

const difficulty = clamp(score / 12000, 0, 1);

const obstacleDelay =
Math.max(38, 74 - difficulty * 27 - save.upgrades.speed * 0.5);

if (obstacleTimer >= obstacleDelay) {
spawnObstacle();
obstacleTimer = 0;

```
if (Math.random() < 0.22 + difficulty * 0.25) {
  setTimeout(() => {
    if (running) spawnObstacle();
  }, 250);
}
```

}

if (gemTimer >= 25) {
spawnGem();
gemTimer = 0;
}

if (powerTimer >= 420) {
spawnPowerup();
powerTimer = 0;
}
}

/* =========================================================
COLLISION
========================================================= */

function collide(a, b, padding = 7) {
return (
a.x + padding < b.x + b.w &&
a.x + a.w - padding > b.x &&
a.y + padding < b.y + b.h &&
a.y + a.h - padding > b.y
);
}

/* =========================================================
GAME UPDATE
========================================================= */

function update(dt) {
worldTime += dt;

const difficulty = clamp(score / 15000, 0, 1);

speed = Math.min(
18 + save.upgrades.speed * 0.2,
7 +
score / 1700 +
save.upgrades.speed * 0.45 +
difficulty * 2
);

if (player.dash > 0) {
player.dash -= dt;
speed += 8 + save.upgrades.dash * 0.4;
}

if (player.invincible > 0) {
player.invincible -= dt;
}

player.vy += 0.82 * dt;
player.y += player.vy * dt;

if (player.y >= GROUND - player.h) {
player.y = GROUND - player.h;
player.vy = 0;
player.jumps = 0;
}

score += dt * (0.22 + speed * 0.018);

if (comboTimer > 0) {
comboTimer -= dt;
} else if (combo > 1) {
combo = Math.max(1, combo - dt * 0.025);
}

combo = clamp(combo, 1, 10);

if (combo >= 10) {
missionProgress("combo", 10);
}

spawnStuff(dt);

/* obstacles */

for (let i = obstacles.length - 1; i >= 0; i--) {
const o = obstacles[i];

```
o.x -= speed * dt;

if (collide(player, o)) {
  if (player.invincible > 0 || player.dash > 0) {
    obstacles.splice(i, 1);
    score += 100;
    combo = Math.min(10, combo + 1);
    comboTimer = 110 + save.upgrades.combo * 10;

    spawnBurst(
      o.x + o.w / 2,
      o.y + o.h / 2,
      "#ffd866",
      18
    );

    shake = 8;
  } else {
    health--;
    combo = 1;
    player.invincible = 65;

    obstacles.splice(i, 1);
    shake = 14;

    spawnBurst(
      player.x + player.w / 2,
      player.y + player.h / 2,
      "#ff4f8d",
      20
    );

    if (health <= 0) {
      endGame();
      return;
    }
  }
} else if (o.x < -100) {
  obstacles.splice(i, 1);
}
```

}

/* gems */

const magnetRange =
65 + save.upgrades.magnet * 22;

for (let i = gems.length - 1; i >= 0; i--) {
const g = gems[i];

```
g.x -= speed * dt;
g.phase += 0.08 * dt;

const dx = g.x - (player.x + player.w / 2);
const dy = g.y - (player.y + player.h / 2);

if (Math.hypot(dx, dy) < magnetRange) {
  const reward = 25 + save.upgrades.combo * 3;

  save.gems += reward;
  save.totalGems += reward;

  score += 50 * combo;

  combo = Math.min(10, combo + 0.35);
  comboTimer = 120 + save.upgrades.combo * 12;

  missionProgress(
    "gems",
    Math.min(100, missionValue("gems") + 1)
  );

  spawnBurst(g.x, g.y, "#62ecff", 10);

  gems.splice(i, 1);
} else if (g.x < -50) {
  gems.splice(i, 1);
}
```

}

/* powerups */

for (let i = powerups.length - 1; i >= 0; i--) {
const p = powerups[i];

```
p.x -= speed * dt;
p.phase += 0.07 * dt;

const box = {
  x: p.x - p.r,
  y: p.y - p.r,
  w: p.r * 2,
  h: p.r * 2
};

if (collide(player, box, 2)) {
  if (p.type === "heart") {
    health = Math.min(5, health + 1);
  } else {
    player.invincible = 180;
  }

  score += 250;
  spawnBurst(p.x, p.y, "#67ffad", 20);
  powerups.splice(i, 1);
} else if (p.x < -60) {
  powerups.splice(i, 1);
}
```

}

updateParticles();

if (shake > 0) shake -= dt;

persist();
updateUI();
}

/* =========================================================
PARTICLES
========================================================= */

function spawnBurst(x, y, color, amount = 10) {
for (let i = 0; i < amount; i++) {
particles.push({
x,
y,
vx: rand(-4, 4),
vy: rand(-5, 1),
life: rand(18, 45),
max: 45,
size: rand(2, 6),
color
});
}
}

function updateParticles() {
for (let i = particles.length - 1; i >= 0; i--) {
const p = particles[i];

```
p.x += p.vx;
p.y += p.vy;
p.vy += 0.15;
p.life--;

if (p.life <= 0) particles.splice(i, 1);
```

}
}

/* =========================================================
DRAWING
========================================================= */

function roundedRect(x, y, w, h, r) {
ctx.beginPath();
ctx.roundRect(x, y, w, h, r);
}

function drawBackground() {
const gradient = ctx.createLinearGradient(0, 0, 0, 520);

gradient.addColorStop(0, "#06081d");
gradient.addColorStop(0.45, "#180c32");
gradient.addColorStop(1, "#061d24");

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1200, 520);

/* moon */

ctx.fillStyle = "#d8f5ff22";
ctx.beginPath();
ctx.arc(970, 105, 72, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = "#d8f5ff";
ctx.shadowBlur = 25;
ctx.shadowColor = "#b7eaff";
ctx.beginPath();
ctx.arc(950, 92, 48, 0, Math.PI * 2);
ctx.fill();
ctx.shadowBlur = 0;

/* stars */

for (let i = 0; i < 90; i++) {
const x = (i * 173 - score * 0.05) % 1200;
const y = 20 + ((i * 47) % 270);

```
ctx.fillStyle =
  i % 5 === 0
    ? "#62ecffaa"
    : "#ffffff88";

ctx.fillRect(x < 0 ? x + 1200 : x, y, 2, 2);
```

}

/* mountains */

for (let i = 0; i < 10; i++) {
const x =
i * 180 -
((score * 0.025) % 180);

```
ctx.fillStyle =
  i % 2
    ? "#13294a"
    : "#10253c";

ctx.beginPath();
ctx.moveTo(x, 430);
ctx.lineTo(x + 85, 285 - (i % 3) * 30);
ctx.lineTo(x + 180, 430);
ctx.fill();
```

}

/* ground */

ctx.fillStyle = "#0d3034";
ctx.fillRect(0, GROUND, 1200, 90);

ctx.strokeStyle = "#65f6ff";
ctx.lineWidth = 2;

ctx.beginPath();
ctx.moveTo(0, GROUND);
ctx.lineTo(1200, GROUND);
ctx.stroke();

/* moving ground lights */

for (let i = 0; i < 30; i++) {
const x =
(i * 80 - score * 0.8) % 1250;

```
ctx.fillStyle = "#62ecff44";
ctx.fillRect(x < 0 ? x + 1250 : x, GROUND + 22, 28, 3);
```

}
}

function drawObstacles() {
obstacles.forEach(o => {
if (o.type === "spike") {
ctx.save();

```
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ff4f8d";
  ctx.fillStyle = "#ff4f8d";

  ctx.beginPath();
  ctx.moveTo(o.x, o.y + o.h);
  ctx.lineTo(o.x + o.w / 2, o.y);
  ctx.lineTo(o.x + o.w, o.y + o.h);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffb1d4";
  ctx.stroke();

  ctx.restore();
}

if (o.type === "wall") {
  ctx.save();

  ctx.fillStyle = "#8b4fff";
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#8b4fff";

  roundedRect(o.x, o.y, o.w, o.h, 8);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff55";
  ctx.fillRect(o.x + 8, o.y + 10, 6, o.h - 20);

  ctx.restore();
}

if (o.type === "orb") {
  ctx.save();

  ctx.fillStyle = "#ff5b9d";
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#ff5b9d";

  ctx.beginPath();
  ctx.arc(
    o.x + o.w / 2,
    o.y + o.h / 2,
    o.w / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#190919";
  ctx.beginPath();
  ctx.arc(
    o.x + o.w / 2,
    o.y + o.h / 2,
    10,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}
```

});
}

function drawCollectibles() {
gems.forEach(g => {
const pulse = 1 + Math.sin(g.phase) * 0.12;

```
ctx.save();
ctx.translate(g.x, g.y);
ctx.scale(pulse, pulse);

ctx.fillStyle = "#62eaff";
ctx.shadowBlur = 22;
ctx.shadowColor = "#62eaff";

ctx.beginPath();
ctx.moveTo(0, -15);
ctx.lineTo(13, 0);
ctx.lineTo(0, 15);
ctx.lineTo(-13, 0);
ctx.closePath();
ctx.fill();

ctx.fillStyle = "#ffffffaa";
ctx.fillRect(-2, -9, 4, 9);

ctx.restore();
```

});

powerups.forEach(p => {
const pulse = 1 + Math.sin(p.phase) * 0.1;

```
ctx.save();
ctx.translate(p.x, p.y);
ctx.scale(pulse, pulse);

ctx.fillStyle =
  p.type === "heart"
    ? "#ff5d83"
    : "#62ecff";

ctx.shadowBlur = 24;
ctx.shadowColor = ctx.fillStyle;

ctx.beginPath();
ctx.arc(0, 0, p.r, 0, Math.PI * 2);
ctx.fill();

ctx.shadowBlur = 0;
ctx.fillStyle = "#08101c";
ctx.font = "20px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(
  p.type === "heart" ? "♥" : "S",
  0,
  1
);

ctx.restore();
```

});
}

function drawParticles() {
particles.forEach(p => {
ctx.globalAlpha = p.life / p.max;
ctx.fillStyle = p.color;

```
ctx.beginPath();
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
ctx.fill();
```

});

ctx.globalAlpha = 1;
}

/* =========================================================
CHARACTER RENDER
========================================================= */

function drawCharacter(x, y) {
const skin = skins[save.skin] || skins[0];
const id = skin.id;

const accent = skin.color;
const dark = "#10131d";

ctx.save();
ctx.translate(x, y);

ctx.lineCap = "round";
ctx.lineJoin = "round";

/* aura */

if (["MYTHIC", "DIVINE"].includes(skin.rarity)) {
ctx.globalAlpha = 0.2;
ctx.strokeStyle = accent;
ctx.lineWidth = 4;
ctx.shadowBlur = 25;
ctx.shadowColor = accent;

```
ctx.beginPath();
ctx.arc(5, -15, 64, 0, Math.PI * 2);
ctx.stroke();

ctx.shadowBlur = 0;
ctx.globalAlpha = 1;
```

}

/* shadow */

ctx.fillStyle = "#00000055";
ctx.beginPath();
ctx.ellipse(0, 38, 43, 8, 0, 0, Math.PI * 2);
ctx.fill();

/* body palette */

let body = "#536b4f";
let base = "#748b68";

if (skin.rarity === "EPIC") {
body = "#3e4d65";
base = "#8498b5";
}

if (skin.rarity === "LEGENDARY") {
body = "#29354b";
base = "#6682a8";
}

if (skin.rarity === "MYTHIC") {
body = "#202343";
base = "#635cff";
}

if (skin.rarity === "DIVINE") {
body = "#332344";
base = "#c58aff";
}

/* tail */

ctx.fillStyle = base;
ctx.beginPath();
ctx.moveTo(-17, 5);
ctx.quadraticCurveTo(-48, -5, -61, 14);
ctx.quadraticCurveTo(-38, 21, -17, 15);
ctx.fill();

ctx.strokeStyle = dark;
ctx.stroke();

/* legs */

ctx.fillStyle = body;

roundedRect(-22, 18, 15, 35, 6);
ctx.fill();

roundedRect(8, 18, 15, 35, 6);
ctx.fill();

ctx.fillStyle = dark;
roundedRect(-27, 45, 25, 9, 4);
ctx.fill();

roundedRect(4, 45, 25, 9, 4);
ctx.fill();

/* torso */

ctx.fillStyle = body;
ctx.strokeStyle = dark;
ctx.lineWidth = 3;

roundedRect(-27, -8, 54, 51, 15);
ctx.fill();
ctx.stroke();

/* armor plate */

ctx.fillStyle = accent;
ctx.globalAlpha = 0.9;

roundedRect(-21, 0, 42, 12, 5);
ctx.fill();

ctx.globalAlpha = 1;

/* armor lines */

ctx.strokeStyle = "#ffffff44";
ctx.lineWidth = 2;

for (let i = -12; i <= 12; i += 12) {
ctx.beginPath();
ctx.moveTo(i, 15);
ctx.lineTo(i, 35);
ctx.stroke();
}

/* neck */

ctx.fillStyle = base;
ctx.beginPath();
ctx.arc(20, -16, 13, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = dark;
ctx.stroke();

/* head */

ctx.fillStyle = base;
ctx.beginPath();
ctx.ellipse(26, -36, 26, 23, 0, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

/* snout */

ctx.fillStyle = base;
roundedRect(39, -33, 22, 14, 6);
ctx.fill();
ctx.stroke();

/* visor */

ctx.fillStyle = "#080b13";
roundedRect(24, -47, 28, 10, 4);
ctx.fill();

ctx.fillStyle = accent;
ctx.shadowBlur = 12;
ctx.shadowColor = accent;
ctx.fillRect(40, -44, 8, 4);
ctx.shadowBlur = 0;

/* teeth */

ctx.fillStyle = "#fff";

for (let i = 0; i < 3; i++) {
ctx.fillRect(48 + i * 4, -20, 3, 6);
}

/* helmet / crown */

if (id === 0) {
ctx.fillStyle = "#d8dce5";
ctx.beginPath();
ctx.moveTo(5, -48);
ctx.lineTo(21, -66);
ctx.lineTo(47, -49);
ctx.lineTo(30, -43);
ctx.closePath();
ctx.fill();
ctx.stroke();

```
ctx.strokeStyle = accent;
ctx.lineWidth = 4;

ctx.beginPath();
ctx.moveTo(13, -59);
ctx.lineTo(49, -55);
ctx.stroke();
```

}

if (skin.rarity === "EPIC") {
ctx.strokeStyle = accent;
ctx.lineWidth = 4;

```
ctx.beginPath();
ctx.arc(26, -36, 29, Math.PI, Math.PI * 2);
ctx.stroke();
```

}

if (skin.rarity === "LEGENDARY") {
ctx.fillStyle = "#101624";
roundedRect(5, -56, 45, 13, 5);
ctx.fill();

```
ctx.strokeStyle = accent;
ctx.stroke();
```

}

if (skin.rarity === "MYTHIC") {
ctx.fillStyle = accent;

```
ctx.beginPath();
ctx.moveTo(5, -50);
ctx.lineTo(13, -70);
ctx.lineTo(24, -52);
ctx.lineTo(35, -72);
ctx.lineTo(43, -49);
ctx.closePath();
ctx.fill();

ctx.strokeStyle = "#fff8";
ctx.stroke();
```

}

if (skin.rarity === "DIVINE") {
ctx.fillStyle = "#ffd866";
ctx.strokeStyle = "#fff1a3";
ctx.lineWidth = 2;

```
ctx.beginPath();

for (let i = 0; i < 7; i++) {
  const a = -Math.PI * 0.85 + i * Math.PI * 0.28;
  ctx.lineTo(
    26 + Math.cos(a) * 29,
    -36 + Math.sin(a) * 29
  );
}

ctx.closePath();
ctx.fill();
ctx.stroke();
```

}

/* weapon */

if (id % 3 === 0) {
ctx.strokeStyle = accent;
ctx.lineWidth = 5;

```
ctx.beginPath();
ctx.moveTo(-25, -4);
ctx.lineTo(-43, -33);
ctx.stroke();

ctx.strokeStyle = "#e7edf8";
ctx.lineWidth = 2;

ctx.beginPath();
ctx.moveTo(-46, -37);
ctx.lineTo(-31, -8);
ctx.stroke();
```

} else if (id % 3 === 1) {
ctx.fillStyle = dark;
roundedRect(-44, -6, 12, 34, 4);
ctx.fillStyle = accent;
ctx.fillRect(-41, -2, 6, 18);
} else {
ctx.fillStyle = accent;
ctx.beginPath();
ctx.arc(-39, 8, 10, 0, Math.PI * 2);
ctx.fill();

```
ctx.fillStyle = dark;
ctx.beginPath();
ctx.arc(-39, 8, 5, 0, Math.PI * 2);
ctx.fill();
```

}

/* arms */

ctx.fillStyle = body;

ctx.save();
ctx.translate(-29, 5);
ctx.rotate(-0.45);
roundedRect(-6, -14, 12, 28, 6);
ctx.fill();
ctx.restore();

ctx.save();
ctx.translate(29, 5);
ctx.rotate(0.45);
roundedRect(-6, -14, 12, 28, 6);
ctx.fill();
ctx.restore();

ctx.fillStyle = accent;

ctx.beginPath();
ctx.arc(-38, 16, 6, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();
ctx.arc(38, 16, 6, 0, Math.PI * 2);
ctx.fill();

/* divine crown sparkle */

if (skin.rarity === "DIVINE") {
ctx.fillStyle = "#fff";
for (let i = 0; i < 4; i++) {
const a = worldTime * 0.03 + i * Math.PI / 2;
const sx = Math.cos(a) * 55;
const sy = -15 + Math.sin(a) * 55;

```
  ctx.fillRect(sx - 2, sy - 2, 4, 4);
}
```

}

ctx.restore();
}

/* =========================================================
DRAW PLAYER / EFFECTS
========================================================= */

function drawPlayer() {
ctx.save();

if (player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0) {
ctx.globalAlpha = 0.45;
}

if (player.invincible > 0) {
ctx.strokeStyle = "#62ecff";
ctx.lineWidth = 4;
ctx.shadowBlur = 25;
ctx.shadowColor = "#62ecff";

```
ctx.beginPath();
ctx.arc(
  player.x + 30,
  player.y + 36,
  51 + Math.sin(worldTime * 0.12) * 3,
  0,
  Math.PI * 2
);
ctx.stroke();

ctx.shadowBlur = 0;
```

}

drawCharacter(
player.x + 30,
player.y + 36
);

if (player.dash > 0) {
ctx.globalAlpha = 0.45;

```
for (let i = 1; i <= 5; i++) {
  ctx.fillStyle = "#62ecff";
  ctx.fillRect(
    player.x - i * 25,
    player.y + 28,
    15,
    4
  );
}
```

}

ctx.restore();
}

function draw() {
ctx.save();

if (shake > 0) {
ctx.translate(
rand(-shake, shake),
rand(-shake, shake)
);
}

drawBackground();
drawCollectibles();
drawObstacles();
drawPlayer();
drawParticles();

ctx.restore();

/* combo indicator */

if (combo >= 2 && running) {
ctx.save();

```
ctx.textAlign = "center";
ctx.font = "900 18px Orbitron";
ctx.fillStyle =
  combo >= 10 ? "#ffd866" :
  combo >= 6 ? "#ff62c7" :
  "#62ecff";

ctx.shadowBlur = 15;
ctx.shadowColor = ctx.fillStyle;

ctx.fillText(
  `COMBO x${Math.floor(combo)}`,
  600,
  55
);

ctx.restore();
```

}
}

/* =========================================================
LOOP
========================================================= */

function gameLoop(time) {
if (!running || paused) return;

const dt = Math.min(
2.2,
Math.max(0, (time - lastTime) / 16.67)
);

lastTime = time;

update(dt);
draw();

if (running && !paused) {
requestAnimationFrame(gameLoop);
}
}

/* =========================================================
EVENTS
========================================================= */

document.addEventListener("keydown", e => {
if (e.code === "Space" || e.code === "ArrowUp") {
e.preventDefault();
jump();
}

if (e.code === "KeyD") {
e.preventDefault();
dash();
}

if (e.code === "KeyS") {
e.preventDefault();
shield();
}

if (e.code === "KeyP" || e.code === "Escape") {
e.preventDefault();
togglePause();
}
});

$("startButton")?.addEventListener("click", startGame);
$("restartButton")?.addEventListener("click", startGame);
$("resumeButton")?.addEventListener("click", togglePause);

$("jumpButton")?.addEventListener("pointerdown", e => {
e.preventDefault();
jump();
});

$("dashButton")?.addEventListener("pointerdown", e => {
e.preventDefault();
dash();
});

$("shieldButton")?.addEventListener("pointerdown", e => {
e.preventDefault();
shield();
});

$("redeemButton")?.addEventListener("click", redeem);

$("codeInput")?.addEventListener("keydown", e => {
if (e.key === "Enter") {
e.preventDefault();
redeem();
}
});

setupTabs();
renderSkins();
renderMissions();
renderWorlds();
renderShop();
updateUI();
resetRun();
draw();

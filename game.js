"use strict";

/* ==========================================================
DINO LEGENDS - COMPLETE FANTASY GAME ENGINE
========================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* UI */
const $ = id => document.getElementById(id);

const gemsEl = $("gems");
const bestScoreEl = $("bestScore");
const levelEl = $("level");
const scoreEl = $("score");
const comboEl = $("combo");
const healthEl = $("health");
const finalScoreEl = $("finalScore");

const startScreen = $("startScreen");
const gameOverScreen = $("gameOverScreen");
const startButton = $("startButton");
const restartButton = $("restartButton");

const jumpButton = $("jumpButton");
const dashButton = $("dashButton");
const shieldButton = $("shieldButton");

const characterGrid = $("characterGrid");
const upgradeGrid = $("upgradeGrid");
const worldGrid = $("worldGrid");
const characterCountEl = $("characterCount");

const codeInput = $("codeInput");
const redeemButton = $("redeemButton");
const codeMessage = $("codeMessage");

/* SAVE */

const SAVE_KEY = "DINO_LEGENDS_FANTASY_V1";

const defaultSave = {
gems: 0,
bestScore: 0,
selectedCharacter: 0,
unlockedCharacters: [0],
selectedWorld: 0,
unlockedWorlds: [0],
upgrades: {
jump: 0,
shield: 0,
dash: 0
},
usedCodes: []
};

function clone(obj) {
return JSON.parse(JSON.stringify(obj));
}

function loadGame() {
try {
const data = JSON.parse(localStorage.getItem(SAVE_KEY));

```
    if (!data) return clone(defaultSave);

    return {
        ...clone(defaultSave),
        ...data,
        upgrades: {
            ...clone(defaultSave.upgrades),
            ...(data.upgrades || {})
        },
        unlockedCharacters: Array.isArray(data.unlockedCharacters)
            ? data.unlockedCharacters
            : [0],
        unlockedWorlds: Array.isArray(data.unlockedWorlds)
            ? data.unlockedWorlds
            : [0],
        usedCodes: Array.isArray(data.usedCodes)
            ? data.usedCodes
            : []
    };
} catch (error) {
    return clone(defaultSave);
}
```

}

let save = loadGame();

function saveGame() {
localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

/* DATA */

const characters = [
{ name: "Rex", emoji: "🦖", subtitle: "FOREST HERO", description: "The legendary balanced dinosaur.", cost: 0, color: "#58ffab" },
{ name: "Moon Rex", emoji: "🌙", subtitle: "NIGHT LEGEND", description: "A mystical dinosaur powered by moonlight.", cost: 500, color: "#b995ff" },
{ name: "Flame King", emoji: "🔥", subtitle: "FIRE MASTER", description: "Leaves a magical trail of flames.", cost: 1500, color: "#ff744d" },
{ name: "Frost Fang", emoji: "❄️", subtitle: "ICE WARRIOR", description: "A frozen legend from the crystal mountains.", cost: 5000, color: "#7feaff" },
{ name: "Volt Dragon", emoji: "⚡", subtitle: "STORM LORD", description: "Fast, bright and charged with lightning.", cost: 15000, color: "#ffe04d" },
{ name: "Candy Rex", emoji: "🍭", subtitle: "SWEET CHAOS", description: "A magical fantasy dinosaur from Candy World.", cost: 50000, color: "#ff75c8" },
{ name: "Crystal Lord", emoji: "💎", subtitle: "CRYSTAL LEGEND", description: "Created from ancient glowing crystals.", cost: 150000, color: "#64f5ff" },
{ name: "Rainbow Beast", emoji: "🌈", subtitle: "MYTHIC", description: "A rare creature carrying the colors of fantasy.", cost: 500000, color: "#ff79d5" },
{ name: "Void Hunter", emoji: "🌌", subtitle: "COSMIC", description: "A powerful traveler from another dimension.", cost: 1500000, color: "#866dff" },
{ name: "Phoenix Rex", emoji: "🪽", subtitle: "IMMORTAL FIRE", description: "Born from magical fire and ancient legends.", cost: 5000000, color: "#ff993f" },
{ name: "Galaxy Emperor", emoji: "👑", subtitle: "ULTRA LEGEND", description: "One of the most powerful skins in the universe.", cost: 25000000, color: "#d478ff" },
{ name: "Dino God", emoji: "✨", subtitle: "ULTIMATE", description: "The final legendary fantasy dinosaur.", cost: 8000000000, color: "#ffffff" }
];

const worlds = [
{ name: "MAGIC JUNGLE", className: "jungle", description: "Ancient trees and magical lights.", cost: 0, top: "#185b62", bottom: "#122a31", ground: "#1c5839" },
{ name: "CANDY KINGDOM", className: "candy", description: "A strange and beautiful sweet fantasy world.", cost: 10000, top: "#ff77c8", bottom: "#7e4dff", ground: "#9d4078" },
{ name: "SKY CASTLE", className: "sky", description: "Run through clouds above the fantasy kingdom.", cost: 100000, top: "#4bd9ff", bottom: "#9b79ff", ground: "#5264c9" },
{ name: "CRYSTAL CAVE", className: "crystal", description: "A glowing world filled with giant crystals.", cost: 1000000, top: "#431d8f", bottom: "#071d51", ground: "#281d73" },
{ name: "COSMIC DREAM", className: "cosmic", description: "The final adventure beyond the stars.", cost: 10000000, top: "#17052f", bottom: "#03030d", ground: "#16133d" }
];

const upgrades = [
{ key: "jump", emoji: "⬆️", name: "DOUBLE JUMP", description: "Higher jumps and stronger double jump." },
{ key: "shield", emoji: "🛡️", name: "MAGIC SHIELD", description: "The magical shield lasts longer." },
{ key: "dash", emoji: "⚡", name: "LIGHT DASH", description: "Dash faster and earn more score." }
];

/* GAME STATE */

let gameRunning = false;
let animationId = null;
let lastTime = 0;

let score = 0;
let combo = 1;
let health = 3;
let speed = 8;
let distance = 0;

let obstacleTimer = 0;
let gemTimer = 0;
let dashTimer = 0;
let shieldTimer = 0;
let invincibleTimer = 0;

let obstacles = [];
let gems = [];
let particles = [];
let stars = [];

const W = 1200;
const H = 500;
const groundY = 420;

const player = {
x: 150,
y: 340,
width: 64,
height: 80,
velocityY: 0,
gravity: 0.8,
jumpPower: -16,
jumps: 0,
color: "#58ffab"
};

/* UI */

function updateUI() {
gemsEl.textContent = Math.floor(save.gems).toLocaleString();
bestScoreEl.textContent = Math.floor(save.bestScore).toLocaleString();
levelEl.textContent = Math.max(1, Math.floor(save.bestScore / 1000) + 1);
scoreEl.textContent = Math.floor(score).toLocaleString();
comboEl.textContent = "x" + combo;
healthEl.textContent =
"❤️".repeat(Math.max(0, health)) +
"🖤".repeat(Math.max(0, 3 - health));

```
characterCountEl.textContent =
    save.unlockedCharacters.length + " / " + characters.length;
```

}

/* TABS */

document.querySelectorAll(".tab").forEach(tab => {
tab.addEventListener("click", () => {
document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
document.querySelectorAll(".panel").forEach(x => x.classList.remove("active-panel"));

```
    tab.classList.add("active");
    const panel = document.getElementById(tab.dataset.panel);
    if (panel) panel.classList.add("active-panel");
});
```

});

/* CHARACTERS */

function renderCharacters() {
characterGrid.innerHTML = "";

```
characters.forEach((character, index) => {
    const unlocked = save.unlockedCharacters.includes(index);
    const selected = save.selectedCharacter === index;

    const card = document.createElement("article");
    card.className = "character-card" + (selected ? " selected" : "");

    card.innerHTML = `
        <div class="card-top">
            <div class="card-emoji">${character.emoji}</div>
            <div>
                <h3 class="card-title">${character.name}</h3>
                <p class="card-subtitle">${character.subtitle}</p>
            </div>
        </div>

        <p class="card-description">${character.description}</p>

        <div class="card-footer">
            <span class="card-cost">
                ${unlocked ? "✓ OWNED" : "💎 " + character.cost.toLocaleString()}
            </span>

            <button class="card-btn ${unlocked ? "" : "locked"}" data-character="${index}">
                ${selected ? "SELECTED" : unlocked ? "SELECT" : "UNLOCK"}
            </button>
        </div>
    `;

    characterGrid.appendChild(card);
});

document.querySelectorAll("[data-character]").forEach(button => {
    button.addEventListener("click", () => {
        const index = Number(button.dataset.character);
        buyCharacter(index);
    });
});
```

}

function buyCharacter(index) {
const character = characters[index];

```
if (save.unlockedCharacters.includes(index)) {
    save.selectedCharacter = index;
    player.color = character.color;
    saveGame();
    renderCharacters();
    updateUI();
    showMessage("✨ " + character.name + " selected!", "#66ffb0");
    return;
}

if (save.gems < character.cost) {
    showMessage("❌ Not enough gems!", "#ff617d");
    return;
}

save.gems -= character.cost;
save.unlockedCharacters.push(index);
save.selectedCharacter = index;
player.color = character.color;

saveGame();
renderCharacters();
updateUI();

showMessage("🎉 LEGENDARY SKIN UNLOCKED!", "#66ffb0");
```

}

/* UPGRADES */

function getUpgradeCost(level) {
return 500 + level * 1500;
}

function renderUpgrades() {
upgradeGrid.innerHTML = "";

```
upgrades.forEach(upgrade => {
    const level = save.upgrades[upgrade.key];
    const max = level >= 5;

    const card = document.createElement("article");
    card.className = "upgrade-card";

    card.innerHTML = `
        <div class="card-top">
            <div class="card-emoji">${upgrade.emoji}</div>
            <div>
                <h3 class="card-title">${upgrade.name}</h3>
                <p class="card-subtitle">LEVEL ${level} / 5</p>
            </div>
        </div>

        <p class="card-description">${upgrade.description}</p>

        <div class="card-footer">
            <span class="card-cost">
                ${max ? "MAX LEVEL" : "💎 " + getUpgradeCost(level).toLocaleString()}
            </span>

            <button class="card-btn" data-upgrade="${upgrade.key}">
                ${max ? "MAX" : "UPGRADE"}
            </button>
        </div>
    `;

    upgradeGrid.appendChild(card);
});

document.querySelectorAll("[data-upgrade]").forEach(button => {
    button.addEventListener("click", () => upgradePlayer(button.dataset.upgrade));
});
```

}

function upgradePlayer(key) {
const level = save.upgrades[key];

```
if (level >= 5) {
    showMessage("⭐ Already MAX!", "#ffd45a");
    return;
}

const cost = getUpgradeCost(level);

if (save.gems < cost) {
    showMessage("❌ Not enough gems!", "#ff617d");
    return;
}

save.gems -= cost;
save.upgrades[key]++;

saveGame();
renderUpgrades();
updateUI();

showMessage("⚡ POWER UPGRADED!", "#66ffb0");
```

}

/* WORLDS */

function renderWorlds() {
worldGrid.innerHTML = "";

```
worlds.forEach((world, index) => {
    const unlocked = save.unlockedWorlds.includes(index);
    const selected = save.selectedWorld === index;

    const card = document.createElement("article");
    card.className = "world-card" + (selected ? " selected" : "");

    card.innerHTML = `
        <div class="world-preview ${world.className}"></div>
        <h3 class="card-title">${world.name}</h3>
        <p class="card-description">${world.description}</p>

        <div class="card-footer">
            <span class="card-cost">
                ${unlocked ? (selected ? "✓ ACTIVE" : "✓ UNLOCKED") : "💎 " + world.cost.toLocaleString()}
            </span>

            <button class="card-btn ${unlocked ? "" : "locked"}" data-world="${index}">
                ${selected ? "ACTIVE" : unlocked ? "SELECT" : "UNLOCK"}
            </button>
        </div>
    `;

    worldGrid.appendChild(card);
});

document.querySelectorAll("[data-world]").forEach(button => {
    button.addEventListener("click", () => selectWorld(Number(button.dataset.world)));
});
```

}

function selectWorld(index) {
const world = worlds[index];

```
if (save.unlockedWorlds.includes(index)) {
    save.selectedWorld = index;
    saveGame();
    renderWorlds();
    showMessage("🌎 " + world.name + " selected!", "#66ffb0");
    return;
}

if (save.gems < world.cost) {
    showMessage("❌ Not enough gems!", "#ff617d");
    return;
}

save.gems -= world.cost;
save.unlockedWorlds.push(index);
save.selectedWorld = index;

saveGame();
renderWorlds();
updateUI();

showMessage("🌟 NEW WORLD UNLOCKED!", "#66ffb0");
```

}

/* START */

function startGame() {
if (animationId) cancelAnimationFrame(animationId);

```
score = 0;
combo = 1;
health = 3;
speed = 8;
distance = 0;

obstacleTimer = 0;
gemTimer = 0;
dashTimer = 0;
shieldTimer = 0;
invincibleTimer = 0;

obstacles = [];
gems = [];
particles = [];

player.y = groundY - player.height;
player.velocityY = 0;
player.jumps = 0;
player.color = characters[save.selectedCharacter].color;

gameRunning = true;
lastTime = performance.now();

startScreen.classList.add("hidden");
gameOverScreen.classList.add("hidden");

updateUI();
animationId = requestAnimationFrame(gameLoop);
```

}

function endGame() {
gameRunning = false;
cancelAnimationFrame(animationId);

```
const final = Math.floor(score);

if (final > save.bestScore) {
    save.bestScore = final;
}

saveGame();

finalScoreEl.textContent = final.toLocaleString();
updateUI();

gameOverScreen.classList.remove("hidden");
```

}

/* LOOP */

function gameLoop(time) {
if (!gameRunning) return;

```
const delta = Math.min((time - lastTime) / 16.67, 2);
lastTime = time;

update(delta);
draw();

animationId = requestAnimationFrame(gameLoop);
```

}

function update(delta) {
distance += speed * delta;
score += 0.25 * combo * delta * (dashTimer > 0 ? 2 : 1);
speed = Math.min(20, 8 + score / 1500);

```
updatePlayer(delta);
updateTimers(delta);
spawnObjects(delta);
updateObstacles(delta);
updateGems(delta);
updateParticles(delta);

updateUI();
```

}

function updatePlayer(delta) {
player.velocityY += player.gravity * delta;
player.y += player.velocityY * delta;

```
if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumps = 0;
}
```

}

function updateTimers(delta) {
dashTimer = Math.max(0, dashTimer - delta);
shieldTimer = Math.max(0, shieldTimer - delta);
invincibleTimer = Math.max(0, invincibleTimer - delta);
}

function spawnObjects(delta) {
obstacleTimer += delta;
gemTimer += delta;

```
const obstacleInterval = Math.max(50, 110 - speed * 2);

if (obstacleTimer >= obstacleInterval) {
    spawnObstacle();
    obstacleTimer = 0;
}

if (gemTimer >= 35) {
    spawnGem();
    gemTimer = 0;
}
```

}

/* PLAYER ACTIONS */

function jump() {
if (!gameRunning) return;

```
const maxJumps = 2 + (save.upgrades.jump >= 3 ? 1 : 0);

if (player.jumps >= maxJumps) return;

player.velocityY =
    player.jumpPower -
    save.upgrades.jump * 0.8;

player.jumps++;

createParticles(player.x + 30, player.y + 70, 12, player.color);
```

}

function dash() {
if (!gameRunning || dashTimer > 0) return;

```
dashTimer = 35 + save.upgrades.dash * 10;
createParticles(player.x, player.y + 40, 20, "#ffd45a");
```

}

function shield() {
if (!gameRunning || shieldTimer > 0) return;

```
shieldTimer = 70 + save.upgrades.shield * 25;
createParticles(player.x + 30, player.y + 40, 25, "#45e9ff");
```

}

/* OBSTACLES */

function spawnObstacle() {
const types = ["mushroom", "slime", "ghost"];
const type = types[Math.floor(Math.random() * types.length)];

```
let width = 55;
let height = 55;
let y = groundY - height;

if (type === "ghost") {
    width = 52;
    height = 60;
    y = 220 + Math.random() * 100;
}

obstacles.push({
    type,
    x: W + 50,
    y,
    width,
    height,
    counted: false
});
```

}

function updateObstacles(delta) {
const multiplier = dashTimer > 0 ? 1.65 : 1;

```
for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];

    o.x -= speed * multiplier * delta;

    if (rectCollision(player, o)) {
        hitPlayer();
        obstacles.splice(i, 1);
        continue;
    }

    if (!o.counted && o.x + o.width < player.x) {
        o.counted = true;
        combo = Math.min(10, combo + 1);
        score += 30 * combo;
    }

    if (o.x + o.width < -100) {
        obstacles.splice(i, 1);
    }
}
```

}

function rectCollision(a, b) {
const p = 10;

```
return (
    a.x + p < b.x + b.width - p &&
    a.x + a.width - p > b.x + p &&
    a.y + p < b.y + b.height - p &&
    a.y + a.height - p > b.y + p
);
```

}

function hitPlayer() {
if (shieldTimer > 0 || invincibleTimer > 0) {
createParticles(player.x + 30, player.y + 40, 18, "#45e9ff");
return;
}

```
health--;
combo = 1;
invincibleTimer = 65;

createParticles(player.x + 30, player.y + 40, 25, "#ff617d");

if (health <= 0) endGame();
```

}

/* GEMS */

function spawnGem() {
gems.push({
x: W + 30,
y: 150 + Math.random() * 220,
radius: 14,
angle: 0
});
}

function updateGems(delta) {
for (let i = gems.length - 1; i >= 0; i--) {
const gem = gems[i];

```
    gem.x -= speed * delta;
    gem.angle += 0.1 * delta;

    if (circleRect(gem, player)) {
        save.gems += 10;
        score += 75 * combo;
        combo = Math.min(10, combo + 1);

        createParticles(gem.x, gem.y, 16, "#45e9ff");

        gems.splice(i, 1);
        saveGame();
        continue;
    }

    if (gem.x < -50) gems.splice(i, 1);
}
```

}

function circleRect(circle, rect) {
const x = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
const y = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

```
const dx = circle.x - x;
const dy = circle.y - y;

return dx * dx + dy * dy < circle.radius * circle.radius;
```

}

/* PARTICLES */

function createParticles(x, y, amount, color) {
for (let i = 0; i < amount; i++) {
particles.push({
x,
y,
vx: (Math.random() - 0.5) * 10,
vy: (Math.random() - 0.5) * 10,
size: 2 + Math.random() * 5,
life: 25 + Math.random() * 30,
color
});
}
}

function updateParticles(delta) {
for (let i = particles.length - 1; i >= 0; i--) {
const p = particles[i];

```
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.vy += 0.1 * delta;
    p.life -= delta;

    if (p.life <= 0) particles.splice(i, 1);
}
```

}

/* DRAW */

function draw() {
ctx.clearRect(0, 0, W, H);

```
drawSky();
drawFantasyBackground();
drawGround();
drawGems();
drawObstacles();
drawPlayer();
drawParticles();
```

}

function drawSky() {
const world = worlds[save.selectedWorld];

```
const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
gradient.addColorStop(0, world.top);
gradient.addColorStop(1, world.bottom);

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, W, groundY);

if (save.selectedWorld === 4) {
    if (stars.length === 0) {
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * groundY,
                size: 1 + Math.random() * 2
            });
        }
    }

    stars.forEach(star => {
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
} else {
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.beginPath();
    ctx.arc(1000, 100, 48, 0, Math.PI * 2);
    ctx.fill();
}
```

}

function drawFantasyBackground() {
for (let x = -((distance * 0.25) % 180); x < W + 180; x += 180) {
ctx.fillStyle = "rgba(255,255,255,.07)";
ctx.beginPath();
ctx.arc(x + 90, groundY - 100, 75, Math.PI, Math.PI * 2);
ctx.fill();
}

```
for (let x = -((distance * 0.12) % 120); x < W + 120; x += 120) {
    ctx.fillStyle = "rgba(255,255,255,.04)";
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 60, groundY - 160);
    ctx.lineTo(x + 120, groundY);
    ctx.fill();
}
```

}

function drawGround() {
const world = worlds[save.selectedWorld];

```
ctx.fillStyle = world.ground;
ctx.fillRect(0, groundY, W, H - groundY);

ctx.strokeStyle = "rgba(255,255,255,.25)";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(0, groundY);
ctx.lineTo(W, groundY);
ctx.stroke();

for (let x = -((distance * 2) % 70); x < W + 70; x += 70) {
    ctx.fillStyle = "rgba(255,255,255,.07)";
    ctx.beginPath();
    ctx.arc(x, groundY + 35, 18, 0, Math.PI * 2);
    ctx.fill();
}
```

}

function drawPlayer() {
ctx.save();

```
if (invincibleTimer > 0 && Math.floor(invincibleTimer / 5) % 2 === 0) {
    ctx.globalAlpha = 0.45;
}

if (dashTimer > 0) {
    ctx.fillStyle = "rgba(255,212,90,.3)";

    for (let i = 1; i <= 5; i++) {
        ctx.fillRect(player.x - i * 28, player.y + 25, 45, 22);
    }
}

if (shieldTimer > 0) {
    ctx.strokeStyle = "#45e9ff";
    ctx.lineWidth = 5;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#45e9ff";

    ctx.beginPath();
    ctx.arc(player.x + 32, player.y + 40, 60, 0, Math.PI * 2);
    ctx.stroke();
}

ctx.shadowBlur = 25;
ctx.shadowColor = player.color;
ctx.fillStyle = player.color;

roundRect(ctx, player.x + 8, player.y + 25, 45, 40, 15);
ctx.fill();

ctx.beginPath();
ctx.arc(player.x + 48, player.y + 23, 23, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();
ctx.moveTo(player.x + 15, player.y + 45);
ctx.lineTo(player.x - 30, player.y + 65);
ctx.lineTo(player.x + 15, player.y + 68);
ctx.fill();

ctx.fillRect(player.x + 18, player.y + 60, 10, 20);
ctx.fillRect(player.x + 40, player.y + 60, 10, 20);

ctx.shadowBlur = 0;
ctx.fillStyle = "#101020";

ctx.beginPath();
ctx.arc(player.x + 56, player.y + 16, 4, 0, Math.PI * 2);
ctx.fill();

ctx.restore();
```

}

function drawObstacles() {
obstacles.forEach(o => {
ctx.save();

```
    if (o.type === "mushroom") {
        ctx.fillStyle = "#ff5db7";
        ctx.fillRect(o.x + 20, o.y + 25, 18, 30);

        ctx.fillStyle = "#ff78d1";
        ctx.beginPath();
        ctx.arc(o.x + 29, o.y + 22, 28, Math.PI, Math.PI * 2);
        ctx.fill();
    }

    if (o.type === "slime") {
        ctx.fillStyle = "#7cff7c";
        ctx.beginPath();
        ctx.arc(o.x + 27, o.y + 30, 28, Math.PI, 0);
        ctx.lineTo(o.x + 55, o.y + 55);
        ctx.lineTo(o.x, o.y + 55);
        ctx.fill();

        ctx.fillStyle = "#101020";
        ctx.fillRect(o.x + 15, o.y + 25, 5, 5);
        ctx.fillRect(o.x + 35, o.y + 25, 5, 5);
    }

    if (o.type === "ghost") {
        ctx.fillStyle = "#d6a8ff";
        ctx.globalAlpha = 0.8;

        ctx.beginPath();
        ctx.arc(o.x + 26, o.y + 25, 25, Math.PI, 0);
        ctx.lineTo(o.x + 52, o.y + 58);
        ctx.lineTo(o.x, o.y + 58);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    ctx.restore();
});
```

}

function drawGems() {
gems.forEach(gem => {
ctx.save();
ctx.translate(gem.x, gem.y);
ctx.rotate(gem.angle);

```
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#45e9ff";
    ctx.fillStyle = "#45e9ff";

    ctx.beginPath();
    ctx.moveTo(0, -gem.radius);
    ctx.lineTo(gem.radius, 0);
    ctx.lineTo(0, gem.radius);
    ctx.lineTo(-gem.radius, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
});
```

}

function drawParticles() {
particles.forEach(p => {
ctx.save();
ctx.globalAlpha = Math.max(0, p.life / 55);
ctx.fillStyle = p.color;
ctx.fillRect(p.x, p.y, p.size, p.size);
ctx.restore();
});
}

function roundRect(context, x, y, width, height, radius) {
const r = Math.min(radius, width / 2, height / 2);

```
context.beginPath();
context.moveTo(x + r, y);
context.arcTo(x + width, y, x + width, y + height, r);
context.arcTo(x + width, y + height, x, y + height, r);
context.arcTo(x, y + height, x, y, r);
context.arcTo(x, y, x + width, y, r);
context.closePath();
```

}

/* REDEEM */

const giftCodes = {
"WELCOME1000": 1000,
"FANTASY100K": 100000,
"LEGEND1M": 1000000,
"ROYAL100M": 100000000,
"MEGA1B": 1000000000,
"ULTIMATE1T": 1000000000000
};

function redeemCode() {
const code = codeInput.value.trim().toUpperCase();

```
if (!code) {
    showMessage("Enter a code!", "#ff617d");
    return;
}

if (!(code in giftCodes)) {
    showMessage("Invalid code!", "#ff617d");
    return;
}

if (save.usedCodes.includes(code)) {
    showMessage("This code was already used!", "#ffd45a");
    return;
}

const reward = giftCodes[code];

save.gems += reward;
save.usedCodes.push(code);

saveGame();
updateUI();

codeInput.value = "";

showMessage(
    "🎉 +" + reward.toLocaleString() + " GEMS!",
    "#66ffb0"
);
```

}

redeemButton.addEventListener("click", redeemCode);

codeInput.addEventListener("keydown", event => {
if (event.key === "Enter") redeemCode();
});

/* CONTROLS */

document.addEventListener("keydown", event => {
if (["Space", "ArrowUp"].includes(event.code)) {
event.preventDefault();
jump();
}

```
if (event.code === "KeyD") dash();
if (event.code === "KeyS") shield();
```

});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

jumpButton.addEventListener("click", jump);
dashButton.addEventListener("click", dash);
shieldButton.addEventListener("click", shield);

/* MESSAGE */

let messageTimer;

function showMessage(text, color = "#66ffb0") {
codeMessage.textContent = text;
codeMessage.style.color = color;

```
clearTimeout(messageTimer);

messageTimer = setTimeout(() => {
    codeMessage.textContent = "";
}, 4000);
```

}

/* INITIALIZE */

function initialize() {
if (!save.unlockedCharacters.includes(save.selectedCharacter)) {
save.selectedCharacter = 0;
}

```
if (!save.unlockedWorlds.includes(save.selectedWorld)) {
    save.selectedWorld = 0;
}

player.color = characters[save.selectedCharacter].color;

renderCharacters();
renderUpgrades();
renderWorlds();
updateUI();
draw();
```

}

initialize();

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gemsEl = document.getElementById("gems");
const bestScoreEl = document.getElementById("bestScore");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const healthEl = document.getElementById("health");
const skinNameEl = document.getElementById("skinName");
const skinCountEl = document.getElementById("skinCount");
const finalScoreEl = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const skinGrid = document.getElementById("skinGrid");
const upgradeGrid = document.getElementById("upgradeGrid");
const worldGrid = document.getElementById("worldGrid");

const codeInput = document.getElementById("codeInput");
const redeemButton = document.getElementById("redeemButton");
const codeMessage = document.getElementById("codeMessage");

const SAVE_KEY = "DINO_LEGENDS_NIGHTMARE_V4";

const defaultSave = {
    gems: 0,
    bestScore: 0,
    selectedSkin: 0,
    unlockedSkins: [0],
    selectedWorld: 0,
    unlockedWorlds: [0],
    usedCodes: [],
    upgrades: {
        jump: 0,
        shield: 0,
        dash: 0
    }
};

function loadGame() {
    try {
        const data = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (!data) return structuredClone(defaultSave);

        return {
            ...structuredClone(defaultSave),
            ...data,
            upgrades: {
                ...defaultSave.upgrades,
                ...(data.upgrades || {})
            }
        };
    } catch {
        return structuredClone(defaultSave);
    }
}

let save = loadGame();

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

const rarityData = [
    { name: "COMMON", color: "#9aa7b8" },
    { name: "RARE", color: "#3ab7ff" },
    { name: "EPIC", color: "#a46cff" },
    { name: "LEGENDARY", color: "#ffd35a" },
    { name: "MYTHIC", color: "#ff315f" },
    { name: "ULTIMATE", color: "#55ffb1" }
];

const skinNames = [
    "Rex", "Night Hunter", "Blood Fang", "Frost Bite",
    "Shadow Claw", "Void Walker", "Cyber Terror", "Bone King",
    "Dark Flame", "Ghost Runner", "Crimson Beast", "Moon Hunter",
    "Venom Rex", "Steel Phantom", "Storm Fang", "Abyss King",
    "Neon Nightmare", "Grave Walker", "Hell Claw", "Dark Prince"
];

const skinColors = [
    "#55ffb1", "#36a3ff", "#ff315f", "#8deeff",
    "#a46cff", "#ff7a00", "#f5f5f5", "#ffdf58",
    "#ff4b2b", "#b1b7c9"
];

function getSkinCost(index) {
    if (index === 0) return 0;

    const min = 1000;
    const max = 8000000000;

    return Math.floor(
        min * Math.pow(max / min, index / 99)
    );
}

function formatNumber(number) {
    return new Intl.NumberFormat("en-US").format(number);
}

const skins = Array.from({ length: 100 }, (_, index) => {
    const rarityIndex =
        index < 20 ? 0 :
        index < 40 ? 1 :
        index < 60 ? 2 :
        index < 78 ? 3 :
        index < 92 ? 4 : 5;

    return {
        id: index,
        name:
            index === 0
                ? "REX PRIME"
                : skinNames[index % skinNames.length] + " #" + String(index).padStart(2, "0"),
        rarity: rarityData[rarityIndex].name,
        rarityColor: rarityData[rarityIndex].color,
        color: skinColors[index % skinColors.length],
        cost: getSkinCost(index),
        power: 100 + index * 4
    };
});

const worlds = [
    {
        name: "FORBIDDEN JUNGLE",
        className: "jungle",
        description: "مه سنگین، درختان مرده و شکارچیان پنهان.",
        cost: 0,
        sky1: "#091811",
        sky2: "#010604",
        ground: "#0b2117"
    },
    {
        name: "CURSED CASTLE",
        className: "castle",
        description: "قلعه‌ای که هرگز نباید واردش می‌شدی.",
        cost: 500000,
        sky1: "#160d29",
        sky2: "#020108",
        ground: "#120d20"
    },
    {
        name: "DEAD GRAVEYARD",
        className: "grave",
        description: "مه، قبرستان و سایه‌هایی که حرکت می‌کنند.",
        cost: 5000000,
        sky1: "#202934",
        sky2: "#05070a",
        ground: "#172029"
    },
    {
        name: "BLOOD VOID",
        className: "void",
        description: "دنیایی که فقط یک قانون دارد: فرار کن.",
        cost: 50000000,
        sky1: "#35030d",
        sky2: "#070003",
        ground: "#26030b"
    },
    {
        name: "HELL DIMENSION",
        className: "hell",
        description: "آخرین جهنم برای قوی‌ترین بازیکنان.",
        cost: 500000000,
        sky1: "#3c0900",
        sky2: "#070000",
        ground: "#310800"
    }
];

const upgrades = [
    {
        key: "jump",
        icon: "⬆️",
        name: "DOUBLE JUMP CORE",
        description: "قدرت پرش و پرش دوم را بهتر می‌کند."
    },
    {
        key: "dash",
        icon: "⚡",
        name: "NIGHT DASH",
        description: "سرعت و مدت Dash را افزایش می‌دهد."
    },
    {
        key: "shield",
        icon: "🛡️",
        name: "VOID SHIELD",
        description: "مدت سپر محافظ را بیشتر می‌کند."
    }
];

let gameRunning = false;
let animationId = null;
let lastTime = 0;

let score = 0;
let combo = 1;
let health = 3;
let gameSpeed = 9;
let distance = 0;

let dashTimer = 0;
let shieldTimer = 0;
let invincibleTimer = 0;

let obstacleTimer = 0;
let gemTimer = 0;
let lightningTimer = 0;
let lightningFlash = 0;

let obstacles = [];
let gems = [];
let particles = [];
let fog = [];

const groundY = 420;

const player = {
    x: 150,
    y: 330,
    width: 70,
    height: 90,
    velocityY: 0,
    gravity: 0.82,
    jumps: 0
};

function createFog() {
    fog = [];

    for (let i = 0; i < 14; i++) {
        fog.push({
            x: Math.random() * 1400,
            y: 50 + Math.random() * 320,
            size: 80 + Math.random() * 180,
            speed: 0.15 + Math.random() * 0.45,
            alpha: 0.02 + Math.random() * 0.06
        });
    }
}

function updateUI() {
    const skin = skins[save.selectedSkin];

    gemsEl.textContent = formatNumber(save.gems);
    bestScoreEl.textContent = formatNumber(save.bestScore);
    levelEl.textContent = Math.max(1, Math.floor(save.bestScore / 10000) + 1);

    scoreEl.textContent = formatNumber(Math.floor(score));
    comboEl.textContent = "x" + combo;
    healthEl.textContent =
        "❤️".repeat(Math.max(0, health)) +
        "🖤".repeat(Math.max(0, 3 - health));

    skinNameEl.textContent = skin.name;
    skinCountEl.textContent =
        save.unlockedSkins.length + " / 100";
}

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(x => x.classList.remove("active-panel"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.panel).classList.add("active-panel");
    });
});

let activeRarity = "ALL";

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(x => x.classList.remove("active-filter"));
        button.classList.add("active-filter");
        activeRarity = button.dataset.rarity;
        renderSkins();
    });
});

function renderSkins() {
    skinGrid.innerHTML = "";

    skins
        .filter(skin => activeRarity === "ALL" || skin.rarity === activeRarity)
        .forEach(skin => {
            const unlocked = save.unlockedSkins.includes(skin.id);
            const selected = save.selectedSkin === skin.id;

            const card = document.createElement("article");

            card.className =
                "skin-card" + (selected ? " selected" : "");

            card.innerHTML = `
                <div class="skin-top">
                    <div class="skin-preview" style="--skin:${skin.color}"></div>
                    <div>
                        <h3>${skin.name}</h3>
                        <p class="card-subtitle">POWER ${skin.power}</p>
                    </div>
                </div>

                <span class="rarity" style="color:${skin.rarityColor}">
                    ◆ ${skin.rarity}
                </span>

                <p class="card-description">
                    یک اسکین سینمایی و ترسناک از مجموعه NIGHTMARE LEGENDS.
                </p>

                <div class="card-footer">
                    <span class="card-cost">
                        ${unlocked ? "✓ OWNED" : "💎 " + formatNumber(skin.cost)}
                    </span>

                    <button class="card-btn ${unlocked ? "" : "locked"}"
                        data-skin="${skin.id}">
                        ${selected ? "SELECTED" : unlocked ? "SELECT" : "UNLOCK"}
                    </button>
                </div>
            `;

            skinGrid.appendChild(card);
        });

    document.querySelectorAll("[data-skin]").forEach(button => {
        button.addEventListener("click", () => {
            selectSkin(Number(button.dataset.skin));
        });
    });
}

function selectSkin(id) {
    const skin = skins[id];

    if (save.unlockedSkins.includes(id)) {
        save.selectedSkin = id;
        saveGame();
        renderSkins();
        updateUI();
        showMessage("🔥 " + skin.name + " selected!", "#55ffb1");
        return;
    }

    if (save.gems < skin.cost) {
        showMessage("💀 NOT ENOUGH GEMS!", "#ff315f");
        return;
    }

    save.gems -= skin.cost;
    save.unlockedSkins.push(id);
    save.selectedSkin = id;

    saveGame();
    renderSkins();
    updateUI();

    showMessage("🔥 LEGENDARY SKIN UNLOCKED!", "#55ffb1");
}

function renderUpgrades() {
    upgradeGrid.innerHTML = "";

    upgrades.forEach(upgrade => {
        const level = save.upgrades[upgrade.key];
        const cost = 100000 * (level + 1) * (level + 1);

        const card = document.createElement("article");
        card.className = "upgrade-card";

        card.innerHTML = `
            <div class="skin-top">
                <div class="skin-preview" style="--skin:#a46cff;display:grid;place-items:center;font-size:30px">
                    ${upgrade.icon}
                </div>
                <div>
                    <h3>${upgrade.name}</h3>
                    <p class="card-subtitle">LEVEL ${level} / 10</p>
                </div>
            </div>

            <p class="card-description">${upgrade.description}</p>

            <div class="card-footer">
                <span class="card-cost">
                    ${level >= 10 ? "MAX LEVEL" : "💎 " + formatNumber(cost)}
                </span>

                <button class="card-btn" data-upgrade="${upgrade.key}">
                    ${level >= 10 ? "MAX" : "UPGRADE"}
                </button>
            </div>
        `;

        upgradeGrid.appendChild(card);
    });

    document.querySelectorAll("[data-upgrade]").forEach(button => {
        button.addEventListener("click", () => {
            const key = button.dataset.upgrade;
            const level = save.upgrades[key];

            if (level >= 10) return;

            const cost = 100000 * (level + 1) * (level + 1);

            if (save.gems < cost) {
                showMessage("💀 NOT ENOUGH GEMS!", "#ff315f");
                return;
            }

            save.gems -= cost;
            save.upgrades[key]++;

            saveGame();
            updateUI();
            renderUpgrades();

            showMessage("⚡ POWER UPGRADED!", "#55ffb1");
        });
    });
}

function renderWorlds() {
    worldGrid.innerHTML = "";

    worlds.forEach((world, index) => {
        const unlocked = save.unlockedWorlds.includes(index);
        const selected = save.selectedWorld === index;

        const card = document.createElement("article");

        card.className =
            "world-card" + (selected ? " selected" : "");

        card.innerHTML = `
            <div class="world-preview ${world.className}"></div>

            <h3>${world.name}</h3>

            <p class="card-description">${world.description}</p>

            <div class="card-footer">
                <span class="card-cost">
                    ${unlocked ? "✓ UNLOCKED" : "💎 " + formatNumber(world.cost)}
                </span>

                <button class="card-btn ${unlocked ? "" : "locked"}"
                    data-world="${index}">
                    ${selected ? "ACTIVE" : unlocked ? "SELECT" : "UNLOCK"}
                </button>
            </div>
        `;

        worldGrid.appendChild(card);
    });

    document.querySelectorAll("[data-world]").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.world);
            const world = worlds[id];

            if (save.unlockedWorlds.includes(id)) {
                save.selectedWorld = id;
            } else {
                if (save.gems < world.cost) {
                    showMessage("💀 NOT ENOUGH GEMS!", "#ff315f");
                    return;
                }

                save.gems -= world.cost;
                save.unlockedWorlds.push(id);
                save.selectedWorld = id;
            }

            saveGame();
            updateUI();
            renderWorlds();

            showMessage("🌑 WORLD ACTIVATED!", "#55ffb1");
        });
    });
}

function startGame() {
    if (animationId) cancelAnimationFrame(animationId);

    score = 0;
    combo = 1;
    health = 3;
    gameSpeed = 9;
    distance = 0;

    dashTimer = 0;
    shieldTimer = 0;
    invincibleTimer = 0;
    obstacleTimer = 0;
    gemTimer = 0;

    obstacles = [];
    gems = [];
    particles = [];

    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumps = 0;

    gameRunning = true;
    lastTime = performance.now();

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;

    const final = Math.floor(score);

    if (final > save.bestScore) {
        save.bestScore = final;
    }

    saveGame();

    finalScoreEl.textContent = formatNumber(final);
    updateUI();

    gameOverScreen.classList.remove("hidden");
}

function gameLoop(time) {
    if (!gameRunning) return;

    const delta = Math.min((time - lastTime) / 16.67, 2);
    lastTime = time;

    update(delta);
    draw();

    animationId = requestAnimationFrame(gameLoop);
}

function update(delta) {
    distance += gameSpeed * delta;
    score += 0.28 * combo * delta * (dashTimer > 0 ? 2 : 1);

    gameSpeed = Math.min(25, 9 + score / 8000);

    player.velocityY += player.gravity * delta;
    player.y += player.velocityY * delta;

    if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.jumps = 0;
    }

    dashTimer = Math.max(0, dashTimer - delta);
    shieldTimer = Math.max(0, shieldTimer - delta);
    invincibleTimer = Math.max(0, invincibleTimer - delta);

    obstacleTimer += delta;
    gemTimer += delta;
    lightningTimer += delta;

    if (lightningTimer > 180 + Math.random() * 220) {
        lightningTimer = 0;
        lightningFlash = 10;
    }

    lightningFlash = Math.max(0, lightningFlash - delta);

    if (obstacleTimer > Math.max(40, 90 - gameSpeed * 2)) {
        spawnObstacle();
        obstacleTimer = 0;
    }

    if (gemTimer > 35) {
        spawnGem();
        gemTimer = 0;
    }

    updateObstacles(delta);
    updateGems(delta);
    updateParticles(delta);

    updateUI();
}

function spawnObstacle() {
    const types = ["shadow", "beast", "crow", "spike"];

    const type = types[Math.floor(Math.random() * types.length)];

    let width = 55;
    let height = 75;
    let y = groundY - height;

    if (type === "crow") {
        width = 70;
        height = 45;
        y = 170 + Math.random() * 140;
    }

    if (type === "spike") {
        width = 65;
        height = 45;
        y = groundY - height;
    }

    obstacles.push({
        type,
        x: 1250,
        y,
        width,
        height,
        counted: false
    });
}

function spawnGem() {
    gems.push({
        x: 1230,
        y: 130 + Math.random() * 250,
        radius: 13,
        angle: 0
    });
}

function updateObstacles(delta) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];

        o.x -= gameSpeed * (dashTimer > 0 ? 1.4 : 1) * delta;

        if (collision(player, o)) {
            hitPlayer();
            obstacles.splice(i, 1);
            continue;
        }

        if (!o.counted && o.x + o.width < player.x) {
            o.counted = true;
            combo = Math.min(20, combo + 1);
            score += 40 * combo;
        }

        if (o.x < -100) obstacles.splice(i, 1);
    }
}

function updateGems(delta) {
    for (let i = gems.length - 1; i >= 0; i--) {
        const gem = gems[i];

        gem.x -= gameSpeed * delta;
        gem.angle += .1 * delta;

        if (circleRectCollision(gem, player)) {
            const bonus = save.selectedSkin >= 90 ? 10 : 1;

            save.gems += bonus;
            score += 100 * combo;
            combo = Math.min(20, combo + 1);

            createParticles(gem.x, gem.y, 18, "#38e7ff");

            gems.splice(i, 1);
            saveGame();
            continue;
        }

        if (gem.x < -50) gems.splice(i, 1);
    }
}

function collision(a, b) {
    const p = 12;

    return (
        a.x + p < b.x + b.width - p &&
        a.x + a.width - p > b.x + p &&
        a.y + p < b.y + b.height - p &&
        a.y + a.height - p > b.y + p
    );
}

function circleRectCollision(circle, rect) {
    const x = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const y = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const dx = circle.x - x;
    const dy = circle.y - y;

    return dx * dx + dy * dy < circle.radius * circle.radius;
}

function hitPlayer() {
    if (shieldTimer > 0 || invincibleTimer > 0) {
        createParticles(
            player.x + 35,
            player.y + 45,
            20,
            shieldTimer > 0 ? "#38e7ff" : "#ffffff"
        );
        return;
    }

    health--;
    combo = 1;
    invincibleTimer = 60;

    createParticles(player.x + 35, player.y + 45, 30, "#ff315f");

    if (health <= 0) endGame();
}

function jump() {
    if (!gameRunning) return;

    const maxJumps = 2 + (save.upgrades.jump >= 7 ? 1 : 0);

    if (player.jumps >= maxJumps) return;

    player.velocityY =
        -15 -
        save.upgrades.jump * 1.1;

    player.jumps++;

    createParticles(
        player.x + 30,
        player.y + player.height,
        12,
        "#a46cff"
    );
}

function dash() {
    if (!gameRunning || dashTimer > 0) return;

    dashTimer =
        40 + save.upgrades.dash * 8;

    createParticles(
        player.x,
        player.y + 45,
        25,
        "#ffd35a"
    );
}

function activateShield() {
    if (!gameRunning || shieldTimer > 0) return;

    shieldTimer =
        80 + save.upgrades.shield * 18;

    createParticles(
        player.x + 35,
        player.y + 45,
        30,
        "#38e7ff"
    );
}

document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
    }

    if (event.code === "KeyD") dash();
    if (event.code === "KeyS") activateShield();
});

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", startGame);
document.getElementById("jumpButton").addEventListener("click", jump);
document.getElementById("dashButton").addEventListener("click", dash);
document.getElementById("shieldButton").addEventListener("click", activateShield);

function draw() {
    ctx.clearRect(0, 0, 1200, 500);

    drawSky();
    drawFog();
    drawMountains();
    drawGround();
    drawGems();
    drawObstacles();
    drawPlayer();
    drawParticles();

    if (lightningFlash > 0) {
        ctx.fillStyle = "rgba(255,255,255,.16)";
        ctx.fillRect(0, 0, 1200, 500);
    }

    ctx.fillStyle = "rgba(0,0,0,.12)";
    ctx.fillRect(0, 0, 1200, 500);
}

function drawSky() {
    const world = worlds[save.selectedWorld];

    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, world.sky1);
    gradient.addColorStop(1, world.sky2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, groundY);

    ctx.fillStyle = "rgba(255,60,90,.13)";
    ctx.beginPath();
    ctx.arc(950, 100, 65, 0, Math.PI * 2);
    ctx.fill();
}

function drawFog() {
    fog.forEach(f => {
        f.x -= f.speed;

        if (f.x < -f.size) {
            f.x = 1200 + f.size;
        }

        const gradient = ctx.createRadialGradient(
            f.x, f.y, 0,
            f.x, f.y, f.size
        );

        gradient.addColorStop(0, `rgba(210,220,240,${f.alpha})`);
        gradient.addColorStop(1, "rgba(210,220,240,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMountains() {
    ctx.fillStyle = "rgba(0,0,0,.3)";

    for (let x = -((distance * .18) % 220); x < 1400; x += 220) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 110, 170);
        ctx.lineTo(x + 220, groundY);
        ctx.fill();
    }
}

function drawGround() {
    const world = worlds[save.selectedWorld];

    ctx.fillStyle = world.ground;
    ctx.fillRect(0, groundY, 1200, 80);

    ctx.strokeStyle = "rgba(255,49,95,.25)";
    ctx.lineWidth = 2;

    for (let x = -((distance * 2) % 70); x < 1300; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, groundY + 25);
        ctx.lineTo(x + 35, groundY + 30);
        ctx.stroke();
    }
}

function drawPlayer() {
    const skin = skins[save.selectedSkin];

    ctx.save();

    if (invincibleTimer > 0 && Math.floor(invincibleTimer / 5) % 2 === 0) {
        ctx.globalAlpha = .45;
    }

    if (dashTimer > 0) {
        ctx.fillStyle = skin.color + "55";

        for (let i = 1; i < 7; i++) {
            ctx.fillRect(
                player.x - i * 30,
                player.y + 30,
                40,
                18
            );
        }
    }

    if (shieldTimer > 0) {
        ctx.strokeStyle = "#38e7ff";
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#38e7ff";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(
            player.x + 35,
            player.y + 45,
            62,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    ctx.shadowBlur = 28;
    ctx.shadowColor = skin.color;
    ctx.fillStyle = skin.color;

    ctx.beginPath();
    ctx.ellipse(
        player.x + 32,
        player.y + 50,
        27,
        33,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        player.x + 52,
        player.y + 24,
        25,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(player.x + 18, player.y + 58);
    ctx.lineTo(player.x - 32, player.y + 76);
    ctx.lineTo(player.x + 18, player.y + 72);
    ctx.fill();

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff315f";
    ctx.fillStyle = "#ff315f";

    ctx.beginPath();
    ctx.arc(player.x + 61, player.y + 17, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skin.color;
    ctx.shadowBlur = 0;

    ctx.fillRect(player.x + 18, player.y + 70, 12, 20);
    ctx.fillRect(player.x + 42, player.y + 70, 12, 20);

    ctx.restore();
}

function drawObstacles() {
    obstacles.forEach(o => {
        ctx.save();

        if (o.type === "shadow" || o.type === "beast") {
            ctx.shadowBlur = 25;
            ctx.shadowColor = "#ff315f";
            ctx.fillStyle =
                o.type === "shadow"
                    ? "#0a0812"
                    : "#35101b";

            ctx.beginPath();
            ctx.arc(o.x + o.width / 2, o.y + 25, 27, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ff315f";
            ctx.beginPath();
            ctx.arc(o.x + 20, o.y + 22, 4, 0, Math.PI * 2);
            ctx.arc(o.x + 37, o.y + 22, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (o.type === "crow") {
            ctx.fillStyle = "#08090d";

            ctx.beginPath();
            ctx.moveTo(o.x, o.y + 25);
            ctx.lineTo(o.x + 35, o.y);
            ctx.lineTo(o.x + 70, o.y + 25);
            ctx.lineTo(o.x + 35, o.y + 40);
            ctx.fill();

            ctx.fillStyle = "#ff315f";
            ctx.fillRect(o.x + 32, o.y + 18, 6, 4);
        }

        if (o.type === "spike") {
            ctx.fillStyle = "#53202b";

            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(o.x + i * 16, o.y + o.height);
                ctx.lineTo(o.x + 8 + i * 16, o.y);
                ctx.lineTo(o.x + 16 + i * 16, o.y + o.height);
                ctx.fill();
            }
        }

        ctx.restore();
    });
}

function drawGems() {
    gems.forEach(gem => {
        ctx.save();

        ctx.translate(gem.x, gem.y);
        ctx.rotate(gem.angle);

        ctx.shadowBlur = 25;
        ctx.shadowColor = "#38e7ff";
        ctx.fillStyle = "#38e7ff";

        ctx.beginPath();
        ctx.moveTo(0, -gem.radius);
        ctx.lineTo(gem.radius, 0);
        ctx.lineTo(0, gem.radius);
        ctx.lineTo(-gem.radius, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    });
}

function createParticles(x, y, amount, color) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - .5) * 10,
            vy: (Math.random() - .5) * 10,
            size: 2 + Math.random() * 5,
            life: 25 + Math.random() * 35,
            color
        });
    }
}

function updateParticles(delta) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += .08 * delta;
        p.life -= delta;

        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life / 60);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    ctx.globalAlpha = 1;
}

/* =========================
   REDEEM CODES
========================= */

const giftCodes = {
    "START1M": 1000000,
    "DARK100M": 100000000,
    "LEGEND1B": 1000000000,
    "NIGHT10B": 10000000000,
    "VOID26B": 26000000000,
    "TERROR100B": 100000000000,
    "GOD1T": 1000000000000,
    "NIGHTMARE26B": 26000000000,
    "SECRETDINO": 5000000000
};

function redeemCode() {
    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        showMessage("یک کد وارد کن.", "#ff315f");
        return;
    }

    if (!(code in giftCodes)) {
        showMessage("💀 کد نامعتبر است!", "#ff315f");
        return;
    }

    if (save.usedCodes.includes(code)) {
        showMessage("⚠️ این کد قبلاً استفاده شده است.", "#ffd35a");
        return;
    }

    const reward = giftCodes[code];

    save.gems += reward;
    save.usedCodes.push(code);

    saveGame();
    updateUI();

    codeInput.value = "";

    showMessage(
        "🎉 +" + formatNumber(reward) + " GEMS!",
        "#55ffb1"
    );
}

redeemButton.addEventListener("click", redeemCode);

codeInput.addEventListener("keydown", e => {
    if (e.key === "Enter") redeemCode();
});

let messageTimer;

function showMessage(text, color) {
    codeMessage.textContent = text;
    codeMessage.style.color = color;

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        codeMessage.textContent = "";
    }, 4000);
}

function initialize() {
    createFog();
    renderSkins();
    renderUpgrades();
    renderWorlds();
    updateUI();
    draw();
}

initialize();

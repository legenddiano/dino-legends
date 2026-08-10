"use strict";

/* =========================================================
   DINO LEGENDS — COMPLETE GAME.JS
   Works with the current index.html + style.css
========================================================= */

/* =========================
   DOM
========================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gemsEl = document.getElementById("gems");
const bestScoreEl = document.getElementById("bestScore");
const levelEl = document.getElementById("level");

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const healthEl = document.getElementById("health");

const finalScoreEl = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const jumpButton = document.getElementById("jumpButton");
const dashButton = document.getElementById("dashButton");
const shieldButton = document.getElementById("shieldButton");

const characterGrid = document.getElementById("characterGrid");
const upgradeGrid = document.getElementById("upgradeGrid");
const worldGrid = document.getElementById("worldGrid");
const characterCountEl = document.getElementById("characterCount");

const codeInput = document.getElementById("codeInput");
const redeemButton = document.getElementById("redeemButton");
const codeMessage = document.getElementById("codeMessage");


/* =========================
   CANVAS CONSTANTS
========================= */

const W = 1200;
const H = 500;
const groundY = 420;


/* =========================
   SAVE SYSTEM
========================= */

const SAVE_KEY = "DINO_LEGENDS_ULTRA_SAVE_V1";

const defaultSave = {
    gems: 0,
    bestScore: 0,
    selectedCharacter: 0,
    unlockedCharacters: [0],
    selectedWorld: 0,
    unlockedWorlds: [0],
    usedCodes: [],
    upgrades: {
        jump: 0,
        shield: 0,
        dash: 0
    }
};

function cloneDefault() {
    return JSON.parse(JSON.stringify(defaultSave));
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);

        if (!raw) {
            return cloneDefault();
        }

        const stored = JSON.parse(raw);

        return {
            ...cloneDefault(),
            ...stored,
            upgrades: {
                ...cloneDefault().upgrades,
                ...(stored.upgrades || {})
            },
            unlockedCharacters:
                Array.isArray(stored.unlockedCharacters)
                    ? stored.unlockedCharacters
                    : [0],
            unlockedWorlds:
                Array.isArray(stored.unlockedWorlds)
                    ? stored.unlockedWorlds
                    : [0],
            usedCodes:
                Array.isArray(stored.usedCodes)
                    ? stored.usedCodes
                    : []
        };

    } catch (error) {
        return cloneDefault();
    }
}

let save = loadGame();

function saveGame() {
    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(save)
    );
}


/* =========================
   CHARACTERS
========================= */

const characters = [
    {
        name: "Rex",
        subtitle: "THE ORIGINAL LEGEND",
        description: "A powerful prehistoric hunter. Balanced in every situation.",
        cost: 0,
        rarity: "COMMON",
        color: "#50f5a1",
        glow: "#50f5a1",
        body: "rex"
    },
    {
        name: "Blaze",
        subtitle: "INFERNO HUNTER",
        description: "A creature forged in fire. Faster movement and explosive energy.",
        cost: 250,
        rarity: "RARE",
        color: "#ff8a3d",
        glow: "#ff5a1f",
        body: "blaze"
    },
    {
        name: "Frost",
        subtitle: "ICE NIGHTMARE",
        description: "Frozen energy surrounds this ancient predator.",
        cost: 700,
        rarity: "EPIC",
        color: "#8eeeff",
        glow: "#2ce1ff",
        body: "frost"
    },
    {
        name: "Volt",
        subtitle: "THUNDER EMPEROR",
        description: "Lightning flows through its body with terrifying speed.",
        cost: 1500,
        rarity: "LEGENDARY",
        color: "#ffe04d",
        glow: "#ffd34d",
        body: "volt"
    },
    {
        name: "Shadow",
        subtitle: "VOID STALKER",
        description: "A dark creature from another dimension. Almost impossible to see.",
        cost: 4000,
        rarity: "MYTHIC",
        color: "#a878ff",
        glow: "#8b5cff",
        body: "shadow"
    },
    {
        name: "Phantom",
        subtitle: "THE LOST SPIRIT",
        description: "A ghostly legend that appears only in the darkest worlds.",
        cost: 12000,
        rarity: "MYTHIC",
        color: "#e8f4ff",
        glow: "#9fd7ff",
        body: "phantom"
    },
    {
        name: "Bloodfang",
        subtitle: "NIGHT PREDATOR",
        description: "An ancient hunter with terrifying crimson energy.",
        cost: 35000,
        rarity: "ANCIENT",
        color: "#ff3d5d",
        glow: "#ff1744",
        body: "blood"
    },
    {
        name: "Solar Rex",
        subtitle: "SUN DESTROYER",
        description: "The heat of a dying star powers this ultimate dinosaur.",
        cost: 100000,
        rarity: "DIVINE",
        color: "#fff2a8",
        glow: "#ffb300",
        body: "solar"
    },
    {
        name: "Void King",
        subtitle: "RULER OF NOTHING",
        description: "A cosmic king hidden beyond time and space.",
        cost: 500000,
        rarity: "DIVINE",
        color: "#c88cff",
        glow: "#a000ff",
        body: "void"
    },
    {
        name: "Dino God",
        subtitle: "THE FINAL LEGEND",
        description: "The most powerful skin in Dino Legends.",
        cost: 8000000000,
        rarity: "ULTIMATE",
        color: "#ffffff",
        glow: "#00e5ff",
        body: "god"
    }
];


/* =========================
   WORLDS
========================= */

const worlds = [
    {
        name: "JURASSIC JUNGLE",
        className: "jungle",
        description: "Ancient forests hide creatures in the darkness.",
        cost: 0,
        skyTop: "#081b25",
        skyBottom: "#102f2b",
        ground: "#142f25",
        fog: "#3ccf8a"
    },
    {
        name: "GOLDEN DESERT",
        className: "desert",
        description: "An endless desert under a burning and mysterious sky.",
        cost: 500,
        skyTop: "#40230b",
        skyBottom: "#9a5415",
        ground: "#593515",
        fog: "#ffb347"
    },
    {
        name: "FROZEN ERA",
        className: "ice",
        description: "Frozen ruins and an endless winter nightmare.",
        cost: 1200,
        skyTop: "#071c2d",
        skyBottom: "#28677f",
        ground: "#19495d",
        fog: "#b8f5ff"
    },
    {
        name: "VOLCANO CORE",
        className: "volcano",
        description: "Run while fire consumes the ancient world.",
        cost: 2500,
        skyTop: "#160205",
        skyBottom: "#5c1014",
        ground: "#401014",
        fog: "#ff3d30"
    },
    {
        name: "COSMIC VOID",
        className: "space",
        description: "A terrifying dimension where the laws of reality are broken.",
        cost: 5000,
        skyTop: "#03020c",
        skyBottom: "#180b38",
        ground: "#100d28",
        fog: "#8b5cff"
    }
];


/* =========================
   UPGRADES
========================= */

const upgrades = [
    {
        key: "jump",
        icon: "⬆️",
        name: "SUPER JUMP",
        description: "Jump higher and improve your double jump."
    },
    {
        key: "shield",
        icon: "🛡️",
        name: "SHIELD CORE",
        description: "Increase the duration of your energy shield."
    },
    {
        key: "dash",
        icon: "⚡",
        name: "DASH ENGINE",
        description: "Make your dash faster and longer."
    }
];

function getUpgradeCost(level) {
    return Math.floor(200 * Math.pow(2, level));
}


/* =========================
   GAME STATE
========================= */

let gameRunning = false;
let animationId = null;
let lastTime = 0;

let score = 0;
let combo = 1;
let health = 3;
let distance = 0;
let gameSpeed = 8;

let obstacleTimer = 0;
let gemTimer = 0;
let enemyTimer = 0;

let dashTimer = 0;
let shieldTimer = 0;
let invincibleTimer = 0;

let shakeTimer = 0;
let flashTimer = 0;

let obstacles = [];
let collectibles = [];
let particles = [];
let clouds = [];
let stars = [];
let backgroundTrees = [];

const player = {
    x: 150,
    y: groundY - 82,
    width: 70,
    height: 82,

    velocityY: 0,

    gravity: 0.78,
    jumpPower: -15.5,

    grounded: true,
    jumpCount: 0,

    runFrame: 0,
    color: "#50f5a1"
};


/* =========================
   BACKGROUND
========================= */

function createBackground() {

    clouds = [];
    stars = [];
    backgroundTrees = [];

    for (let i = 0; i < 10; i++) {
        clouds.push({
            x: Math.random() * W,
            y: 20 + Math.random() * 180,
            size: 30 + Math.random() * 70,
            speed: 0.15 + Math.random() * 0.5
        });
    }

    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * 350,
            size: 1 + Math.random() * 2.5,
            alpha: 0.2 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < 22; i++) {
        backgroundTrees.push({
            x: i * 90 + Math.random() * 60,
            height: 70 + Math.random() * 170,
            width: 20 + Math.random() * 30
        });
    }
}


/* =========================
   UI
========================= */

function updateUI() {

    gemsEl.textContent = formatNumber(save.gems);
    bestScoreEl.textContent = formatNumber(save.bestScore);

    const level =
        Math.max(
            1,
            Math.floor(Math.sqrt(save.bestScore / 250)) + 1
        );

    levelEl.textContent = level;

    scoreEl.textContent = formatNumber(Math.floor(score));
    comboEl.textContent = "x" + combo;

    healthEl.textContent =
        "❤️".repeat(Math.max(0, health)) +
        "🖤".repeat(Math.max(0, 3 - health));

    characterCountEl.textContent =
        save.unlockedCharacters.length +
        " / " +
        characters.length;
}

function formatNumber(value) {

    if (value >= 1e12) {
        return (value / 1e12).toFixed(1) + "T";
    }

    if (value >= 1e9) {
        return (value / 1e9).toFixed(1) + "B";
    }

    if (value >= 1e6) {
        return (value / 1e6).toFixed(1) + "M";
    }

    if (value >= 1e3) {
        return Math.floor(value / 1e3) + "K";
    }

    return Math.floor(value).toString();
}


/* =========================
   TABS
========================= */

document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", () => {

        const target = tab.dataset.panel;

        document.querySelectorAll(".tab")
            .forEach(item => item.classList.remove("active"));

        document.querySelectorAll(".panel")
            .forEach(item => item.classList.remove("active-panel"));

        tab.classList.add("active");

        const panel = document.getElementById(target);

        if (panel) {
            panel.classList.add("active-panel");
        }
    });
});


/* =========================
   CHARACTERS RENDER
========================= */

function renderCharacters() {

    characterGrid.innerHTML = "";

    characters.forEach((character, index) => {

        const unlocked =
            save.unlockedCharacters.includes(index);

        const selected =
            save.selectedCharacter === index;

        const card = document.createElement("article");

        card.className =
            "character-card" +
            (selected ? " selected" : "");

        card.innerHTML = `
            <div class="card-top">
                <div class="card-emoji" style="
                    color:${character.color};
                    box-shadow:0 0 25px ${character.glow}55;
                ">🦖</div>

                <div>
                    <h3 class="card-title">${character.name}</h3>
                    <p class="card-subtitle">${character.subtitle}</p>
                    <p class="card-subtitle" style="color:${character.color}">
                        ${character.rarity}
                    </p>
                </div>
            </div>

            <p class="card-description">
                ${character.description}
            </p>

            <div class="card-footer">
                <span class="card-cost">
                    ${
                        unlocked
                            ? "✓ OWNED"
                            : "💎 " + formatNumber(character.cost)
                    }
                </span>

                <button
                    type="button"
                    class="card-btn ${unlocked ? "" : "locked"}"
                    data-character="${index}">
                    ${
                        selected
                            ? "SELECTED"
                            : unlocked
                                ? "SELECT"
                                : "UNLOCK"
                    }
                </button>
            </div>
        `;

        characterGrid.appendChild(card);
    });

    document.querySelectorAll("[data-character]")
        .forEach(button => {

            button.addEventListener("click", () => {
                selectOrUnlockCharacter(
                    Number(button.dataset.character)
                );
            });
        });
}

function selectOrUnlockCharacter(index) {

    const character = characters[index];

    if (save.unlockedCharacters.includes(index)) {

        save.selectedCharacter = index;
        player.color = character.color;

        saveGame();
        renderCharacters();
        updateUI();

        showMessage(
            character.name + " selected!",
            character.color
        );

        return;
    }

    if (save.gems < character.cost) {

        showMessage(
            "Not enough gems!",
            "#ff5571"
        );

        return;
    }

    save.gems -= character.cost;

    save.unlockedCharacters.push(index);
    save.selectedCharacter = index;
    player.color = character.color;

    saveGame();

    renderCharacters();
    updateUI();

    showMessage(
        "🔥 " + character.name + " unlocked!",
        character.color
    );
}


/* =========================
   UPGRADES RENDER
========================= */

function renderUpgrades() {

    upgradeGrid.innerHTML = "";

    upgrades.forEach(upgrade => {

        const level = save.upgrades[upgrade.key];
        const cost = getUpgradeCost(level);

        const card = document.createElement("article");

        card.className = "upgrade-card";

        card.innerHTML = `
            <div class="card-top">

                <div class="card-emoji">
                    ${upgrade.icon}
                </div>

                <div>
                    <h3 class="card-title">
                        ${upgrade.name}
                    </h3>

                    <p class="card-subtitle">
                        LEVEL ${level} / 5
                    </p>
                </div>

            </div>

            <p class="card-description">
                ${upgrade.description}
            </p>

            <div class="card-footer">

                <span class="card-cost">
                    ${
                        level >= 5
                            ? "MAX LEVEL"
                            : "💎 " + formatNumber(cost)
                    }
                </span>

                <button
                    type="button"
                    class="card-btn"
                    data-upgrade="${upgrade.key}"
                    ${level >= 5 ? "disabled" : ""}>

                    ${
                        level >= 5
                            ? "MAX"
                            : "UPGRADE"
                    }
                </button>

            </div>
        `;

        upgradeGrid.appendChild(card);
    });

    document.querySelectorAll("[data-upgrade]")
        .forEach(button => {

            button.addEventListener("click", () => {

                upgradePlayer(
                    button.dataset.upgrade
                );
            });
        });
}

function upgradePlayer(key) {

    const current = save.upgrades[key];

    if (current >= 5) {
        return;
    }

    const cost = getUpgradeCost(current);

    if (save.gems < cost) {

        showMessage(
            "Not enough gems!",
            "#ff5571"
        );

        return;
    }

    save.gems -= cost;
    save.upgrades[key]++;

    saveGame();

    renderUpgrades();
    updateUI();

    showMessage(
        "⚡ Upgrade complete!",
        "#50f5a1"
    );
}


/* =========================
   WORLDS RENDER
========================= */

function renderWorlds() {

    worldGrid.innerHTML = "";

    worlds.forEach((world, index) => {

        const unlocked =
            save.unlockedWorlds.includes(index);

        const selected =
            save.selectedWorld === index;

        const card = document.createElement("article");

        card.className =
            "world-card" +
            (selected ? " selected" : "");

        card.innerHTML = `
            <div class="world-preview ${world.className}"></div>

            <h3 class="card-title">
                ${world.name}
            </h3>

            <p class="card-description">
                ${world.description}
            </p>

            <div class="card-footer">

                <span class="card-cost">
                    ${
                        unlocked
                            ? selected
                                ? "✓ ACTIVE"
                                : "✓ UNLOCKED"
                            : "💎 " + formatNumber(world.cost)
                    }
                </span>

                <button
                    type="button"
                    class="card-btn ${unlocked ? "" : "locked"}"
                    data-world="${index}">

                    ${
                        selected
                            ? "ACTIVE"
                            : unlocked
                                ? "SELECT"
                                : "UNLOCK"
                    }
                </button>

            </div>
        `;

        worldGrid.appendChild(card);
    });

    document.querySelectorAll("[data-world]")
        .forEach(button => {

            button.addEventListener("click", () => {

                selectOrUnlockWorld(
                    Number(button.dataset.world)
                );
            });
        });
}

function selectOrUnlockWorld(index) {

    const world = worlds[index];

    if (save.unlockedWorlds.includes(index)) {

        save.selectedWorld = index;

        saveGame();
        renderWorlds();

        showMessage(
            world.name + " selected!",
            "#50f5a1"
        );

        return;
    }

    if (save.gems < world.cost) {

        showMessage(
            "Not enough gems!",
            "#ff5571"
        );

        return;
    }

    save.gems -= world.cost;
    save.unlockedWorlds.push(index);
    save.selectedWorld = index;

    saveGame();

    renderWorlds();
    updateUI();

    showMessage(
        "🌎 World unlocked!",
        "#50f5a1"
    );
}


/* =========================
   START GAME
========================= */

function startGame() {

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    score = 0;
    combo = 1;
    health = 3;
    distance = 0;
    gameSpeed = 8;

    obstacleTimer = 0;
    gemTimer = 0;
    enemyTimer = 0;

    dashTimer = 0;
    shieldTimer = 0;
    invincibleTimer = 0;

    shakeTimer = 0;
    flashTimer = 0;

    obstacles = [];
    collectibles = [];
    particles = [];

    player.y = groundY - player.height;
    player.velocityY = 0;
    player.grounded = true;
    player.jumpCount = 0;

    player.color =
        characters[save.selectedCharacter].color;

    gameRunning = true;

    lastTime = performance.now();

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    updateUI();

    animationId =
        requestAnimationFrame(gameLoop);
}

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    const finalScore = Math.floor(score);

    if (finalScore > save.bestScore) {
        save.bestScore = finalScore;
    }

    const reward =
        Math.max(
            10,
            Math.floor(finalScore / 20)
        );

    save.gems += reward;

    saveGame();

    finalScoreEl.textContent =
        formatNumber(finalScore);

    updateUI();

    gameOverScreen.classList.remove("hidden");

    showMessage(
        "You earned 💎 " + formatNumber(reward),
        "#ffd34d"
    );
}


/* =========================
   GAME LOOP
========================= */

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }

    const delta =
        Math.min(
            (timestamp - lastTime) / 16.6667,
            2
        );

    lastTime = timestamp;

    update(delta);
    draw();

    animationId =
        requestAnimationFrame(gameLoop);
}


/* =========================
   UPDATE
========================= */

function update(delta) {

    distance += gameSpeed * delta;

    score +=
        0.22 *
        combo *
        delta *
        (dashTimer > 0 ? 2 : 1);

    gameSpeed =
        Math.min(
            22,
            8 + score / 1200
        );

    updatePlayer(delta);
    updateTimers(delta);
    spawnObjects(delta);
    updateObstacles(delta);
    updateCollectibles(delta);
    updateParticles(delta);

    player.runFrame +=
        delta * (dashTimer > 0 ? 0.35 : 0.18);

    updateUI();
}

function updatePlayer(delta) {

    player.velocityY +=
        player.gravity * delta;

    player.y +=
        player.velocityY * delta;

    if (
        player.y >=
        groundY - player.height
    ) {

        player.y =
            groundY - player.height;

        player.velocityY = 0;
        player.grounded = true;
        player.jumpCount = 0;
    }
}

function updateTimers(delta) {

    if (dashTimer > 0) {
        dashTimer -= delta;
    }

    if (shieldTimer > 0) {
        shieldTimer -= delta;
    }

    if (invincibleTimer > 0) {
        invincibleTimer -= delta;
    }

    if (shakeTimer > 0) {
        shakeTimer -= delta;
    }

    if (flashTimer > 0) {
        flashTimer -= delta;
    }
}


/* =========================
   SPAWN
========================= */

function spawnObjects(delta) {

    obstacleTimer += delta;
    gemTimer += delta;
    enemyTimer += delta;

    const obstacleInterval =
        Math.max(
            38,
            105 - gameSpeed * 2.5
        );

    if (obstacleTimer >= obstacleInterval) {

        spawnObstacle();

        obstacleTimer = 0;
    }

    if (gemTimer >= 32) {

        spawnGem();

        gemTimer = 0;
    }

    if (
        score > 500 &&
        enemyTimer >= 180
    ) {

        spawnEnemy();

        enemyTimer = 0;
    }
}


/* =========================
   OBSTACLES
========================= */

function spawnObstacle() {

    const world =
        save.selectedWorld;

    const types = [
        "rock",
        "spikes",
        "skull",
        "tree"
    ];

    if (world === 1) {
        types.push("cactus");
    }

    if (world === 2) {
        types.push("ice");
    }

    if (world === 3) {
        types.push("fire");
    }

    const type =
        types[
            Math.floor(
                Math.random() * types.length
            )
        ];

    let width =
        40 + Math.random() * 35;

    let height =
        35 + Math.random() * 50;

    obstacles.push({
        type,
        x: W + 80,
        y: groundY - height,
        width,
        height,
        counted: false
    });
}

function spawnEnemy() {

    obstacles.push({
        type: "enemy",
        x: W + 100,
        y: groundY - 170 - Math.random() * 100,
        width: 65,
        height: 55,
        counted: false,
        enemy: true
    });
}

function updateObstacles(delta) {

    const speed =
        gameSpeed *
        (dashTimer > 0 ? 1.65 : 1);

    for (
        let i = obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle = obstacles[i];

        obstacle.x -= speed * delta;

        if (
            checkCollision(
                player,
                obstacle
            )
        ) {

            hitPlayer();

            obstacles.splice(i, 1);

            continue;
        }

        if (
            !obstacle.counted &&
            obstacle.x + obstacle.width <
            player.x
        ) {

            obstacle.counted = true;

            combo =
                Math.min(20, combo + 1);

            score +=
                20 * combo;
        }

        if (
            obstacle.x + obstacle.width < -100
        ) {

            obstacles.splice(i, 1);
        }
    }
}


/* =========================
   GEMS
========================= */

function spawnGem() {

    const count =
        Math.random() > 0.7 ? 3 : 1;

    const baseY =
        groundY -
        90 -
        Math.random() * 170;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        collectibles.push({
            x: W + 40 + i * 45,
            y:
                baseY -
                Math.sin(i * 1.4) * 35,
            radius: 13,
            angle: Math.random() * Math.PI
        });
    }
}

function updateCollectibles(delta) {

    for (
        let i = collectibles.length - 1;
        i >= 0;
        i--
    ) {

        const gem = collectibles[i];

        gem.x -=
            gameSpeed *
            (dashTimer > 0 ? 1.4 : 1) *
            delta;

        gem.angle +=
            0.14 * delta;

        if (
            circleRectCollision(
                gem,
                player
            )
        ) {

            const bonus =
                dashTimer > 0 ? 2 : 1;

            save.gems += bonus;

            score +=
                50 *
                combo *
                bonus;

            combo =
                Math.min(
                    20,
                    combo + 1
                );

            createParticles(
                gem.x,
                gem.y,
                20,
                "#2ce1ff"
            );

            collectibles.splice(i, 1);

            saveGame();

            continue;
        }

        if (gem.x < -60) {
            collectibles.splice(i, 1);
        }
    }
}


/* =========================
   COLLISION
========================= */

function checkCollision(a, b) {

    const padding = 12;

    return (
        a.x + padding <
            b.x + b.width - padding &&

        a.x + a.width - padding >
            b.x + padding &&

        a.y + padding <
            b.y + b.height - padding &&

        a.y + a.height - padding >
            b.y + padding
    );
}

function circleRectCollision(circle, rect) {

    const closestX =
        Math.max(
            rect.x,
            Math.min(
                circle.x,
                rect.x + rect.width
            )
        );

    const closestY =
        Math.max(
            rect.y,
            Math.min(
                circle.y,
                rect.y + rect.height
            )
        );

    const dx =
        circle.x - closestX;

    const dy =
        circle.y - closestY;

    return (
        dx * dx +
        dy * dy <
        circle.radius *
        circle.radius
    );
}

function hitPlayer() {

    if (
        shieldTimer > 0 ||
        invincibleTimer > 0
    ) {

        createParticles(
            player.x + 35,
            player.y + 40,
            20,
            shieldTimer > 0
                ? "#2ce1ff"
                : "#ffffff"
        );

        return;
    }

    health--;

    combo = 1;

    invincibleTimer = 80;

    shakeTimer = 15;
    flashTimer = 8;

    createParticles(
        player.x + 35,
        player.y + 40,
        35,
        "#ff304f"
    );

    if (health <= 0) {
        endGame();
    }
}


/* =========================
   CONTROLS
========================= */

function jump() {

    if (!gameRunning) {
        return;
    }

    const maxJumps =
        2 +
        Math.floor(
            save.upgrades.jump / 3
        );

    if (
        player.jumpCount >= maxJumps
    ) {
        return;
    }

    const jumpBonus =
        save.upgrades.jump * 1.15;

    player.velocityY =
        player.jumpPower -
        jumpBonus;

    player.grounded = false;

    player.jumpCount++;

    createParticles(
        player.x + 25,
        player.y + player.height,
        12,
        player.jumpCount === 1
            ? "#dcecff"
            : "#ffd34d"
    );
}

function dash() {

    if (!gameRunning) {
        return;
    }

    if (dashTimer > 0) {
        return;
    }

    dashTimer =
        38 +
        save.upgrades.dash * 12;

    createParticles(
        player.x,
        player.y + 45,
        28,
        "#ffd34d"
    );
}

function activateShield() {

    if (!gameRunning) {
        return;
    }

    if (shieldTimer > 0) {
        return;
    }

    shieldTimer =
        95 +
        save.upgrades.shield * 25;

    createParticles(
        player.x + 35,
        player.y + 40,
        30,
        "#2ce1ff"
    );
}


/* Keyboard */

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
            dash();
        }

        if (event.code === "KeyS") {
            activateShield();
        }

        if (
            event.code === "Enter" &&
            !gameRunning
        ) {
            startGame();
        }
    }
);


/* Mobile controls */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);

jumpButton.addEventListener(
    "click",
    jump
);

dashButton.addEventListener(
    "click",
    dash
);

shieldButton.addEventListener(
    "click",
    activateShield
);


/* =========================
   DRAW
========================= */

function draw() {

    ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const sx =
        canvas.width / W;

    const sy =
        canvas.height / H;

    ctx.scale(sx, sy);

    ctx.save();

    if (shakeTimer > 0) {

        ctx.translate(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 8
        );
    }

    drawSky();
    drawAtmosphere();
    drawBackground();
    drawGround();

    drawCollectibles();
    drawObstacles();
    drawPlayer();
    drawParticles();

    ctx.restore();

    if (flashTimer > 0) {

        ctx.fillStyle =
            "rgba(255,40,60,0.12)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }
}


/* =========================
   SKY
========================= */

function drawSky() {

    const world =
        worlds[save.selectedWorld];

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            groundY
        );

    gradient.addColorStop(
        0,
        world.skyTop
    );

    gradient.addColorStop(
        1,
        world.skyBottom
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        groundY
    );

    if (save.selectedWorld === 4) {

        stars.forEach(star => {

            const pulse =
                0.5 +
                Math.sin(
                    performance.now() * 0.002 +
                    star.phase
                ) *
                0.5;

            ctx.globalAlpha =
                star.alpha * pulse;

            ctx.fillStyle = "#ffffff";

            ctx.fillRect(
                star.x,
                star.y,
                star.size,
                star.size
            );
        });

        ctx.globalAlpha = 1;

        return;
    }

    drawMoonOrSun();
    drawClouds();
}

function drawMoonOrSun() {

    const world =
        save.selectedWorld;

    let color =
        "rgba(220,255,255,0.45)";

    let glow =
        "rgba(44,225,255,0.18)";

    if (world === 1) {
        color = "rgba(255,191,73,0.7)";
        glow = "rgba(255,140,30,0.25)";
    }

    if (world === 2) {
        color = "rgba(210,250,255,0.7)";
        glow = "rgba(130,220,255,0.3)";
    }

    if (world === 3) {
        color = "rgba(255,55,55,0.65)";
        glow = "rgba(255,40,20,0.35)";
    }

    ctx.save();

    ctx.shadowBlur = 60;
    ctx.shadowColor = glow;

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.arc(
        W - 150,
        100,
        48,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}

function drawClouds() {

    clouds.forEach(cloud => {

        cloud.x -=
            cloud.speed *
            (gameRunning ? 1 : 0.3);

        if (cloud.x < -200) {
            cloud.x = W + 150;
        }

        ctx.save();

        ctx.fillStyle =
            "rgba(0,0,0,0.18)";

        ctx.beginPath();

        ctx.arc(
            cloud.x,
            cloud.y,
            cloud.size * 0.55,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + cloud.size * 0.6,
            cloud.y - 18,
            cloud.size * 0.7,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + cloud.size * 1.2,
            cloud.y,
            cloud.size * 0.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    });
}


/* =========================
   ATMOSPHERE
========================= */

function drawAtmosphere() {

    const world =
        worlds[save.selectedWorld];

    const gradient =
        ctx.createLinearGradient(
            0,
            groundY - 120,
            0,
            groundY
        );

    gradient.addColorStop(
        0,
        "transparent"
    );

    gradient.addColorStop(
        1,
        world.fog + "22"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        groundY - 140,
        W,
        140
    );
}


/* =========================
   BACKGROUND
========================= */

function drawBackground() {

    const worldIndex =
        save.selectedWorld;

    ctx.save();

    if (worldIndex === 0) {

        backgroundTrees.forEach(tree => {

            let x =
                tree.x -
                (distance * 0.18 % 220);

            if (x < -80) {
                x += W + 220;
            }

            ctx.fillStyle =
                "rgba(3,18,15,0.65)";

            ctx.fillRect(
                x,
                groundY - tree.height,
                tree.width,
                tree.height
            );

            ctx.beginPath();

            ctx.arc(
                x + tree.width / 2,
                groundY - tree.height,
                tree.width * 1.6,
                0,
                Math.PI * 2
            );

            ctx.fill();
        });
    }

    else if (worldIndex === 1) {

        ctx.fillStyle =
            "rgba(20,8,0,0.25)";

        for (
            let x =
                -(distance * 0.15 % 220);
            x < W + 220;
            x += 220
        ) {

            ctx.beginPath();

            ctx.moveTo(x, groundY);

            ctx.quadraticCurveTo(
                x + 110,
                groundY - 120,
                x + 220,
                groundY
            );

            ctx.fill();
        }
    }

    else if (worldIndex === 2) {

        ctx.fillStyle =
            "rgba(230,255,255,0.12)";

        for (
            let x =
                -(distance * 0.18 % 180);
            x < W + 180;
            x += 180
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                groundY
            );

            ctx.lineTo(
                x + 70,
                groundY - 120
            );

            ctx.lineTo(
                x + 150,
                groundY
            );

            ctx.fill();
        }
    }

    else if (worldIndex === 3) {

        ctx.fillStyle =
            "rgba(25,0,0,0.5)";

        for (
            let x =
                -(distance * 0.2 % 180);
            x < W + 180;
            x += 180
        ) {

            ctx.beginPath();

            ctx.moveTo(x, groundY);
            ctx.lineTo(
                x + 60,
                groundY - 100
            );
            ctx.lineTo(
                x + 120,
                groundY - 40
            );
            ctx.lineTo(
                x + 180,
                groundY
            );

            ctx.fill();
        }
    }

    else {

        ctx.strokeStyle =
            "rgba(139,92,255,0.22)";

        ctx.lineWidth = 2;

        for (
            let x =
                -(distance * 0.3 % 100);
            x < W + 100;
            x += 100
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                groundY
            );

            ctx.lineTo(
                x + 100,
                groundY - 160
            );

            ctx.stroke();
        }
    }

    ctx.restore();
}


/* =========================
   GROUND
========================= */

function drawGround() {

    const world =
        worlds[save.selectedWorld];

    ctx.fillStyle =
        world.ground;

    ctx.fillRect(
        0,
        groundY,
        W,
        H - groundY
    );

    ctx.strokeStyle =
        world.fog + "88";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);

    ctx.stroke();

    for (
        let x =
            -(distance * 2 % 60);
        x < W + 60;
        x += 60
    ) {

        ctx.strokeStyle =
            "rgba(255,255,255,0.08)";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            x,
            groundY + 25
        );

        ctx.lineTo(
            x + 28,
            groundY + 25
        );

        ctx.stroke();
    }
}


/* =========================
   DRAW PLAYER
========================= */

function drawPlayer() {

    const character =
        characters[save.selectedCharacter];

    const px = player.x;
    const py = player.y;

    const legOffset =
        Math.sin(player.runFrame) * 7;

    ctx.save();

    if (
        invincibleTimer > 0 &&
        Math.floor(invincibleTimer / 5) % 2 === 0
    ) {
        ctx.globalAlpha = 0.5;
    }

    /* DASH TRAIL */

    if (dashTimer > 0) {

        for (
            let i = 5;
            i >= 1;
            i--
        ) {

            ctx.globalAlpha =
                0.04 + i * 0.035;

            ctx.fillStyle =
                character.glow;

            ctx.beginPath();

            ctx.ellipse(
                px - i * 30,
                py + 45,
                50,
                20,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    /* SHIELD */

    if (shieldTimer > 0) {

        ctx.strokeStyle =
            "#2ce1ff";

        ctx.lineWidth = 4;

        ctx.shadowBlur = 25;
        ctx.shadowColor = "#2ce1ff";

        ctx.globalAlpha =
            0.55 +
            Math.sin(
                performance.now() * 0.01
            ) * 0.25;

        ctx.beginPath();

        ctx.arc(
            px + 35,
            py + 42,
            62,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.globalAlpha = 1;
    }

    /* GLOW */

    ctx.shadowBlur =
        character.body === "god"
            ? 40
            : 25;

    ctx.shadowColor =
        character.glow;

    ctx.fillStyle =
        character.color;

    /* TAIL */

    ctx.beginPath();

    ctx.moveTo(
        px + 20,
        py + 50
    );

    ctx.quadraticCurveTo(
        px - 45,
        py + 70,
        px - 15,
        py + 78
    );

    ctx.lineTo(
        px + 24,
        py + 68
    );

    ctx.closePath();

    ctx.fill();

    /* BODY */

    roundRect(
        ctx,
        px + 10,
        py + 27,
        48,
        42,
        15
    );

    ctx.fill();

    /* HEAD */

    ctx.beginPath();

    ctx.ellipse(
        px + 55,
        py + 24,
        25,
        22,
        -0.15,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* JAW */

    ctx.fillStyle =
        shadeColor(
            character.color,
            -20
        );

    roundRect(
        ctx,
        px + 51,
        py + 35,
        25,
        12,
        5
    );

    ctx.fill();

    /* ARM */

    ctx.fillStyle =
        character.color;

    roundRect(
        ctx,
        px + 34,
        py + 48,
        25,
        9,
        5
    );

    ctx.fill();

    /* LEGS */

    ctx.fillStyle =
        character.color;

    roundRect(
        ctx,
        px + 18,
        py + 65,
        13,
        18 + legOffset,
        5
    );

    ctx.fill();

    roundRect(
        ctx,
        px + 42,
        py + 65,
        13,
        18 - legOffset,
        5
    );

    ctx.fill();

    /* EYE */

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#020610";

    ctx.beginPath();

    ctx.arc(
        px + 64,
        py + 18,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* EYE GLOW */

    ctx.fillStyle =
        character.body === "shadow"
            ? "#ffffff"
            : "#ffdd44";

    ctx.beginPath();

    ctx.arc(
        px + 65,
        py + 18,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* SPECIAL EFFECT */

    if (
        character.body === "god" ||
        character.body === "solar"
    ) {

        ctx.strokeStyle =
            character.glow;

        ctx.lineWidth = 2;

        ctx.globalAlpha = 0.65;

        ctx.beginPath();

        ctx.arc(
            px + 35,
            py + 42,
            48 +
            Math.sin(
                performance.now() * 0.01
            ) * 7,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }

    ctx.restore();
}


/* =========================
   DRAW OBSTACLES
========================= */

function drawObstacles() {

    obstacles.forEach(obstacle => {

        ctx.save();

        ctx.shadowBlur = 10;

        if (
            obstacle.type === "rock"
        ) {

            ctx.fillStyle = "#68717c";

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x,
                obstacle.y + obstacle.height
            );

            ctx.lineTo(
                obstacle.x + 12,
                obstacle.y + 10
            );

            ctx.lineTo(
                obstacle.x + obstacle.width - 8,
                obstacle.y + 5
            );

            ctx.lineTo(
                obstacle.x + obstacle.width,
                obstacle.y + obstacle.height
            );

            ctx.closePath();

            ctx.fill();
        }

        else if (
            obstacle.type === "spikes"
        ) {

            ctx.fillStyle = "#d8e3ec";

            const count = 4;

            for (
                let i = 0;
                i < count;
                i++
            ) {

                const x =
                    obstacle.x +
                    i *
                    (obstacle.width / count);

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    groundY
                );

                ctx.lineTo(
                    x +
                    obstacle.width / count / 2,
                    obstacle.y
                );

                ctx.lineTo(
                    x +
                    obstacle.width / count,
                    groundY
                );

                ctx.fill();
            }
        }

        else if (
            obstacle.type === "skull"
        ) {

            ctx.fillStyle = "#ddd5c8";

            ctx.beginPath();

            ctx.arc(
                obstacle.x +
                obstacle.width / 2,
                obstacle.y + 20,
                22,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillRect(
                obstacle.x + 10,
                obstacle.y + 35,
                obstacle.width - 20,
                18
            );

            ctx.fillStyle = "#111";

            ctx.beginPath();

            ctx.arc(
                obstacle.x + 17,
                obstacle.y + 20,
                5,
                0,
                Math.PI * 2
            );

            ctx.arc(
                obstacle.x + 34,
                obstacle.y + 20,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (
            obstacle.type === "tree"
        ) {

            ctx.fillStyle = "#170c08";

            ctx.fillRect(
                obstacle.x +
                obstacle.width * 0.4,
                obstacle.y,
                obstacle.width * 0.25,
                obstacle.height
            );

            ctx.fillStyle = "#07120c";

            ctx.beginPath();

            ctx.arc(
                obstacle.x +
                obstacle.width * 0.5,
                obstacle.y + 15,
                obstacle.width * 0.7,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (
            obstacle.type === "cactus"
        ) {

            ctx.fillStyle = "#3c9d58";

            roundRect(
                ctx,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height,
                8
            );

            ctx.fill();

            ctx.fillRect(
                obstacle.x - 12,
                obstacle.y + 25,
                14,
                9
            );

            ctx.fillRect(
                obstacle.x +
                obstacle.width - 2,
                obstacle.y + 36,
                14,
                9
            );
        }

        else if (
            obstacle.type === "ice"
        ) {

            ctx.fillStyle = "#9cecff";

            ctx.shadowColor = "#2ce1ff";

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x,
                groundY
            );

            ctx.lineTo(
                obstacle.x +
                obstacle.width * 0.4,
                obstacle.y
            );

            ctx.lineTo(
                obstacle.x +
                obstacle.width,
                groundY
            );

            ctx.fill();
        }

        else if (
            obstacle.type === "fire"
        ) {

            ctx.shadowColor = "#ff3d20";

            ctx.fillStyle = "#ff4d20";

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x,
                groundY
            );

            ctx.quadraticCurveTo(
                obstacle.x + 5,
                obstacle.y,
                obstacle.x +
                obstacle.width / 2,
                groundY - 15
            );

            ctx.quadraticCurveTo(
                obstacle.x +
                obstacle.width - 5,
                obstacle.y + 15,
                obstacle.x + obstacle.width,
                groundY
            );

            ctx.fill();

            ctx.fillStyle = "#ffd34d";

            ctx.beginPath();

            ctx.arc(
                obstacle.x +
                obstacle.width / 2,
                groundY - 20,
                10,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (
            obstacle.type === "enemy"
        ) {

            ctx.shadowColor = "#ff1f4b";
            ctx.fillStyle = "#2a0610";

            ctx.beginPath();

            ctx.ellipse(
                obstacle.x + 32,
                obstacle.y + 28,
                30,
                22,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle = "#ff244c";

            ctx.beginPath();

            ctx.arc(
                obstacle.x + 20,
                obstacle.y + 23,
                5,
                0,
                Math.PI * 2
            );

            ctx.arc(
                obstacle.x + 43,
                obstacle.y + 23,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.strokeStyle =
                "rgba(255,40,70,0.8)";

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x + 5,
                obstacle.y + 40
            );

            ctx.lineTo(
                obstacle.x - 18,
                obstacle.y + 25
            );

            ctx.stroke();
        }

        ctx.restore();
    });
}


/* =========================
   DRAW GEMS
========================= */

function drawCollectibles() {

    collectibles.forEach(gem => {

        ctx.save();

        ctx.translate(
            gem.x,
            gem.y
        );

        ctx.rotate(
            gem.angle
        );

        ctx.shadowBlur = 25;
        ctx.shadowColor = "#2ce1ff";

        ctx.fillStyle = "#2ce1ff";

        ctx.beginPath();

        ctx.moveTo(
            0,
            -gem.radius
        );

        ctx.lineTo(
            gem.radius,
            0
        );

        ctx.lineTo(
            0,
            gem.radius
        );

        ctx.lineTo(
            -gem.radius,
            0
        );

        ctx.closePath();

        ctx.fill();

        ctx.fillStyle =
            "rgba(255,255,255,0.75)";

        ctx.fillRect(
            -3,
            -7,
            6,
            10
        );

        ctx.restore();
    });
}


/* =========================
   PARTICLES
========================= */

function createParticles(
    x,
    y,
    amount,
    color
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({
            x,
            y,

            vx:
                (Math.random() - 0.5) *
                (4 + Math.random() * 8),

            vy:
                (Math.random() - 0.5) *
                (5 + Math.random() * 8),

            size:
                2 +
                Math.random() * 5,

            life:
                25 +
                Math.random() * 45,

            maxLife: 70,

            color
        });
    }
}

function updateParticles(delta) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.x +=
            p.vx * delta;

        p.y +=
            p.vy * delta;

        p.vy +=
            0.08 * delta;

        p.life -= delta;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {

    particles.forEach(p => {

        ctx.save();

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / p.maxLife
            );

        ctx.fillStyle =
            p.color;

        ctx.shadowBlur = 8;
        ctx.shadowColor =
            p.color;

        ctx.fillRect(
            p.x,
            p.y,
            p.size,
            p.size
        );

        ctx.restore();
    });
}


/* =========================
   REDEEM CODES
========================= */

const giftCodes = {

    "RUN100": 100,

    "LEGEND1000": 1000,

    "DINO5000": 5000,

    "DARKNIGHT": 25000,

    "VOIDKING": 100000,

    "PHANTOM2026": 500000,

    "ULTRALEGEND": 1000000,

    "DINO1M": 1000000,

    "NIGHTMARE": 5000000,

    "BLOODMOON": 10000000,

    "COSMIC100M": 100000000,

    "GODMODE500M": 500000000,

    "LEGEND1B": 1000000000,

    "TERROR5B": 5000000000,

    "ULTIMATE26B": 26000000000,

    "DINO26B": 26000000000,

    "TRILLION": 1000000000000
};

function redeemCode() {

    const code =
        codeInput.value
            .trim()
            .toUpperCase();

    if (!code) {

        showMessage(
            "یک کد وارد کن.",
            "#ff5571"
        );

        return;
    }

    if (
        !Object.prototype.hasOwnProperty.call(
            giftCodes,
            code
        )
    ) {

        showMessage(
            "کد نامعتبر است!",
            "#ff5571"
        );

        return;
    }

    if (
        save.usedCodes.includes(code)
    ) {

        showMessage(
            "این کد قبلاً استفاده شده!",
            "#ffd34d"
        );

        return;
    }

    const reward =
        giftCodes[code];

    save.gems += reward;

    save.usedCodes.push(code);

    saveGame();
    updateUI();

    codeInput.value = "";

    showMessage(
        "🎉 " +
        formatNumber(reward) +
        " 💎 گرفتی!",
        "#50f5a1"
    );
}

redeemButton.addEventListener(
    "click",
    redeemCode
);

codeInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {
            redeemCode();
        }
    }
);


/* =========================
   MESSAGE
========================= */

let messageTimer = null;

function showMessage(
    text,
    color = "#50f5a1"
) {

    if (!codeMessage) {
        return;
    }

    codeMessage.textContent = text;
    codeMessage.style.color = color;

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            codeMessage.textContent = "";

        }, 3500);
}


/* =========================
   HELPERS
========================= */

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    context.beginPath();

    context.moveTo(
        x + r,
        y
    );

    context.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        r
    );

    context.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        r
    );

    context.arcTo(
        x,
        y + height,
        x,
        y,
        r
    );

    context.arcTo(
        x,
        y,
        x + width,
        y,
        r
    );

    context.closePath();
}

function shadeColor(
    color,
    amount
) {

    const hex =
        color.replace("#", "");

    if (hex.length !== 6) {
        return color;
    }

    let r =
        parseInt(
            hex.substring(0, 2),
            16
        );

    let g =
        parseInt(
            hex.substring(2, 4),
            16
        );

    let b =
        parseInt(
            hex.substring(4, 6),
            16
        );

    r = Math.max(
        0,
        Math.min(255, r + amount)
    );

    g = Math.max(
        0,
        Math.min(255, g + amount)
    );

    b = Math.max(
        0,
        Math.min(255, b + amount)
    );

    return (
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0")
    );
}


/* =========================
   RESIZE
========================= */

function resizeCanvas() {

    const ratio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    const rect =
        canvas.getBoundingClientRect();

    const width =
        Math.max(
            1,
            Math.floor(rect.width * ratio)
        );

    const height =
        Math.max(
            1,
            Math.floor(rect.height * ratio)
        );

    if (
        canvas.width !== width ||
        canvas.height !== height
    ) {

        canvas.width = width;
        canvas.height = height;
    }

    draw();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================
   STARTUP
========================= */

function initialize() {

    save.selectedCharacter =
        Math.max(
            0,
            Math.min(
                characters.length - 1,
                Number(save.selectedCharacter) || 0
            )
        );

    save.selectedWorld =
        Math.max(
            0,
            Math.min(
                worlds.length - 1,
                Number(save.selectedWorld) || 0
            )
        );

    if (
        !save.unlockedCharacters.includes(0)
    ) {
        save.unlockedCharacters.push(0);
    }

    if (
        !save.unlockedWorlds.includes(0)
    ) {
        save.unlockedWorlds.push(0);
    }

    player.color =
        characters[
            save.selectedCharacter
        ].color;

    createBackground();

    renderCharacters();
    renderUpgrades();
    renderWorlds();

    updateUI();

    requestAnimationFrame(() => {

        resizeCanvas();
        draw();

    });
}

initialize();

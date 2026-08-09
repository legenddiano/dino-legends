"use strict";

/* =========================================================
   DINO LEGENDS — ULTIMATE GAME ENGINE
   Compatible with the HTML structure you sent
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

/* =========================================================
   SAFE DOM
========================================================= */

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


/* =========================================================
   SAVE
========================================================= */

const SAVE_KEY = "DINO_LEGENDS_ULTIMATE_V10";

const defaultSave = {
    gems: 0,
    bestScore: 0,

    xp: 0,
    level: 1,

    selectedCharacter: 0,
    unlockedCharacters: [0],

    upgrades: {
        jump: 0,
        shield: 0,
        dash: 0,
        health: 0,
        magnet: 0,
        score: 0
    },

    unlockedWorlds: [0],
    selectedWorld: 0,

    missions: {
        distance: 0,
        gems: 0,
        jumps: 0,
        dashes: 0,
        shields: 0,
        runs: 0
    },

    claimedMissions: [],

    stats: {
        runs: 0,
        totalScore: 0,
        totalGems: 0,
        totalDistance: 0,
        obstaclesDodged: 0
    },

    usedCodes: []
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

        const data = JSON.parse(raw);
        const base = cloneDefault();

        return {
            ...base,
            ...data,

            upgrades: {
                ...base.upgrades,
                ...(data.upgrades || {})
            },

            missions: {
                ...base.missions,
                ...(data.missions || {})
            },

            stats: {
                ...base.stats,
                ...(data.stats || {})
            }
        };

    } catch (error) {

        console.warn("Save corrupted. Resetting save.");

        return cloneDefault();
    }
}

let save = loadGame();

function saveGame() {

    try {
        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(save)
        );
    } catch (error) {
        console.warn("Could not save game.", error);
    }
}


/* =========================================================
   100 LEGENDARY SKINS
========================================================= */

const skinNames = [
    "Rex",
    "Blaze",
    "Frost",
    "Volt",
    "Shadow",
    "Inferno",
    "Phantom",
    "Titan",
    "Venom",
    "Cyber",
    "Storm",
    "Neon",
    "Galaxy",
    "Void",
    "Solar",
    "Lunar",
    "Crystal",
    "Golden",
    "Ruby",
    "Emerald",
    "Sapphire",
    "Amethyst",
    "Obsidian",
    "Plasma",
    "Quantum",
    "Cosmic",
    "Dragon",
    "Demon",
    "Angel",
    "Samurai",
    "Ninja",
    "Knight",
    "Wizard",
    "Hunter",
    "Glacier",
    "Thunder",
    "Phoenix",
    "Magma",
    "Toxic",
    "Specter",
    "Abyss",
    "Royal",
    "Ancient",
    "Mystic",
    "Astral",
    "Cyberpunk",
    "Stealth",
    "Warrior",
    "Legend",
    "Omega",
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Eclipse",
    "Supernova",
    "Meteor",
    "Comet",
    "Starlight",
    "Nightmare",
    "Dream",
    "Arcane",
    "Runic",
    "Infernal",
    "Celestial",
    "Dark Matter",
    "Time Lord",
    "Space Lord",
    "Earth Lord",
    "Ice Lord",
    "Fire Lord",
    "Storm Lord",
    "Shadow Lord",
    "Light Lord",
    "Chaos",
    "Order",
    "Cyber Rex",
    "Mecha",
    "Steel",
    "Chrome",
    "Diamond",
    "Platinum",
    "Titanium",
    "Royal Gold",
    "Blood Moon",
    "Star King",
    "Void King",
    "Dragon King",
    "Dino King",
    "Ultimate",
    "Infinity",
    "God Mode",
    "Eternal",
    "Mythic",
    "Legendary",
    "Supreme",
    "Final Boss",
    "???",
    "OMEGA X"
];

const colors = [
    "#50f5a1",
    "#ff714d",
    "#7de8ff",
    "#ffe05d",
    "#b994ff",
    "#ff553d",
    "#8c7bff",
    "#d4d7dd",
    "#67ff62",
    "#46eaff",
    "#557cff",
    "#00ffe1",
    "#9b6cff",
    "#5b5bff",
    "#ffd34d",
    "#d8f4ff",
    "#b8ffff",
    "#c89cff",
    "#ffd84d",
    "#58ff91",
    "#54bfff",
    "#d36cff",
    "#4d4d5c",
    "#ff5d6c",
    "#48fff3"
];

function generateCharacters() {

    const result = [];

    for (let i = 0; i < 100; i++) {

        let cost;

        if (i === 0) {
            cost = 0;
        } else if (i === 1) {
            cost = 1000000;
        } else {
            const progress = (i - 1) / 98;

            cost = Math.round(
                1000000 +
                Math.pow(progress, 2.05) *
                (26000000000 - 1000000)
            );
        }

        result.push({
            id: i,
            name: skinNames[i] || `Legend ${i + 1}`,
            emoji: "🦖",
            subtitle:
                i === 0
                    ? "THE ORIGINAL LEGEND"
                    : i >= 95
                        ? "ULTIMATE MYTHIC"
                        : i >= 80
                            ? "MYTHIC LEGEND"
                            : i >= 60
                                ? "LEGENDARY"
                                : i >= 30
                                    ? "EPIC"
                                    : "RARE",

            description:
                i === 0
                    ? "The original Dino Legend."
                    : "A unique legendary skin with its own energy aura.",

            cost,
            color: colors[i % colors.length],

            glow:
                colors[(i * 3) % colors.length]
        });
    }

    return result;
}

const characters = generateCharacters();


/* =========================================================
   WORLDS
========================================================= */

const worlds = [
    {
        name: "JURASSIC JUNGLE",
        className: "jungle",
        description: "Ancient jungle filled with giant shadows.",
        cost: 0,
        skyTop: "#12394a",
        skyBottom: "#07161e",
        ground: "#173e2b"
    },

    {
        name: "GOLDEN DESERT",
        className: "desert",
        description: "A massive golden desert.",
        cost: 5000000,
        skyTop: "#704715",
        skyBottom: "#1c1006",
        ground: "#654116"
    },

    {
        name: "FROZEN ERA",
        className: "ice",
        description: "Frozen mountains and deadly storms.",
        cost: 50000000,
        skyTop: "#1d5876",
        skyBottom: "#071827",
        ground: "#164256"
    },

    {
        name: "VOLCANO CORE",
        className: "volcano",
        description: "A volcanic battlefield.",
        cost: 500000000,
        skyTop: "#56111a",
        skyBottom: "#180408",
        ground: "#4b1517"
    },

    {
        name: "COSMIC VOID",
        className: "space",
        description: "The final dimension.",
        cost: 5000000000,
        skyTop: "#130d35",
        skyBottom: "#05040e",
        ground: "#171238"
    }
];


/* =========================================================
   UPGRADES
========================================================= */

const upgrades = [
    {
        key: "jump",
        emoji: "🦘",
        name: "SUPER JUMP",
        description: "Increase jump power."
    },

    {
        key: "shield",
        emoji: "🛡️",
        name: "SHIELD CORE",
        description: "Increase shield duration."
    },

    {
        key: "dash",
        emoji: "⚡",
        name: "DASH ENGINE",
        description: "Increase dash power."
    },

    {
        key: "health",
        emoji: "❤️",
        name: "VITAL CORE",
        description: "Increase maximum health."
    },

    {
        key: "magnet",
        emoji: "🧲",
        name: "GEM MAGNET",
        description: "Increase gem collection range."
    },

    {
        key: "score",
        emoji: "🏆",
        name: "SCORE MATRIX",
        description: "Increase score multiplier."
    }
];


/* =========================================================
   MISSIONS
========================================================= */

const missions = [
    {
        id: "distance",
        title: "ROAD WARRIOR",
        description: "Travel 5,000 distance.",
        target: 5000,
        reward: 500000
    },

    {
        id: "gems",
        title: "GEM HUNTER",
        description: "Collect 100 gems.",
        target: 100,
        reward: 1000000
    },

    {
        id: "jumps",
        title: "SKY MASTER",
        description: "Jump 100 times.",
        target: 100,
        reward: 750000
    },

    {
        id: "dashes",
        title: "SPEED DEMON",
        description: "Use dash 50 times.",
        target: 50,
        reward: 1500000
    },

    {
        id: "shields",
        title: "GUARDIAN",
        description: "Use shield 30 times.",
        target: 30,
        reward: 2000000
    },

    {
        id: "runs",
        title: "NEVER STOP",
        description: "Complete 25 runs.",
        target: 25,
        reward: 5000000
    }
];


/* =========================================================
   GAME STATE
========================================================= */

let gameRunning = false;
let animationId = null;

let score = 0;
let combo = 1;

let health = 3;
let maxHealth = 3;

let gameSpeed = 8;
let distance = 0;

let lastTime = 0;

let obstacleTimer = 0;
let gemTimer = 0;

let dashTimer = 0;
let shieldTimer = 0;
let invincibleTimer = 0;

let particles = [];
let obstacles = [];
let collectibles = [];

let clouds = [];
let stars = [];

let shake = 0;

const BASE_WIDTH = 1200;
const BASE_HEIGHT = 500;

const groundY = 420;


/* =========================================================
   PLAYER
========================================================= */

const player = {
    x: 150,
    y: groundY - 80,

    width: 62,
    height: 80,

    velocityY: 0,

    gravity: 0.75,

    jumpPower: -15,

    grounded: true,

    color: "#50f5a1",

    glow: "#50f5a1"
};


/* =========================================================
   LEVEL SYSTEM
========================================================= */

function xpNeeded(level) {

    return Math.floor(
        1000 *
        Math.pow(level, 1.35)
    );
}

function addXP(amount) {

    save.xp += amount;

    while (
        save.xp >= xpNeeded(save.level)
    ) {

        save.xp -= xpNeeded(save.level);

        save.level++;

        save.gems +=
            100000 * save.level;

        createFloatingText(
            canvas.width / 2,
            130,
            "LEVEL UP!",
            "#ffd34d"
        );
    }

    saveGame();
}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    if (gemsEl) {
        gemsEl.textContent =
            formatNumber(save.gems);
    }

    if (bestScoreEl) {
        bestScoreEl.textContent =
            formatNumber(save.bestScore);
    }

    if (levelEl) {
        levelEl.textContent =
            save.level;
    }

    if (scoreEl) {
        scoreEl.textContent =
            formatNumber(Math.floor(score));
    }

    if (comboEl) {
        comboEl.textContent =
            "x" + combo;
    }

    if (healthEl) {

        healthEl.textContent =
            "❤️".repeat(Math.max(0, health)) +
            "🖤".repeat(
                Math.max(0, maxHealth - health)
            );
    }

    if (characterCountEl) {

        characterCountEl.textContent =
            save.unlockedCharacters.length +
            " / " +
            characters.length;
    }
}

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "0";
    }

    return Math.floor(number).toLocaleString("en-US");
}


/* =========================================================
   TABS
========================================================= */

document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", () => {

        const target =
            tab.dataset.panel;

        document
            .querySelectorAll(".tab")
            .forEach(button => {
                button.classList.remove("active");
            });

        document
            .querySelectorAll(".panel")
            .forEach(panel => {
                panel.classList.remove(
                    "active-panel"
                );
            });

        tab.classList.add("active");

        const panel =
            document.getElementById(target);

        if (panel) {
            panel.classList.add(
                "active-panel"
            );
        }
    });
});


/* =========================================================
   CHARACTER SHOP
========================================================= */

function renderCharacters() {

    if (!characterGrid) return;

    characterGrid.innerHTML = "";

    characters.forEach((character, index) => {

        const unlocked =
            save.unlockedCharacters
                .includes(index);

        const selected =
            save.selectedCharacter === index;

        const card =
            document.createElement("article");

        card.className =
            "character-card" +
            (selected
                ? " selected"
                : "");

        card.style.setProperty(
            "--skin-color",
            character.color
        );

        card.innerHTML = `
            <div class="card-top">

                <div
                    class="card-emoji"
                    style="
                        color:${character.color};
                        text-shadow:
                        0 0 20px ${character.glow};
                    ">
                    ${character.emoji}
                </div>

                <div>

                    <h3 class="card-title">
                        ${character.name}
                    </h3>

                    <p class="card-subtitle">
                        ${character.subtitle}
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
                            : "💎 " +
                              formatNumber(
                                  character.cost
                              )
                    }

                </span>

                <button
                    class="card-btn
                    ${unlocked ? "" : "locked"}"
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

    document
        .querySelectorAll("[data-character]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectOrUnlockCharacter(
                        Number(
                            button.dataset.character
                        )
                    );

                }
            );
        });
}

function selectOrUnlockCharacter(index) {

    const character =
        characters[index];

    if (!character) return;

    if (
        save.unlockedCharacters
            .includes(index)
    ) {

        save.selectedCharacter =
            index;

        applyCharacter();

        saveGame();

        renderCharacters();

        updateUI();

        showMessage(
            `${character.name} selected!`,
            "#50f5a1"
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

    save.gems -=
        character.cost;

    save.unlockedCharacters.push(
        index
    );

    save.selectedCharacter =
        index;

    applyCharacter();

    saveGame();

    renderCharacters();

    updateUI();

    showMessage(
        `${character.name} unlocked!`,
        "#50f5a1"
    );
}

function applyCharacter() {

    const character =
        characters[
            save.selectedCharacter
        ];

    if (!character) return;

    player.color =
        character.color;

    player.glow =
        character.glow;
}


/* =========================================================
   UPGRADES
========================================================= */

function getUpgradeCost(level) {

    return Math.floor(
        200000 *
        Math.pow(2.05, level)
    );
}

function renderUpgrades() {

    if (!upgradeGrid) return;

    upgradeGrid.innerHTML = "";

    upgrades.forEach(upgrade => {

        const currentLevel =
            save.upgrades[
                upgrade.key
            ];

        const maxed =
            currentLevel >= 10;

        const cost =
            getUpgradeCost(
                currentLevel
            );

        const card =
            document.createElement("article");

        card.className =
            "upgrade-card";

        card.innerHTML = `
            <div class="card-top">

                <div class="card-emoji">
                    ${upgrade.emoji}
                </div>

                <div>

                    <h3 class="card-title">
                        ${upgrade.name}
                    </h3>

                    <p class="card-subtitle">
                        LEVEL
                        ${currentLevel}
                        / 10
                    </p>

                </div>

            </div>

            <p class="card-description">
                ${upgrade.description}
            </p>

            <div class="card-footer">

                <span class="card-cost">

                    ${
                        maxed
                            ? "MAX LEVEL"
                            : "💎 " +
                              formatNumber(cost)
                    }

                </span>

                <button
                    class="card-btn"
                    data-upgrade="${upgrade.key}"
                    ${maxed ? "disabled" : ""}>

                    ${maxed
                        ? "MAX"
                        : "UPGRADE"}

                </button>

            </div>
        `;

        upgradeGrid.appendChild(card);
    });

    document
        .querySelectorAll("[data-upgrade]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    upgradePlayer(
                        button.dataset.upgrade
                    );

                }
            );
        });
}

function upgradePlayer(key) {

    if (
        save.upgrades[key] === undefined
    ) {
        return;
    }

    const current =
        save.upgrades[key];

    if (current >= 10) {
        return;
    }

    const cost =
        getUpgradeCost(current);

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

    updateUI();

    renderUpgrades();

    showMessage(
        "⚡ UPGRADE COMPLETE!",
        "#50f5a1"
    );
}


/* =========================================================
   WORLDS
========================================================= */

function renderWorlds() {

    if (!worldGrid) return;

    worldGrid.innerHTML = "";

    worlds.forEach((world, index) => {

        const unlocked =
            save.unlockedWorlds
                .includes(index);

        const selected =
            save.selectedWorld === index;

        const card =
            document.createElement("article");

        card.className =
            "world-card" +
            (selected
                ? " selected"
                : "");

        card.innerHTML = `

            <div
                class="world-preview
                ${world.className}">
            </div>

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
                            : "💎 " +
                              formatNumber(
                                  world.cost
                              )
                    }

                </span>

                <button
                    class="card-btn
                    ${unlocked ? "" : "locked"}"
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

    document
        .querySelectorAll("[data-world]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectOrUnlockWorld(
                        Number(
                            button.dataset.world
                        )
                    );

                }
            );
        });
}

function selectOrUnlockWorld(index) {

    const world =
        worlds[index];

    if (!world) return;

    if (
        save.unlockedWorlds
            .includes(index)
    ) {

        save.selectedWorld =
            index;

        saveGame();

        renderWorlds();

        showMessage(
            world.name +
            " selected!",
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

    save.gems -=
        world.cost;

    save.unlockedWorlds.push(
        index
    );

    save.selectedWorld =
        index;

    saveGame();

    updateUI();

    renderWorlds();

    showMessage(
        world.name +
        " unlocked!",
        "#50f5a1"
    );
}


/* =========================================================
   MISSIONS PANEL
========================================================= */

function renderMissionsIfPossible() {

    const panel =
        document.getElementById("missions");

    if (!panel) return;

    const existing =
        panel.querySelector(
            ".missions-grid"
        );

    if (existing) return;

    const grid =
        document.createElement("div");

    grid.className =
        "grid missions-grid";

    missions.forEach(mission => {

        const value =
            save.missions[
                mission.id
            ] || 0;

        const claimed =
            save.claimedMissions
                .includes(mission.id);

        const percent =
            Math.min(
                100,
                (value /
                    mission.target) *
                    100
            );

        const card =
            document.createElement("article");

        card.className =
            "upgrade-card";

        card.innerHTML = `

            <div class="card-top">

                <div class="card-emoji">
                    🎯
                </div>

                <div>

                    <h3 class="card-title">
                        ${mission.title}
                    </h3>

                    <p class="card-subtitle">
                        ${value.toLocaleString()}
                        /
                        ${mission.target.toLocaleString()}
                    </p>

                </div>

            </div>

            <p class="card-description">
                ${mission.description}
            </p>

            <div style="
                height:8px;
                border-radius:10px;
                background:rgba(255,255,255,.08);
                overflow:hidden;
                margin:15px 0;
            ">

                <div style="
                    width:${percent}%;
                    height:100%;
                    background:#2ce1ff;
                    box-shadow:0 0 15px #2ce1ff;
                "></div>

            </div>

            <div class="card-footer">

                <span class="card-cost">
                    💎 ${formatNumber(mission.reward)}
                </span>

                <button
                    class="card-btn"
                    data-mission="${mission.id}"
                    ${claimed ? "disabled" : ""}>

                    ${
                        claimed
                            ? "CLAIMED"
                            : value >= mission.target
                                ? "CLAIM"
                                : "LOCKED"
                    }

                </button>

            </div>
        `;

        grid.appendChild(card);
    });

    panel.appendChild(grid);

    grid.querySelectorAll(
        "[data-mission]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                claimMission(
                    button.dataset.mission
                );

                grid.remove();

                renderMissionsIfPossible();
            }
        );
    });
}

function claimMission(id) {

    const mission =
        missions.find(
            item => item.id === id
        );

    if (!mission) return;

    if (
        save.claimedMissions
            .includes(id)
    ) {
        return;
    }

    const value =
        save.missions[id] || 0;

    if (value < mission.target) {

        showMessage(
            "Mission not completed!",
            "#ff5571"
        );

        return;
    }

    save.claimedMissions.push(id);

    save.gems +=
        mission.reward;

    addXP(500);

    saveGame();

    updateUI();

    showMessage(
        "🎯 MISSION REWARD CLAIMED!",
        "#50f5a1"
    );
}


/* =========================================================
   START
========================================================= */

function startGame() {

    if (!canvas || !ctx) {
        console.error(
            "gameCanvas not found."
        );
        return;
    }

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;
    }

    score = 0;
    combo = 1;

    maxHealth =
        3 +
        save.upgrades.health;

    health = maxHealth;

    gameSpeed = 8;

    distance = 0;

    obstacleTimer = 0;
    gemTimer = 0;

    dashTimer = 0;
    shieldTimer = 0;
    invincibleTimer = 0;

    shake = 0;

    particles = [];
    obstacles = [];
    collectibles = [];

    player.y =
        groundY -
        player.height;

    player.velocityY = 0;

    player.grounded = true;

    applyCharacter();

    gameRunning = true;

    lastTime =
        performance.now();

    if (startScreen) {
        startScreen.classList.add(
            "hidden"
        );
    }

    if (gameOverScreen) {
        gameOverScreen.classList.add(
            "hidden"
        );
    }

    save.stats.runs++;

    save.missions.runs =
        (save.missions.runs || 0) + 1;

    saveGame();

    updateUI();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameRunning = false;

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;
    }

    const finalScore =
        Math.floor(score);

    if (
        finalScore >
        save.bestScore
    ) {

        save.bestScore =
            finalScore;
    }

    save.stats.totalScore +=
        finalScore;

    save.stats.totalDistance +=
        Math.floor(distance);

    save.missions.distance +=
        Math.floor(distance);

    addXP(
        Math.floor(
            finalScore * 0.2
        )
    );

    saveGame();

    if (finalScoreEl) {

        finalScoreEl.textContent =
            formatNumber(
                finalScore
            );
    }

    updateUI();

    if (gameOverScreen) {

        gameOverScreen.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }

    const delta =
        Math.min(
            (timestamp - lastTime) /
                16.67,
            2
        );

    lastTime = timestamp;

    update(delta);

    draw();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   UPDATE
========================================================= */

function update(delta) {

    distance +=
        gameSpeed *
        delta;

    save.missions.distance =
        Math.floor(distance);

    score +=
        0.18 *
        combo *
        delta *
        (
            1 +
            save.upgrades.score *
            0.08
        ) *
        (
            dashTimer > 0
                ? 1.7
                : 1
        );

    gameSpeed =
        Math.min(
            20,
            8 +
            score / 1200
        );

    updatePlayer(delta);

    updateTimers(delta);

    spawnObjects(delta);

    updateObstacles(delta);

    updateCollectibles(delta);

    updateParticles(delta);

    if (shake > 0) {
        shake -= delta;
    }

    updateUI();
}


/* =========================================================
   PLAYER
========================================================= */

function updatePlayer(delta) {

    player.velocityY +=
        player.gravity *
        delta;

    player.y +=
        player.velocityY *
        delta;

    if (
        player.y >=
        groundY -
        player.height
    ) {

        player.y =
            groundY -
            player.height;

        player.velocityY = 0;

        player.grounded = true;
    }
}

function updateTimers(delta) {

    dashTimer =
        Math.max(
            0,
            dashTimer - delta
        );

    shieldTimer =
        Math.max(
            0,
            shieldTimer - delta
        );

    invincibleTimer =
        Math.max(
            0,
            invincibleTimer - delta
        );
}


/* =========================================================
   SPAWN
========================================================= */

function spawnObjects(delta) {

    obstacleTimer += delta;

    gemTimer += delta;

    const obstacleInterval =
        Math.max(
            48,
            125 -
            gameSpeed * 3.4
        );

    if (
        obstacleTimer >
        obstacleInterval
    ) {

        spawnObstacle();

        obstacleTimer = 0;
    }

    if (gemTimer > 38) {

        spawnGem();

        gemTimer = 0;
    }
}


/* =========================================================
   OBSTACLES
========================================================= */

function spawnObstacle() {

    const types = [
        "cactus",
        "rock",
        "bird",
        "crystal",
        "spike"
    ];

    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];

    let width = 40;
    let height = 60;

    let y =
        groundY -
        height;

    if (type === "rock") {

        width = 58;
        height = 42;

        y =
            groundY -
            height;
    }

    if (type === "bird") {

        width = 55;
        height = 38;

        y =
            groundY -
            140 -
            Math.random() * 90;
    }

    if (type === "crystal") {

        width = 42;
        height = 75;

        y =
            groundY -
            height;
    }

    if (type === "spike") {

        width = 70;
        height = 35;

        y =
            groundY -
            height;
    }

    obstacles.push({

        type,

        x:
            canvas.width +
            80,

        y,

        width,

        height,

        counted: false
    });
}

function updateObstacles(delta) {

    const speedMultiplier =
        dashTimer > 0
            ? 1.5
            : 1;

    for (
        let i =
            obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];

        obstacle.x -=
            gameSpeed *
            speedMultiplier *
            delta;

        if (
            checkCollision(
                player,
                obstacle
            )
        ) {

            hitPlayer();

            obstacles.splice(
                i,
                1
            );

            continue;
        }

        if (
            !obstacle.counted &&
            obstacle.x +
                obstacle.width <
                player.x
        ) {

            obstacle.counted = true;

            save.stats
                .obstaclesDodged++;

            combo =
                Math.min(
                    20,
                    combo + 1
                );

            score +=
                25 *
                combo;
        }

        if (
            obstacle.x +
                obstacle.width <
                -100
        ) {

            obstacles.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   GEMS
========================================================= */

function spawnGem() {

    collectibles.push({

        x:
            canvas.width +
            50,

        y:
            groundY -
            70 -
            Math.random() *
            190,

        radius: 13,

        angle: 0
    });
}

function updateCollectibles(delta) {

    for (
        let i =
            collectibles.length - 1;
        i >= 0;
        i--
    ) {

        const gem =
            collectibles[i];

        gem.x -=
            gameSpeed *
            delta;

        gem.angle +=
            0.12 *
            delta;

        if (
            circleRectCollision(
                gem,
                player
            )
        ) {

            collectGem(
                gem,
                i
            );

            continue;
        }

        if (
            gem.x < -80
        ) {

            collectibles.splice(
                i,
                1
            );
        }
    }
}

function collectGem(
    gem,
    index
) {

    const reward =
        1 +
        save.upgrades.magnet;

    save.gems += reward;

    save.stats.totalGems +=
        reward;

    save.missions.gems +=
        reward;

    score +=
        50 *
        combo;

    combo =
        Math.min(
            20,
            combo + 1
        );

    createParticles(
        gem.x,
        gem.y,
        18,
        "#2ce1ff"
    );

    collectibles.splice(
        index,
        1
    );

    saveGame();
}


/* =========================================================
   COLLISION
========================================================= */

function checkCollision(a, b) {

    const padding = 10;

    return (
        a.x +
            padding <
            b.x +
            b.width -
            padding &&

        a.x +
            a.width -
            padding >
            b.x +
            padding &&

        a.y +
            padding <
            b.y +
            b.height -
            padding &&

        a.y +
            a.height -
            padding >
            b.y +
            padding
    );
}

function circleRectCollision(
    circle,
    rect
) {

    const magnet =
        save.upgrades.magnet *
        4;

    const closestX =
        Math.max(
            rect.x -
                magnet,
            Math.min(
                circle.x,
                rect.x +
                    rect.width +
                    magnet
            )
        );

    const closestY =
        Math.max(
            rect.y -
                magnet,
            Math.min(
                circle.y,
                rect.y +
                    rect.height +
                    magnet
            )
        );

    const dx =
        circle.x -
        closestX;

    const dy =
        circle.y -
        closestY;

    return (
        dx * dx +
        dy * dy <
        Math.pow(
            circle.radius,
            2
        )
    );
}

function hitPlayer() {

    if (
        shieldTimer > 0 ||
        invincibleTimer > 0
    ) {

        createParticles(
            player.x + 30,
            player.y + 35,
            20,
            "#2ce1ff"
        );

        shake = 8;

        return;
    }

    health--;

    combo = 1;

    invincibleTimer = 75;

    shake = 15;

    createParticles(
        player.x + 30,
        player.y + 40,
        30,
        "#ff5571"
    );

    if (health <= 0) {

        endGame();
    }
}


/* =========================================================
   CONTROLS
========================================================= */

function jump() {

    if (!gameRunning) return;

    const jumpLevel =
        save.upgrades.jump;

    /*
       DOUBLE JUMP
    */

    if (
        !player.grounded &&
        !player.canDoubleJump
    ) {

        if (
            player.jumpCount >= 1
        ) {

            player.velocityY =
                player.jumpPower -
                jumpLevel * 1.15;

            player.jumpCount++;

            player.canDoubleJump = false;

            createParticles(
                player.x + 20,
                player.y + 65,
                15,
                player.color
            );

            save.missions.jumps++;

            return;
        }

        return;
    }

    player.velocityY =
        player.jumpPower -
        jumpLevel * 1.15;

    player.grounded = false;

    player.jumpCount =
        1;

    player.canDoubleJump =
        true;

    createParticles(
        player.x + 20,
        groundY,
        12,
        "#91a8bd"
    );

    save.missions.jumps++;
}

function dash() {

    if (!gameRunning) return;

    if (dashTimer > 0) return;

    const level =
        save.upgrades.dash;

    dashTimer =
        35 +
        level * 8;

    score +=
        100 *
        combo;

    save.missions.dashes++;

    createParticles(
        player.x,
        player.y + 40,
        25,
        "#ffd34d"
    );
}

function activateShield() {

    if (!gameRunning) return;

    if (shieldTimer > 0) return;

    const level =
        save.upgrades.shield;

    shieldTimer =
        90 +
        level * 20;

    save.missions.shields++;

    createParticles(
        player.x + 30,
        player.y + 40,
        30,
        "#2ce1ff"
    );
}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp" ||
            event.code === "KeyW"
        ) {

            event.preventDefault();

            jump();
        }

        if (
            event.code === "KeyD" ||
            event.code === "ShiftLeft"
        ) {

            dash();
        }

        if (
            event.code === "KeyS"
        ) {

            activateShield();
        }

    }
);


/* =========================================================
   BUTTON EVENTS
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startGame
    );
}

if (restartButton) {

    restartButton.addEventListener(
        "click",
        startGame
    );
}

if (jumpButton) {

    jumpButton.addEventListener(
        "click",
        jump
    );
}

if (dashButton) {

    dashButton.addEventListener(
        "click",
        dash
    );
}

if (shieldButton) {

    shieldButton.addEventListener(
        "click",
        activateShield
    );
}


/* =========================================================
   TOUCH
========================================================= */

if (canvas) {

    canvas.addEventListener(
        "pointerdown",
        event => {

            if (
                event.pointerType ===
                "touch"
            ) {

                jump();
            }
        }
    );
}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    if (!ctx) return;

    ctx.save();

    if (shake > 0) {

        ctx.translate(
            (Math.random() - 0.5) *
                shake,
            (Math.random() - 0.5) *
                shake
        );
    }

    ctx.clearRect(
        0,
        0,
        BASE_WIDTH,
        BASE_HEIGHT
    );

    drawSky();

    drawBackground();

    drawGround();

    drawCollectibles();

    drawObstacles();

    drawPlayer();

    drawParticles();

    drawVignette();

    ctx.restore();
}


/* =========================================================
   SKY
========================================================= */

function drawSky() {

    const world =
        worlds[
            save.selectedWorld
        ] ||
        worlds[0];

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

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        BASE_WIDTH,
        groundY
    );

    if (
        save.selectedWorld === 4
    ) {

        drawStars();

    } else {

        drawSun();

        drawClouds();
    }
}

function drawStars() {

    stars.forEach(star => {

        ctx.globalAlpha =
            star.alpha;

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function drawSun() {

    let color =
        "rgba(255,255,255,.35)";

    if (
        save.selectedWorld === 1
    ) {

        color =
            "rgba(255,211,77,.75)";
    }

    if (
        save.selectedWorld === 2
    ) {

        color =
            "rgba(180,240,255,.55)";
    }

    if (
        save.selectedWorld === 3
    ) {

        color =
            "rgba(255,85,113,.65)";
    }

    const glow =
        ctx.createRadialGradient(
            BASE_WIDTH - 150,
            100,
            5,
            BASE_WIDTH - 150,
            100,
            100
        );

    glow.addColorStop(
        0,
        color
    );

    glow.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    ctx.fillStyle =
        glow;

    ctx.fillRect(
        BASE_WIDTH - 260,
        0,
        220,
        220
    );
}

function drawClouds() {

    clouds.forEach(cloud => {

        cloud.x -=
            cloud.speed;

        if (
            cloud.x <
            -150
        ) {

            cloud.x =
                BASE_WIDTH +
                120;
        }

        ctx.fillStyle =
            "rgba(255,255,255,.07)";

        ctx.beginPath();

        ctx.arc(
            cloud.x,
            cloud.y,
            cloud.size * .5,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x +
                cloud.size * .6,
            cloud.y - 10,
            cloud.size * .65,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x +
                cloud.size * 1.2,
            cloud.y,
            cloud.size * .45,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    /*
       Mountains
    */

    ctx.fillStyle =
        "rgba(0,0,0,.15)";

    for (
        let x =
            -((distance * .2) % 180);
        x <
            BASE_WIDTH + 180;
        x += 180
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            groundY
        );

        ctx.lineTo(
            x + 90,
            groundY - 100
        );

        ctx.lineTo(
            x + 180,
            groundY
        );

        ctx.fill();
    }

    /*
       Distant structures
    */

    ctx.fillStyle =
        "rgba(255,255,255,.025)";

    for (
        let x =
            -((distance * .45) % 120);
        x <
            BASE_WIDTH + 120;
        x += 120
    ) {

        ctx.fillRect(
            x,
            groundY - 70,
            45,
            70
        );

        ctx.fillRect(
            x + 15,
            groundY - 100,
            10,
            30
        );
    }
}


/* =========================================================
   GROUND
========================================================= */

function drawGround() {

    const world =
        worlds[
            save.selectedWorld
        ] ||
        worlds[0];

    ctx.fillStyle =
        world.ground;

    ctx.fillRect(
        0,
        groundY,
        BASE_WIDTH,
        BASE_HEIGHT -
            groundY
    );

    ctx.strokeStyle =
        "rgba(255,255,255,.2)";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        0,
        groundY + 2
    );

    ctx.lineTo(
        BASE_WIDTH,
        groundY + 2
    );

    ctx.stroke();

    ctx.strokeStyle =
        "rgba(255,255,255,.06)";

    ctx.lineWidth = 2;

    for (
        let x =
            -((distance * 2) % 50);
        x <
            BASE_WIDTH + 50;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            groundY + 35
        );

        ctx.lineTo(
            x + 20,
            groundY + 35
        );

        ctx.stroke();
    }
}


/* =========================================================
   PLAYER
========================================================= */

function drawPlayer() {

    ctx.save();

    if (
        invincibleTimer > 0 &&
        Math.floor(
            invincibleTimer / 5
        ) % 2 === 0
    ) {

        ctx.globalAlpha =
            .45;
    }

    /*
       DASH TRAIL
    */

    if (
        dashTimer > 0
    ) {

        for (
            let i = 1;
            i <= 6;
            i++
        ) {

            ctx.globalAlpha =
                .12;

            ctx.fillStyle =
                player.color;

            ctx.fillRect(
                player.x -
                    i * 30,
                player.y + 20,
                45,
                20
            );
        }

        ctx.globalAlpha =
            1;
    }

    /*
       SHIELD
    */

    if (
        shieldTimer > 0
    ) {

        const pulse =
            Math.sin(
                performance.now() *
                    .01
            ) * 4;

        ctx.strokeStyle =
            "#2ce1ff";

        ctx.lineWidth = 4;

        ctx.shadowBlur = 30;

        ctx.shadowColor =
            "#2ce1ff";

        ctx.beginPath();

        ctx.arc(
            player.x +
                player.width / 2,
            player.y +
                player.height / 2,
            58 +
                pulse,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    /*
       GLOW
    */

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        player.glow;

    ctx.fillStyle =
        player.color;

    /*
       BODY
    */

    roundRect(
        ctx,
        player.x + 10,
        player.y + 22,
        42,
        43,
        13
    );

    ctx.fill();

    /*
       HEAD
    */

    ctx.beginPath();

    ctx.arc(
        player.x + 48,
        player.y + 22,
        22,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       TAIL
    */

    ctx.beginPath();

    ctx.moveTo(
        player.x + 14,
        player.y + 43
    );

    ctx.lineTo(
        player.x - 30,
        player.y + 62
    );

    ctx.lineTo(
        player.x + 15,
        player.y + 66
    );

    ctx.fill();

    /*
       EYE
    */

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "#06101d";

    ctx.beginPath();

    ctx.arc(
        player.x + 56,
        player.y + 16,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       LEGS
    */

    ctx.fillStyle =
        player.color;

    ctx.fillRect(
        player.x + 18,
        player.y + 60,
        10,
        22
    );

    ctx.fillRect(
        player.x + 39,
        player.y + 60,
        10,
        22
    );

    ctx.restore();
}


/* =========================================================
   OBSTACLE DRAWING
========================================================= */

function drawObstacles() {

    obstacles.forEach(
        obstacle => {

            ctx.save();

            if (
                obstacle.type ===
                "cactus"
            ) {

                drawCactus(
                    obstacle
                );
            }

            if (
                obstacle.type ===
                "rock"
            ) {

                drawRock(
                    obstacle
                );
            }

            if (
                obstacle.type ===
                "bird"
            ) {

                drawBird(
                    obstacle
                );
            }

            if (
                obstacle.type ===
                "crystal"
            ) {

                drawCrystal(
                    obstacle
                );
            }

            if (
                obstacle.type ===
                "spike"
            ) {

                drawSpike(
                    obstacle
                );
            }

            ctx.restore();
        }
    );
}

function drawCactus(o) {

    ctx.fillStyle =
        "#3db56d";

    roundRect(
        ctx,
        o.x,
        o.y,
        o.width,
        o.height,
        8
    );

    ctx.fill();

    ctx.fillRect(
        o.x - 13,
        o.y + 22,
        13,
        9
    );

    ctx.fillRect(
        o.x + o.width,
        o.y + 32,
        13,
        9
    );
}

function drawRock(o) {

    ctx.fillStyle =
        "#738296";

    ctx.beginPath();

    ctx.moveTo(
        o.x,
        o.y + o.height
    );

    ctx.lineTo(
        o.x + 12,
        o.y + 8
    );

    ctx.lineTo(
        o.x +
            o.width -
            10,
        o.y + 4
    );

    ctx.lineTo(
        o.x +
            o.width,
        o.y +
            o.height
    );

    ctx.closePath();

    ctx.fill();
}

function drawBird(o) {

    ctx.fillStyle =
        "#ff7c88";

    ctx.beginPath();

    ctx.arc(
        o.x + 28,
        o.y + 18,
        18,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "rgba(255,255,255,.7)";

    ctx.beginPath();

    ctx.moveTo(
        o.x + 15,
        o.y + 20
    );

    ctx.lineTo(
        o.x - 15,
        o.y + 5
    );

    ctx.lineTo(
        o.x + 5,
        o.y + 34
    );

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
        o.x + 38,
        o.y + 20
    );

    ctx.lineTo(
        o.x + 70,
        o.y + 5
    );

    ctx.lineTo(
        o.x + 48,
        o.y + 34
    );

    ctx.fill();
}

function drawCrystal(o) {

    ctx.shadowBlur = 20;

    ctx.shadowColor =
        "#b994ff";

    ctx.fillStyle =
        "#b994ff";

    ctx.beginPath();

    ctx.moveTo(
        o.x +
            o.width / 2,
        o.y
    );

    ctx.lineTo(
        o.x +
            o.width,
        o.y +
            o.height
    );

    ctx.lineTo(
        o.x,
        o.y +
            o.height
    );

    ctx.closePath();

    ctx.fill();
}

function drawSpike(o) {

    ctx.fillStyle =
        "#ff5571";

    const count = 4;

    const spikeWidth =
        o.width /
        count;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            o.x +
                i *
                spikeWidth,
            o.y +
                o.height
        );

        ctx.lineTo(
            o.x +
                i *
                spikeWidth +
                spikeWidth / 2,
            o.y
        );

        ctx.lineTo(
            o.x +
                (i + 1) *
                spikeWidth,
            o.y +
                o.height
        );

        ctx.closePath();

        ctx.fill();
    }
}


/* =========================================================
   GEMS DRAW
========================================================= */

function drawCollectibles() {

    collectibles.forEach(
        gem => {

            ctx.save();

            ctx.translate(
                gem.x,
                gem.y
            );

            ctx.rotate(
                gem.angle
            );

            ctx.shadowBlur = 25;

            ctx.shadowColor =
                "#2ce1ff";

            ctx.fillStyle =
                "#2ce1ff";

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
                "rgba(255,255,255,.7)";

            ctx.fillRect(
                -3,
                -7,
                6,
                10
            );

            ctx.restore();
        }
    );
}


/* =========================================================
   PARTICLES
========================================================= */

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
                (
                    Math.random() -
                    .5
                ) * 8,

            vy:
                (
                    Math.random() -
                    .5
                ) * 8,

            size:
                2 +
                Math.random() * 5,

            life:
                30 +
                Math.random() * 30,

            color
        });
    }
}

function updateParticles(delta) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x +=
            particle.vx *
            delta;

        particle.y +=
            particle.vy *
            delta;

        particle.vy +=
            .08 *
            delta;

        particle.life -=
            delta;

        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.save();

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life /
                        60
                );

            ctx.fillStyle =
                particle.color;

            ctx.shadowBlur = 10;

            ctx.shadowColor =
                particle.color;

            ctx.fillRect(
                particle.x,
                particle.y,
                particle.size,
                particle.size
            );

            ctx.restore();
        }
    );
}


/* =========================================================
   FLOATING TEXT
========================================================= */

const floatingTexts = [];

function createFloatingText(
    x,
    y,
    text,
    color
) {

    floatingTexts.push({
        x,
        y,
        text,
        color,
        life: 60
    });
}

function updateFloatingTexts(delta) {

    for (
        let i =
            floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            floatingTexts[i];

        item.y -=
            .5 *
            delta;

        item.life -=
            delta;

        if (
            item.life <= 0
        ) {

            floatingTexts.splice(
                i,
                1
            );
        }
    }
}

function drawFloatingTexts() {

    floatingTexts.forEach(
        item => {

            ctx.save();

            ctx.globalAlpha =
                item.life / 60;

            ctx.fillStyle =
                item.color;

            ctx.font =
                "900 28px Orbitron";

            ctx.textAlign =
                "center";

            ctx.shadowBlur = 20;

            ctx.shadowColor =
                item.color;

            ctx.fillText(
                item.text,
                item.x,
                item.y
            );

            ctx.restore();
        }
    );
}


/* =========================================================
   VIGNETTE
========================================================= */

function drawVignette() {

    const gradient =
        ctx.createRadialGradient(
            BASE_WIDTH / 2,
            BASE_HEIGHT / 2,
            100,
            BASE_WIDTH / 2,
            BASE_HEIGHT / 2,
            700
        );

    gradient.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,.45)"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        BASE_WIDTH,
        BASE_HEIGHT
    );

    drawFloatingTexts();
}


/* =========================================================
   ROUND RECT
========================================================= */

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


/* =========================================================
   REDEEM SYSTEM
   Codes are intentionally NOT displayed publicly.
========================================================= */

const giftCodes = {

    RUN100: 100,

    LEGEND1000: 1000,

    DINO5000: 5000,

    LEGENDARY500K: 500000,

    ULTRA10M: 10000000,

    MYTHIC100M: 100000000,

    OMEGA1B: 1000000000,

    SECRET5B: 5000000000,

    // SPECIAL
    LEGEND26B: 26000000000
};

function redeemCode() {

    if (!codeInput) return;

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
        giftCodes[code] ===
        undefined
    ) {

        showMessage(
            "کد نامعتبر است!",
            "#ff5571"
        );

        return;
    }

    if (
        save.usedCodes
            .includes(code)
    ) {

        showMessage(
            "این کد قبلاً استفاده شده.",
            "#ffd34d"
        );

        return;
    }

    const reward =
        giftCodes[code];

    save.gems +=
        reward;

    save.usedCodes.push(
        code
    );

    addXP(
        Math.min(
            10000,
            Math.floor(
                reward / 100000
            )
        )
    );

    saveGame();

    updateUI();

    codeInput.value = "";

    showMessage(
        `🎉 ${formatNumber(reward)} GEM دریافت کردی!`,
        "#50f5a1"
    );
}

if (redeemButton) {

    redeemButton.addEventListener(
        "click",
        redeemCode
    );
}

if (codeInput) {

    codeInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                redeemCode();
            }
        }
    );
}


/* =========================================================
   MESSAGE
========================================================= */

let messageTimer = null;

function showMessage(
    text,
    color = "#50f5a1"
) {

    if (!codeMessage) {

        console.log(text);

        return;
    }

    codeMessage.textContent =
        text;

    codeMessage.style.color =
        color;

    clearTimeout(
        messageTimer
    );

    messageTimer =
        setTimeout(
            () => {

                codeMessage.textContent =
                    "";

            },
            3500
        );
}


/* =========================================================
   BACKGROUND INIT
========================================================= */

function createBackground() {

    clouds = [];
    stars = [];

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        clouds.push({

            x:
                Math.random() *
                BASE_WIDTH,

            y:
                40 +
                Math.random() *
                180,

            size:
                25 +
                Math.random() *
                45,

            speed:
                .25 +
                Math.random() *
                .5
        });
    }

    for (
        let i = 0;
        i < 120;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                BASE_WIDTH,

            y:
                Math.random() *
                330,

            size:
                1 +
                Math.random() *
                2,

            alpha:
                .2 +
                Math.random() *
                .8
        });
    }
}


/* =========================================================
   RESPONSIVE CANVAS
========================================================= */

function resizeCanvas() {

    if (!canvas || !ctx) {
        return;
    }

    const rect =
        canvas.getBoundingClientRect();

    if (
        rect.width <= 0 ||
        rect.height <= 0
    ) {
        return;
    }

    /*
       IMPORTANT:
       Internal game coordinates remain
       1200 x 500.
       CSS handles visual scaling.
    */

    const ratio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    const width =
        Math.floor(
            BASE_WIDTH *
            ratio
        );

    const height =
        Math.floor(
            BASE_HEIGHT *
            ratio
        );

    if (
        canvas.width !== width ||
        canvas.height !== height
    ) {

        canvas.width =
            width;

        canvas.height =
            height;
    }

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   RESET SAVE
   Console only:
   resetDinoSave()
========================================================= */

window.resetDinoSave =
    function () {

        localStorage.removeItem(
            SAVE_KEY
        );

        location.reload();
    };


/* =========================================================
   DEBUG
========================================================= */

window.DinoLegends =
    {

        getSave() {
            return save;
        },

        addGems(amount) {

            if (
                typeof amount !==
                "number"
            ) {
                return;
            }

            save.gems +=
                amount;

            saveGame();

            updateUI();
        },

        unlockAllSkins() {

            save.unlockedCharacters =
                characters.map(
                    (_, i) => i
                );

            saveGame();

            renderCharacters();

            updateUI();
        },

        unlockAllWorlds() {

            save.unlockedWorlds =
                worlds.map(
                    (_, i) => i
                );

            saveGame();

            renderWorlds();
        }
    };


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

    if (!canvas || !ctx) {

        console.error(
            "DINO LEGENDS ERROR: #gameCanvas not found."
        );

        return;
    }

    applyCharacter();

    createBackground();

    resizeCanvas();

    renderCharacters();

    renderUpgrades();

    renderWorlds();

    renderMissionsIfPossible();

    updateUI();

    /*
       Initialize double jump
    */

    player.jumpCount = 0;

    player.canDoubleJump = false;

    /*
       Initial scene
    */

    draw();

    console.log(
        "🦖 DINO LEGENDS ENGINE LOADED"
    );

    console.log(
        "100 skins loaded."
    );

    console.log(
        "26 billion special redeem loaded."
    );
}

initialize();
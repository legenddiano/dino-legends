"use strict";

/* =========================================================
   DINO LEGENDS - GAME ENGINE
   REDEEM:
   TRILLION1 = 1,000,000,000,000 GEMS - ONE TIME ONLY
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =========================
   UI
========================= */

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


/* =========================================================
   SAVE SYSTEM
========================================================= */

const SAVE_KEY = "dinoLegendsSaveV3";

const defaultSave = {
    gems: 0,
    bestScore: 0,

    selectedCharacter: 0,

    unlockedCharacters: [0],

    upgrades: {
        jump: 0,
        shield: 0,
        dash: 0
    },

    unlockedWorlds: [0],
    selectedWorld: 0,

    usedCodes: []
};

let save = loadGame();

function cloneDefaultSave() {
    return JSON.parse(JSON.stringify(defaultSave));
}

function loadGame() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(SAVE_KEY)
            );

        if (!stored) {
            return cloneDefaultSave();
        }

        return {

            ...cloneDefaultSave(),

            ...stored,

            upgrades: {
                ...defaultSave.upgrades,
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

        console.error(
            "Save loading error:",
            error
        );

        return cloneDefaultSave();
    }
}

function saveGame() {

    try {

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(save)
        );

    } catch (error) {

        console.error(
            "Save error:",
            error
        );
    }
}


/* =========================================================
   GAME DATA
========================================================= */

const characters = [

    {
        name: "Rex",
        emoji: "🦖",
        subtitle: "THE ORIGINAL LEGEND",
        description:
            "Balanced speed, jump and survival power.",
        cost: 0,
        color: "#50f5a1"
    },

    {
        name: "Blaze",
        emoji: "🔥",
        subtitle: "SPEED HUNTER",
        description:
            "Faster dash and better movement.",
        cost: 250,
        color: "#ff9a4d"
    },

    {
        name: "Frost",
        emoji: "❄️",
        subtitle: "ICE GUARDIAN",
        description:
            "Stronger shield protection.",
        cost: 700,
        color: "#7de8ff"
    },

    {
        name: "Volt",
        emoji: "⚡",
        subtitle: "LIGHTNING BEAST",
        description:
            "Powerful dash and score bonus.",
        cost: 1500,
        color: "#ffe05d"
    },

    {
        name: "Shadow",
        emoji: "🌌",
        subtitle: "ULTIMATE LEGEND",
        description:
            "Rare legendary survival power.",
        cost: 4000,
        color: "#b994ff"
    }
];


const worlds = [

    {
        name: "JURASSIC JUNGLE",
        className: "jungle",
        description:
            "The classic dinosaur world.",
        cost: 0,
        skyTop: "#12394a",
        skyBottom: "#0b1f27",
        ground: "#173e2b"
    },

    {
        name: "GOLDEN DESERT",
        className: "desert",
        description:
            "Endless burning dunes.",
        cost: 500,
        skyTop: "#704715",
        skyBottom: "#1c1006",
        ground: "#654116"
    },

    {
        name: "FROZEN ERA",
        className: "ice",
        description:
            "A dangerous world of ice.",
        cost: 1200,
        skyTop: "#1d5876",
        skyBottom: "#071827",
        ground: "#164256"
    },

    {
        name: "VOLCANO CORE",
        className: "volcano",
        description:
            "The ground itself is dangerous.",
        cost: 2500,
        skyTop: "#56111a",
        skyBottom: "#180408",
        ground: "#4b1517"
    },

    {
        name: "COSMIC VOID",
        className: "space",
        description:
            "The final legendary dimension.",
        cost: 5000,
        skyTop: "#130d35",
        skyBottom: "#05040e",
        ground: "#171238"
    }
];


const upgrades = [

    {
        key: "jump",
        emoji: "⬆️",
        name: "SUPER JUMP",
        description:
            "Jump higher and escape obstacles."
    },

    {
        key: "shield",
        emoji: "🛡️",
        name: "SHIELD CORE",
        description:
            "Increase shield duration."
    },

    {
        key: "dash",
        emoji: "⚡",
        name: "DASH ENGINE",
        description:
            "Make dash faster and longer."
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

const groundY = 420;


const player = {

    x: 150,

    y: groundY - 80,

    width: 62,

    height: 80,

    velocityY: 0,

    gravity: 0.75,

    jumpPower: -15,

    grounded: true,

    color: "#50f5a1"
};


/* =========================================================
   BACKGROUND
========================================================= */

function createBackground() {

    clouds = [];
    stars = [];

    for (let i = 0; i < 7; i++) {

        clouds.push({

            x:
                Math.random() *
                canvas.width,

            y:
                40 +
                Math.random() *
                180,

            size:
                25 +
                Math.random() *
                45,

            speed:
                0.3 +
                Math.random() *
                0.5
        });
    }


    for (let i = 0; i < 100; i++) {

        stars.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                330,

            size:
                1 +
                Math.random() * 2,

            alpha:
                0.2 +
                Math.random() * 0.8
        });
    }
}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    gemsEl.textContent =
        formatNumber(save.gems);

    bestScoreEl.textContent =
        formatNumber(save.bestScore);

    levelEl.textContent =
        Math.max(
            1,
            Math.floor(
                save.bestScore / 1000
            ) + 1
        );

    scoreEl.textContent =
        Math.floor(score);

    comboEl.textContent =
        "x" + combo;

    healthEl.textContent =
        "❤️".repeat(
            Math.max(0, health)
        ) +
        "🖤".repeat(
            Math.max(0, 3 - health)
        );

    characterCountEl.textContent =
        save.unlockedCharacters.length +
        " / " +
        characters.length;
}


function formatNumber(number) {

    return Number(number).toLocaleString(
        "en-US"
    );
}


/* =========================================================
   TABS
========================================================= */

document
    .querySelectorAll(".tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const target =
                    tab.dataset.panel;

                document
                    .querySelectorAll(".tab")
                    .forEach(button => {

                        button.classList.remove(
                            "active"
                        );

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
                    document.getElementById(
                        target
                    );

                if (panel) {

                    panel.classList.add(
                        "active-panel"
                    );
                }
            }
        );

    });


/* =========================================================
   CHARACTERS
========================================================= */

function renderCharacters() {

    characterGrid.innerHTML = "";

    characters.forEach(
        (character, index) => {

            const unlocked =
                save.unlockedCharacters
                    .includes(index);

            const selected =
                save.selectedCharacter ===
                index;

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "character-card" +
                (
                    selected
                        ? " selected"
                        : ""
                );

            const buttonText =
                selected
                    ? "SELECTED"
                    : unlocked
                        ? "SELECT"
                        : "UNLOCK";

            card.innerHTML = `

                <div class="card-top">

                    <div class="card-emoji">
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
                        class="card-btn ${
                            unlocked
                                ? ""
                                : "locked"
                        }"
                        data-character="${index}">
                        ${buttonText}
                    </button>

                </div>
            `;

            characterGrid.appendChild(card);
        }
    );


    document
        .querySelectorAll(
            "[data-character]"
        )
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

    if (
        save.unlockedCharacters
            .includes(index)
    ) {

        save.selectedCharacter =
            index;

        player.color =
            character.color;

        saveGame();

        renderCharacters();
        updateUI();

        return;
    }


    if (
        save.gems <
        character.cost
    ) {

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

    player.color =
        character.color;

    saveGame();

    renderCharacters();
    updateUI();

    showMessage(
        character.name +
        " unlocked!",
        "#50f5a1"
    );
}


/* =========================================================
   UPGRADES
========================================================= */

function getUpgradeCost(level) {

    return 200 +
        level * 300;
}


function renderUpgrades() {

    upgradeGrid.innerHTML = "";

    upgrades.forEach(upgrade => {

        const currentLevel =
            save.upgrades[
                upgrade.key
            ];

        const cost =
            getUpgradeCost(
                currentLevel
            );

        const card =
            document.createElement(
                "article"
            );

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
                        / 5
                    </p>

                </div>

            </div>

            <p class="card-description">
                ${upgrade.description}
            </p>

            <div class="card-footer">

                <span class="card-cost">

                    ${
                        currentLevel >= 5
                            ? "MAX LEVEL"
                            : "💎 " +
                              formatNumber(cost)
                    }

                </span>

                <button
                    class="card-btn"
                    data-upgrade="${upgrade.key}">

                    ${
                        currentLevel >= 5
                            ? "MAX"
                            : "UPGRADE"
                    }

                </button>

            </div>
        `;

        upgradeGrid.appendChild(card);
    });


    document
        .querySelectorAll(
            "[data-upgrade]"
        )
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

    const current =
        save.upgrades[key];

    if (current >= 5) {
        return;
    }

    const cost =
        getUpgradeCost(current);

    if (
        save.gems <
        cost
    ) {

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
        "Upgrade complete!",
        "#50f5a1"
    );
}


/* =========================================================
   WORLDS
========================================================= */

function renderWorlds() {

    worldGrid.innerHTML = "";

    worlds.forEach(
        (world, index) => {

            const unlocked =
                save.unlockedWorlds
                    .includes(index);

            const selected =
                save.selectedWorld ===
                index;

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "world-card" +
                (
                    selected
                        ? " selected"
                        : ""
                );

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
                                ? (
                                    selected
                                        ? "✓ ACTIVE"
                                        : "✓ UNLOCKED"
                                )
                                : "💎 " +
                                  formatNumber(
                                      world.cost
                                  )
                        }

                    </span>

                    <button
                        class="card-btn ${
                            unlocked
                                ? ""
                                : "locked"
                        }"
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
        }
    );


    document
        .querySelectorAll(
            "[data-world]"
        )
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


    if (
        save.gems <
        world.cost
    ) {

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
   GAME START
========================================================= */

function startGame() {

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );
    }

    score = 0;
    combo = 1;
    health = 3;

    gameSpeed = 8;
    distance = 0;

    obstacleTimer = 0;
    gemTimer = 0;

    dashTimer = 0;
    shieldTimer = 0;
    invincibleTimer = 0;

    particles = [];
    obstacles = [];
    collectibles = [];

    const selectedCharacter =
        characters[
            save.selectedCharacter
        ];

    player.color =
        selectedCharacter.color;

    player.y =
        groundY -
        player.height;

    player.velocityY = 0;

    player.grounded = true;

    gameRunning = true;

    lastTime =
        performance.now();

    startScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    updateUI();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


function endGame() {

    gameRunning = false;

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );
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

    saveGame();

    finalScoreEl.textContent =
        formatNumber(finalScore);

    updateUI();

    gameOverScreen.classList.remove(
        "hidden"
    );
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

    lastTime =
        timestamp;

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
        gameSpeed * delta;

    score +=
        0.18 *
        combo *
        delta *
        (
            dashTimer > 0
                ? 1.7
                : 1
        );

    gameSpeed =
        Math.min(
            18,
            8 +
            score / 1000
        );

    updatePlayer(delta);
    updateTimers(delta);
    spawnObjects(delta);
    updateObstacles(delta);
    updateCollectibles(delta);
    updateParticles(delta);

    updateUI();
}


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

    if (dashTimer > 0) {
        dashTimer -= delta;
    }

    if (shieldTimer > 0) {
        shieldTimer -= delta;
    }

    if (invincibleTimer > 0) {
        invincibleTimer -= delta;
    }
}


function spawnObjects(delta) {

    obstacleTimer += delta;
    gemTimer += delta;

    const obstacleInterval =
        Math.max(
            65,
            125 -
            gameSpeed * 3
        );

    if (
        obstacleTimer >
        obstacleInterval
    ) {

        spawnObstacle();

        obstacleTimer = 0;
    }


    if (gemTimer > 48) {

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
        "bird"
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
            150 -
            Math.random() * 70;
    }


    obstacles.push({

        type,

        x:
            canvas.width + 40,

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

            obstacles.splice(i, 1);

            continue;
        }


        if (
            !obstacle.counted &&
            obstacle.x +
                obstacle.width <
                player.x
        ) {

            obstacle.counted = true;

            combo =
                Math.min(
                    10,
                    combo + 1
                );

            score +=
                25 * combo;
        }


        if (
            obstacle.x +
                obstacle.width <
                -50
        ) {

            obstacles.splice(i, 1);
        }
    }
}


/* =========================================================
   GEMS
========================================================= */

function spawnGem() {

    collectibles.push({

        x:
            canvas.width + 30,

        y:
            groundY -
            80 -
            Math.random() * 170,

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

            save.gems++;

            score +=
                50 * combo;

            combo =
                Math.min(
                    10,
                    combo + 1
                );

            createParticles(
                gem.x,
                gem.y,
                16,
                "#2ce1ff"
            );

            collectibles.splice(
                i,
                1
            );

            saveGame();

            continue;
        }


        if (gem.x < -50) {

            collectibles.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   COLLISION
========================================================= */

function checkCollision(a, b) {

    const padding = 10;

    return (

        a.x + padding <
            b.x +
            b.width -
            padding &&

        a.x +
            a.width -
            padding >
            b.x +
            padding &&

        a.y + padding <
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

    const closestX =
        Math.max(
            rect.x,
            Math.min(
                circle.x,
                rect.x +
                    rect.width
            )
        );

    const closestY =
        Math.max(
            rect.y,
            Math.min(
                circle.y,
                rect.y +
                    rect.height
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
            player.x + 30,
            player.y + 35,
            18,
            shieldTimer > 0
                ? "#2ce1ff"
                : "#ffffff"
        );

        return;
    }


    health--;

    combo = 1;

    invincibleTimer = 75;


    createParticles(
        player.x + 30,
        player.y + 40,
        25,
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

    if (!gameRunning) {
        return;
    }

    if (!player.grounded) {
        return;
    }

    const jumpLevel =
        save.upgrades.jump;

    player.velocityY =
        player.jumpPower -
        jumpLevel * 1.1;

    player.grounded = false;


    createParticles(
        player.x + 20,
        groundY,
        10,
        "#91a8bd"
    );
}


function dash() {

    if (!gameRunning) {
        return;
    }

    if (dashTimer > 0) {
        return;
    }

    const dashLevel =
        save.upgrades.dash;

    dashTimer =
        35 +
        dashLevel * 8;


    createParticles(
        player.x,
        player.y + 40,
        20,
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

    const shieldLevel =
        save.upgrades.shield;

    shieldTimer =
        90 +
        shieldLevel * 20;


    createParticles(
        player.x + 30,
        player.y + 40,
        24,
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
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            jump();
        }


        if (
            event.code === "KeyD"
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
   BUTTONS
========================================================= */

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


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawSky();
    drawBackground();
    drawGround();
    drawCollectibles();
    drawObstacles();
    drawPlayer();
    drawParticles();
}


/* =========================================================
   SKY
========================================================= */

function drawSky() {

    const world =
        worlds[
            save.selectedWorld
        ];

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
        canvas.width,
        groundY
    );


    if (
        save.selectedWorld === 4
    ) {

        stars.forEach(star => {

            ctx.globalAlpha =
                star.alpha;

            ctx.fillStyle =
                "#ffffff";

            ctx.fillRect(
                star.x,
                star.y,
                star.size,
                star.size
            );
        });

        ctx.globalAlpha = 1;

    } else {

        drawSun();
        drawClouds();
    }
}


function drawSun() {

    const world =
        save.selectedWorld;

    let color =
        "rgba(255,255,255,0.3)";


    if (world === 1) {

        color =
            "rgba(255,211,77,0.7)";
    }


    if (world === 2) {

        color =
            "rgba(180,240,255,0.5)";
    }


    if (world === 3) {

        color =
            "rgba(255,85,113,0.55)";
    }


    ctx.beginPath();

    ctx.fillStyle =
        color;

    ctx.arc(
        canvas.width - 150,
        100,
        45,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawClouds() {

    clouds.forEach(cloud => {

        cloud.x -=
            cloud.speed;

        if (cloud.x < -150) {

            cloud.x =
                canvas.width + 100;
        }


        ctx.fillStyle =
            "rgba(255,255,255,0.08)";

        ctx.beginPath();

        ctx.arc(
            cloud.x,
            cloud.y,
            cloud.size * 0.5,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x +
                cloud.size * 0.6,
            cloud.y - 10,
            cloud.size * 0.65,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x +
                cloud.size * 1.2,
            cloud.y,
            cloud.size * 0.45,
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

    ctx.fillStyle =
        "rgba(0,0,0,0.12)";

    for (
        let x =
            -(
                (distance * 0.2) %
                160
            );

        x <
            canvas.width + 160;

        x += 160
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            groundY
        );

        ctx.lineTo(
            x + 80,
            groundY - 80
        );

        ctx.lineTo(
            x + 160,
            groundY
        );

        ctx.fill();
    }
}


function drawGround() {

    const world =
        worlds[
            save.selectedWorld
        ];

    ctx.fillStyle =
        world.ground;

    ctx.fillRect(
        0,
        groundY,
        canvas.width,
        canvas.height -
            groundY
    );


    ctx.strokeStyle =
        "rgba(255,255,255,0.15)";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        0,
        groundY + 2
    );

    ctx.lineTo(
        canvas.width,
        groundY + 2
    );

    ctx.stroke();


    ctx.strokeStyle =
        "rgba(255,255,255,0.07)";

    ctx.lineWidth = 2;


    for (
        let x =
            -(
                (distance * 2) %
                50
            );

        x <
            canvas.width + 50;

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

        ctx.globalAlpha = 0.45;
    }


    if (dashTimer > 0) {

        ctx.fillStyle =
            "rgba(255,211,77,0.2)";

        for (
            let i = 1;
            i <= 4;
            i++
        ) {

            ctx.fillRect(
                player.x -
                    i * 35,
                player.y + 20,
                40,
                18
            );
        }
    }


    if (shieldTimer > 0) {

        ctx.strokeStyle =
            "#2ce1ff";

        ctx.lineWidth = 4;

        ctx.shadowBlur = 25;

        ctx.shadowColor =
            "#2ce1ff";

        ctx.beginPath();

        ctx.arc(
            player.x +
                player.width / 2,
            player.y +
                player.height / 2,
            58,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.shadowBlur = 0;
    }


    ctx.shadowBlur = 20;

    ctx.shadowColor =
        player.color;

    ctx.fillStyle =
        player.color;


    roundRect(
        ctx,
        player.x + 10,
        player.y + 22,
        42,
        43,
        13
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        player.x + 48,
        player.y + 22,
        22,
        0,
        Math.PI * 2
    );

    ctx.fill();


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

    obstacles.forEach(obstacle => {

        ctx.save();


        if (
            obstacle.type ===
            "cactus"
        ) {

            ctx.fillStyle =
                "#3db56d";

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
                obstacle.x - 13,
                obstacle.y + 22,
                13,
                9
            );

            ctx.fillRect(
                obstacle.x +
                    obstacle.width,
                obstacle.y + 32,
                13,
                9
            );
        }


        if (
            obstacle.type ===
            "rock"
        ) {

            ctx.fillStyle =
                "#738296";

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x,
                obstacle.y +
                    obstacle.height
            );

            ctx.lineTo(
                obstacle.x + 12,
                obstacle.y + 8
            );

            ctx.lineTo(
                obstacle.x +
                    obstacle.width -
                    10,
                obstacle.y + 4
            );

            ctx.lineTo(
                obstacle.x +
                    obstacle.width,
                obstacle.y +
                    obstacle.height
            );

            ctx.closePath();

            ctx.fill();
        }


        if (
            obstacle.type ===
            "bird"
        ) {

            ctx.fillStyle =
                "#ff7c88";

            ctx.beginPath();

            ctx.arc(
                obstacle.x + 28,
                obstacle.y + 18,
                18,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "rgba(255,255,255,0.7)";


            ctx.beginPath();

            ctx.moveTo(
                obstacle.x + 15,
                obstacle.y + 20
            );

            ctx.lineTo(
                obstacle.x - 15,
                obstacle.y + 5
            );

            ctx.lineTo(
                obstacle.x + 5,
                obstacle.y + 34
            );

            ctx.fill();


            ctx.beginPath();

            ctx.moveTo(
                obstacle.x + 38,
                obstacle.y + 20
            );

            ctx.lineTo(
                obstacle.x + 70,
                obstacle.y + 5
            );

            ctx.lineTo(
                obstacle.x + 48,
                obstacle.y + 34
            );

            ctx.fill();
        }


        ctx.restore();
    });
}


/* =========================================================
   GEM DRAWING
========================================================= */

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

        ctx.shadowBlur = 20;

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
            "rgba(255,255,255,0.6)";

        ctx.fillRect(
            -3,
            -7,
            6,
            10
        );


        ctx.restore();
    });
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
                    0.5
                ) * 8,

            vy:
                (
                    Math.random() -
                    0.5
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
            0.08 *
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
   REDEEM CODES
========================================================= */

const giftCodes = {

    /*
     * ONE-TIME CODE
     * 1 TRILLION GEMS
     */
    TRILLION1: 1000000000000,

    RUN100: 100,

    LEGEND1000: 1000,

    DINO5000: 5000
};


/*
 * این تابع فقط یک بار اجازه استفاده
 * از هر کد را می‌دهد.
 */
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


    /*
     * مهم:
     * از hasOwnProperty استفاده شده تا
     * کدهای نامعتبر درست تشخیص داده شوند.
     */
    if (
        !Object.prototype
            .hasOwnProperty
            .call(
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


    /*
     * جلوگیری از استفاده دوباره
     */
    if (
        save.usedCodes
            .includes(code)
    ) {

        showMessage(
            "این کد قبلاً استفاده شده است.",
            "#ffd34d"
        );

        return;
    }


    const reward =
        giftCodes[code];


    /*
     * اضافه کردن جایزه
     */
    save.gems += reward;


    /*
     * ثبت مصرف کد
     */
    save.usedCodes.push(code);


    saveGame();

    updateUI();


    codeInput.value = "";


    showMessage(
        "🎉 " +
        formatNumber(reward) +
        " جم گرفتی!",
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
            event.key ===
            "Enter"
        ) {

            redeemCode();
        }
    }
);


/* =========================================================
   MESSAGE
========================================================= */

let messageTimer = null;

function showMessage(
    text,
    color = "#50f5a1"
) {

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
            3000
        );
}


/* =========================================================
   RESIZE
========================================================= */

function resizeCanvas() {

    const ratio =
        window.devicePixelRatio ||
        1;

    const displayWidth =
        canvas.clientWidth;

    const displayHeight =
        canvas.clientHeight;


    if (
        canvas.width !==
            Math.floor(
                displayWidth *
                ratio
            ) ||

        canvas.height !==
            Math.floor(
                displayHeight *
                ratio
            )
    ) {

        canvas.width =
            Math.floor(
                displayWidth *
                ratio
            );

        canvas.height =
            Math.floor(
                displayHeight *
                ratio
            );


        ctx.setTransform(
            canvas.width / 1200,
            0,
            0,
            canvas.height / 500,
            0,
            0
        );
    }
}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   STARTUP
========================================================= */

function initialize() {

    const selectedCharacter =
        characters[
            save.selectedCharacter
        ];


    player.color =
        selectedCharacter.color;


    createBackground();

    renderCharacters();

    renderUpgrades();

    renderWorlds();

    updateUI();

    resizeCanvas();

    draw();
}


initialize();

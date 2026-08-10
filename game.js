"use strict";

/* =========================================================
   DINO LEGENDS — ULTIMATE EDITION
   Stable standalone game engine
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const $ = id => document.getElementById(id);

const SAVE_KEY = "DINO_LEGENDS_ULTIMATE_V1";

/* =========================================================
   DATA
========================================================= */

const SKINS = [
  ["Arthur Rex","⚔️",0,"LEGENDARY KNIGHT"],
  ["Ghost Rex","👻",500000,"PHANTOM"],
  ["Price Raptor","🎯",900000,"ELITE OPERATIVE"],
  ["Leon Rex","🦁",1500000,"SURVIVOR"],
  ["Agent Rex","🕶️",2500000,"STEALTH"],
  ["Michael Rex","🚗",4000000,"OUTLAW"],
  ["CJ Rex","🏙️",6500000,"STREET KING"],
  ["Cyber Rex","🤖",10000000,"CYBER MYTHIC"],
  ["Samurai Rex","🥷",16000000,"SHADOW WARRIOR"],
  ["Valkyrie Rex","🪽",25000000,"SKY LEGEND"],
  ["Dragon Lord","🐉",40000000,"ANCIENT"],
  ["Demon Rex","😈",65000000,"INFERNAL"],
  ["Ice Emperor","🧊",100000000,"FROSTBORN"],
  ["Storm Emperor","⚡",150000000,"THUNDERBORN"],
  ["Void Emperor","🌌",250000000,"COSMIC"],
  ["Golden Titan","👑",400000000,"ROYAL"],
  ["Neon Phantom","💠",650000000,"NEON"],
  ["Blood Moon Rex","🌑",900000000,"NIGHTMARE"],
  ["Galaxy Rex","🌠",1500000000,"GALACTIC"],
  ["Eternal Dragon","♾️",3000000000,"ETERNAL"]
];

const ICONS = [
  "🐲","🦕","🦖","🐉","👾",
  "🤖","🦄","🌟","☄️","🪐",
  "💀","🪽","🔥","❄️","⚡",
  "🌌","👑","💎","🗿","🎭"
];

while(SKINS.length < 100){
  const i = SKINS.length;

  const rarity =
    i < 35 ? "EPIC" :
    i < 60 ? "LEGENDARY" :
    i < 80 ? "MYTHIC" :
    "DIVINE";

  const price =
    Math.floor(
      3000000000 *
      Math.pow(1.045,i - 19)
    );

  SKINS.push([
    "Legendary Beast " + (i + 1),
    ICONS[i % ICONS.length],
    price,
    rarity
  ]);
}

const DEFAULT_SAVE = {
  gems:2500,
  best:0,
  skin:0,
  owned:[0],
  used:[],
  runs:0,

  upgrades:{
    speed:0,
    jump:0,
    shield:0
  },

  missions:{
    run:0,
    gems:0,
    jumps:0
  }
};

const REDEEM_CODES = Object.freeze({
  TRILLION1:1000000000000,
  DINO100:100,
  LEGEND500:500,
  FANTASY1K:1000,
  MYTHIC50K:50000,
  LEGENDARY1M:1000000
});

/* =========================================================
   SAVE SYSTEM
========================================================= */

function cloneDefault(){
  return JSON.parse(
    JSON.stringify(DEFAULT_SAVE)
  );
}

function loadSave(){

  try{

    const raw =
      localStorage.getItem(SAVE_KEY);

    if(!raw){
      return cloneDefault();
    }

    const parsed = JSON.parse(raw);

    return {
      ...cloneDefault(),
      ...parsed,

      upgrades:{
        ...DEFAULT_SAVE.upgrades,
        ...(parsed.upgrades || {})
      },

      missions:{
        ...DEFAULT_SAVE.missions,
        ...(parsed.missions || {})
      },

      owned:
        Array.isArray(parsed.owned)
          ? parsed.owned
          : [0],

      used:
        Array.isArray(parsed.used)
          ? parsed.used
          : []
    };

  }catch(error){

    console.warn(
      "Save data reset:",
      error
    );

    return cloneDefault();
  }
}

let save = loadSave();

function persist(){
  try{
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(save)
    );
  }catch(error){
    console.warn(
      "Could not save:",
      error
    );
  }
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
let obstacleTimer = 0;
let gemTimer = 0;
let dashTimer = 0;
let shieldActive = false;

let obstacles = [];
let gems = [];

const GROUND = 430;

const PLAYER = {
  x:150,
  y:360,
  w:58,
  h:70,
  vy:0,
  jumps:0
};

/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas(){

  const rect =
    canvas.getBoundingClientRect();

  const ratio =
    window.devicePixelRatio || 1;

  canvas.width =
    Math.max(1,
      Math.floor(rect.width * ratio)
    );

  canvas.height =
    Math.max(1,
      Math.floor(rect.height * ratio)
    );

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
   PROFILE
========================================================= */

function getLevel(){

  return Math.max(
    1,
    Math.floor(save.best / 2500) + 1
  );
}

function getRank(){

  const l = getLevel();

  if(l >= 40) return "MYTHIC";
  if(l >= 25) return "LEGEND";
  if(l >= 15) return "ELITE";
  if(l >= 5) return "HUNTER";

  return "ROOKIE";
}

/* =========================================================
   UI
========================================================= */

function updateUI(){

  if($("gems"))
    $("gems").textContent =
      save.gems.toLocaleString();

  if($("bestScore"))
    $("bestScore").textContent =
      Math.floor(save.best)
        .toLocaleString();

  if($("level"))
    $("level").textContent =
      getLevel();

  if($("score"))
    $("score").textContent =
      Math.floor(score)
        .toLocaleString();

  if($("combo"))
    $("combo").textContent =
      "x" + combo;

  if($("health")){

    const full =
      "❤️".repeat(
        Math.max(0,Math.min(8,health))
      );

    const empty =
      "🖤".repeat(
        Math.max(
          0,
          Math.min(8,3-health)
        )
      );

    $("health").textContent =
      full + empty;
  }

  if($("profileLevel"))
    $("profileLevel").textContent =
      getLevel();

  if($("profileBest"))
    $("profileBest").textContent =
      Math.floor(save.best)
        .toLocaleString();

  if($("avatar"))
    $("avatar").textContent =
      SKINS[save.skin]?.[1] || "🦖";

  if($("skinCount"))
    $("skinCount").textContent =
      save.owned.length + " / 100";

  if($("rank"))
    $("rank").textContent =
      getRank();

  if($("xpBar")){

    const progress =
      (save.best % 2500) / 25;

    $("xpBar").style.width =
      Math.min(100,progress) + "%";
  }
}

function showMessage(text,type="success"){

  const element =
    $("codeMessage");

  if(!element) return;

  element.textContent = text;

  element.className =
    "message " + type;
}

/* =========================================================
   REDEEM
========================================================= */

function redeem(){

  const input =
    $("codeInput");

  if(!input) return;

  const code =
    String(input.value || "")
      .trim()
      .toUpperCase();

  if(!code){

    showMessage(
      "Enter a code first.",
      "error"
    );

    return;
  }

  if(save.used.includes(code)){

    showMessage(
      "❌ This code was already used.",
      "error"
    );

    return;
  }

  const reward =
    REDEEM_CODES[code];

  if(reward === undefined){

    showMessage(
      "❌ Invalid redeem code.",
      "error"
    );

    return;
  }

  save.gems += reward;

  save.used.push(code);

  persist();
  updateUI();

  input.value = "";

  showMessage(
    "🎉 Redeemed! +" +
    reward.toLocaleString() +
    " gems",
    "success"
  );
}

/* =========================================================
   SKINS
========================================================= */

function renderSkins(){

  const grid =
    $("skinGrid");

  if(!grid) return;

  grid.innerHTML = "";

  SKINS.forEach(
    (skin,index)=>{

      const owned =
        save.owned.includes(index);

      const card =
        document.createElement("article");

      card.className =
        "item";

      card.innerHTML = `
        <div class="icon">
          ${skin[1]}
        </div>

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
                : "💎 " +
                  skin[2].toLocaleString()
            }
          </span>

          <button
            class="action"
            type="button"
          >
            ${
              save.skin === index
                ? "EQUIPPED"
                : owned
                  ? "EQUIP"
                  : "UNLOCK"
            }
          </button>

        </footer>
      `;

      const button =
        card.querySelector("button");

      button.addEventListener(
        "click",
        ()=>{

          if(owned){

            save.skin = index;

            persist();

            renderSkins();
            updateUI();

            return;
          }

          if(save.gems < skin[2]){

            showMessage(
              "❌ Not enough gems.",
              "error"
            );

            return;
          }

          save.gems -= skin[2];

          save.owned.push(index);

          save.skin = index;

          persist();

          renderSkins();
          updateUI();
        }
      );

      grid.appendChild(card);
    }
  );
}

/* =========================================================
   MISSIONS
========================================================= */

function renderMissions(){

  const grid =
    $("missionGrid");

  if(!grid) return;

  const missions = [

    {
      id:"run",
      icon:"🏃",
      name:"First Adventure",
      desc:"Start an adventure",
      target:1,
      reward:500
    },

    {
      id:"gems",
      icon:"💎",
      name:"Gem Hunter",
      desc:"Collect 100 gems",
      target:100,
      reward:2500
    },

    {
      id:"jumps",
      icon:"🪽",
      name:"Sky Master",
      desc:"Make 25 jumps",
      target:25,
      reward:10000
    }
  ];

  grid.innerHTML = "";

  missions.forEach(
    mission=>{

      const value =
        save.missions[mission.id] || 0;

      const completed =
        value >= mission.target;

      const card =
        document.createElement("article");

      card.className =
        "item";

      card.innerHTML = `
        <div class="icon">
          ${mission.icon}
        </div>

        <h3>${mission.name}</h3>

        <small>MISSION</small>

        <p>
          ${mission.desc}
          <br>
          <b>
            ${Math.min(value,mission.target)}
            /
            ${mission.target}
          </b>
        </p>

        <footer>

          <span class="price">
            💎 ${mission.reward.toLocaleString()}
          </span>

          <button
            class="action"
            disabled
          >
            ${
              completed
                ? "COMPLETED"
                : "IN PROGRESS"
            }
          </button>

        </footer>
      `;

      grid.appendChild(card);
    }
  );
}

/* =========================================================
   WORLDS
========================================================= */

function renderWorlds(){

  const grid =
    $("worldGrid");

  if(!grid) return;

  const worlds = [

    ["🌲","Enchanted Forest",0],
    ["🌙","Moonlit Ruins",2500],
    ["🔥","Dragon Volcano",10000],
    ["❄️","Frozen Kingdom",25000],
    ["🌌","Astral Void",100000],
    ["☀️","Celestial Realm",250000]
  ];

  grid.innerHTML = "";

  worlds.forEach(
    world=>{

      const unlocked =
        save.best >= world[2];

      const card =
        document.createElement("article");

      card.className =
        "item";

      card.innerHTML = `
        <div class="icon">
          ${world[0]}
        </div>

        <h3>${world[1]}</h3>

        <small>
          ${unlocked
            ? "UNLOCKED"
            : "LOCKED"}
        </small>

        <p>
          ${
            unlocked
              ? "Realm ready for adventure."
              : "Reach " +
                world[2].toLocaleString() +
                " best score."
          }
        </p>

        <footer>

          <span class="price">
            ${unlocked
              ? "✓ READY"
              : "🔒 LOCKED"}
          </span>

          <button
            class="action"
            ${unlocked ? "" : "disabled"}
          >
            ${unlocked ? "ENTER" : "LOCKED"}
          </button>

        </footer>
      `;

      grid.appendChild(card);
    }
  );
}

/* =========================================================
   UPGRADES
========================================================= */

function renderUpgrades(){

  const grid =
    $("upgradeGrid");

  if(!grid) return;

  const upgrades = [

    [
      "speed",
      "⚡",
      "Run Speed",
      "Increase movement speed.",
      1000
    ],

    [
      "jump",
      "🪽",
      "Double Jump+",
      "Increase jump power.",
      1500
    ],

    [
      "shield",
      "🛡️",
      "Shield Core",
      "Increase maximum protection.",
      2500
    ]
  ];

  grid.innerHTML = "";

  upgrades.forEach(
    upgrade=>{

      const level =
        save.upgrades[upgrade[0]] || 0;

      const cost =
        upgrade[4] * (level + 1);

      const card =
        document.createElement("article");

      card.className =
        "item";

      card.innerHTML = `
        <div class="icon">
          ${upgrade[1]}
        </div>

        <h3>${upgrade[2]}</h3>

        <small>
          LEVEL ${level}
        </small>

        <p>
          ${upgrade[3]}
        </p>

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
        .addEventListener(
          "click",
          ()=>{

            if(save.gems < cost){

              showMessage(
                "❌ Not enough gems.",
                "error"
              );

              return;
            }

            save.gems -= cost;

            save.upgrades[upgrade[0]] =
              level + 1;

            persist();

            renderUpgrades();
            updateUI();
          }
        );

      grid.appendChild(card);
    }
  );
}

/* =========================================================
   TABS
========================================================= */

function setupTabs(){

  document
    .querySelectorAll(".tab")
    .forEach(button=>{

      button.addEventListener(
        "click",
        ()=>{

          document
            .querySelectorAll(".tab")
            .forEach(
              b=>b.classList.remove("active")
            );

          document
            .querySelectorAll(".panel")
            .forEach(
              p=>p.classList.remove("active")
            );

          button.classList.add("active");

          const panel =
            $(button.dataset.panel);

          if(panel)
            panel.classList.add("active");
        }
      );
    });
}

/* =========================================================
   GAME
========================================================= */

function resetGame(){

  score = 0;

  speed =
    7 +
    save.upgrades.speed * .5;

  health =
    3 +
    save.upgrades.shield;

  combo = 1;

  obstacleTimer = 0;
  gemTimer = 0;
  dashTimer = 0;

  shieldActive = false;

  obstacles = [];
  gems = [];

  PLAYER.y =
    GROUND - PLAYER.h;

  PLAYER.vy = 0;
  PLAYER.jumps = 0;
}

function startGame(){

  if(running)
    return;

  resetGame();

  running = true;

  save.runs++;

  save.missions.run = 1;

  persist();

  const start =
    $("startScreen");

  const over =
    $("gameOverScreen");

  if(start)
    start.classList.add("hidden");

  if(over)
    over.classList.add("hidden");

  lastTime =
    performance.now();

  renderMissions();

  updateUI();

  requestAnimationFrame(gameLoop);
}

function endGame(){

  if(!running)
    return;

  running = false;

  save.best =
    Math.max(
      save.best,
      Math.floor(score)
    );

  persist();

  if($("finalScore"))
    $("finalScore").textContent =
      Math.floor(score)
        .toLocaleString();

  $("gameOverScreen")
    ?.classList.remove("hidden");

  renderWorlds();
  renderMissions();
  renderUpgrades();
  updateUI();
}

/* =========================================================
   CONTROLS
========================================================= */

function jump(){

  if(!running)
    return;

  if(PLAYER.jumps >= 2)
    return;

  PLAYER.vy =
    -15 -
    save.upgrades.jump * .7;

  PLAYER.jumps++;

  save.missions.jumps =
    Math.min(
      25,
      save.missions.jumps + 1
    );

  persist();

  renderMissions();
}

function dash(){

  if(!running)
    return;

  if(dashTimer > 0)
    return;

  dashTimer = 32;

  score += 75;

  combo =
    Math.min(
      10,
      combo + 1
    );
}

function toggleShield(){

  if(!running)
    return;

  shieldActive =
    !shieldActive;

  updateUI();
}

/* =========================================================
   SPAWNING
========================================================= */

function spawnObjects(dt){

  obstacleTimer += dt;
  gemTimer += dt;

  const obstacleDelay =
    Math.max(
      45,
      70 - score / 1000
    );

  if(obstacleTimer >= obstacleDelay){

    obstacles.push({

      x:canvas.clientWidth + 100,

      y:GROUND - 55,

      w:55,

      h:55

    });

    obstacleTimer = 0;
  }

  if(gemTimer >= 28){

    gems.push({

      x:canvas.clientWidth + 100,

      y:
        150 +
        Math.random() * 210

    });

    gemTimer = 0;
  }
}

/* =========================================================
   COLLISION
========================================================= */

function collision(a,b){

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

function update(dt){

  score += dt * .22;

  speed =
    Math.min(
      18,
      7 +
      score / 1800 +
      save.upgrades.speed * .5
    );

  if(dashTimer > 0){

    dashTimer -= dt;

    speed += 8;
  }

  PLAYER.vy += .85 * dt;

  PLAYER.y +=
    PLAYER.vy * dt;

  if(
    PLAYER.y >=
    GROUND - PLAYER.h
  ){

    PLAYER.y =
      GROUND - PLAYER.h;

    PLAYER.vy = 0;

    PLAYER.jumps = 0;
  }

  spawnObjects(dt);

  /* obstacles */

  for(
    let i = obstacles.length - 1;
    i >= 0;
    i--
  ){

    const obstacle =
      obstacles[i];

    obstacle.x -=
      speed * dt;

    if(
      collision(PLAYER,obstacle)
    ){

      if(shieldActive){

        shieldActive = false;

        obstacles.splice(i,1);

        combo =
          Math.min(
            10,
            combo + 1
          );

      }else{

        health--;

        combo = 1;

        obstacles.splice(i,1);

        if(health <= 0){

          endGame();

          return;
        }
      }

    }else if(
      obstacle.x < -100
    ){

      obstacles.splice(i,1);
    }
  }

  /* gems */

  for(
    let i = gems.length - 1;
    i >= 0;
    i--
  ){

    const gem =
      gems[i];

    gem.x -=
      speed * dt;

    const dx =
      gem.x -
      (PLAYER.x + PLAYER.w / 2);

    const dy =
      gem.y -
      (PLAYER.y + PLAYER.h / 2);

    if(
      Math.hypot(dx,dy) < 65
    ){

      save.gems += 25;

      save.missions.gems =
        Math.min(
          100,
          save.missions.gems + 25
        );

      score += 50;

      combo =
        Math.min(
          10,
          combo + 1
        );

      gems.splice(i,1);

      persist();

      renderMissions();

    }else if(
      gem.x < -50
    ){

      gems.splice(i,1);
    }
  }

  updateUI();
}

/* =========================================================
   DRAW HELPERS
========================================================= */

function roundedRect(
  x,
  y,
  w,
  h,
  r
){

  ctx.beginPath();

  ctx.roundRect(
    x,y,w,h,r
  );

  ctx.fill();
}

function limb(
  x,
  y,
  w,
  h,
  rotation,
  color
){

  ctx.save();

  ctx.translate(x,y);

  ctx.rotate(rotation);

  ctx.fillStyle = color;

  ctx.strokeStyle =
    "#10151f";

  ctx.lineWidth = 3;

  roundedRect(
    -w/2,
    -h/2,
    w,
    h,
    h*.25
  );

  ctx.stroke();

  ctx.restore();
}

/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(
  x,
  y
){

  const id =
    save.skin % 20;

  const colors = [

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

  const accent =
    colors[id];

  let body =
    "#536b4f";

  let skin =
    "#748b68";

  if(id===1){
    body="#8795a8";
    skin="#b7c1d0";
  }

  if(id===2||id===4){
    body="#263244";
    skin="#43536b";
  }

  if(id===7||id===16){
    body="#162d3a";
    skin="#2bdcff";
  }

  if(id===8){
    body="#302b38";
    skin="#6e596e";
  }

  if(id===10){
    body="#4b2c1c";
    skin="#a36a3f";
  }

  if(id===11||id===17){
    body="#351521";
    skin="#8b2635";
  }

  if(id===12){
    body="#527b8d";
    skin="#cceeff";
  }

  if(id===13){
    body="#1f3f78";
    skin="#5aa4ff";
  }

  if(id===14||id===18){
    body="#241b45";
    skin="#744cff";
  }

  if(id===15){
    body="#9b6a22";
    skin="#e6bd58";
  }

  if(id===19){
    body="#385a63";
    skin="#aee8ef";
  }

  ctx.save();

  ctx.translate(x,y);

  ctx.lineCap="round";
  ctx.lineJoin="round";

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.28)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    34,
    42,
    8,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  /* tail */

  ctx.fillStyle = skin;

  ctx.beginPath();

  ctx.moveTo(-17,5);

  ctx.quadraticCurveTo(
    -48,-3,
    -57,14
  );

  ctx.quadraticCurveTo(
    -39,19,
    -18,15
  );

  ctx.fill();

  ctx.strokeStyle =
    "#10151f";

  ctx.stroke();

  /* legs */

  limb(
    -15,24,
    14,34,
    .08,
    body
  );

  limb(
    15,24,
    14,34,
    -.08,
    body
  );

  ctx.fillStyle =
    "#10151f";

  roundedRect(
    -25,38,
    22,8,
    4
  );

  roundedRect(
    5,38,
    22,8,
    4
  );

  /* torso */

  ctx.fillStyle = body;

  roundedRect(
    -26,-5,
    52,48,
    15
  );

  ctx.strokeStyle =
    "#10151f";

  ctx.lineWidth=3;

  ctx.stroke();

  ctx.fillStyle =
    accent;

  ctx.globalAlpha=.9;

  roundedRect(
    -20,2,
    40,12,
    5
  );

  ctx.globalAlpha=1;

  /* armor */

  if(
    id===0 ||
    id===8 ||
    id===15
  ){

    ctx.fillStyle="#cbd5e1";

    roundedRect(
      -22,-2,
      10,35,
      4
    );

    roundedRect(
      12,-2,
      10,35,
      4
    );
  }

  if(
    id===2 ||
    id===4 ||
    id===5 ||
    id===6
  ){

    ctx.fillStyle="#111827";

    roundedRect(
      -24,8,
      48,20,
      5
    );

    ctx.fillStyle=accent;

    ctx.fillRect(
      -24,8,
      48,3
    );
  }

  if(
    id===7 ||
    id===16
  ){

    ctx.shadowBlur=18;

    ctx.shadowColor=accent;

    ctx.strokeStyle=accent;

    ctx.strokeRect(
      -25,-4,
      50,47
    );

    ctx.shadowBlur=0;
  }

  /* neck */

  ctx.fillStyle=skin;

  ctx.beginPath();

  ctx.arc(
    20,-15,
    12,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.stroke();

  /* head */

  ctx.fillStyle=skin;

  ctx.beginPath();

  ctx.ellipse(
    25,-35,
    25,
    22,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.stroke();

  /* snout */

  ctx.fillStyle=skin;

  ctx.beginPath();

  ctx.roundRect(
    38,-32,
    20,13,
    6
  );

  ctx.fill();

  ctx.stroke();

  /* visor */

  ctx.fillStyle="#0a0d14";

  roundedRect(
    25,-45,
    25,9,
    4
  );

  ctx.fillStyle=accent;

  ctx.shadowBlur=8;

  ctx.shadowColor=accent;

  ctx.fillRect(
    38,-43,
    7,
    3
  );

  ctx.shadowBlur=0;

  /* teeth */

  ctx.fillStyle="#fff";

  for(
    let i=0;
    i<3;
    i++
  ){

    ctx.fillRect(
      47+i*4,
      -21,
      3,
      5
    );
  }

  /* crown / helmet */

  if(id===0){

    ctx.fillStyle="#cbd5e1";

    ctx.beginPath();

    ctx.moveTo(5,-46);
    ctx.lineTo(22,-63);
    ctx.lineTo(45,-48);
    ctx.lineTo(30,-43);

    ctx.closePath();

    ctx.fill();

    ctx.stroke();

    ctx.strokeStyle=accent;
    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.moveTo(15,-59);
    ctx.lineTo(48,-55);

    ctx.stroke();
  }

  if(id===1){

    ctx.strokeStyle="#d8e4ff";
    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.arc(
      25,-35,
      28,
      0,
      Math.PI*2
    );

    ctx.stroke();
  }

  if(id===2||id===4){

    ctx.fillStyle="#151b27";

    roundedRect(
      5,-54,
      45,12,
      5
    );

    ctx.fillStyle="#222";

    ctx.fillRect(
      18,-58,
      20,6
    );
  }

  if(
    id===10 ||
    id===11 ||
    id===18 ||
    id===19
  ){

    ctx.fillStyle=accent;

    ctx.beginPath();

    ctx.moveTo(5,-50);
    ctx.lineTo(12,-67);
    ctx.lineTo(20,-52);
    ctx.lineTo(30,-70);
    ctx.lineTo(37,-49);

    ctx.fill();

    ctx.strokeStyle="#10151f";
    ctx.stroke();
  }

  if(
    id===12 ||
    id===13 ||
    id===14
  ){

    ctx.fillStyle="#cbd5e1";

    ctx.beginPath();

    ctx.moveTo(3,-51);
    ctx.lineTo(25,-66);
    ctx.lineTo(49,-49);
    ctx.lineTo(41,-43);
    ctx.lineTo(8,-43);

    ctx.closePath();

    ctx.fill();

    ctx.stroke();

    ctx.fillStyle=accent;

    ctx.fillRect(
      22,-64,
      6,
      8
    );
  }

  if(id===15){

    ctx.fillStyle="#e9c46a";

    ctx.beginPath();

    for(
      let i=0;
      i<7;
      i++
    ){

      const a =
        -Math.PI*.8 +
        i*Math.PI*.26;

      ctx.lineTo(
        25 +
        Math.cos(a)*25,
        -35 +
        Math.sin(a)*25
      );
    }

    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }

  /* arms */

  limb(
    -29,4,
    12,28,
    -.45,
    body
  );

  limb(
    29,4,
    12,28,
    .45,
    body
  );

  ctx.fillStyle=accent;

  ctx.beginPath();

  ctx.arc(
    -38,16,
    6,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.arc(
    38,16,
    6,
    0,
    Math.PI*2
  );

  ctx.fill();

  /* rarity aura */

  if(id>=14){

    ctx.globalAlpha=.25;

    ctx.strokeStyle=accent;

    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.arc(
      5,-12,
      58,
      0,
      Math.PI*2
    );

    ctx.stroke();

    ctx.globalAlpha=1;
  }

  ctx.restore();
}

/* =========================================================
   DRAW WORLD
========================================================= */

function draw(){

  const width =
    canvas.clientWidth;

  const height =
    canvas.clientHeight;

  if(!width || !height)
    return;

  ctx.clearRect(
    0,0,
    width,
    height
  );

  const gradient =
    ctx.createLinearGradient(
      0,0,
      0,height
    );

  gradient.addColorStop(
    0,
    "#080b24"
  );

  gradient.addColorStop(
    .55,
    "#170d30"
  );

  gradient.addColorStop(
    1,
    "#071d22"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,0,
    width,
    height
  );

  /* stars */

  for(
    let i=0;
    i<90;
    i++
  ){

    ctx.fillStyle =
      i%5===0
        ? "#62ecff99"
        : "#ffffff88";

    const x =
      ((i*173 - score*.05)
        % width + width)
      % width;

    const y =
      25 +
      (i*47)%290;

    ctx.fillRect(
      x,
      y,
      2+(i%3),
      2+(i%2)
    );
  }

  /* mountains */

  ctx.fillStyle =
    "#183b52";

  for(
    let i=0;
    i<9;
    i++
  ){

    let x =
      i*180 -
      (score*.03%180);

    ctx.beginPath();

    ctx.moveTo(
      x,
      GROUND
    );

    ctx.lineTo(
      x+80,
      290-(i%2)*50
    );

    ctx.lineTo(
      x+160,
      GROUND
    );

    ctx.fill();
  }

  /* ground */

  ctx.fillStyle =
    "#102f34";

  ctx.fillRect(
    0,
    GROUND,
    width,
    height-GROUND
  );

  ctx.strokeStyle =
    "#65f6ff";

  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.moveTo(
    0,
    GROUND
  );

  ctx.lineTo(
    width,
    GROUND
  );

  ctx.stroke();

  /* gems */

  gems.forEach(
    gem=>{

      ctx.fillStyle="#61eaff";

      ctx.shadowBlur=20;

      ctx.shadowColor="#61eaff";

      ctx.beginPath();

      ctx.moveTo(
        gem.x,
        gem.y-14
      );

      ctx.lineTo(
        gem.x+12,
        gem.y
      );

      ctx.lineTo(
        gem.x,
        gem.y+14
      );

      ctx.lineTo(
        gem.x-12,
        gem.y
      );

      ctx.closePath();

      ctx.fill();

      ctx.shadowBlur=0;
    }
  );

  /* obstacles */

  obstacles.forEach(
    obstacle=>{

      ctx.fillStyle =
        "#ff4f8d";

      ctx.shadowBlur=12;

      ctx.shadowColor =
        "#ff4f8d";

      ctx.beginPath();

      ctx.moveTo(
        obstacle.x,
        obstacle.y+obstacle.h
      );

      ctx.lineTo(
        obstacle.x+
        obstacle.w/2,
        obstacle.y
      );

      ctx.lineTo(
        obstacle.x+
        obstacle.w,
        obstacle.y+
        obstacle.h
      );

      ctx.closePath();

      ctx.fill();

      ctx.shadowBlur=0;
    }
  );

  /* shield */

  if(shieldActive){

    ctx.strokeStyle =
      "#62ecff";

    ctx.lineWidth=5;

    ctx.shadowBlur=25;

    ctx.shadowColor =
      "#62ecff";

    ctx.beginPath();

    ctx.arc(
      PLAYER.x+29,
      PLAYER.y+35,
      48,
      0,
      Math.PI*2
    );

    ctx.stroke();

    ctx.shadowBlur=0;
  }

  drawCharacter(
    PLAYER.x+29,
    PLAYER.y+35
  );

  /* dash trail */

  if(dashTimer>0){

    ctx.fillStyle =
      "#62ecff55";

    for(
      let i=1;
      i<6;
      i++
    ){

      ctx.fillRect(
        PLAYER.x-i*25,
        PLAYER.y+25,
        14,
        4
      );
    }
  }
}

/* =========================================================
   LOOP
========================================================= */

function gameLoop(time){

  if(!running)
    return;

  let dt =
    (time-lastTime)/16.67;

  dt =
    Math.min(2,Math.max(.1,dt));

  lastTime = time;

  update(dt);
  draw();

  if(running)
    requestAnimationFrame(
      gameLoop
    );
}

/* =========================================================
   INPUT
========================================================= */

document.addEventListener(
  "keydown",
  event=>{

    if(
      event.code==="Space" ||
      event.code==="ArrowUp"
    ){

      event.preventDefault();

      jump();
    }

    if(event.code==="KeyD"){

      event.preventDefault();

      dash();
    }

    if(event.code==="KeyS"){

      event.preventDefault();

      toggleShield();
    }
  }
);

/* =========================================================
   BUTTONS
========================================================= */

function bind(id,fn){

  const element =
    $(id);

  if(element)
    element.addEventListener(
      "click",
      fn
    );
}

bind(
  "startButton",
  startGame
);

bind(
  "restartButton",
  startGame
);

bind(
  "jumpButton",
  jump
);

bind(
  "dashButton",
  dash
);

bind(
  "shieldButton",
  toggleShield
);

bind(
  "redeemButton",
  redeem
);

const codeInput =
  $("codeInput");

if(codeInput){

  codeInput.addEventListener(
    "keydown",
    event=>{

      if(event.key==="Enter"){

        event.preventDefault();

        redeem();
      }
    }
  );
}

/* =========================================================
   INIT
========================================================= */

function init(){

  resizeCanvas();

  setupTabs();

  renderSkins();

  renderMissions();

  renderWorlds();

  renderUpgrades();

  updateUI();

  resetGame();

  draw();
}

window.addEventListener(
  "load",
  init
);

"use strict";

/* =========================================================
   DINO LEGENDS — GAME ENGINE V20
   ========================================================= */

const $ = id => document.getElementById(id);

const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");

const SAVE = "DINO_LEGENDS_V20";

/* =========================================================
   SKINS
   ========================================================= */

const skins = [
  ["Arthur Rex", "LEGENDARY KNIGHT", 0, "#d9b36c", "#536b4f", "#cbd5e1"],
  ["Ghost Rex", "PHANTOM", 500000, "#aeb8c8", "#5b6575", "#d8e4ff"],
  ["Price Raptor", "ELITE OPERATIVE", 900000, "#d94848", "#263244", "#ff4d72"],
  ["Leon Rex", "SURVIVOR", 1500000, "#c79b72", "#65442e", "#e5bb80"],
  ["Agent Rex", "STEALTH", 2500000, "#222b3a", "#111827", "#62ecff"],
  ["Michael Rex", "OUTLAW", 4000000, "#9a6a38", "#4b2c1c", "#ffd866"],
  ["CJ Rex", "STREET KING", 6500000, "#2d4a75", "#182338", "#ff62c7"],
  ["Cyber Rex", "CYBER MYTHIC", 10000000, "#28d7ff", "#162d3a", "#62ecff"],
  ["Samurai Rex", "SHADOW WARRIOR", 16000000, "#3b263b", "#201824", "#ff62c7"],
  ["Valkyrie Rex", "SKY LEGEND", 25000000, "#f1e4c7", "#6d5941", "#ffffff"],
  ["Dragon Lord", "ANCIENT", 40000000, "#7b4a2d", "#4b2c1c", "#ff8b45"],
  ["Demon Rex", "INFERNAL", 65000000, "#6f1b2b", "#351521", "#ff315d"],
  ["Ice Emperor", "FROSTBORN", 100000000, "#bfeaff", "#527b8d", "#62ecff"],
  ["Storm Emperor", "THUNDERBORN", 150000000, "#4d8dff", "#1f3f78", "#b9d5ff"],
  ["Void Emperor", "COSMIC", 250000000, "#8d5cff", "#241b45", "#c084ff"],
  ["Golden Titan", "ROYAL", 400000000, "#e5b94f", "#9b6a22", "#ffe89a"],
  ["Neon Phantom", "NEON", 650000000, "#18e5e5", "#162d3a", "#62ffff"],
  ["Blood Moon Rex", "NIGHTMARE", 900000000, "#7d1525", "#35101b", "#ff355d"],
  ["Galaxy Rex", "GALACTIC", 1500000000, "#b85cff", "#241b45", "#e2a7ff"],
  ["Eternal Dragon", "ETERNAL", 3000000000, "#d8f5ff", "#385a63", "#ffffff"]
];

const iconSet = [
  "🐲","🦕","🦖","🐉","👾",
  "🤖","🦄","🌟","☄️","🪐",
  "💀","🪽","🔥","❄️","⚡",
  "🌌","👑","💎","🗿","🎭"
];

while (skins.length < 100) {
  const i = skins.length;

  const tier =
    i < 35 ? "EPIC" :
    i < 60 ? "LEGENDARY" :
    i < 80 ? "MYTHIC" :
    "DIVINE";

  const price =
    Math.floor(
      3000000000 *
      Math.pow(1.045, i - 19)
    );

  const hue = (i * 37) % 360;

  skins.push([
    "Legendary Beast " + (i + 1),
    tier,
    price,
    `hsl(${hue},85%,65%)`,
    `hsl(${hue},45%,20%)`,
    `hsl(${(hue + 50) % 360},100%,75%)`
  ]);
}

/* =========================================================
   WORLDS
   ========================================================= */

const worlds = [
  {
    id:"forest",
    name:"Enchanted Forest",
    icon:"🌲",
    requirement:0,
    color:"#35d88b",
    danger:1
  },
  {
    id:"moon",
    name:"Moonlit Ruins",
    icon:"🌙",
    requirement:2500,
    color:"#8f7cff",
    danger:1.25
  },
  {
    id:"volcano",
    name:"Dragon Volcano",
    icon:"🔥",
    requirement:10000,
    color:"#ff684d",
    danger:1.5
  },
  {
    id:"ice",
    name:"Frozen Kingdom",
    icon:"❄️",
    requirement:25000,
    color:"#62ecff",
    danger:1.8
  },
  {
    id:"void",
    name:"Astral Void",
    icon:"🌌",
    requirement:100000,
    color:"#c05cff",
    danger:2.2
  }
];

/* =========================================================
   MISSIONS
   ========================================================= */

const missionDefinitions = [
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
  },
  {
    id:"score",
    icon:"🏆",
    name:"Score Legend",
    desc:"Reach 10,000 score",
    target:10000,
    reward:25000
  },
  {
    id:"dash",
    icon:"⚡",
    name:"Lightning Dash",
    desc:"Use Dash 20 times",
    target:20,
    reward:15000
  }
];

/* =========================================================
   SAVE DATA
   ========================================================= */

const base = {
  gems:2500,
  best:0,
  skin:0,
  world:"forest",

  owned:[0],
  used:[],

  runs:0,

  upgrades:{
    speed:0,
    jump:0,
    shield:0,
    magnet:0
  },

  missions:{
    run:0,
    gems:0,
    jumps:0,
    score:0,
    dash:0
  },

  claimedMissions:[],

  totalGems:0,
  totalJumps:0,
  totalDash:0
};

function cloneBase(){
  return JSON.parse(JSON.stringify(base));
}

let save;

try{
  const raw =
    JSON.parse(
      localStorage.getItem(SAVE)
    );

  save = {
    ...cloneBase(),
    ...(raw || {})
  };
}catch{
  save = cloneBase();
}

save.owned =
  Array.isArray(save.owned)
    ? save.owned
    : [0];

save.used =
  Array.isArray(save.used)
    ? save.used
    : [];

save.claimedMissions =
  Array.isArray(save.claimedMissions)
    ? save.claimedMissions
    : [];

save.upgrades = {
  ...base.upgrades,
  ...(save.upgrades || {})
};

save.missions = {
  ...base.missions,
  ...(save.missions || {})
};

function persist(){
  try{
    localStorage.setItem(
      SAVE,
      JSON.stringify(save)
    );
  }catch(e){
    console.warn("Save failed",e);
  }
}

/* =========================================================
   REDEEM
   ========================================================= */

const REDEEM_CODES = Object.freeze({
  TRILLION1:1000000000000,
  DINO100:100,
  LEGEND500:500,
  FANTASY1K:1000,
  MYTHIC50K:50000,
  LEGENDARY1M:1000000
});

function msg(text, good=false){
  const e = $("codeMessage");

  if(!e) return;

  e.textContent = text;
  e.style.color =
    good
      ? "#67ffad"
      : "#ff7b9b";
}

function redeem(){

  const input = $("codeInput");

  if(!input) return;

  const code =
    String(input.value || "")
      .trim()
      .toUpperCase();

  if(!code){
    msg("ENTER A REWARD CODE");
    return;
  }

  if(save.used.includes(code)){
    msg("❌ THIS CODE WAS ALREADY USED");
    return;
  }

  const reward =
    REDEEM_CODES[code];

  if(reward === undefined){
    msg("❌ INVALID REDEEM CODE");
    return;
  }

  save.gems += reward;
  save.totalGems += reward;

  save.used.push(code);

  persist();
  ui();

  input.value = "";

  msg(
    "🎉 REDEEMED! +"+
    reward.toLocaleString()+
    " GEMS",
    true
  );
}

/* =========================================================
   LEVEL / RANK
   ========================================================= */

function level(){
  return Math.max(
    1,
    Math.floor(save.best / 2500) + 1
  );
}

function rank(){

  const l = level();

  if(l >= 60) return "DIVINE";
  if(l >= 40) return "MYTHIC";
  if(l >= 25) return "LEGEND";
  if(l >= 15) return "ELITE";
  if(l >= 5) return "HUNTER";

  return "ROOKIE";
}

/* =========================================================
   UI
   ========================================================= */

function ui(){

  let e;

  if(e=$("gems"))
    e.textContent =
      save.gems.toLocaleString();

  if(e=$("bestScore"))
    e.textContent =
      Math.floor(save.best)
      .toLocaleString();

  if(e=$("level"))
    e.textContent = level();

  if(e=$("score"))
    e.textContent =
      Math.floor(score)
      .toLocaleString();

  if(e=$("combo"))
    e.textContent =
      "x"+combo;

  if(e=$("health")){

    const full =
      Math.max(
        0,
        Math.min(
          8,
          health
        )
      );

    e.textContent =
      "❤️".repeat(full)+
      "🖤".repeat(
        Math.max(
          0,
          Math.min(
            8,
            3-health
          )
        )
      );
  }

  if(e=$("profileLevel"))
    e.textContent = level();

  if(e=$("profileBest"))
    e.textContent =
      Math.floor(save.best)
      .toLocaleString();

  if(e=$("rank"))
    e.textContent = rank();

  if(e=$("skinCount"))
    e.textContent =
      save.owned.length+
      " / 100";

  const s =
    skins[save.skin] ||
    skins[0];

  if(e=$("profileName"))
    e.textContent = s[0];

  if(e=$("currentWorldHud")){

    const w =
      worlds.find(
        x => x.id === save.world
      ) || worlds[0];

    e.textContent =
      w.name
      .replace("Enchanted ","")
      .replace("Moonlit ","")
      .replace("Dragon ","")
      .replace("Frozen ","")
      .replace("Astral ","")
      .toUpperCase();
  }

  if(e=$("xpBar"))
    e.style.width =
      Math.min(
        100,
        (save.best % 2500) / 25
      )+"%";

  renderAvatar();
}

/* =========================================================
   AVATAR
   ========================================================= */

function renderAvatar(){

  const avatar =
    $("avatar");

  if(!avatar) return;

  const s =
    skins[save.skin] ||
    skins[0];

  avatar.innerHTML = `
    <div class="skin-preview">
      <div
        class="mini-dino"
        style="
          --skin-main:${s[3]};
          --skin-dark:${s[4]};
          --skin-accent:${s[5]};
          --skin-glow:${s[5]}88;
        "
      ></div>
    </div>
  `;

  const startAvatar =
    $("startAvatar");

  if(startAvatar)
    startAvatar.innerHTML = `
      <div class="skin-preview">
        <div
          class="mini-dino"
          style="
            --skin-main:${s[3]};
            --skin-dark:${s[4]};
            --skin-accent:${s[5]};
            --skin-glow:${s[5]}88;
          "
        ></div>
      </div>
    `;
}

/* =========================================================
   SKINS
   ========================================================= */

function renderSkins(){

  const grid =
    $("skinGrid");

  if(!grid) return;

  grid.innerHTML = "";

  skins.forEach(
    (s,i)=>{

      const own =
        save.owned.includes(i);

      const equipped =
        save.skin === i;

      const d =
        document.createElement("article");

      d.className =
        "item skin-card";

      d.style.setProperty(
        "--glow",
        s[5]
      );

      d.innerHTML = `
        <div
          class="icon skin-icon"
          style="
            --skin-glow:${s[5]}66;
          "
        >
          <div class="skin-preview">
            <div
              class="mini-dino"
              style="
                --skin-main:${s[3]};
                --skin-dark:${s[4]};
                --skin-accent:${s[5]};
                --skin-glow:${s[5]};
              "
            ></div>
          </div>
        </div>

        <h3>${s[0]}</h3>

        <small>
          ${s[1]}
        </small>

        <p>
          ${
            equipped
              ? "Currently equipped."
              : own
                ? "Owned • ready to equip."
                : "Unlock this fantasy champion."
          }
        </p>

        <footer>

          <span class="price">
            ${
              own
                ? "✓ OWNED"
                : "💎 "+
                  s[2].toLocaleString()
            }
          </span>

          <button class="action">
            ${
              equipped
                ? "EQUIPPED"
                : own
                  ? "EQUIP"
                  : "UNLOCK"
            }
          </button>

        </footer>
      `;

      const button =
        d.querySelector("button");

      button.onclick = ()=>{

        if(own){

          save.skin = i;

          persist();

          renderSkins();
          ui();

          return;
        }

        if(save.gems < s[2]){

          msg(
            "❌ NOT ENOUGH GEMS"
          );

          return;
        }

        save.gems -= s[2];

        save.owned.push(i);

        save.skin = i;

        persist();

        renderSkins();
        ui();
      };

      grid.appendChild(d);
    }
  );
}

/* =========================================================
   MISSIONS
   ========================================================= */

function missionValue(id){

  return Number(
    save.missions[id] || 0
  );
}

function renderMissions(){

  const grid =
    $("missionGrid");

  if(!grid) return;

  grid.innerHTML = "";

  missionDefinitions.forEach(
    m=>{

      const value =
        missionValue(m.id);

      const complete =
        value >= m.target;

      const claimed =
        save.claimedMissions
          .includes(m.id);

      const d =
        document.createElement("article");

      d.className = "item";

      d.innerHTML = `
        <div class="icon">
          ${m.icon}
        </div>

        <h3>
          ${m.name}
        </h3>

        <small>
          MISSION
        </small>

        <p>
          ${m.desc}
          <br>
          <b>
            ${Math.min(value,m.target)}
            /
            ${m.target}
          </b>
        </p>

        <footer>

          <span class="price">
            💎
            ${m.reward.toLocaleString()}
          </span>

          <button
            class="action"
            ${!complete || claimed ? "disabled":""}
          >
            ${
              claimed
                ? "CLAIMED"
                : complete
                  ? "CLAIM"
                  : "IN PROGRESS"
            }
          </button>

        </footer>
      `;

      const button =
        d.querySelector("button");

      button.onclick = ()=>{

        if(
          complete &&
          !claimed
        ){

          save.gems += m.reward;

          save.claimedMissions.push(
            m.id
          );

          persist();

          renderMissions();
          ui();

          msg(
            "🎉 MISSION REWARD CLAIMED!",
            true
          );
        }
      };

      grid.appendChild(d);
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

  grid.innerHTML = "";

  worlds.forEach(
    w=>{

      const unlocked =
        save.best >=
        w.requirement;

      const active =
        save.world === w.id;

      const d =
        document.createElement("article");

      d.className = "item";

      d.style.setProperty(
        "--glow",
        w.color
      );

      d.innerHTML = `
        <div class="icon">
          ${w.icon}
        </div>

        <h3>
          ${w.name}
        </h3>

        <small>
          ${
            w.requirement === 0
              ? "STARTER REALM"
              : "SCORE "+
                w.requirement.toLocaleString()
          }
        </small>

        <p>
          ${
            active
              ? "Current active realm."
              : unlocked
                ? "Realm unlocked. Enter the adventure."
                : "Reach "+
                  w.requirement.toLocaleString()+
                  " best score."
          }
        </p>

        <footer>

          <span class="price">
            ${
              active
                ? "✓ ACTIVE"
                : unlocked
                  ? "✓ UNLOCKED"
                  : "🔒 LOCKED"
            }
          </span>

          <button
            class="action"
            ${unlocked && !active ? "":"disabled"}
          >
            ${
              active
                ? "ACTIVE"
                : unlocked
                  ? "ENTER"
                  : "LOCKED"
            }
          </button>

        </footer>
      `;

      const button =
        d.querySelector("button");

      button.onclick = ()=>{

        if(
          unlocked &&
          !active
        ){

          save.world =
            w.id;

          persist();

          renderWorlds();
          ui();
        }
      };

      grid.appendChild(d);
    }
  );
}

/* =========================================================
   UPGRADES
   ========================================================= */

const upgradeInfo = {
  speed:{
    icon:"⚡",
    name:"Run Speed",
    desc:"Increase movement speed.",
    base:1000,
    max:20
  },

  jump:{
    icon:"🪽",
    name:"Double Jump+",
    desc:"Increase jump power.",
    base:1500,
    max:20
  },

  shield:{
    icon:"🛡️",
    name:"Shield Core",
    desc:"Start each run with more health.",
    base:2500,
    max:10
  },

  magnet:{
    icon:"🧲",
    name:"Gem Magnet",
    desc:"Increase the collection radius.",
    base:3500,
    max:10
  }
};

function upgradeCost(key){

  const info =
    upgradeInfo[key];

  const level =
    save.upgrades[key] || 0;

  return Math.floor(
    info.base *
    Math.pow(1.55,level)
  );
}

function buyUpgrade(key){

  const info =
    upgradeInfo[key];

  const current =
    save.upgrades[key] || 0;

  if(current >= info.max){

    msg(
      "⭐ MAXIMUM UPGRADE REACHED"
    );

    return;
  }

  const cost =
    upgradeCost(key);

  if(save.gems < cost){

    msg(
      "❌ NOT ENOUGH GEMS"
    );

    return;
  }

  save.gems -= cost;

  save.upgrades[key] =
    current + 1;

  persist();

  renderShop();
  ui();
}

function renderShop(){

  const grid =
    $("shopGrid");

  if(!grid) return;

  grid.innerHTML = "";

  Object.entries(
    upgradeInfo
  ).forEach(
    ([key,info])=>{

      const level =
        save.upgrades[key] || 0;

      const maxed =
        level >= info.max;

      const cost =
        upgradeCost(key);

      const d =
        document.createElement("article");

      d.className =
        "item";

      d.innerHTML = `
        <div class="icon">
          ${info.icon}
        </div>

        <h3>
          ${info.name}
        </h3>

        <small>
          LEVEL ${level} / ${info.max}
        </small>

        <p>
          ${info.desc}
        </p>

        <footer>

          <span class="price">
            ${
              maxed
                ? "⭐ MAX"
                : "💎 "+
                  cost.toLocaleString()
            }
          </span>

          <button
            class="action"
            ${maxed ? "disabled":""}
          >
            ${maxed ? "MAXED":"UPGRADE"}
          </button>

        </footer>
      `;

      d.querySelector("button")
        .onclick =
          ()=>buyUpgrade(key);

      grid.appendChild(d);
    }
  );
}

/* =========================================================
   GAME STATE
   ========================================================= */

let running = false;

let score = 0;
let speed = 7;
let health = 3;

let last = 0;
let spawn = 0;
let gemSpawn = 0;
let powerSpawn = 0;

let dashTimer = 0;
let shieldActive = false;

let combo = 1;

let obs = [];
let gems = [];
let powers = [];
let particles = [];

let worldTime = 0;

/* =========================================================
   PLAYER
   ========================================================= */

const P = {
  x:150,
  y:360,
  w:58,
  h:70,
  vy:0,
  jumps:0
};

const G = 430;

/* =========================================================
   TABS
   ========================================================= */

function tabs(){

  document
    .querySelectorAll(".tab")
    .forEach(button=>{

      button.onclick = ()=>{

        document
          .querySelectorAll(".tab")
          .forEach(
            x=>x.classList.remove(
              "active"
            )
          );

        document
          .querySelectorAll(".panel")
          .forEach(
            x=>x.classList.remove(
              "active"
            )
          );

        button.classList.add(
          "active"
        );

        const panel =
          $(button.dataset.panel);

        if(panel)
          panel.classList.add(
            "active"
          );
      };
    });
}

/* =========================================================
   RESET
   ========================================================= */

function reset(){

  score = 0;

  speed =
    7 +
    save.upgrades.speed *
    .5;

  health =
    3 +
    save.upgrades.shield;

  spawn = 0;
  gemSpawn = 0;
  powerSpawn = 0;

  dashTimer = 0;

  shieldActive = false;

  combo = 1;

  obs = [];
  gems = [];
  powers = [];
  particles = [];

  worldTime = 0;

  P.y =
    G - P.h;

  P.vy = 0;
  P.jumps = 0;
}

/* =========================================================
   START / END
   ========================================================= */

function start(){

  reset();

  running = true;

  save.runs++;

  save.missions.run =
    Math.max(
      save.missions.run,
      1
    );

  persist();

  $("startScreen")
    ?.classList.add("hidden");

  $("gameOverScreen")
    ?.classList.add("hidden");

  last =
    performance.now();

  renderMissions();
  ui();

  requestAnimationFrame(loop);
}

function end(){

  running = false;

  save.best =
    Math.max(
      save.best,
      Math.floor(score)
    );

  save.missions.score =
    Math.max(
      save.missions.score,
      Math.floor(score)
    );

  persist();

  if($("finalScore"))
    $("finalScore")
      .textContent =
        Math.floor(score)
        .toLocaleString();

  $("gameOverScreen")
    ?.classList.remove(
      "hidden"
    );

  renderWorlds();
  renderMissions();
  renderShop();
  ui();
}

/* =========================================================
   PLAYER ACTIONS
   ========================================================= */

function jump(){

  if(!running)
    return;

  const maxJumps =
    2;

  if(P.jumps < maxJumps){

    P.vy =
      -(
        15 +
        save.upgrades.jump *
        .7
      );

    P.jumps++;

    save.totalJumps++;

    save.missions.jumps =
      Math.min(
        25,
        save.missions.jumps + 1
      );

    persist();

    renderMissions();
  }
}

function dash(){

  if(
    !running ||
    dashTimer > 0
  )
    return;

  dashTimer = 32;

  score +=
    75 *
    combo;

  combo =
    Math.min(
      10,
      combo + 1
    );

  save.totalDash++;

  save.missions.dash =
    Math.min(
      20,
      save.missions.dash + 1
    );

  persist();

  renderMissions();
}

function shield(){

  if(!running)
    return;

  shieldActive =
    !shieldActive;

  ui();
}

/* =========================================================
   SPAWN
   ========================================================= */

function spawnStuff(dt){

  spawn += dt;
  gemSpawn += dt;
  powerSpawn += dt;

  const difficulty =
    Math.min(
      28,
      score / 1000
    );

  if(
    spawn >
    Math.max(
      35,
      70 - difficulty * 1.5
    )
  ){

    const type =
      Math.random();

    if(type < .18){

      obs.push({
        x:1200,
        y:300,
        w:60,
        h:130,
        type:"tall"
      });

    }else if(type < .35){

      obs.push({
        x:1200,
        y:350,
        w:100,
        h:80,
        type:"beast"
      });

    }else{

      obs.push({
        x:1200,
        y:G-55,
        w:55,
        h:55,
        type:"spike"
      });
    }

    spawn = 0;
  }

  if(gemSpawn > 25){

    gems.push({
      x:1200,
      y:150 +
        Math.random() *
        220,
      r:12
    });

    gemSpawn = 0;
  }

  if(powerSpawn > 170){

    const type =
      Math.random() < .5
        ? "gem"
        : "heart";

    powers.push({
      x:1200,
      y:190 +
        Math.random() *
        150,
      type
    });

    powerSpawn = 0;
  }
}

/* =========================================================
   COLLISION
   ========================================================= */

function collide(a,b){

  return (
    a.x + 8 <
      b.x + b.w &&
    a.x + a.w - 8 >
      b.x &&
    a.y + 8 <
      b.y + b.h &&
    a.y + a.h >
      b.y
  );
}

/* =========================================================
   PARTICLES
   ========================================================= */

function particle(
  x,
  y,
  color,
  amount=5
){

  for(
    let i=0;
    i<amount;
    i++
  ){

    particles.push({
      x,
      y,
      vx:
        (Math.random()-.5)*5,
      vy:
        (Math.random()-.5)*5,
      life:1,
      color
    });
  }
}

function updateParticles(dt){

  for(
    let i=particles.length-1;
    i>=0;
    i--
  ){

    const p =
      particles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    p.vy += .1 * dt;

    p.life -= .035 * dt;

    if(p.life <= 0)
      particles.splice(i,1);
  }
}

/* =========================================================
   UPDATE
   ========================================================= */

function update(dt){

  worldTime += dt;

  score +=
    dt *
    .22 *
    (1 + combo*.04);

  speed =
    Math.min(
      19,
      7 +
      score/1800 +
      save.upgrades.speed*.5
    );

  if(dashTimer > 0){

    dashTimer -= dt;

    speed += 8;
  }

  P.vy +=
    .85 * dt;

  P.y +=
    P.vy * dt;

  if(
    P.y >=
    G - P.h
  ){

    P.y =
      G - P.h;

    P.vy = 0;
    P.jumps = 0;
  }

  spawnStuff(dt);

  /* obstacles */

  for(
    let i=obs.length-1;
    i>=0;
    i--
  ){

    const o =
      obs[i];

    o.x -=
      speed * dt;

    if(collide(P,o)){

      if(shieldActive){

        shieldActive = false;

        particle(
          P.x+30,
          P.y+30,
          "#62ecff",
          15
        );

        obs.splice(i,1);

        combo =
          Math.min(
            10,
            combo+1
          );

      }else{

        health--;

        combo = 1;

        particle(
          P.x+30,
          P.y+30,
          "#ff557f",
          20
        );

        obs.splice(i,1);

        if(health <= 0){

          end();
          return;
        }
      }

    }else if(
      o.x < -150
    ){

      obs.splice(i,1);
    }
  }

  /* gems */

  const magnet =
    65 +
    save.upgrades.magnet *
    25;

  for(
    let i=gems.length-1;
    i>=0;
    i--
  ){

    const g =
      gems[i];

    g.x -=
      speed * dt;

    const distance =
      Math.hypot(
        g.x-(P.x+30),
        g.y-(P.y+30)
      );

    if(distance < magnet){

      save.gems += 25;

      save.totalGems += 25;

      save.missions.gems =
        Math.min(
          100,
          save.missions.gems + 25
        );

      score +=
        50 * combo;

      combo =
        Math.min(
          10,
          combo + 1
        );

      particle(
        g.x,
        g.y,
        "#62ecff",
        8
      );

      gems.splice(i,1);

      persist();

      renderMissions();

    }else if(
      g.x < -50
    ){

      gems.splice(i,1);
    }
  }

  /* powerups */

  for(
    let i=powers.length-1;
    i>=0;
    i--
  ){

    const p =
      powers[i];

    p.x -=
      speed * dt;

    const box = {
      x:p.x-15,
      y:p.y-15,
      w:30,
      h:30
    };

    if(collide(P,box)){

      if(p.type === "heart"){

        health =
          Math.min(
            3 +
            save.upgrades.shield,
            health + 1
          );

      }else{

        save.gems += 100;

        save.totalGems += 100;
      }

      score += 150;

      combo =
        Math.min(
          10,
          combo+2
        );

      particle(
        p.x,
        p.y,
        p.type==="heart"
          ? "#ff557f"
          : "#62ecff",
        15
      );

      powers.splice(i,1);

      persist();

    }else if(
      p.x < -50
    ){

      powers.splice(i,1);
    }
  }

  updateParticles(dt);

  ui();
}

/* =========================================================
   DRAW HELPERS
   ========================================================= */

function rr(
  x,y,w,h,r
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
  rot,
  fill,
  stroke="#10151f"
){

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.rotate(rot);

  ctx.fillStyle =
    fill;

  ctx.strokeStyle =
    stroke;

  ctx.lineWidth=3;

  rr(
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

  const s =
    skins[
      save.skin % skins.length
    ];

  const accent =
    s[5];

  const body =
    s[4];

  const skin =
    s[3];

  const dark =
    "#10131e";

  const metal =
    "#dbe7f5";

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";

  const index =
    save.skin;

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

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

  /* legendary aura */

  if(index >= 14){

    ctx.globalAlpha =
      .13;

    ctx.fillStyle =
      accent;

    ctx.beginPath();

    ctx.arc(
      5,
      -12,
      62 +
      Math.sin(
        worldTime*.1
      )*5,
      0,
      Math.PI*2
    );

    ctx.fill();

    ctx.globalAlpha=1;
  }

  /* tail */

  ctx.fillStyle =
    skin;

  ctx.beginPath();

  ctx.moveTo(
    -17,
    5
  );

  ctx.quadraticCurveTo(
    -48,
    -3,
    -57,
    14
  );

  ctx.quadraticCurveTo(
    -39,
    19,
    -18,
    15
  );

  ctx.fill();

  ctx.strokeStyle =
    dark;

  ctx.stroke();

  /* legs */

  limb(
    -15,
    24,
    14,
    34,
    .08,
    body
  );

  limb(
    15,
    24,
    14,
    34,
    -.08,
    body
  );

  ctx.fillStyle =
    dark;

  rr(
    -25,
    38,
    22,
    8,
    4
  );

  rr(
    5,
    38,
    22,
    8,
    4
  );

  /* torso */

  ctx.fillStyle =
    body;

  ctx.strokeStyle =
    dark;

  ctx.lineWidth=3;

  rr(
    -26,
    -5,
    52,
    48,
    15
  );

  ctx.stroke();

  /* chest core */

  ctx.fillStyle =
    accent;

  ctx.globalAlpha=.85;

  rr(
    -20,
    2,
    40,
    12,
    5
  );

  ctx.globalAlpha=1;

  /* armor */

  if(index % 3 === 0){

    ctx.fillStyle =
      metal;

    rr(
      -22,
      -2,
      10,
      35,
      4
    );

    rr(
      12,
      -2,
      10,
      35,
      4
    );
  }

  if(index % 5 === 0){

    ctx.strokeStyle =
      accent;

    ctx.shadowBlur=15;

    ctx.shadowColor =
      accent;

    ctx.strokeRect(
      -25,
      -4,
      50,
      43
    );

    ctx.shadowBlur=0;
  }

  /* neck */

  ctx.fillStyle =
    skin;

  ctx.beginPath();

  ctx.arc(
    20,
    -15,
    12,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.strokeStyle =
    dark;

  ctx.stroke();

  /* head */

  ctx.fillStyle =
    skin;

  ctx.beginPath();

  ctx.ellipse(
    25,
    -35,
    25,
    22,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.stroke();

  /* snout */

  ctx.beginPath();

  ctx.roundRect(
    38,
    -32,
    20,
    13,
    6
  );

  ctx.fill();

  ctx.stroke();

  /* visor */

  ctx.fillStyle =
    "#070a11";

  rr(
    25,
    -45,
    25,
    9,
    4
  );

  ctx.fillStyle =
    accent;

  ctx.shadowBlur=10;

  ctx.shadowColor =
    accent;

  ctx.fillRect(
    38,
    -43,
    7,
    3
  );

  ctx.shadowBlur=0;

  /* teeth */

  ctx.fillStyle =
    "#fff";

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

  /* crown / horns */

  if(index >= 9){

    ctx.fillStyle =
      accent;

    ctx.beginPath();

    ctx.moveTo(
      5,
      -50
    );

    ctx.lineTo(
      13,
      -67
    );

    ctx.lineTo(
      21,
      -52
    );

    ctx.lineTo(
      30,
      -70
    );

    ctx.lineTo(
      38,
      -49
    );

    ctx.closePath();

    ctx.fill();

    ctx.strokeStyle =
      dark;

    ctx.stroke();
  }

  /* weapon */

  if(index % 4 === 0){

    ctx.strokeStyle =
      metal;

    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.moveTo(
      -28,
      -4
    );

    ctx.lineTo(
      -45,
      -36
    );

    ctx.stroke();

    ctx.strokeStyle =
      accent;

    ctx.lineWidth=2;

    ctx.beginPath();

    ctx.moveTo(
      -49,
      -40
    );

    ctx.lineTo(
      -31,
      -7
    );

    ctx.stroke();
  }

  /* arms */

  limb(
    -29,
    4,
    12,
    28,
    -.45,
    body
  );

  limb(
    29,
    4,
    12,
    28,
    .45,
    body
  );

  ctx.fillStyle =
    accent;

  ctx.beginPath();

  ctx.arc(
    -38,
    16,
    6,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.arc(
    38,
    16,
    6,
    0,
    Math.PI*2
  );

  ctx.fill();

  /* aura ring */

  if(index >= 14){

    ctx.globalAlpha =
      .35;

    ctx.strokeStyle =
      accent;

    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.arc(
      5,
      -12,
      58 +
      Math.sin(
        worldTime*.12
      )*4,
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

function drawBackground(){

  const world =
    worlds.find(
      w=>w.id===save.world
    ) || worlds[0];

  const c =
    world.color;

  const grad =
    ctx.createLinearGradient(
      0,
      0,
      0,
      520
    );

  grad.addColorStop(
    0,
    "#07091c"
  );

  grad.addColorStop(
    .55,
    "#140b2c"
  );

  grad.addColorStop(
    1,
    "#061820"
  );

  ctx.fillStyle =
    grad;

  ctx.fillRect(
    0,
    0,
    1200,
    520
  );

  /* stars */

  for(
    let i=0;
    i<100;
    i++
  ){

    const x =
      (
        i*173 -
        score*.05
      ) % 1200;

    const y =
      25 +
      (i*47)%290;

    ctx.fillStyle =
      i%6===0
        ? c+"bb"
        : "#ffffff88";

    ctx.fillRect(
      x,
      y,
      2+(i%3),
      2+(i%2)
    );
  }

  /* mountains */

  ctx.fillStyle =
    "#15384b";

  for(
    let i=0;
    i<9;
    i++
  ){

    const x =
      i*180 -
      (
        score*.03%180
      );

    ctx.beginPath();

    ctx.moveTo(
      x,
      430
    );

    ctx.lineTo(
      x+80,
      290-(i%2)*50
    );

    ctx.lineTo(
      x+160,
      430
    );

    ctx.fill();
  }

  /* world-specific glow */

  ctx.globalAlpha=.15;

  ctx.fillStyle =
    c;

  ctx.beginPath();

  ctx.arc(
    930,
    120,
    100 +
      Math.sin(worldTime*.03)*10,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.globalAlpha=1;

  /* ground */

  ctx.fillStyle =
    "#102f34";

  ctx.fillRect(
    0,
    G,
    1200,
    90
  );

  ctx.strokeStyle =
    c;

  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.moveTo(
    0,
    G
  );

  ctx.lineTo(
    1200,
    G
  );

  ctx.stroke();
}

/* =========================================================
   DRAW OBJECTS
   ========================================================= */

function drawObjects(){

  /* gems */

  gems.forEach(
    z=>{

      ctx.save();

      ctx.fillStyle =
        "#61eaff";

      ctx.shadowBlur=20;

      ctx.shadowColor =
        "#61eaff";

      ctx.translate(
        z.x,
        z.y
      );

      ctx.rotate(
        worldTime*.04
      );

      ctx.beginPath();

      ctx.moveTo(
        0,
        -14
      );

      ctx.lineTo(
        12,
        0
      );

      ctx.lineTo(
        0,
        14
      );

      ctx.lineTo(
        -12,
        0
      );

      ctx.closePath();

      ctx.fill();

      ctx.restore();
    }
  );

  /* powerups */

  powers.forEach(
    p=>{

      ctx.save();

      ctx.fillStyle =
        p.type==="heart"
          ? "#ff557f"
          : "#62ecff";

      ctx.shadowBlur=18;

      ctx.shadowColor =
        ctx.fillStyle;

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        15,
        0,
        Math.PI*2
      );

      ctx.fill();

      ctx.fillStyle =
        "#fff";

      ctx.font =
        "16px Arial";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillText(
        p.type==="heart"
          ? "♥"
          : "◆",
        p.x,
        p.y
      );

      ctx.restore();
    }
  );

  /* enemies */

  obs.forEach(
    o=>{

      ctx.save();

      ctx.shadowBlur=14;

      ctx.shadowColor =
        "#ff4f8d";

      ctx.fillStyle =
        "#ff4f8d";

      if(o.type==="tall"){

        ctx.beginPath();

        ctx.moveTo(
          o.x,
          o.y+o.h
        );

        ctx.lineTo(
          o.x+30,
          o.y
        );

        ctx.lineTo(
          o.x+o.w,
          o.y+o.h
        );

        ctx.closePath();

        ctx.fill();

      }else{

        ctx.beginPath();

        ctx.roundRect(
          o.x,
          o.y,
          o.w,
          o.h,
          12
        );

        ctx.fill();

        ctx.fillStyle =
          "#160d20";

        ctx.fillRect(
          o.x+12,
          o.y+12,
          8,
          8
        );

        ctx.fillRect(
          o.x+o.w-20,
          o.y+12,
          8,
          8
        );
      }

      ctx.restore();
    }
  );

  /* particles */

  particles.forEach(
    p=>{

      ctx.globalAlpha =
        Math.max(
          0,
          p.life
        );

      ctx.fillStyle =
        p.color;

      ctx.fillRect(
        p.x,
        p.y,
        4,
        4
      );
    }
  );

  ctx.globalAlpha=1;
}

/* =========================================================
   DRAW
   ========================================================= */

function draw(){

  drawBackground();

  drawObjects();

  ctx.save();

  if(shieldActive){

    ctx.strokeStyle =
      "#62ecff";

    ctx.lineWidth=5;

    ctx.shadowBlur=25;

    ctx.shadowColor =
      "#62ecff";

    ctx.beginPath();

    ctx.arc(
      P.x+29,
      P.y+35,
      48,
      0,
      Math.PI*2
    );

    ctx.stroke();

    ctx.shadowBlur=0;
  }

  drawCharacter(
    P.x+29,
    P.y+35
  );

  ctx.restore();

  if(dashTimer>0){

    ctx.fillStyle =
      "#62ecff55";

    for(
      let i=1;
      i<6;
      i++
    ){

      ctx.fillRect(
        P.x-i*25,
        P.y+25,
        14,
        4
      );
    }
  }
}

/* =========================================================
   LOOP
   ========================================================= */

function loop(t){

  if(!running)
    return;

  const dt =
    Math.min(
      2,
      (t-last)/16.67
    );

  last = t;

  update(dt);

  draw();

  if(running)
    requestAnimationFrame(
      loop
    );
}

/* =========================================================
   CONTROLS
   ========================================================= */

document.addEventListener(
  "keydown",
  e=>{

    if(
      e.code==="Space" ||
      e.code==="ArrowUp"
    ){

      e.preventDefault();
      jump();
    }

    if(e.code==="KeyD"){

      e.preventDefault();
      dash();
    }

    if(e.code==="KeyS"){

      e.preventDefault();
      shield();
    }
  }
);

$("startButton") &&
(
  $("startButton").onclick =
    start
);

$("restartButton") &&
(
  $("restartButton").onclick =
    start
);

$("jumpButton") &&
(
  $("jumpButton").onclick =
    jump
);

$("dashButton") &&
(
  $("dashButton").onclick =
    dash
);

$("shieldButton") &&
(
  $("shieldButton").onclick =
    shield
);

$("redeemButton") &&
(
  $("redeemButton").onclick =
    redeem
);

$("codeInput") &&
$("codeInput").addEventListener(
  "keydown",
  e=>{
    if(e.key==="Enter")
      redeem();
  }
);

/* =========================================================
   INITIALIZE
   ========================================================= */

tabs();

renderSkins();
renderMissions();
renderWorlds();
renderShop();

ui();

reset();

draw();

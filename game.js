"use strict";

/* =========================================================
   DINO LEGENDS
   VERSION 20
   ========================================================= */

const $ = id => document.getElementById(id);

const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");

const previewCanvas = $("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

const profileCanvas = $("profileCanvas");
const profileCtx = profileCanvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;
const GROUND = 435;

const SAVE_KEY = "DINO_LEGENDS_V20";

/* =========================================================
   SKINS
   ========================================================= */

const SKINS = [
  {
    name:"Arthur Rex",
    rarity:"LEGENDARY",
    cost:0,
    primary:"#d7b66b",
    secondary:"#263346",
    accent:"#fff0a8",
    weapon:"sword"
  },
  {
    name:"Ghost Rex",
    rarity:"PHANTOM",
    cost:5000,
    primary:"#b9c7dc",
    secondary:"#394861",
    accent:"#9fc5ff",
    weapon:"ghost"
  },
  {
    name:"Price Raptor",
    rarity:"ELITE",
    cost:15000,
    primary:"#687895",
    secondary:"#101827",
    accent:"#ff536d",
    weapon:"rifle"
  },
  {
    name:"Leon Rex",
    rarity:"SURVIVOR",
    cost:30000,
    primary:"#d29b62",
    secondary:"#27321e",
    accent:"#ffbf54",
    weapon:"blade"
  },
  {
    name:"Agent Rex",
    rarity:"STEALTH",
    cost:50000,
    primary:"#52647b",
    secondary:"#10131d",
    accent:"#61d9ff",
    weapon:"pistol"
  },
  {
    name:"Michael Rex",
    rarity:"OUTLAW",
    cost:80000,
    primary:"#a87950",
    secondary:"#222a34",
    accent:"#ffbc4d",
    weapon:"bat"
  },
  {
    name:"CJ Rex",
    rarity:"STREET KING",
    cost:120000,
    primary:"#6c9d79",
    secondary:"#1b2430",
    accent:"#54f0a4",
    weapon:"chain"
  },
  {
    name:"Cyber Rex",
    rarity:"CYBER",
    cost:200000,
    primary:"#28d9ff",
    secondary:"#10283a",
    accent:"#ff4fd8",
    weapon:"energy"
  },
  {
    name:"Samurai Rex",
    rarity:"SHADOW",
    cost:300000,
    primary:"#8b6476",
    secondary:"#211827",
    accent:"#ff5577",
    weapon:"katana"
  },
  {
    name:"Valkyrie Rex",
    rarity:"SKY LEGEND",
    cost:450000,
    primary:"#e6edf5",
    secondary:"#394a68",
    accent:"#b8e7ff",
    weapon:"wing"
  },
  {
    name:"Dragon Lord",
    rarity:"ANCIENT",
    cost:650000,
    primary:"#8d563d",
    secondary:"#351719",
    accent:"#ff6538",
    weapon:"dragon"
  },
  {
    name:"Demon Rex",
    rarity:"INFERNAL",
    cost:900000,
    primary:"#a32943",
    secondary:"#24101b",
    accent:"#ff284f",
    weapon:"demon"
  },
  {
    name:"Ice Emperor",
    rarity:"FROSTBORN",
    cost:1300000,
    primary:"#b9ecff",
    secondary:"#214a63",
    accent:"#66eaff",
    weapon:"ice"
  },
  {
    name:"Storm Emperor",
    rarity:"THUNDERBORN",
    cost:1800000,
    primary:"#718dff",
    secondary:"#17204a",
    accent:"#fff06a",
    weapon:"storm"
  },
  {
    name:"Void Emperor",
    rarity:"COSMIC",
    cost:2500000,
    primary:"#9e68ff",
    secondary:"#1c1240",
    accent:"#e8c7ff",
    weapon:"void"
  },
  {
    name:"Golden Titan",
    rarity:"ROYAL",
    cost:3500000,
    primary:"#ffd75c",
    secondary:"#573f13",
    accent:"#fff4a4",
    weapon:"crown"
  },
  {
    name:"Neon Phantom",
    rarity:"NEON",
    cost:5000000,
    primary:"#23f1dc",
    secondary:"#092b31",
    accent:"#ff4ed1",
    weapon:"neon"
  },
  {
    name:"Blood Moon Rex",
    rarity:"NIGHTMARE",
    cost:7000000,
    primary:"#8f2637",
    secondary:"#210b14",
    accent:"#ff334f",
    weapon:"moon"
  },
  {
    name:"Galaxy Rex",
    rarity:"GALACTIC",
    cost:10000000,
    primary:"#a76dff",
    secondary:"#1a1541",
    accent:"#62eaff",
    weapon:"galaxy"
  },
  {
    name:"Eternal Dragon",
    rarity:"DIVINE",
    cost:15000000,
    primary:"#d8f8ff",
    secondary:"#294d56",
    accent:"#fff27a",
    weapon:"eternal"
  }
];

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

/* =========================================================
   SAVE
   ========================================================= */

const DEFAULT_SAVE = {
  version:20,
  gems:2500,
  best:0,
  skin:0,
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
    runs:0,
    gems:0,
    jumps:0,
    dash:0,
    score:0
  },

  world:"FOREST"
};

let save = loadSave();

function loadSave(){

  try{

    const raw = localStorage.getItem(SAVE_KEY);

    if(!raw){
      return structuredClone(DEFAULT_SAVE);
    }

    const parsed = JSON.parse(raw);

    return {
      ...structuredClone(DEFAULT_SAVE),
      ...parsed,
      owned:Array.isArray(parsed.owned) ? parsed.owned : [0],
      used:Array.isArray(parsed.used) ? parsed.used : [],
      upgrades:{
        ...DEFAULT_SAVE.upgrades,
        ...(parsed.upgrades || {})
      },
      missions:{
        ...DEFAULT_SAVE.missions,
        ...(parsed.missions || {})
      }
    };

  }catch(error){

    console.warn("Save recovery:",error);

    return structuredClone(DEFAULT_SAVE);
  }
}

function persist(){

  try{
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(save)
    );
  }catch(error){
    console.warn("Save failed:",error);
  }
}

/* =========================================================
   GAME STATE
   ========================================================= */

let running=false;
let gameOver=false;

let score=0;
let speed=7;

let health=3;
let maxHealth=3;

let combo=1;

let lastTime=0;

let spawnTimer=0;
let gemTimer=0;

let dashTimer=0;
let dashCooldown=0;

let shieldActive=false;

let particles=[];
let obstacles=[];
let collectibles=[];

let worldColor="#08182c";

const player={
  x:160,
  y:GROUND-78,
  w:70,
  h:78,
  vy:0,
  jumps:0,
  grounded:true
};

/* =========================================================
   LEVEL / RANK
   ========================================================= */

function getLevel(){

  return Math.max(
    1,
    Math.floor(save.best/2500)+1
  );
}

function getRank(){

  const l=getLevel();

  if(l>=50) return "DIVINE";
  if(l>=40) return "MYTHIC";
  if(l>=30) return "LEGEND";
  if(l>=20) return "ELITE";
  if(l>=10) return "HUNTER";

  return "ROOKIE";
}

/* =========================================================
   UI
   ========================================================= */

function updateUI(){

  const level=getLevel();

  const elements={
    gems:save.gems.toLocaleString(),
    bestScore:Math.floor(save.best).toLocaleString(),
    level,
    score:Math.floor(score).toLocaleString(),
    combo:"x"+combo,
    worldHud:save.world,
    profileName:SKINS[save.skin]?.name || "Arthur Rex",
    profileLevel:level,
    profileBest:Math.floor(save.best).toLocaleString(),
    rank:getRank(),
    runs:save.runs,
    ownedSkins:`${save.owned.length} / ${SKINS.length}`,
    skinCount:`${save.owned.length} / ${SKINS.length}`
  };

  for(const [id,value] of Object.entries(elements)){
    const el=$(id);
    if(el) el.textContent=value;
  }

  const hp=Math.max(0,health);

  const hpEl=$("health");

  if(hpEl){

    hpEl.textContent=
      "❤️".repeat(Math.min(hp,8))+
      "🖤".repeat(Math.max(0,3-hp));
  }

  const progress=save.best%2500;

  const bar=$("xpBar");

  if(bar){
    bar.style.width=
      Math.min(100,progress/25)+"%";
  }

  const xpText=$("xpText");

  if(xpText){
    xpText.textContent=
      `${Math.floor(progress)} / 2500`;
  }

  drawProfile();
}

/* =========================================================
   REDEEM
   ========================================================= */

function showCodeMessage(text,type){

  const el=$("codeMessage");

  if(!el) return;

  el.textContent=text;
  el.className="code-message "+type;
}

function redeem(){

  const input=$("codeInput");

  if(!input) return;

  const code=(input.value||"")
    .trim()
    .toUpperCase()
    .replace(/\s+/g,"");

  if(!code){

    showCodeMessage(
      "ENTER A REWARD CODE.",
      "error"
    );

    return;
  }

  if(save.used.includes(code)){

    showCodeMessage(
      "THIS CODE HAS ALREADY BEEN USED.",
      "error"
    );

    return;
  }

  if(!Object.prototype.hasOwnProperty.call(REDEEM_CODES,code)){

    showCodeMessage(
      "INVALID REDEEM CODE.",
      "error"
    );

    return;
  }

  const reward=REDEEM_CODES[code];

  save.gems+=reward;
  save.used.push(code);

  persist();
  updateUI();

  input.value="";

  showCodeMessage(
    `REDEEMED SUCCESSFULLY • +${reward.toLocaleString()} GEMS`,
    "success"
  );
}

/* =========================================================
   PARTICLES
   ========================================================= */

function particle(x,y,color,count=8){

  for(let i=0;i<count;i++){

    particles.push({
      x,
      y,
      vx:(Math.random()-.5)*5,
      vy:(Math.random()-.5)*5,
      life:30+Math.random()*30,
      size:2+Math.random()*4,
      color
    });
  }
}

function updateParticles(dt){

  for(let i=particles.length-1;i>=0;i--){

    const p=particles[i];

    p.x+=p.vx*dt;
    p.y+=p.vy*dt;
    p.vy+=.05*dt;
    p.life-=dt;

    if(p.life<=0){
      particles.splice(i,1);
    }
  }
}

function drawParticles(){

  for(const p of particles){

    ctx.globalAlpha=Math.max(0,p.life/50);
    ctx.fillStyle=p.color;

    ctx.fillRect(
      p.x,
      p.y,
      p.size,
      p.size
    );
  }

  ctx.globalAlpha=1;
}

/* =========================================================
   SKIN DRAWING
   ========================================================= */

function roundedRect(c,x,y,w,h,r){

  c.beginPath();
  c.roundRect(x,y,w,h,r);
  c.fill();
}

function drawLegend(c,x,y,scale=1,index=save.skin,shadow=true){

  const s=SKINS[index] || SKINS[0];

  c.save();

  c.translate(x,y);
  c.scale(scale,scale);

  if(shadow){

    c.shadowBlur=25;
    c.shadowColor=s.accent;
  }

  /* aura */

  c.globalAlpha=.08;
  c.fillStyle=s.accent;
  c.beginPath();
  c.arc(0,-15,72,0,Math.PI*2);
  c.fill();
  c.globalAlpha=1;

  /* tail */

  c.fillStyle=s.primary;
  c.strokeStyle="#080b13";
  c.lineWidth=4;

  c.beginPath();
  c.moveTo(-22,15);
  c.quadraticCurveTo(-70,5,-80,28);
  c.quadraticCurveTo(-52,39,-20,28);
  c.closePath();
  c.fill();
  c.stroke();

  /* legs */

  c.fillStyle=s.secondary;

  roundedRect(c,-30,31,20,45,7);
  roundedRect(c,10,31,20,45,7);

  c.fillStyle=s.accent;

  roundedRect(c,-35,67,29,10,4);
  roundedRect(c,6,67,29,10,4);

  /* torso */

  c.fillStyle=s.secondary;
  c.strokeStyle="#080b13";
  c.lineWidth=4;

  roundedRect(c,-35,-18,70,60,16);
  c.stroke();

  /* chest plate */

  c.fillStyle=s.primary;
  roundedRect(c,-27,-10,54,17,6);

  /* center reactor */

  c.fillStyle=s.accent;
  c.shadowBlur=shadow?14:0;
  c.shadowColor=s.accent;

  c.beginPath();
  c.arc(0,18,6,0,Math.PI*2);
  c.fill();

  c.shadowBlur=0;

  /* arms */

  c.fillStyle=s.secondary;

  c.save();
  c.translate(-36,-2);
  c.rotate(-.35);
  roundedRect(c,-8,0,16,42,7);
  c.restore();

  c.save();
  c.translate(36,-2);
  c.rotate(.35);
  roundedRect(c,-8,0,16,42,7);
  c.restore();

  /* neck */

  c.fillStyle=s.primary;
  c.beginPath();
  c.arc(28,-27,13,0,Math.PI*2);
  c.fill();
  c.stroke();

  /* head */

  c.beginPath();
  c.ellipse(30,-50,32,27,0,0,Math.PI*2);
  c.fill();
  c.stroke();

  /* snout */

  roundedRect(c,47,-48,27,16,7);
  c.stroke();

  /* visor */

  c.fillStyle="#05070d";
  roundedRect(c,30,-62,35,12,5);

  c.fillStyle=s.accent;
  c.shadowBlur=shadow?12:0;
  c.shadowColor=s.accent;

  roundedRect(c,50,-59,9,4,2);

  c.shadowBlur=0;

  /* teeth */

  c.fillStyle="#fff";

  for(let i=0;i<4;i++){
    c.fillRect(
      54+i*5,
      -34,
      4,
      7
    );
  }

  /* skin-specific gear */

  c.strokeStyle=s.accent;
  c.fillStyle=s.primary;

  switch(s.weapon){

    case "sword":
      c.fillStyle="#dce7ef";
      c.beginPath();
      c.moveTo(-50,-20);
      c.lineTo(-68,-70);
      c.lineTo(-59,-75);
      c.lineTo(-39,-28);
      c.closePath();
      c.fill();
      c.stroke();
      break;

    case "ghost":
      c.globalAlpha=.55;
      c.strokeStyle=s.accent;
      c.lineWidth=5;
      c.beginPath();
      c.arc(30,-50,36,0,Math.PI*2);
      c.stroke();
      c.globalAlpha=1;
      break;

    case "rifle":
    case "pistol":
      c.fillStyle="#111827";
      roundedRect(c,-65,3,38,9,3);
      c.fillStyle=s.accent;
      c.fillRect(-61,5,30,3);
      break;

    case "katana":
      c.strokeStyle="#eee";
      c.lineWidth=5;
      c.beginPath();
      c.moveTo(-55,-35);
      c.lineTo(-76,-72);
      c.stroke();
      break;

    case "wing":
      c.fillStyle=s.accent;
      c.globalAlpha=.65;

      for(let i=0;i<4;i++){
        c.beginPath();
        c.ellipse(
          -40,
          -10-i*8,
          25,
          8,
          -.5,
          0,
          Math.PI*2
        );
        c.fill();
      }

      c.globalAlpha=1;
      break;

    case "dragon":
    case "demon":
      c.fillStyle=s.accent;

      c.beginPath();
      c.moveTo(5,-72);
      c.lineTo(16,-98);
      c.lineTo(26,-74);
      c.lineTo(38,-100);
      c.lineTo(48,-70);
      c.closePath();
      c.fill();
      break;

    case "ice":
      c.fillStyle=s.accent;

      for(let i=0;i<5;i++){

        c.beginPath();
        c.moveTo(-35+i*18,-73);
        c.lineTo(-27+i*18,-98-(i%2)*10);
        c.lineTo(-17+i*18,-73);
        c.closePath();
        c.fill();
      }

      break;

    case "storm":

      c.strokeStyle=s.accent;
      c.lineWidth=5;

      c.beginPath();
      c.moveTo(-10,-80);
      c.lineTo(10,-58);
      c.lineTo(-2,-43);
      c.stroke();

      break;

    case "void":

      c.fillStyle=s.accent;
      c.globalAlpha=.6;

      c.beginPath();
      c.arc(30,-50,42,0,Math.PI*2);
      c.fill();

      c.globalAlpha=1;
      break;

    case "crown":

      c.fillStyle="#ffe05e";
      c.beginPath();
      c.moveTo(0,-78);
      c.lineTo(15,-99);
      c.lineTo(25,-80);
      c.lineTo(42,-99);
      c.lineTo(48,-75);
      c.closePath();
      c.fill();
      c.stroke();
      break;

    case "neon":

      c.strokeStyle=s.accent;
      c.lineWidth=3;

      c.beginPath();
      c.arc(
        0,
        -20,
        65,
        Math.PI*.1,
        Math.PI*1.5
      );
      c.stroke();

      break;

    case "moon":

      c.fillStyle="#16070e";
      c.beginPath();
      c.arc(30,-50,39,0,Math.PI*2);
      c.fill();

      c.fillStyle=s.accent;
      c.beginPath();
      c.arc(45,-55,23,0,Math.PI*2);
      c.fill();

      break;

    case "galaxy":

      for(let i=0;i<8;i++){

        c.fillStyle=
          i%2?s.accent:"#fff";

        c.beginPath();
        c.arc(
          -30+Math.random()*120,
          -85+Math.random()*75,
          2,
          0,
          Math.PI*2
        );
        c.fill();
      }

      break;

    case "eternal":

      c.strokeStyle=s.accent;
      c.lineWidth=5;

      c.beginPath();
      c.arc(30,-50,43,0,Math.PI*2);
      c.stroke();

      c.fillStyle=s.accent;

      c.beginPath();
      c.moveTo(-55,-10);
      c.lineTo(-72,-28);
      c.lineTo(-57,-42);
      c.fill();

      break;
  }

  c.restore();
}

/* =========================================================
   PREVIEW
   ========================================================= */

function drawPreview(){

  previewCtx.clearRect(
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );

  previewCtx.fillStyle="#050712";
  previewCtx.fillRect(
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );

  drawLegend(
    previewCtx,
    90,
    125,
    .95,
    save.skin
  );
}

function drawProfile(){

  profileCtx.clearRect(
    0,
    0,
    profileCanvas.width,
    profileCanvas.height
  );

  profileCtx.fillStyle="#050712";
  profileCtx.fillRect(
    0,
    0,
    profileCanvas.width,
    profileCanvas.height
  );

  drawLegend(
    profileCtx,
    90,
    128,
    1,
    save.skin
  );
}

/* =========================================================
   SKIN PANEL
   ========================================================= */

function renderSkins(){

  const grid=$("skinGrid");

  if(!grid) return;

  grid.innerHTML="";

  SKINS.forEach((skin,index)=>{

    const owned=save.owned.includes(index);

    const article=document.createElement("article");

    article.className="item";

    const preview=document.createElement("canvas");

    preview.width=360;
    preview.height=170;
    preview.className="skin-preview";

    const pctx=preview.getContext("2d");

    pctx.fillStyle="#050712";
    pctx.fillRect(0,0,360,170);

    drawLegend(
      pctx,
      175,
      132,
      .72,
      index
    );

    article.appendChild(preview);

    const title=document.createElement("h3");
    title.textContent=skin.name;

    const rarity=document.createElement("small");
    rarity.textContent=skin.rarity;

    const desc=document.createElement("p");

    desc.textContent=owned
      ? "Unlocked • Ready to equip"
      : "Unlock this legendary character.";

    const footer=document.createElement("footer");

    const price=document.createElement("span");

    price.className="price";

    price.textContent=
      owned
      ? "✓ OWNED"
      : "💎 "+skin.cost.toLocaleString();

    const button=document.createElement("button");

    button.className="action";

    if(save.skin===index){

      button.textContent="EQUIPPED";
      button.disabled=true;

    }else if(owned){

      button.textContent="EQUIP";

      button.onclick=()=>{

        save.skin=index;
        persist();

        renderSkins();
        updateUI();
        drawPreview();
      };

    }else{

      button.textContent="UNLOCK";

      button.onclick=()=>{

        if(save.gems<skin.cost){

          showCodeMessage(
            "NOT ENOUGH GEMS.",
            "error"
          );

          return;
        }

        save.gems-=skin.cost;
        save.owned.push(index);
        save.skin=index;

        persist();

        renderSkins();
        updateUI();
        drawPreview();
      };
    }

    footer.append(price,button);

    article.append(
      title,
      rarity,
      desc,
      footer
    );

    grid.appendChild(article);
  });
}

/* =========================================================
   MISSIONS
   ========================================================= */

function renderMissions(){

  const grid=$("missionGrid");

  if(!grid) return;

  const missions=[
    {
      id:"runs",
      icon:"🏃",
      name:"First Legend",
      desc:"Complete 5 runs.",
      target:5,
      reward:2500
    },
    {
      id:"gems",
      icon:"💎",
      name:"Gem Hunter",
      desc:"Collect 500 gems.",
      target:500,
      reward:10000
    },
    {
      id:"jumps",
      icon:"🪽",
      name:"Sky Master",
      desc:"Perform 50 jumps.",
      target:50,
      reward:15000
    },
    {
      id:"dash",
      icon:"⚡",
      name:"Speed Demon",
      desc:"Perform 30 dashes.",
      target:30,
      reward:25000
    },
    {
      id:"score",
      icon:"🏆",
      name:"Legendary Score",
      desc:"Reach 10000 score.",
      target:10000,
      reward:50000
    }
  ];

  grid.innerHTML="";

  missions.forEach(m=>{

    const value=save.missions[m.id]||0;
    const completed=value>=m.target;

    const article=document.createElement("article");

    article.className="item";

    article.innerHTML=`
      <div class="icon" style="font-size:48px">${m.icon}</div>
      <h3>${m.name}</h3>
      <small>MISSION</small>
      <p>
        ${m.desc}<br>
        <b>${Math.min(value,m.target).toLocaleString()} /
        ${m.target.toLocaleString()}</b>
      </p>
      <footer>
        <span class="price">
          💎 ${m.reward.toLocaleString()}
        </span>
        <button class="action" ${completed?"disabled":""}>
          ${completed?"COMPLETED":"IN PROGRESS"}
        </button>
      </footer>
    `;

    grid.appendChild(article);
  });
}

/* =========================================================
   WORLDS
   ========================================================= */

function renderWorlds(){

  const grid=$("worldGrid");

  if(!grid) return;

  const worlds=[
    {
      id:"FOREST",
      icon:"🌲",
      name:"Enchanted Forest",
      requirement:0
    },
    {
      id:"RUINS",
      icon:"🌙",
      name:"Moonlit Ruins",
      requirement:2500
    },
    {
      id:"VOLCANO",
      icon:"🔥",
      name:"Dragon Volcano",
      requirement:10000
    },
    {
      id:"ICE",
      icon:"❄️",
      name:"Frozen Kingdom",
      requirement:25000
    },
    {
      id:"VOID",
      icon:"🌌",
      name:"Astral Void",
      requirement:100000
    }
  ];

  grid.innerHTML="";

  worlds.forEach(world=>{

    const unlocked=
      save.best>=world.requirement;

    const article=document.createElement("article");

    article.className="item";

    article.innerHTML=`
      <div class="icon" style="font-size:55px">${world.icon}</div>
      <h3>${world.name}</h3>
      <small>
        ${unlocked?"UNLOCKED":"REQUIRES "+world.requirement.toLocaleString()}
      </small>
      <p>
        ${
          unlocked
          ? "Realm available for your next adventure."
          : "Increase your best score to unlock this realm."
        }
      </p>
      <footer>
        <span class="price">
          ${unlocked?"✓ AVAILABLE":"🔒 LOCKED"}
        </span>
        <button
          class="action"
          ${unlocked?"":"disabled"}
        >
          ${unlocked?"ENTER":"LOCKED"}
        </button>
      </footer>
    `;

    const button=article.querySelector("button");

    if(unlocked){

      button.onclick=()=>{

        save.world=world.id;

        persist();
        updateUI();

        showCodeMessage(
          `WORLD SELECTED: ${world.name.toUpperCase()}`,
          "success"
        );
      };
    }

    grid.appendChild(article);
  });
}

/* =========================================================
   UPGRADES
   ========================================================= */

const UPGRADE_DATA=[
  {
    id:"speed",
    icon:"⚡",
    name:"Velocity Core",
    description:"Increase maximum running speed.",
    base:1000
  },
  {
    id:"jump",
    icon:"🪽",
    name:"Aerial Core",
    description:"Improve double-jump strength.",
    base:1500
  },
  {
    id:"shield",
    icon:"🛡",
    name:"Shield Core",
    description:"Increase maximum health.",
    base:2500
  },
  {
    id:"magnet",
    icon:"🧲",
    name:"Gem Magnet",
    description:"Increase gem pickup radius.",
    base:3000
  }
];

function upgradeCost(data){

  const level=save.upgrades[data.id]||0;

  return Math.floor(
    data.base*Math.pow(1.55,level)
  );
}

function renderShop(){

  const grid=$("shopGrid");

  if(!grid) return;

  grid.innerHTML="";

  UPGRADE_DATA.forEach(data=>{

    const level=save.upgrades[data.id]||0;
    const cost=upgradeCost(data);

    const article=document.createElement("article");

    article.className="item";

    article.innerHTML=`
      <div class="icon" style="font-size:50px">
        ${data.icon}
      </div>

      <h3>${data.name}</h3>

      <small>
        UPGRADE LEVEL ${level}
      </small>

      <p>
        ${data.description}
      </p>

      <footer>
        <span class="price">
          💎 ${cost.toLocaleString()}
        </span>

        <button class="action">
          UPGRADE
        </button>
      </footer>
    `;

    article.querySelector("button").onclick=()=>{

      if(save.gems<cost){

        showCodeMessage(
          "NOT ENOUGH GEMS.",
          "error"
        );

        return;
      }

      save.gems-=cost;
      save.upgrades[data.id]=level+1;

      persist();

      renderShop();
      updateUI();
    };

    grid.appendChild(article);
  });
}

/* =========================================================
   TABS
   ========================================================= */

function setupTabs(){

  document.querySelectorAll(".tab")
    .forEach(button=>{

      button.addEventListener("click",()=>{

        document
          .querySelectorAll(".tab")
          .forEach(x=>x.classList.remove("active"));

        document
          .querySelectorAll(".panel")
          .forEach(x=>x.classList.remove("active"));

        button.classList.add("active");

        const panel=$(button.dataset.panel);

        if(panel){
          panel.classList.add("active");
        }
      });
    });
}

/* =========================================================
   GAME RESET
   ========================================================= */

function resetGame(){

  score=0;

  speed=
    7+
    (save.upgrades.speed||0)*.45;

  maxHealth=
    3+
    (save.upgrades.shield||0);

  health=maxHealth;

  combo=1;

  dashTimer=0;
  dashCooldown=0;

  shieldActive=false;

  obstacles=[];
  collectibles=[];
  particles=[];

  spawnTimer=0;
  gemTimer=0;

  player.x=160;
  player.y=GROUND-player.h;
  player.vy=0;
  player.jumps=0;
  player.grounded=true;
}

/* =========================================================
   START / END
   ========================================================= */

function startGame(){

  resetGame();

  running=true;
  gameOver=false;

  save.runs++;
  save.missions.runs++;

  persist();

  $("startScreen")?.classList.add("hidden");
  $("gameOverScreen")?.classList.add("hidden");

  lastTime=performance.now();

  requestAnimationFrame(loop);

  renderMissions();
  updateUI();
}

function endGame(){

  if(gameOver) return;

  gameOver=true;
  running=false;

  save.best=Math.max(
    save.best,
    Math.floor(score)
  );

  save.missions.score=Math.max(
    save.missions.score,
    Math.floor(score)
  );

  persist();

  const final=$("finalScore");

  if(final){
    final.textContent=
      Math.floor(score).toLocaleString();
  }

  $("finalGems").textContent=
    Math.floor(score/100).toLocaleString();

  $("gameOverScreen")?.classList.remove("hidden");

  renderWorlds();
  renderMissions();
  renderShop();
  updateUI();
}

/* =========================================================
   INPUT
   ========================================================= */

function jump(){

  if(!running) return;

  if(player.jumps>=2) return;

  const power=
    15+
    (save.upgrades.jump||0)*.65;

  player.vy=-power;

  player.jumps++;
  player.grounded=false;

  save.missions.jumps++;

  particle(
    player.x+30,
    player.y+70,
    "#62ecff",
    8
  );

  persist();
}

function dash(){

  if(!running) return;
  if(dashCooldown>0) return;

  dashTimer=30;
  dashCooldown=70;

  score+=100;
  combo=Math.min(12,combo+1);

  save.missions.dash++;

  particle(
    player.x,
    player.y+35,
    "#ff62c7",
    15
  );

  persist();
}

function shield(){

  if(!running) return;

  shieldActive=!shieldActive;

  particle(
    player.x+30,
    player.y+30,
    "#62ecff",
    12
  );
}

/* =========================================================
   SPAWNING
   ========================================================= */

function spawnObjects(dt){

  spawnTimer+=dt;
  gemTimer+=dt;

  const difficulty=
    Math.min(35,score/450);

  const obstacleDelay=
    Math.max(
      38,
      72-difficulty
    );

  if(spawnTimer>obstacleDelay){

    const h=
      45+
      Math.random()*35;

    obstacles.push({
      x:W+80,
      y:GROUND-h,
      w:42+Math.random()*25,
      h,
      type:Math.random()>.7?"tall":"normal"
    });

    spawnTimer=0;
  }

  if(gemTimer>25){

    collectibles.push({
      x:W+40,
      y:180+Math.random()*180,
      r:12,
      spin:Math.random()*Math.PI*2
    });

    gemTimer=0;
  }
}

/* =========================================================
   COLLISION
   ========================================================= */

function collide(a,b){

  return(
    a.x+10<
      b.x+b.w &&
    a.x+a.w-10>
      b.x &&
    a.y+10<
      b.y+b.h &&
    a.y+a.h>
      b.y
  );
}

/* =========================================================
   UPDATE
   ========================================================= */

function update(dt){

  score+=dt*.24;

  speed=Math.min(
    18,
    7+
    score/1700+
    (save.upgrades.speed||0)*.45
  );

  if(dashTimer>0){

    dashTimer-=dt;
    speed+=9;
  }

  if(dashCooldown>0){
    dashCooldown-=dt;
  }

  /* gravity */

  player.vy+=.85*dt;
  player.y+=player.vy*dt;

  if(player.y>=GROUND-player.h){

    player.y=GROUND-player.h;
    player.vy=0;

    player.jumps=0;
    player.grounded=true;

  }else{

    player.grounded=false;
  }

  spawnObjects(dt);

  /* obstacles */

  for(let i=obstacles.length-1;i>=0;i--){

    const o=obstacles[i];

    o.x-=speed*dt;

    if(collide(player,o)){

      if(shieldActive){

        shieldActive=false;

        obstacles.splice(i,1);

        combo=Math.min(
          12,
          combo+1
        );

        particle(
          player.x+30,
          player.y+35,
          "#62ecff",
          25
        );

      }else{

        health--;

        combo=1;

        obstacles.splice(i,1);

        particle(
          player.x+30,
          player.y+35,
          "#ff5577",
          18
        );

        if(health<=0){

          endGame();
          return;
        }
      }

    }else if(o.x<-100){

      obstacles.splice(i,1);
    }
  }

  /* gems */

  const magnetRadius=
    60+
    (save.upgrades.magnet||0)*25;

  for(let i=collectibles.length-1;i>=0;i--){

    const g=collectibles[i];

    g.x-=speed*dt;
    g.spin+=.1*dt;

    const dx=
      g.x-(player.x+player.w/2);

    const dy=
      g.y-(player.y+player.h/2);

    if(Math.hypot(dx,dy)<magnetRadius){

      save.gems+=25;
      save.missions.gems+=25;

      score+=50;

      combo=Math.min(
        12,
        combo+1
      );

      particle(
        g.x,
        g.y,
        "#61eaff",
        10
      );

      collectibles.splice(i,1);

      persist();

    }else if(g.x<-50){

      collectibles.splice(i,1);
    }
  }

  updateParticles(dt);

  updateUI();
}

/* =========================================================
   BACKGROUND
   ========================================================= */

function drawBackground(){

  const gradient=
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  gradient.addColorStop(
    0,
    "#05071a"
  );

  gradient.addColorStop(
    .5,
    "#121039"
  );

  gradient.addColorStop(
    1,
    "#061c24"
  );

  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,W,H);

  /* stars */

  for(let i=0;i<100;i++){

    const x=
      (i*173-score*.04)%W;

    const y=
      25+(i*47)%300;

    ctx.fillStyle=
      i%5===0
      ?"#62ecff"
      :"#ffffff88";

    ctx.fillRect(
      (x+W)%W,
      y,
      2,
      2
    );
  }

  /* mountains */

  ctx.fillStyle="#111d3d";

  for(let i=0;i<9;i++){

    const x=
      i*190-
      (score*.025%190);

    ctx.beginPath();

    ctx.moveTo(x,GROUND);

    ctx.lineTo(
      x+95,
      270-(i%2)*50
    );

    ctx.lineTo(
      x+190,
      GROUND
    );

    ctx.fill();
  }

  /* ground */

  ctx.fillStyle="#071c26";

  ctx.fillRect(
    0,
    GROUND,
    W,
    H-GROUND
  );

  ctx.strokeStyle="#62ecff";
  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.moveTo(0,GROUND);
  ctx.lineTo(W,GROUND);

  ctx.stroke();

  /* ground lines */

  ctx.strokeStyle="#ffffff12";

  for(let x=0;x<W;x+=70){

    const offset=
      (score*.8)%70;

    ctx.beginPath();

    ctx.moveTo(
      x-offset,
      GROUND+25
    );

    ctx.lineTo(
      x-offset-35,
      GROUND+80
    );

    ctx.stroke();
  }
}

/* =========================================================
   DRAW GAME OBJECTS
   ========================================================= */

function drawCollectibles(){

  for(const g of collectibles){

    ctx.save();

    ctx.translate(
      g.x,
      g.y
    );

    ctx.rotate(
      g.spin
    );

    ctx.shadowBlur=20;
    ctx.shadowColor="#61eaff";

    ctx.fillStyle="#61eaff";

    ctx.beginPath();

    ctx.moveTo(0,-15);
    ctx.lineTo(12,0);
    ctx.lineTo(0,15);
    ctx.lineTo(-12,0);
    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }
}

function drawObstacles(){

  for(const o of obstacles){

    ctx.save();

    ctx.translate(
      o.x,
      o.y
    );

    ctx.shadowBlur=15;
    ctx.shadowColor="#ff5577";

    ctx.fillStyle="#ff5577";

    ctx.beginPath();

    ctx.moveTo(
      0,
      o.h
    );

    ctx.lineTo(
      o.w/2,
      0
    );

    ctx.lineTo(
      o.w,
      o.h
    );

    ctx.closePath();

    ctx.fill();

    ctx.shadowBlur=0;

    ctx.fillStyle="#ffd2df";

    ctx.fillRect(
      o.w/2-3,
      10,
      6,
      o.h-20
    );

    ctx.restore();
  }
}

function drawPlayer(){

  ctx.save();

  if(shieldActive){

    ctx.strokeStyle="#62ecff";
    ctx.lineWidth=4;

    ctx.shadowBlur=25;
    ctx.shadowColor="#62ecff";

    ctx.beginPath();

    ctx.arc(
      player.x+35,
      player.y+38,
      55,
      0,
      Math.PI*2
    );

    ctx.stroke();

    ctx.shadowBlur=0;
  }

  if(dashTimer>0){

    ctx.globalAlpha=.25;

    for(let i=1;i<6;i++){

      drawLegend(
        ctx,
        player.x+35-i*18,
        player.y+38,
        .72,
        save.skin,
        false
      );
    }

    ctx.globalAlpha=1;
  }

  drawLegend(
    ctx,
    player.x+35,
    player.y+38,
    .72,
    save.skin,
    true
  );

  ctx.restore();
}

/* =========================================================
   DRAW
   ========================================================= */

function draw(){

  drawBackground();

  drawCollectibles();
  drawObstacles();
  drawParticles();
  drawPlayer();
}

/* =========================================================
   GAME LOOP
   ========================================================= */

function loop(time){

  if(!running) return;

  const dt=
    Math.min(
      2,
      (time-lastTime)/16.67
    );

  lastTime=time;

  update(dt);
  draw();

  if(running){

    requestAnimationFrame(loop);
  }
}

/* =========================================================
   EVENTS
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
      shield();
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
  shield
);

$("redeemButton")?.addEventListener(
  "click",
  redeem
);

$("codeInput")?.addEventListener(
  "keydown",
  event=>{

    if(event.key==="Enter"){
      redeem();
    }
  }
);

/* =========================================================
   INIT
   ========================================================= */

setupTabs();

renderSkins();
renderMissions();
renderWorlds();
renderShop();

updateUI();
drawPreview();

resetGame();
draw();

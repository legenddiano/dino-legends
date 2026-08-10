/* DINO LEGENDS V32 — gameplay loader + reliable redeem bridge. */
(()=>{
'use strict';
const sourceUrl='game-v24.js?v=32',SAVE='DINO_LEGENDS_V30';
const CODES={TRILLION1:{gems:1000000000000},DINOLEGEND:{gems:100000,skin:23},REX2026:{gems:50000},VOIDKING:{gems:250000,skin:24},MEGADINO:{gems:1000000},GALAXYREX:{gems:500000,skin:19},UPGRADEMAX:{gems:50000,maxUpgrades:true},WORLD5:{gems:25000,world:4},LEGENDARY:{gems:750000,skin:23},DINO100:{gems:100000},DINOADMIN:{gems:9999999,world:7,allSkins:true,maxUpgrades:true}};
const load=()=>{try{return JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{return {}}};
const persist=s=>localStorage.setItem(SAVE,JSON.stringify(s));
function redeem(){
 const input=document.getElementById('codeInput'),msg=document.getElementById('codeMessage');
 if(!input||!msg)return;
 const code=input.value.trim().toUpperCase();
 if(!code){msg.textContent='ENTER A CODE';msg.dataset.kind='bad';return}
 const reward=CODES[code];
 if(!reward){msg.textContent='INVALID CODE';msg.dataset.kind='bad';return}
 const s=load();
 s.gems=Number.isFinite(Number(s.gems))?Number(s.gems):0;
 s.owned=Array.isArray(s.owned)?s.owned:[];
 s.up=s.up&&typeof s.up==='object'?s.up:{};
 s.used=Array.isArray(s.used)?s.used:[];
 if(s.used.includes(code)){msg.textContent='CODE ALREADY REDEEMED';msg.dataset.kind='bad';return}
 if(reward.gems)s.gems+=reward.gems;
 if(Number.isInteger(reward.skin)){if(!s.owned.includes(reward.skin))s.owned.push(reward.skin);s.skin=reward.skin}
 if(reward.allSkins){for(let i=0;i<30;i++)if(!s.owned.includes(i))s.owned.push(i);s.skin=29}
 if(reward.world!=null)s.world=Math.max(Number(s.world)||0,reward.world);
 if(reward.maxUpgrades)for(let i=0;i<12;i++)s.up[i]=5;
 s.used.push(code);
 persist(s);
 msg.textContent=`REDEEMED · +${(reward.gems||0).toLocaleString()} GEMS`+(reward.allSkins?' · ALL SKINS UNLOCKED':'')+(reward.maxUpgrades?' · UPGRADES MAXED':'');
 msg.dataset.kind='good';
 input.value='';
 const gems=document.getElementById('gems');
 if(gems)gems.textContent=s.gems.toLocaleString();
 document.dispatchEvent(new CustomEvent('dino-redeemed',{detail:{code,reward,gems:s.gems}}));
 /* The gameplay engine keeps its own in-memory save object. Reloading after
    the transaction makes it read the exact persisted wallet instead of
    overwriting the redeemed value with its old in-memory value. */
 setTimeout(()=>location.reload(),80);
}
function bindRedeem(){
 const b=document.getElementById('redeemButton'),i=document.getElementById('codeInput');
 if(!b||!i||b.dataset.redeemBound)return;
 b.dataset.redeemBound='1';
 b.addEventListener('click',redeem);
 i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();redeem()}});
}
const start=async()=>{
 try{
  const response=await fetch(sourceUrl,{cache:'no-store'});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  let source=await response.text();
  source=source.replace('P.vy=P.jumps?-790:-960','P.vy=P.jumps?790:960').replace('P.vy+=2350*dt','P.vy-=2350*dt');
  if(source.includes('P.vy=P.jumps?-790:-960')||source.includes('P.vy+=2350*dt'))throw new Error('Jump physics patch did not apply');
  const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob),engine=document.createElement('script');
  engine.src=url;
  engine.onload=()=>{URL.revokeObjectURL(url);bindRedeem();setTimeout(bindRedeem,250);setTimeout(bindRedeem,1000)};
  engine.onerror=()=>{URL.revokeObjectURL(url);console.error('DINO LEGENDS: patched gameplay engine failed to execute.')};
  document.head.appendChild(engine)
 }catch(error){console.error('DINO LEGENDS: gameplay engine failed to load.',error)}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bindRedeem();start()},{once:true});else{bindRedeem();start()}
})();

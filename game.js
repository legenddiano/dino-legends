/* DINO LEGENDS V34 — gameplay loader + reliable redeem bridge + Apex gameplay expansion. */
(()=>{
'use strict';
const sourceUrl='game-v24.js?v=34',SAVE='DINO_LEGENDS_V30';
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
 msg.dataset.kind='good';input.value='';
 const gems=document.getElementById('gems');if(gems)gems.textContent=s.gems.toLocaleString();
 document.dispatchEvent(new CustomEvent('dino-redeemed',{detail:{code,reward,gems:s.gems}}));
 setTimeout(()=>location.reload(),80);
}
function bindRedeem(){
 const b=document.getElementById('redeemButton'),i=document.getElementById('codeInput');
 if(!b||!i||b.dataset.redeemBound)return;
 b.dataset.redeemBound='1';b.addEventListener('click',redeem);
 i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();redeem()}});
}
const start=async()=>{
 try{
  const response=await fetch(sourceUrl,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
  let source=await response.text();
  source=source.replace('P.vy=P.jumps?-790:-960','P.vy=P.jumps?790:960').replace('P.vy+=2350*dt','P.vy-=2350*dt');
  const expansion=`
/* V34 APEX EXPANSION — gameplay only; UI controls remain unchanged. */
(()=>{
 const dayKey=new Date().toISOString().slice(0,10),dailyKey='DINO_APEX_DAILY_V1';
 const events=[
  ['RIFT RUSH','SPEED +12% · SCORE +25%','rift'],
  ['GEM STORM','GEM DROPS ×2 · BONUS GEMS','gems'],
  ['GUARDIAN HUNT','GUARDIANS ARRIVE EARLIER · BONUS REWARD','guardian'],
  ['ELITE SURGE','MORE ELITES · ELITE SCORE +50%','elite'],
  ['PHASE SHIFT','DOUBLE POWER-UPS · FASTER COMBOS','phase']
 ];
 const event=events[Math.abs([...dayKey].reduce((a,c)=>a+c.charCodeAt(0),0))%events.length];
 let daily=(()=>{try{return JSON.parse(localStorage.getItem(dailyKey)||'{}')}catch{return {}}})();
 if(daily.day!==dayKey)daily={day:dayKey,claimed:false,score:0,powerups:0,guardian:0};
 let powerups=[],powerTimer=0,magnetUntil=0,dailyBanner=2.8,lastDailyAward=0;
 const baseSpawn=spawnDirector,baseDraw=draw,baseUpdate=update,baseStart=start,baseFinish=finish;
 function awardDaily(){if(daily.claimed||lastDailyAward)return;daily.claimed=1;lastDailyAward=1;save.gems+=1500;persist();toast('DAILY COMPLETE · +1,500 GEMS')}
 function spawnPower(){const types=['shield','fury','magnet','energy'];const type=types[Math.floor(Math.random()*types.length)];powerups.push({type,x:W+80,lane:Math.floor(Math.random()*3),y:G-145,phase:Math.random()*6})}
 spawnDirector=function(){
  baseSpawn();
  const chance=event[2]==='gems'?0.75:event[2]==='elite'?0.4:0.22;
  if(Math.random()<chance)spawnObj(event[2]==='gems'?'gem':event[2]==='elite'?'elite':'enemy',Math.floor(Math.random()*3));
  if(event[2]==='guardian'&&time>24&&!boss&&Math.random()<0.018)startBoss();
  if(Math.random()<0.07)spawnPower();
 };
 function updatePowerups(dt){
  const speed=(380+time*5)*WORLDS[world][3]*(event[2]==='rift'?1.12:1);
  for(let i=powerups.length-1;i>=0;i--){const p=powerups[i];p.x-=speed*dt;p.phase+=dt*5;p.y=G-145+Math.sin(p.phase)*18;
   if(Math.abs(p.x-P.x)<60&&p.lane===P.lane&&Math.abs(p.y-(G-P.y-45))<100){
    if(p.type==='shield'){P.inv=4;toast('SHIELD ONLINE')}
    if(p.type==='fury'){rage=100;toast('FURY CHARGED')}
    if(p.type==='magnet'){magnetUntil=time+7;toast('GEM MAGNET')}
    if(p.type==='energy'){energy=maxEnergy;toast('ENERGY REFILL')}
    daily.powerups++;powerups.splice(i,1);continue;
   }
   if(p.x<-120)powerups.splice(i,1);
  }
  if(magnetUntil>time)for(const o of objects)if(o.type==='gem'&&o.x<P.x+330){o.x+=(P.x-o.x)*Math.min(1,dt*4)}
  daily.score=Math.max(daily.score,Math.floor(score));
  if(event[2]==='guardian'&&save.stats.boss>daily.guardian)daily.guardian=save.stats.boss;
  if(daily.score>=12000&&(event[2]!=='guardian'||daily.guardian>0))awardDaily();
  localStorage.setItem(dailyKey,JSON.stringify(daily));
 }
 update=function(dt){
  const before=score;
  baseUpdate(dt);
  updatePowerups(dt);
  if(event[2]==='rift')score+=Math.max(0,score-before)*.12;
  if(event[2]==='gems'&&runGems>0)score+=Math.max(0,runGems-(daily._lastGems||0))*45;
  daily._lastGems=runGems;
 };
 function drawPowerups(){
  for(const p of powerups){const colors={shield:'#62efff',fury:'#ff6b9d',magnet:'#ffe071',energy:'#8dff9c'};const c=colors[p.type];ctx.save();ctx.translate(p.x,p.y);ctx.shadowColor=c;ctx.shadowBlur=24;ctx.strokeStyle=c;ctx.fillStyle='#0b1017';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=c;ctx.font='900 14px Orbitron';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.type==='shield'?'S':p.type==='fury'?'F':p.type==='magnet'?'M':'E',0,1);ctx.restore()}
  if(dailyBanner>0){dailyBanner-=0.016;ctx.save();ctx.fillStyle='#05070dcc';ctx.strokeStyle='#d09aff';ctx.lineWidth=2;ctx.fillRect(430,125,580,72);ctx.strokeRect(430,125,580,72);ctx.fillStyle='#fff';ctx.font='900 18px Orbitron';ctx.textAlign='center';ctx.fillText('DAILY EVENT · '+event[0],720,153);ctx.fillStyle='#b9c3d0';ctx.font='700 13px Orbitron';ctx.fillText(event[1],720,177);ctx.restore()}
  if(magnetUntil>time){ctx.save();ctx.fillStyle='#ffe071';ctx.font='800 13px Orbitron';ctx.textAlign='right';ctx.fillText('MAGNET '+Math.max(0,magnetUntil-time).toFixed(1)+'s',1390,145);ctx.restore()}
 }
 draw=function(){baseDraw();drawPowerups()};
 const originalStart=baseStart;
 start=function(){dailyBanner=2.8;powerups=[];magnetUntil=0;originalStart();};
 finish=function(){const before=save.gems;const result=baseFinish();if(event[2]==='guardian'&&save.stats.boss>0)save.gems+=1000;if(event[2]==='elite')save.gems+=500;if(save.gems!==before)persist();return result};
 window.DINO_APEX_DAILY={name:event[0],description:event[1],key:event[2]};
})();
`;
  source=source.replace('\nrender();hud();draw();\n})();',expansion+'\nrender();hud();draw();\n})();');
  const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob),engine=document.createElement('script');
  engine.src=url;engine.onload=()=>{URL.revokeObjectURL(url);bindRedeem();setTimeout(bindRedeem,250);setTimeout(bindRedeem,1000)};
  engine.onerror=()=>{URL.revokeObjectURL(url);console.error('DINO LEGENDS: patched gameplay engine failed to execute.')};document.head.appendChild(engine);
 }catch(error){console.error('DINO LEGENDS: gameplay engine failed to load.',error)}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bindRedeem();start()},{once:true});else{bindRedeem();start()}
})();

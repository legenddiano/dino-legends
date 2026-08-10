(()=>{
'use strict';
const KEY='DINO_LEGENDS_V30_META';
const SAVE='DINO_LEGENDS_V30';
const defaults={volume:80,particles:true,shake:true,reducedMotion:false,autoPause:true};
let meta;try{meta={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{meta={...defaults}}
const saveMeta=()=>localStorage.setItem(KEY,JSON.stringify(meta));
const $=id=>document.getElementById(id);
const dayKey=()=>new Date().toISOString().slice(0,10);
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0)};
const events=[
 ['APEX SPRINT','Score 7,500 points in one run',7500,'SCORE',500],
 ['GEM RAID','Collect 35 gems',35,'GEMS',450],
 ['PERFECT HUNTER','Reach x8 combo',8,'COMBO',600],
 ['GUARDIAN BREAKER','Defeat a Guardian',1,'BOSS',750],
 ['LONG HAUL','Survive 90 seconds',90,'TIME',800],
 ['ELITE PURGE','Defeat 12 elite enemies',12,'ELITE',650]
];
function daily(){
 const e=events[hash(dayKey())%events.length];let s={};try{s=JSON.parse(localStorage.getItem('DINO_DAILY_'+dayKey())||'{}')}catch{}
 return {name:e[0],desc:e[1],target:e[2],type:e[3],reward:e[4],progress:Number(s.progress||0),claimed:!!s.claimed};
}
function writeDaily(d){localStorage.setItem('DINO_DAILY_'+dayKey(),JSON.stringify({progress:d.progress,claimed:d.claimed}))}
const CODES={
 TRILLION1:{gems:1000000000000},
 DINOLEGEND:{gems:100000,skin:23},
 REX2026:{gems:50000},
 VOIDKING:{gems:250000,skin:24},
 MEGADINO:{gems:1000000},
 GALAXYREX:{gems:500000,skin:19},
 UPGRADEMAX:{gems:50000,maxUpgrades:true},
 WORLD5:{gems:25000,world:4},
 LEGENDARY:{gems:750000,skin:23},
 DINO100:{gems:100000},
 DINOADMIN:{gems:9999999,world:7,allSkins:true,maxUpgrades:true}
};
function loadGame(){try{return JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{return {}}}
function redeem(){
 const input=$('codeInput'),msg=$('codeMessage');if(!input||!msg)return;
 const code=input.value.trim().toUpperCase();if(!code){msg.textContent='ENTER A CODE';msg.dataset.kind='bad';return}
 const reward=CODES[code];if(!reward){msg.textContent='INVALID CODE';msg.dataset.kind='bad';return}
 const s=loadGame();s.gems=Number(s.gems)||0;s.owned=Array.isArray(s.owned)?s.owned:[];s.up=s.up&&typeof s.up==='object'?s.up:{};s.used=Array.isArray(s.used)?s.used:[];
 if(s.used.includes(code)){msg.textContent='CODE ALREADY REDEEMED';msg.dataset.kind='bad';return}
 if(reward.gems)s.gems+=reward.gems;
 if(Number.isInteger(reward.skin)&&reward.skin>=0){if(!s.owned.includes(reward.skin))s.owned.push(reward.skin);s.skin=reward.skin}
 if(reward.allSkins){for(let i=0;i<30;i++)if(!s.owned.includes(i))s.owned.push(i);s.skin=29}
 if(reward.world!=null)s.world=Math.max(Number(s.world)||0,reward.world);
 if(reward.maxUpgrades)for(let i=0;i<12;i++)s.up[i]=5;
 s.used.push(code);localStorage.setItem(SAVE,JSON.stringify(s));
 msg.textContent=`REDEEMED · +${(reward.gems||0).toLocaleString()} GEMS`+(reward.allSkins?' · ALL SKINS UNLOCKED':'')+(reward.maxUpgrades?' · UPGRADES MAXED':'');msg.dataset.kind='good';input.value='';
 document.dispatchEvent(new CustomEvent('dino-redeemed',{detail:{code,reward}}));
}
function bindRedeem(){const b=$('redeemButton'),i=$('codeInput');if(!b||!i)return;if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',redeem);i.addEventListener('keydown',e=>{if(e.key==='Enter')redeem()})}}
function build(){
 const nav=document.querySelector('.tabs'),app=document.querySelector('.app');if(!nav||!app)return;
 if(!nav.querySelector('[data-panel="daily"]')){const mk=(id,text)=>{const b=document.createElement('button');b.className='tab';b.dataset.panel=id;b.type='button';b.textContent=text;return b};nav.append(mk('daily','DAILY EVENT'),mk('settings','SETTINGS'))}
 if(!$('daily')){const p=document.createElement('section');p.className='panel';p.id='daily';p.innerHTML='<div class="heading"><div><small>ROTATES EVERY 24 HOURS</small><h2>DAILY EVENT</h2></div><b id="dailyTimer"></b></div><div id="dailyCard"></div>';app.appendChild(p)}
 if(!$('settings')){const p=document.createElement('section');p.className='panel';p.id='settings';p.innerHTML='<div class="heading"><div><small>GAME CONFIGURATION</small><h2>SETTINGS</h2></div></div><div class="settingsGrid" id="settingsGrid"></div>';app.appendChild(p)}
 renderDaily();renderSettings();bindRedeem();
 if(!nav.dataset.dinoEventsBound){nav.dataset.dinoEventsBound='1';nav.addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id===b.dataset.panel))})}
}
function renderDaily(){const d=daily(),card=$('dailyCard');if(!card)return;const pct=Math.min(100,d.progress/d.target*100);card.innerHTML=`<article class="dailyCard"><div class="dailyTop"><span>LIVE · ${dayKey()}</span><strong>+${d.reward} GEMS</strong></div><h3>${d.name}</h3><p>${d.desc}</p><div class="dailyProgress"><i style="width:${pct}%"></i></div><div class="dailyBottom"><b>${Math.min(d.progress,d.target).toLocaleString()} / ${d.target.toLocaleString()}</b><button id="claimDaily" ${d.claimed||d.progress<d.target?'disabled':''}>${d.claimed?'CLAIMED':'CLAIM REWARD'}</button></div></article>`;$('claimDaily')?.addEventListener('click',()=>{const n=daily();if(n.claimed||n.progress<n.target)return;try{const raw=JSON.parse(localStorage.getItem(SAVE)||'{}');raw.gems=(Number(raw.gems)||0)+n.reward;localStorage.setItem(SAVE,JSON.stringify(raw));n.claimed=true;writeDaily(n);renderDaily();if($('gems'))$('gems').textContent=(raw.gems||0).toLocaleString()}catch(err){console.error('DINO DAILY CLAIM ERROR',err)}});updateTimer()}
function updateTimer(){const now=new Date(),next=new Date(now);next.setHours(24,0,0,0);const ms=next-now,h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);if($('dailyTimer'))$('dailyTimer').textContent=`NEXT RESET ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function renderSettings(){const g=$('settingsGrid');if(!g)return;g.innerHTML='';const items=[['volume','MASTER VOLUME',`${meta.volume}%`],['particles','PARTICLES',meta.particles?'ON':'OFF'],['shake','SCREEN SHAKE',meta.shake?'ON':'OFF'],['reducedMotion','REDUCED MOTION',meta.reducedMotion?'ON':'OFF'],['autoPause','AUTO PAUSE',meta.autoPause?'ON':'OFF']];items.forEach(([key,label,val])=>{const row=document.createElement('div');row.className='settingRow';row.innerHTML=`<div><b>${label}</b><small>${key==='volume'?'Audio level':'Accessibility / gameplay preference'}</small></div><button data-setting="${key}">${val}</button>`;g.append(row)});g.querySelectorAll('button[data-setting]').forEach(b=>b.onclick=()=>{const k=b.dataset.setting;if(k==='volume')meta.volume=meta.volume>=100?0:meta.volume+10;else meta[k]=!meta[k];saveMeta();renderSettings();document.dispatchEvent(new CustomEvent('dino-settings-changed',{detail:{...meta}}))});const reset=document.createElement('div');reset.className='settingRow danger';reset.innerHTML='<div><b>RESET GAME SAVE</b><small>Deletes progression and starts fresh.</small></div><button id="resetSave">RESET</button>';g.append(reset);$('resetSave').onclick=()=>{if(confirm('Reset all Dino Legends progression?')){localStorage.removeItem(SAVE);location.reload()}}}
function updateDaily(){const d=daily();let p=d.progress;if(d.type==='SCORE')p=Number($('score')?.textContent.replace(/,/g,'')||0);else if(d.type==='COMBO')p=parseFloat(($('combo')?.textContent||'x1').replace('x',''))||0;else if(d.type==='GEMS')p=Math.max(p,Number($('gems')?.textContent.replace(/,/g,'')||0));else if(d.type==='TIME')p=Math.max(p,Number(document.body.dataset.runTime||0));if(p>d.progress){d.progress=Math.min(p,d.target);writeDaily(d);renderDaily()}}
window.DinoSettings={get:()=>({...meta}),getDaily:daily,redeem};
function boot(){build();updateTimer();setInterval(updateTimer,1000);setInterval(updateDaily,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
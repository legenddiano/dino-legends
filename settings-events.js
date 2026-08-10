(()=>{
'use strict';
const KEY='DINO_LEGENDS_V30_META';
const defaults={volume:80,particles:true,shake:true,reducedMotion:false,autoPause:true};
let meta;try{meta={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{meta={...defaults}}
const save=()=>localStorage.setItem(KEY,JSON.stringify(meta));
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
function daily(){const e=events[hash(dayKey())%events.length];let s;try{s=JSON.parse(localStorage.getItem('DINO_DAILY_'+dayKey())||'{}')}catch{s={}};return {...e,progress:Number(s.progress||0),claimed:!!s.claimed}}
function writeDaily(d){localStorage.setItem('DINO_DAILY_'+dayKey(),JSON.stringify({progress:d.progress,claimed:d.claimed}))}
function build(){
 const nav=document.querySelector('.tabs');if(nav&&!document.querySelector('[data-panel="daily"]')){
  const mk=(id,text)=>{const b=document.createElement('button');b.className='tab';b.dataset.panel=id;b.type='button';b.textContent=text;return b};nav.append(mk('daily','DAILY EVENT'),mk('settings','SETTINGS'));
 }
 const app=document.querySelector('.app');if(!app)return;
 if(!$('daily')){const p=document.createElement('section');p.className='panel';p.id='daily';p.innerHTML='<div class="heading"><div><small>ROTATES EVERY 24 HOURS</small><h2>DAILY EVENT</h2></div><b id="dailyTimer"></b></div><div id="dailyCard"></div>';app.appendChild(p)}
 if(!$('settings')){const p=document.createElement('section');p.className='panel';p.id='settings';p.innerHTML='<div class="heading"><div><small>GAME CONFIGURATION</small><h2>SETTINGS</h2></div></div><div class="settingsGrid" id="settingsGrid"></div>';app.appendChild(p)}
 renderDaily();renderSettings();
 nav?.addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id===b.dataset.panel))});
}
function renderDaily(){const d=daily(),card=$('dailyCard');if(!card)return;const [name,desc,target,type,reward]=d;const pct=Math.min(100,d.progress/target*100);card.innerHTML=`<article class="dailyCard"><div class="dailyTop"><span>LIVE · ${dayKey()}</span><strong>+${reward} GEMS</strong></div><h3>${name}</h3><p>${desc}</p><div class="dailyProgress"><i style="width:${pct}%"></i></div><div class="dailyBottom"><b>${Math.min(d.progress,target).toLocaleString()} / ${target.toLocaleString()}</b><button id="claimDaily" ${d.claimed||d.progress<target?'disabled':''}>${d.claimed?'CLAIMED':'CLAIM REWARD'}</button></div></article>`;
 $('claimDaily')?.addEventListener('click',()=>{const n=daily();if(n.claimed||n.progress<n[2])return;try{const raw=JSON.parse(localStorage.getItem('DINO_LEGENDS_V30')||'{}');raw.gems=(raw.gems||0)+reward;localStorage.setItem('DINO_LEGENDS_V30',JSON.stringify(raw));n.claimed=true;writeDaily(n);renderDaily();if($('gems'))$('gems').textContent=(raw.gems||0).toLocaleString()}catch{}});
 const tick=()=>{const now=new Date(),next=new Date(now);next.setHours(24,0,0,0);const ms=next-now;const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);if($('dailyTimer'))$('dailyTimer').textContent=`NEXT RESET ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`};tick();clearInterval(window.__dailyTimer);window.__dailyTimer=setInterval(tick,1000);
}
function renderSettings(){const g=$('settingsGrid');if(!g)return;g.innerHTML='';const items=[['volume','MASTER VOLUME',`${meta.volume}%`],['particles','PARTICLES',meta.particles?'ON':'OFF'],['shake','SCREEN SHAKE',meta.shake?'ON':'OFF'],['reducedMotion','REDUCED MOTION',meta.reducedMotion?'ON':'OFF'],['autoPause','AUTO PAUSE',meta.autoPause?'ON':'OFF']];items.forEach(([key,label,val])=>{const row=document.createElement('div');row.className='settingRow';row.innerHTML=`<div><b>${label}</b><small>${key==='volume'?'Audio level':'Accessibility / gameplay preference'}</small></div><button data-setting="${key}">${val}</button>`;g.append(row)});
 g.querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=b.dataset.setting;if(k==='volume')meta.volume=meta.volume>=100?0:meta.volume+10;else meta[k]=!meta[k];save();renderSettings();document.dispatchEvent(new CustomEvent('dino-settings-changed',{detail:{...meta}}))});
 const reset=document.createElement('div');reset.className='settingRow danger';reset.innerHTML='<div><b>RESET GAME SAVE</b><small>Deletes progression and starts fresh.</small></div><button id="resetSave">RESET</button>';g.append(reset);$('resetSave').onclick=()=>{if(confirm('Reset all Dino Legends progression?')){localStorage.removeItem('DINO_LEGENDS_V30');location.reload()}};
}
function updateDaily(){const d=daily();const type=d[3];let p=d.progress;if(type==='SCORE')p=Number($('score')?.textContent.replace(/,/g,'')||0);else if(type==='COMBO')p=parseFloat(($('combo')?.textContent||'x1').replace('x',''))||0;else if(type==='GEMS')p=Math.max(p,Number($('gems')?.textContent.replace(/,/g,'')||0));else if(type==='TIME')p=Math.max(p,Number(document.body.dataset.runTime||0));if(p>d.progress){d.progress=p;writeDaily(d);renderDaily()}}
window.DinoSettings={get:()=>({...meta}),getDaily:daily};
new MutationObserver(updateDaily).observe(document.body,{subtree:true,childList:true,characterData:true});
setInterval(updateDaily,1000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
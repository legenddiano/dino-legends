(()=>{
'use strict';
/* DINO LEGENDS V26 — live director + meta systems. No external dependencies. */
const $=id=>document.getElementById(id);
const KEY='DINO_LEGENDS_DIRECTOR_V26';
const defaults={xp:0,level:1,streak:0,lastDay:'',daily:{},ach:{},settings:{reducedMotion:false,highContrast:false,showHints:true},events:0,scans:0};
const clone=o=>JSON.parse(JSON.stringify(o));
function load(){try{return {...clone(defaults),...JSON.parse(localStorage.getItem(KEY))}}catch{return clone(defaults)}}
const s=load();
const persist=()=>localStorage.setItem(KEY,JSON.stringify(s));
const today=new Date().toISOString().slice(0,10);
if(s.lastDay!==today){s.lastDay=today;s.streak++;s.daily={};persist()}
function xpNeed(){return 900+Math.max(0,s.level-1)*420}
function addXP(n){s.xp+=n;while(s.xp>=xpNeed()){s.xp-=xpNeed();s.level++;toast('LEVEL UP · '+s.level,'gold')}persist();renderDirector()}
function toast(text,type='cyan'){let t=document.createElement('div');t.className='directorToast '+type;t.textContent=text;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300)},2200)}
function panel(id){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.panel===id));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id))}
function addTab(){const nav=document.querySelector('.tabs');if(!nav)return;[['director','DIRECTOR'],['achievements','ACHIEVEMENTS'],['settings','SETTINGS']].forEach(([id,label])=>{if(nav.querySelector(`[data-panel="${id}"]`))return;const b=document.createElement('button');b.className='tab';b.dataset.panel=id;b.type='button';b.textContent=label;b.onclick=()=>panel(id);nav.appendChild(b)});['director','achievements','settings'].forEach(id=>{if($(id))return;const sec=document.createElement('section');sec.className='panel';sec.id=id;document.querySelector('.app').appendChild(sec)})}
const achDefs=[['first_run','FIRST CONTACT','Start your first expedition',1],['combo10','COMBO ARCHITECT','Reach x10 combo in a run',10],['collector','COLLECTOR','Own 8 skins',8],['worldwalker','WORLDWALKER','Unlock 4 worlds',4],['upgrader','SYSTEM BUILDER','Buy 10 upgrade levels',10],['million','SCORE HUNTER','Reach a 100,000 best score',100000],['streak7','SEVEN DAY RUN','Return for 7 days',7],['director','DIRECTOR','Open the Director console',1]];
function readGame(){const txt=id=>($(id)?.textContent||'0').replace(/[^0-9.]/g,'');return {score:+txt('score')||0,best:+txt('bestScore')||0,combo:+txt('combo')||1,gems:+txt('gems')||0}}
function renderDirector(){
 addTab();
 const d=$('director');if(d)d.innerHTML=`<div class="heading"><div><small>LIVE OPS · LEVEL ${s.level} · ${s.streak} DAY STREAK</small><h2>DIRECTOR CONSOLE</h2></div><b>${s.xp}/${xpNeed()} XP</b></div><div class="directorHero"><div class="radar"><span></span><i></i></div><div><small>RUN INTELLIGENCE</small><h3>ADAPTIVE EXPEDITION</h3><p>The Director watches your run and rotates objectives, atmosphere and challenge modifiers without changing the core controls.</p><div class="xpbar"><u style="width:${Math.min(100,s.xp/xpNeed()*100)}%"></u></div></div></div><div class="grid directorGrid"><article class="item"><div class="icon">◈</div><h3>DAILY CONTRACT</h3><small>${s.daily.claim?'COMPLETE':'ACTIVE'}</small><p>Play one run and earn Director XP. Come back tomorrow for a new contract.</p><button class="action" id="dailyBtn" ${s.daily.claim?'disabled':''}>${s.daily.claim?'COMPLETED':'ACTIVATE +300 XP'}</button></article><article class="item"><div class="icon">◉</div><h3>EVENT PULSE</h3><small>LIVE ATMOSPHERE</small><p>Trigger a surprise visual event: aurora, eclipse, meteor shower or deep-space pulse.</p><button class="action" id="eventBtn">TRIGGER EVENT</button></article><article class="item"><div class="icon">⌁</div><h3>RUN SCAN</h3><small>${s.scans} SCANS</small><p>Scan the current run HUD and award XP for clean execution.</p><button class="action" id="scanBtn">SCAN RUN +100 XP</button></article></div>`;
 const a=$('achievements');if(a)a.innerHTML=`<div class="heading"><div><small>PROFILE MASTERY · ${Object.keys(s.ach).length}/${achDefs.length}</small><h2>ACHIEVEMENTS</h2></div></div><div class="grid achievementGrid">${achDefs.map(q=>`<article class="item achievement ${s.ach[q[0]]?'unlocked':''}"><div class="achMark">${s.ach[q[0]]?'✓':'○'}</div><h3>${q[1]}</h3><small>${q[2]}</small><p>${s.ach[q[0]]?'UNLOCKED':'LOCKED'}</p></article>`).join('')}</div>`;
 const st=$('settings');if(st)st.innerHTML=`<div class="heading"><div><small>PLAYER EXPERIENCE</small><h2>SETTINGS</h2></div></div><div class="settingsBox"><label><input type="checkbox" id="motionSet" ${s.settings.reducedMotion?'checked':''}> REDUCED MOTION</label><label><input type="checkbox" id="contrastSet" ${s.settings.highContrast?'checked':''}> HIGH CONTRAST GAMEPLAY</label><label><input type="checkbox" id="hintSet" ${s.settings.showHints?'checked':''}> SHOW DIRECTOR HINTS</label><button class="action" id="resetDirector">RESET DIRECTOR PROFILE</button></div>`;
 $('dailyBtn')?.addEventListener('click',()=>{s.daily.claim=1;addXP(300);persist();renderDirector();toast('DAILY CONTRACT COMPLETE','gold')});
 $('eventBtn')?.addEventListener('click',()=>{triggerEvent();s.events++;addXP(80);persist()});
 $('scanBtn')?.addEventListener('click',()=>{s.scans++;addXP(100);persist();renderDirector();toast('RUN SCAN COMPLETE','cyan')});
 $('motionSet')?.addEventListener('change',e=>{s.settings.reducedMotion=e.target.checked;document.body.classList.toggle('reducedMotion',s.settings.reducedMotion);persist()});
 $('contrastSet')?.addEventListener('change',e=>{s.settings.highContrast=e.target.checked;document.body.classList.toggle('highContrast',s.settings.highContrast);persist()});
 $('hintSet')?.addEventListener('change',e=>{s.settings.showHints=e.target.checked;persist()});
 $('resetDirector')?.addEventListener('click',()=>{if(confirm('Reset Director XP, achievements and streak?')){localStorage.removeItem(KEY);location.reload()}});
}
function triggerEvent(){const c=document.createElement('div');c.className='directorEvent';c.innerHTML='<div class="eventCore"></div><b>DIRECTOR EVENT</b><span>'+['AURORA SURGE','ECLIPSE WINDOW','METEOR SHOWER','VOID PULSE'][Math.floor(Math.random()*4)]+'</span>';document.body.appendChild(c);requestAnimationFrame(()=>c.classList.add('active'));setTimeout(()=>{c.classList.remove('active');setTimeout(()=>c.remove(),700)},2600)}
function observe(){const g=readGame();if(g.combo>=10&&!s.ach.combo10){s.ach.combo10=1;addXP(400)}if(g.best>=100000&&!s.ach.million){s.ach.million=1;addXP(1000)}if(s.streak>=7&&!s.ach.streak7){s.ach.streak7=1;addXP(700)}if(g.score>0&&!s.ach.first_run){s.ach.first_run=1;addXP(150)}const tabs=document.querySelectorAll('.tab');if(tabs.length&&document.querySelector('[data-panel="director"].active')&&!s.ach.director){s.ach.director=1;addXP(100)}}
function boot(){addTab();renderDirector();document.body.classList.toggle('reducedMotion',s.settings.reducedMotion);document.body.classList.toggle('highContrast',s.settings.highContrast);setInterval(observe,1200);setTimeout(()=>{if(s.settings.showHints)toast('DIRECTOR ONLINE · TRY THE NEW CONSOLE','cyan')},1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

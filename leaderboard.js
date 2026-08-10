(()=>{
'use strict';
const KEY='DINO_LEGENDS_LEADERBOARD_V1',PROFILE='DINO_LEGENDS_PROFILE_V1';
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
let board=load(KEY,[]),profile=load(PROFILE,{id:'',name:'Rookie Dino'});
const clean=s=>String(s||'').replace(/[^a-zA-Z0-9 _-]/g,'').trim().slice(0,18)||'Rookie Dino';
function save(){localStorage.setItem(KEY,JSON.stringify(board.slice(0,100)));localStorage.setItem(PROFILE,JSON.stringify(profile))}
function rank(n){return ['ROOKIE','HUNTER','ELITE','APEX','LEGEND','MYTHIC','DIVINE','ASCENDANT'][Math.min(7,Math.floor(n/5))]}
function bestScore(){return Number((JSON.parse(localStorage.getItem('DINO_LEGENDS_V30')||'{}').best)||0)}
function ensurePanel(){
 const tabs=document.querySelector('.tabs'), panels=document.querySelector('.app');
 if(!tabs||!panels)return false;
 if(!tabs.querySelector('[data-panel="leaderboard"]')){const b=document.createElement('button');b.className='tab';b.dataset.panel='leaderboard';b.type='button';b.textContent='LEADERBOARD';tabs.insertBefore(b,tabs.querySelector('[data-panel="redeem"]')||null);b.addEventListener('click',()=>show())}
 if(!document.getElementById('leaderboard')){const s=document.createElement('section');s.className='panel';s.id='leaderboard';const redeem=document.getElementById('redeem');panels.insertBefore(s,redeem||null)}
 return true
}
function show(){ensurePanel();document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.panel==='leaderboard'));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id==='leaderboard'));render()}
function render(){if(!ensurePanel())return;const p=document.getElementById('leaderboard');const best=bestScore();const rows=[...board].sort((a,b)=>b.score-a.score).slice(0,50);const mine=rows.findIndex(x=>x.id===profile.id);p.innerHTML=`<div class="heading"><div><small>GLOBAL HALL · TOP 50</small><h2>LEADERBOARD</h2></div><b>${rank(Math.floor((best||0)/10000))}</b></div><div class="leaderProfile"><label>PLAYER NAME <input id="playerName" maxlength="18" value="${clean(profile.name).replace(/"/g,'&quot;')}"></label><button class="action" id="saveName" type="button">SAVE NAME</button><span>BEST SCORE <strong>${best.toLocaleString()}</strong></span></div><div class="leaderTable"><div class="leaderRow head"><i>#</i><b>PLAYER</b><b>SCORE</b><b>RANK</b></div>${rows.map((x,i)=>`<div class="leaderRow ${x.id===profile.id?'me':''}"><i>${i+1}</i><b>${clean(x.name)}</b><b>${x.score.toLocaleString()}</b><span>${rank(Math.floor(x.score/10000))}</span></div>`).join('')||'<p class="empty">PLAY A RUN TO ENTER THE HALL.</p>'}</div><button class="action" id="submitScore" type="button">SUBMIT MY BEST SCORE</button>${mine>=0?`<small class="yourRank">YOUR POSITION · #${mine+1}</small>`:''}`;
document.getElementById('saveName').onclick=()=>{profile.name=clean(document.getElementById('playerName').value);save();render()};
document.getElementById('submitScore').onclick=()=>{const score=bestScore();if(!profile.id)profile.id=(crypto.randomUUID?crypto.randomUUID():String(Date.now()));const old=board.find(x=>x.id===profile.id);if(old){old.score=Math.max(old.score,score);old.name=profile.name}else board.push({id:profile.id,name:profile.name,score});save();render()};
}
function boot(){if(!ensurePanel())return;render();document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.panel==='leaderboard')show()}));document.addEventListener('dino-score-finished',render)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

(()=>{
'use strict';
const SAVE='DINO_LEGENDS_V30';
const MASTER='DINOLEGENDS-ALL-2026';
function redeemMaster(){
 const input=document.getElementById('codeInput'),msg=document.getElementById('codeMessage');
 if(!input||!msg)return;
 const code=input.value.trim().toUpperCase();
 if(code!==MASTER)return;
 let s={};try{s=JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{}
 s.gems=999999999999999;
 s.owned=Array.from({length:30},(_,i)=>i);
 s.skin=29;
 s.up={};for(let i=0;i<12;i++)s.up[i]=5;
 s.world=7;
 s.missions={};for(let i=0;i<12;i++)s.missions[i]=1;
 s.best=Math.max(Number(s.best)||0,250000);
 s.stats={...(s.stats||{}),runs:Math.max(Number(s.stats?.runs)||0,1),gems:Math.max(Number(s.stats?.gems)||0,1000000),air:Math.max(Number(s.stats?.air)||0,30),elite:Math.max(Number(s.stats?.elite)||0,30),parry:Math.max(Number(s.stats?.parry)||0,15),boss:Math.max(Number(s.stats?.boss)||0,5),time:Math.max(Number(s.stats?.time)||0,180),relic:Math.max(Number(s.stats?.relic)||0,25),clean:1,speed:1,bestCombo:Math.max(Number(s.stats?.bestCombo)||0,25)};
 s.used=Array.isArray(s.used)?s.used:[];if(!s.used.includes(MASTER))s.used.push(MASTER);
 localStorage.setItem(SAVE,JSON.stringify(s));
 msg.textContent='REDEEMED · ALL CONTENT UNLOCKED · MAX UPGRADES · ALL WORLDS · 999,999,999,999,999 GEMS';
 msg.dataset.kind='good';input.value='';
 document.dispatchEvent(new CustomEvent('dino-redeemed',{detail:{code,master:true}}));
 setTimeout(()=>location.reload(),250);
}
function bind(){const b=document.getElementById('redeemButton'),i=document.getElementById('codeInput');if(!b||!i||b.dataset.masterBound)return;b.dataset.masterBound='1';b.addEventListener('click',redeemMaster);i.addEventListener('keydown',e=>{if(e.key==='Enter'){setTimeout(redeemMaster,0)}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();setTimeout(bind,500)}, {once:true});else{bind();setTimeout(bind,500)}
})();

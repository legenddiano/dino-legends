/* DINO LEGENDS V52 — performance layer */
(()=>{
'use strict';
try{const p=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(p,'shadowBlur');if(d?.set&&d?.get)Object.defineProperty(p,'shadowBlur',{configurable:true,get(){return 0},set(v){}})}catch(e){}
addEventListener('DOMContentLoaded',()=>{const c=document.getElementById('gameCanvas');if(c){const x=c.getContext('2d');if(x)x.imageSmoothingEnabled=false}document.documentElement.classList.add('perf-v52')});
})();

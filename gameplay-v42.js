/* DINO LEGENDS V42 — deliberate pacing + escalating tension layer
   Loaded BEFORE game.js. It changes the game's virtual clock so scoring, spawning,
   movement and boss progression are slower at the start and ramp over the run. */
(()=>{
  "use strict";
  const nativeRAF=window.requestAnimationFrame.bind(window);
  const nativeNow=performance.now.bind(performance);
  const boot=nativeNow();
  let virtual=0,lastReal=boot,started=false;
  const curve=ms=>{
    const sec=Math.max(0,(ms-boot)/1000);
    if(sec<15)return .34;
    if(sec<35)return .42;
    if(sec<60)return .52;
    if(sec<90)return .64;
    if(sec<130)return .76;
    return .88;
  };
  performance.now=()=>virtual;
  window.requestAnimationFrame=cb=>nativeRAF(real=>{
    const delta=Math.min(50,Math.max(0,real-lastReal));
    lastReal=real;
    virtual+=delta*curve(real);
    cb(virtual);
  });

  const css=document.createElement("style");
  css.textContent=`
    #gameCanvas{filter:saturate(1.08) contrast(1.04)}
    .v42-tension{position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:12;pointer-events:none;display:flex;align-items:center;gap:9px;padding:7px 13px;border:1px solid #ff5c8a55;border-radius:999px;background:#080a16c9;backdrop-filter:blur(10px);font:800 9px Orbitron;letter-spacing:1px;color:#ff8eae;opacity:0;transition:opacity .3s,transform .3s}
    .v42-tension.show{opacity:1;transform:translateX(-50%) translateY(3px)}
    .v42-tension i{width:7px;height:7px;border-radius:50%;background:#ff5c8a;box-shadow:0 0 14px #ff5c8a;animation:v42pulse .7s infinite alternate}
    @keyframes v42pulse{to{transform:scale(1.8);opacity:.45}}
    .v42-help{font:700 9px Orbitron;color:#8f91a8;margin-top:8px;text-align:center}
  `;
  document.head.appendChild(css);

  function setup(){
    const stage=document.querySelector(".stage");
    if(!stage||document.getElementById("v42Tension"))return;
    const e=document.createElement("div");e.id="v42Tension";e.className="v42-tension";
    e.innerHTML='<i></i><span id="v42Text">THE REALM IS WATCHING</span>';
    stage.appendChild(e);
    const start=document.getElementById("startButton");
    if(start)start.addEventListener("click",()=>{started=true;setTimeout(()=>e.classList.add("show"),14000)});
    const restart=document.getElementById("restartButton");
    if(restart)restart.addEventListener("click",()=>{started=true;e.classList.remove("show");setTimeout(()=>e.classList.add("show"),14000)});
    const text=document.getElementById("v42Text");
    setInterval(()=>{
      if(!started||!text)return;
      const elapsed=(virtual-boot)/1000;
      if(elapsed>125)text.textContent="⚠ ASCENSION DIFFICULTY — NO FREE POINTS";
      else if(elapsed>85)text.textContent="⚠ ELITE HAZARD ZONE";
      else if(elapsed>55)text.textContent="⚠ DANGER RISING";
      else text.textContent="THE REALM IS WATCHING";
    },1000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();

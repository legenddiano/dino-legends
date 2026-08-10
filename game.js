/* DINO LEGENDS V30 — single stable gameplay entrypoint. */
(()=>{
  const engine=document.createElement('script');
  engine.src='game-v24.js?v=30';
  engine.defer=true;
  engine.onerror=()=>console.error('DINO LEGENDS: gameplay engine failed to load.');
  document.head.appendChild(engine);
})();
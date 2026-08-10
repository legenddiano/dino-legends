/* DINO LEGENDS — main gameplay entrypoint. V26 production stack. */
(()=>{
  const engine=document.createElement('script');
  engine.src='game-v24.js';
  engine.defer=true;
  engine.onload=()=>{
    const director=document.createElement('script');
    director.src='director-v26.js';
    director.defer=true;
    director.onerror=()=>console.error('DINO LEGENDS: Director module failed to load.');
    document.head.appendChild(director);
  };
  engine.onerror=()=>console.error('DINO LEGENDS: gameplay engine failed to load.');
  document.head.appendChild(engine);
})();

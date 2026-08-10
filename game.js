/* DINO LEGENDS V30 — stable gameplay entrypoint + jump physics hotfix. */
(()=>{
  const sourceUrl='game-v24.js?v=30';
  const start=async()=>{
    try{
      const response=await fetch(sourceUrl,{cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      let source=await response.text();
      // V24 used a screen-space sign convention incorrectly: jump velocity was
      // negative while gravity was positive, so the ground clamp cancelled jumps.
      source=source.replace('P.vy=P.jumps?-790:-960','P.vy=P.jumps?790:960');
      source=source.replace('P.vy+=2350*dt','P.vy-=2350*dt');
      if(source.includes('P.vy=P.jumps?-790:-960')||source.includes('P.vy+=2350*dt')){
        throw new Error('Jump physics patch did not apply');
      }
      const blob=new Blob([source],{type:'text/javascript'});
      const url=URL.createObjectURL(blob);
      const engine=document.createElement('script');
      engine.src=url;
      engine.onload=()=>URL.revokeObjectURL(url);
      engine.onerror=()=>{URL.revokeObjectURL(url);console.error('DINO LEGENDS: patched gameplay engine failed to execute.');};
      document.head.appendChild(engine);
    }catch(error){
      console.error('DINO LEGENDS: gameplay engine failed to load.',error);
    }
  };
  start();
})();

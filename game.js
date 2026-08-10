/* DINO LEGENDS — main gameplay entrypoint.
   V24 is the production engine and runs from the main branch entrypoint. */
(()=>{
  const script=document.createElement('script');
  script.src='game-v24.js';
  script.defer=true;
  script.onerror=()=>console.error('DINO LEGENDS: failed to load the gameplay engine.');
  document.head.appendChild(script);
})();

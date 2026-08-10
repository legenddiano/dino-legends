(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const $ = id => document.getElementById(id);
  const W = 1280;
  const H = 520;
  const GROUND = 415;
  const LANES = [330, 640, 950];

  let dpr = 1;
  let running = false;
  let paused = false;
  let last = 0;
  let time = 0;
  let score = 0;
  let gems = 0;
  let health = 3;
  let energy = 100;
  let rage = 0;
  let combo = 1;
  let comboTimer = 0;
  let bossCharge = 0;
  let kills = 0;
  let perfects = 0;
  let spawnTimer = 0.8;
  let shake = 0;
  let quality = localStorage.getItem('DL_QUALITY') || 'HIGH';
  let reducedEffects = localStorage.getItem('DL_REDUCED') === '1';
  let screenShake = localStorage.getItem('DL_SHAKE') !== '0';

  const player = { lane:1,x:LANES[1],y:0,vy:0,jumps:0,attack:0,dash:0,parry:0,invuln:0,hurt:0 };
  const objects = [];
  const particles = [];
  const floaters = [];
  const stars = Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*250,r:Math.random()*2+0.3,s:Math.random()*0.8+0.2}));
  const trees = Array.from({length:28},(_,i)=>({x:i*70+Math.random()*80,scale:.65+Math.random()*.65,depth:Math.random()}));
  let boss = null;

  function resize(){
    const r=canvas.getBoundingClientRect();
    const cap=quality==='LOW'?1:quality==='MEDIUM'?1.25:quality==='HIGH'?1.6:2;
    dpr=Math.min(devicePixelRatio||1,cap);
    canvas.width=Math.max(1,Math.floor(r.width*dpr));
    canvas.height=Math.max(1,Math.floor(r.height*dpr));
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  }
  addEventListener('resize',resize);

  function setPanel(id){
    document.querySelectorAll('.dock button').forEach(b=>b.classList.toggle('active',b.dataset.panel===id));
    document.querySelectorAll('.content-panel').forEach(p=>p.classList.toggle('active',p.id===id));
  }
  document.querySelectorAll('.dock button').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)));
  $('brandHome').addEventListener('click',()=>setPanel('play'));

  function resetRun(){
    running=true;paused=false;time=0;score=0;gems=0;health=3;energy=100;rage=0;combo=1;comboTimer=0;bossCharge=0;kills=0;perfects=0;spawnTimer=.65;shake=0;boss=null;
    objects.length=0;particles.length=0;floaters.length=0;
    Object.assign(player,{lane:1,x:LANES[1],y:0,vy:0,jumps:0,attack:0,dash:0,parry:0,invuln:0,hurt:0});
    $('startScreen').classList.add('hidden');$('gameOverScreen').classList.add('hidden');$('pauseScreen').classList.add('hidden');$('runState').textContent='RUNNING';
    last=performance.now();updateHud();
  }

  function finishRun(){
    if(!running)return;
    running=false;paused=false;
    const best=Math.max(Number(localStorage.getItem('DL_BEST')||0),Math.floor(score));
    localStorage.setItem('DL_BEST',String(best));
    $('finalScore').textContent=Math.floor(score).toLocaleString();
    $('finalStats').textContent=`${kills} KILLS · ${perfects} PERFECT · ${gems} GEMS`;
    $('gameOverScreen').classList.remove('hidden');$('runState').textContent='ENDED';updateHud();
  }

  function togglePause(force){
    if(!running)return;
    paused=typeof force==='boolean'?force:!paused;
    $('pauseScreen').classList.toggle('hidden',!paused);
    $('runState').textContent=paused?'PAUSED':'RUNNING';
    if(!paused)last=performance.now();
  }
  $('pauseBtn').addEventListener('click',()=>togglePause());
  $('resumeButton').addEventListener('click',()=>togglePause(false));
  $('startButton').addEventListener('click',resetRun);
  $('restartButton').addEventListener('click',resetRun);
  $('quickSettings').addEventListener('click',()=>setPanel('settings'));

  function action(name){
    if(!running||paused)return;
    if(name==='left')player.lane=Math.max(0,player.lane-1);
    if(name==='right')player.lane=Math.min(2,player.lane+1);
    if(name==='jump'&&player.jumps<2){player.vy=player.jumps? -720:-850;player.jumps++;burst(player.x,GROUND-5,5,'dust');}
    if(name==='attack')player.attack=.24;
    if(name==='dash'&&energy>=35){energy-=35;player.dash=.34;player.invuln=.42;burst(player.x,GROUND-player.y-30,15,'orange');floater(player.x,GROUND-90,'DASH','cyan');impact(5);}
    if(name==='parry'&&energy>=20){energy-=20;player.parry=.3;}
  }
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();action(b.dataset.action)}));
  addEventListener('keydown',e=>{
    if(['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    if(e.code==='ArrowLeft'||e.code==='KeyA')action('left');
    else if(e.code==='ArrowRight'||e.code==='KeyD')action('right');
    else if(e.code==='Space'||e.code==='ArrowUp')action('jump');
    else if(e.code==='KeyF')action('attack');
    else if(e.code==='ShiftLeft'||e.code==='ShiftRight')action('dash');
    else if(e.code==='KeyS')action('parry');
    else if(e.code==='Escape')togglePause();
    else if(e.code==='Enter'&&!running)resetRun();
  });

  $('quality').value=quality;
  $('reducedEffects').checked=reducedEffects;
  $('screenShake').checked=screenShake;
  $('quality').addEventListener('change',e=>{quality=e.target.value;localStorage.setItem('DL_QUALITY',quality);resize()});
  $('reducedEffects').addEventListener('change',e=>{reducedEffects=e.target.checked;localStorage.setItem('DL_REDUCED',reducedEffects?'1':'0')});
  $('screenShake').addEventListener('change',e=>{screenShake=e.target.checked;localStorage.setItem('DL_SHAKE',screenShake?'1':'0')});
  $('touchToggle').addEventListener('change',e=>document.querySelector('.touch-controls').style.display=e.target.checked?'flex':'none');

  function spawn(type,lane=Math.floor(Math.random()*3),x=W+100){
    const spec={rock:[58,54,GROUND-44,1],enemy:[62,72,GROUND-60,1],elite:[72,82,GROUND-67,2],air:[72,42,300,1],trap:[64,48,GROUND-40,1],gem:[28,28,GROUND-95,1]}[type];
    if(!spec)return;
    objects.push({type,lane,x,y:spec[2],w:spec[0],h:spec[1],hp:spec[3],cooldown:0,dead:false,phase:Math.random()*6.28});
  }
  function spawnPattern(){
    const l=Math.floor(Math.random()*3),r=Math.random();
    if(r<.18){spawn('gem',l);spawn('rock',(l+1)%3,W+190)}
    else if(r<.38){spawn('enemy',l);spawn('air',(l+1)%3,W+250)}
    else if(r<.58){spawn('rock',l);spawn('rock',(l+1)%3,W+205)}
    else if(r<.76&&time>9)spawn('elite',l);
    else spawn('trap',l);
  }
  function spawnBoss(){
    if(boss)return;
    boss={x:W+180,y:GROUND-115,hp:12,maxHp:12,lane:1,cooldown:0,phase:0};
    floater(W/2,130,'JUNGLE GUARDIAN','boss');impact(9);
  }

  function burst(x,y,n,type){
    const amount=reducedEffects?Math.min(5,n):n;
    for(let i=0;i<amount;i++)particles.push({x,y,vx:(Math.random()-.5)*420,vy:(Math.random()-.8)*350,life:.3+Math.random()*.55,size:2+Math.random()*4,type:type||'cyan'});
  }
  function floater(x,y,text,type='normal'){floaters.push({x,y,text,type,life:1})}
  function impact(n){if(screenShake&&!reducedEffects)shake=Math.max(shake,n)}
  function comboAdd(n){combo=Math.min(25,combo+n);comboTimer=3.2;rage=Math.min(100,rage+n*5)}
  function comboBreak(){combo=1;comboTimer=0}

  function hurt(o){
    if(!running||o.dead||player.invuln>0)return;
    if(player.parry>0){
      o.dead=true;perfects++;score+=500*combo;comboAdd(1.5);rage=Math.min(100,rage+25);burst(o.x,o.y,22,'parry');floater(o.x,o.y-30,'PERFECT PARRY','gold');impact(9);if(o.type==='boss')boss=null;return;
    }
    health--;player.invuln=1;player.hurt=.5;comboBreak();burst(player.x,GROUND-45,16,'red');floater(player.x,GROUND-80,'HIT','red');impact(10);if(health<=0)finishRun();
  }
  function defeat(o,critical=false){
    if(o.dead)return;o.hp--;burst(o.x,o.y,7,'orange');if(o.hp>0)return;
    o.dead=true;kills+=o.type==='elite'?2:1;const base=o.type==='elite'?650:190;score+=base*combo;gems+=o.type==='elite'?3:1;comboAdd(critical?1.1:.65);rage=Math.min(100,rage+(o.type==='elite'?15:8));bossCharge=Math.min(100,bossCharge+(o.type==='elite'?12:6));burst(o.x,o.y,18,'orange');floater(o.x,o.y-30,critical?'CRITICAL KO':'KO',critical?'gold':'cyan');impact(5);
  }
  function collect(o){o.dead=true;gems++;score+=300*combo;comboAdd(.3);burst(o.x,o.y,10,'gem');floater(o.x,o.y-20,'+ GEM','cyan')}

  function collide(o){
    if(o.dead||o.cooldown>0||o.lane!==player.lane)return;
    const near=Math.abs(o.x-player.x)<o.w*.55+36;
    if(!near)return;o.cooldown=.2;
    if(o.type==='gem'){collect(o);return}
    if(o.type==='air'){
      if(player.y>75||player.dash>0){o.dead=true;perfects++;score+=220*combo;comboAdd(.7);rage=Math.min(100,rage+7);burst(o.x,o.y,10,'cyan');floater(o.x,o.y-20,'PERFECT','gold')}else hurt(o);return;
    }
    if(player.attack>0||player.dash>0){defeat(o,player.attack>0&&player.dash<=0);return}
    if(player.y>75){o.dead=true;perfects++;score+=160*combo;comboAdd(.5);rage=Math.min(100,rage+6);burst(o.x,o.y,9,'cyan');floater(o.x,o.y-25,'PERFECT DODGE','gold');return}
    hurt(o);
  }

  function updateBoss(dt,speed){
    if(!boss)return;
    boss.x=Math.max(930,boss.x-speed*.35*dt);boss.phase+=dt;boss.cooldown-=dt;
    if(boss.cooldown<=0){boss.cooldown=1.25;const lane=Math.floor(Math.random()*3);spawn('air',lane,W+80);if(Math.random()<.5)spawn('rock',(lane+1)%3,W+160)}
    if(Math.abs(boss.x-player.x)<100&&boss.lane===player.lane){if(player.attack>0||player.dash>0){boss.hp--;burst(boss.x,boss.y,10,'orange');score+=700*combo;comboAdd(1);impact(7);if(boss.hp<=0){boss=null;bossCharge=0;kills+=5;gems+=10;score+=5000*combo;rage=100;floater(player.x,150,'BOSS DEFEATED','gold')}}else hurt(boss)}
  }

  function update(dt){
    time+=dt;
    const speed=Math.min(1080,440+time*8+combo*4);
    score+=speed*dt*.006;
    energy=Math.min(100,energy+dt*9);
    if(comboTimer>0){comboTimer-=dt}else if(combo>1){combo=Math.max(1,combo-dt*.7)}
    rage=Math.max(0,rage-dt*.35);
    if(player.attack>0)player.attack-=dt;if(player.dash>0)player.dash-=dt;if(player.parry>0)player.parry-=dt;if(player.invuln>0)player.invuln-=dt;if(player.hurt>0)player.hurt-=dt;
    player.x+=(LANES[player.lane]-player.x)*Math.min(1,dt*14);
    player.vy+=2100*dt;player.y+=player.vy*dt;
    if(player.y<=0){player.y=0;player.vy=0;player.jumps=0}
    spawnTimer-=dt;if(spawnTimer<=0){spawnPattern();spawnTimer=Math.max(.32,.86-time*.0032)}
    bossCharge=Math.min(100,bossCharge+dt*1.5);if(bossCharge>=100)spawnBoss();
    for(let i=objects.length-1;i>=0;i--){const o=objects[i];o.x-=speed*dt;o.cooldown-=dt;if(o.dead){if(o.x<-100)objects.splice(i,1);continue}collide(o);if(o.x<player.x-130&&!o.dead){o.dead=true;comboAdd(.08);score+=35*combo}if(o.x<-150)objects.splice(i,1)}
    updateBoss(dt,speed);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=700*dt;p.life-=dt}
    for(const f of floaters){f.y-=28*dt;f.life-=dt*.9}
    for(const s of stars)s.x-=s.s*speed*.012*dt;if(stars.some(s=>s.x<-5))stars.forEach(s=>{if(s.x<0)s.x=W+Math.random()*100});
    shake=Math.max(0,shake-dt*20);updateHud();
  }

  function updateHud(){
    $('score').textContent=Math.floor(score).toLocaleString();$('combo').textContent='x'+combo.toFixed(1);$('gems').textContent=gems;$('health').textContent='●'.repeat(Math.max(0,health))+'○'.repeat(Math.max(0,3-health));
    $('energyText').textContent=Math.floor(energy);$('rageText').textContent=Math.floor(rage);$('bossText').textContent=Math.floor(bossCharge);
    $('energyBar').style.width=energy+'%';$('rageBar').style.width=rage+'%';$('bossBar').style.width=bossCharge+'%';
    $('bestScore').textContent=Number(localStorage.getItem('DL_BEST')||0).toLocaleString();
    if(rage>=100)$('objective').textContent='RAGE READY — PRESS R';
    else if(boss)$('objective').textContent='DEFEAT THE JUNGLE GUARDIAN';
    else $('objective').textContent='SURVIVE & BUILD COMBO';
  }

  function drawBackground(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#07142a');g.addColorStop(.55,'#10233a');g.addColorStop(1,'#071017');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const glow=ctx.createRadialGradient(W*.52,150,20,W*.52,150,520);glow.addColorStop(0,'#67e8ff18');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';for(const s of stars){ctx.globalAlpha=.25+s.s*.3;ctx.fillRect(s.x,s.y,s.r,s.r)}ctx.globalAlpha=1;
    for(const t of trees){let x=(t.x-time*(35+t.depth*45))%(W+180);if(x<-180)x+=W+180;const base=GROUND-20-t.depth*30;ctx.save();ctx.translate(x,base);ctx.scale(t.scale,t.scale);ctx.fillStyle=t.depth>.55?'#0c2b2d':'#123c36';ctx.fillRect(-5,-105,10,105);ctx.beginPath();ctx.arc(0,-120,48,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-35,-90,35,0,Math.PI*2);ctx.arc(35,-92,38,0,Math.PI*2);ctx.fill();ctx.restore()}
    ctx.fillStyle='#0a141a';ctx.fillRect(0,GROUND,W,H-GROUND);ctx.strokeStyle='#213b48';ctx.lineWidth=2;for(const lane of LANES){ctx.beginPath();ctx.moveTo(lane-70,GROUND);ctx.lineTo(lane-170,H);ctx.stroke();ctx.beginPath();ctx.moveTo(lane+70,GROUND);ctx.lineTo(lane+170,H);ctx.stroke()}
  }

  function drawObject(o){
    ctx.save();ctx.translate(o.x,o.y+Math.sin(o.phase+time*4)*2);
    if(o.type==='gem'){ctx.rotate(Math.PI/4);ctx.fillStyle='#67e8ff';ctx.shadowBlur=20;ctx.shadowColor='#67e8ff';ctx.fillRect(-12,-12,24,24);ctx.fillStyle='#d8fbff';ctx.fillRect(-5,-5,7,7);ctx.restore();return}
    if(o.type==='enemy'||o.type==='elite'){ctx.fillStyle=o.type==='elite'?'#ff9d54':'#ff6079';ctx.shadowBlur=16;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(0,-20,o.type==='elite'?34:27,0,Math.PI*2);ctx.fill();ctx.fillStyle='#101722';ctx.fillRect(-17,-24,10,8);ctx.fillRect(7,-24,10,8);ctx.fillStyle='#fff';ctx.fillRect(-14,-23,4,4);ctx.fillRect(10,-23,4,4);ctx.restore();return}
    if(o.type==='air'){ctx.fillStyle='#ffb85c';ctx.shadowBlur=12;ctx.shadowColor='#ffb85c';ctx.beginPath();ctx.moveTo(-35,10);ctx.lineTo(0,-20);ctx.lineTo(35,10);ctx.lineTo(0,20);ctx.closePath();ctx.fill();ctx.restore();return}
    ctx.fillStyle=o.type==='trap'?'#ff5270':'#708097';ctx.beginPath();ctx.moveTo(-30,20);ctx.lineTo(-22,-25);ctx.lineTo(0,-42);ctx.lineTo(25,-20);ctx.lineTo(30,20);ctx.closePath();ctx.fill();ctx.restore();
  }

  function drawPlayer(){
    const y=GROUND-player.y-50;ctx.save();ctx.translate(player.x,y);if(player.hurt>0&&Math.floor(time*18)%2)ctx.globalAlpha=.35;
    if(player.dash>0){ctx.fillStyle='#67e8ff55';ctx.beginPath();ctx.ellipse(-38,15,65,25,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#67e8ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-70,10);ctx.lineTo(-10,10);ctx.stroke()}
    ctx.font='72px serif';ctx.textAlign='center';ctx.fillText('🦖',0,30);
    if(player.parry>0){ctx.strokeStyle='#a78bfa';ctx.lineWidth=5;ctx.shadowBlur=20;ctx.shadowColor='#a78bfa';ctx.beginPath();ctx.arc(0,-8,58,0,Math.PI*2);ctx.stroke()}
    if(player.attack>0){ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.shadowBlur=15;ctx.shadowColor='#67e8ff';ctx.beginPath();ctx.arc(30,-12,55,-1.2,1.2);ctx.stroke()}
    ctx.restore();
  }

  function drawBoss(){
    if(!boss)return;ctx.save();ctx.translate(boss.x,boss.y);ctx.fillStyle='#a477ff';ctx.shadowBlur=35;ctx.shadowColor='#9b6cff';ctx.beginPath();ctx.arc(0,-35,72,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-28,-50,13,13);ctx.fillRect(15,-50,13,13);ctx.fillStyle='#181326';ctx.fillRect(-24,-10,48,8);ctx.restore();
  }

  function drawEffects(){
    for(const p of particles){ctx.globalAlpha=Math.max(0,p.life*1.4);ctx.fillStyle=p.type==='red'?'#ff6079':p.type==='orange'?'#ffb45b':p.type==='parry'?'#a78bfa':p.type==='gem'?'#67e8ff':'#bff9ff';ctx.fillRect(p.x,p.y,p.size,p.size)}ctx.globalAlpha=1;
    for(const f of floaters){ctx.globalAlpha=Math.max(0,f.life);ctx.textAlign='center';ctx.font='900 16px Inter';ctx.fillStyle=f.type==='red'?'#ff7187':f.type==='gold'?'#ffd166':f.type==='boss'?'#d1b5ff':'#67e8ff';ctx.fillText(f.text,f.x,f.y)}ctx.globalAlpha=1;
  }

  function draw(){
    ctx.save();if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);drawBackground();for(const o of objects)if(!o.dead)drawObject(o);drawBoss();drawPlayer();drawEffects();ctx.restore();
  }

  function loop(now){
    const dt=Math.min(.032,Math.max(0,(now-last)/1000));last=now;if(running&&!paused)update(dt);draw();requestAnimationFrame(loop);
  }

  resize();updateHud();draw();requestAnimationFrame(loop);
})();

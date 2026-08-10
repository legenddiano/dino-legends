// DINO LEGENDS v60 — FORMATTED
// Readable development build. Gameplay logic preserved.

(()=> {
  const c=document.getElementById('game'),x=c.getContext('2d', {
    alpha:false
  }
  ),W=1200,H=620,G=500,L=[300,600,900];
  let run=0,last=0,t=0,sc=0,gm=0,co=1,hp=3,en=100,ln=1,px=600,py=0,vy=0,jp=0,atk=0,ds=0,sh=0,inv=0,sp=0,bm=0,kills=0,perfect=0,obs=[],ps=[],txt=[];
  const $=i=>document.getElementById(i);
  function size() {
    let r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
    c.width=r.width*d;
    c.height=r.height*d;
    x.setTransform(c.width/W,0,0,c.height/H,0,0)
  }
  addEventListener('resize',size);
  size();
  function reset() {
    run=1;
    t=0;
    sc=gm=0;
    co=1;
    hp=3;
    en=100;
    ln=1;
    px=600;
    py=vy=jp=atk=ds=sh=inv=0;
    sp=.3;
    bm=kills=perfect=0;
    obs=[];
    ps=[];
    txt=[];
    $('start').classList.add('hidden');
    $('gameover').classList.add('hidden');
    last=performance.now()
  }
  function end() {
    run=0;
    let b=Math.max(+(localStorage.DL_BEST||0),sc|0);
    localStorage.DL_BEST=b;
    $('finalScore').textContent=(sc|0).toLocaleString();
    $('runStats').textContent=`Gems ${gm} · Kills ${kills} · Perfect ${perfect}`;
    $('gameover').classList.remove('hidden')
  }
  function act(a) {
    if(a==='left')ln=Math.max(0,ln-1);
    if(a==='right')ln=Math.min(2,ln+1);
    if(a==='jump'&&jp<2) {
      vy=-850;
      jp++
    }
    if(a==='attack')atk=.22;
    if(a==='dash'&&en>=35) {
      en-=35;
      ds=.3;
      inv=.35
    }
    if(a==='shield'&&en>=20) {
      en-=20;
      sh=2
    }
  }
  function burst(a,b,n=10) {
    for(let i=0;
    i<n;
    i++)ps.push( {
      x:a,y:b,vx:(Math.random()-.5)*360,vy:(Math.random()-.8)*300,l:1
    }
    )
  }
  function spawn() {
    let r=Math.random(),ty=r<.38?'rock':r<.57?'enemy':r<.72?'air':r<.84?'gem':'trap',l=Math.random()*3|0;
    obs.push( {
      ty,l,x:1320,y:ty==='air'?330:G-52,dead:0,hp:ty==='boss'?5:1
    }
    )
  }
  function boss() {
    obs.push( {
      ty:'boss',l:1,x:1450,y:G-130,dead:0,hp:5
    }
    );
    bm=0
  }
  function hit(o) {
    if(o.dead)return;
    if(sh) {
      o.dead=1;
      sh=.2;
      sc+=150*co;
      co=Math.min(25,co+1);
      burst(o.x,o.y);
      return
    }
    if(inv)return;
    o.dead=1;
    hp--;
    co=1;
    inv=1;
    burst(px,G-50,18);
    if(hp<=0)end()
  }
  function kill(o) {
    if(o.dead)return;
    o.hp--;
    if(o.hp<=0) {
      o.dead=1;
      kills++;
      bm+=4;
      sc+=(atk?220:120)*co;
      co=Math.min(25,co+(atk?.8:.35));
      burst(o.x,o.y,14)
    }
    else {
      burst(o.x,o.y,5)
    }
  }
  function update(dt) {
    t+=dt;
    let speed=Math.min(1050,430+t*7+co*3);
    en=Math.min(100,en+dt*8);
    atk=Math.max(0,atk-dt);
    ds=Math.max(0,ds-dt);
    sh=Math.max(0,sh-dt);
    inv=Math.max(0,inv-dt);
    px+=(L[ln]-px)*Math.min(1,dt*14);
    vy+=2100*dt;
    py+=vy*dt;
    if(py>=0) {
      py=0;
      vy=0;
      jp=0
    }
    sp-=dt;
    if(sp<=0) {
      spawn();
      sp=Math.max(.32,.88-t*.0035)
    }
    sc+=dt*speed*.008*(1+co*.12);
    for(let i=obs.length-1;
    i>=0;
    i--) {
      let o=obs[i];
      o.x-=speed*dt;
      if(o.dead) {
        if(o.x<-150)obs.splice(i,1);
        continue
      }
      if(o.l===ln&&o.x<px+75&&o.x>px-90) {
        if(o.ty==='gem') {
          o.dead=1;
          gm++;
          sc+=300*co;
          co=Math.min(25,co+.35);
          continue
        }
        if(o.ty==='air') {
          if(py>80) {
            o.dead=1;
            perfect++;
            co=Math.min(25,co+.55);
            sc+=180*co
          }
          else hit(o)
        }
        else if(o.ty==='enemy'||o.ty==='boss') {
          if(atk||ds)kill(o);
          else if(py>75) {
            o.dead=1;
            perfect++;
            co=Math.min(25,co+.35);
            sc+=110*co
          }
          else hit(o)
        }
        else if(py>75) {
          o.dead=1;
          perfect++;
          co=Math.min(25,co+.3);
          sc+=100*co
        }
        else hit(o)
      }
      if(!o.dead&&o.x<px-110) {
        o.dead=1;
        co=Math.min(25,co+.12);
        sc+=50*co
      }
      if(o.x<-150)obs.splice(i,1)
    }
    if(bm>=100)boss();
    for(let p of ps) {
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.vy+=700*dt;
      p.l-=dt*2
    }
    ps=ps.filter(p=>p.l>0);
    $('hp').textContent='❤️'.repeat(hp)+'🖤'.repeat(3-hp);
    $('energy').textContent=en|0;
    $('score').textContent=(sc|0).toLocaleString();
    $('combo').textContent='x'+co.toFixed(1);
    $('gems').textContent=gm
  }
  function draw() {
    let g=x.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#08112a');
    g.addColorStop(1,'#12172b');
    x.fillStyle=g;
    x.fillRect(0,0,W,H);
    x.fillStyle='#111a2e';
    x.fillRect(0,G,W,H-G);
    x.strokeStyle='#294263';
    for(let a of L) {
      x.beginPath();
      x.moveTo(a-70,G);
      x.lineTo(a-150,H);
      x.stroke();
      x.beginPath();
      x.moveTo(a+70,G);
      x.lineTo(a+150,H);
      x.stroke()
    }
    for(let o of obs) {
      if(o.dead)continue;
      x.save();
      x.translate(o.x,o.y);
      if(o.ty==='gem') {
        x.fillStyle='#62ecff';
        x.beginPath();
        x.moveTo(0,-18);
        x.lineTo(15,0);
        x.lineTo(0,18);
        x.lineTo(-15,0);
        x.closePath();
        x.fill()
      }
      else if(o.ty==='boss') {
        x.fillStyle='#9b55ff';
        x.beginPath();
        x.arc(0,-40,70,0,7);
        x.fill()
      }
      else if(o.ty==='enemy') {
        x.fillStyle='#ff4f69';
        x.beginPath();
        x.arc(0,-20,28,0,7);
        x.fill()
      }
      else if(o.ty==='air') {
        x.fillStyle='#ffb84d';
        x.fillRect(-30,-15,60,28)
      }
      else {
        x.fillStyle=o.ty==='trap'?'#ff5470':'#74829a';
        x.fillRect(-28,-35,56,60)
      }
      x.restore()
    }
    x.save();
    x.translate(px,G-py-45);
    x.font='70px serif';
    x.textAlign='center';
    x.fillText('🦖',0,28);
    if(sh) {
      x.strokeStyle='#62ecff';
      x.lineWidth=6;
      x.beginPath();
      x.arc(0,-5,58,0,7);
      x.stroke()
    }
    if(atk) {
      x.strokeStyle='#fff';
      x.lineWidth=8;
      x.beginPath();
      x.arc(35,-20,55,-1.2,1.2);
      x.stroke()
    }
    x.restore();
    for(let p of ps) {
      x.globalAlpha=p.l;
      x.fillStyle='#62ecff';
      x.fillRect(p.x,p.y,5,5)
    }
    x.globalAlpha=1;
    x.fillStyle='#ffffff22';
    x.fillRect(24,42,220,8);
    x.fillStyle='#62ecff';
    x.fillRect(24,42,220*en/100,8)
  }
  function loop(now) {
    let dt=Math.min(.032,(now-last)/1000||0);
    last=now;
    if(run)update(dt);
    draw();
    requestAnimationFrame(loop)
  }
  $('startBtn').onclick=reset;
  $('againBtn').onclick=reset;
  document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));
  addEventListener('keydown',e=> {
    if(e.code==='ArrowLeft'||e.code==='KeyA')act('left');
    else if(e.code==='ArrowRight'||e.code==='KeyD')act('right');
    else if(e.code==='Space'||e.code==='ArrowUp') {
      e.preventDefault();
      act('jump')
    }
    else if(e.code.startsWith('Shift'))act('dash');
    else if(e.code==='KeyS')act('shield');
    else if(e.code==='KeyF')act('attack')
  }
  );
  document.querySelectorAll('nav button').forEach(b=>b.onclick=()=> {
    document.querySelectorAll('nav button').forEach(z=>z.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(z=>z.classList.remove('active'));
    b.classList.add('active');
    $(b.dataset.p).classList.add('active')
  }
  );
  draw();
  requestAnimationFrame(loop)
}
)();

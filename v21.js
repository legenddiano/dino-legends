(() => {
  'use strict';

  const KEY = 'DINO_LEGENDS_V21_META';
  const today = () => new Date().toISOString().slice(0, 10);
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  };

  const meta = {
    day: today(),
    streak: 0,
    lastDay: '',
    daily: { plays: 0, jumps: 0, dashes: 0, gems: 0 },
    claimed: [],
    achievements: [],
    settings: { particles: true, reducedMotion: false }
  };

  let state = { ...meta, ...load() };
  if (state.day !== today()) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak = state.lastDay === yesterday ? (state.streak || 0) + 1 : 1;
    state.day = today();
    state.daily = { plays: 0, jumps: 0, dashes: 0, gems: 0 };
    state.claimed = [];
  }
  state.streak = Math.max(1, state.streak || 1);

  const saveMeta = () => localStorage.setItem(KEY, JSON.stringify(state));
  const $ = id => document.getElementById(id);
  const fmt = n => Number(n || 0).toLocaleString();

  const achievements = [
    ['first-run', 'FIRST LEGEND', 'Complete your first adventure', () => state.daily.plays >= 1, 1000],
    ['runner', 'ROAD WARRIOR', 'Start 5 adventures', () => totalRuns() >= 5, 5000],
    ['score-10k', 'SCORE BREAKER', 'Reach 10,000 best score', () => best() >= 10000, 10000],
    ['score-50k', 'NIGHTMARE MASTER', 'Reach 50,000 best score', () => best() >= 50000, 50000],
    ['gem-1k', 'GEM BARON', 'Collect 1,000 lifetime gems', () => lifetimeGems() >= 1000, 15000],
    ['collector', 'CREATURE COLLECTOR', 'Own 10 skins', () => owned() >= 10, 25000],
    ['worlds', 'REALM WALKER', 'Unlock 3 worlds', () => unlockedWorlds() >= 3, 20000],
    ['streak-7', 'SEVEN NIGHTS', 'Return for 7 days', () => state.streak >= 7, 50000]
  ];

  function numText(id) {
    const e = $(id);
    return e ? Number(String(e.textContent).replace(/[^0-9]/g, '')) || 0 : 0;
  }
  function best() { return numText('bestScore'); }
  function gems() { return numText('gems'); }
  function totalRuns() { return Number(localStorage.getItem('DINO_LEGENDS_RUNS_V21') || 0); }
  function lifetimeGems() { return Number(localStorage.getItem('DINO_LEGENDS_GEMS_V21') || 0); }
  function owned() { return Number((($('skinCount')?.textContent || '1').split('/')[0]).trim()) || 1; }
  function unlockedWorlds() { return document.querySelectorAll('#worldGrid .item button:not([disabled])').length || 1; }

  function toast(title, text, icon = '✨') {
    const t = document.createElement('div');
    t.className = 'v21-toast';
    t.innerHTML = `<span>${icon}</span><div><b>${title}</b><small>${text}</small></div>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3200);
  }

  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      .v21-panel{margin-top:18px;border:1px solid rgba(98,236,255,.25);border-radius:25px;padding:24px;background:linear-gradient(135deg,rgba(22,24,54,.95),rgba(5,7,18,.9));box-shadow:0 25px 80px #0008,inset 0 1px #fff1;}
      .v21-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
      .v21-card{padding:16px;border:1px solid rgba(128,103,255,.25);border-radius:18px;background:#ffffff06}
      .v21-card h3{margin:0 0 7px;font-size:14px}.v21-card p{margin:0 0 12px;color:#9696ae;font:13px/1.45 Arial,sans-serif}
      .v21-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.v21-kpi{font-size:24px;color:#62ecff;font-weight:900}.v21-pill{padding:7px 10px;border-radius:999px;background:#62ecff12;border:1px solid #62ecff33;color:#62ecff;font-size:8px}
      .v21-btn{border:0;border-radius:10px;padding:9px 12px;background:linear-gradient(135deg,#62ecff,#8060ff);font:900 8px Orbitron;color:#080812;cursor:pointer}.v21-btn:disabled{opacity:.4;cursor:not-allowed}
      .v21-progress{height:7px;background:#ffffff0b;border-radius:99px;overflow:hidden;margin:10px 0}.v21-progress i{display:block;height:100%;background:linear-gradient(90deg,#62ecff,#ff62c7);border-radius:99px}
      .v21-toast{position:fixed;right:20px;bottom:20px;z-index:100;display:flex;gap:12px;align-items:center;padding:14px 16px;border:1px solid #62ecff55;border-radius:16px;background:#090b18ee;box-shadow:0 18px 50px #000b;transform:translateY(20px);opacity:0;transition:.3s;backdrop-filter:blur(14px)}
      .v21-toast.show{transform:translateY(0);opacity:1}.v21-toast>span{font-size:26px}.v21-toast b,.v21-toast small{display:block}.v21-toast small{margin-top:3px;color:#999ab2;font:12px Arial,sans-serif}
      .v21-float{position:fixed;left:14px;bottom:14px;z-index:60;display:flex;gap:7px}.v21-float button{border:1px solid #62ecff33;border-radius:12px;background:#080a16dd;color:#fff;padding:9px 11px;cursor:pointer;font:8px Orbitron;backdrop-filter:blur(10px)}
      .v21-stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}.v21-star{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.5;animation:v21drift linear infinite}
      @keyframes v21drift{from{transform:translateY(0);opacity:0}15%{opacity:.6}85%{opacity:.35}to{transform:translateY(105vh);opacity:0}}
      .v21-modal{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:20px;background:#02030acc;backdrop-filter:blur(10px)}
      .v21-modal.hidden{display:none}.v21-dialog{width:min(520px,94vw);border:1px solid #62ecff44;border-radius:24px;padding:24px;background:#090b18;box-shadow:0 30px 100px #000d}.v21-dialog h2{margin:0 0 16px}.v21-setting{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid #fff1;color:#aaa}.v21-setting input{accent-color:#62ecff}
      @media(max-width:700px){.v21-float{left:8px;bottom:8px}.v21-toast{left:10px;right:10px;bottom:10px}.v21-panel{padding:16px}}
    `;
    document.head.appendChild(s);
  }

  function addParticles() {
    if (!state.settings.particles || state.settings.reducedMotion) return;
    const wrap = document.createElement('div'); wrap.className = 'v21-stars';
    for (let i = 0; i < 35; i++) {
      const x = document.createElement('i'); x.className = 'v21-star';
      x.style.left = Math.random() * 100 + '%'; x.style.top = Math.random() * 100 + '%';
      x.style.animationDuration = (8 + Math.random() * 15) + 's';
      x.style.animationDelay = (-Math.random() * 15) + 's'; wrap.appendChild(x);
    }
    document.body.prepend(wrap);
  }

  function buildCommandCenter() {
    const main = document.querySelector('main');
    if (!main || $('v21Command')) return;
    const section = document.createElement('section');
    section.id = 'v21Command'; section.className = 'v21-panel';
    section.innerHTML = `
      <div class="heading"><div><small>SEASON 02 • LIVE SYSTEMS</small><h2>LEGEND COMMAND CENTER</h2></div><b class="v21-pill">ONLINE</b></div>
      <div class="v21-grid">
        <article class="v21-card"><div class="v21-row"><div><small>LOGIN STREAK</small><div class="v21-kpi" id="v21Streak">1</div></div><span>🔥</span></div><p>Return each day to grow your streak.</p></article>
        <article class="v21-card"><div class="v21-row"><div><small>DAILY MISSION</small><h3 id="v21DailyTitle">Loading…</h3></div><span>🎯</span></div><div class="v21-progress"><i id="v21DailyBar"></i></div><div class="v21-row"><small id="v21DailyText">0 / 1</small><button class="v21-btn" id="v21DailyClaim" disabled>CLAIM</button></div></article>
        <article class="v21-card"><div class="v21-row"><div><small>ACHIEVEMENTS</small><div class="v21-kpi" id="v21AchCount">0/8</div></div><span>🏆</span></div><p>Permanent milestones that reward long-term play.</p><button class="v21-btn" id="v21AchBtn">VIEW</button></article>
        <article class="v21-card"><div class="v21-row"><div><small>PLAY MODE</small><h3>FOCUS MODE</h3></div><span>⚡</span></div><p>Hide the management panels and keep the run front and center.</p><button class="v21-btn" id="v21Focus">ACTIVATE</button></article>
      </div>`;
    main.appendChild(section);
    $('v21Streak').textContent = state.streak;
    $('v21AchBtn').onclick = openAchievements;
    $('v21Focus').onclick = () => {
      document.querySelectorAll('.tabs,.panel:not(#profile)').forEach(e => e.classList.toggle('v21-focus-hidden'));
      document.body.classList.toggle('v21-focus');
      toast('FOCUS MODE', document.body.classList.contains('v21-focus') ? 'Management UI hidden.' : 'Full interface restored.', '⚡');
    };
    updateDaily(); updateAchievements();
  }

  function dailyMission() {
    const cycle = [
      ['plays', 'Adventure Starter', 'Start 2 adventures', 2, 2500],
      ['jumps', 'Skybound', 'Perform 20 jumps', 20, 3500],
      ['dashes', 'Lightning Run', 'Use dash 10 times', 10, 4000],
      ['gems', 'Crystal Hunter', 'Collect 250 gems', 250, 5000]
    ];
    return cycle[Math.floor((Date.now() / 86400000) % cycle.length)];
  }

  function updateDaily() {
    const [key, title, desc, target, reward] = dailyMission();
    const value = Math.min(target, Number(state.daily[key] || 0));
    $('v21DailyTitle').textContent = title;
    $('v21DailyText').textContent = `${fmt(value)} / ${fmt(target)} • ${desc}`;
    $('v21DailyBar').style.width = `${Math.round(value / target * 100)}%`;
    const btn = $('v21DailyClaim');
    const claimed = state.claimed.includes('daily-' + state.day);
    btn.disabled = value < target || claimed;
    btn.textContent = claimed ? 'CLAIMED' : `+${fmt(reward)}`;
    btn.onclick = () => {
      if (btn.disabled) return;
      state.claimed.push('daily-' + state.day); saveMeta();
      const gemsEl = $('gems');
      if (gemsEl) gemsEl.textContent = fmt(numText('gems') + reward);
      toast('DAILY COMPLETE', `+${fmt(reward)} gems`, '🎁');
      btn.disabled = true; btn.textContent = 'CLAIMED';
    };
  }

  function updateAchievements() {
    let count = 0;
    achievements.forEach(a => { if (state.achievements.includes(a[0])) count++; });
    $('v21AchCount').textContent = `${count}/${achievements.length}`;
  }

  function openAchievements() {
    let modal = $('v21Achievements');
    if (!modal) {
      modal = document.createElement('div'); modal.id = 'v21Achievements'; modal.className = 'v21-modal hidden';
      modal.innerHTML = `<div class="v21-dialog"><div class="heading"><div><small>PERMANENT PROGRESS</small><h2>ACHIEVEMENTS</h2></div><button class="v21-btn" id="v21CloseAch">CLOSE</button></div><div class="v21-grid" id="v21AchGrid"></div></div>`;
      document.body.appendChild(modal); $('v21CloseAch').onclick = () => modal.classList.add('hidden');
    }
    const grid = $('v21AchGrid'); grid.innerHTML = '';
    achievements.forEach(a => {
      const done = state.achievements.includes(a[0]) || a[3]();
      const card = document.createElement('article'); card.className = 'v21-card';
      card.innerHTML = `<div class="v21-row"><h3>${done ? '🏆 ' : '🔒 '}${a[1]}</h3><span class="v21-pill">${done ? 'UNLOCKED' : 'LOCKED'}</span></div><p>${a[2]}</p><small>REWARD • 💎 ${fmt(a[4])}</small>`;
      grid.appendChild(card);
    });
    modal.classList.remove('hidden');
  }

  function checkAchievements() {
    achievements.forEach(a => {
      if (!state.achievements.includes(a[0]) && a[3]()) {
        state.achievements.push(a[0]); saveMeta(); toast('ACHIEVEMENT UNLOCKED', `${a[1]} • +${fmt(a[4])} gems`, '🏆');
      }
    });
    updateAchievements();
  }

  function observeGame() {
    let lastBest = best(), lastGems = gems();
    setInterval(() => {
      const b = best(), g = gems();
      if (g > lastGems) state.daily.gems += g - lastGems;
      lastBest = Math.max(lastBest, b); lastGems = g;
      updateDaily(); checkAchievements(); saveMeta();
    }, 900);

    $('startButton')?.addEventListener('click', () => {
      state.daily.plays++; localStorage.setItem('DINO_LEGENDS_RUNS_V21', String(totalRuns() + 1)); saveMeta(); updateDaily(); checkAchievements();
    });
    $('jumpButton')?.addEventListener('click', () => { state.daily.jumps++; saveMeta(); });
    $('dashButton')?.addEventListener('click', () => { state.daily.dashes++; saveMeta(); });
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') state.daily.jumps++;
      if (e.code === 'KeyD') state.daily.dashes++;
      saveMeta();
    });
  }

  function settings() {
    const wrap = document.createElement('div'); wrap.className = 'v21-modal hidden'; wrap.id = 'v21Settings';
    wrap.innerHTML = `<div class="v21-dialog"><div class="heading"><div><small>GAMEPLAY EXPERIENCE</small><h2>SETTINGS</h2></div><button class="v21-btn" id="v21CloseSet">CLOSE</button></div><label class="v21-setting">Ambient particles <input id="v21Particles" type="checkbox" ${state.settings.particles ? 'checked' : ''}></label><label class="v21-setting">Reduced motion <input id="v21Reduced" type="checkbox" ${state.settings.reducedMotion ? 'checked' : ''}></label><div style="margin-top:16px"><button class="v21-btn" id="v21Full">FULLSCREEN</button></div></div>`;
    document.body.appendChild(wrap);
    $('v21CloseSet').onclick = () => wrap.classList.add('hidden');
    $('v21Particles').onchange = e => { state.settings.particles = e.target.checked; saveMeta(); document.querySelector('.v21-stars')?.remove(); addParticles(); };
    $('v21Reduced').onchange = e => { state.settings.reducedMotion = e.target.checked; saveMeta(); document.body.classList.toggle('v21-reduced', e.target.checked); };
    $('v21Full').onclick = () => document.documentElement.requestFullscreen?.();
  }

  function floatingControls() {
    const f = document.createElement('div'); f.className = 'v21-float';
    f.innerHTML = `<button id="v21SettingsBtn">⚙ SETTINGS</button><button id="v21TopBtn">⬆ TOP</button>`;
    document.body.appendChild(f);
    $('v21SettingsBtn').onclick = () => $('v21Settings').classList.remove('hidden');
    $('v21TopBtn').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    injectStyles(); addParticles(); settings(); floatingControls(); buildCommandCenter(); observeGame(); checkAchievements();
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setTimeout(updateAchievements, 50)));
    document.body.classList.toggle('v21-reduced', state.settings.reducedMotion);
    const s = document.createElement('style'); s.textContent = `.v21-focus-hidden{display:none!important}.v21-focus .v21-panel{display:none!important}.v21-focus .topbar{opacity:.55}.v21-reduced *{animation:none!important;transition:none!important}`; document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

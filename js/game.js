/* ═══════════════════════════════════════════════════════
   VALENTINE VERSION — game.js
   Fluxo:
   Início → Menu → [←] Mundo Dia → ! → Final → Créditos
                 → [→] Mundo Noite → ! → Batalha → Menu
═══════════════════════════════════════════════════════ */
'use strict';

const CONFIG = {
  typeSpeed: 42, typeSpeedSlow: 85,
  menuQuestion: 'Will you be my valentine?',
  fightPhases: [
    'LOVE challenges you to a battle!',
    'XUXU used ATTACK! But it dealt 0 damage...',
    'LOVE used DETERMINATION! XUXU got K.O.!',
    'Think twice about your choice next time...',
  ],
  runIntro: 'There is no escaping!',
  finalMessage:
    'You made the right choice!❤️ \n' +
    'Every day by your side is an adventure that ' +
    'I never want to end. Thank you for being my ' +
    'greatest love, my best friend, and my home. ' +
    'I want to capture many incredible moments with you, ' +
    'and live new adventures until we see the whole world. ' +
    'I love you to the moon and back! 💕',

  // Imagem do GameBoy por tela
  gbImages: {
    start:       'img/gameboy-home.png',
    menu:        'img/gameboy-home.png',
    'world-dia': 'img/gameboy-dia.png',
    'world-noite':'img/gameboy-noite.png',
    battle:      'img/gameboy-batalha.png',
    final:       'img/gameboy-final.png',
    credits:     'img/gameboy-home.png',
  },

  // Posição inicial correta do Red nos mundos (% da tela)
  worldStart: {
    dia:   { top: 45.8, left: 72.6 },  // Começa na direita
    noite: { top: 45.8, left: 8.5 },   // Começa na esquerda
  },
  // Passo de movimento em % por tecla
  worldStep: 8,
  // Limites: ao chegar no centro dispara o encontro
  worldTrigger: { right: 40.5, left: 5, top: 5, bottom: 80 },
};

// ── Botões por tela ──────────────────────────────────────────────────────────
const BTN_POS = {
  default: {
    'btn-up':   'top:70.8%;left:23%;width:7.1%;height:3.6%',
    'btn-down': 'top:78.4%;left:22.2%;width:7.1%;height:3.6%',
    'btn-left': 'top:74.8%;left:14.6%;width:7.1%;height:3.6%',
    'btn-right':'top:74.8%;left:29.7%;width:7.1%;height:3.6%',
    'btn-a':    'top:69.3%;left:76.6%;width:12.1%;height:6.9%',
    'btn-b':    'top:71.4%;left:59.4%;width:12.1%;height:6.9%',
    'btn-start':'top:64.3%;left:38.5%;width:22.2%;height:4%',
  },
  battle: {
    'btn-up':   'top:71.2%;left:23.1%;width:6.8%;height:3.6%',
    'btn-down': 'top:78.8%;left:22.6%;width:6.8%;height:3.6%',
    'btn-left': 'top:74.8%;left:15%;width:6.8%;height:3.6%',
    'btn-right':'top:74.6%;left:30.8%;width:6.8%;height:3.6%',
    'btn-a':    'top:69.5%;left:79.9%;width:12%;height:6.9%',
    'btn-b':    'top:71.2%;left:60.3%;width:12%;height:6.9%',
    'btn-start':'top:63.9%;left:40.2%;width:21.8%;height:4%',
  },
};

// ── Estado ───────────────────────────────────────────────────────────────────
const STATE = {
  screen: 'start',
  menuSel: 'yes',
  menuWalking: false,
  worldDir: null,        // 'dia' | 'noite'
  worldPos: {top:0, left:0},
  worldWalking: false,
  encounterDone: false,
  battleChoice: 'fight',
  battlePhase: -1,
  battleFlowStarted: false,
  isRunFlow: false, runIntroDone: false,
  typeDone: false,
  typeTimer: null, walkTimer: null,
};

// ── DOM ──────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const DOM = {
  shell:      $('gameboy-shell'),
  menuPlayer: $('menu-player'),
  menuTW:     $('menu-typewriter'),
  optYes:     $('opt-yes'),
  optNo:      $('opt-no'),
  battleTW:   $('battle-typewriter'),
  battlePlayer:$('battle-player'),
  btnFight:   $('btn-fight'),
  btnRun:     $('btn-run'),
  hpEnemy:    $('battle-hp-enemy'),
  hpPlayer:   $('battle-hp-player'),
  finalTW:    $('final-typewriter'),
  btnUp:$('btn-up'), btnDown:$('btn-down'),
  btnLeft:$('btn-left'), btnRight:$('btn-right'),
  btnA:$('btn-a'), btnB:$('btn-b'), btnStart:$('btn-start'),
};

// ── Áudio ────────────────────────────────────────────────────────────────────
const Aud = {
  _t: {}, ready: false,
  init() {
    if (this.ready) return;
    ['abertura','batalha','tyler'].forEach(n => {
      this._t[n] = new Audio(`audio/${n}.mp3`);
      this._t[n].loop = true; this._t[n].volume = 0.6;
    });
    this.ready = true;
  },
  play(n)  { this.init(); this._t[n].currentTime=0; this._t[n].play().catch(()=>{}); },
  stop(n)  { if (!this._t[n]) return; this._t[n].pause(); this._t[n].currentTime=0; },
  stopAll(){ Object.keys(this._t).forEach(n=>this.stop(n)); },
};

// ── Utilitários ──────────────────────────────────────────────────────────────
function showScreen(name) {
  DOM.shell.src = CONFIG.gbImages[name] || 'img/gameboy-home.png';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $('screen-' + name);
  if (el) el.classList.add('active');
  STATE.screen = name;
  // Ajusta botões
  const pos = BTN_POS[name === 'battle' ? 'battle' : 'default'];
  Object.entries(pos).forEach(([id, style]) => {
    const btn = $(id); if (!btn) return;
    style.split(';').forEach(r => {
      const [p,v] = r.split(':'); if (p&&v) btn.style[p.trim()] = v.trim();
    });
  });
}

function typewriter(el, text, speed, onDone) {
  clearTimeout(STATE.typeTimer);
  STATE.typeDone = false;
  el.textContent = '';
  let i = 0;
  (function tick() {
    if (i < text.length) {
      if (text[i]==='\n') el.appendChild(document.createElement('br'));
      else el.textContent += text[i];
      i++;
      STATE.typeTimer = setTimeout(tick, speed||CONFIG.typeSpeed);
    } else { STATE.typeDone = true; if (onDone) onDone(); }
  })();
}

function setPlayerHp(f) { DOM.hpPlayer.className = 'battle-hp hp-'+Math.min(5,Math.max(0,f)); }
function drainHp(f, cb) {
  setPlayerHp(f);
  if (f<5) setTimeout(()=>drainHp(f+1,cb), 200);
  else if (cb) setTimeout(cb, 400);
}

// ── TELA 1 — INICIAL ─────────────────────────────────────────────────────────
function initStart() { showScreen('start'); }
function handleStart() { Aud.init(); Aud.play('abertura'); initMenu(); }

// ── TELA 2 — MENU ────────────────────────────────────────────────────────────
function initMenu() {
  STATE.menuSel = 'yes'; STATE.menuWalking = false;
  clearTimeout(STATE.walkTimer);
  const p = DOM.menuPlayer;
  p.style.transition = 'none';
  p.style.left = '32%';   // centro calibrado
  p.style.top  = '45.8%';
  p.className = 'dir-down';
  requestAnimationFrame(() => { p.style.transition = 'left 0.8s ease'; });
  updateMenuOpts();
  showScreen('menu');
  typewriter(DOM.menuTW, CONFIG.menuQuestion);
}

function updateMenuOpts() {
  DOM.optYes.classList.toggle('selected', STATE.menuSel==='yes');
  DOM.optNo.classList.toggle('selected',  STATE.menuSel==='no');
}

function menuWalkTo(sel) {
  if (STATE.menuWalking) return;
  STATE.menuWalking = true;
  STATE.menuSel = sel;
  updateMenuOpts();
  const p = DOM.menuPlayer;
  p.classList.remove('dir-down','dir-right','dir-left','dir-up','walking');
  if (sel === 'yes') {
    p.classList.add('dir-left','walking');
    p.style.left = '1%';
  } else {
    p.classList.add('dir-right','walking');
    p.style.left = '72.9%';
  }
  clearTimeout(STATE.walkTimer);
  STATE.walkTimer = setTimeout(() => {
    p.classList.remove('walking','dir-right','dir-left');
    p.classList.add('dir-down');
    STATE.menuWalking = false;
    if (sel === 'yes') initWorld('dia');
    else               initWorld('noite');
  }, 850);
}

// ── TELAS MUNDO ──────────────────────────────────────────────────────────────
// Mesmo sistema do menu: walk-anim CSS cicla frames, JS move posição step a step.
// Dia   → Red entra pela direita (72%) caminhando para esquerda (dir-left)
// Noite → Red entra pela esquerda (8%) caminhando para direita (dir-right)
// Após 2 ciclos completos (8 passos × 125ms = 1s) aparece "!" e inicia encontro.
function initWorld(type) {
  STATE.worldDir      = type;
  STATE.encounterDone = false;
  clearTimeout(STATE.walkTimer);

  const player = $(`world-player-${type}`);
  if (!player) return;

  // Limpa estilos inline herdados de chamadas anteriores
  player.removeAttribute('style');

  const isDia    = type === 'dia';
  const startL   = isDia ? 72 : 8;   // % left inicial
  const targetL  = isDia ? 38 : 55;  // % left final (centro da tela)
  const topPos   = '45%';
  const dirClass = isDia ? 'dir-left' : 'dir-right';

  // Parâmetros da animação — idênticos ao walk-anim do menu
  const FRAMES_PER_CYCLE = 4;
  const TOTAL_CYCLES     = 2;
  const TOTAL_STEPS      = FRAMES_PER_CYCLE * TOTAL_CYCLES; // 8 passos
  const FRAME_MS         = 125;  // 500ms / 4 = mesmo ritmo do walk-anim

  const stepSize = Math.abs(targetL - startL) / TOTAL_STEPS;

  // Posição inicial
  player.style.top  = topPos;
  player.style.left = startL + '%';
  player.className  = dirClass + ' walking';

  showScreen(`world-${type}`);

  // Oculta sinal e flash anteriores
  const sign  = $(`encounter-sign-${type}`);
  const flash = $(`encounter-flash-${type}`);
  if (sign)  sign.style.display  = 'none';
  if (flash) flash.style.display = 'none';

  // Avança posição a cada frame — sincronizado com walk-anim (125ms/frame)
  let currentL = startL;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    currentL = isDia ? currentL - stepSize : currentL + stepSize;
    player.style.left = currentL.toFixed(2) + '%';

    if (step >= TOTAL_STEPS) {
      clearInterval(interval);
      // Para a caminhada, vira de frente
      player.classList.remove('walking', 'dir-left', 'dir-right');
      player.classList.add('dir-down');
      // Aguarda meio segundo para mostrar "!"
      setTimeout(() => triggerEncounter(type, player), 500);
    }
  }, FRAME_MS);
}

function worldMove(dir) {
  if (STATE.encounterDone) return;
  const type = STATE.worldDir;
  const player = $(`world-player-${type}`);
  if (!player) return;

  const step = CONFIG.worldStep;
  const pos  = STATE.worldPos;

  player.classList.remove('dir-down','dir-right','dir-left','dir-up','walking');

  if (dir === 'left')  { pos.left -= step; player.classList.add('dir-left','walking');  }
  if (dir === 'right') { pos.left += step; player.classList.add('dir-right','walking'); }
  if (dir === 'up')    { pos.top  -= step; player.classList.add('dir-up','walking');    }
  if (dir === 'down')  { pos.top  += step; player.classList.add('dir-down','walking');  }

  pos.left = Math.max(0, Math.min(85, pos.left));
  pos.top  = Math.max(0, Math.min(78, pos.top));

  player.style.left = pos.left + '%';
  player.style.top  = pos.top  + '%';

  clearTimeout(STATE.walkTimer);
  STATE.walkTimer = setTimeout(() => {
    player.classList.remove('walking');
    player.classList.add('dir-down');
  }, 500);

  const tr = CONFIG.worldTrigger;
  const hitEdge = pos.left >= tr.right || pos.left <= tr.left ||
                  pos.top  <= tr.top   || pos.top  >= tr.bottom;
  if (hitEdge) triggerEncounter(type, player);
}

function triggerEncounter(type, player) {
  if (STATE.encounterDone) return;
  STATE.encounterDone = true;

  const sign = $(`encounter-sign-${type}`);
  if (sign) {
    sign.style.display = 'block';
    sign.style.left = '50%';
    sign.style.transform = 'translateX(-50%)';
    sign.style.top  = '34%'; 
    sign.textContent = '!';
  }

  setTimeout(() => {
    if (sign) sign.style.display = 'none';
    const flash = $(`encounter-flash-${type}`);
    if (flash) {
      flash.style.display = 'block';
      let count = 0;
      const blink = setInterval(() => {
        flash.style.opacity = count % 2 === 0 ? '1' : '0';
        count++;
        if (count > 5) {
          clearInterval(blink);
          flash.style.display = 'none';
          if (type === 'dia')   initFinal();
          else                  initBattle();
        }
      }, 150);
    }
  }, 1000);
}

// ── TELA 5 — BATALHA ─────────────────────────────────────────────────────────
function initBattle() {
  STATE.battleChoice = 'fight'; STATE.battlePhase = -1;
  STATE.battleFlowStarted = false; STATE.isRunFlow = false;
  STATE.runIntroDone = false; STATE.typeDone = false;
  DOM.hpEnemy.className = 'battle-hp hp-0'; setPlayerHp(0);
  DOM.battleTW.textContent = '';
  DOM.battlePlayer.classList.add('scared');
  updateBattleActions();
  Aud.stop('abertura'); Aud.play('batalha');
  showScreen('battle');
  setTimeout(() => {
    STATE.battlePhase = 0; STATE.battleFlowStarted = true;
    typewriter(DOM.battleTW, CONFIG.fightPhases[0], CONFIG.typeSpeed, ()=>{STATE.typeDone=true;});
  }, 400);
}

function updateBattleActions() {
  DOM.btnFight.classList.toggle('selected', STATE.battleChoice==='fight');
  DOM.btnRun.classList.toggle('selected',   STATE.battleChoice==='run');
}

function battleDpadNav(dir) {
  if (STATE.battlePhase!==0 || !STATE.typeDone) return;
  if (dir==='up')   { STATE.battleChoice='fight'; updateBattleActions(); }
  if (dir==='down') { STATE.battleChoice='run';   updateBattleActions(); }
}

function advanceBattle() {
  if (!STATE.typeDone) {
    clearTimeout(STATE.typeTimer);
    const cur = STATE.isRunFlow && !STATE.runIntroDone
      ? CONFIG.runIntro
      : CONFIG.fightPhases[STATE.battlePhase] || '';
    if (cur) { DOM.battleTW.textContent = cur; STATE.typeDone = true; }
    return;
  }
  if (STATE.battlePhase===0 && !STATE.isRunFlow && STATE.battleChoice==='run') {
    STATE.isRunFlow = true; STATE.runIntroDone = false;
    DOM.battleTW.textContent = '';
    typewriter(DOM.battleTW, CONFIG.runIntro, CONFIG.typeSpeed, ()=>{STATE.typeDone=true;});
    return;
  }
  if (STATE.isRunFlow && !STATE.runIntroDone) {
    STATE.runIntroDone = true; STATE.battlePhase = 1;
    DOM.battleTW.textContent = '';
    typewriter(DOM.battleTW, CONFIG.fightPhases[1], CONFIG.typeSpeed, ()=>{STATE.typeDone=true;});
    return;
  }
  STATE.battlePhase++;
  if (STATE.battlePhase < CONFIG.fightPhases.length) {
    DOM.battleTW.textContent = '';
    if (STATE.battlePhase===2) {
      typewriter(DOM.battleTW, CONFIG.fightPhases[2], CONFIG.typeSpeed, ()=>{
        STATE.typeDone = false;
        drainHp(1, ()=>{STATE.typeDone=true;});
      });
      return;
    }
    const spd = STATE.battlePhase===3 ? CONFIG.typeSpeedSlow : CONFIG.typeSpeed;
    typewriter(DOM.battleTW, CONFIG.fightPhases[STATE.battlePhase], spd, ()=>{STATE.typeDone=true;});
  } else {
    DOM.battlePlayer.classList.remove('scared');
    Aud.stop('batalha');
    setTimeout(()=>{ Aud.play('abertura'); initMenu(); }, 700);
  }
}

// ── TELA 6 — FINAL ───────────────────────────────────────────────────────────
function initFinal() {
  Aud.stopAll(); Aud.play('tyler');
  showScreen('final');
  setTimeout(()=>typewriter(DOM.finalTW, CONFIG.finalMessage, CONFIG.typeSpeed), 500);
}

// ── TELA 7 — CRÉDITOS ────────────────────────────────────────────────────────
function initCredits() { showScreen('credits'); }

// ── ROTEADOR ─────────────────────────────────────────────────────────────────
function handleA() {
  switch(STATE.screen) {
    case 'start':        handleStart();    break;
    case 'menu':         /* Red anda sozinho */ break;
    case 'world-dia':    break; 
    case 'world-noite':  break;
    case 'battle':       advanceBattle();  break;
    case 'final':        initCredits();    break;
    case 'credits':      Aud.stopAll(); initStart(); break;
  }
}
function handleB() {
  switch(STATE.screen) {
    case 'menu':    Aud.stop('abertura'); initStart(); break;
    case 'battle':  advanceBattle(); break;
    case 'credits': Aud.stopAll(); initStart(); break;
  }
}
function handleDpad(dir) {
  if (STATE.screen==='menu') {
    if (STATE.menuWalking) return;
    if (dir==='left')  menuWalkTo('yes');
    if (dir==='right') menuWalkTo('no');
  }
  if (STATE.screen==='world-dia' || STATE.screen==='world-noite') {
    worldMove(dir);
  }
  if (STATE.screen==='battle') battleDpadNav(dir);
}

// ── BIND ─────────────────────────────────────────────────────────────────────
function bindControls() {
  function tap(el, fn) {
    if (!el) return;
    let g=false;
    el.addEventListener('touchstart', e=>{
      e.preventDefault(); if(g)return; g=true; fn();
      setTimeout(()=>{g=false;},280);
    },{passive:false});
    el.addEventListener('click',()=>{
      if(g)return; g=true; fn(); setTimeout(()=>{g=false;},280);
    });
  }

  tap(DOM.btnA, handleA);
  tap(DOM.btnB, handleB);
  tap(DOM.btnStart, ()=>{ if(STATE.screen==='start') handleStart(); });
  tap(DOM.btnUp,    ()=>handleDpad('up'));
  tap(DOM.btnDown,  ()=>handleDpad('down'));
  tap(DOM.btnLeft,  ()=>handleDpad('left'));
  tap(DOM.btnRight, ()=>handleDpad('right'));

  tap(DOM.optYes, ()=>{ if(STATE.screen==='menu'&&!STATE.menuWalking) menuWalkTo('yes'); });
  tap(DOM.optNo,  ()=>{ if(STATE.screen==='menu'&&!STATE.menuWalking) menuWalkTo('no');  });

  tap(DOM.btnFight, ()=>{
    if(STATE.screen!=='battle')return;
    if(STATE.battlePhase===0&&STATE.typeDone){STATE.battleChoice='fight';updateBattleActions();}
    advanceBattle();
  });
  tap(DOM.btnRun, ()=>{
    if(STATE.screen!=='battle')return;
    if(STATE.battlePhase===0&&STATE.typeDone){STATE.battleChoice='run';updateBattleActions();}
    advanceBattle();
  });

  document.addEventListener('keydown', e=>{
    switch(e.key){
      case 'Enter':case 'z':case 'Z': handleA(); break;
      case 'x':case 'X':case 'Escape': handleB(); break;
      case 'ArrowLeft':  handleDpad('left');  break;
      case 'ArrowRight': handleDpad('right'); break;
      case 'ArrowUp':    handleDpad('up');    break;
      case 'ArrowDown':  handleDpad('down');  break;
    }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ bindControls(); initStart(); });
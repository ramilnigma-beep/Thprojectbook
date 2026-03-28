import { useState, useEffect, useCallback, useRef } from "react";

// ── Fonts ────────────────────────────────────────────────────────────────────
const _f = document.createElement("link");
_f.rel = "stylesheet";
_f.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600;700&display=swap";
document.head.appendChild(_f);

// ══════════════════════════════════════════════════════════════════════════════
//  CONSTANTS & DATA
// ══════════════════════════════════════════════════════════════════════════════
const STORE_KEY = "th_v3";
const TEAL = "#1BAEC8";
const GOLD = "#F5C842";

const DEMO = {
  id:"demo", name:"Норвежский свитер", type:"Свитер", size:"M (46–48)",
  status:"in-progress",
  gauge:{stitches:22,rows:30,size:10},
  dimensions:{width:54,length:66},
  safetyMargin:10,
  notes:"Скандинавский узор с оленями. Спицы 3.5 мм, снизу вверх.",
  yarns:[
    {id:"y1",name:"Drops Karisma",colorName:"Морская волна",color:"#1BAEC8",weight:200,length:200,category:"DK"},
    {id:"y2",name:"Drops Karisma",colorName:"Тёмно-синий",color:"#3A6BC8",weight:100,length:100,category:"DK"},
    {id:"y3",name:"Drops Karisma",colorName:"Белый",color:"#E8F0F8",weight:50,length:50,category:"DK"},
  ],
  sections:[
    {id:"body",name:"Перед",count:47,goal:80},
    {id:"back",name:"Спинка",count:47,goal:80},
    {id:"sl1",name:"Рукав л.",count:32,goal:60},
    {id:"sl2",name:"Рукав п.",count:0,goal:60},
    {id:"yoke",name:"Кокетка",count:0,goal:32},
  ],
  steps:[
    {id:"s1",text:"Набрать 120 петель, замкнуть в круг. 2×2 резинка 8 см (~24 ряда).",done:true},
    {id:"s2",text:"Перейти на лицевую гладь. Маркеры по бокам (60 пт каждая сторона).",done:true},
    {id:"s3",text:"Вязать до пройм 38 см. Закрыть подмышечные петли (8 пт с каждой стороны).",done:true},
    {id:"s4",text:"Рукава отдельно: набрать 52 пт, манжета резинкой 6 см.",done:false},
    {id:"s5",text:"Рукав: прибавлять 2 пт каждые 8 рядов до 68 пт. Длина 44 см.",done:false},
    {id:"s6",text:"Соединить перед, спинку и рукава на кокетке (~248 пт).",done:false},
    {id:"s7",text:"Кокетка по схеме с оленями (32 ряда). Убавления согласно схеме.",done:false},
    {id:"s8",text:"Горловина: 90 пт, резинка 2 см, закрыть свободно.",done:false},
  ],
  timeline:[
    {id:"t1",date:"10 мар",note:"Начала! Первый ряд резинки готов 🎉"},
    {id:"t2",date:"14 мар",note:"Резинка переда и спинки — огонь!"},
    {id:"t3",date:"19 мар",note:"47 рядов, иду в хорошем темпе"},
    {id:"t4",date:"24 мар",note:"Закрыла проймы, нитки хватает ✅"},
  ],
  createdAt:"2024-03-10",
};

const PROJ_TYPES=["Свитер","Кардиган","Шапка","Шарф","Шаль","Носки","Варежки","Плед","Другое"];
const YARN_CATS=["Кружевная","Тонкая","Спорт","DK","Ворстед","Аран","Толстая","Супертолстая"];
const YARN_COLORS=["#1BAEC8","#3A6BC8","#1B3A6B","#0D7A8A","#56CCF2","#F5C842","#E07A48","#EB5757","#6FCF97","#27AE60","#BB6BD9","#C8C8C8","#4F4F4F","#1C1C1C","#FFF","#E8F0F8","#FFE4B5","#E8F5E9"];

function loadStore(){
  try{const r=localStorage.getItem(STORE_KEY);if(r)return JSON.parse(r);}catch{}
  return{projects:[DEMO],yarns:[],dark:true};
}
function saveStore(d){try{localStorage.setItem(STORE_KEY,JSON.stringify(d));}catch{}}

// ── Haptic ───────────────────────────────────────────────────────────────────
const haptic=(ms=8)=>{try{navigator.vibrate&&navigator.vibrate(ms);}catch{}};

// ── Confetti (pure canvas, no deps) ─────────────────────────────────────────
function fireConfetti(colors=[TEAL,"#fff",GOLD]){
  const canvas=document.createElement("canvas");
  canvas.style.cssText="position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none";
  document.body.appendChild(canvas);
  const ctx=canvas.getContext("2d");
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  const particles=Array.from({length:80},()=>({
    x:Math.random()*canvas.width, y:-10,
    vx:(Math.random()-0.5)*6, vy:Math.random()*4+2,
    color:colors[Math.floor(Math.random()*colors.length)],
    size:Math.random()*8+4, rot:Math.random()*360,
    vrot:(Math.random()-0.5)*10, alpha:1,
  }));
  let frame=0;
  const tick=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.rot+=p.vrot; p.vy+=0.1;
      p.alpha=Math.max(0,1-frame/90);
      ctx.save(); ctx.globalAlpha=p.alpha;
      ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;
      ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size/2);
      ctx.restore();
    });
    if(++frame<100)requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  /* ── DARK THEME (default) ── */
  :root{
    --teal:#1BAEC8; --teal2:#0D8FA8; --teal3:rgba(27,174,200,0.15);
    --navy:#1B3A6B; --gold:#F5C842;
    --bg:#0A0F1A; --bg2:#111827; --bg3:#1A2235;
    --card:#151E2E; --card2:#1E293B;
    --border:rgba(255,255,255,0.07); --border2:rgba(27,174,200,0.25);
    --text:#F0F4FF; --muted:#6B7FA0; --muted2:#9BA8C0;
    --danger:#FF6B6B; --ok:#27AE60; --warn:#F5C842;
    --r:18px; --rs:12px;
    --glass:rgba(255,255,255,0.04);
    --glass-border:rgba(255,255,255,0.08);
    --topbar-bg:rgba(10,15,26,0.78);
    --bnav-bg:rgba(10,15,26,0.82);
    --mesh1:rgba(27,174,200,0.12);
    --mesh2:rgba(27,58,107,0.18);
    --num-shadow:rgba(27,174,200,0.5);
    --hero-bg:linear-gradient(145deg,#0f2744 0%,#0a1a30 40%,#091525 100%);
    --hero-ring:rgba(27,174,200,0.2);
    --cr-bg:linear-gradient(145deg,#0f2744,#091525);
    --cr-border:rgba(27,174,200,0.2);
  }

  /* ── LIGHT THEME ── */
  .app.light{
    --bg:#F0F8FB; --bg2:#FFFFFF; --bg3:#E3F4F8;
    --card:#FFFFFF; --card2:#F4FAFC;
    --border:rgba(27,174,200,0.15); --border2:rgba(27,174,200,0.4);
    --text:#0F2A3A; --muted:#6B8FA0; --muted2:#4A6E80;
    --danger:#D93535; --ok:#1A8A4A; --warn:#C8900A;
    --glass:rgba(255,255,255,0.7);
    --glass-border:rgba(27,174,200,0.18);
    --topbar-bg:rgba(240,248,251,0.85);
    --bnav-bg:rgba(255,255,255,0.88);
    --mesh1:rgba(27,174,200,0.07);
    --mesh2:rgba(27,58,107,0.05);
    --num-shadow:rgba(27,174,200,0.3);
    --hero-bg:linear-gradient(145deg,#1BAEC8 0%,#0D7A9A 50%,#1B3A6B 100%);
    --hero-ring:rgba(255,255,255,0.3);
    --cr-bg:linear-gradient(145deg,#1B3A6B,#0D5580);
    --cr-border:rgba(255,255,255,0.15);
  }

  body{
    font-family:'Inter',sans-serif;
    background:var(--bg);color:var(--text);
    -webkit-tap-highlight-color:transparent;
    overscroll-behavior:none;
  }
  .app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden;transition:background .3s}

  /* ── BG MESH ── */
  .bg-mesh{
    position:fixed;inset:0;z-index:0;pointer-events:none;
    background:
      radial-gradient(ellipse 60% 40% at 20% 10%, var(--mesh1) 0%, transparent 70%),
      radial-gradient(ellipse 50% 50% at 80% 80%, var(--mesh2) 0%, transparent 70%);
    transition:background .3s;
  }

  /* ── TOPBAR ── */
  .topbar{
    position:sticky;top:0;z-index:100;
    height:60px;padding:0 18px;
    display:flex;align-items:center;justify-content:space-between;
    background:var(--topbar-bg);
    backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid var(--glass-border);
    transition:background .3s;
  }
  .logo{display:flex;align-items:center;gap:10px}
  .logo-icon{
    width:36px;height:36px;border-radius:10px;
    background:linear-gradient(135deg,var(--teal),var(--navy));
    display:flex;align-items:center;justify-content:center;font-size:18px;
    box-shadow:0 0 20px rgba(27,174,200,0.4);
  }
  .logo-name{font-family:'Syne',sans-serif;font-weight:800;font-size:16px;letter-spacing:-.3px}
  .logo-sub{font-size:10px;font-weight:500;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
  .tb-btn{
    width:36px;height:36px;border-radius:10px;border:1px solid var(--glass-border);
    background:var(--glass);color:var(--text);cursor:pointer;
    display:flex;align-items:center;justify-content:center;font-size:17px;
    transition:all .2s;backdrop-filter:blur(10px);
  }
  .tb-btn:hover{background:var(--teal3);border-color:var(--border2)}
  .tb-btn:active{transform:scale(.93)}

  /* ── BOTTOM NAV ── */
  .bnav{
    position:fixed;bottom:0;left:50%;transform:translateX(-50%);
    width:100%;max-width:430px;z-index:100;
    padding:8px 12px calc(8px + env(safe-area-inset-bottom,0px));
    background:var(--bnav-bg);
    backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);
    border-top:1px solid var(--glass-border);
    display:flex;transition:background .3s;
  }
  .ntab{
    flex:1;border:none;background:transparent;
    display:flex;flex-direction:column;align-items:center;gap:3px;
    cursor:pointer;color:var(--muted);
    font-family:'Inter',sans-serif;font-size:10px;font-weight:600;
    letter-spacing:.04em;padding:4px 0;transition:all .2s;
  }
  .ntab.on{color:var(--teal)}
  .ntab .ni{font-size:20px;transition:transform .2s}
  .ntab.on .ni{transform:scale(1.15)}
  .ntab-pip{width:4px;height:4px;border-radius:50%;background:var(--teal);opacity:0;transition:opacity .2s;margin-top:1px}
  .ntab.on .ntab-pip{opacity:1}

  /* ── SUBNAV ── */
  .snav{
    display:flex;overflow-x:auto;scrollbar-width:none;
    background:rgba(10,15,26,0.6);backdrop-filter:blur(20px);
    border-bottom:1px solid var(--glass-border);padding:0 4px;
  }
  .snav::-webkit-scrollbar{display:none}
  .stab{
    flex-shrink:0;border:none;background:transparent;
    padding:12px 14px;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;
    color:var(--muted);letter-spacing:.02em;cursor:pointer;white-space:nowrap;
    border-bottom:2px solid transparent;transition:all .18s;
  }
  .stab.on{color:var(--teal);border-bottom-color:var(--teal)}

  /* ── PAGE ── */
  .page{padding:16px 14px 96px;position:relative;z-index:1;animation:fu .3s ease}
  @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  /* ── CARDS ── */
  .card{
    background:var(--card);border-radius:var(--r);padding:16px;
    border:1px solid var(--border);margin-bottom:12px;
    box-shadow:0 4px 24px rgba(0,0,0,0.4);
  }
  .card-glow{
    background:var(--card);border-radius:var(--r);padding:16px;
    border:1px solid var(--border2);margin-bottom:12px;
    box-shadow:0 0 30px rgba(27,174,200,0.12),0 4px 24px rgba(0,0,0,0.4);
  }
  .ctit{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px}
  .csub{font-size:12px;color:var(--muted);font-weight:500}

  /* ── HERO PROJECT CARD ── */
  .hero-card{
    border-radius:24px;padding:22px;margin-bottom:14px;
    background:var(--hero-bg);
    border:1px solid var(--hero-ring);
    box-shadow:0 0 60px rgba(27,174,200,0.1),0 8px 32px rgba(0,0,0,0.3);
    position:relative;overflow:hidden;transition:background .3s;
  }
  .hero-card::before{
    content:'';position:absolute;top:-60px;right:-60px;
    width:200px;height:200px;border-radius:50%;
    background:radial-gradient(circle,rgba(27,174,200,0.15),transparent 70%);
  }
  .hero-label{font-size:10px;font-weight:700;color:var(--teal);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
  .hero-name{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;line-height:1.15;margin-bottom:4px}
  .hero-type{font-size:13px;color:var(--muted2);font-weight:500;margin-bottom:20px}
  .hero-row{display:flex;align-items:center;gap:16px}
  .hero-ring-wrap{flex-shrink:0}
  .hero-stats{flex:1}
  .hero-pct{font-family:'Syne',sans-serif;font-size:38px;font-weight:800;color:var(--teal);line-height:1}
  .hero-done{font-size:12px;color:var(--muted);font-weight:500;margin-top:3px}
  .hero-bar{background:rgba(255,255,255,0.08);border-radius:20px;height:5px;margin:12px 0 0}
  .hero-fill{height:100%;border-radius:20px;background:linear-gradient(90deg,var(--teal),#56CCF2);transition:width .8s cubic-bezier(.34,1.56,.64,1)}

  /* ── STAT PILLS ── */
  .stat-row{display:flex;gap:8px;margin-bottom:14px}
  .stat-pill{
    flex:1;background:var(--card);border:1px solid var(--border);border-radius:14px;
    padding:12px 10px;text-align:center;
  }
  .stat-num{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--teal)}
  .stat-lbl{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}

  /* ── BUTTONS ── */
  .btn{
    border:none;cursor:pointer;font-family:'Inter',sans-serif;font-weight:700;font-size:14px;
    border-radius:var(--rs);padding:12px 20px;
    transition:all .15s;display:inline-flex;align-items:center;gap:7px;
    letter-spacing:-.1px;
  }
  .btn:active{transform:scale(.95)}
  .bp{background:var(--teal);color:#fff;box-shadow:0 4px 20px rgba(27,174,200,0.4)}
  .bp:hover{background:var(--teal2);box-shadow:0 6px 28px rgba(27,174,200,0.5)}
  .bg{background:transparent;color:var(--teal);border:1.5px solid rgba(27,174,200,0.4)}
  .bg:hover{background:var(--teal3);border-color:var(--teal)}
  .bl{background:var(--card2);color:var(--muted2);border:1px solid var(--border)}
  .bl:hover{color:var(--text)}
  .bd{background:rgba(255,107,107,0.12);color:var(--danger);border:1px solid rgba(255,107,107,0.2)}
  .bgold{background:linear-gradient(135deg,var(--gold),#E5A820);color:#0A0F1A}
  .bfull{width:100%;justify-content:center}
  .bsm{padding:8px 14px;font-size:12px;border-radius:9px}

  /* ── COUNTER (STAR OF THE SHOW) ── */
  .counter-wrap{
    display:flex;flex-direction:column;align-items:center;
    padding:8px 0 20px;
  }
  .counter-section-name{
    font-size:11px;font-weight:700;color:var(--muted);
    text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;
  }
  .counter-goal{font-size:12px;color:var(--muted);font-weight:500;margin-bottom:16px}
  .counter-num{
    font-family:'Syne',sans-serif;
    font-size:108px;font-weight:800;
    color:var(--teal);line-height:1;
    letter-spacing:-6px;
    text-shadow:0 0 60px var(--num-shadow);
    transition:transform .12s cubic-bezier(.34,1.56,.64,1);
    user-select:none;
    margin:8px 0 24px;
  }

  /* ── THEME TOGGLE ── */
  .theme-toggle{
    display:flex;align-items:center;gap:0;
    background:var(--card2);border:1px solid var(--border);
    border-radius:30px;padding:3px;
  }
  .theme-opt{
    border:none;background:transparent;cursor:pointer;
    padding:7px 16px;border-radius:24px;font-size:13px;font-weight:700;
    color:var(--muted);transition:all .2s;display:flex;align-items:center;gap:5px;
    font-family:'Inter',sans-serif;
  }
  .theme-opt.on{background:var(--teal);color:#fff;box-shadow:0 2px 10px rgba(27,174,200,0.4)}

  /* ── STANDALONE COUNTER PAGE ── */
  .sc-wrap{
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:calc(100vh - 60px - 70px);
    padding:20px 20px 96px;position:relative;z-index:1;
  }
  .sc-name-row{display:flex;align-items:center;gap:10px;margin-bottom:6px}
  .sc-name{
    font-family:'Syne',sans-serif;font-size:17px;font-weight:800;
    color:var(--text);text-align:center;
    border:none;background:transparent;text-align:center;
    outline:none;width:200px;cursor:text;
  }
  .sc-name::placeholder{color:var(--muted)}
  .sc-sub{font-size:12px;color:var(--muted);font-weight:500;margin-bottom:4px}
  .sc-goal-row{display:flex;align-items:center;gap:8px;margin-bottom:20px}
  .sc-goal-input{
    width:90px;text-align:center;padding:6px 10px;font-size:13px;
    background:var(--card2);border:1px solid var(--border);border-radius:8px;
    color:var(--text);font-family:'Inter',sans-serif;font-weight:600;outline:none;
  }
  .sc-goal-input:focus{border-color:var(--teal)}
  .sc-history{
    width:100%;max-width:320px;margin-top:24px;
  }
  .sc-hist-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;text-align:center}
  .sc-hist-item{
    display:flex;justify-content:space-between;align-items:center;
    padding:8px 14px;background:var(--card2);border:1px solid var(--border);
    border-radius:10px;margin-bottom:6px;font-size:13px;font-weight:600;
  }
  .sc-hist-name{color:var(--muted2)}
  .sc-hist-val{color:var(--teal);font-weight:800}

  .counter-num.bump{transform:scale(1.12)}
  .counter-num.milestone{
    color:var(--gold);
    text-shadow:0 0 60px rgba(245,200,66,0.6);
    animation:milestone-pop .5s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes milestone-pop{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
  .counter-controls{display:flex;align-items:center;gap:20px}
  .cbtn{
    border:none;cursor:pointer;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    transition:all .12s cubic-bezier(.34,1.56,.64,1);user-select:none;
    font-family:'Syne',sans-serif;font-weight:800;
  }
  .cbtn:active{transform:scale(.88)}
  .cbtn-minus{
    width:64px;height:64px;font-size:28px;
    background:var(--card2);color:var(--muted2);
    border:1px solid var(--border);
  }
  .cbtn-plus{
    width:84px;height:84px;font-size:36px;
    background:linear-gradient(145deg,var(--teal),var(--teal2));
    color:#fff;
    box-shadow:0 8px 32px rgba(27,174,200,0.5),0 0 0 0 rgba(27,174,200,0.3);
    animation:ring-pulse 2.5s ease infinite;
  }
  @keyframes ring-pulse{0%,100%{box-shadow:0 8px 32px rgba(27,174,200,0.5),0 0 0 0 rgba(27,174,200,0.3)}50%{box-shadow:0 8px 32px rgba(27,174,200,0.5),0 0 0 12px rgba(27,174,200,0)}}
  .cbtn-plus:active{animation:none;box-shadow:0 2px 8px rgba(27,174,200,0.3)}
  .counter-extras{display:flex;gap:8px;margin-top:18px}

  /* ── CIRCULAR PROGRESS ── */
  .ring-svg{transform:rotate(-90deg)}
  .ring-bg{fill:none;stroke:rgba(255,255,255,0.06);stroke-width:6}
  .ring-fill{fill:none;stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset .8s cubic-bezier(.34,1.56,.64,1)}

  /* ── STEPS ── */
  .srow{
    display:flex;gap:12px;padding:13px 0;
    border-bottom:1px solid var(--border);
    align-items:flex-start;cursor:pointer;
    position:relative;overflow:hidden;
    transition:background .2s;
  }
  .srow:last-child{border-bottom:none}
  .srow.done .stxt{color:var(--muted);text-decoration:line-through;text-decoration-color:var(--muted)}
  .srow.act{background:rgba(27,174,200,0.05);margin:0 -16px;padding:13px 16px;border-radius:12px;border-bottom:none}
  .snum{
    width:28px;height:28px;border-radius:50%;flex-shrink:0;
    border:1.5px solid var(--border);
    font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;
    color:var(--muted);background:transparent;transition:all .25s;
  }
  .srow.done .snum{background:var(--teal);color:#fff;border-color:var(--teal)}
  .srow.act .snum{background:rgba(27,174,200,0.15);color:var(--teal);border-color:var(--teal)}
  .stxt{font-size:13px;line-height:1.6;font-weight:500;color:var(--text);transition:color .2s}
  .srow.act .stxt{font-weight:600;color:var(--text)}
  /* swipe hint */
  .swipe-hint{
    position:absolute;right:0;top:0;bottom:0;
    display:flex;align-items:center;padding-right:12px;
    color:var(--ok);font-size:18px;opacity:0;transition:opacity .2s;
    pointer-events:none;
  }

  /* ── FORM ── */
  .field{margin-bottom:14px}
  .lbl{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
  input,textarea,select{
    width:100%;background:var(--card2);border:1px solid var(--border);border-radius:var(--rs);
    padding:11px 14px;font-family:'Inter',sans-serif;font-size:14px;font-weight:500;color:var(--text);
    outline:none;transition:border-color .2s,box-shadow .2s;
  }
  input:focus,textarea:focus,select:focus{
    border-color:var(--teal);
    box-shadow:0 0 0 3px rgba(27,174,200,0.15);
  }
  textarea{resize:vertical;min-height:80px}
  select option{background:var(--bg2)}

  /* ── BADGES ── */
  .badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.02em}
  .bt{background:rgba(27,174,200,0.15);color:var(--teal)}
  .bwarn{background:rgba(245,200,66,0.15);color:var(--gold)}
  .bok{background:rgba(74,222,128,0.15);color:var(--ok)}
  .bgr{background:rgba(255,255,255,0.06);color:var(--muted)}

  /* ── PROGRESS BAR ── */
  .ptr{background:rgba(255,255,255,0.06);border-radius:20px;height:6px;overflow:hidden;margin:7px 0}
  .pfi{height:100%;border-radius:20px;background:linear-gradient(90deg,var(--teal),#56CCF2);transition:width .6s cubic-bezier(.34,1.56,.64,1)}

  /* ── YARN ROW ── */
  .yrow{
    display:flex;align-items:center;gap:12px;
    background:var(--card2);border:1px solid var(--border);border-radius:14px;
    padding:12px 14px;margin-bottom:9px;
  }
  .ysw{width:36px;height:36px;border-radius:50%;flex-shrink:0;border:2px solid rgba(255,255,255,0.1);box-shadow:0 0 12px rgba(0,0,0,0.3)}
  .yn{font-weight:700;font-size:13px}
  .yd{font-size:11px;font-weight:500;color:var(--muted);margin-top:2px}

  /* ── CALC RESULT ── */
  .cr{
    background:var(--cr-bg);
    border:1px solid var(--cr-border);
    border-radius:var(--r);padding:18px;margin-top:14px;
    box-shadow:0 0 40px rgba(27,174,200,0.08);transition:background .3s;
  }
  .crr{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;font-weight:500;color:var(--muted2)}
  .crv{font-weight:700;color:var(--text)}
  .crd{border-top:1px solid rgba(255,255,255,0.07);margin:8px 0}
  .crb{font-size:17px;font-weight:800;color:var(--text)}
  .surplus{color:var(--ok)}.shortage{color:var(--danger)}

  /* ── MODAL / SHEET ── */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:200;display:flex;align-items:flex-end;backdrop-filter:blur(4px)}
  .sheet{
    width:100%;max-width:430px;margin:0 auto;
    background:var(--bg2);
    border:1px solid var(--glass-border);
    border-bottom:none;
    border-radius:24px 24px 0 0;
    padding:18px 18px 36px;max-height:92vh;overflow-y:auto;
  }
  .shdl{width:40px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 18px}

  /* ── MODE CARDS ── */
  .mcard{
    background:var(--card2);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:10px;
    cursor:pointer;transition:all .2s;
  }
  .mcard:hover{border-color:var(--teal);background:rgba(27,174,200,0.08)}
  .mcard:active{transform:scale(.98)}
  .mt{font-weight:700;font-size:14px;margin-bottom:2px}
  .md{font-size:12px;font-weight:500;color:var(--muted)}

  /* ── CHIPS ── */
  .chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
  .chip{
    padding:6px 14px;border-radius:20px;background:var(--card2);font-size:12px;font-weight:600;
    color:var(--muted);cursor:pointer;border:1px solid var(--border);transition:all .15s;
  }
  .chip.on{border-color:var(--teal);color:var(--teal);background:rgba(27,174,200,0.12)}

  /* ── TIMELINE ── */
  .tlw{padding-left:7px}
  .tli{display:flex;gap:12px;margin-bottom:16px;position:relative}
  .tli:not(:last-child)::before{content:'';position:absolute;left:4px;top:14px;bottom:-16px;width:2px;background:var(--border)}
  .tld{width:10px;height:10px;background:var(--teal);border-radius:50%;margin-top:4px;flex-shrink:0;z-index:1;box-shadow:0 0 8px var(--teal)}
  .tldate{font-size:11px;font-weight:600;color:var(--muted);margin-bottom:3px}
  .tlnote{font-size:13px;font-weight:500;line-height:1.55;color:var(--muted2)}

  /* ── INFO ROW ── */
  .ir{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px}
  .ir:last-child{border-bottom:none}
  .irk{color:var(--muted);font-weight:500}
  .irv{font-weight:700;text-align:right;max-width:60%}

  /* ── GAUGE BOX ── */
  .gbox{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center}
  .gbn{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:var(--teal);line-height:1}
  .gbl{font-size:11px;font-weight:600;color:var(--muted);margin-top:3px}

  /* ── EMPTY ── */
  .empty{text-align:center;padding:52px 20px;color:var(--muted)}
  .eic{font-size:54px;margin-bottom:14px}
  .et{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text);margin-bottom:7px}
  .ed{font-size:13px;font-weight:500;line-height:1.6}

  /* ── TOAST ── */
  .toast{
    position:fixed;bottom:88px;left:50%;transform:translateX(-50%);
    background:rgba(27,174,200,0.95);
    backdrop-filter:blur(12px);
    color:#fff;padding:10px 22px;border-radius:24px;
    font-size:13px;font-weight:700;z-index:500;
    white-space:nowrap;
    box-shadow:0 4px 24px rgba(27,174,200,0.5);
    animation:tin .25s cubic-bezier(.34,1.56,.64,1),tout .3s ease 1.7s forwards;
  }
  @keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(16px) scale(.9)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
  @keyframes tout{to{opacity:0;transform:translateX(-50%) translateY(8px)}}

  /* ── SECTION HEADER ── */
  .sh{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--text);margin-bottom:16px}
  .sh span{color:var(--teal)}

  /* ── AI TAG ── */
  .ai-tag{
    display:inline-flex;align-items:center;gap:3px;
    background:linear-gradient(90deg,var(--teal),var(--navy));
    color:#fff;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    padding:2px 9px;border-radius:20px;
  }

  /* ── MISC ── */
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .sep{border:none;border-top:1px solid var(--border);margin:14px 0}
  .row{display:flex;gap:8px;align-items:center}
  .f1{flex:1}
  .tc{text-align:center}
  .mu{color:var(--muted)}.fw8{font-weight:800}
  .mt4{margin-top:4px}.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}
  .mb8{margin-bottom:8px}.mb12{margin-bottom:12px}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .loading{animation:pulse 1.4s infinite;color:var(--teal);font-size:13px;font-weight:700;text-align:center;padding:12px}

  /* ── AUTH SCREEN ── */
  .auth-screen{
    min-height:100vh;display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    padding:32px 24px 48px;position:relative;z-index:1;
  }
  .auth-logo-wrap{margin-bottom:32px;display:flex;flex-direction:column;align-items:center;gap:12px}
  .auth-tagline{font-size:13px;font-weight:500;color:var(--muted);letter-spacing:.04em}
  .auth-card{
    width:100%;background:var(--card);border:1px solid var(--border);
    border-radius:24px;padding:26px 22px;
    box-shadow:0 8px 40px rgba(0,0,0,0.25);
  }
  .auth-tabs{display:flex;background:var(--card2);border-radius:12px;padding:3px;margin-bottom:22px}
  .auth-tab{
    flex:1;border:none;background:transparent;cursor:pointer;
    padding:9px;border-radius:9px;font-family:'Inter',sans-serif;
    font-size:13px;font-weight:700;color:var(--muted);transition:all .2s;
  }
  .auth-tab.on{background:var(--teal);color:#fff;box-shadow:0 2px 10px rgba(27,174,200,0.4)}
  .auth-hint{font-size:11px;color:var(--muted);text-align:center;margin-top:14px;font-weight:500;line-height:1.5}
  .auth-divider{display:flex;align-items:center;gap:10px;margin:16px 0}
  .auth-divider-line{flex:1;height:1px;background:var(--border)}
  .auth-divider-txt{font-size:11px;color:var(--muted);font-weight:600}
  .auth-guest{
    width:100%;border:1.5px dashed var(--border2);background:transparent;
    color:var(--muted2);border-radius:12px;padding:12px;cursor:pointer;
    font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
    transition:all .2s;
  }
  .auth-guest:hover{color:var(--teal);border-color:var(--teal)}

  /* ── LIGHT THEME CONTRAST FIXES ── */
  .app.light .card{box-shadow:0 2px 12px rgba(27,174,200,0.08)}
  .app.light .pcard{box-shadow:0 2px 12px rgba(27,174,200,0.08)}
  .app.light .card-glow{box-shadow:0 0 20px rgba(27,174,200,0.15)}
  .app.light .ctit{color:#0F2A3A}
  .app.light .csub{color:#4A6E80}
  .app.light .sh{color:#0F2A3A}
  .app.light .irk{color:#4A6E80}
  .app.light .irv{color:#0F2A3A}
  .app.light .lbl{color:#4A6E80}
  .app.light input,.app.light textarea,.app.light select{
    background:#fff;border-color:rgba(27,174,200,0.25);color:#0F2A3A;
  }
  .app.light input::placeholder,.app.light textarea::placeholder{color:#9BA8C0}
  .app.light .ntab{color:#6B8FA0}
  .app.light .ntab.on{color:#0D8FA8}
  .app.light .stab{color:#6B8FA0}
  .app.light .stab.on{color:#0D8FA8}
  .app.light .srow .stxt{color:#0F2A3A}
  .app.light .srow.done .stxt{color:#9BA8C0}
  .app.light .srow.act .stxt{color:#0F2A3A;font-weight:700}
  .app.light .snum{color:#6B8FA0;border-color:rgba(27,174,200,0.2)}
  .app.light .srow.act{background:rgba(27,174,200,0.07)}
  .app.light .counter-num{text-shadow:0 0 40px rgba(27,174,200,0.25)}
  .app.light .cbtn-minus{background:#E8F4F8;color:#0D8FA8;border-color:rgba(27,174,200,0.2)}
  .app.light .hero-name,.app.light .hero-type,.app.light .hero-done,.app.light .hero-label,.app.light .hero-pct,.app.light .hmt{color:#fff}
  .app.light .cr .crr,.app.light .cr .crv,.app.light .cr .crb{color:#fff}
  .app.light .tldate{color:#6B8FA0}
  .app.light .tlnote{color:#0F2A3A}
  .app.light .yn{color:#0F2A3A}
  .app.light .yd{color:#4A6E80}
  .app.light .chip{color:#4A6E80;border-color:rgba(27,174,200,0.2);background:#E8F4F8}
  .app.light .chip.on{color:#0D7A8A;background:rgba(27,174,200,0.12);border-color:var(--teal)}
  .app.light .stat-num{color:#0D8FA8}
  .app.light .stat-pill{background:#fff;border-color:rgba(27,174,200,0.2)}
  .app.light .stat-lbl{color:#6B8FA0}
  .app.light .badge.bwarn{background:#FEF3C7;color:#92400E}
  .app.light .badge.bok{background:#D1FAE5;color:#065F46}
  .app.light .badge.bgr{background:#F1F5F9;color:#475569}
  .app.light .btn.bl{background:#E8F4F8;color:#0D7A8A;border-color:rgba(27,174,200,0.2)}
  .app.light .btn.bl:hover{background:#D0EEF5;color:#0A5F75}
  .app.light .btn.bd{background:#FEE2E2;color:#B91C1C;border-color:rgba(220,38,38,0.2)}
  .app.light .sc-name{color:#0F2A3A}
  .app.light .sc-hist-name{color:#4A6E80}
  .app.light .sc-hist-item{background:#E8F4F8;border-color:rgba(27,174,200,0.15)}
  .app.light .mcard{background:#fff}
  .app.light .mcard:hover{background:rgba(27,174,200,0.06)}
  .app.light .mt{color:#0F2A3A}
  .app.light .md{color:#4A6E80}
  .app.light .auth-card{box-shadow:0 4px 24px rgba(27,174,200,0.12)}
  .app.light .gbox{background:#E8F4F8;border-color:rgba(27,174,200,0.15)}
  .app.light .gbl{color:#4A6E80}
  .app.light .theme-toggle{background:#E8F4F8;border-color:rgba(27,174,200,0.2)}
  .app.light .theme-opt{color:#4A6E80}
  .app.light .logo-name{color:#0F2A3A}
  .app.light .logo-sub{color:#6B8FA0}
  .app.light .tb-btn{color:#0F2A3A;border-color:rgba(27,174,200,0.2);background:rgba(255,255,255,0.8)}
  .app.light .snav{background:rgba(240,248,251,0.9)}
  .app.light .eic,.app.light .et{color:#0F2A3A}

    background:var(--card);border-radius:var(--r);padding:16px;border:1px solid var(--border);
    margin-bottom:11px;cursor:pointer;transition:all .2s;
    box-shadow:0 4px 20px rgba(0,0,0,0.3);
  }
  .pcard:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.4)}
  .pcard:active{transform:scale(.98)}

  /* ── SETTINGS ── */
  .set-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border)}
  .set-row:last-child{border-bottom:none}
  .set-lbl{font-weight:600;font-size:14px}
  .set-val{font-size:13px;color:var(--muted);font-weight:500}

  /* ── TOGGLE ── */
  .toggle{position:relative;width:44px;height:26px;flex-shrink:0}
  .toggle input{opacity:0;width:0;height:0;position:absolute}
  .toggle-track{
    position:absolute;inset:0;border-radius:20px;cursor:pointer;
    background:var(--card2);border:1px solid var(--border);transition:background .2s;
  }
  .toggle input:checked+.toggle-track{background:var(--teal);border-color:var(--teal)}
  .toggle-thumb{
    position:absolute;top:3px;left:3px;width:18px;height:18px;
    border-radius:50%;background:#fff;transition:transform .2s;
    box-shadow:0 1px 4px rgba(0,0,0,0.4);
  }
  .toggle input:checked~.toggle-thumb{transform:translateX(18px)}
`;

const StyleTag = () => <style>{CSS}</style>;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({msg}){if(!msg)return null;return <div className="toast">{msg}</div>;}

// ── Circular Progress Ring ────────────────────────────────────────────────────
function Ring({pct=0,size=80,stroke=6,color=TEAL}){
  const r=(size-stroke*2)/2;
  const circ=2*Math.PI*r;
  const offset=circ-(pct/100)*circ;
  return(
    <svg width={size} height={size} className="ring-svg">
      <circle className="ring-bg" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}/>
      <circle className="ring-fill" cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [data,setData]=useState(loadStore);
  const [tab,setTab]=useState("projects");
  const [active,setActive]=useState(null);
  const [pview,setPview]=useState("overview");
  const [showNew,setShowNew]=useState(false);
  const [toast,setToast]=useState("");
  const dark = data.dark !== false;

  // Auth — храним в localStorage отдельно
  const [user,setUser]=useState(()=>{
    try{const u=localStorage.getItem("th_user");return u?JSON.parse(u):null;}catch{return null;}
  });
  const login=(u)=>{localStorage.setItem("th_user",JSON.stringify(u));setUser(u);};
  const logout=()=>{localStorage.removeItem("th_user");setUser(null);};

  useEffect(()=>{saveStore(data);},[data]);

  const showToast=useCallback((msg)=>{
    setToast(msg);
    setTimeout(()=>setToast(""),2100);
  },[]);

  const updateProject=useCallback((id,fn)=>{
    setData(d=>({...d,projects:d.projects.map(p=>p.id===id?fn(p):p)}));
    setActive(prev=>prev?.id===id?fn(prev):prev);
  },[]);

  // ── Экран авторизации ──
  if(!user) return(
    <>
      <StyleTag/>
      <div className={`app ${dark?"":"light"}`}>
        <div className="bg-mesh"/>
        <AuthScreen dark={dark} onLogin={login}/>
      </div>
    </>
  );

  if(active) return(
    <>
      <StyleTag/>
      <div className={`app ${dark?"":"light"}`}>
        <div className="bg-mesh"/>
        <ProjectDetail
          project={active} view={pview} setView={setPview}
          onBack={()=>{setActive(null);setPview("overview");}}
          onUpdate={fn=>updateProject(active.id,fn)}
          showToast={showToast}
        />
        <Toast msg={toast}/>
      </div>
    </>
  );

  return(
    <>
      <StyleTag/>
      <div className={`app ${dark?"":"light"}`}>
        <div className="bg-mesh"/>
        <TopBar right={
          tab==="projects"||tab==="yarn"
            ?<button className="tb-btn" onClick={()=>setShowNew(tab==="yarn"?"yarn":true)}>＋</button>
            :null
        }/>
        {tab==="projects"&&<ProjectsList projects={data.projects} onOpen={p=>{setActive(p);setPview("overview");}} onNew={()=>setShowNew(true)}/>}
        {tab==="yarn"&&<YarnPage yarns={data.yarns} onDelete={id=>{setData(d=>({...d,yarns:d.yarns.filter(y=>y.id!==id)}));showToast("✓ Пряжа удалена");}} onAdd={()=>setShowNew("yarn")}/>}
        {tab==="counter"&&<StandaloneCounter/>}
        {tab==="calc"&&<StandaloneCalc/>}
        {tab==="settings"&&<SettingsPage data={data} user={user} onUpdate={(k,v)=>setData(d=>({...d,[k]:v}))} onClear={()=>{setData({projects:[],yarns:[],dark:data.dark});showToast("✓ Очищено");}} onLogout={()=>{haptic(10);logout();}}/>}
        <BottomNav tab={tab} setTab={t=>{haptic(5);setTab(t);}}/>
        <Toast msg={toast}/>
        {showNew===true&&<NewProjectSheet onClose={()=>setShowNew(false)} onCreate={p=>{setData(d=>({...d,projects:[p,...d.projects]}));setShowNew(false);setActive(p);showToast("✓ Проект создан");}}/>}
        {showNew==="yarn"&&<Overlay onClose={()=>setShowNew(false)}><AddYarnForm onAdd={y=>{setData(d=>({...d,yarns:[y,...d.yarns]}));setShowNew(false);showToast("✓ Пряжа добавлена");}} onCancel={()=>setShowNew(false)}/></Overlay>}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function AuthScreen({onLogin}){
  const [mode,setMode]=useState("login"); // login | register
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const validate=()=>{
    if(mode==="register"&&!form.name.trim()){setErr("Введите имя");return false;}
    if(!form.email.includes("@")){setErr("Введите корректный email");return false;}
    if(form.password.length<6){setErr("Пароль минимум 6 символов");return false;}
    return true;
  };

  const submit=()=>{
    setErr("");
    if(!validate())return;
    setLoading(true);
    // Имитация запроса — в реальном приложении здесь будет Supabase/Firebase
    setTimeout(()=>{
      setLoading(false);
      onLogin({
        name: mode==="register"?form.name:form.email.split("@")[0],
        email:form.email,
        isGuest:false,
      });
    },900);
  };

  const guest=()=>{
    onLogin({name:"Гость",email:"",isGuest:true});
  };

  return(
    <div className="auth-screen">
      {/* Логотип крупно */}
      <div className="auth-logo-wrap">
        <LogoSVG height={52}/>
        <div className="auth-tagline">Управляй проектами по вязанию</div>
      </div>

      <div className="auth-card">
        {/* Переключатель Вход / Регистрация */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode==="login"?"on":""}`} onClick={()=>{setMode("login");setErr("");}}>
            Войти
          </button>
          <button className={`auth-tab ${mode==="register"?"on":""}`} onClick={()=>{setMode("register");setErr("");}}>
            Регистрация
          </button>
        </div>

        {mode==="register"&&(
          <div className="field">
            <label className="lbl">Ваше имя</label>
            <input placeholder="Как вас зовут?" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          </div>
        )}

        <div className="field">
          <label className="lbl">Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e=>setForm({...form,email:e.target.value})}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        <div className="field" style={{marginBottom:6}}>
          <label className="lbl">Пароль</label>
          <input type="password" placeholder={mode==="register"?"Минимум 6 символов":"Ваш пароль"} value={form.password}
            onChange={e=>setForm({...form,password:e.target.value})}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        {err&&<div style={{fontSize:12,color:"var(--danger)",fontWeight:600,marginBottom:10,padding:"8px 10px",background:"rgba(255,107,107,0.1)",borderRadius:8}}>{err}</div>}

        <button className="btn bp bfull" onClick={submit} disabled={loading} style={{marginTop:4}}>
          {loading
            ?<span style={{opacity:.7}}>Подождите…</span>
            :mode==="login"?"Войти":"Создать аккаунт"
          }
        </button>

        {mode==="login"&&(
          <div style={{textAlign:"right",marginTop:10}}>
            <span style={{fontSize:12,color:"var(--teal)",cursor:"pointer",fontWeight:600}}>Забыли пароль?</span>
          </div>
        )}

        <div className="auth-divider">
          <div className="auth-divider-line"/>
          <div className="auth-divider-txt">или</div>
          <div className="auth-divider-line"/>
        </div>

        <button className="auth-guest" onClick={guest}>
          👤 Продолжить без регистрации
        </button>

        <div className="auth-hint">
          {mode==="login"
            ?"Без аккаунта данные хранятся только на этом устройстве"
            :"Регистрация позволяет синхронизировать проекты между устройствами"
          }
        </div>
      </div>
    </div>
  );
}

// ── SVG Logo (воссоздан из логотипа Твоё хобби) ──────────────────────────────
function LogoSVG({height=36}){
  return(
    <svg height={height} viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
      {/* Клубок */}
      <g transform="translate(14,2)">
        {/* Спицы */}
        <line x1="22" y1="2" x2="18" y2="22" stroke="#1B3A6B" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="28" y1="1" x2="26" y2="22" stroke="#1B3A6B" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="22" cy="2" r="2" fill="#1B3A6B"/>
        <circle cx="28" cy="1" r="2" fill="#1B3A6B"/>
        {/* Клубок — витки */}
        <ellipse cx="22" cy="28" rx="13" ry="10" stroke="#1B3A6B" strokeWidth="1.6" fill="none"/>
        <ellipse cx="22" cy="28" rx="9" ry="7" stroke="#1B3A6B" strokeWidth="1.4" fill="none" transform="rotate(-20,22,28)"/>
        <ellipse cx="22" cy="28" rx="6" ry="9" stroke="#1B3A6B" strokeWidth="1.3" fill="none" transform="rotate(35,22,28)"/>
        <ellipse cx="22" cy="28" rx="13" ry="5" stroke="#1B3A6B" strokeWidth="1.2" fill="none" transform="rotate(15,22,28)"/>
        {/* Нитка-хвостик */}
        <path d="M34 32 Q40 36 38 42" stroke="#1B3A6B" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      </g>
      {/* Текст "Твоё хобби" */}
      <text x="56" y="30" fontFamily="'Syne',sans-serif" fontWeight="800" fontSize="18" fill="var(--text)" letterSpacing="-0.3">Твоё хобби</text>
      <text x="57" y="44" fontFamily="'Inter',sans-serif" fontWeight="500" fontSize="10" fill="var(--muted)" letterSpacing="1">МЕНЕДЖЕР ПРОЕКТОВ</text>
    </svg>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({onBack,title,right}){
  return(
    <div className="topbar">
      <div className="logo">
        {onBack
          ?<>
              <button className="tb-btn" onClick={onBack} style={{marginRight:4}}>←</button>
              <div className="logo-name" style={{fontSize:15}}>{title}</div>
            </>
          :<LogoSVG height={40}/>
        }
      </div>
      {right}
    </div>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────
function BottomNav({tab,setTab}){
  const tabs=[
    {id:"projects",icon:"🧶",label:"Проекты"},
    {id:"yarn",icon:"🪢",label:"Пряжа"},
    {id:"counter",icon:"🔢",label:"Счётчик"},
    {id:"calc",icon:"📐",label:"Расчёт"},
    {id:"settings",icon:"⚙️",label:"Настройки"},
  ];
  return(
    <div className="bnav">
      {tabs.map(t=>(
        <button key={t.id} className={`ntab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
          <span className="ni">{t.icon}</span>
          {t.label}
          <div className="ntab-pip"/>
        </button>
      ))}
    </div>
  );
}

function Overlay({onClose,children}){
  return(
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="shdl"/>
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROJECTS LIST
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsList({projects,onOpen,onNew}){
  const totalRows=projects.reduce((a,p)=>(p.sections||[]).reduce((b,s)=>b+(s.count||0),a),0);
  const totalDone=projects.reduce((a,p)=>a+(p.steps||[]).filter(s=>s.done).length,0);

  return(
    <div className="page">
      {/* Stats row */}
      <div className="stat-row">
        <div className="stat-pill"><div className="stat-num">{projects.length}</div><div className="stat-lbl">Проектов</div></div>
        <div className="stat-pill"><div className="stat-num">{totalRows}</div><div className="stat-lbl">Рядов</div></div>
        <div className="stat-pill"><div className="stat-num">{totalDone}</div><div className="stat-lbl">Шагов</div></div>
      </div>

      {projects.length===0
        ?<div className="empty"><div className="eic">🧶</div><div className="et">Проектов пока нет</div><div className="ed">Создайте первый проект — нажмите ＋ выше.</div></div>
        :projects.map(p=><ProjectCard key={p.id} project={p} onOpen={()=>onOpen(p)}/>)
      }
    </div>
  );
}

function ProjectCard({project,onOpen}){
  const done=project.steps?.filter(s=>s.done).length||0;
  const total=project.steps?.length||1;
  const pct=Math.round(done/total*100);
  const [bc,bl]={
    "in-progress":["bwarn","В работе"],
    "done":["bok","Готово"],
    "queued":["bgr","В очереди"],
  }[project.status]||["bgr",project.status];

  return(
    <div className="pcard" onClick={()=>{haptic(6);onOpen();}}>
      <div className="row mb8">
        <div className="f1">
          <div className="ctit" style={{fontFamily:"'Syne',sans-serif",fontSize:17}}>{project.name}</div>
          <div className="csub">{project.type} · {project.size}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <Ring pct={pct} size={52} stroke={5}/>
          <span className={`badge ${bc}`} style={{fontSize:10}}>{bl}</span>
        </div>
      </div>
      {project.yarns?.length>0&&(
        <div className="row mt8">
          {project.yarns.slice(0,6).map(y=>(
            <div key={y.id} style={{width:14,height:14,borderRadius:"50%",background:y.color,border:"1.5px solid rgba(255,255,255,0.1)",boxShadow:`0 0 6px ${y.color}50`}} title={y.colorName}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROJECT DETAIL
// ══════════════════════════════════════════════════════════════════════════════
function ProjectDetail({project,view,setView,onBack,onUpdate,showToast}){
  const tabs=[{id:"overview",label:"📋 Обзор"},{id:"counter",label:"🔢 Счётчик"},{id:"steps",label:"📖 Шаги"},{id:"calc",label:"📐 Расчёт"},{id:"timeline",label:"📸 Журнал"}];
  return(
    <div>
      <TopBar onBack={onBack} title={project.name}/>
      <div className="snav">
        {tabs.map(t=><button key={t.id} className={`stab ${view===t.id?"on":""}`} onClick={()=>setView(t.id)}>{t.label}</button>)}
      </div>
      {view==="overview"&&<OverviewTab project={project} onUpdate={onUpdate} showToast={showToast}/>}
      {view==="counter"&&<CounterTab project={project} onUpdate={onUpdate} showToast={showToast}/>}
      {view==="steps"&&<StepsTab project={project} onUpdate={onUpdate} showToast={showToast}/>}
      {view==="calc"&&<CalcTab project={project} onUpdate={onUpdate} showToast={showToast}/>}
      {view==="timeline"&&<TimelineTab project={project} onUpdate={onUpdate} showToast={showToast}/>}
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function OverviewTab({project,onUpdate,showToast}){
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({name:project.name,type:project.type,size:project.size,notes:project.notes||"",status:project.status});
  const done=project.steps?.filter(s=>s.done).length||0;
  const total=project.steps?.length||1;
  const pct=Math.round(done/total*100);
  const save=()=>{onUpdate(p=>({...p,...form}));setEditing(false);showToast("✓ Сохранено");};

  if(editing) return(
    <div className="page">
      <div className="sh">Редактировать</div>
      <div className="card">
        <div className="field"><label className="lbl">Название</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div className="grid2">
          <div className="field"><label className="lbl">Тип</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{PROJ_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="field"><label className="lbl">Размер</label><input value={form.size} onChange={e=>setForm({...form,size:e.target.value})}/></div>
        </div>
        <div className="field"><label className="lbl">Статус</label>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
            <option value="queued">В очереди</option><option value="in-progress">В работе</option><option value="done">Готово</option>
          </select>
        </div>
        <div className="field"><label className="lbl">Заметки</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        <div className="row"><button className="btn bp f1" onClick={save}>Сохранить</button><button className="btn bl" onClick={()=>setEditing(false)}>Отмена</button></div>
      </div>
    </div>
  );

  return(
    <div className="page">
      {/* Hero */}
      <div className="hero-card">
        <div className="hero-label">Активный проект</div>
        <div className="hero-name">{project.name}</div>
        <div className="hero-type">{project.type} · {project.size}</div>
        <div className="hero-row">
          <div className="hero-ring-wrap">
            <Ring pct={pct} size={76} stroke={7}/>
          </div>
          <div className="hero-stats">
            <div className="hero-pct">{pct}%</div>
            <div className="hero-done">{done} из {total} шагов</div>
          </div>
        </div>
        <div className="hero-bar"><div className="hero-fill" style={{width:`${pct}%`}}/></div>
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <button className="btn bl bsm" onClick={()=>setEditing(true)}>✏️ Редактировать</button>
      </div>

      <div className="card">
        <div className="ctit mb8">Параметры</div>
        <div className="ir"><span className="irk">Тип</span><span className="irv">{project.type}</span></div>
        <div className="ir"><span className="irk">Размер</span><span className="irv">{project.size}</span></div>
        <div className="ir"><span className="irk">Статус</span><span className="irv">{{queued:"В очереди","in-progress":"В работе",done:"Готово"}[project.status]}</span></div>
        {project.notes&&<div className="ir"><span className="irk">Заметки</span><span className="irv" style={{fontSize:12}}>{project.notes}</span></div>}
      </div>

      {project.gauge&&(
        <div className="card">
          <div className="ctit mb8">Раппорт</div>
          <div className="grid2">
            <div className="gbox"><div className="gbn">{project.gauge.stitches}</div><div className="gbl">петель / {project.gauge.size} см</div></div>
            <div className="gbox"><div className="gbn">{project.gauge.rows}</div><div className="gbl">рядов / {project.gauge.size} см</div></div>
          </div>
        </div>
      )}

      {project.yarns?.length>0&&(
        <div className="card">
          <div className="ctit mb8">Пряжа</div>
          {project.yarns.map(y=>(
            <div key={y.id} className="yrow">
              <div className="ysw" style={{background:y.color,boxShadow:`0 0 14px ${y.color}60`}}/>
              <div><div className="yn">{y.name}</div><div className="yd">{y.colorName} · {y.weight}г / {y.length}м · {y.category}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── COUNTER (star feature) ────────────────────────────────────────────────────
function CounterTab({project,onUpdate,showToast}){
  const sections=project.sections||[];
  const [activeSec,setActiveSec]=useState(sections[0]?.id||null);
  const [showAdd,setShowAdd]=useState(false);
  const [newName,setNewName]=useState("");
  const [newGoal,setNewGoal]=useState("");
  const [bumping,setBumping]=useState(false);
  const [isMilestone,setIsMilestone]=useState(false);

  const sec=sections.find(s=>s.id===activeSec);
  const pct=sec?.goal?Math.min(100,Math.round((sec.count||0)/sec.goal*100)):null;

  const delta=(d)=>{
    haptic(d>0?8:4);
    const newCount=Math.max(0,(sec?.count||0)+d);
    const wasMilestone=d>0&&newCount>0&&newCount%10===0;
    onUpdate(p=>({...p,sections:p.sections.map(s=>s.id===activeSec?{...s,count:newCount}:s)}));
    // bump animation
    setBumping(true); setTimeout(()=>setBumping(false),200);
    if(wasMilestone){
      setIsMilestone(true); setTimeout(()=>setIsMilestone(false),600);
      fireConfetti([TEAL,"#fff",GOLD]);
      showToast(`🎉 ${newCount} рядов!`);
    }
  };

  const addSec=()=>{
    if(!newName.trim())return;
    const ns={id:`sec${Date.now()}`,name:newName.trim(),count:0,goal:+newGoal||null};
    onUpdate(p=>({...p,sections:[...(p.sections||[]),ns]}));
    setActiveSec(ns.id); setNewName(""); setNewGoal(""); setShowAdd(false);
  };

  return(
    <div className="page">
      <div className="sh">Счётчик <span>рядов</span></div>

      <div className="chips">
        {sections.map(s=>(
          <span key={s.id} className={`chip ${s.id===activeSec?"on":""}`} onClick={()=>{haptic(5);setActiveSec(s.id);}}>
            {s.name}{s.goal?` ${s.count||0}/${s.goal}`:""}
          </span>
        ))}
        <span className="chip" onClick={()=>setShowAdd(true)}>＋</span>
      </div>

      {showAdd&&(
        <div className="card mb12">
          <div className="field"><label className="lbl">Название части</label>
            <input placeholder="Перед, рукав…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSec()}/></div>
          <div className="field"><label className="lbl">Цель (рядов, необязательно)</label>
            <input type="number" placeholder="80" value={newGoal} onChange={e=>setNewGoal(e.target.value)}/></div>
          <div className="row"><button className="btn bp f1 bsm" onClick={addSec}>Добавить</button><button className="btn bl bsm" onClick={()=>setShowAdd(false)}>Отмена</button></div>
        </div>
      )}

      {sec?(
        <div className="card-glow">
          <div className="counter-wrap">
            <div className="counter-section-name">{sec.name}</div>
            {sec.goal&&<div className="counter-goal">{sec.count||0} из {sec.goal} рядов</div>}

            {sec.goal&&(
              <div style={{marginBottom:8}}>
                <Ring pct={pct} size={100} stroke={8} color={pct>=100?GOLD:TEAL}/>
              </div>
            )}

            <div className={`counter-num ${bumping?"bump":""} ${isMilestone?"milestone":""}`}>
              {sec.count||0}
            </div>

            <div className="counter-controls">
              <button className="cbtn cbtn-minus" onClick={()=>delta(-1)}>−</button>
              <button className="cbtn cbtn-plus" onClick={()=>delta(1)}>+</button>
            </div>

            <div className="counter-extras">
              <button className="btn bl bsm" onClick={()=>delta(-10)}>−10</button>
              <button className="btn bl bsm" onClick={()=>delta(10)}>+10</button>
              <button className="btn bd bsm" onClick={()=>{haptic(15);onUpdate(p=>({...p,sections:p.sections.map(s=>s.id===activeSec?{...s,count:0}:s)}));}}>Сброс</button>
            </div>
          </div>
        </div>
      ):(
        <div className="empty"><div className="eic">🔢</div><div className="et">Выберите часть</div></div>
      )}

      {sections.length>0&&(
        <div className="card mt12">
          <div className="ctit mb8">Все части</div>
          {sections.map(s=>(
            <div key={s.id} className="ir">
              <span className="irk">{s.name}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {s.goal&&<div style={{fontSize:11,color:"var(--muted)"}}>{Math.round((s.count||0)/s.goal*100)}%</div>}
                <span className="irv" style={{color:"var(--teal)"}}>{s.count||0}{s.goal?`/${s.goal}`:""}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STEPS (with swipe gesture) ────────────────────────────────────────────────
function StepsTab({project,onUpdate,showToast}){
  const steps=project.steps||[];
  const [showAdd,setShowAdd]=useState(false);
  const [newStep,setNewStep]=useState("");
  const firstUndone=steps.findIndex(s=>!s.done);

  const toggle=(id)=>{
    haptic(10);
    onUpdate(p=>({...p,steps:p.steps.map(s=>s.id===id?{...s,done:!s.done}:s)}));
  };

  const addStep=()=>{
    if(!newStep.trim())return;
    const ns={id:`s${Date.now()}`,text:newStep.trim(),done:false};
    onUpdate(p=>({...p,steps:[...(p.steps||[]),ns]}));
    setNewStep(""); setShowAdd(false); showToast("✓ Шаг добавлен");
  };

  const done=steps.filter(s=>s.done).length;
  const pct=steps.length?Math.round(done/steps.length*100):0;

  return(
    <div className="page">
      <div className="sh">Инструкция <span>по шагам</span></div>

      {steps.length>0&&(
        <div className="card mb12">
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,marginBottom:7,color:"var(--muted)"}}>
            <span>Прогресс</span>
            <span style={{color:"var(--teal)"}}>{done}/{steps.length} · {pct}%</span>
          </div>
          <div className="ptr"><div className="pfi" style={{width:`${pct}%`}}/></div>
          <div style={{textAlign:"right",fontSize:11,color:"var(--muted)",marginTop:4,fontWeight:500}}>
            ← свайп вправо для выполнения
          </div>
        </div>
      )}

      {showAdd&&(
        <div className="card mb12">
          <textarea placeholder="Опишите шаг…" value={newStep} onChange={e=>setNewStep(e.target.value)} style={{marginBottom:10,minHeight:70}}/>
          <div className="row">
            <button className="btn bp f1 bsm" onClick={addStep}>Добавить</button>
            <button className="btn bl bsm" onClick={()=>setShowAdd(false)}>Отмена</button>
          </div>
        </div>
      )}

      <div className="card">
        {steps.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:13}}>Шагов нет — добавьте первый.</div>}
        {steps.map((s,i)=>(
          <SwipeableStep key={s.id} step={s} index={i} isActive={i===firstUndone} onToggle={()=>toggle(s.id)}/>
        ))}
      </div>

      <button className="btn bg bfull mt8" onClick={()=>setShowAdd(true)}>＋ Добавить шаг</button>
    </div>
  );
}

function SwipeableStep({step,index,isActive,onToggle}){
  const ref=useRef(null);
  const startX=useRef(0);
  const [dx,setDx]=useState(0);
  const [swiped,setSwiped]=useState(false);

  const onTouchStart=(e)=>{startX.current=e.touches[0].clientX;};
  const onTouchMove=(e)=>{
    const d=e.touches[0].clientX-startX.current;
    if(d>0)setDx(Math.min(d,100));
  };
  const onTouchEnd=()=>{
    if(dx>70&&!swiped){setSwiped(true);setTimeout(()=>{onToggle();setDx(0);setSwiped(false);},150);}
    else setDx(0);
  };

  const swipePct=Math.min(dx/80,1);

  return(
    <div
      ref={ref}
      className={`srow ${step.done?"done":isActive?"act":""}`}
      style={{transform:`translateX(${dx}px)`,transition:dx===0?"transform .2s":"none",
        background:dx>20?`rgba(74,222,128,${swipePct*0.12})`:"",borderRadius:dx>20?12:0}}
      onClick={dx===0?onToggle:undefined}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      <div className="snum">{step.done?"✓":index+1}</div>
      <div className="stxt f1">{step.text}</div>
      {dx>30&&<div style={{position:"absolute",right:10,color:"var(--ok)",fontSize:20,opacity:swipePct}}>✓</div>}
    </div>
  );
}

// ── CALC ──────────────────────────────────────────────────────────────────────
function CalcTab({project,onUpdate,showToast}){
  const [gauge,setGauge]=useState(project.gauge||{stitches:22,rows:30,size:10});
  const [dim,setDim]=useState(project.dimensions||{width:54,length:66});
  const [density,setDensity]=useState(200);
  const [margin,setMargin]=useState(project.safetyMargin??10);

  const stPcm=gauge.stitches/gauge.size;
  const rowPcm=gauge.rows/gauge.size;
  const totalSt=Math.round(stPcm*dim.width*rowPcm*dim.length);
  const mBase=Math.round(totalSt*0.003);
  const mNeeded=Math.round(mBase*(1+margin/100));
  const gNeeded=Math.round(mNeeded/(density/100));
  const avail=(project.yarns||[]).reduce((a,y)=>a+(y.length||0),0);
  const diff=avail-mNeeded;

  return(
    <div className="page">
      <div className="sh">Расчёт <span>пряжи</span></div>
      <div className="card">
        <div className="ctit mb8">Раппорт</div>
        <div className="grid2">
          <div className="field"><label className="lbl">Петли</label><input type="number" value={gauge.stitches} onChange={e=>setGauge({...gauge,stitches:+e.target.value})}/></div>
          <div className="field"><label className="lbl">Ряды</label><input type="number" value={gauge.rows} onChange={e=>setGauge({...gauge,rows:+e.target.value})}/></div>
        </div>
        <div className="field"><label className="lbl">Образец (см)</label><input type="number" value={gauge.size} onChange={e=>setGauge({...gauge,size:+e.target.value})}/></div>
      </div>
      <div className="card">
        <div className="ctit mb8">Размеры изделия (см)</div>
        <div className="grid2">
          <div className="field"><label className="lbl">Ширина</label><input type="number" value={dim.width} onChange={e=>setDim({...dim,width:+e.target.value})}/></div>
          <div className="field"><label className="lbl">Длина</label><input type="number" value={dim.length} onChange={e=>setDim({...dim,length:+e.target.value})}/></div>
        </div>
      </div>
      <div className="card">
        <div className="grid2">
          <div className="field"><label className="lbl">м / 100г</label><input type="number" value={density} onChange={e=>setDensity(+e.target.value)}/></div>
          <div className="field"><label className="lbl">Запас %</label><input type="number" value={margin} onChange={e=>setMargin(+e.target.value)}/></div>
        </div>
      </div>
      <div className="cr">
        <div className="crr"><span>Петель итого</span><span className="crv">{totalSt.toLocaleString("ru")}</span></div>
        <div className="crr"><span>Базовый расход</span><span className="crv">{mBase} м</span></div>
        <div className="crr"><span>+ запас {margin}%</span><span className="crv">{mNeeded} м</span></div>
        <div className="crr"><span>Примерно в граммах</span><span className="crv">≈ {gNeeded} г</span></div>
        <div className="crd"/>
        <div className="crr"><span>Пряжа в проекте</span><span className="crv">{avail} м</span></div>
        <div className="crr crb">
          <span>{diff>=0?"Остаток":"Нехватка"}</span>
          <span className={diff>=0?"surplus":"shortage"}>{Math.abs(diff)} м {diff>=0?"✓":"⚠️"}</span>
        </div>
      </div>
      <button className="btn bg bfull mt12" onClick={()=>{onUpdate(p=>({...p,gauge,dimensions:dim,safetyMargin:margin}));showToast("✓ Раппорт сохранён");}}>💾 Сохранить</button>
    </div>
  );
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
function TimelineTab({project,onUpdate,showToast}){
  const [note,setNote]=useState("");
  const [show,setShow]=useState(false);
  const tl=project.timeline||[];

  const add=()=>{
    if(!note.trim())return;
    const date=new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"short"});
    onUpdate(p=>({...p,timeline:[...(p.timeline||[]),{id:`t${Date.now()}`,date,note:note.trim()}]}));
    setNote(""); setShow(false); showToast("✓ Запись добавлена");
  };

  return(
    <div className="page">
      <div className="sh">Журнал <span>прогресса</span></div>
      <button className="btn bp bfull mb12" onClick={()=>setShow(true)}>📝 Добавить запись</button>
      {show&&(
        <div className="card mb12">
          <textarea placeholder="Что сделали сегодня?" value={note} onChange={e=>setNote(e.target.value)} style={{marginBottom:10,minHeight:90}}/>
          <div className="row">
            <button className="btn bp f1 bsm" onClick={add}>Добавить</button>
            <button className="btn bl bsm" onClick={()=>setShow(false)}>Отмена</button>
          </div>
        </div>
      )}
      {tl.length===0
        ?<div className="empty"><div className="eic">📸</div><div className="et">Журнал пустой</div><div className="ed">Добавляйте записи о прогрессе после каждой сессии.</div></div>
        :<div className="tlw">{[...tl].reverse().map(e=>(<div key={e.id} className="tli"><div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div className="tld"/></div><div><div className="tldate">{e.date}</div><div className="tlnote">{e.note}</div></div></div>))}</div>
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  YARN PAGE
// ══════════════════════════════════════════════════════════════════════════════
function YarnPage({yarns,onDelete,onAdd}){
  return(
    <div className="page">
      <div className="sh">Мой <span>запас пряжи</span></div>
      {yarns.length===0
        ?<div className="empty"><div className="eic">🪢</div><div className="et">Запас пуст</div><div className="ed">Добавьте пряжу чтобы отслеживать запасы и использовать в расчётах.</div><button className="btn bp mt12" style={{margin:"12px auto 0",display:"flex"}} onClick={onAdd}>＋ Добавить пряжу</button></div>
        :yarns.map(y=>(
          <div key={y.id} className="yrow">
            <div className="ysw" style={{background:y.color,boxShadow:`0 0 16px ${y.color}50`}}/>
            <div className="f1"><div className="yn">{y.name}</div><div className="yd">{y.colorName} · {y.weight}г / {y.length}м · {y.category}</div></div>
            <button className="btn bd bsm" onClick={()=>onDelete(y.id)}>✕</button>
          </div>
        ))
      }
    </div>
  );
}

function AddYarnForm({onAdd,onCancel}){
  const [f,setF]=useState({name:"",colorName:"",color:YARN_COLORS[0],weight:"",length:"",category:"DK"});
  return(
    <>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,marginBottom:14}}>Добавить пряжу</div>
      <div className="field"><label className="lbl">Название *</label><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Drops Lima…"/></div>
      <div className="field"><label className="lbl">Цвет название</label><input value={f.colorName} onChange={e=>setF({...f,colorName:e.target.value})} placeholder="Морская волна"/></div>
      <div className="field"><label className="lbl">Цвет</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:4}}>
          {YARN_COLORS.map(c=>(
            <div key={c} onClick={()=>setF({...f,color:c})} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:f.color===c?"3px solid #fff":"2px solid rgba(255,255,255,0.1)",boxShadow:f.color===c?`0 0 12px ${c}80`:"none",transition:"all .15s"}}/>
          ))}
        </div>
      </div>
      <div className="grid2">
        <div className="field"><label className="lbl">Вес (г) *</label><input type="number" value={f.weight} onChange={e=>setF({...f,weight:e.target.value})} placeholder="100"/></div>
        <div className="field"><label className="lbl">Длина (м)</label><input type="number" value={f.length} onChange={e=>setF({...f,length:e.target.value})} placeholder="200"/></div>
      </div>
      <div className="field"><label className="lbl">Категория</label><select value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{YARN_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="row mt8">
        <button className="btn bp f1" onClick={()=>{if(!f.name||!f.weight)return;onAdd({...f,id:`y${Date.now()}`,weight:+f.weight,length:+f.length||0});}}>Добавить</button>
        <button className="btn bl" onClick={onCancel}>Отмена</button>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STANDALONE COUNTER (independent, no project needed)
// ══════════════════════════════════════════════════════════════════════════════
function StandaloneCounter(){
  const SC_KEY="th_standalone_counter";
  const loadSC=()=>{try{const r=localStorage.getItem(SC_KEY);if(r)return JSON.parse(r);}catch{}return{counters:[{id:"c1",name:"Счётчик",count:0,goal:""}],active:"c1"};};
  const [sc,setSC]=useState(loadSC);
  const [bumping,setBumping]=useState(false);
  const [isMilestone,setIsMilestone]=useState(false);
  const [editGoal,setEditGoal]=useState(false);

  useEffect(()=>{try{localStorage.setItem(SC_KEY,JSON.stringify(sc));}catch{}},[sc]);

  const cur=sc.counters.find(c=>c.id===sc.active)||sc.counters[0];
  const pct=cur?.goal?Math.min(100,Math.round((cur.count||0)/+cur.goal*100)):null;

  const updateCur=(fn)=>{setSC(s=>({...s,counters:s.counters.map(c=>c.id===s.active?fn(c):c)}));};

  const delta=(d)=>{
    haptic(d>0?8:4);
    const newCount=Math.max(0,(cur?.count||0)+d);
    const wasMilestone=d>0&&newCount>0&&newCount%10===0;
    updateCur(c=>({...c,count:newCount}));
    setBumping(true);setTimeout(()=>setBumping(false),200);
    if(wasMilestone){setIsMilestone(true);setTimeout(()=>setIsMilestone(false),600);fireConfetti();}
  };

  const addCounter=()=>{
    const id=`c${Date.now()}`;
    const name=`Счётчик ${sc.counters.length+1}`;
    setSC(s=>({...s,counters:[...s.counters,{id,name,count:0,goal:""}],active:id}));
  };

  const removeCounter=(id)=>{
    if(sc.counters.length===1)return;
    const remaining=sc.counters.filter(c=>c.id!==id);
    setSC(s=>({...s,counters:remaining,active:s.active===id?remaining[0].id:s.active}));
  };

  return(
    <div className="sc-wrap">
      {/* Counter chips */}
      <div className="chips" style={{justifyContent:"center"}}>
        {sc.counters.map(c=>(
          <span key={c.id} className={`chip ${c.id===sc.active?"on":""}`}
            onClick={()=>{haptic(5);setSC(s=>({...s,active:c.id}));}}>
            {c.name}
          </span>
        ))}
        <span className="chip" onClick={addCounter} title="Новый счётчик">＋</span>
      </div>

      {/* Editable name */}
      <div className="sc-name-row">
        <input
          className="sc-name"
          value={cur?.name||""}
          onChange={e=>updateCur(c=>({...c,name:e.target.value}))}
          placeholder="Название"
        />
        {sc.counters.length>1&&(
          <button onClick={()=>removeCounter(sc.active)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:16}}>🗑</button>
        )}
      </div>

      {/* Goal */}
      <div className="sc-goal-row">
        <span style={{fontSize:12,color:"var(--muted)",fontWeight:500}}>Цель:</span>
        <input
          className="sc-goal-input"
          type="number"
          placeholder="—"
          value={cur?.goal||""}
          onChange={e=>updateCur(c=>({...c,goal:e.target.value}))}
        />
        <span style={{fontSize:12,color:"var(--muted)",fontWeight:500}}>рядов</span>
      </div>

      {/* Ring if goal set */}
      {cur?.goal&&pct!==null&&(
        <div style={{marginBottom:4}}>
          <Ring pct={pct} size={110} stroke={9} color={pct>=100?GOLD:TEAL}/>
        </div>
      )}

      {/* Big number */}
      <div className={`counter-num ${bumping?"bump":""} ${isMilestone?"milestone":""}`}>
        {cur?.count||0}
      </div>

      {/* Controls */}
      <div className="counter-controls">
        <button className="cbtn cbtn-minus" onClick={()=>delta(-1)}>−</button>
        <button className="cbtn cbtn-plus" onClick={()=>delta(1)}>+</button>
      </div>

      <div className="counter-extras">
        <button className="btn bl bsm" onClick={()=>delta(-10)}>−10</button>
        <button className="btn bl bsm" onClick={()=>delta(10)}>+10</button>
        <button className="btn bd bsm" onClick={()=>{haptic(20);updateCur(c=>({...c,count:0}));}}>Сброс</button>
      </div>

      {/* All counters summary */}
      {sc.counters.length>1&&(
        <div className="sc-history">
          <div className="sc-hist-title">Все счётчики</div>
          {sc.counters.map(c=>(
            <div key={c.id} className="sc-hist-item">
              <span className="sc-hist-name">{c.name}</span>
              <span className="sc-hist-val">{c.count}{c.goal?`/${c.goal}`:""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STANDALONE CALC
// ══════════════════════════════════════════════════════════════════════════════
function StandaloneCalc(){
  const [g,setG]=useState({stitches:20,rows:28,size:10});
  const [d,setD]=useState({width:50,length:60});
  const [density,setDensity]=useState(200);
  const [margin,setMargin]=useState(10);
  const [avail,setAvail]=useState("");

  const stPcm=g.stitches/g.size; const rPcm=g.rows/g.size;
  const totalSt=Math.round(stPcm*d.width*rPcm*d.length);
  const mBase=Math.round(totalSt*0.003);
  const mNeeded=Math.round(mBase*(1+margin/100));
  const gNeeded=Math.round(mNeeded/(density/100));
  const av=+avail||0; const diff=av-mNeeded;

  return(
    <div className="page">
      <div className="sh">Быстрый <span>расчёт</span></div>
      <div className="card">
        <div className="ctit mb8">Раппорт</div>
        <div className="grid2">
          <div className="field"><label className="lbl">Петли</label><input type="number" value={g.stitches} onChange={e=>setG({...g,stitches:+e.target.value})}/></div>
          <div className="field"><label className="lbl">Ряды</label><input type="number" value={g.rows} onChange={e=>setG({...g,rows:+e.target.value})}/></div>
        </div>
        <div className="field"><label className="lbl">Образец (см)</label><input type="number" value={g.size} onChange={e=>setG({...g,size:+e.target.value})}/></div>
      </div>
      <div className="card">
        <div className="ctit mb8">Размеры (см)</div>
        <div className="grid2">
          <div className="field"><label className="lbl">Ширина</label><input type="number" value={d.width} onChange={e=>setD({...d,width:+e.target.value})}/></div>
          <div className="field"><label className="lbl">Длина</label><input type="number" value={d.length} onChange={e=>setD({...d,length:+e.target.value})}/></div>
        </div>
      </div>
      <div className="card">
        <div className="grid2">
          <div className="field"><label className="lbl">м / 100г</label><input type="number" value={density} onChange={e=>setDensity(+e.target.value)}/></div>
          <div className="field"><label className="lbl">Запас %</label><input type="number" value={margin} onChange={e=>setMargin(+e.target.value)}/></div>
        </div>
        <div className="field"><label className="lbl">Есть в наличии (м)</label><input type="number" value={avail} onChange={e=>setAvail(e.target.value)} placeholder="0"/></div>
      </div>
      <div className="cr">
        <div className="crr"><span>Петель итого</span><span className="crv">{totalSt.toLocaleString("ru")}</span></div>
        <div className="crr"><span>Нужно метров</span><span className="crv">{mNeeded} м</span></div>
        <div className="crr"><span>Примерно граммов</span><span className="crv">≈ {gNeeded} г</span></div>
        {av>0&&<><div className="crd"/><div className="crr crb"><span>{diff>=0?"Остаток":"Нехватка"}</span><span className={diff>=0?"surplus":"shortage"}>{Math.abs(diff)} м {diff>=0?"✓":"⚠️"}</span></div></>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
function SettingsPage({data,user,onUpdate,onClear,onLogout}){
  const [confirm,setConfirm]=useState(false);
  const dark=data.dark!==false;

  return(
    <div className="page">
      <div className="sh">⚙️ <span>Настройки</span></div>

      {/* Theme switcher */}
      <div className="card">
        <div className="ctit mb8">🎨 Оформление</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:14,fontWeight:600,color:"var(--muted2)"}}>Тема</span>
          <div className="theme-toggle">
            <button className={`theme-opt ${dark?"on":""}`} onClick={()=>onUpdate("dark",true)}>
              🌙 Тёмная
            </button>
            <button className={`theme-opt ${!dark?"on":""}`} onClick={()=>onUpdate("dark",false)}>
              ☀️ Светлая
            </button>
          </div>
        </div>
      </div>

      {/* Аккаунт */}
      <div className="card">
        <div className="ctit mb8">👤 Аккаунт</div>
        {user?.isGuest?(
          <>
            <div className="ir"><span className="irk">Режим</span><span className="irv">Гость</span></div>
            <div className="ir" style={{borderBottom:"none"}}>
              <span style={{fontSize:12,color:"var(--muted)",fontWeight:500,lineHeight:1.5}}>Данные хранятся только на этом устройстве. Зарегистрируйтесь для синхронизации.</span>
            </div>
            <button className="btn bp bfull bsm mt8" onClick={onLogout}>Войти или зарегистрироваться</button>
          </>
        ):(
          <>
            <div className="ir"><span className="irk">Имя</span><span className="irv">{user?.name||"—"}</span></div>
            <div className="ir"><span className="irk">Email</span><span className="irv" style={{fontSize:12}}>{user?.email||"—"}</span></div>
            <div className="ir" style={{borderBottom:"none",paddingTop:12}}>
              <button className="btn bd bsm" onClick={onLogout}>Выйти из аккаунта</button>
            </div>
          </>
        )}
      </div>

      <div className="field"><label className="lbl">Имя в профиле</label><input value={data.userName||user?.name||""} onChange={e=>onUpdate("userName",e.target.value)} placeholder="Как вас зовут?"/></div>

      <div className="card">
        <div className="ctit mb8">📊 Статистика</div>
        <div className="ir"><span className="irk">Проектов</span><span className="irv">{data.projects?.length||0}</span></div>
        <div className="ir"><span className="irk">Мотков пряжи</span><span className="irv">{data.yarns?.length||0}</span></div>
        <div className="ir" style={{borderBottom:"none",paddingTop:12}}>
          {!confirm
            ?<button className="btn bd bsm" onClick={()=>setConfirm(true)}>🗑 Очистить все данные</button>
            :<div className="row"><span style={{fontSize:12,fontWeight:600,color:"var(--danger)"}}>Уверены?</span><button className="btn bd bsm" onClick={()=>{onClear();setConfirm(false);}}>Да, удалить</button><button className="btn bl bsm" onClick={()=>setConfirm(false)}>Нет</button></div>
          }
        </div>
      </div>

      <div className="card">
        <div className="ctit mb8">ℹ️ О приложении</div>
        <div className="ir"><span className="irk">Версия</span><span className="irv">0.2.0</span></div>
        <div className="ir"><span className="irk">Сайт</span><a href="https://tvoe-hobby.ru" target="_blank" rel="noreferrer" style={{fontWeight:700,fontSize:13,color:"var(--teal)",textDecoration:"none"}}>tvoe-hobby.ru ↗</a></div>
        <div className="ir" style={{borderBottom:"none"}}><span className="irk">© Твоё хобби</span><span className="irv" style={{fontSize:12}}>Все права защищены</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  NEW PROJECT SHEET
// ══════════════════════════════════════════════════════════════════════════════
function NewProjectSheet({onClose,onCreate}){
  const [mode,setMode]=useState(null);
  const [loading,setLoading]=useState(false);
  const [textIn,setTextIn]=useState("");
  const [urlIn,setUrlIn]=useState("");
  const [form,setForm]=useState({name:"",type:"Свитер",size:"M",notes:"",gauge:{stitches:20,rows:28,size:10},dimensions:{width:50,length:60},status:"queued"});

  const callAI=async(prompt)=>{
    setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`Ты помощник вязальщицы. Извлеки параметры из описания схемы и верни ТОЛЬКО JSON без markdown: name, type (Свитер/Кардиган/Шапка/Шарф/Шаль/Носки/Варежки/Плед/Другое), size, gauge_stitches, gauge_rows, gauge_size_cm, width_cm, length_cm, yarn_name, yarn_weight_g, yarn_length_m, yarn_category (DK/Ворстед/Аран/Тонкая/Спорт), notes. null для неизвестных.`,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"{}";
      const p=JSON.parse(text.replace(/```json?|```/g,"").trim());
      setForm(f=>({...f,name:p.name||f.name,type:p.type||f.type,size:p.size||f.size,notes:p.notes||f.notes,gauge:{stitches:p.gauge_stitches||20,rows:p.gauge_rows||28,size:p.gauge_size_cm||10},dimensions:{width:p.width_cm||50,length:p.length_cm||60},_yarn:p.yarn_name?{id:`y${Date.now()}`,name:p.yarn_name,colorName:"",color:YARN_COLORS[0],weight:p.yarn_weight_g||100,length:p.yarn_length_m||200,category:p.yarn_category||"DK"}:null}));
      setMode("review");
    }catch{setMode("review");}
    setLoading(false);
  };

  const build=(f)=>({id:`p${Date.now()}`,...f,yarns:f._yarn?[f._yarn]:[],steps:[],sections:[{id:`sa${Date.now()}`,name:"Перед",count:0,goal:null},{id:`sb${Date.now()}`,name:"Спинка",count:0,goal:null}],timeline:[],safetyMargin:10,createdAt:new Date().toISOString().split("T")[0]});

  return(
    <Overlay onClose={onClose}>
      {!mode&&(
        <>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,marginBottom:14}}>Новый проект</div>
          <div style={{height:2,background:"linear-gradient(90deg,var(--teal),var(--navy))",borderRadius:2,marginBottom:16}}/>
          <div className="mcard" onClick={()=>setMode("manual")}><div style={{fontSize:26,marginBottom:5}}>✏️</div><div className="mt">С нуля</div><div className="md">Заполню все поля вручную</div></div>
          <div className="mcard" onClick={()=>setMode("text")}><div className="row mb8" style={{gap:8}}><span style={{fontSize:24}}>📋</span><span className="ai-tag">✦ ИИ</span></div><div className="mt">Вставить текст схемы</div><div className="md">ИИ автоматически извлечёт все параметры</div></div>
          <div className="mcard" onClick={()=>setMode("url")}><div className="row mb8" style={{gap:8}}><span style={{fontSize:24}}>🔗</span><span className="ai-tag">✦ ИИ</span></div><div className="mt">Импорт по ссылке</div><div className="md">Ravelry, Etsy, блог — ИИ разберёт страницу</div></div>
          <button className="btn bl bfull mt8" onClick={onClose}>Отмена</button>
        </>
      )}
      {(mode==="manual"||mode==="review")&&<ManualForm form={form} setForm={setForm} isAI={mode==="review"} onCreate={()=>onCreate(build(form))} onBack={()=>setMode(null)}/>}
      {mode==="text"&&(
        <>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginBottom:10}}>Вставьте текст схемы</div>
          <textarea placeholder="Вставьте описание схемы…" value={textIn} onChange={e=>setTextIn(e.target.value)} style={{minHeight:140,marginBottom:10}}/>
          {loading&&<div className="loading mb8">✦ Анализирую схему…</div>}
          {!loading&&<div className="row"><button className="btn bp f1" onClick={()=>callAI(`Схема вязания:\n\n${textIn}`)}>✦ Извлечь данные</button><button className="btn bl" onClick={()=>setMode(null)}>Назад</button></div>}
        </>
      )}
      {mode==="url"&&(
        <>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginBottom:10}}>Ссылка на схему</div>
          <input placeholder="https://www.ravelry.com/patterns/…" value={urlIn} onChange={e=>setUrlIn(e.target.value)} style={{marginBottom:10}}/>
          {loading&&<div className="loading mb8">✦ Загружаю данные…</div>}
          {!loading&&<div className="row"><button className="btn bp f1" onClick={()=>callAI(`Извлеки параметры схемы по ссылке: ${urlIn}`)}>✦ Импортировать</button><button className="btn bl" onClick={()=>setMode(null)}>Назад</button></div>}
        </>
      )}
    </Overlay>
  );
}

function ManualForm({form,setForm,onCreate,onBack,isAI}){
  const g=form.gauge||{stitches:20,rows:28,size:10};
  const d=form.dimensions||{width:50,length:60};
  return(
    <>
      {isAI&&<div style={{background:"rgba(27,174,200,0.1)",border:"1px solid rgba(27,174,200,0.2)",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:600,color:"var(--teal)",marginBottom:12}}>✦ ИИ заполнил поля — проверьте и отредактируйте</div>}
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginBottom:14}}>{isAI?"Проверить и создать":"Новый проект"}</div>
      <div className="field"><label className="lbl">Название *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Норвежский свитер"/></div>
      <div className="grid2">
        <div className="field"><label className="lbl">Тип</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{PROJ_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="field"><label className="lbl">Размер</label><input value={form.size} onChange={e=>setForm({...form,size:e.target.value})} placeholder="M / 46"/></div>
      </div>
      <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Раппорт</div>
      <div className="grid2">
        <div className="field"><label className="lbl">Петли</label><input type="number" value={g.stitches} onChange={e=>setForm({...form,gauge:{...g,stitches:+e.target.value}})}/></div>
        <div className="field"><label className="lbl">Ряды</label><input type="number" value={g.rows} onChange={e=>setForm({...form,gauge:{...g,rows:+e.target.value}})}/></div>
      </div>
      <div className="field"><label className="lbl">Образец (см)</label><input type="number" value={g.size} onChange={e=>setForm({...form,gauge:{...g,size:+e.target.value}})}/></div>
      <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Размеры (см)</div>
      <div className="grid2">
        <div className="field"><label className="lbl">Ширина</label><input type="number" value={d.width} onChange={e=>setForm({...form,dimensions:{...d,width:+e.target.value}})}/></div>
        <div className="field"><label className="lbl">Длина</label><input type="number" value={d.length} onChange={e=>setForm({...form,dimensions:{...d,length:+e.target.value}})}/></div>
      </div>
      <div className="field"><label className="lbl">Заметки</label><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Особенности, модификации…" style={{minHeight:56}}/></div>
      <div className="row mt8">
        <button className="btn bp f1" onClick={onCreate} disabled={!form.name}>Создать проект</button>
        <button className="btn bl" onClick={onBack}>Назад</button>
      </div>
    </>
  );
}

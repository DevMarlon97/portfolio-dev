// Ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// ===== MENU MOBILE =====
const topbar = document.querySelector('.topbar');
const nav = document.getElementById('nav');
document.getElementById('btnMenu').addEventListener('click', ()=> {
  topbar.classList.toggle('open');
  nav.classList.toggle('open');
});

// Tema salvo
const root = document.documentElement;
const toggle = document.getElementById('toggleTema');
const saved = localStorage.getItem('tema');
if (saved){ root.setAttribute('data-theme', saved); toggle.checked = saved === 'light'; }
toggle.addEventListener('change', ()=> {
  const next = toggle.checked ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('tema', next);
});

// Partículas leves
const c = document.getElementById('bg-particles');
const ctx = c.getContext('2d');
function resize(){ c.width = innerWidth; c.height = innerHeight; }
resize(); addEventListener('resize', resize);
const pts = Array.from({length:70}, ()=>({ x:Math.random()*c.width, y:Math.random()*c.height, vx:(Math.random()-.5)*0.5, vy:(Math.random()-.5)*0.5, r:Math.random()*2+0.6 }));
(function loop(){
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle = 'rgba(139,92,246,.5)';
  pts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>c.width) p.vx*=-1;
    if(p.y<0||p.y>c.height) p.vy*=-1;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
  });
  requestAnimationFrame(loop);
})();

// Reveal e navegação ativa
const links = [...document.querySelectorAll('.nav a')];
const obs = new IntersectionObserver((ents)=>{
  ents.forEach(en=>{
    if(en.isIntersecting){
      links.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
      en.target.classList.add('revelar-in');
      if(en.target.id==='sobre') startCounters();
    }
  });
},{ rootMargin:'-35% 0px -55% 0px', threshold:0.1 });
document.querySelectorAll('.section').forEach(s=>obs.observe(s));

// Tilt nos cards
document.querySelectorAll('.tilt').forEach(el=>{
  let r; const max=8, scl=1.02;
  el.addEventListener('mouseenter', ()=> r = el.getBoundingClientRect());
  el.addEventListener('mousemove', e=>{
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateX(${-y*max}deg) rotateY(${x*max}deg) scale(${scl})`;
  });
  el.addEventListener('mouseleave', ()=> el.style.transform='none');
});

// Contadores
let countersStarted=false;
function startCounters(){
  if(countersStarted) return; countersStarted=true;
  document.querySelectorAll('.kpi-num').forEach(el=>{
    const alvo = +el.dataset.target, ini = performance.now(), dur = 1200;
    (function step(t){
      const p = Math.min(1, (t-ini)/dur);
      el.textContent = Math.floor(alvo*p);
      if(p<1) requestAnimationFrame(step); else el.textContent = alvo;
    })(ini);
  });
}

/* ===========================
   Viewer Fullscreen (estilo Facebook)
   =========================== */
(() => {
  const viewer = document.createElement('div');
  viewer.className = 'viewer';
  viewer.setAttribute('aria-hidden','true');
  viewer.innerHTML = `
    <img class="viewer__img" alt="">
    <button class="viewer__close" aria-label="Fechar

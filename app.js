// Ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Menu mobile
const topbar = document.querySelector('.topbar');
document.getElementById('btnMenu').addEventListener('click', ()=> {
  topbar.classList.toggle('open');
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
// Abertura em tela cheia ao clicar no card/imagem.
// Fechar com X, clique fora ou ESC.

(() => {
  // Cria DOM do viewer
  const viewer = document.createElement('div');
  viewer.className = 'viewer';
  viewer.setAttribute('aria-hidden','true');
  viewer.innerHTML = `
    <img class="viewer__img" alt="">
    <button class="viewer__close" aria-label="Fechar (Esc)">×</button>
    <div class="viewer__meta">
      <span class="viewer__title"></span>
      <span class="viewer__desc"></span>
    </div>
  `;
  document.body.appendChild(viewer);

  const img = viewer.querySelector('.viewer__img');
  const btnClose = viewer.querySelector('.viewer__close');
  const titleEl = viewer.querySelector('.viewer__title');
  const descEl = viewer.querySelector('.viewer__desc');

  let lastFocus = null;

  function open(src, title='', desc=''){
    img.src = src;
    titleEl.textContent = title || '';
    descEl.textContent = desc || '';
    viewer.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }
  function close(){
    viewer.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    img.src = '';
    if(lastFocus) lastFocus.focus();
  }

  // Delegação: qualquer elemento com data-viewer
  document.addEventListener('click', (ev)=>{
    const card = ev.target.closest('[data-viewer]');
    if(!card) return;

    // Evita seguir link se clicarem em "Ver demo" etc
    const clickedLink = ev.target.closest('a');
    if(clickedLink) return;

    ev.preventDefault();
    lastFocus = card;

    const src = card.dataset.image || card.querySelector('img')?.src || '';
    const title = card.dataset.title || card.querySelector('h3,h4')?.textContent || '';
    const desc = card.dataset.desc || card.querySelector('p')?.textContent || '';
    if(src) open(src, title, desc);
  });

  // Fechamento
  btnClose.addEventListener('click', close);
  viewer.addEventListener('click', (e)=>{ if(e.target === viewer) close(); });
  document.addEventListener('keydown', (e)=>{
    if(viewer.getAttribute('aria-hidden') === 'true') return;
    if(e.key === 'Escape') close();
  });
})();
/* ===========================
   Formulário de Contato
   =========================== */

// CONFIG: seu e-mail e seu WhatsApp (DDD+Número, sem +, use 55 no link)
const EMAIL_DESTINO = "voce@email.com";
const WHATS_NUMERO  = "5547999021947"; // ex.: 55 + DDD + número

const form = document.getElementById('contatoForm');
const toast = form?.querySelector('.form-toast');
const mailtoLink = document.getElementById('mailtoLink');
const btnWhats = document.getElementById('btnWhats');

function showToast(msg, ok=false){
  if(!toast) return;
  toast.hidden = false;
  toast.textContent = msg;
  toast.classList.toggle('ok', ok);
  toast.classList.toggle('err', !ok);
}

function buildMensagem(data){
  return [
    `Nova mensagem de contato pelo portfólio`,
    ``,
    `Nome: ${data.get('nome')}`,
    `E-mail: ${data.get('email')}`,
    `Assunto: ${data.get('assunto')}`,
    ``,
    `Mensagem:`,
    `${data.get('mensagem')}`
  ].join('\n');
}

// Mailto direto
function openMailto(data){
  const assunto = encodeURIComponent(`Contato - ${data.get('assunto')} (Portfólio)`);
  const corpo   = encodeURIComponent(buildMensagem(data));
  const href    = `mailto:${EMAIL_DESTINO}?subject=${assunto}&body=${corpo}`;
  window.location.href = href;
}

// WhatsApp direto
function buildWhatsHref(data){
  const texto = encodeURIComponent(
    `Olá! Vim seu portfólio e gostaria de falar sobre:\n` +
    `Assunto: ${data.get('assunto')}\n` +
    `Mensagem: ${data.get('mensagem')}\n\n` +
    `Meu nome: ${data.get('nome')} | E-mail: ${data.get('email')}`
  );
  return `https://wa.me/${WHATS_NUMERO}?text=${texto}`;
}

if(form){
  // Atalhos Mailto/Whats
  mailtoLink?.addEventListener('click', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    openMailto(data);
  });

  btnWhats?.addEventListener('click', (e)=>{
    const data = new FormData(form);
    btnWhats.href = buildWhatsHref(data);
  });

  // Submit padrão: usa Mailto (pode trocar por API depois)
  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    // Honeypot (anti-bot)
    if(form.querySelector('input[name="website"]')?.value) return;

    // Validação simples
    if(!form.reportValidity()){
      showToast('Preencha os campos obrigatórios.', false);
      return;
    }

    const data = new FormData(form);

    // === MODO 1: MAILTO (padrão) ===
    openMailto(data);
    showToast('Abrindo seu cliente de e-mail…', true);
    form.reset();

    // === MODO 2 (opcional): Enviar para API ===
    // Substitua abaixo por seu endpoint (ex.: Formspree) e descomente:
    // fetch('https://formspree.io/f/SEU_ID', {
    //   method: 'POST',
    //   headers: { 'Accept': 'application/json' },
    //   body: data
    // }).then(r=>{
    //   if(r.ok){ showToast('Mensagem enviada com sucesso! Obrigado :)', true); form.reset(); }
    //   else{ showToast('Não foi possível enviar agora. Tente novamente mais tarde.', false); }
    // }).catch(()=> showToast('Falha de conexão. Tente novamente.', false));
  });
}

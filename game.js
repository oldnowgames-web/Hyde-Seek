"use strict";
/* Motor do jogo: estado, cenas, texto, diálogos, mapa, provas, quadro e finais. */

const $ = (s) => document.querySelector(s);
const SAVE_KEY = "hydeseek-save-v1";
const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let S = freshState();
function freshState() { return { scene: "escritorio", inv: [], flags: {}, using: null, sound: true }; }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* sem armazenamento */ } }
function loadSave() { try { const j = localStorage.getItem(SAVE_KEY); return j ? JSON.parse(j) : null; } catch (e) { return null; } }

/* ---------- API usada pelos dados ---------- */
const G = {
  has: (id) => S.inv.includes(id),
  f: (k) => !!S.flags[k],
  set(k, v = true) { S.flags[k] = v; save(); },
  give(id) {
    if (S.inv.includes(id)) return false;
    S.inv.push(id); toast("Nova prova: " + ITEMS[id].n); sfx("blip"); updateCount(); save(); renderScene();
    return true;
  },
  unlock(id) {
    if (!S.flags["u_" + id]) { S.flags["u_" + id] = true; toast("Novo local no mapa: " + SCENES[id].name); save(); }
  },
  say: (l, o) => say(l, o), talk: (id, n) => talk(id, n), go: (id, q, a) => go(id, q, a),
  map: () => openMap(), board: () => openBoard(), accuse: () => accuse(),
  openDoor() {
    G.set("porta_aberta"); G.unlock("lab"); sfx("blip");
    G.say(["A chave gira como se conhecesse o caminho. A porta cede sem um rangido, bem azeitada.", "Alguém a usa todos os dias."], { done: () => go("lab") });
  }
};

/* ---------- Texto e diálogos ---------- */
const el = { speaker: $("#speaker"), line: $("#line"), cue: $("#cue"), choices: $("#choices") };
let queue = [], doneCb = null, timer = null, fullText = "", locked = false;
function followText() { const t = $("#tbScroll"); if (t.scrollHeight > t.clientHeight + 2) t.scrollTop = t.scrollHeight; }

function stopTyping() { if (timer) { clearInterval(timer); timer = null; } }
function updateCue() { el.cue.hidden = !!timer || !(queue.length || doneCb); }
function typeLine(txt) {
  stopTyping(); fullText = txt; el.line.textContent = ""; $("#tbScroll").scrollTop = 0;
  if (REDUCE) { el.line.textContent = txt; updateCue(); return; }
  let i = 0; el.cue.hidden = true;
  timer = setInterval(() => {
    i += 1; el.line.textContent = txt.slice(0, i); followText();
    if (i >= txt.length) { stopTyping(); updateCue(); }
  }, 16);
}
function say(lines, opt = {}) {
  stopTyping(); el.choices.innerHTML = "";
  queue = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
  doneCb = opt.done || null;
  el.speaker.textContent = opt.speaker === undefined ? "Seek" : opt.speaker;
  if (!queue.length) { el.line.textContent = ""; el.cue.hidden = true; if (doneCb) { const f = doneCb; doneCb = null; f(); } return; }
  typeLine(queue.shift());
}
function advance() {
  if (timer) { stopTyping(); el.line.textContent = fullText; followText(); updateCue(); return true; }
  if (queue.length) { typeLine(queue.shift()); return true; }
  if (doneCb) { const f = doneCb; doneCb = null; el.cue.hidden = true; f(); return true; }
  return false;
}
function showChoiceList(list) {
  el.choices.innerHTML = "";
  list.forEach((c) => {
    const b = document.createElement("button"); b.textContent = c.t;
    b.onclick = () => { el.choices.innerHTML = ""; c.run(); };
    el.choices.appendChild(b);
  });
  el.choices.querySelector("button")?.focus({ preventScroll: true });
  requestAnimationFrame(followText);
}
function talk(id, node = "start") {
  const d = DIALOGS[id], n = d[node];
  locked = true;
  if (n.do) n.do();
  if (n.stop) return;
  const t = typeof n.t === "function" ? n.t() : n.t;
  say(t, { speaker: n.sp || d.sp, done: () => {
    if (n.auto) { talk(id, n.auto); return; }
    const list = (n.ch || []).filter((c) => (!c.needs || G.has(c.needs)) && (!c.if || c.if()) && !(c.once && S.flags["o_" + id + node + c.t]));
    if (!list.length) { endTalk(); return; }
    showChoiceList(list.map((c) => ({ t: c.t, run: () => {
      if (c.once) S.flags["o_" + id + node + c.t] = true;
      if (c.do) c.do();
      if (c.next) talk(id, c.next); else endTalk();
    } })));
  } });
}
function endTalk() { locked = false; el.choices.innerHTML = ""; el.speaker.textContent = ""; el.line.textContent = "…"; el.cue.hidden = true; save(); renderScene(); }

/* ---------- Cena ---------- */
let visible = [];
function renderScene() {
  const sc = SCENES[S.scene], svg = $("#scene");
  visible = sc.hot.filter((h) => !h.show || h.show());
  const hots = visible.map((h, i) => `<rect class="hot" tabindex="0" role="button" aria-label="${h.label}" data-i="${i}" x="${h.r[0]}" y="${h.r[1]}" width="${h.r[2]}" height="${h.r[3]}" rx="6"/>`).join("");
  svg.innerHTML = ART.DEFS + ART[S.scene](S) + `<g>${hots}</g>`;
  $("#sceneWrap").classList.toggle("dark", !!sc.outdoor);
}
function activate(h) {
  if (locked) return;
  if (queue.length) { advance(); return; }
  if (S.using) {
    const u = h.use && h.use[S.using];
    if (u) { const id = S.using; S.using = null; updateUsing(); u(id); }
    else say("Não vejo como isso ajudaria aqui.");
    return;
  }
  h.act();
}
const COARSE = window.matchMedia("(pointer: coarse)").matches;
let lastCenter = 0, peekTimer, panTimer, panShown = false;
function centerScene() { const s = $("#sceneScroll"); lastCenter = performance.now(); s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2; }
function peek(first) {
  if (!COARSE || REDUCE || !first) return;
  const w = $("#sceneWrap"); w.classList.add("peek"); clearTimeout(peekTimer);
  peekTimer = setTimeout(() => w.classList.remove("peek"), 1600);
}
function panHint() {
  const s = $("#sceneScroll"), p = $("#pan");
  if (panShown || s.scrollWidth <= s.clientWidth + 24) return;
  panShown = true; p.hidden = false; clearTimeout(panTimer);
  panTimer = setTimeout(() => { p.hidden = true; }, 3800);
}
function go(id, quiet, after) {
  closeOverlays();
  const wrap = $("#sceneWrap"); wrap.classList.add("fade");
  setTimeout(() => {
    S.scene = id; renderScene(); updateHeader(); rainOn(!!SCENES[id].outdoor); audioScene();
    wrap.classList.remove("fade");
    centerScene(); peek(!S.flags["v_" + id]); panHint();
    const sc = SCENES[id], first = !S.flags["v_" + id];
    S.flags["v_" + id] = true; save();
    if (after) { after(); return; }
    if (quiet) return;
    if (first && sc.intro) say(sc.intro); else say(sc.again || sc.name);
  }, REDUCE ? 0 : 380);
}
function updateHeader() { $("#place").textContent = SCENES[S.scene].name; }
function updateCount() { const c = $("#count"); c.textContent = S.inv.length; c.hidden = !S.inv.length; }
function updateUsing() {
  const box = $("#using");
  box.hidden = !S.using;
  if (S.using) $("#using span").textContent = "Usando: " + ITEMS[S.using].n;
  $("#sceneWrap").classList.toggle("using", !!S.using);
}
let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
}
function glitch() {
  if (REDUCE) return;
  const g = $("#game"); g.classList.add("glitch"); sfx("thud");
  setTimeout(() => g.classList.remove("glitch"), 420);
}

/* ---------- Overlays ---------- */
function closeOverlays() { document.querySelectorAll(".overlay").forEach((o) => { o.hidden = true; }); }
function openOverlay(id) { closeOverlays(); const o = $(id); o.hidden = false; o.querySelector("button")?.focus(); }
const MAP_PINS = {
  escritorio: [470, 330], necro: [530, 372], prisao: [590, 330], interrog: [640, 372],
  soho: [260, 160], beco: [190, 215], lab: [120, 270], boticario: [380, 105]
};
function openMap() {
  if (locked) return;
  let s = `<svg viewBox="0 0 800 460" role="img" aria-label="Mapa de Londres"><rect width="800" height="460" fill="#0b0b0b"/>`;
  s += `<path d="M0 330 C140 300 220 380 380 350 S620 270 800 300 L800 360 C640 330 520 410 380 410 S120 360 0 390Z" fill="#2a2a2a"/>`;
  [[0, 120, 800, 90], [0, 220, 800, 190], [60, 0, 120, 460], [300, 0, 420, 460], [560, 0, 480, 460]].forEach(([a, b, c2, d]) => { s += `<line x1="${a}" y1="${b}" x2="${c2}" y2="${d}" stroke="#1d1d1d" stroke-width="3"/>`; });
  s += `<text x="620" y="400" fill="#555" font-size="15" font-style="italic" font-family="IM Fell English,serif">Tâmisa</text>`;
  s += `<text x="470" y="300" fill="#666" font-size="14" font-family="IM Fell English,serif" font-style="italic">Scotland Yard</text>`;
  s += `</svg>`;
  $("#mapSvg").innerHTML = s;
  const list = $("#mapList"); list.innerHTML = "";
  Object.keys(MAP_PINS).forEach((id) => {
    const open = id === "escritorio" || S.flags["u_" + id];
    const b = document.createElement("button");
    b.textContent = open ? SCENES[id].name : "Local ainda desconhecido";
    b.disabled = !open; b.className = id === S.scene ? "here" : "";
    b.onclick = () => { if (id !== S.scene) go(id); else closeOverlays(); };
    list.appendChild(b);
    const [x, y] = MAP_PINS[id];
    const pin = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pin.innerHTML = `<circle cx="${x}" cy="${y}" r="${id === S.scene ? 11 : 8}" fill="${open ? "#f0f0f0" : "#2e2e2e"}" stroke="#000" stroke-width="2"/>${open ? "" : `<text x="${x}" y="${y + 4}" fill="#777" font-size="11" text-anchor="middle">?</text>`}`;
    if (open) { pin.style.cursor = "pointer"; pin.setAttribute("tabindex", "-1"); pin.addEventListener("click", b.onclick); }
    $("#mapSvg svg").appendChild(pin);
  });
  openOverlay("#mapView");
}
function openEvidence() {
  if (locked) return;
  const list = $("#evList"); list.innerHTML = "";
  if (!S.inv.length) list.innerHTML = `<p class="empty">Nenhuma prova ainda. Examine a cena: cada ponto pode esconder algo.</p>`;
  S.inv.forEach((id) => {
    const it = ITEMS[id], d = document.createElement("article"); d.className = "card";
    d.innerHTML = `<h3>${it.n}</h3><p>${it.d}</p>`;
    if (id !== "carta_lacrada") {
      const b = document.createElement("button"); b.textContent = "Usar na cena";
      b.onclick = () => { S.using = id; updateUsing(); closeOverlays(); say("Procuro onde usar: " + it.n.toLowerCase() + "."); };
      d.appendChild(b);
    }
    list.appendChild(d);
  });
  openOverlay("#evView");
}
function hint() {
  if (locked) return;
  const h = HINTS.find(([c]) => c());
  say(h[1], { speaker: "Pista" });
}

/* ---------- Quadro de investigação ---------- */
function openBoard() {
  if (locked) return;
  const miss = REQUIRED.filter((i) => !G.has(i));
  if (miss.length) {
    say(["Fotos, barbantes, recortes. Três vítimas, três bilhetes assinados “E. Hyde”. As linhas não se encontram: ainda faltam peças.", `Faltam ${miss.length} prova${miss.length > 1 ? "s" : ""} para fechar o quadro.`]);
    return;
  }
  const wrap = $("#qList"); wrap.innerHTML = "";
  const opts = S.inv.filter((i) => i !== "carta_lacrada");
  const optHtml = `<option value="">Escolher prova…</option>` + opts.map((i) => `<option value="${i}">${ITEMS[i].n}</option>`).join("");
  QUESTIONS.forEach((q, qi) => {
    const box = document.createElement("section"); box.className = "q";
    const done = S.flags["q" + qi];
    box.innerHTML = `<h3>${q.ask}</h3><div class="slots"><select aria-label="Primeira prova">${optHtml}</select><select aria-label="Segunda prova">${optHtml}</select><button>Ligar as provas</button></div><p class="res${done ? " ok" : ""}">${done ? q.ok : ""}</p>`;
    const [a, b] = box.querySelectorAll("select"), btn = box.querySelector("button"), res = box.querySelector(".res");
    if (done) { q.need.forEach((n, k) => { [a, b][k].innerHTML = `<option>${ITEMS[n].n}</option>`; }); a.disabled = b.disabled = btn.disabled = true; }
    btn.onclick = () => {
      const pick = [a.value, b.value].filter(Boolean);
      const hit = pick.filter((p) => q.need.includes(p)).length;
      if (pick.length === 2 && new Set(pick).size === 2 && hit === 2) {
        S.flags["q" + qi] = true; save(); sfx("blip");
        res.textContent = q.ok; res.className = "res ok"; a.disabled = b.disabled = btn.disabled = true;
        checkBoard();
      } else { res.className = "res"; res.textContent = hit === 1 ? "Uma das provas serve. A outra não completa a ideia." : "Essas peças não se encaixam."; }
    };
    wrap.appendChild(box);
  });
  checkBoard();
  openOverlay("#boardView");
}
function checkBoard() {
  const all = QUESTIONS.every((_, i) => S.flags["q" + i]);
  $("#finalBtn").hidden = !all;
}

/* ---------- Final ---------- */
function finale() {
  closeOverlays(); locked = true;
  go("escritorio", true, () => {
    S.flags.final = true; save(); renderScene();
    say(["As seis linhas do quadro se esticam, uma por uma, até o mesmo ponto.",
      "Um homem pequeno, de roupas largas. Uma letra inclinada para trás. Uma bengala que Lanyon me deu. Um botão do meu casaco. Um sal que um médico encomenda, num laboratório que foi meu.",
      "E um cavalheiro alto que entra por uma porta, e um baixinho que sai.",
      "Viro-me, devagar, para o espelho."], { done: () => {
      glitch();
      setTimeout(() => say(["O homem alto me encara. Atrás dele, ou dentro dele, há outro: pequeno, pálido, sorrindo com a minha boca.", "Rompo o lacre da carta de Lanyon."], { done: openLetter }), 600);
    } });
  });
}
function openLetter() { openOverlay("#letterView"); }
function afterLetter() {
  closeOverlays();
  say(["Eu sou Hyde.", "Eu sempre fui. Cada pista que persegui foi um passo meu na noite que esqueci. Quem caçava e quem fugia usavam o mesmo par de sapatos.", ...(G.has("frasco") ? ["No bolso, o frasco pesa mais do que deveria. Há outro caminho, afinal."] : []), "No espelho, os dois homens esperam que eu escolha."], { done: () => {
    const opts = [{ t: "Entregar-me à Yard", run: () => ending("A") }];
    if (G.has("frasco")) opts.push({ t: "Beber o que resta no frasco", run: () => ending("B") });
    showChoiceList(opts);
  } });
}
const ENDINGS = {
  A: { title: "Fim: o Inspetor", text: [
    "Escrevo a confissão de próprio punho, na letra inclinada para trás que nunca foi só dele.",
    "Desço as escadas até a Prisão. O sargento Bullstrode me olha sem entender. Entrego-lhe o distintivo e a chave. A cela 2 está vazia; reconheço a frase riscada na pedra: dois dentro de um.",
    "Sento-me no banco, de frente para uma parede sem espelho. É o único lugar onde ele não pode me olhar de volta.",
    "Os jornais dirão que o monstro foi capturado. Só eu sei que ele sempre esteve na cela ao lado, e que desta vez a cela é a mesma."] },
  B: { title: "Fim: o Monstro", text: [
    "Bebo. O frasco é amargo como a minha boca pela manhã. Os ossos se dobram, o mundo encolhe e se alivia. Eu rio. É uma risada que conheço.",
    "Quando a Yard arromba a porta, encontram roupas largas demais sobre o tapete, um frasco vazio e um bilhete de letra inclinada para trás: “Não tenho pena nenhuma.”",
    "Procuram o Inspetor Seek por toda Londres. Nunca o encontram. Ninguém procura Hyde também.",
    "Nas noites de névoa, no Soho, uma bengala inteira e nova ecoa nas pedras."] }
};
function ending(k) {
  const e = ENDINGS[k];
  el.choices.innerHTML = "";
  $("#endTitle").textContent = e.title;
  $("#endText").innerHTML = e.text.map((t, i) => `<p style="--i:${i}">${t}</p>`).join("");
  openOverlay("#endView");
  try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
}

/* ---------- Final C: o inocente ---------- */
function accuse() {
  closeOverlays(); locked = true;
  say(["Enfield grita a sua inocência, como gritam todos os culpados e todos os inocentes.",
    "Mas as peças se encaixam. Viu Hyde de perto e o descreve como quem o conhece. Sabe da Porta Marrom e do boticário. Pagou uma família com o cheque de um “doutor”. Nenhum álibi para a 01h.",
    "Cada prova aponta para ele, desde que eu não olhe para o lado.",
    "Bullstrode assina a ordem. O caso de Hyde está encerrado."], { speaker: "Seek", done: () => { sfx("blip"); openOverlay("#paperView"); } });
}
function afterPaper() {
  closeOverlays();
  go("escritorio", true, () => {
    S.flags.final = true; save(); renderScene();
    say(["Sexta-feira. Os superiores me dão os parabéns de pé, no corredor, como quem entrega uma sentença.",
      "O jornal diz que Hyde continua solto. Enfield dorme na cela 3. Hyde não dorme.",
      "Volto ao escritório. A névoa cola nos vidros. No espelho de corpo inteiro, alguém me espera."], { done: () => {
      glitch();
      setTimeout(() => say([
        "O homem alto me encara. Atrás dele, ou dentro dele, há outro: pequeno, pálido, sorrindo com a minha boca.",
        "As mangas enroladas. O gosto amargo. A letra inclinada para trás. O botão. A bengala. A chave. O distintivo no meu bolso.",
        "Nunca houve alguém querendo me incriminar. Nunca houve outro caminho até a Porta Marrom.",
        "Eu sou Hyde. Sempre fui. E um inocente apodrece numa cela por um crime meu.",
        "O homem pequeno ri. Desta vez, o riso sai da minha boca."], { done: shatter }), 600);
    } });
  });
}
function sfxGlass() {
  if (!AC || !S.sound) return;
  const len = AC.sampleRate * 1.4, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3) * (Math.random() > .93 ? 1 : .35);
  const s = AC.createBufferSource(); s.buffer = buf;
  const hp = AC.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
  const g = AC.createGain(); g.gain.value = .45; s.connect(hp); hp.connect(g); g.connect(AC.destination); s.start();
}
function shatter() {
  closeOverlays(); stopTyping();
  const v = $("#shatterView"), W = 600, H = 800, cx = 330, cy = 330, N = 14, R = 1400;
  const ang = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2 + (Math.random() - .5) * .35);
  const r1 = ang.map(() => 55 + Math.random() * 70), r2 = ang.map(() => 190 + Math.random() * 130);
  const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const polys = [];
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    polys.push([[cx, cy], pt(ang[i], r1[i]), pt(ang[j], r1[j])]);
    polys.push([pt(ang[i], r1[i]), pt(ang[i], r2[i]), pt(ang[j], r2[j]), pt(ang[j], r1[j])]);
    polys.push([pt(ang[i], r2[i]), pt(ang[i], R), pt(ang[j], R), pt(ang[j], r2[j])]);
  }
  const shards = polys.map((p) => {
    const mx = p.reduce((s, q) => s + q[0], 0) / p.length, my = p.reduce((s, q) => s + q[1], 0) / p.length;
    const dist = Math.hypot(mx - cx, my - cy), dx = (mx - cx) * .25 + (Math.random() - .5) * 60, dy = 700 + Math.random() * 500;
    return `<polygon class="shard" clip-path="url(#mc)" fill="url(#gf)" points="${p.map((q) => q.map((n) => n.toFixed(1)).join(",")).join(" ")}" style="transform-origin:${mx.toFixed(0)}px ${my.toFixed(0)}px;--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--r:${((Math.random() - .5) * 140).toFixed(0)}deg;--d:${(dist * .0016 + Math.random() * .25).toFixed(2)}s"/>`;
  }).join("");
  $("#shatterStage").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Espelho se partindo"><defs>
    <clipPath id="mc"><rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="4"/></clipPath>
    <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a9a9a"/><stop offset=".5" stop-color="#3a3a3a"/><stop offset="1" stop-color="#8c8c8c"/></linearGradient>
    <pattern id="gf" width="${W}" height="${H}" patternUnits="userSpaceOnUse"><rect width="${W}" height="${H}" fill="url(#gg)"/>
      <g fill="#050505" opacity=".5"><circle cx="300" cy="250" r="36"/><path d="M250 300 Q300 285 350 300 L370 560 L230 560Z"/><rect x="250" y="560" width="40" height="190"/><rect x="310" y="560" width="40" height="190"/></g>
      <g fill="#050505" opacity=".85"><circle cx="330" cy="470" r="27"/><path d="M290 505 Q330 495 370 505 L385 640 L275 640Z"/><rect x="288" y="640" width="30" height="110"/><rect x="342" y="640" width="30" height="110"/></g></pattern></defs>
    <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="8" fill="#0d0d0d" stroke="#2c2c2c" stroke-width="3"/>${shards}</svg>`;
  v.classList.remove("cracked", "fall", "done"); v.hidden = false;
  let ready = false;
  v.onclick = () => { if (ready) location.reload(); };
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  const at = (ms, fn) => setTimeout(fn, REDUCE ? ms / 3 : ms);
  at(1400, () => { v.classList.add("cracked"); sfx("thud"); });
  at(2900, () => { v.classList.add("fall"); sfxGlass(); });
  at(5200, () => { v.classList.add("done"); ready = true; });
  at(12000, () => location.reload());
}

/* ---------- Chuva e som ---------- */
const rain = $("#rain"), rctx = rain.getContext("2d");
let drops = [], rainRun = false;
function sizeRain() {
  const w = $("#sceneWrap"), dpr = window.devicePixelRatio || 1;
  rain.width = w.clientWidth * dpr; rain.height = w.clientHeight * dpr; rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function rainOn(on) {
  rain.style.display = on && !REDUCE ? "block" : "none";
  if (on && !REDUCE && !rainRun) { rainRun = true; sizeRain(); requestAnimationFrame(rainLoop); }
  if (!on) rainRun = false;
}
function rainLoop() {
  if (!rainRun) return;
  const w = rain.clientWidth, h = rain.clientHeight;
  rctx.clearRect(0, 0, w, h); rctx.strokeStyle = "rgba(255,255,255,.28)"; rctx.lineWidth = 1;
  while (drops.length < 120) drops.push({ x: Math.random() * w, y: Math.random() * h, l: 10 + Math.random() * 16, v: 9 + Math.random() * 7 });
  rctx.beginPath();
  drops.forEach((d) => { rctx.moveTo(d.x, d.y); rctx.lineTo(d.x - 2, d.y + d.l); d.y += d.v; d.x -= .6; if (d.y > h) { d.y = -20; d.x = Math.random() * w + 20; } });
  rctx.stroke(); requestAnimationFrame(rainLoop);
}
let AC, rainGain;
function audioInit() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = AC.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
    const lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 7000;
    rainGain = AC.createGain(); rainGain.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(rainGain); rainGain.connect(AC.destination); src.start();
    setInterval(thunder, 32000);
  } catch (e) { AC = null; }
}
function audioScene() {
  if (!AC) return;
  const v = S.sound ? (SCENES[S.scene].outdoor ? .12 : .04) : 0;
  rainGain.gain.linearRampToValueAtTime(v, AC.currentTime + .8);
}
function sfx(kind) {
  if (!AC || !S.sound) return;
  const o = AC.createOscillator(), g = AC.createGain(), now = AC.currentTime;
  o.type = kind === "thud" ? "sine" : "triangle"; o.frequency.value = kind === "thud" ? 70 : 520;
  g.gain.setValueAtTime(.12, now); g.gain.exponentialRampToValueAtTime(.001, now + (kind === "thud" ? .5 : .18));
  o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + .55);
}
function thunder() {
  if (!AC || !S.sound || !SCENES[S.scene].outdoor || locked) return;
  const fl = $("#flash"); if (!REDUCE) { fl.classList.add("on"); setTimeout(() => fl.classList.remove("on"), 140); }
  const len = AC.sampleRate * 3, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const s = AC.createBufferSource(); s.buffer = buf;
  const lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 160;
  const g = AC.createGain(); g.gain.value = .5; s.connect(lp); lp.connect(g); g.connect(AC.destination);
  setTimeout(() => s.start(), 500);
}

/* ---------- Início e eventos ---------- */
function startGame(state) {
  S = state; $("#title").hidden = true; $("#game").hidden = false;
  audioInit(); locked = false;
  sizeRain(); updateCount(); updateUsing();
  $("#bSnd").setAttribute("aria-pressed", S.sound);
  const fresh = !S.flags["v_" + S.scene];
  S.flags["v_" + S.scene] = false; // força a introdução ao abrir
  go(S.scene, false);
  if (!fresh) S.flags["v_" + S.scene] = true;
}

$("#btnNew").onclick = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } startGame(freshState()); };
$("#btnCont").onclick = () => { const s = loadSave(); startGame(s || freshState()); };
if (loadSave()) $("#btnCont").hidden = false;

$("#bMap").onclick = openMap;
$("#bEv").onclick = openEvidence;
$("#bHint").onclick = hint;
$("#bHot").onclick = (ev) => {
  const on = $("#sceneWrap").classList.toggle("reveal");
  ev.currentTarget.setAttribute("aria-pressed", on);
};
$("#bSnd").onclick = (ev) => { S.sound = !S.sound; ev.currentTarget.setAttribute("aria-pressed", S.sound); audioScene(); save(); };
$("#unuse").onclick = () => { S.using = null; updateUsing(); };
document.querySelectorAll("[data-close]").forEach((b) => { b.onclick = closeOverlays; });
$("#finalBtn").onclick = finale;
$("#letterOk").onclick = afterLetter;
$("#paperOk").onclick = afterPaper;
$("#again").onclick = () => location.reload();
$("#textbox").addEventListener("click", (ev) => { if (ev.target.closest("button")) return; advance(); });

const svg = $("#scene"), tip = $("#tip");
svg.addEventListener("click", (ev) => { const h = ev.target.closest(".hot"); if (h) activate(visible[+h.dataset.i]); });
svg.addEventListener("keydown", (ev) => { if ((ev.key === "Enter" || ev.key === " ") && ev.target.classList?.contains("hot")) { ev.preventDefault(); activate(visible[+ev.target.dataset.i]); } });
svg.addEventListener("pointermove", (ev) => {
  if (ev.pointerType && ev.pointerType !== "mouse") { tip.hidden = true; return; }
  const h = ev.target.closest(".hot");
  if (!h) { tip.hidden = true; return; }
  const wr = $("#sceneWrap").getBoundingClientRect();
  tip.textContent = visible[+h.dataset.i].label; tip.hidden = false;
  tip.style.left = Math.min(ev.clientX - wr.left + 14, wr.width - 180) + "px"; tip.style.top = (ev.clientY - wr.top + 16) + "px";
});
svg.addEventListener("pointerleave", () => { tip.hidden = true; });
window.addEventListener("resize", () => { if (rainRun) sizeRain(); });
if ("ResizeObserver" in window) new ResizeObserver(() => { if (rainRun) sizeRain(); }).observe($("#sceneWrap"));
window.addEventListener("orientationchange", () => setTimeout(centerScene, 300));
$("#sceneScroll").addEventListener("scroll", () => { if (performance.now() - lastCenter > 500) $("#pan").hidden = true; }, { passive: true });
document.addEventListener("keydown", (ev) => {
  if (ev.target.matches("select, input")) return;
  if (ev.key === "Escape") closeOverlays();
  else if (ev.key === "m" || ev.key === "M") { if (!$("#game").hidden) openMap(); }
  else if (ev.key === "i" || ev.key === "I") { if (!$("#game").hidden) openEvidence(); }
  else if (ev.key === "h" || ev.key === "H") { if (!$("#game").hidden) $("#bHot").click(); }
  else if ((ev.key === " " || ev.key === "Enter") && !ev.target.closest("button, .hot, a")) { if (advance()) ev.preventDefault(); }
});
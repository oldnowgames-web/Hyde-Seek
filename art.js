"use strict";
/* Arte vetorial das cenas. Tudo em escala de cinza, desenhado em SVG 1280x640. */
const ART = (() => {
  const r = (x, y, w, h, f, x2 = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${x2}/>`;
  const p = (pts, f, x2 = "") => `<polygon points="${pts}" fill="${f}" ${x2}/>`;
  const c = (x, y, rad, f, x2 = "") => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${f}" ${x2}/>`;
  const e = (x, y, rx, ry, f, x2 = "") => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${x2}/>`;
  const l = (x1, y1, x2, y2, s, w = 1, x3 = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" ${x3}/>`;
  const t = (x, y, sz, txt, f, x2 = "") => `<text x="${x}" y="${y}" font-size="${sz}" fill="${f}" font-family="'Special Elite','Courier New',monospace" ${x2}>${txt}</text>`;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const fig = (x, y, s, f, x2 = "") => `<g transform="translate(${x},${y}) scale(${s})" ${x2}><circle cx="0" cy="-86" r="16" fill="${f}"/><path d="M-26 -62 Q0 -72 26 -62 L34 20 L-34 20 Z" fill="${f}"/><rect x="-24" y="20" width="18" height="70" fill="${f}"/><rect x="6" y="20" width="18" height="70" fill="${f}"/></g>`;
  const fog = (y, h, op) => r(0, y, 1280, h, "url(#gFog)", `opacity="${op}"`);
  const glow = (x, y, rad, op) => c(x, y, rad, "url(#gLamp)", `opacity="${op}"`);
  const exit = (x, y) => t(x, y, 38, "↓", "#fff", 'text-anchor="middle" opacity=".35"');
  const has = (S, id) => S.inv.includes(id);

  const DEFS = `<defs>
<linearGradient id="gFog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>
<radialGradient id="gLamp"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".4" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a8a8a"/><stop offset=".5" stop-color="#363636"/><stop offset="1" stop-color="#9a9a9a"/></linearGradient>
<pattern id="pBlind" width="10" height="26" patternUnits="userSpaceOnUse"><rect width="10" height="13" fill="#fff"/></pattern>
<pattern id="pBrick" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="#171717"/><path d="M0 0H80M0 20H80M40 0V20M0 20V40M80 20V40" stroke="#070707" stroke-width="3" fill="none"/></pattern>
<pattern id="pTile" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#8e8e8e"/><path d="M0 0H48V48" stroke="#3c3c3c" stroke-width="2" fill="none"/></pattern>
<pattern id="pPlank" width="160" height="34" patternUnits="userSpaceOnUse"><rect width="160" height="34" fill="#101010"/><path d="M0 0H160M80 0V34" stroke="#050505" stroke-width="2" fill="none"/></pattern>
</defs>`;

  /* ---------- ESCRITÓRIO ---------- */
  const escritorio = (S) => {
    let o = r(0, 0, 1280, 640, "#171717") + r(0, 470, 1280, 170, "url(#pPlank)") + r(0, 462, 1280, 10, "#262626");
    for (let x = 0; x < 1280; x += 40) o += r(x, 0, 2, 462, "#1d1d1d");
    // janela com persiana
    o += r(150, 90, 250, 310, "#cfcfcf") + r(150, 90, 250, 310, "url(#gFog)");
    for (let i = 0; i < 12; i++) o += r(150, 90 + i * 26, 250, 13, "#1c1c1c", 'opacity=".88"');
    o += `<rect x="145" y="85" width="260" height="320" fill="none" stroke="#050505" stroke-width="12"/>` + r(272, 90, 6, 310, "#050505");
    o += p("150,404 400,404 560,640 20,640", "url(#pBlind)", 'opacity=".09"');
    // quadro do caso
    o += r(440, 90, 270, 210, "#2b2b2b", 'stroke="#555" stroke-width="6"');
    [[460, 110, 70, 50, -4], [550, 104, 80, 56, 3], [648, 118, 50, 46, -2], [470, 190, 60, 60, 5], [560, 200, 70, 44, -3], [640, 190, 56, 70, 4]].forEach(([x, y, w, h, a]) => {
      o += `<g transform="rotate(${a} ${x + w / 2} ${y + h / 2})">${r(x, y, w, h, "#d9d9d9")}${r(x + 8, y + 10, w - 16, 3, "#555")}${r(x + 8, y + 20, w - 24, 3, "#777")}${r(x + 8, y + 30, w - 20, 3, "#777")}</g>`;
    });
    ["495,135 590,132", "590,132 672,141", "495,135 500,220", "500,220 595,222", "595,222 668,225", "672,141 668,225"].forEach(s => {
      const [a, b] = s.split(" "); const [x1, y1] = a.split(","), [x2, y2] = b.split(",");
      o += l(x1, y1, x2, y2, "#fff", 1.4, 'opacity=".6"');
    });
    o += t(590, 150, 13, "E. Hyde?", "#111", 'text-anchor="middle"');
    // diploma
    o += r(730, 120, 120, 86, "#e0e0e0", 'stroke="#050505" stroke-width="6"') + t(790, 150, 9, "Edimburgo", "#222", 'text-anchor="middle"') + t(790, 172, 11, "H. Seek, M.D.", "#222", 'text-anchor="middle"') + r(750, 182, 80, 2, "#444");
    // porta (vista de dentro: letras ao contrário)
    o += r(880, 110, 130, 380, "#1a1a1a", 'stroke="#050505" stroke-width="6"') + r(900, 300, 90, 170, "#141414") + r(915, 140, 60, 84, "#9d9d9d");
    o += `<g transform="translate(945,176) scale(-1,1)">${t(0, 0, 11, "INSP. H. SEEK", "#000", 'text-anchor="middle"')}</g>` + c(992, 300, 7, "#bbb");
    // espelho de corpo inteiro
    o += r(1050, 110, 160, 480, "#262626", 'stroke="#0a0a0a" stroke-width="8"') + r(1064, 124, 132, 452, "url(#gGlass)") + p("1064,124 1130,124 1064,300", "#fff", 'opacity=".07"');
    if (S.flags.final) o += `<g class="mTall">${fig(1130, 330, 1.9, "#050505")}</g><g class="mShort">${fig(1130, 448, 1.35, "#050505")}</g>`;
    else o += r(1090, 170, 60, 90, "#fff", 'opacity=".05"');
    o += r(1090, 590, 80, 10, "#1b1b1b");
    // mesa
    o += r(420, 410, 440, 28, "#2f2f2f") + r(430, 438, 420, 92, "#1d1d1d") + r(440, 530, 16, 70, "#171717") + r(824, 530, 16, 70, "#171717");
    o += r(655, 450, 160, 52, "#262626", 'stroke="#0d0d0d" stroke-width="3"');
    o += S.flags.gaveta_aberta ? r(655, 450, 160, 20, "#000") : c(735, 476, 5, "#9a9a9a");
    o += glow(800, 380, 100, ".35") + r(790, 398, 36, 12, "#555") + l(808, 398, 808, 360, "#555", 4) + p("770,340 846,340 860,372 756,372", "#444");
    if (!has(S, "telegrama")) o += `<g transform="rotate(-4 512 399)">${r(480, 388, 64, 22, "#e8e8e8")}${r(488, 394, 40, 2, "#555")}${r(488, 400, 48, 2, "#777")}</g>`;
    if (!has(S, "relatorio")) o += r(600, 392, 84, 18, "#cfcfcf") + r(604, 384, 84, 10, "#b5b5b5");
    // suporte de bengalas
    o += r(330, 500, 56, 100, "#2a2a2a") + e(358, 500, 28, 8, "#0e0e0e") + l(346, 440, 352, 500, "#555", 6) + l(366, 452, 362, 500, "#444", 6) + `<path d="M346 440 q-14 -12 -2 -22" stroke="#555" stroke-width="5" fill="none"/>`;
    // cabideiro com casaco
    o += r(72, 180, 10, 420, "#2b2b2b") + e(77, 600, 40, 10, "#222") + r(58, 190, 38, 26, "#0f0f0f") + e(77, 218, 34, 7, "#0f0f0f");
    o += p("38,236 116,236 134,430 20,430", "#3b3b3b") + l(77, 240, 77, 430, "#222", 2) + c(70, 290, 4, "#111") + c(70, 330, 4, "#111") + c(70, 370, 2, "#222");
    return o + fog(380, 260, ".4");
  };

  /* ---------- RUA SOHO ---------- */
  const soho = (S) => {
    seed = 11;
    let o = r(0, 0, 1280, 640, "#0a0a0a") + glow(1000, 80, 150, ".2");
    o += r(0, 30, 310, 440, "#141414") + r(0, 30, 310, 14, "#1d1d1d");
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const lit = (i * 3 + j) % 4 === 1; o += r(30 + j * 90, 80 + i * 110, 56, 76, lit ? "#bdbdbd" : "#050505", lit ? 'opacity=".5"' : ""); }
    o += r(310, 150, 170, 320, "#101010");
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) o += r(335 + j * 80, 180 + i * 110, 50, 70, "#050505");
    o += r(980, 20, 300, 450, "#131313") + r(980, 20, 300, 12, "#1e1e1e");
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) if (!(i === 0 && j === 0)) o += r(1020 + j * 120, 140 + i * 105, 70, 80, (i + j) % 2 ? "#050505" : "#bdbdbd", (i + j) % 2 ? "" : 'opacity=".35"');
    // janela da criada
    o += r(1040, 130, 110, 130, "#d8d8d8", 'opacity=".78"') + fig(1095, 200, .55, "#0a0a0a") + r(1040, 130, 110, 130, "none", 'stroke="#050505" stroke-width="6"') + l(1095, 130, 1095, 260, "#050505", 4) + l(1040, 195, 1150, 195, "#050505", 4);
    // beco
    o += r(860, 120, 120, 350, "#020202") + r(870, 300, 100, 170, "url(#gFog)", 'opacity=".5"') + c(905, 390, 2.5, "#fff", 'opacity=".9"') + c(918, 390, 2.5, "#fff", 'opacity=".9"');
    // rua
    o += p("0,440 1280,440 1280,640 0,640", "#0f0f0f");
    [470, 505, 550, 600].forEach(y => o += l(0, y, 1280, y, "#1b1b1b", 2));
    for (let i = 0; i < 110; i++) o += e(rnd() * 1280, 450 + rnd() * 190, 14 + rnd() * 10, 5, "#1a1a1a");
    o += e(300, 560, 130, 14, "#2c2c2c", 'opacity=".7"') + e(1000, 590, 110, 12, "#2c2c2c", 'opacity=".6"');
    // lampião
    o += glow(331, 170, 190, ".6") + r(326, 200, 10, 260, "#222") + p("310,192 352,192 346,150 316,150", "#3a3a3a") + c(331, 172, 9, "#fff", 'opacity=".9"');
    o += l(318, 178, 306, 188, "#fff", 1.5) + l(344, 176, 358, 184, "#fff", 1.5);
    // cordas da polícia
    o += r(430, 470, 8, 62, "#444") + r(850, 470, 8, 62, "#444") + l(434, 482, 854, 482, "#cfcfcf", 3, 'stroke-dasharray="14 8"');
    // corpo marcado a giz
    o += e(640, 545, 110, 30, "#000", 'opacity=".55"') + e(600, 552, 70, 18, "#555", 'opacity=".45"');
    o += `<g stroke="#ddd" stroke-width="2.5" fill="none"><circle cx="560" cy="545" r="17"/><path d="M577 532 L700 524 L700 566 L577 558"/><path d="M700 530 L830 515 L836 530 L700 546"/><path d="M700 552 L825 570 L820 586 L700 566"/><path d="M600 528 L590 480 L604 478 L618 526"/><path d="M610 560 L640 600 L626 608 L600 566"/></g>`;
    if (!has(S, "bengala_metade")) o += `<g transform="rotate(-6 880 580)">${r(800, 575, 150, 9, "#333")}${r(795, 573, 9, 13, "#cfcfcf")}</g>`;
    if (!has(S, "bilhete_hyde")) o += p("420,596 452,590 460,610 428,616", "#e8e8e8") + r(430, 600, 22, 2, "#555");
    for (let i = 0; i < 7; i++) o += e(900 + i * 24, 570 + (i % 2) * 14, 6, 3, "#000", 'opacity=".7"');
    return o + fog(380, 260, ".55");
  };

  /* ---------- BECO DA PORTA MARROM ---------- */
  const beco = (S) => {
    seed = 21;
    let o = r(0, 0, 1280, 640, "#050505");
    o += p("0,0 420,150 420,470 0,640", "url(#pBrick)") + p("1280,0 860,150 860,470 1280,640", "url(#pBrick)");
    o += r(420, 150, 440, 320, "#0c0c0c") + p("0,640 420,470 860,470 1280,640", "#0e0e0e");
    for (let i = 0; i < 40; i++) o += e(100 + rnd() * 1080, 480 + rnd() * 150, 16, 4, "#171717");
    o += r(450, 180, 90, 70, "#050505", 'stroke="#222" stroke-width="3"') + r(760, 180, 90, 70, "#050505", 'stroke="#222" stroke-width="3"') + l(450, 180, 540, 250, "#333", 1) + l(850, 180, 760, 250, "#333", 1);
    // porta marrom: sem campainha, sem aldrava
    o += r(570, 240, 140, 232, "#262626", 'stroke="#000" stroke-width="6"') + r(588, 262, 48, 80, "#1c1c1c") + r(644, 262, 48, 80, "#1c1c1c") + r(588, 360, 104, 90, "#1c1c1c");
    if (S.flags.porta_aberta) o += p("570,240 600,252 600,462 570,472", "#000") + r(600, 252, 4, 210, "#cfcfcf", 'opacity=".6"');
    else o += c(690, 368, 4, "#000");
    // lampião
    o += glow(330, 230, 200, ".55") + l(330, 120, 330, 214, "#333", 5) + p("314,214 346,214 340,240 320,240", "#cfcfcf", 'opacity=".9"');
    // lixo e caixotes
    o += r(960, 520, 70, 90, "#1e1e1e") + e(995, 520, 35, 8, "#0c0c0c") + r(1050, 540, 60, 70, "#191919") + r(150, 570, 110, 56, "#222", 'stroke="#111" stroke-width="3"');
    [[985, 600], [1010, 606], [1060, 614]].forEach(([x, y]) => o += p(`${x},${y} ${x + 10},${y - 4} ${x + 14},${y + 2}`, "#ddd", 'opacity=".7"'));
    // Tom, o menino
    o += fig(205, 560, .6, "#0a0a0a") + e(205, 480, 20, 6, "#0a0a0a");
    o += exit(640, 625);
    return o + fog(400, 240, ".5");
  };

  /* ---------- LABORATÓRIO ---------- */
  const lab = (S) => {
    let o = r(0, 0, 1280, 640, "#101010") + r(0, 450, 1280, 190, "url(#pPlank)");
    for (let i = 0; i < 4; i++) { const x = 150 + i * 300; o += `<path d="M${x} 330 V170 Q${x + 60} 80 ${x + 120} 170 V330Z" fill="#c4c4c4" opacity=".5"/>`; o += p(`${x},330 ${x + 120},330 ${x + 220},640 ${x - 100},640`, "url(#pBlind)", 'opacity=".05"'); }
    // estantes
    for (let i = 0; i < 3; i++) { o += r(40, 150 + i * 70, 110, 6, "#333"); for (let j = 0; j < 4; j++) o += r(48 + j * 26, 120 + i * 70, 18, 30, j % 2 ? "#777" : "#444"); }
    // bancada
    o += r(360, 420, 560, 30, "#2c2c2c") + r(380, 450, 520, 90, "#1a1a1a") + r(780, 462, 110, 40, "#232323", 'stroke="#0d0d0d" stroke-width="3"');
    if (!has(S, "chave_gaveta")) o += c(835, 482, 4, "#9a9a9a");
    o += glow(560, 380, 90, ".5") + `<path d="M552 400 q-12 -26 4 -46 q4 22 20 22 q10 10 -6 24z" fill="#fff" opacity=".85"/>` + r(540, 404, 36, 16, "#444");
    [[640, 396], [700, 386], [760, 398]].forEach(([x, y], i) => { o += `<path d="M${x} ${y} h30 l-4 -26 h-22z" fill="#9a9a9a" opacity=".6"/>` + e(x + 15, y + 2, 15, 4, "#ccc", 'opacity=".5"'); });
    o += r(820, 404, 70, 16, "#e8e8e8", 'opacity=".9"') + e(855, 400, 28, 6, "#fff", 'opacity=".5"');
    if (!has(S, "diario")) o += r(420, 406, 80, 16, "#d6d6d6") + r(420, 420, 80, 4, "#333");
    // cadeira com roupas largas
    o += r(130, 404, 80, 12, "#222") + r(130, 330, 10, 90, "#222") + r(136, 416, 8, 50, "#222") + r(200, 416, 8, 50, "#222");
    o += p("142,384 214,384 226,404 130,404", "#454545") + r(150, 372, 60, 14, "#505050");
    // espelho
    o += r(1050, 110, 160, 480, "#262626", 'stroke="#0a0a0a" stroke-width="8"') + r(1064, 124, 132, 452, "url(#gGlass)") + p("1064,124 1130,124 1064,300", "#fff", 'opacity=".07"');
    o += exit(640, 625);
    return o + fog(420, 220, ".45");
  };

  /* ---------- NECROTÉRIO ---------- */
  const necro = (S) => {
    let o = r(0, 0, 1280, 640, "#050505") + r(0, 0, 1280, 470, "url(#pTile)", 'opacity=".28"') + r(0, 470, 1280, 170, "#0b0b0b");
    o += r(0, 462, 1280, 8, "#2a2a2a");
    // mesa e corpo
    o += r(330, 430, 560, 22, "#9a9a9a") + r(350, 452, 16, 120, "#555") + r(850, 452, 16, 120, "#555");
    o += `<path d="M360 430 Q362 380 400 384 L470 388 Q520 372 560 392 L700 394 Q760 380 800 396 L880 400 Q890 420 886 430Z" fill="#d6d6d6"/>`;
    o += e(600, 426, 22, 9, "#c4c4c4");
    // lâmpada pendente
    o += l(600, 0, 600, 150, "#333", 3) + p("540,150 660,150 640,185 560,185", "#2a2a2a") + p("560,185 640,185 880,470 330,470", "#fff", 'opacity=".07"') + glow(600, 190, 120, ".5");
    // armários de aço
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o += r(930 + j * 108, 110 + i * 115, 100, 105, "#5e5e5e", 'stroke="#1c1c1c" stroke-width="3"') + r(965 + j * 108, 150 + i * 115, 30, 5, "#bbb");
    // prateleira de pertences
    o += r(40, 170, 220, 12, "#333") + r(80, 130, 100, 40, "#b5b5b5");
    if (!has(S, "carta_lacrada")) o += r(200, 154, 44, 16, "#eee") + c(222, 162, 4, "#777");
    // prancheta
    o += r(70, 240, 100, 130, "#dcdcdc", 'stroke="#222" stroke-width="5"') + r(84, 262, 72, 3, "#555") + r(84, 280, 60, 3, "#777") + r(84, 298, 68, 3, "#777");
    // Poole
    o += fig(240, 430, 1.1, "#050505") + r(262, 400, 36, 50, "#d0d0d0", 'transform="rotate(8 280 425)"');
    o += exit(640, 625);
    return o + fog(420, 220, ".35");
  };

  /* ---------- PRISÃO ---------- */
  const prisao = (S) => {
    let o = r(0, 0, 1280, 640, "#0a0a0a") + r(0, 0, 1280, 470, "url(#pBrick)", 'opacity=".9"') + r(0, 470, 1280, 170, "#0b0b0b");
    // mesa do sargento
    o += glow(210, 380, 150, ".4") + fig(210, 370, 1.05, "#050505") + r(60, 420, 300, 38, "#2c2c2c") + r(70, 458, 280, 80, "#1b1b1b");
    o += r(190, 396, 16, 24, "#ccc") + c(198, 392, 6, "#fff", 'opacity=".9"');
    if (!has(S, "registro_guarda")) o += r(130, 406, 84, 16, "#ddd") + r(130, 420, 84, 3, "#333");
    // porta do interrogatório
    o += r(520, 190, 180, 300, "#222", 'stroke="#050505" stroke-width="8"') + r(580, 240, 60, 50, "#000");
    for (let i = 0; i < 4; i++) o += r(588 + i * 14, 240, 4, 50, "#555");
    o += t(610, 170, 15, "INTERROGATÓRIO", "#bbb", 'text-anchor="middle"') + c(680, 360, 6, "#777");
    // celas
    [[790, 2], [1040, 3]].forEach(([x, n]) => {
      o += r(x, 200, 230, 300, "#050505") + r(x, 200, 230, 300, "none", 'stroke="#2a2a2a" stroke-width="8"');
      if (n === 3) o += fig(x + 130, 420, .85, "#1c1c1c") + r(x + 14, 450, 90, 14, "#222");
      for (let b = 0; b < 11; b++) o += r(x + 8 + b * 21, 200, 6, 300, "#4a4a4a");
    });
    o += t(830, 300, 12, "DOIS DENTRO", "#999", 'opacity=".7"') + t(830, 318, 12, "DE UM", "#999", 'opacity=".7"');
    o += exit(430, 625);
    return o + fog(420, 220, ".4");
  };

  /* ---------- INTERROGATÓRIO ---------- */
  const interrog = (S) => {
    let o = r(0, 0, 1280, 640, "#0c0c0c") + r(0, 0, 1280, 470, "url(#pBrick)", 'opacity=".55"') + r(0, 470, 1280, 170, "#080808");
    // sombra do inspetor na parede (duas cabeças)
    o += fig(440, 300, 2.6, "#000", 'opacity=".75"') + c(392, 120, 26, "#000", 'opacity=".7"');
    // relógio parado em 3h17
    o += c(640, 120, 52, "#cfcfcf") + c(640, 120, 52, "none", 'stroke="#000" stroke-width="6"') + l(640, 120, 640 + 24, 120 - 4, "#000", 4) + l(640, 120, 640 - 6, 120 - 38, "#000", 3);
    // luz pendente e mesa
    o += l(640, 0, 640, 200, "#333", 3) + p("580,200 700,200 680,232 600,232", "#2a2a2a") + p("600,232 680,232 980,470 300,470", "#fff", 'opacity=".09"') + glow(640, 240, 140, ".55");
    o += r(300, 410, 680, 28, "#2f2f2f") + r(320, 438, 640, 18, "#1b1b1b") + r(330, 456, 16, 120, "#151515") + r(934, 456, 16, 120, "#151515");
    o += r(340, 300, 12, 112, "#1b1b1b") + r(340, 410, 70, 8, "#1b1b1b");
    o += fig(850, 350, 1.25, "#262626") + e(850, 408, 22, 5, "#000", 'opacity=".4"');
    o += r(880, 396, 30, 10, "#555", 'opacity=".8"') + r(60, 190, 110, 290, "#1a1a1a", 'stroke="#000" stroke-width="6"') + exit(120, 600);
    return o + fog(440, 200, ".3");
  };

  /* ---------- BOTICÁRIO ---------- */
  const boticario = (S) => {
    seed = 31;
    let o = r(0, 0, 1280, 640, "#0d0d0d") + r(0, 470, 1280, 170, "url(#pPlank)");
    for (let i = 0; i < 5; i++) {
      const y = 100 + i * 82; o += r(140, y, 960, 8, "#2a2a2a");
      for (let x = 160; x < 1090; x += 54) { const sh = ["#bdbdbd", "#6f6f6f", "#3a3a3a", "#9a9a9a"][Math.floor(rnd() * 4)]; const h = 28 + rnd() * 14; o += r(x, y - h, 36, h, sh, 'opacity=".85"') + r(x + 6, y - h - 7, 24, 7, "#111"); }
    }
    // janela com letreiro invertido
    o += r(1120, 90, 140, 260, "#bdbdbd", 'opacity=".3"') + `<g transform="translate(1190,210) scale(-1,1)">${t(0, 0, 18, "MAW &amp; FILHOS", "#eee", 'text-anchor="middle" opacity=".75"')}</g>`;
    o += l(640, 0, 640, 60, "#333", 3) + glow(640, 90, 160, ".45");
    // Maw atrás do balcão
    o += c(520, 330, 30, "#050505") + e(520, 430, 74, 100, "#050505") + c(507, 326, 9, "none", 'stroke="#ccc" stroke-width="2"') + c(535, 326, 9, "none", 'stroke="#ccc" stroke-width="2"') + l(516, 326, 526, 326, "#ccc", 2);
    // balcão
    o += r(0, 430, 1280, 60, "#262626") + r(0, 420, 1280, 16, "#3a3a3a");
    o += r(250, 404, 130, 18, "#ddd") + r(250, 418, 130, 4, "#333");
    o += l(880, 330, 880, 420, "#aaa", 4) + l(820, 340, 940, 340, "#aaa", 4) + e(830, 370, 24, 6, "#999") + e(930, 370, 24, 6, "#999");
    o += exit(640, 625);
    return o + fog(430, 210, ".35");
  };

  return { DEFS, escritorio, soho, beco, lab, necro, prisao, interrog, boticario };
})();
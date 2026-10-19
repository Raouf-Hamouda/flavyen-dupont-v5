// Intro: his name huge over silent extracts of his work. Sound = a heavy riser (WebAudio, only after a tap). Enter by button, swipe up or scroll.
(() => {
  const el = document.getElementById('intro'); if (!el) return;
  const DIR = innerWidth < 700 ? 'intro/s/' : 'intro/'; // phones decode 720p, wide screens 1080p
  const BASE = ['copie-de-kcorp-jersey-worlds-2025', 'samyang-habanero-lime', 'copie-de-redbull-helydia-annonce-1', 'ds4-reveal', 'dcmj-x-lena-situation', 'showreel-2024', 'copie-de-poppie-short-film'];
  // a different order every visit, and never two extracts of the same film back to back
  const film = c => c.replace(/_[ab]$/, '');
  const melange = (l) => {
    const a = l.slice();
    for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
    for (let i = 1; i < a.length; i++) if (film(a[i]) === film(a[i - 1])) { const k = a.findIndex((x, m) => m > i && film(x) !== film(a[i - 1]) && film(x) !== film(a[i + 1] || '')); if (k > 0) [a[i], a[k]] = [a[k], a[i]]; }
    return a;
  };
  let CLIPS = melange(BASE);
  fetch('intro/list.json').then(r => r.json()).then(l => { if (Array.isArray(l) && l.length > 7) { const dejaVus = CLIPS.slice(0, n); CLIPS = dejaVus.concat(melange(l.filter(c => !dejaVus.includes(c)))); } }).catch(() => {});
  // two stacked players: the next extract starts under the current one and they cross-fade, picture and sound together
  const v0 = el.querySelector('video'), v1 = v0.cloneNode(); v0.after(v1);
  const vs = [v0, v1]; let cur = 0, n = 0, passe = false, mode = 0;
  // 60 ms volume ramps on each cut, so the straight cuts of picture do not click in the sound
  const rampe = (v, de, a, fin) => { let i = 0; const t = setInterval(() => { v.volume = Math.max(0, Math.min(1, de + (a - de) * (++i / 4))); if (i >= 4) { clearInterval(t); fin && fin(); } }, 15); };
  const COUPE = 1; // seconds each extract plays before a straight cut to the next (no fade)
  // the name and the two words turn black when the picture behind them is bright (white on white would vanish); on every other picture they stay white
  const echant = document.createElement('canvas'); echant.width = 32; echant.height = 18;
  const ge = echant.getContext('2d', { willReadFrequently: true });
  let clair = false;
  const contraste = () => {
    const v = vs[cur]; if (!v.videoWidth || v.readyState < 2) return;
    try {
      ge.drawImage(v, 0, 0, 32, 18);
      const d = ge.getImageData(0, 5, 32, 8).data; let sum = 0;
      for (let i = 0; i < d.length; i += 4) sum += .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
      const l = sum / (d.length / 4);
      if (clair ? l < 120 : l > 160) { clair = !clair; el.classList.toggle('clair', clair); }
    } catch (e) {}
  };
  setInterval(contraste, 90);
  const lance = (i) => { const v = vs[i]; v.src = `${DIR}${CLIPS[n++ % CLIPS.length]}.mp4`; v.currentTime = 0; return v.play().catch(() => {}); };
  const prochain = () => { const b = vs[1 - cur]; b.src = `${DIR}${CLIPS[n % CLIPS.length]}.mp4`; b.load(); };
  // every extract plays one second, then a hard cut: the next one is already loaded underneath
  setInterval(() => {
    const a = vs[cur]; if (!a.duration || document.hidden) return;
    if (a.currentTime >= COUPE && !a.dataset.passe) {
      a.dataset.passe = '1'; const b = vs[1 - cur]; n++;
      b.currentTime = 0; b.muted = mode !== 1; b.volume = 0;
      b.play().catch(() => {}).then(() => { b.style.opacity = 1; a.style.opacity = 0; rampe(b, 0, 1); rampe(a, a.volume, 0, () => a.pause()); });
      cur = 1 - cur; b.dataset.passe = '';
      setTimeout(() => { a.dataset.passe = ''; const c = vs[1 - cur]; c.src = `${DIR}${CLIPS[n % CLIPS.length]}.mp4`; c.load(); }, 120);
    }
  }, 30);
  const demarre = () => {
    lance(0).then(() => { vs[0].style.opacity = 1; }); prochain();
    // the name is the site's own logo, and it comes in the way it does everywhere else
    // The title reveal, rebuilt from the Instagram reel frame by frame.
    //  1. a wall of stacked two-line name blocks, tight, edge to edge; it draws itself in concentric rectangular rings,
    //     the outer ring first, every ring all at once, a hole closing in the middle;
    //  2. it holds;
    //  3. the middle collapses first: each block slides to the centre with a delay that grows with its distance from it,
    //     so the middle bunches up while the outer columns stay put, then bow in (an hourglass); the centre block grows;
    //  4. the last slices tear sideways, and the one name is left, full size, and stays.
    // A WebGL pass gives the grain of the reel's dark paper and the sideways tearing. Without WebGL the scene is shown as it is.
    const logo = el.querySelector('.intro-logo'), cv = document.createElement('canvas'), scn = document.createElement('canvas');
    // The reel animation is parked for now (ANIME_NOM): the name shows at once, still, with the real f-l of the logo.
    const ANIME_NOM = true;
    cv.className = 'grille'; if (ANIME_NOM) { logo.before(cv); logo.style.opacity = 0; }
    let rafNom = 0;
    const jouer = (statique) => {
      if (!(window.logoFD && window.logoFD.pret)) return setTimeout(() => jouer(statique), 120);
      cancelAnimationFrame(rafNom);
      const dpr = Math.min(devicePixelRatio || 1, 2), W = el.clientWidth, H = el.clientHeight;
      cv.width = scn.width = Math.round(W * dpr); cv.height = scn.height = Math.round(H * dpr);
      const g = scn.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const px = 100; g.font = `800 ${px}px "Inter Tight"`; g.textBaseline = 'alphabetic';
      if ('letterSpacing' in g) g.letterSpacing = (-.062 * px) + 'px';
      const L1 = 'flavyen', L2 = 'dupont';
      // the f and the l of the logo are one drawn shape: take its path from the logo itself, so the name here keeps it
      const svgFL = logo.querySelector('.fl svg'), pathFL = svgFL && svgFL.querySelector('path');
      let p2d = null, avFL = 0;
      if (pathFL) { const vb = svgFL.getAttribute('viewBox').split(' ').map(Number); p2d = new Path2D(pathFL.getAttribute('d')); avFL = (vb[0] + vb[2]) * px / 1000; }
      const reste = 'avyen';
      // writes the first word at (x, baseline y): the joined f-l, then the other letters
      const ecrireL1 = (c, x, y) => {
        if (!p2d) { c.fillText(L1, x, y); return; }
        c.save(); c.translate(x, y); c.scale(px / 1000, px / 1000); c.fill(p2d); c.restore();
        c.fillText(reste, x + avFL, y);
      };
      const w1 = p2d ? avFL + g.measureText(reste).width : g.measureText(L1).width, w2 = g.measureText(L2).width, bw = Math.max(w1, w2);
      const pasL = px * .9, cap = px * .73, bh = pasL + cap;            // block: two lines, left aligned; its height
      const cx = W / 2, cy = H / 2;
      // the wall: 9 columns edge to edge, the rows share the height; a block fills most of its cell
      const COLS = 9, tw = W / COLS, s0 = (tw * .86) / bw;
      const nr = Math.max(7, Math.round(H / (bh * s0 * 1.18)) | 1), pasY = H / nr, mid = (nr - 1) / 2, cmid = (COLS - 1) / 2;
      const sFin = Math.min(W * .66 / bw, H * .62 / bh);               // the final name: big, centred
      const tuiles = [];
      for (let j = 0; j < nr; j++) for (let i = 0; i < COLS; i++) {
        const dx = i - cmid, dy = j - mid;
        tuiles.push({ dx, dy, anneau: Math.min(i, COLS - 1 - i, j, nr - 1 - j), rn: Math.hypot(dx / cmid, dy / mid) / Math.SQRT2, centre: !dx && !dy });
      }
      const borne = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)));
      const doux = x => x * x * (3 - 2 * x), ez = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const RING0 = 160, RING = 95, C0 = 1450, C1 = 3150, FINAL = 3350;
      const dessinerBloc = (sz) => {
        g.save(); g.scale(sz, sz);
        const y1 = -bh / 2 + cap;
        ecrireL1(g, -bw / 2, y1); g.fillText(L2, -bw / 2, y1 + pasL);
        g.restore();
      };
      const scene = (t) => {
        g.clearRect(0, 0, W, H);
        g.fillStyle = '#e9ebe1';
        const P = ez(borne(C0, C1, t)), grow = doux(borne(.34, 1, P)), K = .9;
        for (const u of tuiles) {
          if (t < RING0 + u.anneau * RING) continue;                    // ring by ring, outside in, each ring at once
          const c = doux(borne(0, 1, P * (1 + K) - K * u.rn));          // the middle goes first
          const al = u.centre ? 1 : 1 - borne(.74, .98, c);
          if (al <= .01) continue;
          const tremble = t < C0 ? (Math.sin(Math.floor(t / 60) * 12.9898 + u.dy * 78.233 + u.dx * 3.1) * 43758.5453 % 1 - .5) * 2.2 : 0;
          const x = cx + u.dx * tw * (1 - c) + tremble, y = cy + u.dy * pasY * (1 - c);
          g.globalAlpha = al; g.save(); g.translate(x, y);
          dessinerBloc(u.centre ? s0 + (sFin - s0) * grow : s0);
          g.restore();
        }
        g.globalAlpha = 1;
        return 1 - borne(C1 - 300, C1 + 40, t);     // how much of the dark paper stays behind
      };
      // the glitch of the reel: a tremble while the wall stands, slices tearing as the last blocks collapse, calm once landed
      const force = t => { const P = borne(C0, C1, t); return Math.min(1, (t < C0 ? .12 : 0) + Math.pow(borne(.5, 1, P), 1.5) * (1 - borne(C1 - 100, C1 + 160, t)) * 1.1); };
      const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
      let prog = null, tex = null, loc = {};
      if (gl) {
        const vs = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
        const fs = `precision highp float;varying vec2 v;uniform sampler2D T;uniform vec2 R;uniform float t,gg,back;
float h(float n){return fract(sin(n*91.3458)*47453.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 u=v; float f=floor(t/55.);
  float band=floor(u.y*30.+h(f)*9.);
  float tear=step(.7,h(band*1.37+f))*(h(band+f*3.1)-.5)*.2*gg;
  float thin=step(.92,h(floor(u.y*200.)+f*2.))*(h(floor(u.y*200.)+f)-.5)*.07*gg;
  u.x+=tear+thin;
  vec4 s=texture2D(T,u);
  float a=s.a*(1.-.08*gg*h(floor(u.y*R.y/2.)+f));
  vec3 txt=s.rgb*a;
  // the dark paper of the reel: near black, faint crumpled light and grain
  float crumple=.5+.5*sin(u.x*13.+sin(u.y*7.+1.3)*2.4)*sin(u.y*11.-sin(u.x*5.)*2.);
  vec3 bg=vec3(.038,.042,.052)+vec3(.012)*crumple+(h2(floor(u.xy*R/1.5)+f)-.5)*.016;
  vec3 col=txt+bg*back*(1.-a);
  float al=a+back*(1.-a);
  gl_FragColor=vec4(col,al);
}`;
        const sh = (ty, src) => { const o = gl.createShader(ty); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : (console.warn(gl.getShaderInfoLog(o)), null); };
        const V = sh(gl.VERTEX_SHADER, vs), F = sh(gl.FRAGMENT_SHADER, fs);
        if (V && F) {
          prog = gl.createProgram(); gl.attachShader(prog, V); gl.attachShader(prog, F); gl.linkProgram(prog);
          gl.useProgram(prog);
          const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
          const pl = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
          tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          for (const n of ['T', 'R', 't', 'gg', 'back']) loc[n] = gl.getUniformLocation(prog, n);
          gl.viewport(0, 0, cv.width, cv.height);
        }
      }
      const c2 = prog ? null : cv.getContext('2d');
      // once landed, the name stops being a flat white shape: it becomes a pane of frosted glass cut in the letters,
      // so the extract shows through it, blurred and lifted, and never needs a black or white switch
      let verreOk = false;
      const verre = el.querySelector('.verre') || el.insertBefore(Object.assign(document.createElement('div'), { className: 'verre' }), cv.nextSibling);
      const poserVerre = () => {
        verreOk = true;
        const m = document.createElement('canvas'); m.width = Math.round(W * dpr); m.height = Math.round(H * dpr);
        const mg = m.getContext('2d'); mg.setTransform(dpr, 0, 0, dpr, 0, 0);
        mg.font = g.font; mg.textBaseline = 'alphabetic'; if ('letterSpacing' in mg) mg.letterSpacing = (-.062 * px) + 'px';
        mg.fillStyle = '#fff'; mg.translate(cx, cy); mg.scale(sFin, sFin);
        const y1 = -bh / 2 + cap; ecrireL1(mg, -bw / 2, y1); mg.fillText(L2, -bw / 2, y1 + pasL);
        const url = `url(${m.toDataURL()})`;
        verre.style.webkitMaskImage = verre.style.maskImage = url;
        verre.classList.add('on'); cv.classList.add('fond');
      };
      // straight to the glass name: no flat name drawn first, no fade from another version of it
      if (statique) { cv.style.transition = 'none'; cv.style.opacity = 0; verre.style.transition = 'none'; poserVerre(); }
      const T0 = performance.now() - (statique ? FINAL + 50 : 0);
      const dessine = (now) => {
        const t = window.__fige != null ? window.__fige : now - T0, back = scene(t);
        if (prog) {
          gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scn);
          gl.uniform1i(loc.T, 0); gl.uniform2f(loc.R, cv.width, cv.height); gl.uniform1f(loc.t, t);
          gl.uniform1f(loc.gg, force(t)); gl.uniform1f(loc.back, back);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        } else {
          c2.clearRect(0, 0, cv.width, cv.height); c2.fillStyle = `rgba(8,9,12,${back})`; c2.fillRect(0, 0, cv.width, cv.height); c2.drawImage(scn, 0, 0);
        }
        if (t >= FINAL && !verreOk) poserVerre();
        if (t < FINAL + 40 || window.__fige != null) rafNom = requestAnimationFrame(dessine);   // then the name stays as drawn
      };
      rafNom = requestAnimationFrame(dessine);
    };
    // only the finished name is kept: the frosted-glass two-line name, straight away, without the wall that builds up
    if (ANIME_NOM) { jouer(true); let redim = 0; addEventListener('resize', () => { clearTimeout(redim); redim = setTimeout(() => jouer(true), 160); }); }
  };
  document.body.classList.add('intro-on');

  // the extracts keep their own sound, with the heavy low Dunkirk-style bed very faint underneath
  const bed = new Audio('riser.m4a'); bed.preload = 'auto'; bed.loop = true; bed.volume = .16;
  const NOMS = ['Sound', 'Sound on'];
  const son = el.querySelector('#introSon');
  son.addEventListener('click', (e) => {
    e.stopPropagation();
    mode = (mode + 1) % 2;
    vs.forEach(v => { v.muted = mode !== 1; v.volume = 1; });
    if (mode === 1) { bed.currentTime = 0; bed.volume = .16; bed.play().catch(() => {}); } else bed.pause();
    son.classList.toggle('actif', mode > 0);
    son.querySelector('.mono').textContent = NOMS[mode];
  });

  // the name is fitted to the width, line by line, so it can never be cropped
  const lignes = [...el.querySelectorAll('h1 span')];
  const ajuste = () => {
    const L = el.clientWidth - 32;
    lignes.forEach(l => { l.style.fontSize = '100px'; l.style.fontSize = (100 * L / l.getBoundingClientRect().width * .985) + 'px'; });
    if (innerWidth < 700) lignes.forEach(l => l.style.fontSize = parseFloat(l.style.fontSize) * .86 + 'px');
    if (innerWidth >= 700) { const m = Math.min(...lignes.map(l => parseFloat(l.style.fontSize))); const k = Math.min(1, (innerHeight * .46) / (m * 1.9)); lignes.forEach(l => l.style.fontSize = parseFloat(l.style.fontSize) * k + 'px'); }
  };
  // no question: it starts at once, silent (a browser only lets sound start from a tap: the Sound button does it)
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { ajuste(); choisir(false); });
  addEventListener('resize', ajuste); ajuste();

  // first the question: sound on or not (the tap is also what lets the browser play sound); the title card starts after the answer
  let started = false;
  const choisir = (oui) => {
    if (started) return; started = true;
    mode = oui ? 1 : 0;
    vs.forEach(v => { v.muted = !oui; v.volume = 1; });
    son.classList.toggle('actif', oui); son.querySelector('.mono').textContent = NOMS[mode];
    if (oui) { bed.currentTime = 0; bed.volume = .16; bed.play().catch(() => {}); }
        demarre(); el.classList.add('in');
  };

  // leaving = the strip->list passage idiom: the picture closes into its foot line (still showing until nearly shut),
  // the name sinks away, the site opens behind with its own entrance (strip fades up, title rises, window opens)
  let out = false;
  const enter = () => {
    if (out) return; out = true;
    const fondu = setInterval(() => { vs.forEach(x => x.volume = Math.max(0, x.volume - .06)); bed.volume = Math.max(0, bed.volume - .02); if (vs[0].volume <= 0) { clearInterval(fondu); bed.pause(); } }, 50);
    const DOUX = 'cubic-bezier(.65,0,.35,1)', SORTIE = 'cubic-bezier(.22,1,.36,1)', cadre = el.querySelector('.cadre');
    const mine = [];
    const a = (e, f, o) => { if (!e) return; const x = e.animate(f, Object.assign({ fill: 'both' }, o)); mine.push(x); return x; };
    // the picture closes onto the line the strip already draws: horizontal on a phone, the vertical playhead on a wide screen
    const ax = (document.querySelector('.axe') || { getBoundingClientRect: () => ({ left: innerWidth / 2, top: innerHeight / 2, width: 1, height: 1 }) }).getBoundingClientRect();
    const horiz = ax.height <= 3;
    const fin = horiz ? `inset(${Math.round(ax.top)}px 0 ${Math.max(0, Math.round(innerHeight - ax.top - 1))}px 0)` : `inset(0 ${Math.max(0, Math.round(innerWidth - ax.left - 1))}px 0 ${Math.round(ax.left)}px)`;
    const D = 1000;
    // the name is gone the moment you enter: no lingering over the site
    [el.querySelector('.intro-logo'), el.querySelector('.grille'), el.querySelector('.verre')].forEach(e => { if (!e) return; e.style.transition = 'none'; e.style.opacity = 0; e.style.visibility = 'hidden'; });
    [el.querySelector('.role'), el.querySelector('#introSon'), el.querySelector('#introEntrer')].forEach(e => a(e, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }));
    a(cadre, [{ clipPath: 'inset(0 0 0 0)', backgroundColor: 'rgba(0,0,0,0)' }, { clipPath: fin, offset: .62, easing: DOUX }, { clipPath: fin, offset: .8 }, { clipPath: fin }], { duration: D });
    vs.forEach(x => a(x, [{ opacity: +getComputedStyle(x).opacity }, { opacity: +getComputedStyle(x).opacity, offset: .36 }, { opacity: 0, offset: .6 }, { opacity: 0 }], { duration: D }));
    a(el.querySelector('.voile'), [{ opacity: 1 }, { opacity: 0, offset: .6 }, { opacity: 0 }], { duration: D });
    a(cadre, [{ backgroundColor: 'rgb(0,0,0)' }, { backgroundColor: 'rgba(12,12,12,.4)', offset: .62 }, { backgroundColor: 'rgba(12,12,12,0)', offset: 1 }], { duration: D, composite: 'replace' });
    // the site's own entrance, same curves and timings as the passage
    const site = document.body;
    site.classList.remove('intro-on'); el.style.background = 'transparent';
    const fond = document.getElementById('bande'), titres = document.getElementById('titres'), fen = document.getElementById('fenetre');
    a(fond, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: D - 520 });
    ['.axe', '#lu', '#regle', '.tete'].forEach(q => document.querySelectorAll(q).forEach(e => a(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: D - 520 })));
    a(titres, [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: D - 700, easing: SORTIE });
    a(fen, [{ opacity: 1, transform: 'translateX(-50%) scaleY(0)' }, { opacity: 1, transform: 'translateX(-50%) scaleY(1)' }], { duration: 700, delay: D - 860, easing: SORTIE });
    setTimeout(() => { el.hidden = true; vs.forEach(x => { x.pause(); x.removeAttribute('src'); x.load(); }); bed.pause(); mine.forEach(x => x.cancel()); }, D + 100);
  };
  el.querySelector('#introEntrer').addEventListener('click', (e) => { e.stopPropagation(); enter(); });
  // a tap anywhere enters
  el.addEventListener('click', () => { if (started) enter(); });
  addEventListener('keydown', e => {
    if (el.hidden) return;
    if (!started) return;
    if (e.key === 'Enter') { e.preventDefault(); enter(); }
  });
  let y0 = null;
  el.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchmove', e => { if (y0 !== null && y0 - e.touches[0].clientY > 60) enter(); }, { passive: true });
  el.addEventListener('wheel', e => { if (e.deltaY > 20) enter(); }, { passive: true });
})();

/* ==========================================================================
   app.js — BEHAVIOR. Words and pictures live in rooms.js, not here.

   Sections (search for the number to jump):
     1. SETTINGS            numbers you can tweak (brush size, swipe distance...)
     2. HELPERS             small tools used everywhere
     3. HOME PAGE           name, intro, tiles, footer
     4. ROOM TEMPLATES      the HTML of each room type (one function per type)
     5. ROOM INTERACTIONS   scribble eraser, spine poem, before/after slider
     6. PREVIOUS / NEXT     buttons, swipe, arrow keys
     7. ROUTER              opens and closes rooms from the # in the address
   ========================================================================== */
(() => {
"use strict";


/* ---------- 1. SETTINGS ---------- */
const SETTINGS = {
  wipeMs: 400,          // length of the color wipe between rooms
  brushSize: 90,        // scribble eraser: minimum size in px (bigger = easier to uncover)
  brushRatio: 0.18,     // scribble eraser: or this share of the drawing width, whichever is larger
  swipeDistance: 60,    // px a finger must travel sideways to count as a swipe
  eagerTiles: 4         // how many home tiles load right away (the rest load as you scroll)
};


/* ---------- 2. HELPERS ---------- */
const $ = (sel, from = document) => from.querySelector(sel);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const vars = r => `--c:${r.color};--s:${r.shadow};--ink:${r.ink}`;     // each room's colors, passed to the CSS
const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;

const roomEl = $("#room"), wipeEl = $("#wipe"), pagerEl = $("#pager");
const pageParts = [...document.querySelectorAll("header.top, main, footer")];   // hidden from keyboard while a room is open
const HOME_TITLE = document.title;


/* ---------- 3. HOME PAGE ---------- */
function renderHome() {
  $("#h1").textContent = SITE.name;
  $("#nm").textContent = SITE.name;
  $("#intro").textContent = SITE.intro;
  $("#ft").innerHTML = esc(SITE.className) +
    (SITE.email ? `. Contact: <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : "");
  // alt is empty on purpose: the caption already names the piece, so screen readers don't hear it twice
  $("#grid").innerHTML = ROOMS.map((r, i) =>
    `<a class="tile t-${r.id}" href="#${r.id}" style="${vars(r)}">
       <img src="${r.tile}" alt="" loading="${i < SETTINGS.eagerTiles ? "eager" : "lazy"}" decoding="async">
       <span class="cap"><b>${esc(r.title)}</b><span>${esc(r.medium)}</span></span></a>`).join("");
}


/* ---------- 4. ROOM TEMPLATES ----------
   Each function returns the HTML for one room type. To change a room's layout, edit its function
   here and its styles in css/styles.css (sections marked ROOM). */
const shell   = (r, inner) => `<section class="room r-${r.type}" style="${vars(r)}">${inner}</section>`;
const heading = r => `<h2>${esc(r.title)}</h2><p class="sub">${esc(r.medium)}, ${r.year}</p>`;
const note    = r => r.note ? `<p class="note">${esc(r.note)}</p>` : "";

const TEMPLATES = {

  scribble: r => shell(r, `${heading(r)}
    <div class="paper art">
      <img src="${r.img}" width="1000" height="1333" alt="${esc(r.alt)}">
      <canvas role="img" aria-label="Black scribbles covering the drawing. Rub over them to uncover it, or press Show all."></canvas>
      <i class="brush"></i>
    </div>
    <p class="hint">Rub the black away to see the drawing.</p>
    <button class="btn" data-act="all">Show all</button>${note(r)}`),

  spines: r => shell(r, `<h2>${esc(r.title)}</h2>${note(r)}
    ${r.shelves.map(s => `<div class="shelf">
      <div class="pic art"><img src="${s.img}" width="${s.w}" height="${s.h}" alt="${esc(s.alt)}" loading="lazy">
        ${s.lines.map((l, i) => `<button class="band" data-i="${i}" style="top:${l.y}%;height:${l.h}%" aria-label="${esc(l.t)}"></button>`).join("")}
      </div>
      <ol class="poem">${s.lines.map((l, i) => `<li data-i="${i}">${esc(l.t)}</li>`).join("")}</ol></div>`).join("")}`),

  blackout: r => {
    let n = 0;   // counts bars so they animate one after another
    const bar = w => `<span class="bar" style="flex:${w ? `0 0 ${w}%` : "1"};--i:${n++}"></span>`;
    const rows = r.rows.map(x => `<div class="row">${bar(x[0])}${x[1] ? `<mark>${esc(x[1])}</mark>${bar(0)}` : ""}</div>`).join("");
    return shell(r, `${heading(r)}
      <div class="bo">
        <figure><div class="doc art" role="img" aria-label="A page of text blacked out except the words: ${esc(r.poem)}">${rows}</div>
          <figcaption>The page, recreated</figcaption></figure>
        <figure><img class="art" src="${r.img}" width="900" height="1200" alt="${esc(r.alt)}"><figcaption>The finished piece</figcaption></figure>
      </div>
      <p class="big">${esc(r.poem)}</p>${note(r)}`);
  },

  coffee: r => shell(r, `${heading(r)}
    <div class="cof art"><img src="${r.img}" width="${r.w}" height="${r.h}" alt="${esc(r.alt)}"></div>${note(r)}`),

  ai: r => shell(r, `<h2>${esc(r.title)}</h2>
    <div class="frame art" role="group" aria-label="Before and after slider">
      <img src="${r.before}" width="930" height="668" alt="Original painting">
      <img class="top" src="${r.after}" width="930" height="668" alt="Reworked painting">
      <span class="lbl l">Original</span><span class="lbl r">Reworked</span><span class="line"></span><span class="knob" aria-hidden="true">↔</span>
      <input type="range" min="0" max="100" value="50" aria-label="Reveal the reworked painting">
    </div>
    <p class="cap">${esc(r.cap)}</p>
    ${r.tool ? `<p class="cap">Made with ${esc(r.tool)}${r.prompt ? `. Prompt: “${esc(r.prompt)}”` : ""}</p>` : ""}${note(r)}`),

  time: r => shell(r, `<h2>${esc(r.title)}</h2>
    <div class="tm"><div class="paint"><img src="${r.img}" width="${r.w}" height="${r.h}" alt="${esc(r.alt)}"></div>
      <div><ol class="era">${r.eras.map(e => `<li><b>${esc(e[0])}</b>${esc(e[1])}</li>`).join("")}</ol>${note(r)}</div></div>`),

  finals: r => shell(r, `<h2>${esc(r.title)}</h2>
    <div class="vid"><video controls playsinline preload="none" poster="${r.poster}" aria-label="${esc(r.alt)}">
      <source src="${r.video}" type="video/mp4">${r.captions ? `<track kind="captions" src="${r.captions}" srclang="en" label="English" default>` : ""}</video></div>
    ${note(r)}
    ${r.describe ? `<details class="transcript"><summary>Describe this video</summary><p>${esc(r.describe)}</p></details>` : ""}`)
};


/* ---------- 5. ROOM INTERACTIONS ----------
   Runs after a room is drawn. Only some room types need one. */
const INTERACTIONS = {

  /* Scribble: rub away the black. Brush size is set in SETTINGS. */
  scribble(el) {
    const cv = $("canvas", el), hint = $(".hint", el), ring = $(".brush", el);
    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    const size = Math.max(SETTINGS.brushSize, w * SETTINGS.brushRatio);
    cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext("2d"); c.scale(dpr, dpr);

    // paint the black cover with faint scribble lines
    c.fillStyle = "#121212"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(255,255,255,.1)"; c.lineWidth = 1.4;
    for (let i = 0; i < 90; i++) {
      let x = Math.random() * w, y = Math.random() * h; c.beginPath(); c.moveTo(x, y);
      for (let j = 0; j < 14; j++) { x += (Math.random() - .5) * w * .5; y += (Math.random() - .5) * h * .2; c.lineTo(x, y); }
      c.stroke();
    }

    // the eraser, plus a dashed circle that shows its size under a mouse
    ring.style.width = ring.style.height = size + "px";
    let last = null, down = false, strokes = 0;
    const at = e => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const erase = p => {
      c.globalCompositeOperation = "destination-out"; c.lineWidth = size; c.lineCap = c.lineJoin = "round";
      c.beginPath(); c.moveTo((last || p).x, (last || p).y); c.lineTo(p.x, p.y); c.stroke();
      last = p; if (++strokes > 40) hint.classList.add("done");
    };
    cv.addEventListener("pointerdown", e => { down = true; last = null; cv.setPointerCapture(e.pointerId); erase(at(e)); });
    cv.addEventListener("pointermove", e => {
      const p = at(e), mouse = e.pointerType === "mouse";
      ring.style.transform = `translate(${p.x - size / 2}px,${p.y - size / 2}px)`;
      ring.style.opacity = mouse ? 1 : 0;
      if (down || mouse) erase(p);          // a mouse erases on hover; touch and pen erase while pressed
    });
    cv.addEventListener("pointerup", () => { down = false; last = null; });
    cv.addEventListener("pointerleave", () => { last = null; ring.style.opacity = 0; });
    $("[data-act=all]", el).onclick = () => { cv.style.transition = "opacity .8s"; cv.style.opacity = 0; cv.style.pointerEvents = "none"; };
  },

  /* Spines: hover, focus or tap a book to light up its poem line (and the reverse). */
  spines(el) {
    el.querySelectorAll(".shelf").forEach(shelf => {
      const items = [...shelf.querySelectorAll("[data-i]")];
      const light = i => items.forEach(n => n.classList.toggle("on", n.dataset.i === String(i)));
      items.forEach(n => ["mouseenter", "focus", "click"].forEach(ev => n.addEventListener(ev, () => light(n.dataset.i))));
      light(0);
    });
  },

  /* AI: drag the slider to reveal the reworked painting. */
  ai(el) {
    const frame = $(".frame", el);
    $("input", frame).addEventListener("input", e => frame.style.setProperty("--p", e.target.value + "%"));
  }
};


/* ---------- 6. PREVIOUS / NEXT ----------
   Buttons at the bottom, left/right arrow keys, and swiping. All wrap around. */
function renderPager(i) {
  const n = ROOMS.length, prev = ROOMS[(i - 1 + n) % n], next = ROOMS[(i + 1) % n];
  pagerEl.innerHTML =
    `<a class="pg prev" href="#${prev.id}" aria-label="Previous piece: ${esc(prev.title)}">← Previous<small>${esc(prev.title)}</small></a>
     <span class="pos" aria-live="polite">${i + 1} of ${n}</span>
     <a class="pg next" href="#${next.id}" aria-label="Next piece: ${esc(next.title)}">Next →<small>${esc(next.title)}</small></a>`;
}

function step(dir) {                       // dir = 1 (next) or -1 (previous)
  if (!target) return;
  const n = ROOMS.length;
  location.hash = ROOMS[(ROOMS.indexOf(target) + dir + n) % n].id;
}

addEventListener("keydown", e => {
  if (!target) return;
  if (e.key === "Escape") location.hash = "home";
  const typing = e.target.closest("input, video, textarea");      // the slider and video use the arrow keys themselves
  if (!typing && e.key === "ArrowRight") step(1);
  if (!typing && e.key === "ArrowLeft") step(-1);
});

let swipe = null;
roomEl.addEventListener("touchstart", e => {
  const t = e.touches[0];
  // don't swipe from the eraser, slider or video, and ignore pinch gestures
  const blocked = e.touches.length > 1 || e.target.closest("canvas, input, video");
  swipe = blocked ? null : { x: t.clientX, y: t.clientY };
}, { passive: true });
roomEl.addEventListener("touchend", e => {
  if (!swipe || !target) return;
  const t = e.changedTouches[0], dx = t.clientX - swipe.x, dy = t.clientY - swipe.y;
  swipe = null;
  if (Math.abs(dx) >= SETTINGS.swipeDistance && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
}, { passive: true });


/* ---------- 7. ROUTER ----------
   target = the room the address asks for (updated at once, so fast taps can't get out of sync)
   shown  = the room currently drawn (updated when the wipe covers the screen) */
let target = null, shown = null, token = 0;

function draw(r) {
  const leaving = shown;
  if (r) {
    roomEl.innerHTML = TEMPLATES[r.type](r);
    roomEl.className = "on"; roomEl.scrollTop = 0;
    renderPager(ROOMS.indexOf(r));
    document.body.classList.add("in-room"); document.body.style.overflow = "hidden";
    document.title = `${r.title} — ${SITE.name}`;
    pageParts.forEach(p => p.inert = true);                 // keyboard and screen readers stay inside the room
    INTERACTIONS[r.type] && INTERACTIONS[r.type](roomEl);
    roomEl.focus({ preventScroll: true });
  } else {
    roomEl.className = ""; roomEl.innerHTML = "";
    document.body.classList.remove("in-room"); document.body.style.overflow = "";
    document.title = HOME_TITLE;
    pageParts.forEach(p => p.inert = false);
    const tile = leaving && $(`.tile[href="#${leaving.id}"]`);
    if (tile) tile.focus({ preventScroll: true });          // put focus back on the tile you came from
  }
  shown = r;
}

function route() {
  const next = ROOMS.find(x => x.id === location.hash.slice(1)) || null;
  if (next === target) return;
  const from = target; target = next;
  if (reduceMotion) return draw(next);

  const mine = ++token;
  wipeEl.style.background = (next || from).color;
  wipeEl.style.transition = "none"; wipeEl.style.transform = "translateY(100%)"; wipeEl.offsetWidth;
  wipeEl.style.transition = `transform ${SETTINGS.wipeMs - 20}ms cubic-bezier(.7,0,.3,1)`; wipeEl.style.transform = "translateY(0)";
  setTimeout(() => {
    if (mine !== token) return;                             // a newer tap took over: let it draw
    draw(next);
    wipeEl.style.transform = "translateY(-100%)";
  }, SETTINGS.wipeMs);
}


/* ---------- START ---------- */
renderHome();
addEventListener("hashchange", route);
route();
})();

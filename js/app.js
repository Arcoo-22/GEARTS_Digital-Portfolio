/* ==========================================================================
   app.js — BEHAVIOR. Words, pictures and links live in rooms.js, not here.
     1 SETTINGS  2 HELPERS  3 ARTWORK TEMPLATES + INTERACTIONS (unchanged from before)
     4 PAGE CHROME (hero, index, footer)  5 HORIZONTAL RAILS  6 VIDEO  7 MUSIC  8 PHOTO + MANGA
     9 SCROLL MOTION  10 START
   ========================================================================== */
(() => {
"use strict";

/* ---------- 1. SETTINGS ---------- */
const SETTINGS = {
  brushSize: 90,      // scribble eraser: minimum size in px (bigger = easier to uncover)
  brushRatio: 0.18    // scribble eraser: or this share of the drawing width, whichever is larger
};

/* ---------- 2. HELPERS ---------- */
const $ = (sel, from = document) => from.querySelector(sel);
const $$ = (sel, from = document) => [...from.querySelectorAll(sel)];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const vars = r => `--c:${r.color};--s:${r.shadow};--ink:${r.ink}`;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;
const mmss = s => isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00";

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




/* ---------- 4. PAGE CHROME ---------- */
function renderChrome() {
  $("#nm").textContent = SITE.name;
  const w = SITE.name.split(" "), last = w.pop();
  $("#h1").innerHTML = [w.join(" "), last].filter(Boolean).map((t, i) => `<span class="ln"><span style="--i:${i}">${esc(t)}</span></span>`).join("");
  $("#h1").setAttribute("aria-label", SITE.name);
  $("#intro").textContent = SITE.intro;
  $("#ft").innerHTML = esc(SITE.className) + (SITE.email ? `. Contact: <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : "");

  // floating cards in the hero: [x %, y %, size in vmin, depth px, tilt deg]
  const spots = [[13,27,19,-80,-7],[87,29,20,40,6],[27,78,17,120,4],[82,80,16,-150,-5],[50,11,13,-320,2],[5,60,13,-260,8],[95,62,13,-240,-6],[62,90,14,200,3],[40,92,13,-100,-4]];
  const pics = [...ROOMS.map(r => ({ src: r.tile, c: r.color, s: r.shadow, ink: r.ink })),
    { src: "img/music-cover.webp", c: "#1ED760", s: "#14120C", ink: "#14120C" }, { src: "img/manga-gojo.webp", c: "#F3F1EA", s: "#14120C", ink: "#14120C" }];
  const order = [0, 5, 3, 4, 2, 1, 6, 8, 7];            // which picture goes in which spot
  $("#cards").innerHTML = spots.map((p, i) => { const x = pics[order[i]];
    return `<div class="card" style="--x:${p[0]}%;--y:${p[1]}%;--w:clamp(90px,${p[2]}vmin,260px);--d:${p[3]}px;--r:${p[4]}deg;--a:${-i * 1.1}s;--c:${x.c};--s:${x.s};--ink:${x.ink}"><img src="${x.src}" alt="" ${i > 3 ? 'loading="lazy"' : ""}></div>`; }).join("");

  $("#idx").innerHTML = ROOMS.map(r => `<a class="tile t-${r.id}" href="#${r.id}" style="${vars(r)}"><img src="${r.tile}" alt="" loading="lazy"><b>${esc(r.title)}</b></a>`).join("");

  $("#rooms").innerHTML = ROOMS.map(r => TEMPLATES[r.type](r).replace('<section class="room', `<section id="${r.id}" class="room`)).join("");
  ROOMS.forEach(r => INTERACTIONS[r.type] && INTERACTIONS[r.type]($("#" + r.id)));
  $$(".room .pic, .room .cof, .room .paint, .room .bo figure").forEach(n => n.classList.add("tilt"));   // 3D lean while scrolling
}


/* ---------- 5. HORIZONTAL RAILS (analysis + appendices) ----------
   Drag, swipe, arrow keys or the buttons. Cards turn in 3D as they leave the center. */
function rail(el, ui, label, items, extra = "") {
  el.tabIndex = 0; el.setAttribute("role", "region"); el.setAttribute("aria-label", label); el.innerHTML = items;
  ui.innerHTML = `<button class="rb" data-d="-1" aria-label="Previous">←</button><button class="rb" data-d="1" aria-label="Next">→</button><div class="trk"><i></i></div><span class="cnt"></span>${extra}`;
  const kids = [...el.children], cnt = $(".cnt", ui), trk = $(".trk", ui);
  let raf = 0;
  const update = () => {
    raf = 0; let best = 0, bd = 1e9;
    kids.forEach((k, i) => {
      const d = k.offsetLeft + k.offsetWidth / 2 - el.scrollLeft - el.clientWidth / 2, o = clamp(d / el.clientWidth, -1, 1);
      k.style.setProperty("--o", reduceMotion ? 0 : o.toFixed(3)); k.style.setProperty("--a", reduceMotion ? 0 : Math.abs(o).toFixed(3));
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
    });
    cnt.textContent = `${best + 1} / ${kids.length}`;
    trk.style.setProperty("--v", (el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)).toFixed(3));
  };
  const req = () => raf || (raf = requestAnimationFrame(update));
  el.addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); update();
  ui.addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (b) el.scrollBy({ left: b.dataset.d * (kids[0].offsetWidth + 24), behavior: reduceMotion ? "auto" : "smooth" }); });
  let down = false, sx = 0, sl = 0, moved = 0;                       // mouse drag
  el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = el.scrollLeft; moved = 0; });
  addEventListener("pointermove", e => { if (!down) return; moved = Math.max(moved, Math.abs(e.clientX - sx)); if (moved > 5) el.classList.add("drag"); el.scrollLeft = sl - (e.clientX - sx); });
  addEventListener("pointerup", () => { if (down) { down = false; setTimeout(() => el.classList.remove("drag")); } });
  el.addEventListener("click", e => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
}

/* Flex carousel (appendices): one folder is open, the rest fold back narrow. Click, arrow keys, buttons or swipe. */
function flexRail(el, ui, label, items) {
  el.classList.add("fx"); el.tabIndex = -1; el.setAttribute("role", "group"); el.setAttribute("aria-label", label); el.innerHTML = items;
  ui.innerHTML = `<button class="rb" data-d="-1" aria-label="Previous">←</button><button class="rb" data-d="1" aria-label="Next">→</button><div class="trk"><i></i></div><span class="cnt"></span>`;
  const kids = [...el.children]; let cur = 0, run = 0;
  const follow = () => {                                   // keep the open folder centered while the widths animate
    const end = performance.now() + 750; cancelAnimationFrame(run);
    const tick = () => { const k = kids[cur], t = k.offsetLeft + k.offsetWidth / 2 - el.clientWidth / 2;
      el.scrollLeft += (t - el.scrollLeft) * (reduceMotion ? 1 : .22); if (performance.now() < end) run = requestAnimationFrame(tick); };
    tick();
  };
  const open = (i, move = true) => {
    cur = clamp(i, 0, kids.length - 1);
    kids.forEach((k, j) => { k.classList.toggle("on", j === cur); k.setAttribute("aria-expanded", j === cur); $(".in", k).inert = j !== cur; });
    $(".cnt", ui).textContent = `${cur + 1} / ${kids.length}`; $(".trk", ui).style.setProperty("--v", cur / Math.max(1, kids.length - 1));
    if (move) follow();
  };
  kids.forEach((k, i) => { k.tabIndex = 0; k.setAttribute("role", "button"); k.setAttribute("aria-label", $(".vt", k).textContent);
    k.addEventListener("click", e => { if (i !== cur) { e.preventDefault(); open(i); } });
    k.addEventListener("keydown", e => { if (e.target === k && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(i); } }); });
  el.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); open(cur + (e.key === "ArrowRight" ? 1 : -1)); kids[cur].focus({ preventScroll: true }); } });
  ui.addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (b) open(cur + +b.dataset.d); });
  open(0, false);
}

function renderRails() {
  $("#anT").textContent = ANALYSIS.title; $("#anB").textContent = ANALYSIS.blurb;
  rail($("#anHS"), $("#anUI"), "Written analysis pages",
    Array.from({ length: ANALYSIS.pages }, (_, i) => `<figure class="pg"><img src="img/analysis/page-${String(i + 1).padStart(2, "0")}.webp" width="935" height="1210" alt="Page ${i + 1} of the written analysis" draggable="false" ${i > 1 ? 'loading="lazy"' : ""}></figure>`).join(""),
    ANALYSIS.pdf ? `<a class="pill" href="${esc(ANALYSIS.pdf)}" download>Download PDF</a>` : "");
  flexRail($("#apHS"), $("#apUI"), "Appendices: proofs and references",
    APPENDICES.map(a => `<article class="fold" data-kind="${esc(a.kind)}"><span class="vt">${esc(a.title)}</span><div class="in"><span class="tag">${esc(a.kind)}</span><b>${esc(a.title)}</b><p>${esc(a.text)}</p>
      ${a.img ? `<img class="pf" src="${esc(a.img)}" alt="${esc(a.title)}" loading="lazy" draggable="false">` : a.kind === "Proof" ? `<div class="ph">Image to be added</div>` : ""}
      ${a.link ? `<a href="${esc(a.link)}" target="_blank" rel="noopener">Open source</a>` : ""}</div></article>`).join(""));
}


/* ---------- 6. VIDEO (YouTube) ---------- */
function renderVideo() {
  const m = VIDEO.url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/), id = m && m[1];
  const t0 = new Date().getFullYear();
  $("#vidWrap").innerHTML = `<h2 class="rv">${esc(VIDEO.title)}</h2><p class="lede">${esc(VIDEO.blurb)}</p>
    <div class="clap" aria-hidden="true"><div class="arm"></div><div class="body"><b>${esc(ANALYSIS.title)}</b><span>Take 1</span><span>Directed by ${esc(SITE.name)}</span><span>${t0}</span></div></div>
    <div class="curt"><div class="screen" id="screen">${id
      ? `<button type="button" aria-label="Play the video analysis" style="background-image:url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)"><span class="play"></span></button>`
      : `<div class="bars" role="img" aria-label="Test pattern. The video analysis is coming soon."><p>Stand by. The video analysis is coming soon.</p></div>`}</div>
      <i class="drape l"></i><i class="drape r"></i></div>
    <div class="chap">${VIDEO.chapters.map(c => `<button type="button" data-t="${c.t}" ${id ? "" : 'aria-disabled="true"'}>${esc(c.name)} <small>${mmss(c.t)}</small></button>`).join("")}</div>`;
  const play = t => { if (!id) return; $("#screen").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&start=${t}" title="${esc(VIDEO.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`; };
  $("#vidWrap").addEventListener("click", e => { if (e.target.closest("#screen button")) play(0); const c = e.target.closest("[data-t]"); if (c) play(+c.dataset.t); });
}


/* ---------- 7. MUSIC (Spotify-style player) ---------- */
function renderMusic() {
  const ico = { play: '<svg viewBox="0 0 24 24" class="i-play" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg><svg viewBox="0 0 24 24" class="i-pause" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>' };
  $("#music").innerHTML = `<div class="wrap" id="player">
    <div class="m-head"><div class="disc"><span class="vinyl"></span><img class="sleeve" src="${SONG.cover}" alt="Cover art for ${esc(SONG.title)}"></div>
      <div class="m-meta"><small>Song</small><h2 class="rv">${esc(SONG.title)}</h2><p>${esc(SONG.artist)} <span>• ${SONG.year}</span></p></div></div>
    <div class="m-ctl"><button class="big-play" id="pp" aria-label="Play">${ico.play}</button>
      <button class="ic" id="lp" aria-pressed="false" aria-label="Repeat">Repeat</button><div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <label class="vol">Volume <input id="vol" type="range" min="0" max="1" step=".05" value="1"></label></div>
    <div class="list"><div class="row-t"><span class="n">1</span><b>${esc(SONG.title)}</b><span id="dur">0:00</span></div></div>
    <div class="bar-p"><span id="cur">0:00</span><input id="seek" type="range" min="0" max="1000" value="0" aria-label="Seek"><span id="rem">0:00</span></div>
    <p class="m-note">${esc(SONG.note)}</p><audio id="aud" src="${SONG.file}" preload="metadata"></audio></div>`;
  const a = $("#aud"), box = $("#player"), pp = $("#pp"), seek = $("#seek");
  const state = () => { box.classList.toggle("playing", !a.paused); pp.setAttribute("aria-label", a.paused ? "Play" : "Pause"); };
  pp.onclick = () => a.paused ? a.play() : a.pause();
  ["play", "pause", "ended"].forEach(ev => a.addEventListener(ev, state));
  a.addEventListener("loadedmetadata", () => { $("#dur").textContent = $("#rem").textContent = mmss(a.duration); });
  a.addEventListener("timeupdate", () => { if (!seek.matches(":active")) seek.value = a.duration ? a.currentTime / a.duration * 1000 : 0; $("#cur").textContent = mmss(a.currentTime); $("#rem").textContent = mmss(a.duration); });
  seek.oninput = () => { if (a.duration) a.currentTime = seek.value / 1000 * a.duration; };
  $("#vol").oninput = e => a.volume = e.target.value;
  $("#lp").onclick = e => { a.loop = !a.loop; e.target.setAttribute("aria-pressed", a.loop); };
}


/* ---------- 8. PHOTOGRAPHY + MANGA ---------- */
function renderPhotoManga() {
  $("#photoPin").innerHTML = `<div class="ph-bg" style="background-image:url(${PHOTO.img})"></div>
    <div class="ph-win"><div class="ph-fr"><img src="${PHOTO.img}" width="${PHOTO.w}" height="${PHOTO.h}" alt="${esc(PHOTO.alt)}"></div></div>
    <div class="ph-ttl"><h2>${esc(PHOTO.title)}</h2><p>${esc(PHOTO.caption)}</p></div>
    <div class="ph-info"><p>${esc(PHOTO.note)}</p><dl>${PHOTO.details.map(d => `<dt>${esc(d[0])}</dt><dd>${esc(d[1])}</dd>`).join("")}</dl></div>`;
  const M = MANGA;
  $("#manga").innerHTML = `<div class="mg">
    <figure class="pn a" style="margin:0"><img src="${M.img}" width="${M.w}" height="${M.h}" alt="${esc(M.alt)}" loading="lazy"></figure>
    <div class="pn b"><span class="vt" aria-hidden="true">呪術廻戦</span><h2>${esc(M.title.toUpperCase())}</h2></div>
    <div class="pn c" aria-hidden="true"><p class="sfx">ゴゴゴ</p></div>
    <div class="pn d"><div class="bub">${esc(M.bubble)}</div><p>${esc(M.note)}</p><small>${esc(M.sub)}. ${esc(M.medium)}, ${M.year}</small></div></div>`;
}


/* ---------- 9. SCROLL MOTION ----------
   One scroll listener drives: hero push-in, section iris, photo mask, 3D lean, nav highlight. */
function motion() {
  const hero = $("#top"), stage = $("#stage"), txt = $("#heroTxt"), photo = $("#photography"), pin = $("#photoPin");
  const rooms = $$(".room"), tilts = $$(".tilt"), links = $$("#nav nav a"), ids = links.map(l => l.getAttribute("href").slice(1));
  const sections = ids.map(i => $("#" + i));

  // mask reveals: headings, framed artwork and panels open as they enter view
  const pending = new Set([...$$(".room h2, .room .art, .room .big, .sec h2, .work h2, .m-meta h2"), ...$$(".pn, .curt")]);
  pending.forEach(n => { if (!n.classList.contains("pn") && !n.classList.contains("curt")) n.classList.add("rv"); });
  const reveal = vh => pending.forEach(n => { if (n.getBoundingClientRect().top < vh * .86) {
    n.classList.add("in"); pending.delete(n);
    if (n.classList.contains("curt")) setTimeout(() => $(".clap").style.setProperty("--k", 0), 1100);
  } });

  // pointer depth in the hero
  hero.addEventListener("pointermove", e => { if (reduceMotion) return; stage.parentNode.querySelector(".cards").style.cssText += `;--rx:${((e.clientX / innerWidth - .5) * 12).toFixed(2)}deg;--ry:${(-(e.clientY / innerHeight - .5) * 9).toFixed(2)}deg`; });

  let busy = false;
  const frame = () => {
    busy = false; const vh = innerHeight, sy = scrollY;
    document.documentElement.style.setProperty("--sp", (sy / Math.max(1, document.documentElement.scrollHeight - vh)).toFixed(4));

    // active nav link = the last section whose top has passed 40% of the screen
    let on = -1; sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * .4) on = i; });
    links.forEach((l, i) => { l.classList.toggle("on", i === on); i === on ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current"); });

    reveal(vh);
    rooms.forEach(r => { const t = r.getBoundingClientRect().top; if (t < vh * .6) r.classList.add("seen"); if (!reduceMotion) r.style.setProperty("--e", clamp((t - vh * .1) / (vh * .6)).toFixed(3)); });
    if (reduceMotion) return;

    const h = hero.getBoundingClientRect(), p = clamp(-h.top / (h.height - vh));       // hero push-in
    stage.style.setProperty("--z", (1 + Math.pow(p, 1.6) * 3.2).toFixed(3)); stage.style.opacity = 1 - clamp((p - .7) / .3);
    txt.style.setProperty("--o", (1 - clamp(p / .35)).toFixed(3)); hero.style.setProperty("--o", (1 - clamp(p / .35)).toFixed(3));

    const ph = photo.getBoundingClientRect(), q = clamp(-ph.top / (ph.height - vh)), kk = 1 - clamp(q / .6);   // photo mask opens
    pin.style.setProperty("--k", (kk * kk).toFixed(3));

    tilts.forEach(n => { const b = n.getBoundingClientRect(); n.style.setProperty("--t", clamp(((b.top + b.height / 2) - vh / 2) / (vh / 2), -1, 1).toFixed(3)); });
  };
  const req = () => busy || (busy = true, requestAnimationFrame(frame));
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); frame();
}


/* ---------- 10. START ---------- */
renderChrome(); renderRails(); renderVideo(); renderMusic(); renderPhotoManga(); motion();
})();

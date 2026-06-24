/* ==========================================================================
   MEMORY ENGINE  |  versie 1.16
   --------------------------------------------------------------------------
   JE HOEFT DIT BESTAND NOOIT AAN TE PASSEN.
   Host het op een publieke URL en verwijs ernaar vanuit memory-config.html.

   Cache-busting: voeg ?v=VERSIENUMMER toe aan de script-src URL in
   memory-config.html, zodat browsers de nieuwe versie ophalen.
   Voorbeeld: <script src="...memory-engine.js?v=1.0">
   ========================================================================== */
(function(global){
"use strict";

var VERSION = "1.0";

var CSS_TEXT=`
/* =========================================================================
   MEMORY — basis-CSS
   Kleuren/lettertypen/afmetingen worden bij laden overschreven vanuit CONFIG.
   Je hoeft dit blok normaal NIET aan te passen — pas CONFIG aan.
   ========================================================================= */

*, *::before, *::after { box-sizing: border-box; }

html, body {
  background-color: transparent;
  height: auto; min-height: auto;
  margin: 0; padding: 0;
}

body {
  font-family: var(--mem-font-body);
  font-size: var(--mem-body-size);
  color: var(--mem-text);
  padding: 20px;
}

/* ---- Header ---- */
.mem-header {
  position: relative;
  z-index: 1001;
  text-align: center;
  margin-bottom: 20px;
  max-width: var(--mem-max-width);
  margin-left: auto; margin-right: auto;
}
.mem-title {
  font-family: var(--mem-font-heading);
  font-size: var(--mem-heading-size);
  color: var(--mem-primary);
  margin: 0 0 16px;
}

/* ---- Statsbalk ---- */
.mem-stats {
  position: relative;
  z-index: 1001;
  display: flex;
  justify-content: space-around;
  background: var(--mem-stats-bg);
  padding: 13px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,.08);
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}
.mem-stat       { font-family: var(--mem-font-heading); font-weight: 700; font-size: 1.05rem; }
.mem-timer      { font-family: var(--mem-font-heading); font-weight: 700; font-size: 1.05rem;
                  min-width: 60px; text-align: center; transition: color .2s; }
.mem-timer.warning { color: var(--mem-timer-warning); }
.mem-score-display { font-family: var(--mem-font-heading); font-weight: 700; font-size: 1.05rem; }

/* ---- Kaartenraster ---- */
.mem-grid {
  display: grid;
  grid-template-columns: repeat(var(--mem-columns), 1fr);
  gap: var(--mem-gap);
  max-width: var(--mem-max-width);
  margin: 0 auto;
}

/* ---- Kaart ---- */
.mem-card {
  container-type: inline-size;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
  border: none;
  background: none;
  padding: 0;
  width: 100%;
}
.mem-card-inner {
  position: relative; width: 100%; height: 100%;
  transition: transform var(--mem-flip-ms) cubic-bezier(.4,0,.2,1);
  transform-style: preserve-3d;
  border-radius: var(--mem-card-radius);
}
.mem-card.flipped .mem-card-inner { transform: rotateY(180deg); }

.mem-face {
  position: absolute; width: 100%; height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: var(--mem-card-radius);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 8px rgba(0,0,0,.25);
  overflow: hidden;
  transition: background-color 200ms ease, color 200ms ease;
}
.mem-face-front {
  background-color: var(--mem-card-front-bg);
  color: var(--mem-card-front-text);
  background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,.35) 1px, transparent 0);
  background-size: 15px 15px;
}
.mem-face-front.has-image { background-image: none; }
.mem-face-front img { width: 100%; height: 100%; object-fit: cover; }

.mem-face-back {
  background-color: var(--mem-card-back-bg);
  color: var(--mem-card-back-text);
  transform: rotateY(180deg);
}
.mem-face-back.image-cell { padding: 0; }
.mem-face-back img { width: 100%; height: 100%; object-fit: cover; }
.mem-face-back span {
  display: block;
  width: 100%;
  padding: 8px;
  font-family: var(--mem-font-body);
  font-size: clamp(10px, 9cqw, 15px);
  hyphens: manual;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
  overflow-wrap: break-word; /* breek woord alleen als het niet op één volle regel past */
  word-break: normal;         /* normale regelafbreking op woordgrenzen */
  text-align: center;
  line-height: 1.3;
}

/* Hover: JS-gestuurd via .hover-self / .hover-partner (na 'Resultaten bekijken') */
.mem-card.hover-self .mem-face-back,
.mem-card.hover-partner .mem-face-back {
  background-color: var(--mem-card-hover-bg) !important;
  color: var(--mem-card-hover-text) !important;
}

/* Gevonden */
.mem-card.matched .mem-card-inner { box-shadow: 0 0 0 4px var(--mem-match-glow); }

/* ---- Modal ---- */
.mem-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--mem-overlay);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity .3s ease;
}
.mem-modal.visible { display: flex; }
.mem-modal.visible.shown { opacity: 1; }
.mem-modal-box {
  background: var(--mem-modal-bg);
  color: var(--mem-modal-text);
  padding: 32px 28px;
  border-radius: 14px;
  max-width: 460px;
  width: 90%;
  text-align: center;
  max-height: 90vh;
  overflow-y: auto;
}
.mem-modal-box h2 {
  font-family: var(--mem-font-heading);
  margin: 0 0 10px;
  font-size: 1.4rem;
}
.mem-modal-score {
  font-family: var(--mem-font-heading);
  font-size: 2.2rem; font-weight: 700;
  color: var(--mem-primary); margin: 4px 0 20px;
  transition: color .15s ease;
}
.mem-modal-score.blink { animation: mem-score-blink .25s steps(1) infinite; }
@keyframes mem-score-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
/* Score-breakdown */
.mem-breakdown {
  width: 100%; border-collapse: collapse;
  margin: 0 0 15px;
  font-family: var(--mem-font-body);
  font-size: 12px;
  text-align: left;
}
.mem-breakdown td { padding: 5px 4px; vertical-align: middle; line-height: 1.3; }
.mem-breakdown td:last-child {
  text-align: right; font-family: var(--mem-font-heading);
  font-weight: 700; white-space: nowrap; min-width: 90px;
}
.mem-bd-row { opacity: 0; transition: opacity .3s ease; }
.mem-bd-row.visible { opacity: 1; }
.mem-bd-neg td { color: var(--mem-timer-warning); }

.mem-modal-box p { margin: 0 0 6px; line-height: 1.5; font-size: .95rem; }
.mem-modal-box h2[hidden], p[hidden] { display: none; }
.mem-modal-buttons {
  display: flex; flex-wrap: wrap;
  gap: 10px; justify-content: center; margin-top: 18px;
}
.mem-modal-buttons[hidden] { display: none; }

/* ---- Knoppen ---- */
.mem-btn {
  border: none; cursor: pointer; min-height: 44px;
  padding: 11px 22px; border-radius: 7px;
  font-family: var(--mem-font-heading); font-size: 1rem;
  font-weight: 600; transition: background-color .2s, color .2s;
}
.mem-btn-primary  { background: var(--mem-btn-primary-bg);   color: var(--mem-btn-primary-text); }
.mem-btn-primary:hover  { background: var(--mem-btn-primary-hover); }
.mem-btn-secondary{ background: var(--mem-btn-secondary-bg); color: var(--mem-btn-secondary-text); }
.mem-btn-secondary:hover{ background: var(--mem-btn-secondary-hover); }

button:focus-visible { outline: 3px solid var(--mem-primary); outline-offset: 2px; }


/* ---- Veld-wrapper (achtergrondrechthoek om stats + kaartjes) ---- */
.mem-field {
  background: var(--mem-field-bg);
  border-radius: var(--mem-field-radius);
  padding: var(--mem-field-padding);
  max-width: var(--mem-max-width);
  margin: 0 auto;
}
/* Stats-balk en grid: volledige breedte binnen de wrapper, geen eigen max-width */
.mem-field .mem-stats { max-width: none; margin-left: 0; margin-right: 0; }
.mem-field .mem-grid  { max-width: none; margin-left: 0; margin-right: 0; }

/* ---- Postgame knop ---- */
.mem-postgame { text-align: center; margin-top: 22px; }
.mem-postgame[hidden] { display: none; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
  .mem-card.flipped .mem-face-front { visibility: hidden; }
  .mem-card.flipped .mem-face-back  { transform: rotateY(0deg); visibility: visible; }
}

/* Responsive */
@media (max-width: 600px) { .mem-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 380px) { .mem-grid { grid-template-columns: repeat(2, 1fr); } }`;

var HTML_TEXT=`
<main id="mem-app">
  <div class="mem-header">
    <h1 id="mem-title" class="mem-title">Memory</h1>
  </div>
  <div id="mem-field" class="mem-field">
    <!-- Volgorde: Sets — Pogingen — Tijd — Score -->
    <div class="mem-stats" id="mem-stats">
      <div class="mem-stat">Sets: <span id="mem-found">0</span> / <span id="mem-total">0</span></div>
      <div class="mem-stat">Pogingen: <span id="mem-moves">0</span></div>
      <div class="mem-timer" id="mem-timer" hidden></div>
      <div class="mem-score-display" id="mem-score-display" hidden>Score: <span id="mem-score">0</span></div>
    </div>
    <div id="mem-grid" class="mem-grid"></div>
    <div id="mem-postgame" class="mem-postgame" hidden>
      <button id="mem-postgame-btn" class="mem-btn mem-btn-primary"></button>
    </div>
  </div>
</main>

<div id="mem-modal" class="mem-modal" role="dialog" aria-modal="true" aria-labelledby="mem-modal-title">
  <div class="mem-modal-box">
    <h2 id="mem-modal-title" hidden></h2>
    <div class="mem-modal-score" id="mem-modal-score" hidden>0 punten</div>
    <table class="mem-breakdown" id="mem-breakdown" hidden>
      <tbody>
        <tr class="mem-bd-row" id="mem-bd-time">
          <td>Tijdbonus: <span id="mem-bd-sec">0</span> sec.</td>
          <td>× <span id="mem-bd-pts-per-sec">100</span> =</td>
          <td id="mem-bd-time-pts">0 punten</td>
        </tr>
        <tr class="mem-bd-row" id="mem-bd-sets">
          <td>Matches: <span id="mem-bd-sets-count">0</span></td>
          <td>× <span id="mem-bd-pts-per-set">100</span> =</td>
          <td id="mem-bd-sets-pts">0 punten</td>
        </tr>
        <tr class="mem-bd-row mem-bd-neg" id="mem-bd-attempts">
          <td>Pogingen: <span id="mem-bd-att-count">0</span></td>
          <td>× <span id="mem-bd-pts-per-att">100</span> =</td>
          <td id="mem-bd-att-pts">−0 punten</td>
        </tr>
      </tbody>
    </table>
    <!-- timer-note staat BOVEN de feedback-tekst -->
    <p id="mem-modal-timer-paused" style="font-size:.85rem; color: #333; margin:0 0 10px" hidden></p>
    <!-- "Een voorbeeld van [naam]:" -->
    <p id="mem-modal-example-title" style="font-weight:600;margin:0 0 4px" hidden></p>
    <p id="mem-modal-body" hidden></p>
    <!-- intro-timer-note staat ONDER de introtekst, normaal gewicht -->
    <p id="mem-modal-intro-timer" style="font-size:.85rem; color: #333; margin:8px 0 0;opacity:.8" hidden></p>
    <p id="mem-modal-minscore" style="font-size:16px;font-weight:normal;margin:6px 0 4px" hidden></p>
    <div class="mem-modal-buttons" id="mem-modal-buttons" hidden></div>
  </div>`;

var CONFIG=null;

var state = {
  flipped: [],
  matched: 0,
  moves: 0,
  processing: false,
  completionSent: false,
  pendingWin: false,
  audioCtx: null,
  timerHandle: null,
  remainingMs: 0,
  score: 0,
  hoverEnabled: false,
  scoreEverShown: false,
  introShown: false,        // true nadat intro-popup getoond is (getriggerd bij eerste kaartkliek)
  partnerMap: {}
};

// ---- DOM-cache -----------------------------------------------------------
var el = {};
function cacheDom() {
  el.app         = document.getElementById('mem-app');
  el.title       = document.getElementById('mem-title');
  el.stats       = document.getElementById('mem-stats');
  el.found       = document.getElementById('mem-found');
  el.total       = document.getElementById('mem-total');
  el.timer       = document.getElementById('mem-timer');
  el.moves       = document.getElementById('mem-moves');
  el.scoreDisp   = document.getElementById('mem-score-display');
  el.scoreVal    = document.getElementById('mem-score');
  el.grid        = document.getElementById('mem-grid');
  el.field       = document.getElementById('mem-field');
  el.postgame    = document.getElementById('mem-postgame');
  el.postgameBtn = document.getElementById('mem-postgame-btn');
  el.modal       = document.getElementById('mem-modal');
  el.mTitle      = document.getElementById('mem-modal-title');
  el.mScore      = document.getElementById('mem-modal-score');
  el.mBreakdown  = document.getElementById('mem-breakdown');
  el.mBody       = document.getElementById('mem-modal-body');
  el.mTimerNote      = document.getElementById('mem-modal-timer-paused');
  el.mExampleTitle   = document.getElementById('mem-modal-example-title');
  el.mIntroNote = document.getElementById('mem-modal-intro-timer');
  el.mMinScore   = document.getElementById('mem-modal-minscore');
  el.mButtons    = document.getElementById('mem-modal-buttons');
  el.bdTimeRow   = document.getElementById('mem-bd-time');
  el.bdSetsRow   = document.getElementById('mem-bd-sets');
  el.bdAttRow    = document.getElementById('mem-bd-attempts');
  el.bdSec       = document.getElementById('mem-bd-sec');
  el.bdPtsPerSec = document.getElementById('mem-bd-pts-per-sec');
  el.bdTimePts   = document.getElementById('mem-bd-time-pts');
  el.bdSetsCount = document.getElementById('mem-bd-sets-count');
  el.bdPtsPerSet = document.getElementById('mem-bd-pts-per-set');
  el.bdSetsPts   = document.getElementById('mem-bd-sets-pts');
  el.bdAttCount  = document.getElementById('mem-bd-att-count');
  el.bdPtsPerAtt = document.getElementById('mem-bd-pts-per-att');
  el.bdAttPts    = document.getElementById('mem-bd-att-pts');
}

// ---- Lettertypen laden ---------------------------------------------------
function buildFontStack(name, fallback) {
  return name ? "'" + name + "', " + fallback : fallback;
}
function loadGoogleFonts() {
  var fn = CONFIG.fonts, families = [];
  function add(name, weights) {
    if (!name) return;
    families.push('family=' + name.trim().replace(/ /g, '+') + ':wght@' + weights);
  }
  add(fn.headingFont, fn.headingWeights);
  if (fn.bodyFont && fn.bodyFont !== fn.headingFont) add(fn.bodyFont, fn.bodyWeights);
  if (!families.length) return;
  var url = 'https://fonts.googleapis.com/css2?' + families.join('&') + '&display=swap';
  var lnk = document.getElementById('mem-gfonts');
  if (!lnk) { lnk = document.createElement('link'); lnk.id = 'mem-gfonts'; lnk.rel = 'stylesheet'; document.head.appendChild(lnk); }
  if (lnk.href !== url) lnk.href = url;
}

// ---- Thema toepassen -----------------------------------------------------
function applyTheme() {
  var c = CONFIG.colors, l = CONFIG.layout, fn = CONFIG.fonts;
  var s = document.documentElement.style;
  s.setProperty('--mem-primary',           c.primary);
  s.setProperty('--mem-primary-hover',     c.primaryHover);
  s.setProperty('--mem-text',              c.text);
  s.setProperty('--mem-stats-bg',          c.statsBg);
  s.setProperty('--mem-field-bg',          c.fieldBackground);
  s.setProperty('--mem-card-front-bg',     c.cardFrontBg);
  s.setProperty('--mem-card-front-text',   c.cardFrontText);
  s.setProperty('--mem-card-back-bg',      c.cardBackBg);
  s.setProperty('--mem-card-back-text',    c.cardBackText);
  s.setProperty('--mem-match-glow',        c.cardMatchGlow);
  s.setProperty('--mem-timer-warning',     c.timerWarning);
  s.setProperty('--mem-overlay',           c.overlay);
  s.setProperty('--mem-modal-bg',          c.modalBg);
  s.setProperty('--mem-modal-text',        c.modalText);
  s.setProperty('--mem-btn-primary-bg',    c.btnPrimaryBg);
  s.setProperty('--mem-btn-primary-text',  c.btnPrimaryText);
  s.setProperty('--mem-btn-primary-hover', c.btnPrimaryHover);
  s.setProperty('--mem-btn-secondary-bg',  c.btnSecondaryBg);
  s.setProperty('--mem-btn-secondary-text',c.btnSecondaryText);
  s.setProperty('--mem-btn-secondary-hover',c.btnSecondaryHover);
  s.setProperty('--mem-card-hover-bg',     CONFIG.hover.backgroundColor);
  s.setProperty('--mem-card-hover-text',   CONFIG.hover.textColor);
  s.setProperty('--mem-max-width',     l.maxWidth);
  s.setProperty('--mem-card-radius',   l.cardRadius);
  s.setProperty('--mem-gap',           l.columnGap);
  s.setProperty('--mem-columns',       String(CONFIG.general.columnsDesktop));
  s.setProperty('--mem-flip-ms',       CONFIG.general.flipDurationMs + 'ms');
  s.setProperty('--mem-field-radius',  l.fieldRadius);
  s.setProperty('--mem-field-padding', l.fieldPadding);
  s.setProperty('--mem-font-heading',  buildFontStack(fn.headingFont, fn.fallback));
  s.setProperty('--mem-font-body',     buildFontStack(fn.bodyFont, fn.fallback));
  s.setProperty('--mem-heading-size',  fn.headingSize);
  s.setProperty('--mem-body-size',     fn.bodySize);
  loadGoogleFonts();
  document.title = CONFIG.general.title;
  el.title.textContent = CONFIG.general.title;
}

// ---- Stats-balk ----------------------------------------------------------
function setupStats() {
  el.timer.hidden     = !CONFIG.timer.enabled;
  // Score: verborgen totdat het spel minstens één keer is uitgespeeld
  el.scoreDisp.hidden = true;
  if (CONFIG.timer.enabled) {
    state.remainingMs = CONFIG.timer.timeLimitSeconds * 1000;
    updateTimerDisplay();
  }
}

// ---- Timer ---------------------------------------------------------------
function startTimer() {
  if (!CONFIG.timer.enabled) return;
  var last = Date.now();
  state.timerHandle = setInterval(function () {
    var now = Date.now();
    state.remainingMs -= (now - last);
    last = now;
    if (state.remainingMs <= 0) {
      state.remainingMs = 0;
      updateTimerDisplay();
      stopTimer();
      onTimeUp();
      return;
    }
    updateTimerDisplay();
  }, 200);
}
function stopTimer() {
  if (state.timerHandle) { clearInterval(state.timerHandle); state.timerHandle = null; }
}
function resumeTimer() {
  if (!CONFIG.timer.enabled || state.timerHandle) return;
  startTimer();
}
function updateTimerDisplay() {
  var total = Math.max(0, Math.ceil(state.remainingMs / 1000));
  var m = Math.floor(total / 60), s = total % 60;
  el.timer.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  el.timer.classList.toggle('warning', total <= CONFIG.timer.warningSeconds);
}
function onTimeUp() {
  showModal(CONFIG.timer.timeUpText, '', false, true, false);
}

// ---- Score ---------------------------------------------------------------
function calcScore() {
  var sec = Math.floor(state.remainingMs / 1000);
  return Math.max(0,
    sec * CONFIG.score.pointsPerSecond +
    state.matched * CONFIG.score.pointsPerSet -
    state.moves   * CONFIG.score.pointsPerAttempt
  );
}
function maxScore() {
  return CONFIG.timer.timeLimitSeconds * CONFIG.score.pointsPerSecond
       + CONFIG.pairs.length * CONFIG.score.pointsPerSet;
}
function isPassed(score) {
  if (CONFIG.score.passCriteria === 'minScore') return score >= CONFIG.score.minimumScore;
  var max = maxScore();
  return max > 0 && (score / max) * 100 >= CONFIG.score.passPercentage;
}

// ---- Raster bouwen -------------------------------------------------------
function buildGrid() {
  var cards = [];
  CONFIG.pairs.forEach(function (pair) {
    var name = pair.cardA.value || '';
    cards.push({ id: pair.id, data: pair.cardA, feedback: pair.cardA.feedback || '', pairName: name });
    cards.push({ id: pair.id, data: pair.cardB, feedback: pair.cardB.feedback || '', pairName: name });
  });
  for (var i = cards.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
  }
  el.total.textContent = CONFIG.pairs.length;
  el.grid.innerHTML = '';

  var builtEls = [];
  cards.forEach(function (item, idx) {
    var cardEl = document.createElement('button');
    cardEl.className = 'mem-card';
    cardEl.setAttribute('aria-label', 'Verborgen kaart ' + (idx + 1));
    cardEl.dataset.pairId = item.id;
    cardEl.style.aspectRatio = CONFIG.layout.cardAspectRatio;

    var inner = document.createElement('div');
    inner.className = 'mem-card-inner';

    var front = document.createElement('div');
    front.className = 'mem-face mem-face-front';
    if (CONFIG.general.cardFrontImage) {
      front.classList.add('has-image');
      var img = document.createElement('img');
      img.src = CONFIG.general.cardFrontImage; img.alt = '';
      front.appendChild(img);
    }

    var back = document.createElement('div');
    back.className = 'mem-face mem-face-back';
    if (item.data.type === 'image') {
      back.classList.add('image-cell');
      var imgB = document.createElement('img');
      imgB.src = item.data.value; imgB.alt = 'Memory kaartafbeelding';
      back.appendChild(imgB);
    } else {
      var span = document.createElement('span');
      span.lang = 'nl';
      span.textContent = item.data.value;
      if (item.data.format === 'bold')   span.style.fontWeight = 'bold';
      if (item.data.format === 'italic') span.style.fontStyle  = 'italic';
      back.appendChild(span);
    }

    inner.appendChild(front); inner.appendChild(back);
    cardEl.appendChild(inner);
    el.grid.appendChild(cardEl);
    builtEls.push({ id: item.id, cardEl: cardEl });

    cardEl.addEventListener('click', function () {
      // Eerste klik op een kaartje: toon intro-popup, flip de kaart nog niet
      if (!state.introShown) {
        state.introShown = true;
        showIntroModal();
        return;
      }
      if (state.hoverEnabled) { onCardTap(cardEl, item.id); return; }
      initAudio();
      if (!state.timerHandle && CONFIG.timer.enabled) startTimer();
      handleClick(cardEl, item);
    });
    cardEl.addEventListener('mouseenter', function () { onCardHoverIn(cardEl, item.id); });
    cardEl.addEventListener('mouseleave', function () { onCardHoverOut(item.id); });
  });

  var pairGroups = {};
  builtEls.forEach(function (x) {
    if (!pairGroups[x.id]) pairGroups[x.id] = [];
    pairGroups[x.id].push(x.cardEl);
  });
  state.partnerMap = pairGroups;
}

// ---- Hover / tap ---------------------------------------------------------
var partnerTimers = {};
var activeTapPairId = null;

function onCardHoverIn(cardEl, pairId) {
  if (!state.hoverEnabled) return;
  cardEl.classList.add('hover-self');
  (state.partnerMap[pairId] || []).forEach(function (p) {
    if (p === cardEl) return;
    clearTimeout(partnerTimers[pairId]);
    partnerTimers[pairId] = setTimeout(function () { p.classList.add('hover-partner'); }, CONFIG.hover.partnerDelay);
  });
}
function onCardHoverOut(pairId) {
  if (!state.hoverEnabled) return;
  clearTimeout(partnerTimers[pairId]);
  (state.partnerMap[pairId] || []).forEach(function (p) {
    p.classList.remove('hover-self', 'hover-partner');
  });
}
function onCardTap(cardEl, pairId) {
  if (activeTapPairId === pairId) { clearAllTapHighlights(); return; }
  clearAllTapHighlights();
  activeTapPairId = pairId;
  cardEl.classList.add('hover-self');
  (state.partnerMap[pairId] || []).forEach(function (p) {
    if (p === cardEl) return;
    clearTimeout(partnerTimers[pairId]);
    partnerTimers[pairId] = setTimeout(function () { p.classList.add('hover-partner'); }, CONFIG.hover.partnerDelay);
  });
}
function clearAllTapHighlights() {
  if (!activeTapPairId) return;
  clearTimeout(partnerTimers[activeTapPairId]);
  (state.partnerMap[activeTapPairId] || []).forEach(function (p) {
    p.classList.remove('hover-self', 'hover-partner');
  });
  activeTapPairId = null;
}

// ---- Kliklogica ----------------------------------------------------------
function handleClick(cardEl, item) {
  if (state.processing || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
  cardEl.classList.add('flipped');
  state.flipped.push({ el: cardEl, item: item });
  if (state.flipped.length === 2) {
    state.moves++;
    el.moves.textContent = state.moves;
    checkMatch();
  }
}

function checkMatch() {
  state.processing = true;
  var a = state.flipped[0], b = state.flipped[1];

  if (a.item.id === b.item.id) {
    setTimeout(function () {
      a.el.classList.add('matched'); b.el.classList.add('matched');
      state.matched++;
      el.found.textContent = state.matched;
      playSuccess();
      state.flipped = []; state.processing = false;

      var total = CONFIG.pairs.length;
      var fb = a.item.feedback || b.item.feedback || '';
      var pairName = a.item.pairName || b.item.pairName || '';

      if (state.matched === total) {
        stopTimer();
        if (CONFIG.general.feedbackPopup && fb) {
          state.pendingWin = true;
          showFeedbackModal(fb, pairName);
        } else {
          setTimeout(handleWin, 600);
        }
      } else if (CONFIG.general.feedbackPopup && fb) {
        stopTimer();
        showFeedbackModal(fb, pairName);
      }
    }, 500);
  } else {
    setTimeout(function () {
      a.el.classList.remove('flipped'); b.el.classList.remove('flipped');
      state.flipped = []; state.processing = false;
    }, CONFIG.general.lockDelay);
  }
}

// ---- Win -----------------------------------------------------------------
function handleWin() {
  stopTimer();

  // Score in de statsbalk tonen (nu het spel uitgespeeld is)
  if (CONFIG.score.enabled) {
    state.scoreEverShown = true;
    el.scoreDisp.hidden = false;
  }

  if (!CONFIG.score.enabled) {
    // Geen score: altijd 'geslaagd' beschouwen voor Rise completion
    if (CONFIG.general.riseCompletion && !state.completionSent) {
      CONFIG.onComplete();
      state.completionSent = true;
    }
    var body = CONFIG.texts.winBodyNoScore(CONFIG.pairs.length, state.moves);
    showModal(CONFIG.texts.winTitleNoScore, body, true, false, null);
    return;
  }

  var secLeft    = Math.floor(state.remainingMs / 1000);
  var timeBonus  = secLeft * CONFIG.score.pointsPerSecond;
  var setBonus   = state.matched * CONFIG.score.pointsPerSet;
  var aftrek     = state.moves * CONFIG.score.pointsPerAttempt;
  var totalScore = Math.max(0, timeBonus + setBonus - aftrek);
  state.score    = totalScore;
  el.scoreVal.textContent = totalScore;

  var passed = isPassed(totalScore);

  // postMessage alleen versturen als de minimale score is behaald
  if (passed && CONFIG.general.riseCompletion && !state.completionSent) {
    CONFIG.onComplete();
    state.completionSent = true;
  }
  openScoreModal();
  setTimeout(function () { animateWinScore(secLeft, timeBonus, setBonus, aftrek, totalScore, passed); }, 400);
}

// ---- Feedback-pop-up (tussentijds / einde met feedback) ------------------
function showFeedbackModal(text, pairName) {
  _modalType = 'feedback';
  el.mTitle.textContent = CONFIG.texts.matchTitle;
  el.mTitle.hidden = false;
  el.mScore.hidden = true;
  el.mBreakdown.hidden = true;
  el.mMinScore.hidden = true;
  el.mIntroNote.hidden = true;

  // "Lees rustig. De tijd is gestopt." boven de feedbacktekst (alleen als timer aan)
  if (CONFIG.timer.enabled) {
    el.mTimerNote.textContent = CONFIG.texts.timerPausedNote;
    el.mTimerNote.hidden = false;
  } else {
    el.mTimerNote.hidden = true;
  }

  // "Een voorbeeld van [naam]:" als pairName bekend is
  if (pairName && CONFIG.texts.feedbackExamplePrefix) {
    el.mExampleTitle.textContent = CONFIG.texts.feedbackExamplePrefix(pairName);
    el.mExampleTitle.hidden = false;
  } else {
    el.mExampleTitle.hidden = true;
  }

  el.mBody.textContent = text;
  el.mBody.hidden = false;

  el.mButtons.innerHTML = '';
  var btn = document.createElement('button');
  btn.className = 'mem-btn mem-btn-primary';
  btn.textContent = CONFIG.texts.continueButton;
  btn.addEventListener('click', closeModal);
  el.mButtons.appendChild(btn);
  el.mButtons.hidden = false;

  showModalElement();
}

// ---- Score-modal (eindscherm) --------------------------------------------
function openScoreModal() {
  _modalType = 'score';
  el.mTitle.hidden    = true;
  el.mBody.hidden     = true;
  el.mTimerNote.hidden = true; el.mIntroNote.hidden = true; el.mExampleTitle.hidden = true;
  el.mMinScore.hidden = true;
  el.mButtons.hidden  = true;
  el.mScore.hidden    = false;
  el.mScore.textContent = '0 punten';
  el.mScore.style.color = '';
  el.mScore.classList.remove('blink');
  el.mBreakdown.hidden = false;
  [el.bdTimeRow, el.bdSetsRow, el.bdAttRow].forEach(function (r) { r.classList.remove('visible'); });
  showModalElement();
}

function animateWinScore(secLeft, timeBonus, setBonus, aftrek, totalScore, passed) {
  var anim = CONFIG.animation || {};
  var bonusMs   = anim.timeBonusAnimationMs || 1000;
  var blinkMs   = (anim.scoreBlinkSeconds || 0.5) * 1000;
  var countMs   = (anim.scoreCountSeconds || 0.4) * 1000;
  var stepDelay = anim.revealDelayMs || 400;
  var correctColor = CONFIG.colors.scoreCorrectColor || '#1E8E5A';
  var wrongColor   = CONFIG.colors.scoreWrongColor   || '#D64545';
  var running = 0;

  function setRunning(v) {
    running = Math.max(0, v);
    el.mScore.textContent = running + ' punten';
    if (el.scoreVal) el.scoreVal.textContent = running;
  }

  function fasesets() {
    // Fase 2: sets
    setTimeout(function () {
      el.bdPtsPerSet.textContent  = CONFIG.score.pointsPerSet;
      el.bdSetsCount.textContent  = state.matched;
      el.bdSetsPts.textContent    = '0 punten';
      el.bdSetsRow.classList.add('visible');
      revealCountStep(0, setBonus, running, true, el.bdSetsPts, correctColor, blinkMs, countMs,
        function (v) { setRunning(v); },
        function () {
          el.mScore.style.color = '';
          // Fase 3: pogingen
          setTimeout(function () {
            el.bdPtsPerAtt.textContent  = CONFIG.score.pointsPerAttempt;
            el.bdAttCount.textContent   = state.moves;
            el.bdAttPts.textContent     = '−0 punten';
            el.bdAttRow.classList.add('visible');
            revealCountStep(0, aftrek, running, false, el.bdAttPts, wrongColor, blinkMs, countMs,
              function (v) { setRunning(v); },
              function () {
                el.mScore.style.color = '';
                setTimeout(function () { showResultsConclusion(passed); }, stepDelay);
              }
            );
          }, stepDelay);
        }
      );
    }, stepDelay);
  }

  if (CONFIG.timer.enabled) {
    // Fase 1: tijdsbonus (alleen als timer aan staat)
    el.bdPtsPerSec.textContent = CONFIG.score.pointsPerSecond;
    el.bdSec.textContent       = secLeft;   // seconden staan stil, tellen niet af
    el.bdTimePts.textContent   = '0 punten';
    el.bdTimeRow.classList.add('visible');
    el.mScore.style.color = correctColor;

    animateCount(0, bonusMs, bonusMs, function (elapsed) {
      var p = elapsed / bonusMs;
      // el.bdSec blijft staan (secLeft), alleen punten tellen op
      el.bdTimePts.textContent  = Math.round(timeBonus * p) + ' punten';
      setRunning(Math.round(timeBonus * p));
    }, function () {
      el.bdTimePts.textContent = timeBonus + ' punten';
      setRunning(timeBonus);
      el.mScore.style.color = '';
      fasesets();
    });
  } else {
    // Timer uit: tijdsbonus-rij verbergen, direct naar fase 2
    el.bdTimeRow.classList.remove('visible');
    fasesets();
  }
}

function revealCountStep(fromDelta, toDelta, startRunning, isAdd, cellEl, color, blinkMs, countMs, onTick, onDone) {
  el.mScore.style.color = color;
  el.mScore.classList.add('blink');
  setTimeout(function () {
    el.mScore.classList.remove('blink');
    animateCount(0, countMs, countMs, function (elapsed) {
      var p = elapsed / countMs;
      var delta = Math.round(toDelta * p);
      cellEl.textContent = (isAdd ? '' : '−') + delta + ' punten';
      onTick(isAdd ? startRunning + delta : startRunning - delta);
    }, function () {
      cellEl.textContent = (isAdd ? '' : '−') + toDelta + ' punten';
      onTick(isAdd ? startRunning + toDelta : startRunning - toDelta);
      onDone();
    });
  }, blinkMs);
}

function animateCount(from, to, durationMs, onTick, onDone) {
  if (durationMs <= 0) { onTick(to); onDone(); return; }
  var start = null;
  function step(ts) {
    if (!start) start = ts;
    var elapsed = Math.min(to, ts - start);
    onTick(elapsed);
    if (elapsed < to) { requestAnimationFrame(step); } else { onDone(); }
  }
  requestAnimationFrame(step);
}

function showResultsConclusion(passed) {
  el.mTitle.textContent = passed ? CONFIG.score.passTitle : CONFIG.score.failTitle;
  el.mTitle.hidden = false;
  // Alleen passText tonen bij voldoende; geen failText (per verzoek verwijderd)
  el.mBody.textContent = passed ? CONFIG.score.passText : '';
  el.mBody.hidden = !passed;
  el.mTimerNote.hidden = true; el.mIntroNote.hidden = true; el.mExampleTitle.hidden = true;

  if (!passed) {
    var minScore = CONFIG.score.passCriteria === 'minScore'
      ? CONFIG.score.minimumScore
      : Math.ceil(maxScore() * CONFIG.score.passPercentage / 100);
    var minScoreText = CONFIG.score.minimumScoreText(minScore);
    // Maak alleen het getal vet, niet de omringende tekst
    el.mMinScore.innerHTML = minScoreText.replace(
      String(minScore), '<strong>' + minScore + '</strong>'
    );
    el.mMinScore.hidden = false;
  } else {
    el.mMinScore.hidden = true;
  }

  buildWinButtons(passed);
  el.mButtons.hidden = false;
}

function buildWinButtons(passed) {
  el.mButtons.innerHTML = '';
  var retryBtn = document.createElement('button');
  retryBtn.className = 'mem-btn mem-btn-primary';
  retryBtn.textContent = CONFIG.texts.playAgainButton;
  retryBtn.addEventListener('click', function () { location.reload(); });
  el.mButtons.appendChild(retryBtn);

  var resultsBtn = document.createElement('button');
  resultsBtn.className = 'mem-btn mem-btn-secondary';
  resultsBtn.textContent = CONFIG.texts.resultsButton;
  resultsBtn.addEventListener('click', function () {
    state.hoverEnabled = true;
    showPostgameButton(passed);
    closeModal();
  });
  el.mButtons.appendChild(resultsBtn);
}

function showPostgameButton(passed) {
  el.postgameBtn.textContent = passed ? CONFIG.texts.playAgainPassedButton : CONFIG.texts.retryButton;
  el.postgameBtn.onclick = function () { location.reload(); };
  el.postgame.hidden = false;
}

// ---- Generieke modal (tijd-op + geen-score-win) ---------------
function showModal(title, body, isWin, isTimeUp, passed) {
  _modalType = 'generic';
  el.mTitle.textContent = title;
  el.mTitle.hidden = false;
  el.mBody.textContent = body || '';
  el.mBody.hidden = !body;
  el.mTimerNote.hidden = true; el.mIntroNote.hidden = true; el.mExampleTitle.hidden = true;
  el.mScore.hidden = true;
  el.mBreakdown.hidden = true;
  el.mMinScore.hidden = true;
  el.mButtons.innerHTML = '';
  el.mButtons.hidden = false;

  if (isWin || isTimeUp) {
    buildWinButtons(passed || false);
  } else {
    var btn = document.createElement('button');
    btn.className = 'mem-btn mem-btn-primary';
    btn.textContent = CONFIG.texts.continueButton;
    btn.addEventListener('click', closeModal);
    el.mButtons.appendChild(btn);
  }
  showModalElement();
}

function showModalElement() {
  el.modal.classList.add('visible');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { el.modal.classList.add('shown'); });
  });
}

function closeModal() {
  el.modal.classList.remove('shown');
  setTimeout(function () {
    el.modal.classList.remove('visible');
    if (state.pendingWin) {
      state.pendingWin = false;
      handleWin();
    } else if (_modalType === 'feedback') {
      // Feedback-popup gesloten: timer hervatten als het spel nog loopt
      if (state.matched < CONFIG.pairs.length) resumeTimer();
    }
    // intro / score / generic: geen timer-actie
  }, 300);
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && el.modal.classList.contains('visible')) closeModal();
});

// ---- Audio ---------------------------------------------------------------
function initAudio() {
  if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playSuccess() {
  if (!state.audioCtx) return;
  var osc = state.audioCtx.createOscillator();
  var gain = state.audioCtx.createGain();
  osc.connect(gain); gain.connect(state.audioCtx.destination);
  osc.frequency.setValueAtTime(523.25, state.audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1046.5, state.audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, state.audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + 0.3);
  osc.start(); osc.stop(state.audioCtx.currentTime + 0.3);
}

// ---- Rise hoogte melden --------------------------------------------------
function notifyHeight() {
  var h = document.documentElement.scrollHeight;
  if (window.parent && window.parent !== window)
    window.parent.postMessage({ type: 'setHeight', height: h }, '*');
}
window.addEventListener('load', notifyHeight);
new ResizeObserver(notifyHeight).observe(document.body);

var _modalType = ''; // 'intro' | 'feedback' | 'score' | 'generic'

function showIntroModal() {
  _modalType = 'intro';
  el.mTitle.textContent = CONFIG.texts.introTitle;
  el.mTitle.hidden = false;
  el.mBody.textContent = CONFIG.texts.introText;
  el.mBody.hidden = false;
  el.mScore.hidden = true;
  el.mBreakdown.hidden = true;
  el.mMinScore.hidden = true;

  el.mTimerNote.hidden = true; el.mIntroNote.hidden = true; el.mExampleTitle.hidden = true;

  // Timer-opmerking onder de introtekst, normaal gewicht
  if (CONFIG.timer.enabled && CONFIG.texts.introNote) {
    el.mIntroNote.textContent = CONFIG.texts.introNote;
    el.mIntroNote.hidden = false;
  } else {
    el.mIntroNote.hidden = true;
  }

  el.mButtons.innerHTML = '';
  var btn = document.createElement('button');
  btn.className = 'mem-btn mem-btn-primary';
  btn.textContent = CONFIG.texts.startButton;
  btn.addEventListener('click', function () {
    closeModal();
    // closeModal herstart geen timer of andere spellogica — spel start bij eerste klik
  });
  el.mButtons.appendChild(btn);
  el.mButtons.hidden = false;
  showModalElement();
}

// ---- Opstarten -----------------------------------------------------------
function init() {
  cacheDom();
  applyTheme();
  setupStats();
  buildGrid();
  notifyHeight();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function injectAssets(){
  if(!document.getElementById("mem-engine-style")){
    var s=document.createElement("style");s.id="mem-engine-style";
    s.textContent=CSS_TEXT;document.head.appendChild(s);}
  var r=document.getElementById("mem-app");
  if(!r){console.error("MemoryGame: geen #mem-app gevonden.");return false;}
  r.innerHTML=HTML_TEXT;return true;}

global.MemoryGame={
  version:"1.0",
  init:function(c){
    CONFIG=c;
    function ready(){if(injectAssets())init();}
    if(document.readyState==="loading"){
      document.addEventListener("DOMContentLoaded",ready);}else{ready();}
  }
};

})(window);

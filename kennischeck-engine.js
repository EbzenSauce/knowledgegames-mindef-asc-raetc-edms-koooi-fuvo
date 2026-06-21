/* =========================================================================
   KENNISCHECK — SPEL-ENGINE
   -------------------------------------------------------------------------
   Dit bestand bevat de volledige opmaak (CSS), HTML-opbouw en spellogica.
   JE HOEFT DIT BESTAND NOOIT AAN TE PASSEN.

   Host dit bestand ergens met een publieke (https) URL en laad het in Rise
   via het Embed-blok, samen met je configuratie. Zie kennischeck-embed.html
   voor een kant-en-klaar voorbeeld, en de handleiding (handleiding.md,
   sectie "Spelcode los van configuratie hosten") voor uitleg over hosten.

   Gebruik:
     <div id="kc-app"></div>
     <script src="https://JOUW-HOSTING-URL/kennischeck-engine.js"></script>
     <script>
       // vul hier je configuratie in, zie kennischeck-embed.html
       KennisCheck.init({ ... });
     </script>
   ========================================================================= */
(function (global) {
"use strict";

// ---- Opmaak (CSS) ----------------------------------------------------
var CSS_TEXT = `
/* =========================================================================
   KENNISCHECK — basisstijl
   Alle kleuren/lettertypen/afmetingen die hieronder als CSS-variabelen staan
   worden bij het laden automatisch overschreven met de waarden uit het
   CONFIG-object in het script-blok hieronder. Je hoeft dus normaal NIETS in
   dit CSS-blok aan te passen — pas CONFIG aan, zie de handleiding.

   De lettertypen worden NIET hier vastgezet: die worden dynamisch geladen
   vanaf Google Fonts op basis van CONFIG.fonts (zie loadGoogleFonts() in
   het script-blok). Vul daar simpelweg een lettertype-naam in.
   ========================================================================= */

#kc-app, #kc-app * { box-sizing: border-box; }

#kc-app {
  --kc-bg: #F4F6F8;
  --kc-card-bg: #FFFFFF;
  --kc-text: #1B2430;
  --kc-text-soft: #5B6675;
  --kc-accent: #0F6E64;
  --kc-accent-soft: #E4F1EF;
  --kc-statement-bg: #1B2430;
  --kc-statement-text: #F4F6F8;
  --kc-answer-bg: #E9ECF1;
  --kc-answer-text: #1B2430;
  --kc-answer-used-bg: #9AA5B1;
  --kc-answer-used-text: #FFFFFF;
  --kc-answer-correct-bg: #1E8E5A;
  --kc-answer-correct-text: #FFFFFF;
  --kc-answer-wrong-bg: #D64545;
  --kc-answer-wrong-text: #FFFFFF;
  --kc-btn-primary-bg: #0F6E64;
  --kc-btn-primary-text: #FFFFFF;
  --kc-btn-secondary-bg: #E9ECF1;
  --kc-btn-secondary-text: #1B2430;
  --kc-btn-retry-bg: #1E8E5A;
  --kc-btn-retry-text: #FFFFFF;
  --kc-timer-bg: #1B2430;
  --kc-timer-text: #F4F6F8;
  --kc-timer-warning: #D64545;
  --kc-overlay: rgba(17, 22, 30, 0.6);
  --kc-radius: 16px;
  --kc-radius-sm: 10px;
  --kc-max-width: 760px;
  --kc-font-display: 'Space Grotesk', 'Segoe UI', Arial, sans-serif;
  --kc-font-body: 'Inter', 'Segoe UI', Arial, sans-serif;
  --kc-answer-columns: 2;
  --kc-statement-fade-ms: 250ms;
  --kc-answer-color-ms: 250ms;

  font-family: var(--kc-font-body);
  color: var(--kc-text);
  background: var(--kc-bg);
  max-width: var(--kc-max-width);
  margin: 0 auto;
  padding: clamp(16px, 4vw, 32px);
  border-radius: var(--kc-radius);
  position: relative;
  line-height: 1.45;
}

#kc-app *:focus-visible {
  outline: 3px solid var(--kc-accent);
  outline-offset: 2px;
}

/* ---------- Header ---------- */
.kc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.kc-title {
  font-family: var(--kc-font-display);
  font-weight: 700;
  : clamp(20px, 3.4vw, 26px);
  margin: 0;
  letter-spacing: -0.01em;
}
.kc-timer {
  font-family: var(--kc-font-display);
  font-variant-numeric: tabular-nums;
  background: var(--kc-timer-bg);
  color: var(--kc-timer-text);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: background-color 0.3s ease;
}
.kc-timer.kc-timer--warning {
  background: var(--kc-timer-warning);
  animation: kc-pulse 1s infinite;
}
@keyframes kc-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* ---------- Intro ---------- */
.kc-intro {
  background: var(--kc-card-bg);
  border-radius: var(--kc-radius);
  padding: clamp(20px, 5vw, 36px);
  text-align: center;
}
.kc-intro p { color: var(--kc-text-soft); margin: 0 0 20px; font-size: 16px; }

/* ---------- Progress ---------- */
.kc-progress {
  font-family: var(--kc-font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--kc-text-soft);
  margin-bottom: 10px;
}

/* ---------- Instructie-balk (tijdens bewerk-modus) ---------- */
.kc-instruction {
  font-family: var(--kc-font-display);
  : 13px;
  font-weight: 600;
  color: var(--kc-accent);
  background: var(--kc-accent-soft);
  border-radius: var(--kc-radius-sm);
  padding: 11px 16px;
  margin-bottom: 10px;
}

/* ---------- Statement card (het signature-element) ---------- */
.kc-statement-wrap { margin-bottom: 18px; }
.kc-statement {
  background: var(--kc-statement-bg);
  color: var(--kc-statement-text);
  border-radius: var(--kc-radius);
  padding: clamp(22px, 6vw, 34px);
  font-family: var(--kc-font-display);
  : clamp(18px, 3vw, 23px);
  font-weight: 600;
  line-height: 1.4;
  min-height: 90px;
  display: flex;
  align-items: center;
  position: relative;
  border-top: 4px solid var(--kc-accent);
  transition: opacity var(--kc-statement-fade-ms) ease, transform var(--kc-statement-fade-ms) ease;
}
.kc-statement.kc-fade {
  opacity: 0;
  transform: translateY(6px);
}

/* ---------- Answer grid ---------- */
.kc-answers {
  display: grid;
  grid-template-columns: repeat(var(--kc-answer-columns), 1fr);
  gap: 12px;
}
.kc-answer-btn {
  font-family: var(--kc-font-body);
  font-weight: 600;
  : 15px;
  background: var(--kc-answer-bg);
  color: var(--kc-answer-text);
  border: none;
  border-radius: var(--kc-radius-sm);
  padding: 16px 14px;
  min-height: 56px;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--kc-answer-color-ms) ease, color var(--kc-answer-color-ms) ease, transform 0.12s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}
.kc-answer-btn:hover:not(:disabled) { transform: translateY(-1px); }
.kc-answer-btn:active:not(:disabled) { transform: translateY(0); }
.kc-answer-btn:disabled { cursor: default; }
.kc-answer-btn--used {
  background: var(--kc-answer-used-bg);
  color: var(--kc-answer-used-text);
}
.kc-answer-btn--correct {
  background: var(--kc-answer-correct-bg);
  color: var(--kc-answer-correct-text);
}
.kc-answer-btn--wrong {
  background: var(--kc-answer-wrong-bg);
  color: var(--kc-answer-wrong-text);
}
.kc-answer-icon { : 16px; line-height: 1; opacity: 0; transition: opacity 0.2s ease; }
.kc-answer-btn--correct .kc-answer-icon,
.kc-answer-btn--wrong .kc-answer-icon { opacity: 1; }

/* ---------- Score panel ---------- */
.kc-score-panel {
  margin-top: 18px;
  background: var(--kc-accent-soft);
  border-radius: var(--kc-radius-sm);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--kc-font-display);
  font-weight: 600;
  color: var(--kc-accent);
}
.kc-score-value {
  : 22px;
  transition: color 0.15s ease;
}
.kc-score-value.kc-score-blink {
  animation: kc-score-blink 0.25s steps(1) infinite;
}
@keyframes kc-score-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

/* ---------- Buttons (generiek) ---------- */
.kc-btn {
  font-family: var(--kc-font-body);
  font-weight: 600;
  : 15px;
  border: none;
  border-radius: var(--kc-radius-sm);
  padding: 13px 22px;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.12s ease;
}
.kc-btn:hover { filter: brightness(1.06); }
.kc-btn:active { transform: translateY(1px); }
.kc-btn-primary { background: var(--kc-btn-primary-bg); color: var(--kc-btn-primary-text); }
.kc-btn-secondary { background: var(--kc-btn-secondary-bg); color: var(--kc-btn-secondary-text); }
.kc-btn-retry { background: var(--kc-btn-retry-bg); color: var(--kc-btn-retry-text); }
.kc-btn:disabled { opacity: 0.45; cursor: not-allowed; filter: none; }

/* ---------- Popup ---------- */
.kc-popup-overlay {
  position: absolute;
  inset: 0;
  background: var(--kc-overlay);
  border-radius: var(--kc-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 20;
}
.kc-popup {
  background: var(--kc-card-bg);
  border-radius: var(--kc-radius);
  padding: clamp(20px, 5vw, 30px);
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}
.kc-popup h3 {
  font-family: var(--kc-font-display);
  margin: 0 0 10px;
  : 19px;
}
.kc-popup p { color: var(--kc-text-soft); margin: 0 0 20px; font-size: 16px; }
.kc-popup-buttons, .kc-end-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ---------- End screen ---------- */
.kc-end {
  background: var(--kc-card-bg);
  border-radius: var(--kc-radius);
  padding: clamp(24px, 6vw, 38px);
  text-align: center;
}
.kc-end h3 {
  font-family: var(--kc-font-display);
  font-size: clamp(22px, 4vw, 28px);
  margin: 0 0 8px;
}
.kc-end-score {
  font-family: var(--kc-font-display);
  font-size: clamp(32px, 7vw, 44px);
  font-weight: 700;
  color: var(--kc-accent);
  margin: 6px 0 4px;
}
.kc-end p { color: var(--kc-text-soft); margin: 0 0 22px; }
.kc-end-pass-text {
  color: var(--kc-text-soft);
  font-size: 14px;
  margin: -8px 0 18px;
}
.kc-end-replay-link {
  display: inline-block;
  margin-top: 14px;
  color: var(--kc-accent);
  font-family: var(--kc-font-body);
  font-weight: 600;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}
.kc-end-replay-link:hover { opacity: 0.8; }

/* ---------- Responsief ---------- */
@media (max-width: 640px) {
  #kc-app { --kc-answer-columns: 1; }
  .kc-header { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  #kc-app * { animation: none !important; transition: none !important; }
}

[hidden] { display: none !important; }
`;

// ---- HTML-opbouw van het spel ------------------------------------------
var HTML_TEXT = `

  <div class="kc-header">
    <h2 class="kc-title" id="kc-title">Kennischeck</h2>
    <div class="kc-timer" id="kc-timer">00:00</div>
  </div>

  <!-- Startscherm -->
  <div id="kc-intro" class="kc-intro">
    <p id="kc-intro-text">Koppel elke stelling aan het juiste antwoord voordat de tijd om is.</p>
    <button id="kc-start-btn" class="kc-btn kc-btn-primary">Start de kennischeck</button>
  </div>

  <!-- Spel -->
  <div id="kc-game" class="kc-game" hidden>
    <div class="kc-progress" id="kc-progress"></div>
    <div class="kc-instruction" id="kc-instruction-statement" hidden></div>
    <div class="kc-statement-wrap" id="kc-statement-wrap">
      <div class="kc-statement" id="kc-statement"></div>
    </div>
    <div class="kc-instruction" id="kc-instruction-answers" hidden></div>
    <div class="kc-answers" id="kc-answers"></div>
    <div class="kc-score-panel" id="kc-score-panel" hidden>
      <span id="kc-score-label">Score</span>
      <span class="kc-score-value" id="kc-score-value">0</span>
    </div>
  </div>

  <!-- Eindscherm -->
  <div id="kc-end" class="kc-end" hidden>
    <h3 id="kc-end-title"></h3>
    <div class="kc-end-score" id="kc-end-score"></div>
    <p id="kc-end-body"></p>
    <p class="kc-end-pass-text" id="kc-end-pass-text" hidden></p>
    <div class="kc-end-buttons">
      <button id="kc-retry-btn" class="kc-btn kc-btn-retry" hidden>Probeer nog een keer</button>
    </div>
    <button type="button" id="kc-replay-link" class="kc-end-replay-link">Speel nog een keer</button>
  </div>

  <!-- Popup -->
  <div id="kc-popup-overlay" class="kc-popup-overlay" hidden>
    <div class="kc-popup" role="dialog" aria-modal="true" aria-labelledby="kc-popup-title">
      <h3 id="kc-popup-title">Tijd over</h3>
      <p id="kc-popup-body"></p>
      <div class="kc-popup-buttons">
        <button id="kc-edit-btn" class="kc-btn kc-btn-secondary">Ik wil wijzigen</button>
        <button id="kc-done-btn" class="kc-btn kc-btn-primary">Ik ben klaar</button>
      </div>
    </div>
  </div>

`;

// Wordt gezet zodra KennisCheck.init(config) wordt aangeroepen.
var CONFIG = null;

/* =========================================================================
   Vanaf hier: spellogica. Aanpassen is voor de meeste gebruikers niet nodig.
   ========================================================================= */

// ---- DOM-referenties ------------------------------------------------------
var el = {};
function cacheDom() {
  el.app = document.getElementById("kc-app");
  el.title = document.getElementById("kc-title");
  el.timer = document.getElementById("kc-timer");
  el.intro = document.getElementById("kc-intro");
  el.introText = document.getElementById("kc-intro-text");
  el.startBtn = document.getElementById("kc-start-btn");
  el.game = document.getElementById("kc-game");
  el.progress = document.getElementById("kc-progress");
  el.instructionStatement = document.getElementById("kc-instruction-statement");
  el.instructionAnswers = document.getElementById("kc-instruction-answers");
  el.statementWrap = document.getElementById("kc-statement-wrap");
  el.statement = document.getElementById("kc-statement");
  el.answers = document.getElementById("kc-answers");
  el.scorePanel = document.getElementById("kc-score-panel");
  el.scoreLabel = document.getElementById("kc-score-label");
  el.scoreValue = document.getElementById("kc-score-value");
  el.end = document.getElementById("kc-end");
  el.endTitle = document.getElementById("kc-end-title");
  el.endScore = document.getElementById("kc-end-score");
  el.endBody = document.getElementById("kc-end-body");
  el.endPassText = document.getElementById("kc-end-pass-text");
  el.retryBtn = document.getElementById("kc-retry-btn");
  el.replayLink = document.getElementById("kc-replay-link");
  el.popupOverlay = document.getElementById("kc-popup-overlay");
  el.popupTitle = document.getElementById("kc-popup-title");
  el.popupBody = document.getElementById("kc-popup-body");
  el.editBtn = document.getElementById("kc-edit-btn");
  el.doneBtn = document.getElementById("kc-done-btn");
}

// ---- Thema toepassen (CONFIG -> CSS-variabelen) ---------------------------
// Bouwt een CSS font-family-waarde op uit een (Google Font-)naam plus een
// reserve-stack, bijv. buildFontStack("Poppins", "Arial, sans-serif")
// -> "'Poppins', Arial, sans-serif". Is de naam leeg, dan wordt alleen de
// reserve-stack gebruikt.
function buildFontStack(name, fallback) {
  if (!name) return fallback;
  return "'" + name + "', " + fallback;
}

// Laadt de geconfigureerde lettertypen automatisch vanaf Google Fonts door
// een <link>-tag toe te voegen aan de pagina (werkt in de browser van de
// eindgebruiker, niet beperkt tot deze sandbox). Wordt opnieuw aangeroepen
// als applyTheme() opnieuw draait, en werkt dan gewoon de bestaande link bij.
function loadGoogleFonts() {
  var fn = CONFIG.fonts;
  var families = [];
  function addFamily(name, weights) {
    if (!name) return;
    families.push("family=" + name.trim().replace(/ /g, "+") + ":wght@" + weights);
  }
  addFamily(fn.headingFont, fn.headingFontWeights);
  if (fn.bodyFont && fn.bodyFont !== fn.headingFont) {
    addFamily(fn.bodyFont, fn.bodyFontWeights);
  }
  if (families.length === 0) return;

  var url = "https://fonts.googleapis.com/css2?" + families.join("&") + "&display=swap";
  var link = document.getElementById("kc-google-fonts");
  if (!link) {
    link = document.createElement("link");
    link.id = "kc-google-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== url) { link.href = url; }
}

function applyTheme() {
  var c = CONFIG.colors, l = CONFIG.layout, a = CONFIG.animation, fn = CONFIG.fonts, s = el.app.style;
  s.setProperty("--kc-bg", c.background);
  s.setProperty("--kc-card-bg", c.cardBackground);
  s.setProperty("--kc-text", c.text);
  s.setProperty("--kc-text-soft", c.textSoft);
  s.setProperty("--kc-accent", c.accent);
  s.setProperty("--kc-accent-soft", c.accentSoft);
  s.setProperty("--kc-statement-bg", c.statementBackground);
  s.setProperty("--kc-statement-text", c.statementText);
  s.setProperty("--kc-answer-bg", c.answerInitialBg);
  s.setProperty("--kc-answer-text", c.answerInitialText);
  s.setProperty("--kc-answer-used-bg", c.answerUsedBg);
  s.setProperty("--kc-answer-used-text", c.answerUsedText);
  s.setProperty("--kc-answer-correct-bg", c.answerCorrectBg);
  s.setProperty("--kc-answer-correct-text", c.answerCorrectText);
  s.setProperty("--kc-answer-wrong-bg", c.answerWrongBg);
  s.setProperty("--kc-answer-wrong-text", c.answerWrongText);
  s.setProperty("--kc-btn-primary-bg", c.btnPrimaryBg);
  s.setProperty("--kc-btn-primary-text", c.btnPrimaryText);
  s.setProperty("--kc-btn-secondary-bg", c.btnSecondaryBg);
  s.setProperty("--kc-btn-secondary-text", c.btnSecondaryText);
  s.setProperty("--kc-btn-retry-bg", c.btnRetryBg);
  s.setProperty("--kc-btn-retry-text", c.btnRetryText);
  s.setProperty("--kc-timer-bg", c.timerBg);
  s.setProperty("--kc-timer-text", c.timerText);
  s.setProperty("--kc-timer-warning", c.timerWarning);
  s.setProperty("--kc-overlay", c.overlay);
  s.setProperty("--kc-radius", l.borderRadius);
  s.setProperty("--kc-max-width", l.maxWidth);
  s.setProperty("--kc-font-display", buildFontStack(fn.headingFont, fn.fallback));
  s.setProperty("--kc-font-body", buildFontStack(fn.bodyFont, fn.fallback));
  loadGoogleFonts();
  s.setProperty("--kc-answer-columns", String(l.answerColumns));
  s.setProperty("--kc-statement-fade-ms", a.statementFadeMs + "ms");
  s.setProperty("--kc-answer-color-ms", a.answerColorMs + "ms");

  el.title.textContent = CONFIG.general.title;
  el.introText.textContent = CONFIG.general.introText;
  el.startBtn.textContent = CONFIG.general.startButtonText;
  el.editBtn.textContent = CONFIG.texts.btnWijzigen;
  el.doneBtn.textContent = CONFIG.texts.btnKlaar;
  el.retryBtn.textContent = CONFIG.texts.btnRetry;
  el.replayLink.textContent = CONFIG.texts.playAgainLink;
  el.scoreLabel.textContent = CONFIG.texts.scoreLabel;
}

// ---- Spelstatus -------------------------------------------------------
var state = {
  statements: [],      // [{id, text, correctAnswerId}]
  answers: [],         // [{id, label}]
  assignment: {},       // answerId -> statementId | null
  queue: [],            // statementIds die nog getoond moeten worden (eerste ronde)
  currentStatementId: null,
  phase: "intro",       // intro | playing | popup | editing | scoring | finished
  remainingMs: 0,
  timerHandle: null,
  audioCtx: null,
  score: 0
};

function buildStatementsAndAnswers() {
  var statements = [], answers = [];
  CONFIG.paren.forEach(function (pair, i) {
    var sid = "s" + i, aid = "a" + i;
    statements.push({ id: sid, text: pair.stelling, correctAnswerId: aid });
    answers.push({ id: aid, label: pair.antwoord });
  });
  if (CONFIG.general.shuffleAnswers) shuffleArray(answers);
  state.statements = statements;
  state.answers = answers;
}

function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// ---- Audio (zoemer) -----------------------------------------------------
function ensureAudio() {
  if (state.audioCtx) return;
  try {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new Ctx();
  } catch (e) { state.audioCtx = null; }
}
function playBuzzer() {
  if (!CONFIG.sound.enableBuzzer) return;
  ensureAudio();
  if (!state.audioCtx) return;
  if (state.audioCtx.state === "suspended") { state.audioCtx.resume(); }
  var ctx = state.audioCtx;
  var t = ctx.currentTime;
  for (var i = 0; i < CONFIG.sound.buzzerBeeps; i++) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = CONFIG.sound.buzzerFrequency;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.linearRampToValueAtTime(0.0001, t + CONFIG.sound.buzzerBeepDuration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + CONFIG.sound.buzzerBeepDuration + 0.02);
    t += CONFIG.sound.buzzerBeepDuration + CONFIG.sound.buzzerGap;
  }
}

// ---- Timer ----------------------------------------------------------------
function formatTime(ms) {
  var totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  var m = Math.floor(totalSeconds / 60);
  var s = totalSeconds % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}
function updateTimerDisplay() {
  el.timer.textContent = formatTime(state.remainingMs);
  var warn = state.remainingMs <= CONFIG.general.timeWarningSeconds * 1000;
  el.timer.classList.toggle("kc-timer--warning", warn);
}
function startTimer() {
  state.remainingMs = CONFIG.general.timeLimitSeconds * 1000;
  updateTimerDisplay();
  runCountdown();
}
// Hervat het aftellen vanaf de huidige resterende tijd (zonder te resetten).
// Wordt gebruikt zodra de gebruiker "Ik wil wijzigen" kiest: de tijd loopt
// dan gewoon door vanaf het moment dat hij stopte.
function resumeTimer() {
  if (state.timerHandle) return; // loopt al
  updateTimerDisplay();
  runCountdown();
}
function runCountdown() {
  var lastTick = Date.now();
  state.timerHandle = setInterval(function () {
    var now = Date.now();
    var delta = now - lastTick;
    lastTick = now;
    state.remainingMs -= delta;
    if (state.remainingMs <= 0) {
      state.remainingMs = 0;
      updateTimerDisplay();
      stopTimer();
      playBuzzer();
      forceFinish();
      return;
    }
    updateTimerDisplay();
  }, 200);
}
function stopTimer() {
  if (state.timerHandle) { clearInterval(state.timerHandle); state.timerHandle = null; }
}

// ---- Renderen ---------------------------------------------------------
function renderAnswers() {
  el.answers.innerHTML = "";
  state.answers.forEach(function (answer) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kc-answer-btn";
    btn.dataset.answerId = answer.id;
    btn.innerHTML = '<span class="kc-answer-icon" aria-hidden="true"></span><span class="kc-answer-label"></span>';
    btn.querySelector(".kc-answer-label").textContent = answer.label;
    btn.addEventListener("click", function () { onAnswerClick(answer.id); });
    el.answers.appendChild(btn);
  });
  refreshAnswerVisuals();
}
function answerBtnEl(answerId) {
  return el.answers.querySelector('[data-answer-id="' + answerId + '"]');
}
function refreshAnswerVisuals() {
  state.answers.forEach(function (answer) {
    var btn = answerBtnEl(answer.id);
    if (!btn) return;
    btn.classList.remove("kc-answer-btn--used", "kc-answer-btn--correct", "kc-answer-btn--wrong");
    var assigned = state.assignment[answer.id];
    if (assigned) { btn.classList.add("kc-answer-btn--used"); }
    btn.disabled = false;
  });
}
// Animeert een knop die opnieuw gekoppeld wordt: eerst terug naar de
// initiële (ongekoppelde) staat, en na CONFIG.animation.answerColorMs weer
// naar de gekoppelde staat (nu met de nieuwe stelling erachter).
function flashButtonReassign(answerId) {
  var btn = answerBtnEl(answerId);
  if (!btn) return;
  btn.classList.remove("kc-answer-btn--used");
  setTimeout(function () {
    btn.classList.add("kc-answer-btn--used");
  }, CONFIG.animation.answerColorMs);
}
function renderProgress() {
  if (!CONFIG.general.showProgress) { el.progress.hidden = true; return; }
  el.progress.hidden = false;
  var total = state.statements.length;
  var done = total - state.queue.length;
  var current = Math.min(done + 1, total);
  el.progress.textContent = CONFIG.texts.progressLabel(current, total);
}
function showStatementText(text) {
  el.statement.classList.add("kc-fade");
  setTimeout(function () {
    el.statement.textContent = text;
    el.statement.classList.remove("kc-fade");
  }, CONFIG.animation.statementFadeMs);
}
function getStatementById(id) {
  for (var i = 0; i < state.statements.length; i++) {
    if (state.statements[i].id === id) return state.statements[i];
  }
  return null;
}
function getCorrectStatementIdForAnswer(answerId) {
  for (var i = 0; i < state.statements.length; i++) {
    if (state.statements[i].correctAnswerId === answerId) return state.statements[i].id;
  }
  return null;
}

// ---- Spel starten -------------------------------------------------------
function init() {
  cacheDom();
  applyTheme();
  buildStatementsAndAnswers();
  wireStaticEvents();
  resetToIntro();
}

function wireStaticEvents() {
  el.startBtn.addEventListener("click", function () {
    ensureAudio();
    beginRound();
  });
  el.editBtn.addEventListener("click", onEditClick);
  el.doneBtn.addEventListener("click", onDoneClick);
  el.retryBtn.addEventListener("click", resetGame);
  el.replayLink.addEventListener("click", function (e) {
    e.preventDefault();
    resetGame();
  });
}

function resetToIntro() {
  state.phase = "intro";
  el.intro.hidden = false;
  el.game.hidden = true;
  el.end.hidden = true;
  el.popupOverlay.hidden = true;
  el.scorePanel.hidden = true;
  el.instructionStatement.hidden = true;
  el.instructionAnswers.hidden = true;
  el.retryBtn.hidden = true;
  el.endPassText.hidden = true;
  el.replayLink.hidden = true;
  el.timer.textContent = formatTime(CONFIG.general.timeLimitSeconds * 1000);
  if (!CONFIG.general.requireStartButton) {
    beginRound();
  }
}

function beginRound() {
  ensureAudio();
  buildStatementsAndAnswers();
  state.assignment = {};
  state.answers.forEach(function (a) { state.assignment[a.id] = null; });
  state.queue = state.statements.map(function (s) { return s.id; });
  if (CONFIG.general.shuffleStatements) shuffleArray(state.queue);
  state.score = 0;
  state.phase = "playing";

  el.intro.hidden = true;
  el.end.hidden = true;
  el.game.hidden = false;
  el.scorePanel.hidden = true;
  el.statementWrap.hidden = false;
  el.instructionStatement.hidden = true;
  el.instructionAnswers.hidden = true;

  renderAnswers();
  renderProgress();
  state.currentStatementId = state.queue[0];
  showStatementText(getStatementById(state.currentStatementId).text);

  startTimer();
}

// ---- Klikken tijdens de normale ronde -----------------------------------
function onAnswerClick(answerId) {
  if (state.phase === "playing") {
    var alreadyHeld = state.assignment[answerId];

    if (!alreadyHeld) {
      // Knop is nog vrij: koppel de huidige stelling eraan.
      state.assignment[answerId] = state.currentStatementId;
      state.queue.shift();
      refreshAnswerVisuals();

      if (state.queue.length > 0) {
        state.currentStatementId = state.queue[0];
        showStatementText(getStatementById(state.currentStatementId).text);
        renderProgress();
      } else {
        // Alle stellingen zijn gekoppeld: de tijd stopt direct.
        state.currentStatementId = null;
        el.statement.textContent = "";
        stopTimer();
        showPopup();
      }
    } else {
      // Knop is al gekoppeld aan een andere stelling: die stelling komt nu
      // weer vrij in beeld, en de huidige stelling neemt haar plaats in.
      // De knop animeert eerst terug naar zijn initiële staat en daarna
      // weer naar de gekoppelde staat (nu met de nieuwe stelling).
      var freedStatementId = alreadyHeld;
      state.assignment[answerId] = state.currentStatementId;
      state.queue.shift();
      state.queue.unshift(freedStatementId);
      state.currentStatementId = freedStatementId;
      flashButtonReassign(answerId);
      showStatementText(getStatementById(freedStatementId).text);
      renderProgress();
    }
  } else if (state.phase === "editing") {
    handleEditClick(answerId);
  }
}

// ---- Pop-up ---------------------------------------------------------------
function showPopup() {
  state.phase = "popup";
  var seconds = Math.ceil(state.remainingMs / 1000);
  el.popupTitle.textContent = CONFIG.texts.popupTitle;
  el.popupBody.textContent = CONFIG.texts.popupBody(seconds);
  el.popupOverlay.hidden = false;
}
function hidePopup() {
  el.popupOverlay.hidden = true;
}
function onDoneClick() {
  hidePopup();
  finishGame();
}
function onEditClick() {
  hidePopup();
  enterEditMode();
  resumeTimer(); // de tijd loopt weer door tijdens het wijzigen
}

// ---- Bewerk-modus (puzzel met één "losse" stelling) -----------------------
// Werking, in twee stappen:
//  1) De gebruiker selecteert eerst ZELF welke antwoordknop ontkoppeld moet
//     worden (instructie boven de antwoordknoppen). Pas na die keuze komt de
//     bijbehorende stelling los te staan en verschijnt deze in beeld; de
//     gekozen knop krijgt weer zijn beginkleur.
//  2) De gebruiker koppelt de losse stelling aan een (andere) antwoordknop
//     (instructie boven de stelling). Hield die knop al een andere stelling
//     vast, dan komt díe nu los te staan en verschijnt in beeld — net zo
//     lang tot de gebruiker uiteindelijk de oorspronkelijk leeggemaakte knop
//     weer vult. Dan is alles weer gekoppeld en verschijnt de pop-up opnieuw.
// De tijd loopt tijdens dit hele proces gewoon door (zie resumeTimer in
// onEditClick) en stopt pas weer zodra de puzzel sluit.
function enterEditMode() {
  state.phase = "editing";
  state.currentStatementId = null; // nog geen losse stelling: wachten op keuze
  el.progress.hidden = true;
  el.statementWrap.hidden = true;
  el.statement.textContent = "";
  el.instructionStatement.hidden = true;
  el.instructionAnswers.hidden = false;
  el.instructionAnswers.textContent = CONFIG.texts.editSelectInstruction;
  refreshAnswerVisuals();
}
function handleEditClick(clickedAnswerId) {
  if (state.currentStatementId === null) {
    // Stap 1: gebruiker kiest welke koppeling ontkoppeld wordt.
    var freedStatementId = state.assignment[clickedAnswerId];
    if (!freedStatementId) return; // (kan niet voorkomen: op dit moment is alles gekoppeld)
    state.assignment[clickedAnswerId] = null;
    state.currentStatementId = freedStatementId;
    refreshAnswerVisuals();

    el.instructionAnswers.hidden = true;
    el.statementWrap.hidden = false;
    el.instructionStatement.hidden = false;
    el.instructionStatement.textContent = CONFIG.texts.editLinkInstruction;
    showStatementText(getStatementById(freedStatementId).text);
    return;
  }

  // Stap 2: gebruiker koppelt de losse stelling aan de geklikte knop.
  var previous = state.assignment[clickedAnswerId];
  state.assignment[clickedAnswerId] = state.currentStatementId;
  refreshAnswerVisuals();

  if (previous) {
    // Deze knop hield al een andere stelling vast: die komt nu los te staan.
    state.currentStatementId = previous;
    showStatementText(getStatementById(previous).text);
  } else {
    // De oorspronkelijk leeggemaakte knop is weer gevuld: puzzel gesloten.
    // De tijd stopt weer totdat de gebruiker opnieuw "Ik wil wijzigen" kiest.
    state.currentStatementId = null;
    el.statement.textContent = "";
    el.statementWrap.hidden = true;
    el.instructionStatement.hidden = true;
    el.instructionAnswers.hidden = true;
    stopTimer();
    showPopup();
  }
}

// ---- Tijd op: forceer afronden --------------------------------------------
function forceFinish() {
  hidePopup();
  if (state.phase === "finished" || state.phase === "scoring") return;
  finishGame();
}

// ---- Score & afronden -------------------------------------------------
function countCorrect() {
  var correct = 0;
  state.answers.forEach(function (answer) {
    var correctStatementId = getCorrectStatementIdForAnswer(answer.id);
    if (state.assignment[answer.id] === correctStatementId) correct++;
  });
  return correct;
}

function finishGame() {
  stopTimer();
  state.phase = "scoring";
  el.game.hidden = false;
  el.scorePanel.hidden = false;
  el.statementWrap.hidden = true;
  el.progress.hidden = true;
  el.instructionStatement.hidden = true;
  el.instructionAnswers.hidden = true;

  state.answers.forEach(function (a) {
    var btn = answerBtnEl(a.id);
    if (btn) btn.disabled = true;
  });

  state.score = 0;
  el.scoreValue.textContent = "0";
  el.scoreValue.style.color = "";
  el.scoreValue.classList.remove("kc-score-blink");

  // Tijdsbonus: de resterende tijd telt in honderdsten van een seconde, elke
  // honderdste seconde levert (pointsPerSecondRemaining / 100) punten op.
  var centiseconds = Math.floor(state.remainingMs / 10);
  var pointsPerCentisecond = CONFIG.general.pointsPerSecondRemaining / 100;
  var timeBonus = Math.round(centiseconds * pointsPerCentisecond);

  animateTimeBonusReveal(state.remainingMs, timeBonus, CONFIG.general.timeBonusAnimationMs, function () {
    state.score = timeBonus;
    el.scoreValue.textContent = state.score;

    var correctList = state.answers.filter(function (a) {
      return state.assignment[a.id] === getCorrectStatementIdForAnswer(a.id);
    });
    var wrongList = state.answers.filter(function (a) {
      return state.assignment[a.id] !== getCorrectStatementIdForAnswer(a.id);
    });

    // Eerst alle juiste antwoorden één voor één erbij, dan alle foute eraf.
    revealList(correctList, 0, true, function () {
      revealList(wrongList, 0, false, showEndScreen);
    });
  });
}

// Animeert het scoregetal van "from" naar "to" over "durationMs", met
// requestAnimationFrame (gebruikt zowel voor de tijdsbonus als voor het
// per-antwoord op-/aftellen van punten).
// Animeert de tijdsbonus-fase: de score telt op van 0 naar de tijdsbonus,
// terwijl de zichtbare timer TEGELIJKERTIJD (synchroon, zelfde voortgang en
// duur) terugtelt van de resterende tijd naar 00:00.
function animateTimeBonusReveal(startRemainingMs, targetScore, durationMs, onDone) {
  if (durationMs <= 0) {
    state.score = targetScore;
    el.scoreValue.textContent = targetScore;
    el.timer.textContent = formatTime(0);
    el.timer.classList.remove("kc-timer--warning");
    onDone();
    return;
  }
  var start = null;
  function step(timestamp) {
    if (start === null) start = timestamp;
    var progress = Math.min(1, (timestamp - start) / durationMs);

    var scoreValue = Math.round(targetScore * progress);
    state.score = scoreValue;
    el.scoreValue.textContent = scoreValue;

    var displayedMs = Math.max(0, startRemainingMs * (1 - progress));
    el.timer.textContent = formatTime(displayedMs);
    el.timer.classList.toggle("kc-timer--warning", displayedMs <= CONFIG.general.timeWarningSeconds * 1000);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Tijd staat nu op 00:00: terug naar de standaard (niet-waarschuwings)kleur.
      el.timer.textContent = formatTime(0);
      el.timer.classList.remove("kc-timer--warning");
      onDone();
    }
  }
  requestAnimationFrame(step);
}

function animateScoreCount(from, to, durationMs, onDone) {
  if (durationMs <= 0 || from === to) {
    state.score = to;
    el.scoreValue.textContent = to;
    onDone();
    return;
  }
  var start = null;
  function step(timestamp) {
    if (start === null) start = timestamp;
    var progress = Math.min(1, (timestamp - start) / durationMs);
    var value = Math.round(from + (to - from) * progress);
    state.score = value;
    el.scoreValue.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onDone();
    }
  }
  requestAnimationFrame(step);
}

// Onthult een lijst antwoordknoppen één voor één. Per antwoord:
//  1) de knop licht direct op in de juist/fout-kleur (zoals al gebeurde);
//  2) de score knippert CONFIG.animation.scoreBlinkSeconds (Z) seconden in
//     de bijbehorende score-kleur (Y voor juist, F voor fout);
//  3) de punten worden in CONFIG.animation.scoreCountSeconds (T) seconden
//     1 voor 1 bij- of afgeteld, in diezelfde kleur;
//  4) de score-kleur keert terug naar de oorspronkelijke kleur, waarna (na
//     een korte pauze van revealDelayMs) het volgende antwoord aan de beurt is.
function revealList(list, index, isCorrect, onDone) {
  if (index >= list.length) { onDone(); return; }
  var answer = list[index];
  var btn = answerBtnEl(answer.id);
  if (btn) {
    btn.classList.remove("kc-answer-btn--used");
    btn.classList.add(isCorrect ? "kc-answer-btn--correct" : "kc-answer-btn--wrong");
    var icon = btn.querySelector(".kc-answer-icon");
    if (icon) icon.textContent = isCorrect ? "\u2713" : "\u2717";
  }

  var highlightColor = isCorrect ? CONFIG.colors.scoreCorrectColor : CONFIG.colors.scoreWrongColor;
  var delta = isCorrect ? CONFIG.general.pointsPerCorrectAnswer : -CONFIG.general.pointsPerWrongAnswer;
  var startScore = state.score;
  var endScore = state.score + delta;

  el.scoreValue.style.color = highlightColor;
  el.scoreValue.classList.add("kc-score-blink");

  setTimeout(function () {
    el.scoreValue.classList.remove("kc-score-blink");

    animateScoreCount(startScore, endScore, CONFIG.animation.scoreCountSeconds * 1000, function () {
      el.scoreValue.style.color = ""; // terug naar de initiële (overgeërfde) kleur
      setTimeout(function () { revealList(list, index + 1, isCorrect, onDone); }, CONFIG.general.revealDelayMs);
    });
  }, CONFIG.animation.scoreBlinkSeconds * 1000);
}

function showEndScreen() {
  state.phase = "finished";
  var total = state.statements.length;
  var correct = countCorrect();
  var percentage = total > 0 ? (correct / total) * 100 : 0;
  var passed = CONFIG.general.passCriteria === "minScore"
    ? state.score >= CONFIG.general.passMinScore
    : percentage >= CONFIG.general.passPercentage;

  el.endTitle.textContent = passed ? CONFIG.texts.finishedTitleSuccess : CONFIG.texts.finishedTitleFail;
  el.endScore.textContent = state.score + " punten";
  el.endBody.textContent = CONFIG.texts.finishedBody(correct, total);

  el.retryBtn.hidden = passed;
  el.endPassText.hidden = !passed;
  if (passed) { el.endPassText.textContent = CONFIG.texts.passContinueText; }
  // Bij een onvoldoende resultaat staat de "Probeer nog een keer"-knop er al
  // duidelijk; de extra "speel nog een keer"-link is dan overbodig en wordt
  // alleen getoond bij een voldoende resultaat (waar die knop ontbreekt).
  el.replayLink.hidden = !passed;

  el.game.hidden = true;
  el.end.hidden = false;

  if (passed) {
    CONFIG.onContinue({ score: state.score, correct: correct, total: total });
  }
}

function resetGame() {
  stopTimer();
  hidePopup();
  el.end.hidden = true;
  resetToIntro();
}


// ---- Stijl en opmaak injecteren, en het spel opstarten --------------------
function injectStyle() {
  if (document.getElementById("kc-engine-style")) return;
  var styleEl = document.createElement("style");
  styleEl.id = "kc-engine-style";
  styleEl.textContent = CSS_TEXT;
  document.head.appendChild(styleEl);
}

// ---- Publieke API: dit is het enige dat je vanuit Rise aanroept ----------
global.KennisCheck = {
  init: function (userConfig) {
    CONFIG = userConfig;

    function ready() {
      injectStyle();
      var root = document.getElementById("kc-app");
      if (!root) {
        console.error('KennisCheck: geen element met id="kc-app" gevonden. Voeg <div id="kc-app"></div> toe vóór het laden van dit script.');
        return;
      }
      root.innerHTML = HTML_TEXT;
      init(); // bestaande opstartroutine: cacheDom, applyTheme, stellingen opbouwen, events koppelen, startscherm tonen
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ready);
    } else {
      ready();
    }
  }
};

})(window);

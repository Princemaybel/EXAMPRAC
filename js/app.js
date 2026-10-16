/**
 * app.js — EXAMPRAC Main Application Controller
 * Manages screen routing, Practice Mode, Mock Exam, Memory Training,
 * Category Practice, Review, Progress, and Settings.
 *
 * Runs as an ES module loaded from index.html.
 */

import { loadQuestionBank, getAllQuestions, getQuestionsByCategory, getCategories,
         buildSessionQuestions, isCorrect, getCorrectText, shuffle,
         getActiveReviewer, setActiveReviewer } from './questions.js';
import { openDB, recordAnswer, getIncorrectQuestions, getAllQuestionStats,
         getAllSessions, saveSession, exportProgress, importProgress,
         resetAllProgress, getAppStat, setAppStat, incrementAppStat,
         updateStreak, getDueForReview } from './database.js';
import { QuestionTimer, formatTime } from './timer.js';
import { Settings, applyTheme, hapticFeedback } from './settings.js';
import { playTap, playCorrect, playWrong, playVictory } from './sound.js';
import { triggerConfetti } from './confetti.js';

/* ──────────────────────────────────────────────────────────────
   SCREEN ROUTING
────────────────────────────────────────────────────────────── */
const screens = {};
let _currentScreen = null;

function initScreens() {
  document.querySelectorAll('.screen').forEach(el => {
    screens[el.id] = el;
  });
}

function showScreen(id) {
  if (_currentScreen) {
    screens[_currentScreen]?.classList.remove('active');
  }
  const scr = screens[id];
  if (scr) {
    scr.classList.add('active', 'screen-fade-in');
    scr.addEventListener('animationend', () => scr.classList.remove('screen-fade-in'), { once: true });
    _currentScreen = id;
    window.scrollTo(0, 0);

    // Update bottom nav bar state
    document.querySelectorAll('.bnav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === id);
    });
    const bnav = document.getElementById('bottom-nav');
    if (bnav) {
      const hideOn = ['screen-practice', 'screen-exam'];
      bnav.style.display = hideOn.includes(id) ? 'none' : 'flex';
    }
  }
}

/* ──────────────────────────────────────────────────────────────
   TOAST & MODAL UTILITIES
────────────────────────────────────────────────────────────── */
let _toastTimer;
function toast(msg, type = '', duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

function showModal({ title, body, confirmText = 'Confirm', confirmClass = 'btn-danger', onConfirm }) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent  = body;
  const btn = document.getElementById('modal-confirm');
  btn.textContent  = confirmText;
  btn.className    = `btn ${confirmClass}`;
  btn.onclick      = () => { hideModal(); onConfirm?.(); };
  overlay.classList.add('show');
}
function hideModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

/* ──────────────────────────────────────────────────────────────
   HOME SCREEN
────────────────────────────────────────────────────────────── */
async function renderHome() {
  showScreen('screen-home');
  const rev = getActiveReviewer();
  const isAfpsat = (rev === 'afpsat');

  // Update tabs UI
  document.getElementById('tab-rev-paarcqe')?.classList.toggle('active', !isAfpsat);
  document.getElementById('tab-rev-afpsat')?.classList.toggle('active', isAfpsat);

  // Update header and hero text
  const subTitle = isAfpsat ? 'AFPSAT Reviewer' : 'PAARCQE Reviewer';
  const tagline = isAfpsat ? 'AFPSAT Complete Reviewer 2026' : 'PAARCQE Offline Practice Reviewer 2026';
  const pracDesc = isAfpsat ? '100 Qs: Abstract, Numerical, Verbal' : '100 questions, steady order';
  const catDesc = isAfpsat ? '3 Chapters' : '5 Subjects';
  
  const headerSub = document.querySelector('.header-subtitle');
  if (headerSub) headerSub.textContent = subTitle;
  const heroTag = document.querySelector('.home-hero .tagline');
  if (heroTag) heroTag.textContent = tagline;
  const pracSub = document.getElementById('home-prac-sub');
  if (pracSub) pracSub.textContent = pracDesc;
  const catSub = document.getElementById('home-cat-sub');
  if (catSub) catSub.textContent = catDesc;

  // Calculate stats scoped to active reviewer
  const allQs = getAllQuestions();
  const qidSet = new Set(allQs.map(q => q.id));
  const qstats = await getAllQuestionStats();
  const activeStats = qstats.filter(s => qidSet.has(s.qid));

  const answered = activeStats.reduce((sum, s) => sum + (s.attempts || 0), 0);
  const correct = activeStats.reduce((sum, s) => sum + (s.correct || 0), 0);
  const streak = await getAppStat('streak', 0);
  const mastered = activeStats.filter(s => s.mastery === 'mastered').length;
  const acc = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  setText('stat-answered',   answered);
  setText('stat-accuracy',   acc + '%');
  setText('stat-streak',     streak + ' 🔥');
  setText('stat-mastered',   mastered);

  // Offline indicator
  updateOfflineBadge();
}

window.EXAMPRAC = window.EXAMPRAC || {};

EXAMPRAC.switchReviewer = async function(revId) {
  setActiveReviewer(revId);
  await loadQuestionBank(revId);
  await renderHome();
  playTap();
  toast(revId === 'afpsat' ? '⚔️ Switched to AFPSAT 2026 Reviewer' : '🇵🇭 Switched to PAARCQE 2026 Reviewer', 'success', 2000);
};

function updateOfflineBadge() {
  const badge = document.getElementById('offline-badge');
  if (!badge) return;
  const cached = localStorage.getItem('ep_cached') === '1';
  badge.textContent = cached ? '✓ Ready Offline' : '⚡ Online Required';
  badge.className   = `offline-badge ${cached ? '' : 'loading'}`;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ──────────────────────────────────────────────────────────────
   PRACTICE MODE
────────────────────────────────────────────────────────────── */
let _practiceState = null;

function startPractice(sourceQuestions, mode = 'practice', categoryFilter = null) {
  const qs = buildSessionQuestions(sourceQuestions);
  _practiceState = {
    questions:      qs,
    current:        0,
    answers:        {},           // qid -> { selectedId, correct }
    mode,                         // 'practice' | 'memory'
    categoryFilter,
    submitted:      false,        // has current Q been submitted?
    timer:          null,
    startTime:      Date.now(),
  };
  showScreen('screen-practice');
  renderPracticeQuestion();
}

function renderPracticeQuestion() {
  const st = _practiceState;
  if (!st || st.current >= st.questions.length) {
    endPractice();
    return;
  }

  const q   = st.questions[st.current];
  const tot = st.questions.length;
  const idx = st.current;

  setText('prac-q-num', `Q${idx + 1} of ${tot}`);
  setText('prac-category', q.category);
  
  const questionEl = document.getElementById('prac-question');
  const diagramHtml = q.image ? `<div class="q-diagram-wrap"><img src="${q.image}" class="q-diagram-img" alt="Question Diagram"></div>` : '';
  questionEl.innerHTML = `<span style="display:block;white-space:pre-line;">${escHtml(q.question)}</span>${diagramHtml}`;

  // Progress bar
  const pct = ((idx) / tot) * 100;
  document.getElementById('prac-progress-fill').style.width = pct + '%';

  // Choices
  const choicesEl = document.getElementById('prac-choices');
  const letters   = ['A', 'B', 'C', 'D', 'E'];
  choicesEl.innerHTML = q.choices.map((ch, i) => `
    <button class="choice-btn" data-id="${ch.id}" onclick="EXAMPRAC.selectChoice('${ch.id}')">
      <span class="choice-letter">${letters[i] || (i + 1)}</span>
      <span>${escHtml(ch.text)}</span>
    </button>
  `).join('');

  // Hide feedback
  document.getElementById('prac-feedback').classList.remove('show');
  document.getElementById('btn-prac-next').style.display     = '';
  document.getElementById('btn-prac-continue').style.display = 'none';
  document.getElementById('btn-prac-next').textContent = idx + 1 < tot ? 'Submit →' : 'Submit & Finish';

  st.submitted = false;

  // Prev button state
  const prevBtn = document.getElementById('btn-prac-prev');
  if (prevBtn) prevBtn.disabled = (idx === 0);

  // Restore previously selected answer if navigating back
  const prev = st.answers[q.id];
  if (prev) {
    markChoiceSelected(prev.selectedId);
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.disabled = true;
      const id = btn.dataset.id;
      if (id === q.correctAnswer) btn.classList.add('correct');
      else if (id === prev.selectedId && !prev.correct) btn.classList.add('wrong');
    });
    if (st.mode === 'practice' || st.mode === 'memory' || st.mode === 'repeat') {
      showFeedback(q, prev.selectedId, prev.correct);
    }
    st.submitted = true;
    document.getElementById('btn-prac-next').style.display     = 'none';
    document.getElementById('btn-prac-continue').style.display = '';
    document.getElementById('btn-prac-continue').textContent = idx + 1 < tot ? 'Continue →' : 'See Results';
  }

  // Start timer
  startPracticeTimer();
}

function startPracticeTimer() {
  const secs = Settings.getTimerSecs();
  const st   = _practiceState;

  if (st.timer) st.timer.stop();
  if (!secs || st.submitted) return;

  const timerEl = document.getElementById('prac-timer');
  st.timer = new QuestionTimer({
    seconds:  secs,
    warnAt:   Math.min(10, Math.floor(secs * 0.33)),
    dangerAt: Math.min(5, Math.floor(secs * 0.15)),
    onTick: (remaining, cls) => {
      timerEl.innerHTML = `⏱ ${formatTime(remaining)}`;
      timerEl.className = `timer-display ${cls}`;
    },
    onExpire: () => {
      if (!st.submitted) {
        timerEl.innerHTML = '⏱ 00:00';
        timerEl.className = 'timer-display danger';
        autoSubmitPractice();
      }
    },
  });
  st.timer.start();
}

window.EXAMPRAC = window.EXAMPRAC || {};

EXAMPRAC.selectChoice = function(choiceId) {
  const st = _practiceState;
  if (!st || st.submitted) return;
  markChoiceSelected(choiceId);
  st._pendingChoice = choiceId;
  playTap();
};

function markChoiceSelected(choiceId) {
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.id === choiceId);
  });
}

function autoSubmitPractice() {
  const st = _practiceState;
  if (!st || st.submitted) return;
  const q          = st.questions[st.current];
  const selectedId = st._pendingChoice || null;
  submitPracticeAnswer(q, selectedId, true);
}

function submitPracticeAnswer(q, selectedId, timedOut = false) {
  const st = _practiceState;
  if (!st || st.submitted) return;
  st.submitted = true;
  if (st.timer) st.timer.stop();

  if (timedOut && !selectedId) {
    toast('⏰ Time\'s up! No answer selected.', 'error', 2000);
  }

  const correct = selectedId ? isCorrect(q, selectedId) : false;
  st.answers[q.id] = { selectedId, correct };

  // Record in DB async (non-blocking)
  recordAnswer(q.id, q.category, correct);
  if (correct) {
    incrementAppStat('totalCorrect', 1);
    hapticFeedback('light');
    playCorrect();
  } else {
    incrementAppStat('totalIncorrect', 1);
    hapticFeedback('medium');
    playWrong();
  }
  incrementAppStat('totalAnswered', 1);

  // Visual feedback on buttons
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    const id = btn.dataset.id;
    if (id === q.correctAnswer) btn.classList.add('correct');
    else if (id === selectedId && !correct) btn.classList.add('wrong');
  });

  // Show feedback panel
  if (st.mode === 'practice' || st.mode === 'memory' || st.mode === 'repeat') {
    showFeedback(q, selectedId, correct, timedOut);
  }

  // Repeat Until Correct mode: re-queue missed question at the end (up to max 2 repeats)
  if (st.mode === 'repeat' && !correct) {
    q._repeatCount = (q._repeatCount || 0) + 1;
    if (q._repeatCount <= 2) {
      st.questions.push({
        ...q,
        choices: shuffle(q.choices),
        _repeatCount: q._repeatCount,
      });
    }
  }

  // Switch button
  document.getElementById('btn-prac-next').style.display     = 'none';
  document.getElementById('btn-prac-continue').style.display = '';
  const tot = st.questions.length;
  document.getElementById('btn-prac-continue').textContent =
    st.current + 1 < tot ? 'Continue →' : 'See Results';
}

function showFeedback(q, selectedId, correct, timedOut = false) {
  const panel   = document.getElementById('prac-feedback');
  const result  = document.getElementById('prac-feedback-result');
  const explain = document.getElementById('prac-feedback-explain');

  let label = '';
  if (timedOut && !selectedId) { label = '⏰ Time\'s up!'; result.className = 'feedback-result wrong-result'; }
  else if (correct)            { label = '✅ Correct!';    result.className = 'feedback-result correct-result'; }
  else                         { label = '❌ Incorrect';   result.className = 'feedback-result wrong-result'; }

  result.innerHTML = `<strong>${label}</strong>
    ${!correct ? `<span style="font-size:0.8rem;color:var(--text-sub)">Correct: ${escHtml(getCorrectText(q))}</span>` : ''}`;

  const showEx = Settings.getShowExplain();
  explain.style.display = q.explanation && showEx ? '' : 'none';
  if (q.explanation && showEx) explain.textContent = q.explanation;

  panel.classList.add('show');
}

EXAMPRAC.practiceNext = function() {
  const st = _practiceState;
  if (!st) return;

  if (!st.submitted) {
    if (!st._pendingChoice) {
      toast('Please select an answer first!', 'error', 1800);
      return;
    }
    const q = st.questions[st.current];
    submitPracticeAnswer(q, st._pendingChoice);
    return;
  }

  st.current++;
  st._pendingChoice = null;
  renderPracticeQuestion();
};

EXAMPRAC.practiceContinue = function() {
  const st = _practiceState;
  if (!st) return;
  st.current++;
  st._pendingChoice = null;
  renderPracticeQuestion();
};

EXAMPRAC.pausePractice = function() {
  const st = _practiceState;
  if (st?.timer) st.timer.pause();
  showModal({
    title:       'Session Paused',
    body:        'Your progress is saved. Resume to continue.',
    confirmText: 'Resume',
    confirmClass:'btn-primary',
    onConfirm:   () => { if (st?.timer) st.timer.resume(); },
  });
};

EXAMPRAC.practicePrev = function() {
  const st = _practiceState;
  if (!st || st.current <= 0) {
    toast('Already at the first question', 'info', 1500);
    return;
  }
  if (st.timer) st.timer.stop();
  st.current--;
  st._pendingChoice = null;
  renderPracticeQuestion();
};

EXAMPRAC.confirmExitPractice = function() {
  const st = _practiceState;
  if (!st) {
    EXAMPRAC.goHome();
    return;
  }
  if (st.timer) st.timer.pause();
  showModal({
    title:        'Exit Practice Session?',
    body:         'Are you sure you want to exit? Your progress for this session will be closed.',
    confirmText:  'Exit to Home',
    confirmClass: 'btn-danger',
    cancelText:   'Keep Practicing',
    onConfirm:    () => {
      if (st.timer) st.timer.stop();
      _practiceState = null;
      EXAMPRAC.goHome();
    },
    onCancel:     () => {
      if (st.timer) st.timer.resume();
    }
  });
};

function endPractice() {
  if (!_practiceState) return;
  const st       = _practiceState;
  const qs       = st.questions;
  const answers  = st.answers;
  let   correct  = 0, incorrect = 0, unanswered = 0;

  qs.forEach(q => {
    const a = answers[q.id];
    if (!a)                      unanswered++;
    else if (a.correct)          correct++;
    else                         incorrect++;
  });

  const total    = qs.length;
  const pct      = total > 0 ? Math.round((correct / total) * 100) : 0;
  const duration = Math.round((Date.now() - st.startTime) / 1000);

  // Save session
  saveSession({ mode: st.mode, total, correct, incorrect, unanswered, pct, duration });
  updateStreak();

  // Best score tracking
  getAppStat('bestScore', 0).then(best => {
    if (pct > best) setAppStat('bestScore', pct);
  });

  renderResults({ qs, answers, correct, incorrect, unanswered, pct, mode: st.mode });
}

/* ──────────────────────────────────────────────────────────────
   RESULTS SCREEN
────────────────────────────────────────────────────────────── */
let _lastResults = null;

function renderResults({ qs, answers, correct, incorrect, unanswered, pct, mode }) {
  _lastResults = { qs, answers, correct, incorrect, unanswered, pct, mode };
  showScreen('screen-results');

  setText('res-pct',        pct + '%');
  setText('res-correct',    correct);
  setText('res-incorrect',  incorrect);
  setText('res-unanswered', unanswered);
  setText('res-total',      qs.length);

  // Grade message
  let grade = '';
  if (pct >= 90)      grade = '🏆 Excellent! Outstanding performance!';
  else if (pct >= 75) grade = '✅ Good job! Keep it up!';
  else if (pct >= 60) grade = '📚 Passing. More practice needed.';
  else                grade = '💪 Keep studying — you\'ll get there!';
  setText('res-grade', grade);

  if (pct >= 75) {
    playVictory();
    triggerConfetti();
  }

  // Render question review
  const reviewEl = document.getElementById('res-review-list');
  reviewEl.innerHTML = qs.map(q => {
    const a      = answers[q.id];
    const status = !a ? 'unanswered' : a.correct ? 'correct' : 'wrong';
    const label  = !a ? 'Unanswered' : a.correct ? '✅ Correct' : '❌ Incorrect';
    const selText = a?.selectedId
      ? (q.choices.find(c => c.id === a.selectedId)?.text || 'N/A')
      : '(no answer)';
    return `
      <div class="review-item">
        <div class="review-item-header">
          <span class="review-q-text">${q.number}. ${escHtml(q.question)}</span>
          <span class="review-status ${status}">${label}</span>
        </div>
        <div class="review-answer-row">Your answer: <strong>${escHtml(selText)}</strong></div>
        <div class="review-answer-row">Correct: <strong style="color:var(--correct)">${escHtml(getCorrectText(q))}</strong></div>
        ${q.explanation ? `<div class="feedback-explanation" style="margin-top:0.5rem;">${escHtml(q.explanation)}</div>` : ''}
      </div>`;
  }).join('');
}

/* ──────────────────────────────────────────────────────────────
   MOCK EXAMINATION MODE
────────────────────────────────────────────────────────────── */
let _examState = null;

function startExam() {
  const totalQ  = Settings.getExamQs();
  const totalM  = Settings.getExamMins();
  const qs      = buildSessionQuestions(getAllQuestions()).slice(0, totalQ);

  _examState = {
    questions:   qs,
    current:     0,
    answers:     {},   // qid -> selectedId
    flagged:     new Set(),
    totalSecs:   totalM * 60,
    startTs:     Date.now(),
    timer:       null,
    submitted:   false,
  };

  showScreen('screen-exam');
  buildExamNavGrid();
  renderExamQuestion();
  startExamTimer();
}

function startExamTimer() {
  const st    = _examState;
  const timerEl = document.getElementById('exam-global-timer');

  function tick() {
    const elapsed   = Math.floor((Date.now() - st.startTs) / 1000);
    const remaining = Math.max(0, st.totalSecs - elapsed);
    timerEl.textContent = formatTime(remaining);

    const pct = remaining / st.totalSecs;
    if (pct < 0.1)      timerEl.className = 'exam-timer-global danger';
    else if (pct < 0.25) timerEl.className = 'exam-timer-global warn';
    else                 timerEl.className = 'exam-timer-global';

    if (remaining <= 0 && !st.submitted) {
      clearInterval(st._timerInterval);
      toast('⏰ Time\'s up! Submitting exam…', 'error', 3000);
      finishExam(true);
    }
  }
  tick();
  st._timerInterval = setInterval(tick, 500);
}

function buildExamNavGrid() {
  const st  = _examState;
  const nav = document.getElementById('exam-nav-grid');
  nav.innerHTML = st.questions.map((q, i) => `
    <button class="exam-nav-btn" id="enav-${i}" onclick="EXAMPRAC.examGoTo(${i})" title="Q${i+1}">
      ${i + 1}
    </button>
  `).join('');
}

function updateExamNavBtn(idx) {
  const st  = _examState;
  const btn = document.getElementById(`enav-${idx}`);
  if (!btn) return;
  const q = st.questions[idx];
  btn.classList.remove('answered','flagged','current');
  if (idx === st.current)          btn.classList.add('current');
  if (st.answers[q.id])            btn.classList.add('answered');
  if (st.flagged.has(idx))         btn.classList.add('flagged');
}

function renderExamQuestion() {
  const st  = _examState;
  const q   = st.questions[st.current];
  const tot = st.questions.length;
  const idx = st.current;

  setText('exam-q-num',      `Q${idx + 1} of ${tot}`);
  setText('exam-category',   q.category);
  
  const questionEl = document.getElementById('exam-question');
  const diagramHtml = q.image ? `<div class="q-diagram-wrap"><img src="${q.image}" class="q-diagram-img" alt="Question Diagram"></div>` : '';
  questionEl.innerHTML = `<span style="display:block;white-space:pre-line;">${escHtml(q.question)}</span>${diagramHtml}`;

  const pct = (idx / tot) * 100;
  document.getElementById('exam-progress-fill').style.width = pct + '%';

  // Flag button state
  const flagBtn = document.getElementById('btn-exam-flag');
  flagBtn.classList.toggle('active', st.flagged.has(idx));
  flagBtn.textContent = st.flagged.has(idx) ? '🚩 Flagged' : '🏳 Flag';

  const choicesEl = document.getElementById('exam-choices');
  const letters   = ['A', 'B', 'C', 'D', 'E'];
  const selected  = st.answers[q.id];
  choicesEl.innerHTML = q.choices.map((ch, i) => `
    <button class="choice-btn ${selected === ch.id ? 'selected' : ''}"
            data-id="${ch.id}" onclick="EXAMPRAC.examSelect('${ch.id}')">
      <span class="choice-letter">${letters[i] || (i + 1)}</span>
      <span>${escHtml(ch.text)}</span>
    </button>
  `).join('');

  // Update nav
  for (let i = 0; i < tot; i++) updateExamNavBtn(i);
}

EXAMPRAC.examSelect = function(choiceId) {
  const st = _examState;
  if (!st || st.submitted) return;
  const q = st.questions[st.current];
  st.answers[q.id] = choiceId;
  playTap();
  document.querySelectorAll('#exam-choices .choice-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.id === choiceId);
  });
  updateExamNavBtn(st.current);
};

EXAMPRAC.toggleExamNavDrawer = function() {
  const drawer = document.getElementById('exam-nav-drawer');
  const badge  = document.getElementById('exam-drawer-badge');
  if (!drawer) return;
  const isHidden = drawer.style.display === 'none';
  if (isHidden) {
    drawer.style.display = 'block';
    if (badge) badge.textContent = '📋 Close ▴';
    if (_examState) {
      _examState.questions.forEach((_, i) => updateExamNavBtn(i));
    }
  } else {
    drawer.style.display = 'none';
    if (badge) badge.textContent = '📋 Questions ▾';
  }
};

EXAMPRAC.confirmExitExam = function() {
  const st = _examState;
  if (!st || st.submitted) {
    EXAMPRAC.goHome();
    return;
  }
  showModal({
    title:        'Exit Mock Examination?',
    body:         'Are you sure you want to exit the exam? The exam timer is active and unsubmitted answers will not be recorded.',
    confirmText:  'Exit Exam',
    confirmClass: 'btn-danger',
    cancelText:   'Keep Taking Exam',
    onConfirm:    () => {
      if (st._timerInterval) clearInterval(st._timerInterval);
      _examState = null;
      EXAMPRAC.goHome();
    }
  });
};

EXAMPRAC.examGoTo = function(idx) {
  const st = _examState;
  if (!st) return;
  const prev = st.current;
  st.current = idx;
  updateExamNavBtn(prev);
  renderExamQuestion();
  // Auto-close drawer on selection so question is 100% visible on mobile
  const drawer = document.getElementById('exam-nav-drawer');
  const badge  = document.getElementById('exam-drawer-badge');
  if (drawer) drawer.style.display = 'none';
  if (badge) badge.textContent = '📋 Questions ▾';
  window.scrollTo(0, 0);
};

EXAMPRAC.examPrev = function() {
  const st = _examState;
  if (!st || st.current <= 0) return;
  EXAMPRAC.examGoTo(st.current - 1);
};

EXAMPRAC.examNext = function() {
  const st = _examState;
  if (!st || st.current >= st.questions.length - 1) return;
  EXAMPRAC.examGoTo(st.current + 1);
};

EXAMPRAC.toggleFlag = function() {
  const st = _examState;
  if (!st) return;
  if (st.flagged.has(st.current)) st.flagged.delete(st.current);
  else st.flagged.add(st.current);
  renderExamQuestion();
};

EXAMPRAC.submitExam = function() {
  const st       = _examState;
  const answered = Object.keys(st.answers).length;
  const total    = st.questions.length;
  showModal({
    title:       'Submit Exam?',
    body:        `Answered: ${answered}/${total}. Unanswered: ${total - answered}. This cannot be undone.`,
    confirmText: 'Submit Exam',
    confirmClass:'btn-primary',
    onConfirm:   () => finishExam(false),
  });
};

function finishExam(timedOut = false) {
  const st = _examState;
  if (!st || st.submitted) return;
  st.submitted = true;
  clearInterval(st._timerInterval);

  let correct = 0, incorrect = 0, unanswered = 0;
  st.questions.forEach(q => {
    const sel = st.answers[q.id];
    if (!sel) {
      unanswered++;
    } else {
      const isCor = isCorrect(q, sel);
      if (isCor) correct++;
      else incorrect++;
      recordAnswer(q.id, q.category, isCor);
      incrementAppStat('totalAnswered', 1);
      if (isCor) incrementAppStat('totalCorrect', 1);
      else incrementAppStat('totalIncorrect', 1);
    }
  });

  const pct = Math.round((correct / st.questions.length) * 100);
  saveSession({ mode: 'exam', total: st.questions.length, correct, incorrect, unanswered, pct, timedOut });
  updateStreak();
  getAppStat('bestScore', 0).then(best => { if (pct > best) setAppStat('bestScore', pct); });

  // Build answers map for results screen
  const answersMap = {};
  st.questions.forEach(q => {
    const sel = st.answers[q.id];
    answersMap[q.id] = sel ? { selectedId: sel, correct: isCorrect(q, sel) } : null;
  });

  renderResults({ qs: st.questions, answers: answersMap, correct, incorrect, unanswered, pct, mode: 'exam' });
}

/* ──────────────────────────────────────────────────────────────
   MEMORY TRAINING
────────────────────────────────────────────────────────────── */
EXAMPRAC.startMemoryMode = function(subMode) {
  let questions;
  switch (subMode) {
    case 'rapid':
      questions = getAllQuestions();
      break;
    case 'repeat':
      questions = getAllQuestions();
      startPractice(questions, 'repeat');
      return;
    case 'flashcard':
      startFlashcardMode(getAllQuestions());
      return;
    case 'mistakes':
      getIncorrectQuestions().then(stats => {
        const ids = new Set(stats.map(s => s.qid));
        const qs  = getAllQuestions().filter(q => ids.has(q.id));
        if (!qs.length) { toast('No incorrect answers yet! Keep practicing.', '', 2500); return; }
        startPractice(qs, 'memory');
      });
      return;
    case 'spaced':
      getDueForReview().then(stats => {
        const ids = new Set(stats.map(s => s.qid));
        let   qs  = getAllQuestions().filter(q => ids.has(q.id));
        if (!qs.length) {
          toast('No reviews due today — starting full practice!', '', 2000);
          qs = getAllQuestions();
        }
        startPractice(qs, 'memory');
      });
      return;
    default:
      questions = getAllQuestions();
  }
  startPractice(questions, 'memory');
};

/* ── Flashcard / Quick Review Controller ── */
let _fcState = null;

function startFlashcardMode(qs) {
  _fcState = {
    questions: shuffle(qs),
    current: 0,
    revealed: false
  };
  showScreen('screen-flashcard');
  renderFlashcard();
}

function renderFlashcard() {
  const st = _fcState;
  if (!st || st.current >= st.questions.length) {
    renderHome();
    return;
  }
  const q = st.questions[st.current];
  const tot = st.questions.length;
  const idx = st.current;

  setText('fc-counter', `Card ${idx + 1} of ${tot}`);
  setText('fc-category', q.category);
  setText('fc-question', q.question);
  setText('fc-answer-text', getCorrectText(q));

  const expEl = document.getElementById('fc-explain-text');
  if (q.explanation) {
    expEl.style.display = '';
    expEl.textContent = q.explanation;
  } else {
    expEl.style.display = 'none';
  }

  // Hide answer initially
  st.revealed = false;
  document.getElementById('fc-answer-container').style.display = 'none';
  document.getElementById('fc-flip-btn').textContent = '💡 Reveal Answer';

  const pct = ((idx) / tot) * 100;
  document.getElementById('fc-progress-fill').style.width = pct + '%';
}

EXAMPRAC.toggleFlashcardReveal = function() {
  const st = _fcState;
  if (!st) return;
  st.revealed = !st.revealed;
  const container = document.getElementById('fc-answer-container');
  const btn = document.getElementById('fc-flip-btn');
  if (st.revealed) {
    container.style.display = 'block';
    btn.textContent = '🙈 Hide Answer';
    hapticFeedback('light');
  } else {
    container.style.display = 'none';
    btn.textContent = '💡 Reveal Answer';
  }
};

EXAMPRAC.fcNext = function() {
  const st = _fcState;
  if (!st) return;
  if (st.current < st.questions.length - 1) {
    st.current++;
    renderFlashcard();
  } else {
    toast('🎉 You finished all review cards!', 'success', 3000);
    renderHome();
  }
};

EXAMPRAC.fcPrev = function() {
  const st = _fcState;
  if (!st || st.current <= 0) return;
  st.current--;
  renderFlashcard();
};

/* ──────────────────────────────────────────────────────────────
   CATEGORY PRACTICE
────────────────────────────────────────────────────────────── */
async function renderCategories() {
  showScreen('screen-categories');
  const qstats = await getAllQuestionStats();
  const statsMap = {};
  qstats.forEach(s => { statsMap[s.qid] = s; });

  const cats = getCategories();
  const list = document.getElementById('category-list');
  list.innerHTML = cats.map((cat, ci) => {
    const qs = getQuestionsByCategory(cat.name);
    const catStats = qs.map(q => statsMap[q.id]).filter(Boolean);
    const answered  = catStats.filter(s => s.attempts > 0).length;
    const correct   = catStats.reduce((a, s) => a + s.correct, 0);
    const total     = catStats.reduce((a, s) => a + s.attempts, 0);
    const acc       = total > 0 ? Math.round((correct / total) * 100) : 0;
    return `
      <div class="category-card" onclick="EXAMPRAC.startCategory(${ci})">
        <div class="cat-icon" style="background:${cat.color}22; color:${cat.color}">${cat.icon}</div>
        <div class="cat-info">
          <div class="cat-name">${cat.name}</div>
          <div class="cat-meta">${answered}/${qs.length} answered</div>
          <div class="acc-bar"><div class="acc-bar-fill" style="width:${acc}%"></div></div>
        </div>
        <div class="cat-acc">${total > 0 ? acc + '%' : '—'}</div>
      </div>`;
  }).join('');
}

EXAMPRAC.startCategory = function(catIdx) {
  const cat = getCategories()[catIdx];
  const qs  = getQuestionsByCategory(cat.name);
  startPractice(qs, 'practice', cat.name);
};

/* ──────────────────────────────────────────────────────────────
   REVIEW INCORRECT ANSWERS
────────────────────────────────────────────────────────────── */
let _reviewFilter = 'all';

async function renderReview() {
  showScreen('screen-review');
  const allStats  = await getIncorrectQuestions();
  const allQs     = getAllQuestions();
  const statsMap  = {};
  allStats.forEach(s => { statsMap[s.qid] = s; });

  const cats = ['All', ...getCategories().map(c => c.name)];
  const filterBar = document.getElementById('review-filters');
  filterBar.innerHTML = cats.map(cat => `
    <button class="filter-chip ${_reviewFilter === cat.toLowerCase() || (_reviewFilter === 'all' && cat === 'All') ? 'active' : ''}"
            onclick="EXAMPRAC.setReviewFilter('${cat === 'All' ? 'all' : cat}')">
      ${cat === 'All' ? 'All' : cat.split(' ')[0]}
    </button>`).join('');

  const filtered = allQs.filter(q => {
    const s = statsMap[q.id];
    if (!s || !s.incorrect) return false;
    if (_reviewFilter === 'all') return true;
    return q.category === _reviewFilter;
  });

  const listEl = document.getElementById('review-list');
  if (!filtered.length) {
    listEl.innerHTML = `<div class="empty-state">
      <span class="empty-icon">🎉</span>
      <p>No incorrect answers${_reviewFilter !== 'all' ? ' in this category' : ''}!</p>
    </div>`;
    return;
  }

  listEl.innerHTML = filtered.map(q => {
    const s = statsMap[q.id];
    return `
      <div class="review-item">
        <div class="review-item-header">
          <span class="review-q-text">${q.number}. ${escHtml(q.question)}</span>
          <span class="review-status wrong">❌ ${s.incorrect}×</span>
        </div>
        <div class="review-answer-row">Correct: <strong style="color:var(--correct)">${escHtml(q.correctText || getCorrectText(q))}</strong></div>
        ${q.explanation ? `<div class="feedback-explanation" style="margin-top:0.4rem">${escHtml(q.explanation)}</div>` : ''}
        <button class="btn btn-outline btn-sm" style="margin-top:0.75rem"
                onclick="EXAMPRAC.practiceOneQuestion(${q.id})">Practice Again</button>
      </div>`;
  }).join('');
}

EXAMPRAC.setReviewFilter = function(cat) {
  _reviewFilter = cat;
  renderReview();
};

EXAMPRAC.practiceOneQuestion = function(qid) {
  const q = getAllQuestions().find(q => q.id === qid);
  if (q) startPractice([q], 'practice');
};

/* ──────────────────────────────────────────────────────────────
   PROGRESS SCREEN
────────────────────────────────────────────────────────────── */
async function renderProgress() {
  showScreen('screen-progress');
  const [answered, correct, incorrect, streak, best] = await Promise.all([
    getAppStat('totalAnswered',  0),
    getAppStat('totalCorrect',   0),
    getAppStat('totalIncorrect', 0),
    getAppStat('streak',         0),
    getAppStat('bestScore',      0),
  ]);

  const acc = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  setText('prog-answered',  answered);
  setText('prog-correct',   correct);
  setText('prog-incorrect', incorrect);
  setText('prog-accuracy',  acc + '%');
  setText('prog-streak',    streak + '🔥');
  setText('prog-best',      best + '%');

  // Category breakdown
  const qstats = await getAllQuestionStats();
  const cats = getCategories();
  const catEl = document.getElementById('prog-cats');
  catEl.innerHTML = cats.map(cat => {
    const cs = qstats.filter(s => s.category === cat.name);
    const tot = cs.reduce((a, s) => a + s.attempts, 0);
    const cor = cs.reduce((a, s) => a + s.correct, 0);
    const acc = tot > 0 ? Math.round((cor / tot) * 100) : 0;
    return `
      <div class="history-item">
        <div><span style="color:var(--gold)">${cat.icon}</span> ${cat.name}</div>
        <div>
          <span class="history-score">${tot > 0 ? acc + '%' : '—'}</span>
          <span style="color:var(--text-muted);font-size:0.78rem;margin-left:0.5rem">${tot} attempts</span>
        </div>
      </div>`;
  }).join('');

  // Recent sessions
  const sessions = (await getAllSessions()).slice(0, 10);
  const sessEl   = document.getElementById('prog-sessions');
  if (!sessions.length) {
    sessEl.innerHTML = '<div class="empty-state"><p>No sessions yet. Start practicing!</p></div>';
  } else {
    sessEl.innerHTML = sessions.map(s => `
      <div class="history-item">
        <div>
          <strong>${s.mode === 'exam' ? '📝 Mock Exam' : '🎯 Practice'}</strong>
          <span style="font-size:0.75rem;color:var(--text-muted);margin-left:0.5rem">
            ${new Date(s.createdAt).toLocaleDateString()}</span>
        </div>
        <span class="history-score">${s.pct}% (${s.correct}/${s.total})</span>
      </div>`).join('');
  }
}

/* ──────────────────────────────────────────────────────────────
   SETTINGS SCREEN
────────────────────────────────────────────────────────────── */
function renderSettings() {
  showScreen('screen-settings');

  // Populate controls
  document.getElementById('set-timer').value = Settings.getTimerSecs() || 0;
  document.getElementById('set-exam-mins').value = Settings.getExamMins();
  document.getElementById('set-exam-qs').value   = Settings.getExamQs();
  document.getElementById('set-sound').className = `toggle-switch ${Settings.getSound() ? 'on' : ''}`;
  document.getElementById('set-haptic').className = `toggle-switch ${Settings.getHaptic() ? 'on' : ''}`;
  document.getElementById('set-explain').className = `toggle-switch ${Settings.getShowExplain() ? 'on' : ''}`;

  const themeBtn = document.getElementById('btn-toggle-theme');
  themeBtn.textContent = Settings.getTheme() === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark';
}

EXAMPRAC.saveSettings = function() {
  Settings.setTimerSecs(parseInt(document.getElementById('set-timer').value, 10) || 0);
  Settings.setExamMins(parseInt(document.getElementById('set-exam-mins').value, 10) || 120);
  Settings.setExamQs(parseInt(document.getElementById('set-exam-qs').value, 10) || 100);
  toast('Settings saved!', 'success');
};

EXAMPRAC.toggleSound = function() {
  const v = !Settings.getSound(); Settings.setSound(v);
  document.getElementById('set-sound').className = `toggle-switch ${v ? 'on' : ''}`;
};
EXAMPRAC.toggleHaptic = function() {
  const v = !Settings.getHaptic(); Settings.setHaptic(v);
  document.getElementById('set-haptic').className = `toggle-switch ${v ? 'on' : ''}`;
};
EXAMPRAC.toggleExplain = function() {
  const v = !Settings.getShowExplain(); Settings.setShowExplain(v);
  document.getElementById('set-explain').className = `toggle-switch ${v ? 'on' : ''}`;
};

EXAMPRAC.toggleTheme = function() {
  const t = Settings.getTheme() === 'dark' ? 'light' : 'dark';
  Settings.setTheme(t);
  applyTheme();
  document.getElementById('btn-toggle-theme').textContent = t === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark';
};

EXAMPRAC.exportProgress = async function() {
  const data = await exportProgress();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `examprac_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Progress exported!', 'success');
};

EXAMPRAC.importProgress = function() {
  const input = document.createElement('input');
  input.type  = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importProgress(data);
      toast('Progress imported successfully!', 'success');
      renderHome();
    } catch (err) {
      toast('Import failed: ' + err.message, 'error', 4000);
    }
  };
  input.click();
};

EXAMPRAC.confirmReset = function() {
  showModal({
    title:       'Reset All Progress?',
    body:        'This will permanently delete your entire practice history, statistics, and streak. The question bank will NOT be deleted. This cannot be undone.',
    confirmText: 'Yes, Reset Everything',
    confirmClass:'btn-danger',
    onConfirm:   async () => {
      await resetAllProgress();
      toast('Progress reset.', '', 2500);
      renderHome();
    },
  });
};

/* ──────────────────────────────────────────────────────────────
   NAV WIRING (exposed globally for HTML onclick)
────────────────────────────────────────────────────────────── */
EXAMPRAC.goHome         = () => renderHome();
EXAMPRAC.goPractice     = () => startPractice(getAllQuestions(), 'practice');
EXAMPRAC.goExam         = () => {
  showModal({
    title:       'Start Mock Exam?',
    body:        `This will start a ${Settings.getExamQs()}-question timed exam (${Settings.getExamMins()} minutes). Ready?`,
    confirmText: 'Start Exam',
    confirmClass:'btn-primary',
    onConfirm:   startExam,
  });
};
EXAMPRAC.goMemory       = () => showScreen('screen-memory');
EXAMPRAC.goCategories   = () => renderCategories();
EXAMPRAC.goReview       = () => renderReview();
EXAMPRAC.goProgress     = () => renderProgress();
EXAMPRAC.goSettings     = () => renderSettings();
EXAMPRAC.goResults      = () => showScreen('screen-results');
EXAMPRAC.retryPractice  = () => startPractice(getAllQuestions(), 'practice');

/* ──────────────────────────────────────────────────────────────
   HTML HELPERS
────────────────────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ──────────────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────────── */
async function init() {
  applyTheme();
  initScreens();

  // Wire modal close
  document.getElementById('modal-cancel')?.addEventListener('click', hideModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') hideModal();
  });

  // Desktop keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal();
      return;
    }
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (_currentScreen === 'screen-practice') {
      const st = _practiceState;
      if (!st) return;
      const key = e.key.toUpperCase();
      const choiceMap = { 'A': 0, '1': 0, 'B': 1, '2': 1, 'C': 2, '3': 2, 'D': 3, '4': 3 };
      if (key in choiceMap && !st.submitted) {
        const q = st.questions[st.current];
        const idx = choiceMap[key];
        if (q && q.choices[idx]) {
          EXAMPRAC.selectChoice(q.choices[idx].id);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!st.submitted) EXAMPRAC.practiceNext();
        else EXAMPRAC.practiceContinue();
      }
    } else if (_currentScreen === 'screen-exam') {
      const st = _examState;
      if (!st || st.submitted) return;
      const key = e.key.toUpperCase();
      const choiceMap = { 'A': 0, '1': 0, 'B': 1, '2': 1, 'C': 2, '3': 2, 'D': 3, '4': 3 };
      if (key in choiceMap) {
        const q = st.questions[st.current];
        const idx = choiceMap[key];
        if (q && q.choices[idx]) {
          EXAMPRAC.examSelect(q.choices[idx].id);
        }
      } else if (e.key === 'ArrowRight') {
        EXAMPRAC.examNext();
      } else if (e.key === 'ArrowLeft') {
        EXAMPRAC.examPrev();
      } else if (key === 'F') {
        EXAMPRAC.toggleFlag();
      }
    } else if (_currentScreen === 'screen-flashcard') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        EXAMPRAC.toggleFlashcardReveal();
      } else if (e.key === 'ArrowRight') {
        EXAMPRAC.fcNext();
      } else if (e.key === 'ArrowLeft') {
        EXAMPRAC.fcPrev();
      }
    }
  });

  try {
    await openDB();
    await loadQuestionBank();
    await renderHome();
    // Mark offline-ready after initial load
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        localStorage.setItem('ep_cached', '1');
        updateOfflineBadge();
      });
    }
  } catch (err) {
    console.error('EXAMPRAC init error:', err);
    document.body.innerHTML = `
      <div style="padding:2rem;color:#ef4444;font-family:sans-serif">
        <h2>⚠ Failed to Load</h2>
        <p>${err.message}</p>
        <p>Ensure you are running from a local server (not file://) or XAMPP.</p>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);


/**
 * database.js — IndexedDB persistence layer for EXAMPRAC
 * Stores: progress, attempts, history, spaced-repetition schedules
 */

const DB_NAME    = 'examprac_db';
const DB_VERSION = 2;

let db = null;

export async function openDB() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      // Question stats (per-question performance)
      if (!d.objectStoreNames.contains('question_stats')) {
        const qs = d.createObjectStore('question_stats', { keyPath: 'qid' });
        qs.createIndex('category', 'category');
      }
      // Session history (completed practice/exam sessions)
      if (!d.objectStoreNames.contains('sessions')) {
        const ss = d.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
        ss.createIndex('createdAt', 'createdAt');
        ss.createIndex('mode', 'mode');
      }
      // App-level aggregate stats
      if (!d.objectStoreNames.contains('app_stats')) {
        d.createObjectStore('app_stats', { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror  = (e) => reject(e.target.error);
  });
}

function txStore(storeName, mode = 'readonly') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

/* ─── App-level aggregates ─────────────────────────────────── */
export async function getAppStat(key, defaultVal = 0) {
  await openDB();
  return new Promise((res) => {
    const req = txStore('app_stats').get(key);
    req.onsuccess = () => res(req.result ? req.result.value : defaultVal);
    req.onerror   = () => res(defaultVal);
  });
}
export async function setAppStat(key, value) {
  await openDB();
  return new Promise((res, rej) => {
    const req = txStore('app_stats', 'readwrite').put({ key, value });
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}
export async function incrementAppStat(key, by = 1) {
  const cur = await getAppStat(key, 0);
  await setAppStat(key, cur + by);
  return cur + by;
}

/* ─── Question stats ─────────────────────────────────────── */
export async function getQuestionStat(qid) {
  await openDB();
  return new Promise((res) => {
    const req = txStore('question_stats').get(qid);
    req.onsuccess = () => res(req.result || defaultQStat(qid));
  });
}
function defaultQStat(qid) {
  return {
    qid,
    attempts: 0,
    correct:  0,
    incorrect: 0,
    lastAttempt: null,
    consecutiveCorrect: 0,
    nextReview: null,
    intervalDays: 1,
    mastery: 'new',  // new | learning | review | mastered
    category: '',
  };
}

export async function recordAnswer(qid, category, isCorrect) {
  await openDB();
  const stat = await getQuestionStat(qid);
  stat.qid      = qid;
  stat.category = category;
  stat.attempts++;
  stat.lastAttempt = new Date().toISOString();

  if (isCorrect) {
    stat.correct++;
    stat.consecutiveCorrect++;
    // Spaced repetition schedule (simple SM-2-inspired)
    if (stat.consecutiveCorrect >= 3)      { stat.intervalDays = Math.min(stat.intervalDays * 2, 30); }
    else if (stat.consecutiveCorrect === 2) { stat.intervalDays = Math.max(stat.intervalDays, 3); }
    else                                    { stat.intervalDays = Math.max(stat.intervalDays, 1); }
  } else {
    stat.incorrect++;
    stat.consecutiveCorrect = 0;
    stat.intervalDays = 1;
  }

  // Next review date
  const next = new Date();
  next.setDate(next.getDate() + stat.intervalDays);
  stat.nextReview = next.toISOString();

  // Mastery level
  if (stat.consecutiveCorrect >= 5)      stat.mastery = 'mastered';
  else if (stat.consecutiveCorrect >= 2)  stat.mastery = 'review';
  else if (stat.attempts > 0)             stat.mastery = 'learning';
  else                                    stat.mastery = 'new';

  return new Promise((res, rej) => {
    const req = txStore('question_stats', 'readwrite').put(stat);
    req.onsuccess = () => res(stat);
    req.onerror   = () => rej(req.error);
  });
}

export async function getAllQuestionStats() {
  await openDB();
  return new Promise((res) => {
    const req = txStore('question_stats').getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => res([]);
  });
}

export async function getIncorrectQuestions() {
  const all = await getAllQuestionStats();
  return all.filter(s => s.incorrect > 0);
}

export async function getDueForReview() {
  const all  = await getAllQuestionStats();
  const now  = new Date();
  return all.filter(s => s.nextReview && new Date(s.nextReview) <= now);
}

/* ─── Sessions ─────────────────────────────────────────────── */
export async function saveSession(session) {
  await openDB();
  return new Promise((res, rej) => {
    const s = { ...session, createdAt: new Date().toISOString() };
    const req = txStore('sessions', 'readwrite').add(s);
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}
export async function getAllSessions() {
  await openDB();
  return new Promise((res) => {
    const req = txStore('sessions').getAll();
    req.onsuccess = () => res((req.result || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    req.onerror   = () => res([]);
  });
}
export async function getSessionsByMode(mode) {
  const all = await getAllSessions();
  return all.filter(s => s.mode === mode);
}

/* ─── Progress export / import ─────────────────────────────── */
export async function exportProgress() {
  await openDB();
  const [qstats, sessions] = await Promise.all([getAllQuestionStats(), getAllSessions()]);
  const appKeys = ['totalAnswered','totalCorrect','totalIncorrect','streak','lastPracticeDate'];
  const stats = {};
  for (const k of appKeys) stats[k] = await getAppStat(k, 0);
  return {
    version:  2,
    exportedAt: new Date().toISOString(),
    appStats: stats,
    questionStats: qstats,
    sessions,
  };
}

export async function importProgress(data) {
  // Validate structure
  if (!data || data.version !== 2 || !Array.isArray(data.questionStats)) {
    throw new Error('Invalid or incompatible backup file.');
  }
  await openDB();
  // Write app stats
  if (data.appStats) {
    for (const [k, v] of Object.entries(data.appStats)) {
      await setAppStat(k, v);
    }
  }
  // Write question stats
  const store = txStore('question_stats', 'readwrite');
  for (const qs of data.questionStats) {
    await new Promise((res, rej) => {
      const r = store.put(qs); r.onsuccess = res; r.onerror = rej;
    });
  }
  // Write sessions
  if (Array.isArray(data.sessions)) {
    const ss = txStore('sessions', 'readwrite');
    for (const s of data.sessions) {
      await new Promise((res, rej) => {
        const r = ss.put(s); r.onsuccess = res; r.onerror = rej;
      });
    }
  }
}

export async function resetAllProgress() {
  await openDB();
  const stores = ['question_stats', 'sessions', 'app_stats'];
  for (const s of stores) {
    await new Promise((res, rej) => {
      const req = txStore(s, 'readwrite').clear();
      req.onsuccess = res; req.onerror = rej;
    });
  }
}

/* ─── Streak logic ─────────────────────────────────────────── */
export async function updateStreak() {
  const today     = new Date().toISOString().slice(0, 10);
  const lastDate  = await getAppStat('lastPracticeDate', '');
  let   streak    = await getAppStat('streak', 0);

  if (lastDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (lastDate === yStr) {
    streak++;
  } else if (lastDate !== today) {
    streak = 1;
  }
  await setAppStat('streak', streak);
  await setAppStat('lastPracticeDate', today);
  return streak;
}


/**
 * settings.js — Read/write user preferences from localStorage
 */

const KEYS = {
  TIMER_SECS:    'ep_timer_secs',
  THEME:         'ep_theme',
  SOUND:         'ep_sound',
  HAPTIC:        'ep_haptic',
  EXAM_MINS:     'ep_exam_mins',
  EXAM_QS:       'ep_exam_qs',
  SHOW_EXPLAIN:  'ep_show_explain',
};

const DEFAULTS = {
  [KEYS.TIMER_SECS]:   30,
  [KEYS.THEME]:        'dark',
  [KEYS.SOUND]:        false,
  [KEYS.HAPTIC]:       true,
  [KEYS.EXAM_MINS]:    120,
  [KEYS.EXAM_QS]:      100,
  [KEYS.SHOW_EXPLAIN]: true,
};

function get(key) {
  const v = localStorage.getItem(key);
  if (v === null) return DEFAULTS[key];
  try { return JSON.parse(v); } catch { return v; }
}
function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const Settings = {
  getTimerSecs:   () => get(KEYS.TIMER_SECS),
  setTimerSecs:   (v) => set(KEYS.TIMER_SECS, v),
  getTheme:       () => get(KEYS.THEME),
  setTheme:       (v) => set(KEYS.THEME, v),
  getSound:       () => get(KEYS.SOUND),
  setSound:       (v) => set(KEYS.SOUND, v),
  getHaptic:      () => get(KEYS.HAPTIC),
  setHaptic:      (v) => set(KEYS.HAPTIC, v),
  getExamMins:    () => get(KEYS.EXAM_MINS),
  setExamMins:    (v) => set(KEYS.EXAM_MINS, v),
  getExamQs:      () => get(KEYS.EXAM_QS),
  setExamQs:      (v) => set(KEYS.EXAM_QS, v),
  getShowExplain: () => get(KEYS.SHOW_EXPLAIN),
  setShowExplain: (v) => set(KEYS.SHOW_EXPLAIN, v),
};

export function applyTheme() {
  document.documentElement.setAttribute('data-theme', Settings.getTheme());
}

export function hapticFeedback(type = 'light') {
  if (!Settings.getHaptic()) return;
  if (!navigator.vibrate) return;
  const patterns = { light: [10], medium: [20], heavy: [30, 15, 30] };
  navigator.vibrate(patterns[type] || [10]);
}


/**
 * timer.js — Timestamp-based countdown timer
 * Uses Date.now() to resist tab-hide / screen-lock drift
 */

export class QuestionTimer {
  constructor({ seconds, onTick, onExpire, warnAt = 10, dangerAt = 5 }) {
    this.totalSeconds = seconds;
    this.remaining    = seconds;
    this.onTick       = onTick;
    this.onExpire     = onExpire;
    this.warnAt       = warnAt;
    this.dangerAt     = dangerAt;
    this._interval    = null;
    this._startTs     = null;
    this._pauseRemain = null;
    this._expired     = false;
    this._paused      = false;
  }

  start() {
    this._expired = false;
    this._paused  = false;
    this._startTs = Date.now();
    this._tick();
    this._interval = setInterval(() => this._tick(), 250);
  }

  _tick() {
    if (this._paused || this._expired) return;
    const elapsed   = Math.floor((Date.now() - this._startTs) / 1000);
    this.remaining  = Math.max(0, this.totalSeconds - elapsed);
    this.onTick(this.remaining, this._stateClass());
    if (this.remaining <= 0 && !this._expired) {
      this._expired = true;
      this.stop();
      this.onExpire();
    }
  }

  _stateClass() {
    if (this.remaining <= this.dangerAt) return 'danger';
    if (this.remaining <= this.warnAt)   return 'warn';
    return '';
  }

  pause() {
    if (this._paused) return;
    this._paused      = true;
    this._pauseRemain = this.remaining;
    this.stop();
  }

  resume() {
    if (!this._paused) return;
    this._paused      = false;
    this.totalSeconds = this._pauseRemain;
    this.remaining    = this._pauseRemain;
    this._startTs     = Date.now();
    this._tick();
    this._interval = setInterval(() => this._tick(), 250);
  }

  stop() {
    clearInterval(this._interval);
    this._interval = null;
  }

  reset(seconds) {
    this.stop();
    this.totalSeconds = seconds;
    this.remaining    = seconds;
    this._expired     = false;
    this._paused      = false;
  }

  isExpired() { return this._expired; }
}

/** Format seconds as MM:SS */
export function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}


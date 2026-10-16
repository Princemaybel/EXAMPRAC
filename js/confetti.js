/**
 * confetti.js — Lightweight 60fps canvas confetti animation
 * Completely offline, zero dependencies.
 */

export function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const pieces = [];
  const count = 90;
  const colors = ['#c9a84c', '#e8c97a', '#22c55e', '#3b82f6', '#f59e0b', '#ffffff'];

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 120,
      y: canvas.height * 0.4 + (Math.random() - 0.5) * 80,
      w: Math.random() * 9 + 5,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 6,
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 14,
      gravity: 0.38,
      alpha: 1,
    });
  }

  let start = performance.now();
  function loop(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rot += p.vRot;
      if (now - start > 1200) {
        p.alpha -= 0.02;
      }

      if (p.alpha > 0) {
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    if (alive > 0) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }

  requestAnimationFrame(loop);
}


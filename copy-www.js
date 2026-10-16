import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const wwwDir = path.join(rootDir, 'www');

// Clean and recreate www
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const itemsToCopy = [
  'index.html',
  'manifest.webmanifest',
  'service-worker.js',
  'assets',
  'css',
  'js',
  'data',
  'vercel.json',
  'EXAMPRAC.apk'
];

for (const item of itemsToCopy) {
  const src = path.join(rootDir, item);
  const dest = path.join(wwwDir, item);
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log(`Copied ${item} -> www/`);
  }
}

console.log('www directory successfully prepared for Capacitor.');


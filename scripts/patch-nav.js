/**
 * patch-nav.js
 * 
 * Patches @react-navigation/bottom-tabs BottomTabBar.js to move
 * `pointerEvents` from a View prop into the style object, silencing
 * the react-native-web 0.21+ deprecation warning:
 *   "props.pointerEvents is deprecated. Use style.pointerEvents"
 * 
 * Run automatically via "postinstall" in package.json.
 * Safe to re-run — checks before patching.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(
  __dirname,
  '../node_modules/@react-navigation/bottom-tabs/lib/module/views/BottomTabBar.js'
);

if (!fs.existsSync(FILE)) {
  console.log('[patch-nav] BottomTabBar.js not found — skipping.');
  process.exit(0);
}

let src = fs.readFileSync(FILE, 'utf8');

let changed = 0;

// Fix 1: outer View — pointerEvents prop -> style
const OLD1 = `    pointerEvents: isTabBarHidden ? 'none' : 'auto',\n    onLayout:`;
const NEW1 = `    style: [{ pointerEvents: isTabBarHidden ? 'none' : 'auto' }],\n    onLayout:`;
if (src.includes(OLD1)) {
  src = src.replace(OLD1, NEW1);
  changed++;
  console.log('[patch-nav] Fix 1 applied: outer View pointerEvents -> style');
}

// Fix 2: background View — pointerEvents prop -> style
const OLD2 = `      pointerEvents: "none",\n      style: StyleSheet.absoluteFill,`;
const NEW2 = `      style: [StyleSheet.absoluteFill, { pointerEvents: "none" }],`;
if (src.includes(OLD2)) {
  src = src.replace(OLD2, NEW2);
  changed++;
  console.log('[patch-nav] Fix 2 applied: background View pointerEvents -> style');
}

if (changed > 0) {
  fs.writeFileSync(FILE, src, 'utf8');
  console.log(`[patch-nav] Wrote ${changed} fix(es) to BottomTabBar.js`);
} else {
  console.log('[patch-nav] Already patched or pattern changed — no action needed.');
}

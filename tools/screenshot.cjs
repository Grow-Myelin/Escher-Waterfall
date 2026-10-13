// Headless screenshots for checking pages (uses the pre-installed Chromium).
//
//   node tools/screenshot.cjs <page.html> <out.png|jpg> [options]
//     --w 900 --h 1100     viewport size (CSS px)
//     --scale 1            device pixel ratio
//     --wait 1500          ms to wait after load (and after --eval)
//     --eval "js"          run in the page before the shot (repeatable: shots N.png)
//     --frame              crop to the #frame element (the print)
//     --thumb              shorthand for a gallery thumbnail: 700x900, --frame, jpeg
//
// Prints console errors and page errors; exits 1 if any occurred.

let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const path = require('path');

(async () => {
  const argv = process.argv.slice(2);
  const page = argv[0], out = argv[1];
  if (!page || !out) { console.error('usage: node tools/screenshot.cjs <page.html> <out> [options]'); process.exit(2); }
  const opt = { w: 900, h: 1100, scale: 1, wait: 1500, evals: [], frame: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--frame') opt.frame = true;
    else if (a === '--thumb') { opt.thumb = true; opt.frame = true; opt.w = 700; opt.h = 900; }
    else if (a === '--eval') opt.evals.push(argv[++i]);
    else if (a.startsWith('--')) opt[a.slice(2)] = +argv[++i];
  }
  const browser = await playwright.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await browser.newPage({ viewport: { width: opt.w, height: opt.h }, deviceScaleFactor: opt.scale });
  const problems = [];
  p.on('console', (m) => { if (m.type() === 'error') problems.push(`[console.error] ${m.text()}`); });
  p.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  await p.goto('file://' + path.resolve(page));
  await p.waitForTimeout(opt.wait);
  const shoot = async (file) => {
    const type = /\.jpe?g$/i.test(file) ? 'jpeg' : 'png';
    const o = { path: file, type, ...(type === 'jpeg' ? { quality: 82 } : {}) };
    if (opt.frame && (await p.$('#frame'))) await p.locator('#frame').screenshot(o);
    else await p.screenshot(o);
  };
  if (!opt.evals.length) await shoot(out);
  else {
    const ext = path.extname(out), base = out.slice(0, -ext.length);
    for (let i = 0; i < opt.evals.length; i++) {
      await p.evaluate(opt.evals[i]);
      await p.waitForTimeout(opt.wait);
      await shoot(opt.evals.length === 1 ? out : `${base}${i}${ext}`);
    }
  }
  await browser.close();
  if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
})();

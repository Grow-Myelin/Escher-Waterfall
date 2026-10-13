// Builds every page into a classic (non-module) script, so each one opens
// straight from the file system, offline.
//
//   node build.mjs              build everything
//   node build.mjs <name>       build one target: waterfall, vendor, or an illusion slug
//   node build.mjs <name> --watch
//
// The Waterfall bundles its own copy of three.js (dist/waterfall.js) and is
// left exactly as it was. The illustrations in illusions/<slug>/ share a
// single copy, vendor/three.min.js, which defines window.THREE; inside their
// sources `import ... from 'three'` (and three/examples addons) resolves to it.

import * as esbuild from 'esbuild';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const only = args.find((a) => !a.startsWith('--'));

const threeGlobal = {
  name: 'three-global',
  setup(build) {
    build.onResolve({ filter: /^three$/ }, () => ({ path: 'three', namespace: 'three-global' }));
    build.onLoad({ filter: /.*/, namespace: 'three-global' }, () => ({
      contents: 'module.exports = window.THREE;',
      loader: 'js',
    }));
  },
};

const common = { bundle: true, format: 'iife', target: 'es2020', logLevel: 'info' };

const targets = {
  waterfall: { ...common, entryPoints: ['src/main.js'], outfile: 'dist/waterfall.js', minify: true },
  vendor: { ...common, entryPoints: ['vendor/three-entry.js'], outfile: 'vendor/three.min.js', globalName: 'THREE', minify: true },
};

for (const slug of readdirSync('illusions')) {
  const dir = join('illusions', slug);
  const entry = join(dir, 'src', 'main.js');
  if (slug.startsWith('_') || !statSync(dir).isDirectory() || !existsSync(entry)) continue;
  targets[slug] = { ...common, entryPoints: [entry], outfile: join(dir, 'bundle.js'), minify: true, plugins: [threeGlobal] };
}

if (only && !targets[only] && existsSync(join('illusions', only, 'src', 'main.js'))) {
  targets[only] = { ...common, entryPoints: [join('illusions', only, 'src', 'main.js')], outfile: join('illusions', only, 'bundle.js'), minify: true, plugins: [threeGlobal] };
}
const names = only ? [only] : Object.keys(targets);
for (const name of names) {
  const opts = targets[name];
  if (!opts) {
    console.error(`Unknown target "${name}". Known: ${Object.keys(targets).join(', ')}`);
    process.exit(1);
  }
  if (watch) await (await esbuild.context(opts)).watch();
  else await esbuild.build(opts);
}

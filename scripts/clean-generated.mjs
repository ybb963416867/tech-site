import { rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const targets = [join(root, '.astro')];

if (process.argv.includes('--dist')) {
  targets.push(join(root, 'dist'));
}

for (const target of targets) {
  await rm(target, { recursive: true, force: true });
}

console.log(`Cleaned ${targets.map((target) => target.replace(`${root}/`, '')).join(', ')}`);

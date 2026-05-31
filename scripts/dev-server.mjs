import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const blogDir = join(root, 'src/content/blog');
const astroBin = join(root, 'node_modules/.bin/astro');
const cleanScript = join(root, 'scripts/clean-generated.mjs');
const normalizeScript = join(root, 'scripts/normalize-posts.mjs');
const astroDevArgs = process.argv.slice(2);

let server = null;
let restartTimer = null;
let pollTimer = null;
let lastContentSnapshot = '';
let isRestarting = false;
let pendingRestartReason = '';
let shuttingDown = false;

function runNodeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: root,
      env: process.env,
      stdio: 'inherit'
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${scriptPath} exited with code ${code}`));
    });
  });
}

async function prepareContent() {
  await runNodeScript(cleanScript);
  await runNodeScript(normalizeScript);
}

async function createContentSnapshot() {
  const items = [];

  async function walk(dirPath, relativePath = '') {
    let entries;

    try {
      entries = await readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (!shouldRestart(entry.name)) continue;

      const childRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const childPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        items.push(`d:${childRelativePath}`);
        await walk(childPath, childRelativePath);
        continue;
      }

      if (!entry.isFile()) continue;

      try {
        const stats = await stat(childPath);
        items.push(`f:${childRelativePath}:${stats.size}:${stats.mtimeMs}`);
      } catch {}
    }
  }

  await walk(blogDir);
  return items.join('\n');
}

async function refreshContentSnapshot() {
  lastContentSnapshot = await createContentSnapshot();
}

function startServer() {
  server = spawn(astroBin, ['dev', ...astroDevArgs], {
    cwd: root,
    env: {
      ...process.env,
      ASTRO_TELEMETRY_DISABLED: '1'
    },
    stdio: 'inherit'
  });

  server.on('exit', (code, signal) => {
    if (!shuttingDown && !isRestarting) {
      console.log(`[dev] Astro dev server exited (${signal || code}).`);
      process.exit(typeof code === 'number' ? code : 1);
    }
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (!server || server.exitCode !== null) {
      server = null;
      resolve();
      return;
    }

    const current = server;
    const killTimer = setTimeout(() => {
      current.kill('SIGKILL');
    }, 3000);

    current.once('exit', () => {
      clearTimeout(killTimer);
      if (server === current) server = null;
      resolve();
    });

    current.kill('SIGTERM');
  });
}

async function restart(reason) {
  if (isRestarting) {
    pendingRestartReason = reason;
    return;
  }

  isRestarting = true;
  pendingRestartReason = '';

  try {
    console.log(`[dev] Content changed (${reason}). Restarting Astro...`);
    await stopServer();
    await prepareContent();
    await refreshContentSnapshot();
    if (!shuttingDown) startServer();
  } catch (error) {
    console.error('[dev] Restart failed.');
    console.error(error);
  } finally {
    isRestarting = false;
    if (!shuttingDown && pendingRestartReason) {
      const nextReason = pendingRestartReason;
      pendingRestartReason = '';
      scheduleRestart(nextReason);
    }
  }
}

function shouldRestart(filename = '') {
  if (!filename) return true;
  if (filename.includes('.DS_Store')) return false;
  if (filename.includes('~')) return false;
  return true;
}

function scheduleRestart(reason) {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restart(reason);
  }, 350);
}

async function pollContentChanges() {
  if (shuttingDown || isRestarting) return;

  try {
    const nextSnapshot = await createContentSnapshot();

    if (lastContentSnapshot && nextSnapshot !== lastContentSnapshot) {
      lastContentSnapshot = nextSnapshot;
      scheduleRestart('content tree changed');
      return;
    }

    lastContentSnapshot = nextSnapshot;
  } catch (error) {
    console.error('[dev] Failed to scan blog content.');
    console.error(error);
  }
}

async function shutdown() {
  shuttingDown = true;
  clearTimeout(restartTimer);
  clearInterval(pollTimer);
  await stopServer();
  process.exit(0);
}

await prepareContent();
await refreshContentSnapshot();
startServer();
pollTimer = setInterval(pollContentChanges, 1000);

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, resolve, delimiter } from 'node:path';

export function samePath(left, right) {
  const canonical = path => {
    const value = realpathSync.native(path);
    return process.platform === 'win32' ? value.toLowerCase() : value;
  };
  return canonical(left) === canonical(right);
}

export function npmCli() {
  const candidates = [process.env.npm_execpath,
    resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')];
  for (const entry of (process.env.PATH ?? '').split(delimiter)) {
    candidates.push(resolve(entry, 'node_modules/npm/bin/npm-cli.js'),
      resolve(entry, '../lib/node_modules/npm/bin/npm-cli.js'));
  }
  const found = candidates.find(p => p && /npm-cli\.js$/u.test(p) && existsSync(p));
  if (!found) throw Error(`Cannot resolve npm JavaScript CLI. Checked: ${candidates.filter(Boolean).join(', ')}`);
  return found;
}
export function binPath(name, cwd = process.cwd()) {
  const root = resolve(cwd, 'node_modules', name);
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[name === 'typescript' ? 'tsc' : name.split('/').at(-1)];
  if (!bin || !existsSync(resolve(root, bin))) throw Error(`No declared JavaScript bin for ${name}`);
  return resolve(root, bin);
}
export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding:'utf8', windowsHide:true,
    shell:false, maxBuffer:32 * 1024 * 1024, timeout:600000, ...options });
  if (result.error || result.status !== 0) throw Error(
    `Command failed: ${JSON.stringify([command, ...args])}\n` +
    `cwd: ${options.cwd ?? process.cwd()}\nexit: ${result.status}; signal: ${result.signal}\n` +
    `${result.stdout ?? ''}${result.stderr ?? ''}${result.error?.message ?? ''}`);
  return result.stdout;
}
export function runBin(name, args, options = {}) {
  return run(process.execPath, name ? [binPath(name, options.cwd), ...args] : args, options);
}
export function startBin(name, args, options = {}) {
  return spawn(process.execPath, [binPath(name, options.cwd), ...args],
    {windowsHide:true, shell:false, stdio:'inherit', ...options});
}
// Windows reports EPERM/EACCES/EBUSY on a rename while a just-exited tool or a
// file scanner still holds a handle inside the moved tree (L120). Retry for a
// bounded time, then fail with the original error.
export async function renameWithRetry(from, to, { rename, timeout = 15000 } = {}) {
  const move = rename ?? (await import('node:fs/promises')).rename;
  const deadline = Date.now() + timeout;
  for (let delay = 100; ; delay = Math.min(delay * 2, 2000)) {
    try { return await move(from, to); }
    catch (error) {
      if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || Date.now() + delay > deadline) throw error;
      await new Promise((done) => setTimeout(done, delay));
    }
  }
}

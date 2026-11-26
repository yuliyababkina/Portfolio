import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, resolve, delimiter } from 'node:path';

function samePath(left, right) {
  const canonical = path => {
    const value = realpathSync.native(path);
    return process.platform === 'win32' ? value.toLowerCase() : value;
  };
  return canonical(left) === canonical(right);
}

function npmCli() {
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
function binPath(name, cwd = process.cwd()) {
  const root = resolve(cwd, 'node_modules', name);
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[name === 'typescript' ? 'tsc' : name.split('/').at(-1)];
  if (!bin || !existsSync(resolve(root, bin))) throw Error(`No declared JavaScript bin for ${name}`);
  return resolve(root, bin);
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding:'utf8', windowsHide:true,
    shell:false, maxBuffer:32 * 1024 * 1024, timeout:600000, ...options });
  if (result.error || result.status !== 0) throw Error(
    `Command failed: ${JSON.stringify([command, ...args])}\n` +
    `cwd: ${options.cwd ?? process.cwd()}\nexit: ${result.status}; signal: ${result.signal}\n` +
    `${result.stdout ?? ''}${result.stderr ?? ''}${result.error?.message ?? ''}`);
  return result.stdout;
}
function runBin(name, args, options = {}) {
  return run(process.execPath, name ? [binPath(name, options.cwd), ...args] : args, options);
}
function startBin(name, args, options = {}) {
  return spawn(process.execPath, [binPath(name, options.cwd), ...args],
    {windowsHide:true, shell:false, stdio:'inherit', ...options});
}
// Windows reports EPERM/EACCES/EBUSY on a rename while a just-exited tool or a
// file scanner still holds a handle inside the moved tree (L120). Retry for a
// bounded time, then fail with the original error.
async function renameWithRetry(from, to, { rename, timeout = 15000 } = {}) {
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

import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';

const expectedPack={"id":"vite-shadcn","framework":"vite","library":"shadcn"};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
// External tools (including Vite) also need one canonical working-directory
// spelling; otherwise their own file-resolution checks can reject an alias.
const target=realpathSync.native(dirname(fileURLToPath(import.meta.url)));
const children=[], written=[];
let staging, project, step='preflight', log='', stopping=false;
const started=Date.now();
const safePath=p=>typeof p==='string'&&p.length>0&&!/[\\\x00-\x1f:<>"]|[|?*]/u.test(p)&&p.split('/').every(s=>s&&s!=='.'&&s!=='..');
async function stop(code=0) {
  if(stopping)return;stopping=true;
  for(const child of children)if(child.exitCode===null)child.kill();
  await Promise.all(children.map(child=>child.exitCode!==null?Promise.resolve():new Promise(done=>{child.once('exit',done);setTimeout(done,3000).unref();})));
  process.exit(code);
}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
process.on('message',message=>{if(message?.type==='stop')stop();});
function command(bin,args,cwd=project,env=process.env) {
  const t=Date.now();
  console.log(`Running ${JSON.stringify([bin,...args])}`);
  const output=run(bin,args,{cwd,env});log+=`\n${JSON.stringify([bin,...args])}\n${output}`;
  const timing=`Completed ${JSON.stringify([bin,...args])} in ${Date.now()-t} ms`;
  console.log(timing);log+='\n'+timing+'\n';
  return output;
}
async function tree(dir,prefix='') {
  const result=[];
  for(const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const p=prefix+entry.name;
    const st=await fs.lstat(resolve(dir,entry.name));
    if(st.isSymbolicLink())throw Error(`Symlink is not permitted in pack/staging: ${p}`);
    if(entry.isDirectory())result.push(...await tree(resolve(dir,entry.name),p+'/'));
    else if(entry.isFile())result.push(p);
    else throw Error(`Unexpected filesystem entry: ${p}`);
  }
  return result.sort();
}
async function writablePort(port) {
  await new Promise((done,reject)=>{
    const server=createServer();server.once('error',error=>reject(Error(`Port ${port} unavailable: ${error.message}`)));
    server.listen(port,'127.0.0.1',()=>server.close(done));
  });
}
async function waitHttp(url,child) {
  const deadline=Date.now()+90000;
  while(Date.now()<deadline) {
    if(child.exitCode!==null||child.spawnError)throw Error(`Owned server failed for ${url}: ${child.spawnError??child.exitCode}`);
    try {const r=await fetch(url,{signal:AbortSignal.timeout(1500)});if(r.ok){const body=await r.text();if(body.length)return;}}catch{}
    await new Promise(done=>setTimeout(done,300));
  }
  throw Error(`Owned server did not respond within 90 seconds: ${url}`);
}
try {
  if(!samePath(process.cwd(),target))throw Error('Run node init.mjs from the folder containing the complete pack.');
  if(Number(process.versions.node.split('.')[0])<24)throw Error('Node 24.22+ (with npm 11) is required. Install the current Node 24 LTS, then run initialization again.');
  const npm=npmCli();
  // npm 10 installs dependencies of platform-skipped optional packages (L118).
  if(Number(command(process.execPath,[npm,'--version'],target).trim().split('.')[0])<11)throw Error('npm 11 or newer is required (it ships with Node 24.22+). Install the current Node 24 LTS, then run initialization again.');
  command('git',['--version'],target);
  for(const key of ['user.name','user.email']) {
    let identity='';try{identity=command('git',['config','--get',key],target).trim();}catch{}
    if(!identity)throw Error(`Missing Git identity: configure your own ${key} with git config --global ${key} "YOUR ${key}"; then run initialization again. No identity was invented.`);
  }
  const pack=JSON.parse(await fs.readFile(resolve(target,'pack.json'),'utf8'));
  if(pack?.schemaVersion!==1||Object.entries(expectedPack).some(([key,value])=>pack[key]!==value)||
    [pack.files,pack.scaffold].some(value=>!value||typeof value!=='object'||Array.isArray(value)))throw Error('Invalid or unsupported pack manifest.');
  const expected=new Set([...Object.keys(pack.files),'pack.json']);

  for(const name of await fs.readdir(target)) {
    if(expected.has(name)||name==='payload')continue;
    if(name==='.git'||/^README[^/]*$/iu.test(name)||/^LICENSE[^/]*$/iu.test(name)||['.gitignore','.gitattributes','.editorconfig'].includes(name)) {
      const stat=await fs.lstat(resolve(target,name));
      if(stat.isSymbolicLink() || (name!=='.git'&&!stat.isFile()))throw Error(`Unsafe allowed target entry: ${name}`);
      continue;
    }
    throw Error(`Unexpected target entry: ${name}. Allowed: pack inputs, .git, README*, LICENSE*, .gitignore, .gitattributes, .editorconfig.`);
  }
  for(const [p,digest]of Object.entries(pack.files)) {
    if(!safePath(p)||!/^[a-f0-9]{64}$/u.test(digest))throw Error(`Unsafe manifest entry ${p}`);
    const parts=p.split('/');let current=target;
    for(const part of parts){current=resolve(current,part);if((await fs.lstat(current)).isSymbolicLink())throw Error(`Pack symlink: ${p}`);}
    if(hash(await fs.readFile(resolve(target,p)))!==digest)throw Error(`Pack integrity failed: ${p}`);
  }
  for(const p of await tree(resolve(target,'payload')))if(!expected.has('payload/'+p))throw Error(`Unlisted payload file: ${p}`);
  const {artifactHash,...identity}=pack;
  const manifestHash=hash(Buffer.from(JSON.stringify(identity,null,2)+'\n'));
  if(manifestHash!==pack.artifactHash)throw Error('Artifact inventory hash mismatch.');
  Object.assign(process.env,{});
  await writablePort(5173);await writablePort(6006);
  let hasGit=existsSync(resolve(target,'.git'));
  if(hasGit) {
    if(command('git',['rev-parse','--show-cdup'],target).trim()!=='')throw Error('Target must be the Git repository root.');
    const staged=command('git',['diff','--cached','--name-only','-z'],target).split('\0').filter(Boolean);
    if(staged.length)throw Error(`Target has staged changes; commit or unstage them before init: ${staged.join(', ')}`);
    // Never include unrelated tracked modifications in the setup commit.
    const dirty=command('git',['diff','--name-only','-z'],target).split('\0').filter(Boolean);
    if(dirty.length)throw Error(`Target has modified tracked files: ${dirty.join(', ')}`);
  }
  staging=await fs.mkdtemp(resolve(target,'..','.foundry-init-'));
  project=resolve(staging,'scaffold');
  
// vite: vite-scaffold
step='vite-scaffold';
command(process.execPath,[npm,'exec','--yes',`--package=create-vite@${pack.tools.createVite}`,'--','create-vite','scaffold','--template','react-ts'],staging);
for(const [p,digest]of Object.entries(pack.scaffold)) {
  if(!safePath(p)||hash(await fs.readFile(resolve(project,p)))!==digest)throw Error(`Unexpected create-vite scaffold: ${p}`);
}
// Exact demo removal list from the original antd runbook.
for(const p of ['src/App.tsx','src/App.css','src/index.css','src/assets','public/vite.svg','.oxlintrc.json','README.md']) {
  await fs.rm(resolve(project,p),{recursive:true,force:true});
}


// base: base-place
step='place-payload';
for(const p of Object.keys(pack.files).filter(p=>p.startsWith('payload/')).sort()) {
  const destination=p.slice(8);
  await fs.mkdir(resolve(project,destination,'..'),{recursive:true});
  await fs.copyFile(resolve(target,p),resolve(project,destination));
}
await fs.copyFile(resolve(target,'SETUP.md'),resolve(project,'SETUP.md'));
for(const p of ['src/features','src/shared/ui'])await fs.mkdir(resolve(project,p),{recursive:true});


// vite: vite-install
step='locked-install';
command(process.execPath,[npm,'ci'],project,{...process.env,HUSKY:'0',STORYBOOK_DISABLE_TELEMETRY:'1'});

const installed={};
const packagePlan=JSON.parse(await fs.readFile(resolve(project,'package.json')));
for(const group of ['dependencies','devDependencies'])for(const [name,version]of Object.entries(packagePlan[group])) {
  const actual=JSON.parse(await fs.readFile(resolve(project,'node_modules',name,'package.json'))).version;
  if(actual!==version)throw Error(`Installed ${name}@${actual}; required exact ${version}`);
  installed[name]=actual;
}


  step='verify';
  command(process.execPath,['scripts/verify.mjs']);
  // Keep the complete immutable pack in a reserved provenance directory.
  const provenance=resolve(project,'.foundry/pack');await fs.mkdir(provenance,{recursive:true});
  for(const p of expected) {
    await fs.mkdir(resolve(provenance,p,'..'),{recursive:true});
    await fs.copyFile(resolve(target,p),resolve(provenance,p));
  }
  step='promote';
  if(existsSync(resolve(target,'.gitignore'))) {
    const old=await fs.readFile(resolve(target,'.gitignore'),'utf8');
    const shipped=await fs.readFile(resolve(project,'.gitignore'),'utf8');
    await fs.writeFile(resolve(project,'.gitignore'),old+(old.endsWith('\n')?'':'\n')+shipped);
  }
  for(const name of await fs.readdir(project)) {
    const entry=resolve(project,name);
    const entries=name==='node_modules'?['node_modules/ (installed dependency tree)']:(await fs.lstat(entry)).isDirectory()?(await tree(entry)).map(p=>name+'/'+p):[name];
    if(name==='AGENTS.md'||name==='SETUP.md'||name==='.gitignore')await fs.copyFile(resolve(project,name),resolve(target,name));
    else if(existsSync(resolve(target,name)))throw Error(`Promotion collision: ${name}`);
    else await renameWithRetry(resolve(project,name),resolve(target,name));
    written.push(...entries);
  }
  // Consume only manifest-owned bootstrap files, after provenance is safely placed.
  for(const p of ['init.mjs','pack.json'])await fs.unlink(resolve(target,p));
  await fs.rm(resolve(target,'payload'),{recursive:true});
  project=target;
  step='setup-commit';
  if(!hasGit)command('git',['init']);
  const existingRole=(()=>{try{return command('git',['config','--local','--get','foundry.role']).trim();}catch{return ''}})();
  if(existingRole&&!['designer','developer'].includes(existingRole))throw Error(`Invalid existing local role: ${existingRole}`);
  if(!existingRole)command('git',['config','--local','foundry.role','designer']);
  const anchor=command('git',['hash-object','-w','.foundry/fingerprint.json']).trim();
  command('git',['config','--local','foundry.fingerprint',anchor]);
  command(process.execPath,[npm,'run','prepare']);
  // All target entries passed the allowlist; stage bootstrap removals and generated files.
  command('git',['add','-A','--','.']);
  command(process.execPath,['scripts/check-scope.mjs']);
  command('git',['commit','-m',`chore: initialize ${pack.id} from verified Foundry pack`]);
  await fs.mkdir(resolve(target,'.foundry/logs'),{recursive:true});
  await fs.writeFile(resolve(target,'.foundry/logs/init.log'),log);
  step='servers';
  for(const [name,args]of [['vite',['--host','127.0.0.1','--strictPort','--port','5173']],['storybook',['dev','-p','6006','--host','127.0.0.1','--ci','--no-open','--disable-telemetry']]]) {
    const child=startBin(name,args,{cwd:target});children.push(child);
    child.once('error',error=>{child.spawnError=error.message;});
    child.once('exit',code=>{if(!stopping) {console.error(`${name} server exited (${code}).`);stop(1);}});
  }
  await waitHttp('http://127.0.0.1:5173',children[0]);
  await waitHttp('http://127.0.0.1:6006',children[1]);
  if(staging)await fs.rm(staging,{recursive:true,force:true});
  const durationMs=Date.now()-started;
  console.log(`FOUNDRY_READY ${JSON.stringify({durationMs,app:'http://localhost:5173',storybook:'http://localhost:6006',role:existingRole||'designer'})}`);
  process.send?.({type:'ready',durationMs,target});
  console.log('Initialization passed. App: http://localhost:5173 · Storybook: http://localhost:6006\nKeep this process running. Ctrl-C stops both servers.\nRole gate: Designer (UI only) or Front-end developer (integration, logic, state, API)? Default: Designer.');
} catch(error) {
  console.error(`Initialization failed at ${step}.\n${error.message??error}\nStop and show this message to the pack maintainer. Keep the files and logs for diagnosis; do not edit generated files to bypass verification.`);
  if(written.length)console.error('Files already promoted:\n'+written.join('\n'));
  if(staging) {
    try {await fs.writeFile(resolve(staging,'init.log'),log+'\n'+String(error.stack??error));}catch{}
    console.error(`Retained staging and logs: ${staging}`);
  }
  await stop(1);
}

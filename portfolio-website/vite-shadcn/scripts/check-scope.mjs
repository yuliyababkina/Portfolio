import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { samePath } from './runtime.mjs';

// These patterns are the original antd policy, unchanged.
export const forbidden = [
  /^src\/features\/.*\/api\//,
  /^src\/features\/.*\/controllers\//,
  /^src\/features\/.*\/store\//,
  /^src\/features\/.*\/models\//,
  /^src\/app\//,
  /^src\/tests?\//,
  /\.test\.[jt]sx?$/,
];
// Design notes are designer territory wherever they sit (decision K6).
export const designerTerritory = [/^design\//, /\.design\.md$/];
const fingerprintPath = '.foundry/fingerprint.json';
const digest = value => createHash('sha256').update(value).digest('hex');
function git(args, cwd, allowFailure = false, input) {
  const r = spawnSync('git', args, {cwd, input, windowsHide:true, shell:false, maxBuffer:64e6});
  if (r.error || r.status !== 0) {
    if (allowFailure && !r.error) return null;
    throw Error(`Scope git ${JSON.stringify(args)} failed: ${r.stderr?.toString() ?? r.error}\nFetch full Git history and the default branch, then retry; ask the project maintainer if the revision is unavailable.`);
  }
  return r.stdout;
}
// Windows process startup is expensive. Read the same Git blobs in one process,
// preserving binary bytes, missing/deleted paths, index-vs-HEAD and NUL paths.
export function gitBlobs(cwd, specs) {
  if(!specs.length)return [];
  const bytes=git(['cat-file','--batch','-Z'],cwd,false,Buffer.from(specs.join('\0')+'\0'));
  let offset=0;
  const blobs=specs.map(spec=>{
    const end=bytes.indexOf(0,offset);
    if(end<0)throw Error('Incomplete Git batch header');
    const header=bytes.subarray(offset,end).toString();offset=end+1;
    if(header===`${spec} missing`)return null;
    const match=/^[a-f0-9]+ blob (\d+)$/u.exec(header);
    if(!match)throw Error(`Unexpected Git batch header for ${JSON.stringify(spec)}`);
    const size=Number(match[1]);
    if(offset+size>=bytes.length || bytes[offset+size]!==0)throw Error('Incomplete Git batch blob');
    const blob=bytes.subarray(offset,offset+size);offset+=size+1;return blob;
  });
  if(offset!==bytes.length)throw Error('Unexpected trailing Git batch output');
  return blobs;
}
export function resolveCiBase(cwd=process.cwd(), env=process.env) {
  const mr=env.CI_MERGE_REQUEST_DIFF_BASE_SHA;
  const before=env.CI_COMMIT_BEFORE_SHA;
  if(git(['rev-parse','--is-shallow-repository'],cwd).toString().trim()==='true')throw Error('Scope check requires full history. Set GIT_DEPTH: "0", fetch the default branch and retry.');
  if(env.CI_PIPELINE_SOURCE==='merge_request_event'&&(!mr||/^0+$/u.test(mr)))throw Error('Merge-request scope needs CI_MERGE_REQUEST_DIFF_BASE_SHA. Ask the project maintainer to restore the GitLab MR diff base and fetch full history.');
  if(mr && !/^0+$/u.test(mr))return git(['merge-base',mr,'HEAD'],cwd).toString().trim();
  if(before && !/^0+$/u.test(before))return git(['merge-base',before,'HEAD'],cwd).toString().trim();
  if(!before)throw Error('Scope check needs a CI diff base. Fetch full Git history and supply GitLab pipeline variables.');
  const history=git(['rev-list','--count','HEAD'],cwd).toString().trim();
  if(history==='1')return null;
  const name=env.CI_DEFAULT_BRANCH;
  if(!name)throw Error('Scope check needs CI_DEFAULT_BRANCH and full history for a new branch. Ask a project maintainer to restore GitLab pipeline variables.');
  for(const ref of [`refs/remotes/origin/${name}`,`refs/heads/${name}`]) {
    if(git(['rev-parse','--verify',ref],cwd,true)) {
      const base=git(['merge-base',ref,'HEAD'],cwd).toString().trim();
      // First default-branch push may already point at HEAD in the checkout.
      return base===git(['rev-parse','HEAD'],cwd).toString().trim()
        ? git(['rev-parse','HEAD^'],cwd).toString().trim() : base;
    }
  }
  throw Error(`Scope check cannot resolve default branch ${name}. Fetch origin/${name} with full history and retry.`);
}
function setupFingerprint(cwd,base) {
  // Bootstrap has no earlier fingerprint. Decision B: verify shipped bytes;
  // this is a seatbelt, not an external signature or protected pipeline anchor.
  const prefix='.foundry/pack/';
  const bytes=git(['show',`HEAD:${prefix}pack.json`],cwd,true);
  if(!bytes)throw Error('Setup fingerprint missing. Run the shipped init.mjs and commit its complete output.');
  const pack=JSON.parse(bytes), {artifactHash,...identity}=pack;
  if(digest(JSON.stringify(identity,null,2)+'\n')!==artifactHash)throw Error('Setup pack identity changed. Restore the complete shipped pack and rerun init.');
  const expected={};
  for(const [p,h]of Object.entries(pack.files)) {
    expected[prefix+p]=h;
    if(p.startsWith('payload/'))expected[p.slice(8)]=h;
  }
  expected[prefix+'pack.json']=digest(bytes);
  expected['SETUP.md']=pack.files['SETUP.md'];
  for(const [p,h]of Object.entries(pack.scaffold))if(p.startsWith('public/'))expected[p]=h;
  if(base) {
    const prior=git(['show',`${base}:.gitignore`],cwd,true);
    const shipped=git(['show',`HEAD:${prefix}payload/.gitignore`],cwd,true);
    // Init preserves earlier user ignores by its exact documented concatenation.
    // With no earlier history, every byte must still match the shipped output.
    if(prior&&shipped)expected['.gitignore']=digest(Buffer.concat([prior,prior.at(-1)===10?Buffer.alloc(0):Buffer.from('\n'),shipped]));
  }
  const files=base?git(['diff','--name-only','--no-renames','-z',`${base}...HEAD`],cwd).toString().split('\0').filter(Boolean)
    :git(['ls-tree','-r','--name-only','-z','HEAD'],cwd).toString().split('\0').filter(Boolean);
  const blobs=gitBlobs(cwd,files.map(p=>`HEAD:${p}`));
  const bad=files.filter((p,i)=>{
    const actual=blobs[i];
    return !actual||expected[p]!==digest(actual);
  });
  // Required output must be complete, including all provenance and guards.
  const present=new Set(git(['ls-tree','-r','--name-only','-z','HEAD'],cwd).toString().split('\0').filter(Boolean));
  for(const p of Object.keys(expected))if(!present.has(p))bad.push(p);
  if(bad.length)throw Error(`Setup fingerprint blocked: files differ from shipped bytes: ${[...new Set(bad)].join(', ')}. Restore the shipped setup output; ask a developer to review later edits separately.`);
  console.log('Verified complete setup fingerprint.');
  return {role:'designer',files,bootstrap:true};
}
export function checkScope({cwd = process.cwd(), base, ci = Boolean(process.env.CI), env=process.env} = {}) {
  if(ci && base===undefined)base=resolveCiBase(cwd,env);
  const rawRole = git(['config','--local','--get','foundry.role'],cwd,true)?.toString().trim();
  const developers=(env.FOUNDRY_DEVELOPERS??'').split(',').map(s=>s.trim()).filter(Boolean);
  if(ci && !developers.length)console.log('Designer scope: ask a GitLab project maintainer to add FOUNDRY_DEVELOPERS (comma-separated GitLab usernames) in Settings > CI/CD > Variables, including your GITLAB_USER_LOGIN for developer work.');
  const role = ci ? (env.GITLAB_USER_LOGIN && developers.includes(env.GITLAB_USER_LOGIN)?'developer':'designer') : (rawRole || 'designer');
  if (!['designer','developer'].includes(role)) throw Error(`Invalid local role: ${role}`);
  const head = git(['rev-parse','--verify','HEAD'],cwd,true)?.toString().trim();
  if (ci && base) git(['rev-parse','--verify',`${base}^{commit}`],cwd);
  if(ci && !base)return setupFingerprint(cwd,null);
  // Locally trust HEAD; during first init trust a blob anchored by init in local Git config.
  // In CI only the merge base can approve shipped bytes, never the candidate diff.
  let trusted = head ? git(['show',`${base ?? 'HEAD'}:${fingerprintPath}`],cwd,true) : null;
  if (!trusted && !ci) {
    const anchor = git(['config','--local','--get','foundry.fingerprint'],cwd,true)?.toString().trim();
    if (!anchor || !/^[a-f0-9]{40,64}$/u.test(anchor)) throw Error('Missing trusted shipped fingerprint. Run init.mjs.');
    trusted = git(['cat-file','blob',anchor],cwd);
  }
  if (!trusted) return setupFingerprint(cwd,base);
  const fingerprint = JSON.parse(trusted);
  const args = base ? ['diff','--name-only','--no-renames','-z',`${base}...HEAD`] :
    head ? ['diff','--cached','--name-only','--no-renames','-z','HEAD'] : ['diff','--cached','--name-only','--no-renames','-z'];
  const files = git(args,cwd).toString().split('\0').filter(Boolean);
  const bad = [];
  const blobs=gitBlobs(cwd,files.map(path=>`${base ? 'HEAD' : ''}:${path}`));
  for (const [i,path] of files.entries()) {
    const bytes = blobs[i];
    const same = bytes && fingerprint.files[path] === digest(bytes);
    // Protect the trust surface as part of the approved roles/fingerprint model.
    const protectedFile = path === fingerprintPath || fingerprint.protectedFiles.includes(path);
    if (protectedFile && path === fingerprintPath) {
      if (!bytes || !bytes.equals(trusted)) bad.push(path);
    } else if (protectedFile && !same) bad.push(path);
    else if (role === 'designer' && forbidden.some(re => re.test(path)) && !designerTerritory.some(re => re.test(path)) && !same) bad.push(path);
  }
  if (bad.length) throw Error(`Designer scope blocked (developer work or changed guard payload):\n${bad.join('\n')}\nAsk a developer to make integration changes; for an authorized GitLab developer, ask a project maintainer to add their username to FOUNDRY_DEVELOPERS. Restore changed guard files from the shipped pack.`);
  return {role, files};
}
if (process.argv[1] && samePath(process.argv[1], fileURLToPath(import.meta.url))) {
  try {
    checkScope();
    console.log('Scope check passed; role stays in local Git config.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { run, runBin, npmCli } from './runtime.mjs';
import { checkScope, resolveCiBase } from './check-scope.mjs';
import { verify } from './verify.mjs';
import { policyConfig } from './policy-config.mjs';

const sha=b=>createHash('sha256').update(b).digest('hex');
try {
  // A missing/unresolvable base is never a successful scope check.
  const mergeBase=resolveCiBase();
  const scope=checkScope({base:mergeBase,ci:true});
  const trustRef=scope.bootstrap?'HEAD':mergeBase;
  const trusted=JSON.parse(run('git',['show',`${trustRef}:.foundry/fingerprint.json`]));
  // Never use changed expectations from the candidate diff to authorize itself.
  for(const path of [...trusted.protectedFiles,'scripts/verify.mjs']) {
    assert.equal(sha(await readFile(path)),trusted.files[path],`Changed CI trust payload: ${path}`);
  }
  run(process.execPath,[npmCli(),'ci'],{env:{...process.env,HUSKY:'0'}});
  const policy=JSON.parse(run('git',['show',`${trustRef}:.foundry/policy.json`]));
  assert.equal(sha(await readFile('eslint.presentation.js')),policy.sourceSha256,'Changed library policy source');
  const isShadcn=policy.packId==='vite-shadcn';
  const buttonMessage=policy.rules.flatMap(b=>b.rules?.['react/forbid-elements']?.[1]?.forbid??[]).find(b=>b.element==='button').message;
  for(const path of [...(isShadcn?['src/components/ui/button.tsx','src/hooks/use-mobile.ts','src/theme/ThemeProvider.tsx']:[]),'src/flows/routes.tsx','src/flows/probe/Probe.tsx','src/shared/hooks/useProbe.ts','src/theme/tokens.ts']) {
    const cfg=JSON.parse(runBin('eslint',['--print-config',path]));
    assert.equal(cfg.rules['react-hooks/rules-of-hooks'][0],2);
    const expected=policyConfig(policy,path);
    for(const [name,payload]of Object.entries(expected.rules))assert.deepEqual(payload[0]===0?cfg.rules[name].slice(0,1):cfg.rules[name],payload,`Missing exact rule payload: ${path}: ${name}`);
    assert.equal(cfg.linterOptions.noInlineConfig,expected.linterOptions.noInlineConfig);
  }
  const probe='src/flows/__guardcheck';
  const literal='#1677ff';
  // Match the probe's literal against the trusted standalone literal selectors.
  const literalRules=policyConfig(policy,`${probe}/probe.tsx`).rules['no-restricted-syntax'].slice(1);
  const colorRules=literalRules.filter(({selector})=>{
    const pattern=/^Literal\[value=\/(.*)\/([a-z]*)\]$/u.exec(selector);
    return pattern&&new RegExp(pattern[1],pattern[2]).test(literal);
  });
  assert.equal(colorRules.length,1,'Trusted policy must define one colour diagnostic for the probe literal');
  await mkdir(probe); // Refuse to overwrite pre-existing content.
  try {
    await writeFile(`${probe}/probe.tsx`,`import axios from "axios";\nconst c = "${literal}";\nexport const Probe = () => <button style={{ color: c }}>{String(axios)}</button>;\n`);
    let output;
    // Inspect status AND structured diagnostics, never count a launcher/formatter failure.
    const {spawnSync}=await import('node:child_process');
    const {binPath}=await import('./runtime.mjs');
    const result=spawnSync(process.execPath,[binPath('eslint'),`${probe}/probe.tsx`,'--format','json'],{encoding:'utf8',windowsHide:true});
    assert.equal(result.error,undefined);assert.equal(result.status,1,result.stderr);
    output=JSON.parse(result.stdout).flatMap(f=>f.messages);
    for(const [id,payload]of [['no-restricted-imports','No data fetching in presentation'],['react/forbid-elements',buttonMessage],['no-restricted-syntax',colorRules[0].message]]) {
      assert.ok(output.some(m=>m.ruleId===id&&m.severity===2&&m.message.includes(payload)),`Negative probe missing ${id} payload`);
    }
    await writeFile(`${probe}/probe.tsx`,'import { Link, useNavigate, useParams } from "@tanstack/react-router";\nexport function Probe() { const nav=useNavigate(); const p=useParams({strict:false}); return <div><Link to="/">Home</Link><span onClick={()=>nav({to:"/"})}>{String(p.id)}</span></div>; }\n');
    runBin('eslint',[`${probe}/probe.tsx`,'--max-warnings=0']);
  } finally {await rm(probe,{recursive:true,force:true});}
  await verify();
  // Visible to reviewers: custom components, + marking those new in this change.
  const { report } = await import('./check-custom.mjs'); // needs the installed TypeScript
  report(process.cwd(),scope.bootstrap?undefined:mergeBase);
  const router=await readFile('src/app/router.tsx','utf8');
  assert.ok(router.includes('from "../flows/routes"'),'Router must consume flows generically');
  assert.ok(!/from ["'][^"']*Screen/u.test(router),'Router names a product screen');
  console.log('Passed all generated-project CI checks.');
} catch(error) {console.error(error.message);process.exitCode=1;}

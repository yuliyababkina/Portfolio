// Evaluate the closed glob vocabulary used in the independent policy snapshot.
// Unsupported syntax fails rather than silently skipping a policy tier.
export function policyMatches(glob, path) {
  if (/[!\[\]?]/u.test(glob)) throw Error(`Unsupported policy file glob: ${glob}`);
  let regex='';
  for(let i=0;i<glob.length;i++) {
    const c=glob[i];
    if(c==='*' && glob[i+1]==='*') {
      i++;
      if(glob[i+1]==='/'){i++;regex+='(?:.*/)?';}else regex+='.*';
    } else if(c==='*')regex+='[^/]*';
    else if(c==='{')regex+='(?:';
    else if(c==='}')regex+=')';
    else if(c===',')regex+='|';
    else regex+=c.replace(/[.()+^$|\\]/gu,'\\$&');
  }
  return new RegExp('^'+regex+'$','u').test(path);
}
export function policyConfig(policy, path) {
  const rules={}, linterOptions={};
  for(const block of policy.rules) {
    if(!block.files.some(g=>policyMatches(g,path)) || block.ignores?.some(g=>policyMatches(g,path)))continue;
    for(const [id,payload] of Object.entries(block.rules??{}))rules[id]=Array.isArray(payload)?[{off:0,warn:1,error:2}[payload[0]]??payload[0],...payload.slice(1)]:[{off:0,warn:1,error:2}[payload]??payload];
    Object.assign(linterOptions,block.linterOptions);
  }
  return {rules,linterOptions};
}

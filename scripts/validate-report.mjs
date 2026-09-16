import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const requireThat = (value,message) => {if(!value) throw new Error(message);};
const text = value => typeof value==='string' && value.trim().length>0;
const enumValue = (value,choices,label) => requireThat(choices.includes(value),`Invalid ${label}`);
const object = (value,label) => requireThat(value && typeof value==='object' && !Array.isArray(value),`Invalid ${label}`);

export function validateReport(r) {
  object(r,'report');
  requireThat(r.schemaVersion===1,'schemaVersion must be 1');
  for(const key of ['base','head']) requireThat(r[key]===null || text(r[key]),`Invalid ${key}`);
  enumValue(r.workingTree,['clean','dirty','snapshot','unknown'],'workingTree');
  enumValue(r.mode,['bounded','fallback','blocked'],'mode');
  enumValue(r.verification,['not-verified','supplied-passing','executed-passing'],'verification');
  for(const key of ['changedPaths','evidence','freshness','checks','omissions','gaps','nextActions']) requireThat(Array.isArray(r[key]),`${key} must be an array`);
  for(const change of r.changedPaths) {
    object(change,'change');
    enumValue(change.status,['A','M','D','R','unknown'],'change status');
    requireThat(text(change.path),'Missing changed path');
    requireThat(change.status==='R' ? text(change.previousPath) : change.previousPath===null,'Invalid previousPath');
  }
  const evidence=new Map();
  for(const e of r.evidence) {
    object(e,'evidence');
    requireThat(text(e.id) && !evidence.has(e.id),'Missing/duplicate evidence id');
    enumValue(e.origin,['supplied','inspected','executed'],'evidence origin');
    requireThat(text(e.source) && text(e.summary),'Evidence requires source and summary');
    requireThat(e.revision===null || text(e.revision),'Invalid evidence revision');
    evidence.set(e.id,e);
  }
  const refs=item=>{
    requireThat(Array.isArray(item.evidenceIds),'Missing evidenceIds');
    for(const id of item.evidenceIds) requireThat(evidence.has(id),`Unknown evidence: ${id}`);
    requireThat(text(item.reason),'Missing reason');
  };
  for(const f of r.freshness) {
    requireThat(text(f.subject),'Missing freshness subject');
    enumValue(f.status,['current','stale','unknown','not-needed'],'freshness status');refs(f);
  }
  for(const o of r.omissions) {requireThat(text(o.scope),'Missing omission scope');refs(o);requireThat(o.evidenceIds.length>0,'Omission requires evidence');}
  const ids=new Set();
  for(const c of r.checks) {
    object(c,'check');
    requireThat(text(c.id) && !ids.has(c.id),'Missing/duplicate check id');ids.add(c.id);
    requireThat(text(c.scope) && typeof c.required==='boolean','Invalid check scope/required');
    requireThat(c.command===null || text(c.command),'Invalid command');
    enumValue(c.status,['planned','blocked','supplied-pass','supplied-fail','executed-pass','executed-fail'],'check status');refs(c);
    if(c.status.endsWith('-pass')) {
      const origin=c.status.startsWith('executed-')?'executed':'supplied';
      requireThat(r.head!==null && c.evidenceIds.some(id=>{const e=evidence.get(id);return e.revision===r.head && e.origin===origin;}),`Check ${c.id} needs current ${origin} evidence`);
    }
  }
  for(const value of [...r.gaps,...r.nextActions]) requireThat(text(value),'Empty gap/action');
  if(r.verification!=='not-verified') {
    const required=r.checks.filter(c=>c.required);
    requireThat(required.length>0 && required.every(c=>c.status.endsWith('-pass')),'All required checks must pass');
    requireThat(r.mode!=='blocked','Blocked plan cannot be verified');
    if(r.verification==='executed-passing') requireThat(required.every(c=>c.status==='executed-pass'),'All required checks need executed passing evidence');
  }
  return r;
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.length!==3) {console.error('Usage: node scripts/validate-report.mjs <report.json>');process.exitCode=2;}
  else try {validateReport(JSON.parse(readFileSync(process.argv[2],'utf8')));console.log('Report contract valid. Evidence truth still requires review.');}
  catch(error) {console.error(error.message);process.exitCode=1;}
}

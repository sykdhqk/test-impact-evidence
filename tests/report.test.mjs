import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReport } from '../scripts/validate-report.mjs';

const passing = () => ({schemaVersion:1,base:'b1',head:'h1',workingTree:'snapshot',mode:'bounded',verification:'supplied-passing',changedPaths:[],evidence:[{id:'E1',origin:'supplied',source:'packet#log',revision:'h1',summary:'Required suite passed.'}],freshness:[],checks:[{id:'suite',scope:'package',command:'npm run test:package',required:true,status:'supplied-pass',reason:'Required check at head.',evidenceIds:['E1']}],omissions:[],gaps:[],nextActions:[]});
test('accepts current supplied evidence without attributing execution to this task',()=>assert.doesNotThrow(()=>validateReport(passing())));
test('rejects historical log used as current passing evidence',()=>{
  const r=passing();r.evidence[0].revision='b1';assert.throws(()=>validateReport(r),/current.*evidence/);
});
test('historical optional checks are also excluded from the current-head check list',()=>{
  const r=passing();r.verification='not-verified';r.checks[0].required=false;r.evidence[0].revision='b1';assert.throws(()=>validateReport(r),/current.*evidence/);
});
test('rejects planned required checks in a passing report',()=>{
  const r=passing();r.checks[0].status='planned';assert.throws(()=>validateReport(r),/required.*pass/);
});
test('rejects supplied logs relabeled as executed',()=>{
  const r=passing();r.verification='executed-passing';r.checks[0].status='executed-pass';assert.throws(()=>validateReport(r),/executed.*evidence/);
});
test('rejects missing evidence references and missing rename source',()=>{
  const r=passing();r.checks[0].evidenceIds=['absent'];assert.throws(()=>validateReport(r),/Unknown evidence/);
  const s=passing();s.changedPaths=[{status:'R',path:'new.ts',previousPath:null}];assert.throws(()=>validateReport(s),/previousPath/);
});
test('accepts a blocked plan with unknown command and no success claim',()=>{
  const r=passing();r.mode='blocked';r.verification='not-verified';r.checks[0].status='blocked';r.checks[0].command=null;r.gaps=['Current scripts unavailable'];assert.doesNotThrow(()=>validateReport(r));
});
test('keeps an unspecified change type unknown instead of inventing a modification',()=>{
  const r=passing();r.changedPaths=[{status:'unknown',path:'packages/cart/src/totals.ts',previousPath:null}];assert.doesNotThrow(()=>validateReport(r));
});

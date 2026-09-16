import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, cpSync, readFileSync, symlinkSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildPackages } from '../package.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(path.join(root,p));
const archiveFiles = p => execFileSync('unzip',['-Z1',p],{encoding:'utf8'}).trim().split('\n');

test('install archive contains complete referenced skill and only declared payload', () => {
  const dir = mkdtempSync(path.join(tmpdir(),'impact-test-'));
  try {
    const [install, standalone] = buildPackages(root, dir);
    const files = archiveFiles(install);
    assert.deepEqual(files, ['ipollowork.plugin.json','skills/test-impact-evidence/SKILL.md','skills/test-impact-evidence/references/plan-format.md']);
    assert.deepEqual(archiveFiles(standalone), ['test-impact-evidence/SKILL.md','test-impact-evidence/references/plan-format.md']);
    let total = 0;
    for(const name of files) {
      const unpacked = execFileSync('unzip',['-p',install,name]);
      total += unpacked.length;
      assert.deepEqual(unpacked, read(name));
    }
    assert.ok(total <= 10 * 1024 * 1024);
    assert.ok(statSync(install).size <= 12 * 1024 * 1024);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('building twice preserves exact accepted archive bytes', () => {
  const dir = mkdtempSync(path.join(tmpdir(),'impact-determinism-'));
  try {
    const first = buildPackages(root,path.join(dir,'a')).map(p=>readFileSync(p));
    const second = buildPackages(root,path.join(dir,'b')).map(p=>readFileSync(p));
    assert.deepEqual(first,second);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('symlink payload is rejected instead of copying external files', () => {
  const dir = mkdtempSync(path.join(tmpdir(),'impact-symlink-'));
  try {
    cpSync(path.join(root,'skills'),path.join(dir,'skills'),{recursive:true});
    cpSync(path.join(root,'ipollowork.plugin.json'),path.join(dir,'ipollowork.plugin.json'));
    symlinkSync(path.join(root,'LICENSE'),path.join(dir,'skills/test-impact-evidence/external.md'));
    assert.throws(()=>buildPackages(dir,path.join(dir,'dist')),/symbolic link/);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('ordinary importer resource paths cover the skill without privileged capabilities', () => {
  const m=JSON.parse(read('ipollowork.plugin.json'));
  assert.equal(m.schemaVersion,2);
  assert.equal(m.source.trusted,false);
  for(const key of ['permissions','authorization','engineBindings','localServices']) assert.equal(m[key],undefined);
  assert.deepEqual(m.resources.map(r=>[r.type,r.path]),[['skill','skills/test-impact-evidence']]);
  assert.equal(m.package.updateId,'sykdhqk/test-impact-evidence');
  assert.ok(readdirSync(path.join(root,m.resources[0].path)).includes('references'));
});

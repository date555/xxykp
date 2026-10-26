import test from 'node:test';
import assert from 'node:assert/strict';
import {manifest,runtime,parseRig} from '../tools/spine-cpu.mjs';
import {measureAnimationBounds,resolveEffectDimensions,fitEffectScale} from '../src/spine-bounds.js';

const missing=Object.entries(manifest.assets).filter(([,m])=>!(m.width>0&&m.height>0));
test('Guojia concert skill uses its animated geometry instead of a 1px denominator',()=>{
 const key='guojia7/guojia7_skill_hit',meta=manifest.assets[key],{data,atlas}=parseRig(key);
 try{
  assert.deepEqual([meta.width,meta.height],[0,0]);
  const dimensions=resolveEffectDimensions(meta,data,runtime),scale=fitEffectScale(dimensions,200);
  assert.ok(dimensions.width>2000&&dimensions.height>2000);
  assert.ok(scale>.01&&scale<.1,`unexpected scale ${scale}`);
  assert.equal(meta.width,0,'normalization must not modify the source manifest');
 }finally{atlas.dispose();}
});
test('all 17 missing-size effects fit their intended area at independent 120fps sampling',()=>{
 assert.equal(missing.length,17);
 for(const [key,meta] of missing){const {data,atlas}=parseRig(key);try{
  const dimensions=resolveEffectDimensions(meta,data,runtime);
  const observed=measureAnimationBounds(data,runtime,{actions:[data.animations[0].name],fps:120});
  for(const target of [66,110,115,200,300]){
   const scale=fitEffectScale(dimensions,target);
   assert.ok(Number.isFinite(scale)&&scale>0,key);
   assert.ok(observed.width*scale<=target&&observed.height*scale<=target,`${key} exceeds ${target}px`);
  }
 }finally{atlas.dispose();}}
});
test('valid source dimensions are preserved and invalid scales fail explicitly',()=>{
 const meta={width:320,height:180};
 assert.deepEqual(resolveEffectDimensions(meta,null,null),meta);
 assert.equal(fitEffectScale(meta,160,90),.5);
 for(const bad of [0,-1,NaN,Infinity])assert.throws(()=>fitEffectScale({width:bad,height:180},200),/missing dimensions/);
});

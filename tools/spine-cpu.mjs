// CPU-only atlas/rig parsing using the same installed Spine runtime as the browser bundle.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../../骨骼图片拼合工具/package.json',import.meta.url));
export const runtime=require('@pixi-spine/runtime-3.8');
const {BaseTexture}=require('@pixi/core');
const {TextureAtlas}=require('@pixi-spine/base');
const root=new URL('../assets/spine/',import.meta.url);
export const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root),'utf8'));
export function parseRig(key){
 const meta=manifest.assets[key],folder=new URL(key.slice(0,key.lastIndexOf('/')+1),root);
 const atlas=new TextureAtlas(fs.readFileSync(new URL(key+'.atlas',root),'utf8'),(name,done)=>{
  const bytes=fs.readFileSync(new URL(name,folder));
  // These exported pages are PNGs; use IHDR dimensions without a canvas or WebGL context.
  if(bytes.readUInt32BE(0)!==0x89504e47)throw Error('Expected PNG atlas page '+name);
  done(new BaseTexture(null,{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}));
 });
 try{
  const parser=meta.format==='json'?new runtime.SkeletonJson(new runtime.AtlasAttachmentLoader(atlas)):new runtime.SkeletonBinary(new runtime.AtlasAttachmentLoader(atlas));
  const bytes=fs.readFileSync(new URL(key+'.'+meta.format,root));
  return {data:parser.readSkeletonData(meta.format==='json'?JSON.parse(bytes):new Uint8Array(bytes)),atlas};
 }catch(error){atlas.dispose();throw error;}
}

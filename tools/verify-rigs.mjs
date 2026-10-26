// CPU validation of named skins and animation poses; browser rendering is checked separately.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {APPEARANCE_ANIMATIONS,BOSS_ANIMATIONS} from '../src/animation-data.js';
import {bossActions} from '../src/rig-compat.js';
const require=createRequire(new URL('../../骨骼图片拼合工具/package.json',import.meta.url));
const {SkeletonBinary,SkeletonJson,AtlasAttachmentLoader,Skeleton,AnimationState,AnimationStateData}=require('@pixi-spine/runtime-3.8');
const root=new URL('../assets/spine/',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root),'utf8'));
const parsed=new Map(),failures=[];let checked=0,poses=0;
for(const [type,entries] of [['appearance',Object.entries(APPEARANCE_ANIMATIONS)],['boss',Object.entries(BOSS_ANIMATIONS)]]){
 for(const [id,meta] of entries){if(process.argv[2]&&id!==process.argv[2])continue;try{
  let data=parsed.get(meta.body);
  if(!data){
   // Placeholder regions only: this test does not validate textures or rendered pixels.
   const loader=new AtlasAttachmentLoader({findRegion:()=>({})});
   const format=manifest.assets[meta.body].format;
   const parser=format==='json'?new SkeletonJson(loader):new SkeletonBinary(loader);
   const bytes=fs.readFileSync(new URL(meta.body+'.'+format,root));
   data=parser.readSkeletonData(format==='json'?JSON.parse(bytes):new Uint8Array(bytes));
   parsed.set(meta.body,data);
  }
  const rig=new Skeleton(data);
  if(meta.skin)rig.setSkinByName(meta.skin);
  rig.setSlotsToSetupPose();
  const required=type==='appearance'?['idle','attack','skill']:['idle'];
  for(const action of required)if(!data.findAnimation(action))throw Error('Missing action: '+action);
  for(const action of ['idle','attack','skill'].filter(name=>data.findAnimation(name)&&(type==='appearance'||process.argv[2]||bossActions(meta).includes(name)))){
   const state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,action,false);
   for(let frame=0;frame<=Math.ceil(data.findAnimation(action).duration*30);frame++){const dt=frame?1/30:0;state.update(dt);state.apply(rig);rig.updateWorldTransform();poses++;
    if(rig.bones.some(b=>!Number.isFinite(b.matrix.tx)||!Number.isFinite(b.matrix.ty)))throw Error('Non-finite pose: '+action+' dt='+dt+' bones='+rig.bones.filter(b=>!Number.isFinite(b.matrix.tx)||!Number.isFinite(b.matrix.ty)).map(b=>b.data.name+':active='+b.active).join(','));
   }
  }
  checked++;
 }catch(error){failures.push({type,id,body:meta.body,message:error.message});}}
}
const result={checked,poses,failures};
fs.writeFileSync(new URL(process.argv[2]?'../docs/rig-diagnostic.json':'../docs/rig-validation.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;

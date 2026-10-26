import fs from 'node:fs';
import {manifest,runtime,parseRig} from './spine-cpu.mjs';
import {measureAnimationBounds,resolveEffectDimensions} from '../src/spine-bounds.js';
import {APPEARANCES} from '../src/appearances.js';
const effects=new Map(),records=[],failures=[];
for(const [id,meta] of Object.entries(manifest.appearances))for(const action of ['attack','skill'])for(const [role,key] of [['projectile',meta[action].asset],['hit',meta[action].hitAsset]])if(key){const refs=effects.get(key)||[];refs.push({id,heroId:meta.heroId,action,role,type:meta[action].type});effects.set(key,refs);}
for(const [id,meta] of Object.entries({...manifest.toys,...manifest.statuses}))effects.set(meta.asset,[{id,role:'toy/status'}]);
for(const [key,refs] of effects){let atlas;try{
 const meta=manifest.assets[key],sourceMissing=!(Number.isFinite(meta.width)&&Number.isFinite(meta.height)&&meta.width>0&&meta.height>0);
 let dimensions={width:meta.width,height:meta.height},bounds=null;
 if(sourceMissing){const parsed=parseRig(key);atlas=parsed.atlas;dimensions=resolveEffectDimensions(meta,parsed.data,runtime);bounds=measureAnimationBounds(parsed.data,runtime,{actions:[parsed.data.animations[0].name],fps:120});if(bounds.width>dimensions.width||bounds.height>dimensions.height)throw Error('120fps geometry exceeds normalized dimensions');}
 records.push({key,sourceSize:{width:meta.width,height:meta.height},resolvedSize:dimensions,bounds,sourceMissing,refs});
 }catch(error){failures.push({key,message:error.message,refs});}finally{atlas?.dispose();}}
const missingSourceSizes=records.filter(r=>r.sourceMissing).map(r=>r.key);
const ids=[...new Set(records.filter(r=>r.sourceMissing).flatMap(r=>r.refs.map(r=>r.id)))];
const looks=Object.values(APPEARANCES).flat();
const result={scope:'All referenced effect source sizes; 120fps geometry verification for missing sizes only. Not an all-skin pixel audit.',effects:effects.size,normalized:missingSourceSizes.length,affectedAppearances:ids.map(id=>({id,name:looks.find(a=>a.id===id)?.name})),frames:records.reduce((sum,r)=>sum+(r.bounds?.frames||0),0),missingSourceSizes,failures,records};
fs.writeFileSync(new URL('../docs/effect-bounds-audit.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({effects:result.effects,normalized:result.normalized,appearances:result.affectedAppearances.length,frames:result.frames,failures},null,2));
if(failures.length)process.exitCode=1;

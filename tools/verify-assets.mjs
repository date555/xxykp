import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const work=path.dirname(root.replace(/[\\/]$/,''));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const manifests=[read('assets/manifest.json'),read('assets/spine/manifest.json'),read('assets/ui/stars/manifest.json'),read('docs/landscape-ui-sources.json'),read('assets/ui/damage/manifest.json')];
const records=manifests.flatMap(m=>Array.isArray(m.assets)?m.assets:m.files),errors=[];
for(const r of records){
 const target=path.join(root,r.file),source=path.join(work,r.source);
 if(!fs.existsSync(source))errors.push(`Source missing: ${r.source}`);
 if(!fs.existsSync(target)){errors.push(`Output missing: ${r.file}`);continue;}
 const hash=createHash('sha256').update(fs.readFileSync(target)).digest('hex');
 if(hash!==r.sha256)errors.push(`Hash mismatch: ${r.file}`);
}
const result={verifiedSourceRecords:records.length,skeletons:Object.keys(manifests[1].assets).length,starIcons:manifests[2].files.length,errors};
fs.writeFileSync(path.join(root,'docs/asset-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
if(errors.length)process.exitCode=1;

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fs.realpathSync(fileURLToPath(new URL('../',import.meta.url)));
const output=path.resolve(root,'dist');
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('发布目录必须是当前项目的 dist');
if(fs.existsSync(output)){
 const stat=fs.lstatSync(output);
 if(stat.isSymbolicLink()||!stat.isDirectory()||fs.realpathSync(output)!==output)throw Error('拒绝清理重定向或异常的发布目录');
 fs.rmSync(output,{recursive:true});
}
fs.mkdirSync(output);
const files=[];
function copy(relative){
 const source=path.join(root,relative),stat=fs.lstatSync(source);
 if(stat.isSymbolicLink())throw Error(`发布资源不能是链接：${relative}`);
 if(stat.isDirectory()){
  for(const name of fs.readdirSync(source).sort())copy(path.posix.join(relative,name));
 }else{
  // Only the Spine manifest is read at runtime; other manifests are development provenance.
  if(relative.endsWith('/manifest.json')&&relative!=='assets/spine/manifest.json')return;
  const target=path.join(output,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(source,target);
  files.push({file:relative,bytes:stat.size});
 }
}
for(const entry of ['index.html','animation-check.html','style.css','src','assets','vendor'])copy(entry);
fs.writeFileSync(path.join(output,'.nojekyll'),'');
files.push({file:'.nojekyll',bytes:0});
const names=new Set(files.map(f=>f.file));
function requireFile(file){if(!names.has(file))throw Error(`缺少发布资源或路径大小写不一致：${file}`);}
for(const {file} of files){
 const text=/\.(html|css|js)$/.test(file)?fs.readFileSync(path.join(output,file),'utf8'):'';
 const refs=file.endsWith('.html')?[...text.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1])
  :file.endsWith('.css')?[...text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m=>m[1])
  :file.endsWith('.js')&&file.startsWith('src/')?[...text.matchAll(/\b(?:from\s*|import\s*)['"](\.{1,2}\/[^'"]+)['"]/g)].map(m=>m[1]):[];
 for(const ref of refs){
  if(/^(?:[a-z]+:|#)/i.test(ref))continue;
  if(ref.startsWith('/'))throw Error(`路径不能指向网站根目录：${file} → ${ref}`);
  const target=path.posix.normalize(path.posix.join(path.posix.dirname(file),ref));
  requireFile(ref.endsWith('/')?path.posix.join(target,'index.html'):target);
 }
}
const manifest=JSON.parse(fs.readFileSync(path.join(output,'assets/spine/manifest.json'),'utf8'));
for(const [key,meta] of Object.entries(manifest.assets)){
 const base=`assets/spine/${key}`,folder=path.posix.dirname(base);
 requireFile(`${base}.atlas`);requireFile(`${base}.${meta.format}`);
 for(const texture of meta.textures)requireFile(path.posix.join(folder,texture));
}
const totalBytes=files.reduce((sum,f)=>sum+f.bytes,0),largest=files.reduce((a,b)=>a.bytes>b.bytes?a:b);
if(files.length>20000||largest.bytes>25*1024**2||totalBytes>1024**3)throw Error('发布资源超出已检查的静态平台限制');
const report={name:'向咸鱼开炮',output:'dist',files:files.length,totalBytes,totalMiB:+(totalBytes/1024**2).toFixed(2),largest,spineAssets:Object.keys(manifest.assets).length,cloudflarePages:{withinFreeFileLimit:true,withinAssetSizeLimit:true,dashboardDragAndDrop:files.length<=1000},githubPages:{withinSiteSizeLimit:true},checks:['relative entry, CSS and module URLs','case-sensitive runtime Spine paths','no source server, tools, tests or docs in dist'],publicDeploymentPerformed:false};
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/deployment-build.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

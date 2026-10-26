"""Audit original hero/skin references before admitting them to the game."""
from pathlib import Path
from collections import Counter
import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT.parent
SOURCE=WORK/'远程资源工具/远程资源数据/版本数据/3c7b0bfc39/按原名保存/3c7b0bfc39'
SOURCES=[SOURCE]+[p for p in sorted((WORK/'远程资源工具/远程资源数据/版本数据').glob('*/按原名保存/*')) if p.is_dir() and p!=SOURCE]
def source_file(relative):
 return next((p/relative for p in SOURCES if (p/relative).is_file()),None)
CONFIG=WORK/'远程资源工具/远程资源数据/版本数据/58b91ed6c8/关键配置JSON/58b91ed6c8'
def config(name):return json.loads((CONFIG/(name+'.json')).read_text(encoding='utf8'))[5][0][2]
level=config('level');tower=config('tower');language=config('language');general=config('config')
avatars=level['AvatarConf']; heroes=language['HeroConf']; skins=general['SkinConf']
words={k:v['chinese'] for group in language['LanguageConf'].values() for k,v in group.items()}
def word(key):return words.get(key,key)
def metadata(value,name):
 if not isinstance(value,list) or len(value)<6:return None
 classes,masks,instances=value[3:6]
 for row in instances:
  if not isinstance(row,list) or not row or not isinstance(row[0],int):continue
  mask=masks[row[0]];cls=classes[mask[0]]
  if not isinstance(cls,list) or cls[0]!='sp.SkeletonData':continue
  fields={cls[1][field]:row[position] for position,field in enumerate(mask[1:-1],1)}
  if fields.get('_name')==name:return fields
 return None
cache={}
def check_asset(bundle,name,required=()):
 key=bundle+'/'+name
 if key not in cache:
  try:
   meta=tower['SkeletonConf'].get(Path(name).name)
   if not meta:raise ValueError('缺少 SkeletonConf '+key)
   fields=None;src=None
   for origin in SOURCES:
    for f in (origin/bundle/'import').glob(name+'*.json'):
     fields=metadata(json.loads(f.read_text(encoding='utf8')),Path(name).name)
     if fields:src=f;break
    if fields:break
   if not fields or not fields.get('_atlasText'):raise ValueError('缺少骨骼图集元数据 '+key)
   if not fields.get('_skeletonJson') and not source_file(bundle+'/native/'+name+'.bin'):raise ValueError('缺少骨骼文件 '+key)
   textures=re.findall(r'^([^\s]+\.png)\r?$',fields['_atlasText'],re.M)
   if not textures:raise ValueError('图集没有纹理 '+key)
   for tex in textures:
    if not source_file(str(Path(bundle)/'native'/Path(name).parent/tex)):raise ValueError('缺少纹理 '+key+'/'+tex)
   cache[key]=(meta,fields,src,textures)
  except ValueError as e:cache[key]=str(e)
 result=cache[key]
 if isinstance(result,str):raise ValueError(result)
 names={a['name'] for a in result[0]['animations']}
 if set(required)-names:raise ValueError('缺少动作 '+key+' '+','.join(sorted(set(required)-names)))
 return result
SUPPORTED={'Line','Move','Rush','Parabola','Position','Center'}
def inspect_avatar(row,combat=True,ui=True):
 body=row.get('asset') or row['path'];check_asset(row['path'],body,('idle','attack','skill') if combat else ('idle',))
 if ui:
  for field in ['smallHeadIcon','fullBodyIcon']:
   if not row.get(field) or not source_file('icons/native/'+row[field]+'.png'):raise ValueError('缺少界面图片 '+field+' '+str(row.get(field)))
 if combat:
  for mode in ['attack','skill']:
   ids=row[mode+'Bullets']
   if not ids:raise ValueError('没有原版'+('普攻' if mode=='attack' else '技能')+'弹道')
   if len(ids)!=1:raise ValueError('多段弹道暂不匹配 '+mode)
   b=tower['BulletConf'].get(str(ids[0]))
   if not b:raise ValueError('原版未提供独立弹道配置 '+mode+' #'+str(ids[0]))
   if b['type'] not in SUPPORTED:raise ValueError('复合弹道暂不匹配 '+b['type'])
   fx=tower['EffectConf'].get(str(b['effect']))
   if not fx:raise ValueError('没有独立弹道特效 '+mode)
   check_asset(fx['bundle'],fx['uri'])
   hit=row[mode+'Damage']
   if hit:
    f=tower['EffectConf'].get(str(hit))
    if not f:raise ValueError('命中特效配置缺失 '+str(hit))
    check_asset(f['bundle'],f['uri'])
 return body
def audit():
 accepted=[];excluded=[];all_rows=[]
 for h in heroes.values():
  base=avatars[str(h['avatar'])];good=[]
  for aid in h['skinList']:
   a=avatars.get(str(aid));s=skins.get(str(aid));name=word((s or {}).get('skinName',(a or {}).get('nickName',str(aid))))
   item=dict(heroId=h['id'],heroName=word(h['nickName']),avatarId=aid,path=a and a['path'],name=name)
   try:
    if not a:raise ValueError('AvatarConf 缺失')
    inspect_avatar(a)
    item.update(body=a.get('asset') or a['path'],skin=a['skin'],head=a['smallHeadIcon'],portrait=a['fullBodyIcon'],types=[tower['BulletConf'][str(a[m+'Bullets'][0])]['type'] for m in ['attack','skill']])
    good.append(item)
   except ValueError as e:item['reason']=str(e);excluded.append(item)
   all_rows.append(item)
  if good:accepted.append(dict(id=base['path'],heroId=h['id'],name=word(h['nickName']),faction=h['club'],job=h['work'],attackBorn=h['attackBorn'],defaultAvatarId=good[0]['avatarId'],variants=good))
 monster_rows=[]
 for a in avatars.values():
  icon=a.get('fullBodyIcon','');path=a['path']
  if 'monsters/' not in icon or not any(k in path for k in ['boss','dengshen']):continue
  item=dict(avatarId=a['id'],id=path,name=word(a['nickName']),portrait=icon,skin=a['skin'],body=a.get('asset') or path)
  try:
   inspect_avatar(a,combat=False,ui=False)
   if not source_file('icons/native/'+icon+'.png'):raise ValueError('缺少首领立绘 '+icon)
   item['animations']=[x['name'] for x in tower['SkeletonConf'][Path(item['body']).name]['animations']]
  except ValueError as e:item['reason']=str(e)
  monster_rows.append(item)
 doc=dict(assetVersion='3c7b0bfc39',configVersion='58b91ed6c8',heroes=accepted,excluded=excluded,bosses=monster_rows,sourceHeroCount=len(heroes),sourceVariants=len(all_rows))
 (ROOT/'docs/content-audit.json').write_text(json.dumps(doc,ensure_ascii=False,indent=2),encoding='utf8')
 print('Accepted heroes',len(accepted),'variants',sum(len(h['variants']) for h in accepted),'of',len(all_rows))
 print('Hero list',[(h['name'],h['id'],len(h['variants'])) for h in accepted])
 print('Reasons',Counter(x['reason'].split(' ')[0] for x in excluded))
 print('Types',Counter(t for h in accepted for v in h['variants'] for t in v['types']))
 print('Bosses',len(monster_rows),'accepted',sum('reason' not in x for x in monster_rows))
 print('Boss list',[(x['id'],x['name'],x.get('reason','OK')) for x in monster_rows])
if __name__=='__main__':audit()

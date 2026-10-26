"""Copy original XYZW art; decode UI atlas crops from recorded FairyGUI metadata.
No previous game project is read. Run from any directory with Python + Pillow.
"""
from pathlib import Path
import json, shutil, hashlib
from PIL import Image
from audit_content import source_file

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT.parent
SOURCE = WORK / '远程资源工具/远程资源数据/版本数据/3c7b0bfc39/按原名保存/3c7b0bfc39'
ASSETS = ROOT / 'assets'
records = []
roster = json.loads((ROOT/'tools/asset-roster.json').read_text(encoding='utf8'))

def record(source, dest, extra=None):
    records.append(dict(file=dest.relative_to(ROOT).as_posix(), source=str(source.relative_to(WORK)), sha256=hashlib.sha256(dest.read_bytes()).hexdigest(), **(extra or {})))

def copy(source, name):
    dest = ASSETS / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, dest)
    record(source, dest)

for hero in roster['heroes']:
    look=roster['appearances'][hero][0]
    copy(source_file('icons/native/'+look['sourcePortrait']+'.png'), f'heroes/{hero}.png')
    copy(source_file('icons/native/'+look['sourceHead']+'.png'), f'heads/{hero}.png')
for monster in roster['monsters']:
    copy(source_file(f'icons/native/bodies/monsters/{monster}.png'), f'enemies/{monster}.png')
for toy in ['bingzhenpijiuping','yizhichuanyunjian','zuchuandabing']:
    copy(SOURCE / f'icons/native/weapons/{toy}.png', f'toys/{toy}.png')
copy(SOURCE / 'icons/native/items/xiaohao_zhaomuling.png', 'ui/ticket.png')
for name, bundle in roster['maps']:
    copy(SOURCE / f'{bundle}/native/{bundle}_atlas0.png', f'maps/{name}.png')
chosen = {37:'button-gold',38:'button-green',84:'button-brown',99:'button-blue',77:'coin',82:'star',83:'star-empty',6:'frame-gold',58:'frame-red',49:'faction-qun',50:'faction-shu',51:'faction-wei',52:'faction-wu',25:'close'}
rows = json.loads((ROOT / 'docs/ui-candidates.json').read_text(encoding='utf8'))
for idx,name in chosen.items():
    row=rows[idx]; p=WORK/row['atlas']; s=row['sprite']; x,y,w,h=s['rect']
    im=Image.open(p).convert('RGBA').crop((x,y,x+w,y+h))
    if s['rotated']: im=im.transpose(Image.Transpose.ROTATE_90)
    dest=ASSETS/f'ui/{name}.png'; dest.parent.mkdir(parents=True,exist_ok=True); im.save(dest)
    record(p,dest,dict(package=row['bundle'],item=row['item']['name'],sprite=s))
cfg=WORK/'远程资源工具/远程资源数据/版本数据/58b91ed6c8/关键配置JSON/58b91ed6c8/config.json'
data=json.loads(cfg.read_text(encoding='utf8'))[5][0][2]
(ROOT/'docs/source-values.json').write_text(json.dumps(dict(source=str(cfg.relative_to(WORK)),table='HeroStarSpend',row=data['HeroStarSpend']['1'],usage='使用全部 30 档原版升星碎片消耗；塔防战斗数值为独立设计。'),ensure_ascii=False,indent=2),encoding='utf8')
(ASSETS/'manifest.json').write_text(json.dumps(dict(version='3c7b0bfc39',assets=records),ensure_ascii=False,indent=2),encoding='utf8')
print(f'Prepared {len(records)} original assets; manifest includes original names, atlas coordinates and hashes.')

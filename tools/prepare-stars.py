"""Extract the official ui_common/Star images and freeze their color-controller mapping."""
from pathlib import Path
import json, hashlib
from PIL import Image
from fgui import parse_package

ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT.parent
SOURCE=WORK/'远程资源工具/远程资源数据/版本数据/3c7b0bfc39/按原名保存/3c7b0bfc39/ui_common/native'
package=parse_package(SOURCE/'ui_common.bin','3c7b0bfc39')
names=[('empty','未升星','xingxing_kong'),('gold','黄星','gyzy_icon_jinxing'),('purple','紫星','gyzy_icon_zixing'),('orange','橙星','gyzy_icon_chengxing'),('red','红星','gyzy_icon_hongxing'),('crown','皇冠','xingxing_man'),('purple-crown','紫冠','gyzy_icon_manxingzi')]
records=[];tiers=[]
for index,(key,label,name) in enumerate(names):
 item=next(i for i in package['items'].values() if i['name']==name)
 sprite=package['sprites'][item['id']];atlas=SOURCE/('ui_common_'+sprite['atlas']+'.png')
 x,y,w,h=sprite['rect'];im=Image.open(atlas).convert('RGBA').crop((x,y,x+w,y+h))
 if sprite['rotated']:im=im.transpose(Image.Transpose.ROTATE_90)
 dest=ROOT/f'assets/ui/stars/{key}.png';dest.parent.mkdir(parents=True,exist_ok=True);im.save(dest)
 tiers.append(dict(key=key,label=label,icon=f'ui/stars/{key}',fromStar=0 if index==0 else (index-1)*5+1,toStar=index*5))
 records.append(dict(file=dest.relative_to(ROOT).as_posix(),source=str(atlas.relative_to(WORK)),item=item['name'],sprite=sprite,sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
config=WORK/'远程资源工具/远程资源数据/版本数据/58b91ed6c8/关键配置JSON/58b91ed6c8/config.json'
costs=json.loads(config.read_text(encoding='utf8'))[5][0][2]['HeroStarSpend']['1']['starSpend']
(ROOT/'src/star-data.js').write_text('// Generated from ui_common/Star and HeroStarSpend.\nexport const STAR_TIERS='+json.dumps(tiers,ensure_ascii=False)+';\nexport const STAR_COSTS='+json.dumps(costs)+';\nexport const STAR_CAP=STAR_COSTS.length;\n',encoding='utf8')
proof=dict(component='ui_common/Star',client='wxapkg_dec/355_game_correct/subpackages/game/game.js',rules=['HeroModule.getHeroShowStar: star % 5, zero remainder shows 5; star 0 returns 1','HeroModule.getHeroStarColor: ceil(star / 5), capped at 6','UIHelper.showHeroStar + Star.color controller select the original texture'],controller={'1':'gyzy_icon_jinxing','2':'gyzy_icon_zixing','3':'gyzy_icon_chengxing','4':'gyzy_icon_hongxing','5':'xingxing_man','6':'gyzy_icon_manxingzi'},zeroStar='One original empty-star icon for the unpromoted camp state',files=records)
(ROOT/'assets/ui/stars/manifest.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
print('Prepared',len(tiers),'original star icons; cap',len(costs))

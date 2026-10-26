"""Extract original FairyGUI UI sprites for the landscape HUD and in-game panels."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont
from fgui import parse_package

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / '远程资源工具/远程资源数据/版本数据/3c7b0bfc39/按原名保存/3c7b0bfc39'
SELECTED = {
    'ui_loading': {'en17bf5':'toy-frame', 'iuz0bf8':'toy-progress'},
    'ui_heroBook': {'u0tsb':'book-blue', 'u0tsc':'book-green', 'u0tsd':'book-purple', 'u0tse':'book-orange', 'u0tsf':'book-red', 'u0tsg':'book-gold', 'u0tsl':'book-locked', 'u0tsm':'book-active'},
    'ui_heroList': {'u0ts4':'nav-formation', 'u0ts5':'nav-book', 'u0ts7':'nav-heroes', 'u0tsa':'nav-settings', 'twhdp':'nav-toy'},
    'ui_main': {'ooigbid':'nav-recruit', 'qorjbeb':'round-base', 'qorjbec':'round-progress'},
    'ui_battleScene': {'n9fm6':'battle-red', 'n9fm7':'battle-green', 'n9fm8':'speed-one', 'n9fm9':'speed-two', 'n9fme':'timer-gold', 'n9fmf':'timer-white', 'n9fmh':'timer-glow', 'l412n9n':'battle-bar', 'sh7on5o':'control-base'},
    'ui_levelWeapon': {'c2rtt':'choice-white', 'c2rtu':'choice-red', 'c2rtv':'choice-gold'},
    'ui_common': {'vmy0fs':'paper', '94w3e2':'list-dark', '94w3e3':'list-light', '94w3e4':'panel', 'toni1f':'dark-panel', 'bqteap':'resource-base', 'x8yqdp':'item-base', 'owwk9uwbmw':'clock', 'st219uwbse':'lock', 'rqsq1v6f5dv':'search'},
}
dest = ROOT / 'assets/ui/game'
dest.mkdir(parents=True, exist_ok=True)
records = []
for bundle, selection in SELECTED.items():
    package = parse_package(SOURCE / bundle / 'native' / f'{bundle}.bin', '3c7b0bfc39')
    for item_id, name in selection.items():
        item, sprite = package['items'][item_id], package['sprites'][item_id]
        atlas = SOURCE / bundle / 'native' / (bundle + '_' + package['items'][sprite['atlas']]['file'])
        x, y, w, h = sprite['rect']
        im = Image.open(atlas).convert('RGBA').crop((x,y,x+w,y+h))
        if sprite['rotated']:
            im = im.transpose(Image.Transpose.ROTATE_90)
        restored = Image.new('RGBA', (item['w'],item['h']))
        restored.paste(im, tuple(sprite['offset']))
        output = dest / f'{name}.png'
        restored.save(output)
        records.append(dict(file=output.relative_to(ROOT).as_posix(), source=str(atlas.relative_to(ROOT.parent)), package=bundle, itemId=item_id, item=item['name'], size=[item['w'],item['h']], grid=item.get('grid'), sprite=sprite, sha256=hashlib.sha256(output.read_bytes()).hexdigest()))

(ROOT/'docs/landscape-ui-sources.json').write_text(json.dumps(dict(version='3c7b0bfc39', assets=records, components=['ui_loading/WeaponSkillSlot', 'ui_loading/WeaponSkillProgress', 'ui_heroBook/HeroBookSlot'], adaptation='原版图集切片；网页重排为横屏。原版玩具能量百分比改为本作冷却剩余秒数，蓄满后可释放。'), ensure_ascii=False, indent=2), encoding='utf8')
sheet = Image.new('RGB', (960, ((len(records)+5)//6)*155), '#ccb994')
draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 13)
for i,row in enumerate(records):
    im=Image.open(ROOT/row['file']);im.thumbnail((140,112))
    x=(i%6)*160;y=(i//6)*155
    sheet.paste(im,(x+(160-im.width)//2,y+5),im)
    draw.text((x+7,y+124),Path(row['file']).stem,fill='#332b22',font=font)
sheet.save(ROOT/'docs/landscape-ui-contact.png')
print(f'Extracted {len(records)} original UI sprites.')

"""Restore the original ui_battle bitmap fonts, including glyph spacing and badges."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont
from fgui import parse_package

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / '远程资源工具/远程资源数据/版本数据/3c7b0bfc39/按原名保存/3c7b0bfc39/ui_battle/native'
FONTS = {'normal': 'eh2hba', 'crit': 'aftnb6', 'poison': 'eh2hbb', 'burn': 'eh2hbc', 'heal': 'eh2hb9'}
package = parse_package(SOURCE / 'ui_battle.bin', '3c7b0bfc39')
dest = ROOT / 'assets/ui/damage'
dest.mkdir(parents=True, exist_ok=True)
fonts, records = {}, []
contact = Image.new('RGB', (720, 350), '#344b3c')
labels = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 14)
for row, (style, item_id) in enumerate(FONTS.items()):
    item = package['items'][item_id]
    r = item['raw']
    assert r.seek(0, 0)
    flags = [r.bool() for _ in range(4)]
    assert flags == [False] * 4, 'Only non-tinted image fonts are expected'
    font_size, advance, line_height = r.i32(), r.i32(), r.i32()
    assert r.seek(0, 1)
    glyphs, sources, tiles = {}, [], []
    cursor = 2
    for _ in range(r.i32()):
        length = r.u16()
        end = r.p + length
        char, image_id = chr(r.u16()), r.s()
        bx, by, ox, oy, width, height, step = [r.i32() for _ in range(7)]
        channel = r.u8()
        assert r.p == end
        glyph, sprite = package['items'][image_id], package['sprites'][image_id]
        atlas = SOURCE / ('ui_battle_' + package['items'][sprite['atlas']]['file'])
        x, y, w, h = sprite['rect']
        tile = Image.open(atlas).convert('RGBA').crop((x, y, x + w, y + h))
        if sprite['rotated']:
            tile = tile.transpose(Image.Transpose.ROTATE_90)
        restored = Image.new('RGBA', (glyph['w'], glyph['h']))
        restored.paste(tile, tuple(sprite['offset']))
        glyphs[char] = dict(x=cursor, y=2, width=glyph['w'], height=glyph['h'], offsetX=ox, offsetY=oy, advance=step or advance or glyph['w'])
        tiles.append((cursor, restored))
        sources.append(dict(char=char, itemId=image_id, item=glyph['name'], atlas=str(atlas.relative_to(ROOT.parent)), sprite=sprite))
        cursor += glyph['w'] + 4
    assert set('0123456789+-.we') <= glyphs.keys()
    sheet = Image.new('RGBA', (cursor, max(tile.height for _, tile in tiles) + 4))
    for x, tile in tiles:
        sheet.paste(tile, (x, 2))
    output = dest / f'{style}.png'
    sheet.save(output)
    fonts[style] = dict(atlas=f'ui/damage/{style}', fontSize=font_size, lineHeight=line_height, glyphs=glyphs)
    records.append(dict(file=output.relative_to(ROOT).as_posix(), source=str((SOURCE / 'ui_battle.bin').relative_to(ROOT.parent)), font=item['name'], itemId=item_id, uri='ui://' + package['id'] + item_id, glyphs=sources, sha256=hashlib.sha256(output.read_bytes()).hexdigest()))
    ImageDraw.Draw(contact).text((12, row * 70 + 24), item['name'], font=labels, fill='#ffe9ba')
    x = 150
    for char in ('s' if 's' in glyphs else '+' if style == 'heal' else '') + '1234567890':
        g = glyphs[char]
        tile = sheet.crop((g['x'], g['y'], g['x'] + g['width'], g['y'] + g['height']))
        contact.paste(tile, (x + g['offsetX'], row * 70 + 22 + g['offsetY']), tile)
        x += g['advance']

(ROOT / 'src/damage-font-data.js').write_text('// Generated from original ui_battle bitmap fonts; run tools/prepare-damage-fonts.py.\nexport const DAMAGE_FONTS = ' + json.dumps(fonts, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf8')
(dest / 'manifest.json').write_text(json.dumps(dict(version='3c7b0bfc39', assets=records), ensure_ascii=False, indent=2) + '\n', encoding='utf8')
contact.save(ROOT / 'docs/damage-fonts-contact.png')
print(f'Extracted {len(fonts)} original battle fonts, {sum(len(f["glyphs"]) for f in fonts.values())} glyphs.')

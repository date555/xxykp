# FairyGUI binary parser; format verified against client UIPackage.
# Parser adapted from the local resource editor, no game design/code reused.
import struct
class Reader:

    def __init__(self, data, strings=None, version=0):
        self.data = data
        self.p = 0
        self.strings = strings or []
        self.version = version

    def take(self, n):
        if n < 0 or self.p + n > len(self.data):
            raise ValueError('binary boundary')
        b = self.data[self.p:self.p + n]
        self.p += n
        return b

    def u8(self):
        return self.take(1)[0]

    def bool(self):
        return self.u8() == 1

    def u16(self):
        return struct.unpack('>H', self.take(2))[0]

    def i16(self):
        return struct.unpack('>h', self.take(2))[0]

    def i32(self):
        return struct.unpack('>i', self.take(4))[0]

    def f32(self):
        return struct.unpack('>f', self.take(4))[0]

    def text(self, n=None):
        return self.take(self.u16() if n is None else n).decode('utf-8', errors='replace')

    def s(self):
        i = self.u16()
        return None if i == 65534 else '' if i == 65533 else self.strings[i]

    def block(self):
        return Reader(self.take(self.i32()), self.strings, self.version)

    def seek(self, start, index):
        old = self.p
        self.p = start
        count = self.u8()
        small = self.u8()
        if index >= count:
            self.p = old
            return False
        self.p += index * (2 if small else 4)
        off = self.u16() if small else self.i32()
        if off <= 0:
            self.p = old
            return False
        self.p = start + off
        return True

    def color(self):
        rgb = self.take(4)
        return '#' + rgb[:3].hex()

def parse_package(path, version):
    r = Reader(path.read_bytes())
    if r.take(4) != b'FGUI':
        return None
    r.version = r.i32()
    if r.bool():
        raise ValueError('compressed package unsupported')
    pid = r.text()
    name = r.text()
    r.take(20)
    start = r.p
    r.seek(start, 4)
    r.strings = [r.text() for _ in range(r.i32())]
    if r.seek(start, 5):
        for _ in range(r.i32()):
            i = r.u16()
            n = r.i32()
            r.strings[i] = r.text(n)
    r.seek(start, 1)
    items = {}
    for _ in range(r.i16()):
        n = r.i32()
        end = r.p + n
        t = r.u8()
        id = r.s()
        nm = r.s()
        r.s()
        file = r.s()
        r.bool()
        w = r.i32()
        h = r.i32()
        item = dict(type=t, id=id, name=nm or id, file=file, w=w, h=h)
        if t == 0:
            mode = r.u8()
            if mode == 1:
                item['grid'] = [r.i32() for _ in range(4)]
                r.i32()
            item['tile'] = mode == 2
            r.bool()
        elif t == 3:
            item['objectType'] = r.u8() or 9
            item['raw'] = r.block()
        elif t in [1, 5]:
            if t == 1:
                r.bool()
            item['raw'] = r.block()
        items[id] = item
        r.p = end
    sprites = {}
    if r.seek(start, 2):
        for _ in range(r.i16()):
            n = r.u16()
            end = r.p + n
            id = r.s()
            atlas = r.s()
            rect = [r.i32() for _ in range(4)]
            rotated = r.bool()
            offset = [0, 0]
            size = rect[2:]
            if r.version >= 2 and r.bool():
                offset = [r.i32(), r.i32()]
                size = [r.i32(), r.i32()]
            sprites[id] = dict(atlas=atlas, rect=rect, rotated=rotated, offset=offset, size=size)
            r.p = end
    return dict(id=pid, name=name, items=items, sprites=sprites, path=path, version=version)

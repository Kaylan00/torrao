"""Zoom GRANDE na junção chapéu + cabeça (4 fases lado a lado, ~3x). Saída: tools/debug/zoom_<id>.jpg
Procurar: fresta clara entre a aba e a cabeça, bordinha clara, pedaço de rosto repetido, peça torta.
Uso: python tools/zoom8.py [ids]
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arte8 as A
from PIL import Image

ROOT = A.ROOT
meta = json.loads(re.search(r'CF\.ROUPA8 = (\{.*\});', open(os.path.join(ROOT, 'src', 'roupa8_meta.js'), encoding='utf-8').read(), re.S).group(1))
anc = A.ancoras()
ids = sys.argv[1].split(',') if len(sys.argv) > 1 else sorted(meta)
for pid in ids:
    cels = []
    for f in range(1, 5):
        c = A.celula(f, 0); cw, ch = c.size
        r8 = meta[pid].get(str(f))
        t = Image.new('RGBA', (cw, ch + 150), (120, 170, 200, 255)); t.alpha_composite(c, (0, 150))
        if r8:
            p = Image.open(os.path.join(A.DST, '%s_%d.png' % (pid, f))).convert('RGBA')
            w = round(r8[2] * cw); p = p.resize((w, round(p.height * w / p.width)), Image.LANCZOS)
            t.alpha_composite(p, (round(r8[0] * cw), round(r8[1] * ch) + 150))
        ex, ey, topo, e, d, _ = anc[str(f)][0]
        hw = (d - e) * cw
        box = (int(e * cw - hw * 0.35), int(topo * ch + 150 - hw * 0.55), int(d * cw + hw * 0.35), int(ey * ch + 150 + hw * 0.15))
        t = t.crop(box)
        t = t.resize((480, round(480 * t.height / t.width)), Image.LANCZOS)
        cels.append(t.convert('RGB'))
    H = max(x.height for x in cels)
    out = Image.new('RGB', (480 * 4 + 30, H), (30, 30, 30))
    for k, x in enumerate(cels):
        out.paste(x, (k * 490, 0))
    out.save(os.path.join(ROOT, 'tools', 'debug', 'zoom_%s.jpg' % pid), quality=90)
print('ok', len(ids))

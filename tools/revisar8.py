"""Revisão ampliada dos chapéus: cada fileira = um chapéu nas 4 fases, cabeça grande. Saída: tools/debug/cabecas_<n>.jpg
Olhar SEMPRE essas imagens (não a miniatura) antes de dizer que um chapéu está bom. Uso: python tools/revisar8.py
"""
import json, re, sys
sys.path.insert(0, 'tools')
import arte8 as A
from PIL import Image, ImageDraw
meta = json.loads(re.search(r'CF\.ROUPA8 = (\{.*\});', open('src/roupa8_meta.js', encoding='utf-8').read(), re.S).group(1))
anc = A.ancoras()
ids = sorted(meta)
for g in range(0, len(ids), 8):
    grupo = ids[g:g + 8]
    cels = []
    for pid in grupo:
        linha = []
        for f in range(1, 5):
            c = A.celula(f, 0); cw, ch = c.size
            r8 = meta[pid].get(str(f))
            t = Image.new('RGBA', (cw, ch + 120), (120, 170, 200, 255)); t.alpha_composite(c, (0, 120))
            if r8:
                p = Image.open('assets/roupa8/%s_%d.png' % (pid, f)).convert('RGBA')
                w = round(r8[2] * cw); p = p.resize((w, round(p.height * w / p.width)), Image.LANCZOS)
                t.alpha_composite(p, (round(r8[0] * cw), round(r8[1] * ch) + 120))
            ex, ey, topo, e, d, _ = anc[str(f)][0]
            hw = (d - e) * cw
            box = (int(e * cw - hw * 0.5), int(topo * ch + 120 - hw * 0.9), int(d * cw + hw * 0.5), int(ey * ch + 120 + hw * 0.35))
            t = t.crop(box).resize((260, round(260 * (box[3] - box[1]) / (box[2] - box[0]))), Image.LANCZOS)
            linha.append(t.convert('RGB'))
        H = max(x.height for x in linha)
        L = Image.new('RGB', (260 * 4 + 120, H), (40, 40, 40))
        ImageDraw.Draw(L).text((6, 6), pid, fill=(255, 255, 255))
        for k, x in enumerate(linha):
            L.paste(x, (120 + k * 260, 0))
        cels.append(L)
    out = Image.new('RGB', (cels[0].width, sum(c.height for c in cels)))
    y = 0
    for c in cels:
        out.paste(c, (0, y)); y += c.height
    out.save('tools/debug/cabecas_%d.jpg' % (g // 8), quality=85); print(out.size)

"""Corta o Torrão "sem planta na cabeça" (tools/art_src/v6_careca<fase>.png) do mesmo jeito das folhas normais
e mede olhos e cabeça de cada quadro. Saída: assets/pet/anim<fase>_careca.png e src/careca_meta.js
(CF.PET_META_CARECA e CF.ANCORAS_CARECA). Uso: python tools/fatiar6.py
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fatiar import pecas, SRC, DST, ROOT
from fatiar2 import centro_pe
import fatiar3
import cv2


def mascara(cel):
    """1 onde é cabeça/corpo (opaco, sem folha verde, flor branca nem laranja), 0 no resto."""
    a = np.array(cel).astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    m = al >= 160
    m &= ~((g > r * 0.98) & (g > b))
    m &= ~((r > 228) & (g > 228) & (b > 215))
    m &= ~((r > 205) & (g > 70) & (g < 160) & (b < 80))
    return m.astype(np.float32)


def ancoras_careca(caminho, fase):
    """Sem planta, a cabeça é a mesma em todas as poses: mede bem no quadro parado (0) e acha essa
    mesma cabeça nos outros 15 quadros por encaixe de forma (funciona com olho fechado e braço pra cima)."""
    s = Image.open(caminho).convert('RGBA')
    cw, ch = s.width // 4, s.height // 4
    cels = [s.crop(((k % 4) * cw, (k // 4) * ch, (k % 4 + 1) * cw, (k // 4 + 1) * ch)) for k in range(16)]
    mas = [mascara(c) for c in cels]
    # quadro de referência
    ex0, ey0, _, ang0 = fatiar3.olhos(cels[0])
    ex0, ey0 = ex0 * cw, ey0 * ch
    m0 = mas[0]
    faixa = [int(ex0 + d * cw) for d in np.linspace(-0.08, 0.02, 6)]
    topo0 = float(np.median([np.argmax(m0[:int(ey0), x] > 0) for x in faixa]))
    # largura: a maior parte marrom contínua (passando pelo olho) entre o alto da cabeça e os olhos
    larg = []
    for f in np.linspace(0.45, 0.85, 5):
        y = int(topo0 + (ey0 - topo0) * f)
        lin = m0[y]
        x1 = x2 = int(ex0)
        while x1 > 0 and (lin[x1 - 1] or lin[max(0, x1 - 4):x1].any()):
            x1 -= 1
        while x2 < cw - 1 and (lin[x2 + 1] or lin[x2 + 1:x2 + 5].any()):
            x2 += 1
        larg.append((x1, x2))
    esq0 = float(np.median([l[0] for l in larg])); dir0 = float(np.median([l[1] for l in larg]))
    # molde: a cúpula da cabeça (do alto até os olhos) com um pouco de vazio em cima
    pad = int(ch * 0.04)
    y0, y1 = int(max(0, topo0 - pad)), int(ey0)
    x0, x1 = int(esq0), int(dir0)
    molde = m0[y0:y1, x0:x1]
    meta = []
    for k in range(16):
        melhor = None
        for sx in (0.85, 0.92, 1.0, 1.08, 1.15):
            for sy in (0.85, 0.92, 1.0, 1.08, 1.15):
                mo = cv2.resize(molde, (max(4, int(molde.shape[1] * sx)), max(4, int(molde.shape[0] * sy))))
                if mo.shape[0] >= ch or mo.shape[1] >= cw:
                    continue
                r = cv2.matchTemplate(mas[k], mo, cv2.TM_CCOEFF_NORMED)
                _, v, _, (mx, my) = cv2.minMaxLoc(r)
                v -= abs(sx - 1) * 0.15 + abs(sy - 1) * 0.15      # prefere o tamanho normal
                if melhor is None or v > melhor[0]:
                    melhor = (v, mx, my, sx, sy)
        _, mx, my, sx, sy = melhor
        ex = mx + (ex0 - x0) * sx; ey = my + (ey0 - y0) * sy
        topo = my + (topo0 - y0) * sy
        esq = mx + (esq0 - x0) * sx; dir_ = mx + (dir0 - x0) * sx
        ang = 0.0
        o = fatiar3.olhos(cels[k])
        if o and o[2] == 2 and abs(o[0] * cw - ex) < cw * 0.05 and abs(o[1] * ch - ey) < ch * 0.05:
            ang = o[3]
        meta.append([round(ex / cw, 4), round(ey / ch, 4), round(topo / ch, 4), round(esq / cw, 4), round(dir_ / cw, 4), ang])
    return meta


def folha(fase):
    g, modo = pecas(os.path.join(SRC, 'v6_careca%d.png' % fase), 4, 4)
    print('careca%d:' % fase, modo)
    quadros = [g[f][c] for f in range(4) for c in range(4)]
    centros = [centro_pe(q) for q in quadros]
    meia = max(max(cx, q.width - cx) for q, cx in zip(quadros, centros))
    w = int(meia * 2) + 16
    h = max(q.height for q in quadros) + 12
    esc = min(1, 360 / h)
    cw, ch = max(1, round(w * esc)), max(1, round(h * esc))
    out = Image.new('RGBA', (cw * 4, ch * 4), (0, 0, 0, 0))
    for k, (q, cx) in enumerate(zip(quadros, centros)):
        t = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        t.paste(q, (int(round(w / 2 - cx)), h - 4 - q.height), q)
        t = t.resize((cw, ch), Image.LANCZOS)
        out.paste(t, ((k % 4) * cw, (k // 4) * ch), t)
    out.save(os.path.join(DST, 'pet', 'anim%d_careca.png' % fase), optimize=True)
    return round(cw / ch, 4)


def main():
    meta, ancoras = {}, {}
    for fase in range(1, 5):
        if not os.path.exists(os.path.join(SRC, 'v6_careca%d.png' % fase)):
            print('falta v6_careca%d' % fase)
            continue
        meta[fase] = {'ar': folha(fase)}
        ancoras[fase] = ancoras_careca(os.path.join(DST, 'pet', 'anim%d_careca.png' % fase), fase)
    with open(os.path.join(ROOT, 'src', 'careca_meta.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('// Gerado por tools/fatiar6.py: o Torrão sem planta na cabeça (usado quando ele veste chapéu).\n')
        f.write('window.CF = window.CF || {};\n')
        f.write('CF.PET_META_CARECA = %s;\n' % json.dumps(meta))
        f.write('CF.ANCORAS_CARECA = %s;\n' % json.dumps(ancoras))
    print('ok', list(meta))


if __name__ == '__main__':
    main()

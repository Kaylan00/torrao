"""Desenha o Torrão vestido (mesma conta do src/pet.js) pra conferir se as roupas encaixam.
Saída: tools/debug/roupas.jpg (cada fileira = uma fase; colunas = quadros variados com peças diferentes).
Uso: python tools/ver_roupas.py [peca1,peca2,...]
"""
import json, math, os, re, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def le_js(arq, nome):
    t = open(os.path.join(ROOT, 'src', arq), encoding='utf-8').read()
    return json.loads(re.search(r'CF\.%s = (\{.*?\});' % nome, t, re.S).group(1))


def vestir(tela, cw, ch, topo_px, an, cfg, rid, lugar, aj):
    ex, ey, topo, esq, dir_, ang = an
    larg, testa = dir_ - esq, ey - topo
    a = aj.get(rid, {})
    onde = a.get('onde', 'olhos' if lugar == 'rosto' else 'topo')
    if onde == 'topo':
        x, y, w = (esq + dir_) / 2 + cfg['dx'], topo + testa * (cfg['afunda'] + a.get('afunda', 0)), larg * cfg['larg']
    elif onde == 'testa':
        x, y, w = (esq + dir_) / 2 + cfg['dx'], topo + testa * 0.62, larg * cfg['larg'] * 0.95
    elif onde == 'boca':
        x, y, w = ex + cfg['olhoDx'], ey + testa * 0.55, larg * cfg['rosto'] * 0.75
    else:
        x, y, w = ex + cfg['olhoDx'], ey, larg * cfg['rosto']
    w *= a.get('s', 1)
    img = Image.open(os.path.join(ROOT, 'assets', 'roupa', rid + '.png')).convert('RGBA')
    pw = max(1, int(w * cw))
    img = img.resize((pw, max(1, int(img.height * pw / img.width))), Image.LANCZOS)
    # sombrinha embaixo da peça
    sombra = Image.new('RGBA', img.size, (45, 25, 12, 0))
    sombra.putalpha(img.split()[3].point(lambda v: int(v * 0.32)))
    if ang:
        img = img.rotate(-ang, resample=Image.BICUBIC, expand=True)
        sombra = sombra.rotate(-ang, resample=Image.BICUBIC, expand=True)
    px = x * cw - img.width / 2
    py = y * ch + topo_px - (img.height if onde in ('topo',) else img.height / 2)
    tela.alpha_composite(sombra, (int(px), int(py + 3)))
    tela.alpha_composite(img, (int(px), int(py)))


def main():
    an = le_js('roupa_meta.js', 'ANCORAS')
    try:
        anc = le_js('careca_meta.js', 'ANCORAS_CARECA')
    except Exception:
        anc = {}
    vest = le_js('vestir.js', 'VESTIR')
    aj = le_js('vestir.js', 'ROUPA_AJUSTE')
    rosto = {'escuros', 'leitura', 'coracao', 'mergulho', 'bigode'}
    pedidas = sys.argv[1].split(',') if len(sys.argv) > 1 else ['bone', 'palha', 'gorro', 'cartola', 'cowboy', 'fones', 'bandana', 'urso']
    quadros = [0, 2, 5, 6, 9, 13, 0, 2]
    linhas = []
    for fase in range(1, 5):
        s0 = Image.open(os.path.join(ROOT, 'assets', 'pet', 'anim%d.png' % fase)).convert('RGBA')
        sc = os.path.join(ROOT, 'assets', 'pet', 'anim%d_careca.png' % fase)
        s1 = Image.open(sc).convert('RGBA') if (os.path.exists(sc) and str(fase) in anc) else None
        cels = []
        for i, rid in enumerate(pedidas):
            k = quadros[i % len(quadros)]
            chapeu = rid not in rosto and s1 is not None     # com chapéu: Torrão sem planta (igual ao app)
            s = s1 if chapeu else s0
            tab = anc if chapeu else an
            cw, ch = s.width // 4, s.height // 4
            cel = s.crop(((k % 4) * cw, (k // 4) * ch, (k % 4 + 1) * cw, (k // 4 + 1) * ch))
            tela = Image.new('RGBA', (cw, ch + 50), (120, 170, 200, 255))
            tela.alpha_composite(cel, (0, 50))
            ros = 'escuros' if (i % 3 == 1 and rid not in rosto) else None
            if ros:
                vestir(tela, cw, ch, 50, tab[str(fase)][k], vest[str(fase)], ros, 'rosto', aj)
            vestir(tela, cw, ch, 50, tab[str(fase)][k], vest[str(fase)], rid, 'rosto' if rid in rosto else 'cabeca', aj)
            ImageDraw.Draw(tela).text((4, 4), 'f%d q%d %s' % (fase, k, rid), fill=(255, 255, 255))
            cels.append(tela.convert('RGB'))
        L = Image.new('RGB', (sum(c.width for c in cels), max(c.height for c in cels)))
        x = 0
        for c in cels:
            L.paste(c, (x, 0)); x += c.width
        linhas.append(L)
    W = max(l.width for l in linhas)
    out = Image.new('RGB', (W, sum(l.height for l in linhas)))
    y = 0
    for l in linhas:
        out.paste(l, (0, y)); y += l.height
    out.thumbnail((1700, 1700))
    out.save(os.path.join(ROOT, 'tools', 'debug', 'roupas.jpg'), quality=82)
    print('ok', out.size)


if __name__ == '__main__':
    main()

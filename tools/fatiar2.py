"""Corta a arte da versão 2 (tools/art_src/v2_*.png) e monta assets/ + src/pet_meta.js.
- Torrão: 16 quadros por fase numa folha 4x4 de células iguais, alinhados pelo pé (raízes) pra não tremer.
- Céus, ilha principal, nuvens, plantas flutuantes, ilhas do mapa e textura de papel.
Uso: python tools/fatiar2.py
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fatiar import pecas, tela_comum, reduz, salva, SRC, DST, ROOT


def centro_pe(im):
    """Centro horizontal da parte de baixo do desenho (raízes): é o que fica parado entre os quadros."""
    a = np.array(im)[..., 3] > 128
    linhas = np.where(a.any(axis=1))[0]
    if not len(linhas):
        return im.width / 2
    base = a[max(linhas[-1] - int(im.height * 0.18), 0):linhas[-1] + 1]
    cols = np.where(base.any(axis=0))[0]
    return (cols[0] + cols[-1]) / 2


def folha_animacao(fase):
    g, modo = pecas(os.path.join(SRC, 'v2_anim%d.png' % fase), 4, 4)
    print('anim%d:' % fase, modo)
    quadros = [g[f][c] for f in range(4) for c in range(4)]
    centros = [centro_pe(q) for q in quadros]
    # célula: cabe qualquer quadro com o pé centralizado
    meia = max(max(cx, q.width - cx) for q, cx in zip(quadros, centros))
    w = int(meia * 2) + 16
    h = max(q.height for q in quadros) + 12
    celulas = []
    for q, cx in zip(quadros, centros):
        t = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        t.paste(q, (int(round(w / 2 - cx)), h - 4 - q.height), q)
        celulas.append(t)
    # tamanho final: célula com até 360 px de altura
    esc = min(1, 360 / h)
    cw, ch = max(1, round(w * esc)), max(1, round(h * esc))
    folha = Image.new('RGBA', (cw * 4, ch * 4), (0, 0, 0, 0))
    for k, t in enumerate(celulas):
        t = t.resize((cw, ch), Image.LANCZOS)
        folha.paste(t, ((k % 4) * cw, (k // 4) * ch), t)
    os.makedirs(os.path.join(DST, 'pet'), exist_ok=True)
    folha.save(os.path.join(DST, 'pet', 'anim%d.png' % fase), optimize=True)
    for k, nome in ((0, 'tranquilo'), (10, 'comendo'), (12, 'seco')):
        salva(celulas[k].resize((cw, ch), Image.LANCZOS), 'pet', '%d-%s' % (fase, nome))
    return round(cw / ch, 4)


def topo_ilha(im):
    """Fração da altura onde fica o chão de grama da ilha (pra pôr o Torrão em pé ali)."""
    px = np.array(im).astype(int)
    r, g, b, al = px[..., 0], px[..., 1], px[..., 2], px[..., 3]
    verde = (al > 128) & (g > r) & (g > b)
    meio = verde[:, int(im.width * 0.4):int(im.width * 0.6)]
    linhas = np.where(meio.mean(axis=1) > 0.5)[0]
    if not len(linhas):
        return 0.25
    # o pé fica um pouco à frente do meio da grama (vista de cima, o chão vem até a borda da frente)
    return round((linhas[0] + (linhas[-1] - linhas[0]) * 0.62) / im.height, 4)


def main():
    meta = {}
    for fase in range(1, 5):
        meta[fase] = {'ar': folha_animacao(fase)}

    # céus
    os.makedirs(os.path.join(DST, 'ceu'), exist_ok=True)
    for nome in ('dia', 'tarde', 'noite'):
        c = Image.open(os.path.join(SRC, 'v2_ceu_%s.png' % nome)).convert('RGB')
        c = c.resize((900, round(c.height * 900 / c.width)), Image.LANCZOS)
        c.save(os.path.join(DST, 'ceu', nome + '.jpg'), quality=84, optimize=True)

    # ilha principal
    ilha = Image.open(os.path.join(SRC, 'v2_ilha.png')).convert('RGBA')
    a = np.array(ilha); a[..., 3][a[..., 3] < 40] = 0; ilha = Image.fromarray(a)
    ilha = ilha.crop(ilha.getbbox())
    ilha = ilha.resize((760, round(ilha.height * 760 / ilha.width)), Image.LANCZOS)
    ilha.save(os.path.join(DST, 'ilha.png'), optimize=True)
    topo = topo_ilha(ilha)

    # nuvens
    g, modo = pecas(os.path.join(SRC, 'v2_nuvens.png'), 2, 3)
    print('nuvens:', modo)
    k = 1
    for f in range(2):
        for c in range(3):
            im = g[f][c]
            if im.width > 320:
                im = im.resize((320, round(im.height * 320 / im.width)), Image.LANCZOS)
            salva(im, 'nuvem', str(k)); k += 1

    # plantas flutuantes
    g, modo = pecas(os.path.join(SRC, 'v2_horta.png'), 2, 5)
    print('horta:', modo)
    plantas = [g[0][0], g[0][1], g[0][2], g[0][3], g[0][4], g[1][0], g[1][1], g[1][2]]
    nomes = ['semente', 'broto', 'muda', 'arvore', 'frutos', 'broto-murcho', 'muda-murcha', 'arvore-murcha']
    for nome, im in zip(nomes, tela_comum(plantas)):
        salva(reduz(im, 320), 'horta', nome)
    for nome, im in (('fruta', g[1][3]), ('regador', g[1][4])):
        lado = max(im.size) + 8
        t = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
        t.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2), im)
        salva(reduz(t, 160), 'horta', nome)

    # ilhas do mapa
    g, modo = pecas(os.path.join(SRC, 'v2_mapa.png'), 2, 2)
    print('mapa:', modo)
    for nome, im in zip(['comum', 'feito', 'desafio', 'chefao'], [g[0][0], g[0][1], g[1][0], g[1][1]]):
        if im.width > 420:
            im = im.resize((420, round(im.height * 420 / im.width)), Image.LANCZOS)
        salva(im, 'mapa', nome)

    # papel
    p = Image.open(os.path.join(SRC, 'v2_papel.png')).convert('RGB').resize((512, 512), Image.LANCZOS)
    p.save(os.path.join(DST, 'papel.jpg'), quality=82, optimize=True)

    with open(os.path.join(ROOT, 'src', 'pet_meta.js'), 'w', encoding='utf-8') as f:
        f.write('// Gerado por tools/fatiar2.py: proporção das células do Torrão e onde fica o chão da ilha.\n')
        f.write('window.CF = window.CF || {};\n')
        f.write('CF.PET_META = %s;\n' % json.dumps(meta))
        f.write('CF.ILHA_TOPO = %s;\n' % topo)
        f.write('CF.ILHA_AR = %s;\n' % round(ilha.height / ilha.width, 4))
    print('meta', meta, 'topo da ilha', topo)


if __name__ == '__main__':
    main()

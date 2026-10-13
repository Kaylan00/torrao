"""Corta as grades do Codex em imagens separadas e coloca em assets/.
- Torrão: as 3 poses de cada fase vão pra uma tela do mesmo tamanho, com o pé na mesma linha (não pula ao trocar de humor).
- Plantas: todas no mesmo tamanho de tela, com o montinho de terra na mesma linha.
- Ícones: recorte justo, quadrado.
Uso: python tools/fatiar.py
"""
import os
import numpy as np
import cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'art_src')
DST = os.path.join(ROOT, 'assets')


def pecas(caminho, fileiras, colunas):
    """Acha os desenhos da grade e devolve uma matriz [fileira][coluna] de imagens RGBA recortadas."""
    im = Image.open(caminho).convert('RGBA')
    a = np.array(im)
    a[..., 3][a[..., 3] < 40] = 0          # tira resto de sombra quase invisível
    im = Image.fromarray(a)
    alfa = (a[..., 3] > 128).astype(np.uint8)
    # apaga pontinhos soltos (sujeira que o gerador deixa em volta dos desenhos)
    n0, rot0, st0, _ = cv2.connectedComponentsWithStats(alfa, 8)
    sujeira = np.isin(rot0, [i for i in range(1, n0) if st0[i][cv2.CC_STAT_AREA] < alfa.size * 0.0003])
    a[..., 3][sujeira] = 0
    alfa[sujeira] = 0
    # tapa furinhos que o gerador deixa transparentes no meio do desenho (a cor está lá, só o alfa sumiu),
    # só quando a cor do furo é igual à da volta: vão de verdade (entre braço e corpo) tem outra cor e fica aberto
    inv = (1 - alfa).astype(np.uint8)
    nb, rotb, stb, _ = cv2.connectedComponentsWithStats(inv, 4)
    Hh, Ww = alfa.shape
    rgb = a[..., :3].astype(int)
    for i in range(1, nb):
        x, y, w, h, ar = stb[i]
        if x == 0 or y == 0 or x + w >= Ww or y + h >= Hh or ar > alfa.size * 0.0015:
            continue
        furo = rotb == i
        volta = cv2.dilate(furo.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool) & ~furo
        cor_furo = np.median(rgb[furo], axis=0)
        cores_volta = rgb[volta]
        parecidas = (np.abs(cores_volta - cor_furo).max(axis=1) < 50).mean()   # quanto da volta tem a cor do furo
        viva = cor_furo.max() > 120 and cor_furo.max() - cor_furo.min() > 60   # tem cor de desenho escondida ali
        if parecidas > 0.35 or (viva and ar >= 150):
            # pinta o furo com as cores de volta (a cor escondida pode ser outra, ex.: vermelho no meio da laranja)
            y0, y1, x0, x1 = max(y - 8, 0), min(y + h + 8, Hh), max(x - 8, 0), min(x + w + 8, Ww)
            pedaco = np.ascontiguousarray(a[y0:y1, x0:x1, :3])
            m = cv2.dilate(furo[y0:y1, x0:x1].astype(np.uint8), np.ones((7, 7), np.uint8))   # pega a borda meio transparente também
            a[y0:y1, x0:x1, :3] = cv2.inpaint(pedaco, np.ascontiguousarray(m * 255), 5, cv2.INPAINT_TELEA)
            a[y0:y1, x0:x1, 3][m > 0] = 255
            a[..., 3][furo] = 255
            alfa[furo] = 1
    im = Image.fromarray(a)

    # 1) pedaços (com pouca dilatação pra não grudar desenhos vizinhos)
    for dil in (9, 5, 3, 1):
        junta = cv2.dilate(alfa, np.ones((dil, dil), np.uint8))
        n, rot, stats, cent = cv2.connectedComponentsWithStats(junta, 8)
        idx = sorted(range(1, n), key=lambda i: -stats[i][cv2.CC_STAT_AREA])
        if len(idx) >= fileiras * colunas:
            break
    total = fileiras * colunas
    if len(idx) >= total:
        # 2) os N maiores pedaços são os desenhos; o resto (folha solta, flor, laranja) vai pro desenho mais perto
        donos = idx[:total]
        grupos = {i: [i] for i in donos}
        for j in idx[total:]:
            cx, cy = cent[j]
            def dist(i):
                x, y, w, h = stats[i][:4]
                dx = max(x - cx, 0, cx - (x + w)); dy = max(y - cy, 0, cy - (y + h))
                return dx * dx + dy * dy
            grupos[min(donos, key=dist)].append(j)
        # 3) ordem da grade: fileiras pelo centro em y, colunas pelo centro em x
        ordem = sorted(donos, key=lambda i: cent[i][1])
        out = []
        for f in range(fileiras):
            linha = sorted(ordem[f * colunas:(f + 1) * colunas], key=lambda i: cent[i][0])
            o = []
            for i in linha:
                masc = np.isin(rot, grupos[i]) & (alfa > 0)
                b = a.copy()
                b[..., 3][~masc] = 0
                pedaco = Image.fromarray(b)
                o.append(pedaco.crop(pedaco.getbbox()))
            out.append(o)
        return out, 'formas (%d pedacos, dilatacao %d)' % (len(idx), dil)

    area_min = alfa.size * 0.002
    comps = [(stats[i], cent[i]) for i in range(1, n) if stats[i][cv2.CC_STAT_AREA] > area_min]
    if len(comps) == fileiras * colunas:
        comps.sort(key=lambda c: c[1][1])
        grade = []
        for f in range(fileiras):
            linha = sorted(comps[f * colunas:(f + 1) * colunas], key=lambda c: c[1][0])
            grade.append(linha)
        out = []
        for linha in grade:
            o = []
            for st, _ in linha:
                x, y, w, h = st[0], st[1], st[2], st[3]
                pedaco = im.crop((x, y, x + w, y + h))
                o.append(pedaco.crop(pedaco.getbbox()))
            out.append(o)
        return out, 'componentes'

    # reserva: desenhos encostados. Corta a grade nas "costuras" com menos desenho perto de cada divisão esperada.
    def costuras(perfil, n):
        tam = len(perfil)
        cortes = [0]
        for k in range(1, n):
            alvo = k * tam // n
            j = max(int(tam * 0.12), 1)
            ini, fim = max(alvo - j, 1), min(alvo + j, tam - 1)
            cortes.append(ini + int(np.argmin(perfil[ini:fim])))
        cortes.append(tam)
        return cortes

    bx = alfa.any(axis=0).nonzero()[0]; by = alfa.any(axis=1).nonzero()[0]
    x0, x1, y0, y1 = bx[0], bx[-1] + 1, by[0], by[-1] + 1
    area = alfa[y0:y1, x0:x1]
    cy = costuras(area.sum(axis=1), fileiras)
    out = []
    for f in range(fileiras):
        faixa = area[cy[f]:cy[f + 1]]
        cx = costuras(faixa.sum(axis=0), colunas)
        o = []
        for c in range(colunas):
            cel = im.crop((x0 + cx[c], y0 + cy[f], x0 + cx[c + 1], y0 + cy[f + 1]))
            # só o maior pedaço da célula e o que estiver perto dele (tira pontas do vizinho)
            ca = (np.array(cel)[..., 3] > 128).astype(np.uint8)
            n2, rot2, st2, _ = cv2.connectedComponentsWithStats(cv2.dilate(ca, np.ones((9, 9), np.uint8)), 8)
            if n2 > 1:
                maior = 1 + int(np.argmax(st2[1:, cv2.CC_STAT_AREA]))
                b = np.array(cel); b[..., 3][rot2 != maior] = 0
                cel = Image.fromarray(b)
            o.append(cel.crop(cel.getbbox()))
        out.append(o)
    return out, 'costuras (achou %d desenhos)' % len(comps)


def tela_comum(imgs, margem=8):
    """Coloca as imagens numa tela do mesmo tamanho, centradas e com a base na mesma linha."""
    w = max(i.width for i in imgs) + margem * 2
    h = max(i.height for i in imgs) + margem * 2
    out = []
    for i in imgs:
        t = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        t.paste(i, ((w - i.width) // 2, h - margem - i.height), i)
        out.append(t)
    return out


def reduz(im, alt_max):
    if im.height <= alt_max:
        return im
    return im.resize((round(im.width * alt_max / im.height), alt_max), Image.LANCZOS)


def salva(im, pasta, nome):
    os.makedirs(os.path.join(DST, pasta), exist_ok=True)
    im.save(os.path.join(DST, pasta, nome + '.png'), optimize=True)


def main():
    # Torrão: 4 fases (colunas) x 3 humores (fileiras)
    g, modo = pecas(os.path.join(SRC, 'r_torrao.png'), 3, 4)
    print('torrao:', modo)
    humores = ['tranquilo', 'comendo', 'seco']
    for col in range(4):
        imgs = tela_comum([g[f][col] for f in range(3)])
        for f, im in enumerate(imgs):
            salva(reduz(im, 520), 'pet', '%d-%s' % (col + 1, humores[f]))

    # Horta: 5 x 2
    g, modo = pecas(os.path.join(SRC, 'r_horta.png'), 2, 5)
    print('horta:', modo)
    plantas = [g[0][0], g[0][1], g[0][2], g[0][3], g[0][4], g[1][0], g[1][1], g[1][2]]
    nomes = ['semente', 'broto', 'muda', 'arvore', 'frutos', 'broto-murcho', 'muda-murcha', 'arvore-murcha']
    for nome, im in zip(nomes, tela_comum(plantas)):
        salva(reduz(im, 300), 'horta', nome)
    for nome, im in (('fruta', g[1][3]), ('regador', g[1][4])):
        lado = max(im.size) + 8
        t = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
        t.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2), im)
        salva(reduz(t, 160), 'horta', nome)

    # Ícones: 4 x 3
    g, modo = pecas(os.path.join(SRC, 'r_icones.png'), 3, 4)
    print('icones:', modo)
    nomes = ['gota', 'estrela', 'chama', 'video', 'fone', 'fala', 'mic', 'cerebro', 'carta', 'cadeado', 'check', 'trofeu']
    k = 0
    for f in range(3):
        for c in range(4):
            im = g[f][c]
            lado = max(im.size) + 6
            t = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
            t.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2), im)
            salva(reduz(t, 128), 'ic', nomes[k])
            k += 1

    # Fundo
    fundo = Image.open(os.path.join(SRC, 'r_fundo.png')).convert('RGB')
    fundo = fundo.resize((900, round(fundo.height * 900 / fundo.width)), Image.LANCZOS)
    fundo.save(os.path.join(DST, 'fundo.jpg'), quality=86, optimize=True)
    print('ok')


if __name__ == '__main__':
    main()

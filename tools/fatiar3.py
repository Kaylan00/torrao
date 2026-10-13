"""Corta a arte da versão 3 e acha onde ficam os olhos do Torrão em cada quadro (pra vestir chapéu e óculos).
Saída: assets/mundo/<mar|picos>/{fundo.jpg, comum, feito, desafio, chefao}.png, assets/roupa/<id>.png
e src/roupa_meta.js (CF.ANCORAS: centro dos olhos de cada quadro, em fração da célula).
Uso: python tools/fatiar3.py   (pula o que ainda não foi desenhado)
"""
import json, os, sys
import numpy as np
import cv2
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fatiar import pecas, salva, SRC, DST, ROOT


def mundo(nome):
    f = os.path.join(SRC, 'v3_%s_fundo.png' % nome)
    i = os.path.join(SRC, 'v3_%s_ilhas.png' % nome)
    pasta = os.path.join(DST, 'mundo', nome)
    os.makedirs(pasta, exist_ok=True)
    if os.path.exists(f):
        c = Image.open(f).convert('RGB')
        c = c.resize((900, round(c.height * 900 / c.width)), Image.LANCZOS)
        c.save(os.path.join(pasta, 'fundo.jpg'), quality=84, optimize=True)
        print(nome, 'fundo ok')
    if os.path.exists(i):
        g, modo = pecas(i, 2, 2)
        print(nome, 'ilhas:', modo)
        for n, im in zip(['comum', 'feito', 'desafio', 'chefao'], [g[0][0], g[0][1], g[1][0], g[1][1]]):
            if im.width > 420:
                im = im.resize((420, round(im.height * 420 / im.width)), Image.LANCZOS)
            salva(im, os.path.join('mundo', nome), n)


def roupas():
    f = os.path.join(SRC, 'v3_acessorios.png')
    if not os.path.exists(f):
        return
    g, modo = pecas(f, 3, 3)
    print('roupas:', modo)
    ids = ['bone', 'palha', 'gorro', 'coroa', 'cartola', 'explorador', 'escuros', 'leitura', 'flores']
    k = 0
    for fl in range(3):
        for c in range(3):
            im = g[fl][c]
            if im.width > 300:
                im = im.resize((300, round(im.height * 300 / im.width)), Image.LANCZOS)
            salva(im, 'roupa', ids[k]); k += 1


def olhos(cel):
    """Centro dos olhos num quadro: os 2 pedacinhos escuros mais altos do rosto."""
    a = np.array(cel)
    rgb = a[..., :3].astype(int)
    escuro = ((rgb.max(axis=2) < 60) & (a[..., 3] > 200)).astype(np.uint8)
    n, rot, st, cen = cv2.connectedComponentsWithStats(escuro, 8)
    H, W = escuro.shape
    cand = []
    for i in range(1, n):
        x, y, w, h, ar = st[i]
        if not (8 <= ar <= W * H * 0.006) or cen[i][1] > H * 0.75:
            continue
        if cen[i][0] < W * 0.45:          # ele olha pra direita: os olhos ficam na metade direita (a esquerda é planta)
            continue
        if max(w, h) > W * 0.12:          # olho é pequeno
            continue
        # o que tem em volta tem que ser rosto (marrom: vermelho > verde > azul), não folha nem fruta
        blob = (rot == i).astype(np.uint8)
        volta = cv2.dilate(blob, np.ones((9, 9), np.uint8)).astype(bool) & ~blob.astype(bool) & (a[..., 3] > 200)
        if volta.sum() < 10:
            continue
        r, g, b = rgb[volta].mean(axis=0)
        if not (r > g * 1.03 and g > b * 1.02 and r > 95):
            continue
        cand.append((cen[i][1], cen[i][0], ar))
    if not cand:
        return None
    cand.sort()
    top = cand[:2]
    if len(top) == 2 and abs(top[0][0] - top[1][0]) > H * 0.08:
        top = top[:1]          # o segundo é boca ou outra coisa: fica só com o olho mais alto
    y = sum(t[0] for t in top) / len(top)
    x = sum(t[1] for t in top) / len(top)
    ang = 0.0
    if len(top) == 2:
        (y1, x1, _), (y2, x2, _) = sorted(top, key=lambda t: t[1])
        ang = float(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
        ang = max(-20.0, min(20.0, ang))
    return [round(x / W, 4), round(y / H, 4), len(top), round(ang, 1)]


def olhos_par(cel):
    """Pose sentada (seco): procura um PAR de pontinhos escuros do mesmo tamanho, lado a lado, na metade direita."""
    a = np.array(cel)
    rgb = a[..., :3].astype(int)
    escuro = ((rgb.max(axis=2) < 60) & (a[..., 3] > 200)).astype(np.uint8)
    n, rot, st, cen = cv2.connectedComponentsWithStats(escuro, 8)
    H, W = escuro.shape
    bl = [(cen[i][0], cen[i][1], st[i][cv2.CC_STAT_AREA]) for i in range(1, n)
          if 20 <= st[i][cv2.CC_STAT_AREA] <= 700 and cen[i][0] > W * 0.45 and H * 0.3 < cen[i][1] < H * 0.82]
    melhor = None
    for i in range(len(bl)):
        for j in range(i + 1, len(bl)):
            (x1, y1, a1), (x2, y2, a2) = bl[i], bl[j]
            if abs(y1 - y2) < H * 0.05 and W * 0.05 < abs(x1 - x2) < W * 0.2 and 0.5 < a1 / a2 < 2:
                nota = abs(y1 - y2) + abs(a1 - a2) / 50
                if melhor is None or nota < melhor[0]:
                    melhor = (nota, (x1 + x2) / 2, (y1 + y2) / 2, float(np.degrees(np.arctan2((y2 - y1) if x2 > x1 else (y1 - y2), abs(x2 - x1)))))
    if not melhor:
        return None
    return [round(melhor[1] / W, 4), round(melhor[2] / H, 4), 2, round(max(-20, min(20, melhor[3])), 1)]


def e_cabeca(px):
    """Pixel que faz parte da cabeça: opaco e não é folha (verde), flor branca nem laranja."""
    r, g, b, a = [int(v) for v in px]
    if a < 160:
        return False
    if g > r * 0.98 and g > b:            # verde (folha, musgo, arbusto)
        return False
    if r > 228 and g > 228 and b > 215:   # flor branca
        return False
    if r > 205 and 70 < g < 160 and b < 80:  # laranja (fruta)
        return False
    return True


def cabeca(cel, ex, ey, fase=1):
    """Alto da cabeça (subindo dos olhos até sair dela) e largura da cabeça no meio da testa, em pixels."""
    a = np.array(cel)
    H, W = a.shape[:2]
    tops = []
    for dx in np.linspace(-0.09, 0.03, 7):
        x = int(min(W - 1, max(0, ex + dx * W)))
        y = int(ey)
        while y > 0 and e_cabeca(a[y - 1, x]):
            y -= 1
        tops.append(y)
    topo = float(np.median(tops))
    # largura: anda pros lados; mancha pequena de musgo (até 12% da largura) é pulada,
    # verde grande (arbusto atrás da cabeça) ou transparente param a medida
    pulo = int(W * 0.12) if fase <= 2 else 0   # musgo só fica na cabeça nas fases 1 e 2

    def anda(x, passo, y):
        while 0 < x < W - 1:
            if e_cabeca(a[y, x + passo]):
                x += passo
                continue
            achou = None
            for g in range(2, max(pulo, 2)):
                xx = x + passo * g
                if not (0 <= xx < W) or a[y, xx][3] < 160:
                    break
                if e_cabeca(a[y, xx]):
                    achou = xx
                    break
            if achou is None:
                break
            x = achou
        return x

    medidas = []
    for f in (0.35, 0.5, 0.65):
        y = int(topo + (ey - topo) * f)
        medidas.append((anda(int(ex), -1, y), anda(int(ex), 1, y)))
    xe = int(np.median([m[0] for m in medidas]))
    xd = int(np.median([m[1] for m in medidas]))
    return topo, xe, xd


def ancoras():
    return {fase: ancoras_de(os.path.join(DST, 'pet', 'anim%d.png' % fase), fase) for fase in range(1, 5)}


def ancoras_de(caminho, fase):
    """Olhos, alto e largura da cabeça e inclinação de cada um dos 16 quadros de uma folha."""
    if True:
        s = Image.open(caminho).convert('RGBA')
        cw, ch = s.width // 4, s.height // 4
        lista = []
        for k in range(16):
            cel = s.crop(((k % 4) * cw, (k // 4) * ch, (k % 4 + 1) * cw, (k // 4 + 1) * ch))
            lista.append((olhos_par(cel) or olhos(cel)) if k >= 12 else olhos(cel))   # 12-15 = sentado (seco)
        # ponto que foge muito dos outros da mesma fileira (folha, laranja, flor) vira a mediana da fileira;
        # fileira sem nenhum ponto bom usa a mediana da fase
        validos = [v for v in lista if v]
        mx = float(np.median([v[0] for v in validos])); my = float(np.median([v[1] for v in validos]))
        for f in range(4):
            linha = [lista[f * 4 + c] for c in range(4)]
            bons = [v for v in linha if v and abs(v[0] - mx) < 0.18 and abs(v[1] - my) < 0.45]
            if bons:
                lx = float(np.median([v[0] for v in bons])); ly = float(np.median([v[1] for v in bons]))
            else:
                lx, ly = mx, my
            for c in range(4):
                v = linha[c]
                if not v or abs(v[0] - lx) > 0.08 or abs(v[1] - ly) > 0.08:
                    lista[f * 4 + c] = [round(lx, 4), round(ly, 4), 0, 0.0]
        # alto e largura da cabeça em cada quadro: é onde o chapéu encaixa
        meta = []
        for k in range(16):
            cel = s.crop(((k % 4) * cw, (k // 4) * ch, (k % 4 + 1) * cw, (k // 4 + 1) * ch))
            ex, ey = lista[k][0] * cw, lista[k][1] * ch
            topo, xe, xd = cabeca(cel, ex, ey, fase)
            ang = lista[k][3] if len(lista[k]) > 3 else 0.0
            meta.append([lista[k][0], lista[k][1], round(topo / ch, 4), round(xe / cw, 4), round(xd / cw, 4), ang])
        # a cabeça não muda de tamanho entre as poses: se um quadro fugir muito da pose parada
        # (folha seca amarela ou mão na frente atrapalharam a medida), usa o tamanho da pose parada
        idle = meta[0:4]
        testa0 = float(np.median([m[1] - m[2] for m in idle]))
        larg0 = float(np.median([m[4] - m[3] for m in idle]))
        cent0 = float(np.median([(m[3] + m[4]) / 2 - m[0] for m in idle]))   # meio da cabeça em relação aos olhos
        for m in meta:
            if abs((m[1] - m[2]) - testa0) > testa0 * 0.25:
                m[2] = round(m[1] - testa0, 4)
            if abs((m[4] - m[3]) - larg0) > larg0 * 0.2:
                c = m[0] + cent0
                m[3], m[4] = round(c - larg0 / 2, 4), round(c + larg0 / 2, 4)
        # cabeça que deu muito diferente da mediana da fileira (folha atrapalhou) vira a mediana
        for f in range(4):
            fil = meta[f * 4:(f + 1) * 4]
            mt = float(np.median([m[1] - m[2] for m in fil])); mw = float(np.median([m[4] - m[3] for m in fil]))
            for m in fil:
                if abs((m[1] - m[2]) - mt) > 0.06:
                    m[2] = round(m[1] - mt, 4)
                if abs((m[4] - m[3]) - mw) > 0.08:
                    c = (m[3] + m[4]) / 2
                    m[3], m[4] = round(c - mw / 2, 4), round(c + mw / 2, 4)
        return meta


def main():
    for nome in ('mar', 'picos'):
        mundo(nome)
    roupas()
    an = ancoras()
    with open(os.path.join(ROOT, 'src', 'roupa_meta.js'), 'w', encoding='utf-8') as f:
        f.write('// Gerado por tools/fatiar3.py: centro dos olhos do Torrão em cada quadro (fração da célula), pra vestir as roupas.\n')
        f.write('window.CF = window.CF || {};\n')
        f.write('CF.ANCORAS = %s;\n' % json.dumps(an))
    print('ancoras ok')


if __name__ == '__main__':
    main()

"""Tira só a peça de roupa de uma imagem "personagem vestindo a peça" (tools/art_src/p7_v_<id>.png),
comparando com o personagem sem roupa (tools/art_src/p7_base.png).
1) alinha a imagem vestida com a base pelo corpo (do pescoço pra baixo, onde a peça não mexe)
2) peça = o que aparece fora do corpo da base + o que mudou muito de cor dentro da cabeça
3) salva a peça já no lugar certo da base: assets/p7/<id>.png (recortada) e src/p7_meta.js (posição)
Saída extra pra conferir: tools/debug/p7_<id>.jpg (base | vestida | base + peça recortada)
Uso: python tools/recortar7.py [id1,id2,...]
"""
import glob, json, os, sys
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'art_src')
DST = os.path.join(ROOT, 'assets', 'p7')
DBG = os.path.join(ROOT, 'tools', 'debug')


def carrega(p):
    return np.array(Image.open(p).convert('RGBA'))


def pescoco(alfa):
    """Linha do pescoço: a parte mais estreita da silhueta entre 35% e 65% da altura (cabeça larga em cima, corpo embaixo)."""
    ys = np.where(alfa.any(axis=1))[0]
    y0, y1 = ys[0], ys[-1]
    h = y1 - y0
    melhor, yn = None, None
    for y in range(int(y0 + h * 0.35), int(y0 + h * 0.65)):
        xs = np.where(alfa[y])[0]
        if len(xs) == 0:
            continue
        w = xs[-1] - xs[0]
        if melhor is None or w < melhor:
            melhor, yn = w, y
    return yn


def alinha(base, vest, yn):
    """Matriz que leva a imagem vestida pro lugar da base, usando só o corpo (abaixo do pescoço)."""
    def prep(a):
        g = cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
        g = g * (a[..., 3] > 128)
        return cv2.GaussianBlur(g, (0, 0), 3)
    gb, gv = prep(base), prep(vest)
    mask = np.zeros(gb.shape, np.uint8)
    mask[yn + 10:] = 255
    # chute inicial pelas caixas do corpo
    def caixa(a):
        m = a[..., 3] > 128
        m[:yn + 10] = False
        ys, xs = np.where(m)
        return xs.min(), xs.max(), ys.min(), ys.max()
    bx0, bx1, by0, by1 = caixa(base)
    vx0, vx1, vy0, vy1 = caixa(vest)
    s = ((bx1 - bx0) / max(1, vx1 - vx0) + (by1 - yn) / max(1, vy1 - yn)) / 2
    W = np.array([[s, 0, bx0 - vx0 * s], [0, s, by1 - vy1 * s]], np.float32)
    try:
        _, W2 = cv2.findTransformECC(gb, cv2.warpAffine(gv, W, gb.shape[::-1]), np.eye(2, 3, dtype=np.float32),
                                     cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), mask, 5)
    except cv2.error:
        W2 = np.eye(2, 3, dtype=np.float32)
    return W, W2


def recorta(pid):
    base = carrega(os.path.join(SRC, 'p7_base.png'))
    vest = carrega(os.path.join(SRC, 'p7_v_%s.png' % pid))
    if vest.shape != base.shape:
        vest = np.array(Image.fromarray(vest).resize(base.shape[1::-1], Image.LANCZOS))
    ab = base[..., 3] > 128
    yn = pescoco(ab)
    W, W2 = alinha(base, vest, yn)
    H, Wd = ab.shape
    v1 = cv2.warpAffine(vest, W, (Wd, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    v = cv2.warpAffine(v1, W2, (Wd, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderValue=(0, 0, 0, 0))
    av = v[..., 3] > 128
    # diferença de cor (Lab, com um pouco de desfoque pra textura de papel não contar)
    lb = cv2.cvtColor(cv2.GaussianBlur(base[..., :3], (0, 0), 2), cv2.COLOR_RGB2LAB).astype(np.float32)
    lv = cv2.cvtColor(cv2.GaussianBlur(v[..., :3], (0, 0), 2), cv2.COLOR_RGB2LAB).astype(np.float32)
    dif = np.linalg.norm(lb - lv, axis=2)
    fora = av & ~cv2.dilate(ab.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    dentro = av & ab & (dif > 30)
    m = (fora | dentro).astype(np.uint8)
    m[yn:] = 0      # peça de cabeça: só do pescoço pra cima
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    # fica com as manchas grandes (a peça), joga fora sujeirinhas do alinhamento
    n, rot, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:
        maior = st[1:, cv2.CC_STAT_AREA].max()
        m = np.isin(rot, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > maior * 0.08]).astype(np.uint8)
    # tapa buraquinhos dentro da peça
    cont, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cheia = np.zeros_like(m)
    cv2.drawContours(cheia, cont, -1, 1, -1)
    m = cheia & av.astype(np.uint8)
    alfa = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 0.8)
    peca = v.copy()
    peca[..., 3] = (np.minimum(alfa, 1) * v[..., 3]).astype(np.uint8)
    img = Image.fromarray(peca)
    bb = img.getbbox()
    os.makedirs(DST, exist_ok=True)
    img.crop(bb).save(os.path.join(DST, pid + '.png'), optimize=True)
    # conferência
    comp = Image.fromarray(base).copy()
    comp.alpha_composite(img)
    fundo = lambda im: Image.alpha_composite(Image.new('RGBA', im.size, (120, 170, 200, 255)), im).convert('RGB')
    out = Image.new('RGB', (Wd * 3, H))
    for i, im in enumerate([Image.fromarray(base), Image.fromarray(v), comp]):
        out.paste(fundo(im), (i * Wd, 0))
    out.thumbnail((1500, 800))
    out.save(os.path.join(DBG, 'p7_%s.jpg' % pid), quality=85)
    return [round(bb[0] / Wd, 4), round(bb[1] / H, 4), round((bb[2] - bb[0]) / Wd, 4), round((bb[3] - bb[1]) / H, 4)]


def main():
    ids = sys.argv[1].split(',') if len(sys.argv) > 1 else [os.path.basename(p)[5:-4] for p in sorted(glob.glob(os.path.join(SRC, 'p7_v_*.png')))
                                                             if '_extra' not in p]
    metap = os.path.join(ROOT, 'src', 'p7_meta.js')
    meta = {}
    for pid in ids:
        meta[pid] = recorta(pid)
        print(pid, meta[pid])
    with open(metap, 'w', encoding='utf-8', newline='\n') as f:
        f.write('// Gerado por tools/recortar7.py: onde cada peça fica na imagem do personagem (x, y, largura, altura em fração).\n')
        f.write('window.CF = window.CF || {};\nCF.P7_PECAS = %s;\n' % json.dumps(meta))


if __name__ == '__main__':
    main()

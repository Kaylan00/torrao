"""Corta a arte da versão 9: quartos novos e móveis novos.
- quartos: tools/art_src/v9_<id>.png -> assets/toca/quarto_<id>.jpg (900x1200)
- janela de cada quarto (inclusive o listrado): o vidro azul vira uma máscara assets/toca/janela_<id>.png, e a posição
  (x, y, largura, altura em % do quarto) sai impressa pra ir no CF.QUARTOS (o cenário escolhido aparece só no vidro)
- móveis: tools/art_src/v9_moveis.png (grade 3x3) -> assets/toca/<id>.png
Uso: python tools/fatiar9.py
"""
import json, os, sys
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fatiar import pecas, salva, SRC, DST

QUARTOS = ['toca', 'cabana', 'celeste']
ESPELHA_CHAO = {'toca'}
MOVEIS = ['lustre', 'espelho', 'mapa', 'poltrona', 'escrivaninha', 'tapete_retalhos', 'livros', 'cesto', 'violao']


def janela(img, nome):
    """Máscara do vidro azul (maior mancha azul, com os buracos tapados) e a caixa dele em %."""
    a = np.array(img.convert('RGB')).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    azul = ((b > 190) & (b > r + 60) & (g > 110)).astype(np.uint8)
    n, rot, st, _ = cv2.connectedComponentsWithStats(azul, 8)
    i = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    m = (rot == i).astype(np.uint8)
    cont, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cheia = np.zeros_like(m)
    cv2.drawContours(cheia, cont, -1, 1, -1)
    cheia = cv2.dilate(cheia, np.ones((5, 5), np.uint8))          # entra um pouquinho na moldura: sem fresta azul
    ys, xs = np.where(cheia)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    alfa = cv2.GaussianBlur(cheia[y0:y1, x0:x1].astype(np.float32) * 255, (0, 0), 1.0).astype(np.uint8)
    mascara = Image.new('RGBA', (x1 - x0, y1 - y0), (255, 255, 255, 0))
    mascara.putalpha(Image.fromarray(alfa))
    mascara.save(os.path.join(DST, 'toca', 'janela_%s.png' % nome), optimize=True)
    W, H = img.size
    return [round(x0 / W * 100, 2), round(y0 / H * 100, 2), round((x1 - x0) / W * 100, 2), round((y1 - y0) / H * 100, 2)]


def faixas(img, nome):
    """Pra tela cheia: faixa de cima da parede (acima da janela) e faixa de baixo do chão, cada uma com a cópia
    espelhada embaixo (assim repete sem emenda). Saída: assets/toca/parede_<id>.jpg e chao_<id>.jpg"""
    W, H = img.size
    from PIL import ImageOps
    p = img.crop((0, 0, W, int(H * 0.15)))
    par = Image.new('RGB', (W, p.height * 2)); par.paste(ImageOps.flip(p), (0, 0)); par.paste(p, (0, p.height))
    par.save(os.path.join(DST, 'toca', 'parede_%s.jpg' % nome), quality=84, optimize=True)
    if nome in ESPELHA_CHAO:          # lajotas: espelhar continua o desenho
        c = img.crop((0, int(H * 0.88), W, H))
        ch = Image.new('RGB', (W, c.height * 2)); ch.paste(ImageOps.flip(c), (0, 0)); ch.paste(c, (0, c.height))
    else:                             # tábuas: esticar a última fileira continua as linhas retas
        ch = img.crop((0, H - 2, W, H)).resize((W, 300), Image.BILINEAR)
    ch.save(os.path.join(DST, 'toca', 'chao_%s.jpg' % nome), quality=84, optimize=True)


def main():
    caixas = {}
    faixas(Image.open(os.path.join(DST, 'toca', 'quarto.jpg')).convert('RGB'), 'listras')
    caixas['listras'] = janela(Image.open(os.path.join(DST, 'toca', 'quarto.jpg')), 'listras')
    for q in QUARTOS:
        p = os.path.join(SRC, 'v9_%s.png' % q)
        if not os.path.exists(p):
            print('falta', p)
            continue
        c = Image.open(p).convert('RGB').resize((900, 1200), Image.LANCZOS)
        c.save(os.path.join(DST, 'toca', 'quarto_%s.jpg' % q), quality=86, optimize=True)
        caixas[q] = janela(c, q)
        faixas(c, q)
    print('janelas', json.dumps(caixas))
    m = os.path.join(SRC, 'v9_moveis.png')
    if os.path.exists(m):
        g, modo = pecas(m, 3, 3)
        print('moveis:', modo)
        k = 0
        for f in range(3):
            for c in range(3):
                im = g[f][c]
                if im.width > 360:
                    im = im.resize((360, round(im.height * 360 / im.width)), Image.LANCZOS)
                salva(im, 'toca', MOVEIS[k]); k += 1
        print('moveis ok')


if __name__ == '__main__':
    main()

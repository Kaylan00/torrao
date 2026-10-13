"""Corta a arte da versão 5: cenário Ilhas Arco-Íris e 12 roupas novas.
Uso: python tools/fatiar5.py
"""
import os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fatiar import pecas, salva, SRC, DST

ROUPAS = ['chef', 'bruxo', 'helice', 'pirata', 'cowboy', 'fones', 'bandana', 'louros', 'urso', 'coracao', 'mergulho', 'bigode']


def main():
    pasta = os.path.join(DST, 'mundo', 'arco')
    os.makedirs(pasta, exist_ok=True)
    c = Image.open(os.path.join(SRC, 'v5_arco_fundo.png')).convert('RGB')
    c = c.resize((900, round(c.height * 900 / c.width)), Image.LANCZOS)
    c.save(os.path.join(pasta, 'fundo.jpg'), quality=84, optimize=True)
    g, modo = pecas(os.path.join(SRC, 'v5_arco_ilhas.png'), 2, 2)
    print('arco ilhas:', modo)
    for n, im in zip(['comum', 'feito', 'desafio', 'chefao'], [g[0][0], g[0][1], g[1][0], g[1][1]]):
        if im.width > 420:
            im = im.resize((420, round(im.height * 420 / im.width)), Image.LANCZOS)
        salva(im, os.path.join('mundo', 'arco'), n)
    g, modo = pecas(os.path.join(SRC, 'v5_roupas.png'), 3, 4)
    print('roupas:', modo)
    k = 0
    for f in range(3):
        for col in range(4):
            im = g[f][col]
            if im.width > 300:
                im = im.resize((300, round(im.height * 300 / im.width)), Image.LANCZOS)
            salva(im, 'roupa', ROUPAS[k]); k += 1
    print('ok')


if __name__ == '__main__':
    main()

"""Corta a arte da versão 4: 3 cenários novos e a Toca do Torrão (quarto + móveis).
Saída: assets/mundo/<doce|cogumelo|recife>/..., assets/toca/quarto.jpg, assets/toca/<movel>.png, assets/toca/icone.png
Uso: python tools/fatiar4.py   (pula o que ainda não foi desenhado)
"""
import os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fatiar import pecas, salva, SRC, DST

MOVEIS = ['tapete_redondo', 'luminaria', 'planta', 'estante', 'cama', 'quadro', 'radio', 'aquario',
          'cacto', 'pufe', 'luzinhas', 'mesinha', 'relogio', 'prateleira', 'guarda_chuva', 'tapete_verde']


def mundo(nome, origem):
    f = os.path.join(SRC, 'v4_%s_fundo.png' % origem)
    i = os.path.join(SRC, 'v4_%s_ilhas.png' % origem)
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


def toca():
    q = os.path.join(SRC, 'v4_toca.png')
    m = os.path.join(SRC, 'v4_moveis.png')
    pasta = os.path.join(DST, 'toca')
    os.makedirs(pasta, exist_ok=True)
    if os.path.exists(q):
        c = Image.open(q).convert('RGB')
        c = c.resize((900, round(c.height * 900 / c.width)), Image.LANCZOS)
        c.save(os.path.join(pasta, 'quarto.jpg'), quality=86, optimize=True)
        print('quarto ok', c.size)
    if os.path.exists(m):
        g, modo = pecas(m, 4, 4)
        print('moveis:', modo)
        k = 0
        for f in range(4):
            for c in range(4):
                im = g[f][c]
                if im.width > 360:
                    im = im.resize((360, round(im.height * 360 / im.width)), Image.LANCZOS)
                salva(im, 'toca', MOVEIS[k]); k += 1
        # ícone da aba: a cama de folhas
        cama = Image.open(os.path.join(pasta, 'cama.png')).convert('RGBA')
        lado = max(cama.size)
        t = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
        t.paste(cama, ((lado - cama.width) // 2, (lado - cama.height) // 2), cama)
        t.resize((128, 128), Image.LANCZOS).save(os.path.join(pasta, 'icone.png'), optimize=True)


def main():
    mundo('doce', 'doce')
    mundo('cogumelo', 'cogumelo')
    mundo('recife', 'recife')
    toca()


if __name__ == '__main__':
    main()

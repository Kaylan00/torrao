"""Móveis novos da Toca (26/10/2026): 9 peças numa grade 3x3, no mesmo jeito da versão 9.
Anexo 1 = grade com 9 móveis que JÁ EXISTEM no jogo (tools/art_src/v10_ref.png, montada aqui): o Codex copia o estilo
e o tamanho de cada peça no quadrado. Funciona sem o estilo_a.png (que só existe no PC do dono).
Uso: python tools/arte10.py ref | gera [--wsl] | corta
Depois de cortar: conferir assets/toca/<id>.png olhando e pôr no CF.MOVEIS (data.js) com o lugar e a larg abaixo.
"""
import os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G
from gerar_arte4 import CAB
from gerar_arte2 import TRANSP

# id, lugar, larg (% do quarto), descrição
MOVEIS = [
    ('balao', 'teto', 20, 'um balao de ar quente pequeno de papel, listrado de laranja e creme, com uma cestinha, pendurado por um fio (para o teto)'),
    ('quadro_estrelas', 'parede_e', 15, 'um quadro com moldura de madeira mostrando um ceu azul-escuro com estrelinhas e uma lua (para a parede)'),
    ('prateleira_plantas', 'parede_d', 18, 'uma prateleira de madeira com 3 vasinhos de plantas e folhas pendendo para baixo (para a parede)'),
    ('bau', 'fundo_e', 26, 'um bau de madeira com cantos de metal dourado, com a tampa entreaberta e laranjas la dentro'),
    ('piano', 'fundo_d', 30, 'um piano de armario pequeno, cor de madeira avermelhada, com as teclas a mostra e um vasinho em cima'),
    ('tapete_laranja', 'chao', 58, 'um tapete redondo que parece uma fatia de laranja vista de cima (gomos e casca), achatado em perspectiva'),
    ('globo', 'frente_e', 17, 'um globo terrestre azul e verde num pe de madeira'),
    ('girassol', 'frente_e', 18, 'um vaso de barro com 3 girassois altos'),
    ('vitrola', 'frente_d', 20, 'uma vitrola de maleta azul-petroleo aberta, com um disco preto e uma pilha de 2 discos ao lado'),
]
REF = ['estante', 'poltrona', 'aquario', 'luminaria', 'cama', 'radio', 'planta', 'relogio', 'tapete_redondo']
ROOT = G.ROOT
REFP = os.path.join(G.OUT, 'v10_ref.png')

PROMPT = CAB.replace('Anexo 1 = a arte JA APROVADA', 'Anexo 1 = 9 moveis que JA EXISTEM no jogo') + TRANSP + """
IMAGEM (formato quadrado 1:1): grade de 3 COLUNAS e 3 FILEIRAS com 9 MOVEIS e ENFEITES de decoracao NOVOS, cada um sozinho,
inteiro e centralizado no seu quadrado, com bastante espaco vazio entre eles, vistos de frente (levemente de cima), no mesmo
tamanho e no mesmo estilo dos moveis do Anexo 1 (nao copie os do Anexo 1, desenhe estes):
""" + '\n'.join('%d. %s.' % (i + 1, m[3]) for i, m in enumerate(MOVEIS))


def ref():
    os.makedirs(G.OUT, exist_ok=True)
    q = 512
    out = Image.new('RGBA', (q * 3, q * 3), (0, 0, 0, 0))
    for k, nome in enumerate(REF):
        im = Image.open(os.path.join(ROOT, 'assets', 'toca', nome + '.png')).convert('RGBA')
        im.thumbnail((int(q * 0.8), int(q * 0.8)), Image.LANCZOS)
        out.alpha_composite(im, ((k % 3) * q + (q - im.width) // 2, (k // 3) * q + (q - im.height) // 2))
    out.save(REFP)
    print('ref ok', REFP)


def gera(wsl):
    if not os.path.exists(REFP):
        ref()
    if os.path.exists(os.path.join(G.OUT, 'v10_moveis.png')):
        print('ja existe tools/art_src/v10_moveis.png')
        return 0
    n, _ = G.gera('v10_moveis', PROMPT, wsl, [REFP])
    return 0 if n else 3


def corta():
    from fatiar import pecas, salva
    g, modo = pecas(os.path.join(G.OUT, 'v10_moveis.png'), 3, 3)
    print('moveis:', modo)
    k = 0
    for f in range(3):
        for c in range(3):
            im = g[f][c]
            if im.width > 360:
                im = im.resize((360, round(im.height * 360 / im.width)), Image.LANCZOS)
            salva(im, 'toca', MOVEIS[k][0]); k += 1
    print('ok: conferir assets/toca/<id>.png e depois pôr no CF.MOVEIS:')
    for i, (mid, lugar, larg, _) in enumerate(MOVEIS):
        print("  { id: '%s', nome: '...', lugar: '%s', preco: 6, larg: %d }," % (mid, lugar, larg))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'ref':
        ref()
    elif cmd == 'gera':
        sys.exit(gera('--wsl' in sys.argv))
    elif cmd == 'corta':
        corta()
    else:
        print(__doc__)

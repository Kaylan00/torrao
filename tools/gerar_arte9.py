"""Arte da versão 9: 3 quartos novos pro Torrão (mesma planta do quarto atual: janela redonda no mesmo lugar,
chão e paredes na mesma perspectiva, pra os móveis caberem nos mesmos lugares) e 9 móveis novos.
Anexo 1 = estilo aprovado, Anexo 2 = o quarto atual (assets/toca/quarto.jpg).
Saída: tools/art_src/v9_<nome>.png. Depois: python tools/fatiar9.py. Uso: python tools/gerar_arte9.py [--so=nome] [--wsl]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G
from gerar_arte2 import TRANSP
from gerar_arte4 import CAB

ESTILO = os.path.join(G.OUT, 'estilo_a.png')
QUARTO = os.path.join(G.ROOT, 'assets', 'toca', 'quarto.jpg')

SALA = CAB + """
Anexo 2 = o quarto que JA EXISTE no jogo. O jogo coloca os moveis por cima, em lugares fixos.
IMAGEM (formato retrato 3:4), FUNDO OPACO: um quarto NOVO com EXATAMENTE A MESMA PLANTA do Anexo 2:
- mesma camera de frente, mesmo enquadramento, mesma perspectiva
- a parede do fundo, as paredes dos lados, o rodape e o chao exatamente nos MESMOS LUGARES e no mesmo tamanho do Anexo 2
- a janela REDONDA exatamente no MESMO LUGAR e do MESMO TAMANHO do Anexo 2, com o vidro AZUL-CLARO LISO (uma cor so, sem nuvem,
  sem nada dentro), porque o jogo coloca a paisagem dentro da janela
- o quarto continua COMPLETAMENTE VAZIO: sem moveis, sem tapete, sem quadros, sem lampadas
O que muda e so o TEMA (materiais e cores):
{tema}
- aconchegante, convidativo, cores quentes e alegres, que da vontade de decorar"""

TAREFAS = {
    'v9_toca': (SALA.format(tema="""TOCA DE RAIZES: as paredes sao de terra batida marrom-alaranjada com raizes finas de papel descendo pelos cantos
e pedrinhas coloridas encrustadas; a moldura da janela e um anel de raiz torcida; o chao e de lajotas redondas de pedra cor de areia
com musgo verde nas frestas; o rodape e uma faixa de musgo."""), [ESTILO, QUARTO]),
    'v9_cabana': (SALA.format(tema="""CABANA DE MADEIRA: as paredes sao de troncos horizontais cor de mel com nos de madeira, a moldura da janela
e de madeira escura com um parapeito; o chao e de tabuas largas cor de chocolate; o rodape e uma tora fina; tudo bem quentinho."""), [ESTILO, QUARTO]),
    'v9_celeste': (SALA.format(tema="""QUARTO CELESTE: a parede do fundo e azul-marinho com estrelinhas e luas douradas de papel espalhadas como papel de
parede; as paredes dos lados em azul um pouco mais escuro; a moldura da janela e dourada; o chao e de tabuas claras cor de creme
com um friso azul; o rodape e dourado."""), [ESTILO, QUARTO]),
    'v9_moveis': (CAB + TRANSP + """
IMAGEM (formato quadrado 1:1): grade de 3 COLUNAS e 3 FILEIRAS com 9 MOVEIS e ENFEITES de decoracao, cada um sozinho, inteiro e
centralizado no seu quadrado, com bastante espaco vazio entre eles, vistos de frente (levemente de cima), cores vivas e alegres:
1. lustre de teto feito de folhas verdes e uma lampada amarela no meio, pendurado por uma corrente curta (para o teto).
2. espelho redondo com moldura de flores laranja (para pendurar na parede).
3. poster de um mapa-mundi creme com um caminho tracejado vermelho (para pendurar na parede).
4. poltrona gorda verde-musgo com almofada laranja.
5. escrivaninha de madeira com uma pilha de livros e um abajur pequeno.
6. tapete de retalhos coloridos retangular (visto de cima, achatado em perspectiva).
7. pilha de 4 livros grossos coloridos com uma xicara em cima.
8. cesto de vime cheio de laranjas.
9. violao laranja encostado em pe.""", [ESTILO]),
}


def main():
    so = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--so=')), None)
    wsl = '--wsl' in sys.argv
    for nome, (prompt, anexos) in TAREFAS.items():
        if so and nome != so:
            continue
        if os.path.exists(os.path.join(G.OUT, nome + '.png')):
            continue
        n, cota = G.gera(nome, prompt, wsl, anexos)
        if n == 0 and not wsl:
            G.status('%s falhou no Windows: tentando no WSL' % nome); wsl = True
            n, cota = G.gera(nome, prompt, wsl, anexos)
        if n == 0:
            G.status('%s nao gerou nada. Parei.' % nome); return 3
    G.status('FIM v9')
    return 0


if __name__ == '__main__':
    sys.exit(main())

"""Arte da versão 4 do Torrão: 3 cenários coloridos novos e a Toca do Torrão (quarto pra decorar).
Mesmo estilo aprovado (Anexo 1 = tools/art_src/estilo_a.png). Saída: tools/art_src/v4_<nome>.png. Prontas são puladas.
Uso: python tools/gerar_arte4.py [--so=nome]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G
from gerar_arte2 import TRANSP

ESTILO = os.path.join(G.OUT, 'estilo_a.png')

CAB = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Arte para um app de celular de estudar ingles ("Torrao"). O mundo do jogo e SURREAL, DIVERTIDO e todo feito de PAPEL RECORTADO.
Anexo 1 = a arte JA APROVADA: copie EXATAMENTE a TECNICA desse estilo (formas geometricas chapadas como papel recortado e colado
em camadas, SEM contorno preto, textura leve de papel granulado, sem degrade). Nesta imagem as CORES sao outras: bem mais VIVAS e alegres.
- sem brilho, sem glow, sem particulas, sem texto, sem letras, sem numeros, sem marca d'agua, sem personagens, sem pessoas
"""

FUNDO = CAB + """
IMAGEM (formato retrato 9:16), FUNDO OPACO (preenche a imagem inteira), cenario de fundo de um MAPA de fases:
{cena}
- O MEIO da imagem (de cima a baixo) fica com bastante espaco LIVRE, porque o jogo coloca ilhas por cima."""

ILHAS = CAB + TRANSP + """
IMAGEM (formato quadrado 1:1): grade de 2 COLUNAS e 2 FILEIRAS com ilhas flutuantes para o mapa, vistas de frente levemente de cima,
com bastante espaco vazio entre elas, todas com a mesma base e o mesmo tamanho (a 4 e maior).
{ilhas}"""

TAREFAS = {
    'v4_doce_fundo': (FUNDO.format(cena="""- MUNDO "DOCERIA FLUTUANTE": ceu de papel em faixas cor-de-rosa, lilas e amarelo-manteiga.
- Nuvens que parecem algodao-doce rosa e azul-bebe, um sol amarelo em forma de bala redonda.
- Ao longe, pirulitos gigantes em espiral espetados em ilhas, uma cachoeira de calda de chocolate caindo de uma ilha,
  e confeitos coloridos (granulado) de papel flutuando aqui e ali.
- Embaixo, morros de chantilly creme e rosa em camadas."""), [ESTILO]),
    'v4_doce_ilhas': (ILHAS.format(ilhas="""Ilhas do MUNDO "DOCERIA FLUTUANTE": a parte de cima e uma fatia de bolo com cobertura cor-de-rosa escorrendo
e granulado colorido; embaixo, camadas de bolo (massa amarela e recheio de morango) afinando como um cone, com gotas de calda penduradas.
1. ilha pequena comum, topo de cobertura vazio com 3 confeitos.
2. a mesma ilha com uma bandeirinha triangular laranja fincada no meio.
3. ilha media com 2 pirulitos de espiral colorida espetados.
4. ilha GRANDE com um cupcake gigante com uma cereja em cima."""), [ESTILO]),
    'v4_cogumelo_fundo': (FUNDO.format(cena="""- MUNDO "FLORESTA DE COGUMELOS": ceu de papel em faixas turquesa e verde-agua no alto, passando para lilas.
- Cogumelos GIGANTES de papel ao longe, com chapeus vermelhos de bolinhas creme, roxos e azul-turquesa, de varias alturas.
- Folhas enormes de samambaia verde-limao, vaga-lumes de papel amarelo (simples, sem brilho) e esporos de papel flutuando.
- Embaixo, um tapete de musgo verde-vivo em camadas com cogumelinhos."""), [ESTILO]),
    'v4_cogumelo_ilhas': (ILHAS.format(ilhas="""Ilhas do MUNDO "FLORESTA DE COGUMELOS": topo de musgo verde-vivo, embaixo terra roxa e marrom afinando como um cone,
com raizes turquesa penduradas.
1. ilha pequena comum, topo de musgo vazio com 2 cogumelinhos vermelhos de bolinha.
2. a mesma ilha com uma bandeirinha triangular laranja fincada no meio.
3. ilha media com um cogumelo roxo grande com escadinha em volta do caule.
4. ilha GRANDE com uma casinha feita dentro de um cogumelo vermelho gigante, com porta e janelinha redonda."""), [ESTILO]),
    'v4_recife_fundo': (FUNDO.format(cena="""- MUNDO "RECIFE DE PAPEL": o fundo do mar feito de papel, em faixas de azul-turquesa claro em cima ate azul-marinho embaixo.
- Corais de papel coloridos (rosa-coral, amarelo, roxo e laranja) subindo das laterais, algas verdes ondulando.
- Peixinhos de papel geometricos coloridos (listrados laranja e branco, azuis, amarelos), uma tartaruga de papel ao longe,
  bolhas de papel creme subindo e raios de luz em faixas de papel claro vindo de cima.
- Embaixo, areia creme com conchas e estrelas-do-mar."""), [ESTILO]),
    'v4_recife_ilhas': (ILHAS.format(ilhas="""Ilhas do MUNDO "RECIFE DE PAPEL": topo de areia creme com corais pequenos, embaixo pedra de coral rosa e roxa
afinando como um cone, com algas verdes penduradas e bolhinhas subindo.
1. ilha pequena comum, topo de areia vazio com uma estrela-do-mar laranja.
2. a mesma ilha com uma bandeirinha triangular laranja fincada no meio.
3. ilha media com um coral-cerebro rosa e uma concha grande aberta com uma perola.
4. ilha GRANDE com um bau do tesouro aberto cheio de moedas douradas e um coral amarelo alto."""), [ESTILO]),
    'v4_toca': (CAB + """
IMAGEM (formato retrato 3:4), FUNDO OPACO, a TOCA DO TORRAO: um quartinho aconchegante VAZIO, visto de frente, como um palco.
- Parede do fundo com papel de parede de listras verticais creme e verde-claro, e um rodape de madeira.
- No MEIO da parede, uma janela REDONDA grande mostrando um ceu azul com uma nuvem de papel.
- Chao de tabuas de madeira cor de mel, em perspectiva (o chao ocupa o terco de baixo da imagem).
- As paredes dos lados aparecem um pouco, em perspectiva, num tom mais escuro.
- O quarto esta COMPLETAMENTE VAZIO: sem moveis, sem tapete, sem quadros, sem lampadas, porque o jogo coloca a decoracao depois.
- Cores alegres e quentes.""", [ESTILO]),
    'v4_moveis': (CAB + TRANSP + """
IMAGEM (formato quadrado 1:1): grade de 4 COLUNAS e 4 FILEIRAS com 16 MOVEIS e ENFEITES de decoracao, cada um sozinho, inteiro e
centralizado no seu quadrado, com bastante espaco vazio entre eles, vistos de frente (levemente de cima), cores vivas e alegres:
1. tapete redondo laranja e creme com listras em espiral (visto de cima, achatado em perspectiva).
2. luminaria de pe com cupula de papel amarela.
3. vaso de ceramica azul-turquesa com uma planta de folhas grandes.
4. estante baixa de madeira com livros coloridos.
5. cama de folhas verdes gigantes com um travesseiro creme.
6. quadro com moldura de madeira mostrando uma laranja (para pendurar na parede).
7. radio antigo vermelho com antena.
8. aquario redondo com 2 peixinhos laranja.
9. cacto verde redondo num vaso rosa.
10. pufe gordinho roxo.
11. varal de luzinhas de papel coloridas penduradas numa linha curvada (para o teto).
12. mesinha redonda de madeira com uma xicara fumegante (o vapor e uma tira de papel).
13. relogio de parede redondo azul.
14. prateleira de parede com 3 potinhos coloridos.
15. guarda-chuva de papel aberto amarelo pendurado de cabeca pra baixo, com flores dentro (para o teto).
16. tapete retangular verde com franjas (visto de cima, achatado em perspectiva).""", [ESTILO]),
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
    G.status('FIM v4')
    return 0


if __name__ == '__main__':
    sys.exit(main())

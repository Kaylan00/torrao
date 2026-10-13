"""Arte da versão 2 do Torrão: "horta no céu de papel".
Mesmo estilo aprovado (recorte geométrico, Anexo 1 = tools/art_src/estilo_a.png) e o mesmo Torrão (Anexo 2 = r_torrao.png).
Usa o gerador do gerar_arte_codex.py. Saída: tools/art_src/v2_<nome>.png. Prontas são puladas.
Uso: python tools/gerar_arte2.py [--so=nome]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G

ESTILO = os.path.join(G.OUT, 'estilo_a.png')
TORRAO = os.path.join(G.OUT, 'r_torrao.png')

CAB = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Arte para um app de celular de estudar ingles ("Torrao"). O mundo do jogo e SURREAL e todo feito de PAPEL RECORTADO:
ilhas de terra flutuando num ceu de papel, laranjas gigantes flutuando como planetas. O Torrao e uma criatura ORIGINAL feita de terra e pedra.
Anexo 1 = a arte JA APROVADA: copie EXATAMENTE esse estilo.

ESTILO (igual ao Anexo 1)
- recorte geometrico de papel: formas simples e chapadas, como papel cortado e colado em camadas
- SEM contorno preto: as formas se separam so pela cor
- paleta do Anexo 1: marrom-terra, verde-oliva, laranja, creme e azul-petroleo escuro
- a mesma textura leve de papel granulado, sem degrade, sem sombra realista
- sem brilho, sem glow, sem particulas, sem texto, sem letras, sem numeros, sem marca d'agua
"""

TRANSP = "- FUNDO TRANSPARENTE, cada desenho inteiro, nada cortado nas bordas\n"

FASES = {
    1: ('o FILHOTE (coluna 1 do Anexo 2): torrao redondo pequeno, sem bracos, raizes curtinhas, broto de 2 folhas na cabeca',
        'sem bracos: a laranja fica equilibrada na frente da boca'),
    2: ('o JOVEM (coluna 2 do Anexo 2): corpo de terra em blocos, dois bracinhos de pedra, musgo nos ombros, 3 folhas na cabeca',
        'segurando a laranja com os dois bracinhos'),
    3: ('o ADULTO (coluna 3 do Anexo 2): golem largo, bracos grossos de pedra, arbusto verde com florzinhas brancas nas costas',
        'segurando a laranja com as duas maos'),
    4: ('o LENDARIO (coluna 4 do Anexo 2): o maior e mais largo, laranjeira com 3 laranjas nas costas, coroa de raizes finas na cabeca',
        'segurando a laranja com as duas maos'),
}

ANIM = CAB + """Anexo 2 = a folha do personagem Torrao (4 fases de crescimento nas colunas, 3 humores nas fileiras).

ANIMACAO de {fase}.
IMAGEM (formato quadrado 1:1): grade de 4 COLUNAS e 4 FILEIRAS = 16 quadros de animacao do MESMO personagem,
com bastante espaco vazio entre os quadros e nada encostando no quadro vizinho.
O personagem do MESMO tamanho em todos os quadros, centralizado no seu quadrado, virado para a DIREITA (de frente levemente de lado),
e com as raizes (os pes) SEMPRE na mesma altura dentro de cada fileira. O pulo quem faz e o jogo: desenhe so a forma do corpo.
""" + TRANSP + """
Fileira 1, PARADO RESPIRANDO (loop): (1) pose normal tranquila e marrenta; (2) corpo um pouquinho mais largo e mais baixo, folhas da cabeca
inclinadas para a esquerda; (3) pose normal, folhas inclinadas para a direita; (4) igual ao quadro 1 mas com os olhos fechados (piscando).
Fileira 2, PULINHO DE ALEGRIA: (5) agachado, corpo bem achatado, olhos fechados de alegria; (6) corpo esticado para cima, raizes soltas
e esticadas, boca aberta sorrindo; (7) corpo redondo, bracos (se tiver) abertos, boca aberta sorrindo; (8) corpo esticado de novo, olhos abertos.
Fileira 3, COMENDO LARANJA ({come}): (9) laranja inteira perto da boca, olhos abertos; (10) mordendo, bochechas cheias;
(11) mastigando, laranja com uma mordida, olhos fechados de satisfacao; (12) engolindo, so um pedacinho da laranja, sorriso satisfeito.
Fileira 4, SECO E TRISTE (loop): (13) sentado no chao, corpo num marrom desbotado com rachaduras de seca, plantas murchas amareladas e caidas,
olhar emburrado de lado; (14) igual, com o corpo um pouco mais baixo (suspirando) e olhos semicerrados; (15) igual ao 13 olhando para
cima com cara de tedio; (16) igual ao 13 com os olhos fechados.

MANTER IGUAL em todos os 16 quadros: o mesmo Torrao do Anexo 2, mesmas cores, mesma textura, mesmo tamanho."""

TAREFAS = {}
for n, (fase, come) in FASES.items():
    TAREFAS['v2_anim%d' % n] = (ANIM.format(fase=fase, come=come), [ESTILO, TORRAO])

CEU = CAB + """
IMAGEM (formato retrato 9:16), um CEU de papel recortado, FUNDO OPACO (preenche a imagem inteira):
{ceu}
- Ao longe, pequenas: 3 ilhas de terra flutuando, cada uma com uma arvorezinha geometrica em cima e raizes penduradas embaixo.
- 2 laranjas ENORMES flutuando no ceu como planetas, cada uma com um anel fino de papel creme em volta.
- Na faixa de baixo da imagem (um quinto da altura): morros em camadas de papel verde-oliva, como papel recortado sobreposto.
- O MEIO da imagem fica LIVRE, so com o ceu, porque o jogo coloca ali a ilha principal e nuvens que se mexem.
- Sem nuvens (o jogo coloca as nuvens). Sem personagens, sem pessoas, sem animais."""

TAREFAS['v2_ceu_dia'] = (CEU.format(ceu="- Ceu em faixas horizontais de papel: azul-claro em cima, passando por creme ate pessego perto do horizonte.\n- Um sol laranja grande de papel no alto, a esquerda."), [ESTILO])
TAREFAS['v2_ceu_tarde'] = (CEU.format(ceu="- Ceu de fim de tarde em faixas horizontais de papel: lilas em cima, rosa-salmao no meio, laranja perto do horizonte.\n- Um sol laranja-avermelhado grande de papel, baixo, perto dos morros, a direita."), [ESTILO])
TAREFAS['v2_ceu_noite'] = (CEU.format(ceu="- Ceu de noite em faixas horizontais de papel: azul-petroleo bem escuro em cima, azul-arroxeado perto do horizonte.\n- Uma lua crescente de papel creme no alto, a direita, e varias estrelinhas de papel creme de 4 pontas espalhadas.\n- As ilhas, as laranjas-planeta e os morros mais escuros, como de noite."), [ESTILO])

TAREFAS['v2_ilha'] = (CAB + TRANSP + """
IMAGEM (formato quadrado 1:1): UMA ilha de terra flutuante grande, vista de frente levemente de cima, ocupando a imagem.
- Topo largo e achatado de grama verde-oliva, com bastante espaco VAZIO em cima (um personagem vai ficar em pe ali), so 2 tufinhos de grama nas bordas.
- Embaixo, um bloco de terra marrom em formas geometricas que vai afinando para baixo como um cone torto, com pedrinhas creme encravadas.
- Raizes finas marrons penduradas embaixo, de tamanhos diferentes.
- Uma pequena cachoeira de papel azul-petroleo caindo de um dos lados do topo ate embaixo da ilha.""", [ESTILO])

TAREFAS['v2_nuvens'] = (CAB + TRANSP + """
IMAGEM (formato 3:2): grade de 3 COLUNAS e 2 FILEIRAS com 6 nuvens de papel recortado, com bastante espaco vazio entre elas.
Nuvens achatadas e arredondadas feitas de 2 ou 3 camadas de papel (creme claro por cima, creme mais escuro por baixo),
de tamanhos e formatos diferentes: compridas, gordinhas, pequenas.""", [ESTILO])

TAREFAS['v2_horta'] = (CAB + TRANSP + """
IMAGEM (formato 3:2): grade de 5 COLUNAS e 2 FILEIRAS, com bastante espaco vazio entre os desenhos e nada encostando no vizinho.
Cada planta fica em cima do MESMO pequeno TORRAO FLUTUANTE: um pedaco de terra que flutua no ar, com o topo achatado de grama verde-oliva
e embaixo terra marrom em formas geometricas afinando como um cone, com 2 ou 3 raizes finas penduradas. O torrao flutuante e sempre
igual, do mesmo tamanho e na mesma altura em todos. As plantas sao vistas de frente.

Fileira 1, planta saudavel crescendo (da esquerda para a direita):
1. o torrao flutuante so com uma semente marrom-escura aparecendo na grama.
2. broto pequeno com 2 folhinhas verde-oliva.
3. muda com 5 folhas e um caule fino.
4. arvorezinha baixa com tronco marrom fino e copa de folhas geometricas.
5. a mesma arvorezinha com 3 laranjas.

Fileira 2:
6. o broto da imagem 2 murcho, folhinhas caidas e amarelo-mostarda.
7. a muda da imagem 3 murcha, folhas caidas amarelo-mostarda e marrons.
8. a arvorezinha da imagem 4 murcha, copa amarelo-mostarda caida.
9. uma laranja redonda sozinha com uma folhinha verde no cabo (sem torrao).
10. um regador azul-petroleo de lado, com o bico virado para a esquerda (sem torrao).""", [ESTILO])

TAREFAS['v2_mapa'] = (CAB + TRANSP + """
IMAGEM (formato quadrado 1:1): grade de 2 COLUNAS e 2 FILEIRAS com ilhas de terra flutuantes para um MAPA de fases, vistas de frente
levemente de cima, com bastante espaco vazio entre elas. Todas com o topo achatado de grama verde-oliva e embaixo terra marrom em formas
geometricas afinando como um cone, com raizes finas penduradas.
1. ilha pequena comum, topo de grama vazio.
2. a mesma ilha pequena com uma bandeirinha triangular laranja de papel fincada no meio.
3. ilha media com um arco de pedra creme em cima.
4. ilha GRANDE com uma arvore antiga enorme e torta em cima, copa verde-oliva larga e raizes gigantes penduradas por baixo da ilha.""", [ESTILO])

TAREFAS['v2_papel'] = ("""Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

IMAGEM (formato quadrado 1:1): uma TEXTURA de papel creme claro, vista de cima, ocupando a imagem inteira, FUNDO OPACO.
Papel artesanal com granulado leve e fibras bem sutis, cor uniforme (creme claro #F3E6CC), sem dobras, sem manchas, sem sombra, sem desenho,
sem texto. A textura tem que poder ser repetida lado a lado sem emenda aparente (tileable/seamless).""", [])


def main():
    so = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--so=')), None)
    wsl = '--wsl' in sys.argv
    for nome, (prompt, anexos) in TAREFAS.items():
        if so and nome != so:
            continue
        if os.path.exists(os.path.join(G.OUT, nome + '.png')):
            continue
        n, cota = G.gera(nome, prompt, wsl, anexos)
        if cota and n == 0 and not wsl:
            G.status('cota do Windows acabou: passando para o codex do WSL'); wsl = True
            n, cota = G.gera(nome, prompt, wsl, anexos)
        if n == 0:
            G.status('%s nao gerou nada. Parei.' % nome); return 3
    G.status('FIM v2')
    return 0


if __name__ == '__main__':
    sys.exit(main())

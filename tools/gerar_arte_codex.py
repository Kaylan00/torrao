"""Gera a arte do Capi Fluente pelo Codex (ChatGPT), igual ao Frutas Fujonas (tools/gerar_pulos_codex.py).
Uma chamada do Codex por imagem. Saida: tools/art_src/<nome>.png. Imagens que ja existem sao puladas.
Uso: python tools/gerar_arte_codex.py [--wsl] [--so=capi]
"""
import glob, os, shutil, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'art_src')
GEN = os.path.join(os.path.expanduser('~'), '.codex', 'generated_images')
# Windows: o codex.exe do app; Linux/Mac: o codex que estiver no PATH
CODEX = (glob.glob(os.path.join(os.path.expanduser('~'), 'AppData', 'Local', 'OpenAI', 'Codex', 'bin', '*', 'codex.exe'))
         or [shutil.which('codex') or 'codex'])[0]
STATUS = os.path.join(OUT, 'STATUS.txt')

CAB = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Arte para um app de celular de estudar ingles ("Capi Fluente"): o jogador cuida de uma horta e de uma capivara.
"""

ESTILO = """ESTILO (vale para tudo)
- cartoon desenhado a mao, contorno marrom-escuro de espessura uniforme
- sombreamento em 2 tons (base + 1 sombra), cores chapadas, sem degrade
- paleta quente de fim de tarde: verde-folha, marrom-terra, laranja, creme, um pouco de azul-petroleo
- NADA infantil: nada de chibi, nada de kawaii, nada de olhos grandes brilhando. Personagem com atitude e cara de tranquilo
- sem brilho, sem glow, sem particulas, sem reflexo, sem texto, sem letras, sem numeros, sem marca d'agua
- FUNDO TRANSPARENTE, cada desenho inteiro, nada cortado nas bordas
"""

TESTE_ESTILO = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

TESTE DE ESTILO para um app de celular de estudar ingles. O jogador cuida de uma horta e do "Torrao", uma criatura ORIGINAL feita de terra e pedra.

ESTILO DESTE TESTE
{estilo}
- personagem original, nao copie nenhum desenho existente
- FUNDO TRANSPARENTE, sem texto, sem letras, sem numeros, sem marca d'agua
- nada infantil: nada de olhos grandes brilhando, nada kawaii

IMAGEM (formato 3:2): 3 desenhos lado a lado, com bastante espaco vazio entre eles, todos com a base na mesma altura:
1. O TORRAO ADULTO, de pe, bracos cruzados, cara marrenta e confiante: um golem baixo e largo de terra marrom com pedrinhas cinza,
   dois olhos pequenos de pedra preta com sobrancelhas grossas de pedra, raizes grossas no lugar das pernas, um arbusto verde
   com florzinhas brancas crescendo nas costas. Virado para a DIREITA, visto de frente levemente de lado.
2. O TORRAO FILHOTE do lado dele: um torrao de terra redondo do tamanho de um punho, os mesmos olhinhos de pedra e sobrancelhas,
   raizes curtinhas, um broto verde de 2 folhas na cabeca. Olhando de lado para o adulto.
3. Uma arvorezinha com 3 laranjas, plantada num montinho de terra marrom."""

ESTILOS = {
    'estilo_a': """RECORTE GEOMETRICO: inspirado nos desenhos animados dos anos 1950 de design modernista.
- tudo feito de formas geometricas simples e chapadas (circulos, retangulos, triangulos, ovais)
- SEM contorno preto: as formas se separam so pela cor
- paleta limitada de 5 cores: marrom-terra, verde-oliva, laranja, creme e azul-petroleo escuro
- textura leve de papel granulado por cima das cores, sem degrade, sem sombra realista
- olhos de pontinho preto e sobrancelha de um traco reto""",
    'estilo_b': """TRACO DE CADERNO: inspirado em curtas animados independentes e experimentais.
- linha preta FINA e um pouco tremida, como caneta nanquim desenhada a mao
- cores pastel chapadas (terracota, verde-menta, laranja claro, creme) que escapam um pouco da linha, como se pintadas por cima
- proporcoes estranhas e engracadas, bracos e raizes finos e molengas
- olhos de pontinho, expressao seca e debochada
- sem sombra, sem degrade""",
    'estilo_c': """CONTORNO GROSSO: inspirado nos desenhos de acao e comedia da TV dos anos 2000.
- contorno preto BEM GROSSO e uniforme em tudo
- formas robustas e simplificadas, com cantos retos e angulos marcados, silhueta muito clara
- cores fortes e chapadas (marrom-avermelhado, verde vivo, laranja forte, cinza-azulado), SEM sombra e sem degrade
- olhos pequenos e expressivos, boca grande e expressiva, muita atitude na pose""",
}

TAREFAS = {
    **{k: TESTE_ESTILO.format(estilo=v) for k, v in ESTILOS.items()},
    'torrao': CAB.replace('e de uma capivara', 'e do Torrao, uma criatura feita de terra') + ESTILO + """
IMAGEM (formato 3:2): grade de 4 COLUNAS e 3 FILEIRAS com a mesma criatura, com bastante espaco vazio entre os desenhos e nada encostando no vizinho.
A criatura e o "Torrao": um bicho ORIGINAL feito de TERRA e PEDRA, com plantas crescendo em cima do corpo. Corpo de terra marrom
com pedrinhas cinza encravadas, dois olhos pequenos de pedra preta polida com sobrancelhas grossas de pedra, boca pequena e reta de quem e marrento,
raizes grossas no lugar das pernas. Sempre de corpo inteiro, de pe, visto de frente levemente de lado (tres quartos), virado para a DIREITA,
com o chao na mesma altura em todos.

Cada COLUNA e uma fase de crescimento (da esquerda para a direita), cada uma MAIOR que a anterior:
- Coluna 1: FILHOTE, um torrao de terra redondo do tamanho de um punho, sem bracos, um broto verde de 2 folhas no topo da cabeca.
- Coluna 2: JOVEM, corpo de terra maior, dois bracinhos curtos de pedra, manchas de musgo verde nos ombros, 3 folhas na cabeca.
- Coluna 3: ADULTO, golem baixo e largo de pedra e terra, bracos grossos de pedra, um arbusto verde com florzinhas brancas crescendo nas costas.
- Coluna 4: LENDARIO, golem grande e largo, uma pequena laranjeira com 3 laranjas crescendo nas costas, coroa de raizes finas na cabeca.

Cada FILEIRA e um humor (o mesmo em todas as colunas):
- Fileira 1: TRANQUILO, de pe, bracos cruzados (o filhote sem bracos so de pe), meio sorriso de canto confiante. Plantas verdes e firmes.
- Fileira 2: FELIZ COMENDO, segurando uma laranja com as maos (o filhote com a laranja equilibrada na frente da boca), mordendo, olhos fechados de satisfacao.
- Fileira 3: SECO E EMBURRADO, sentado no chao, a terra do corpo mais clara e cheia de rachaduras de seca, as plantas murchas e amareladas caidas, olhar emburrado de lado.

MANTER IGUAL: o mesmo rosto, as mesmas cores, a mesma espessura de contorno em todos os 12 desenhos. Nada de olhos grandes nem fofura: ele e marrento.""",

    'capi': CAB + ESTILO + """
IMAGEM (formato 3:2): grade de 4 COLUNAS e 3 FILEIRAS com a mesma capivara, com bastante espaco vazio entre os desenhos e nada encostando no vizinho.
A capivara e a mascote "Capi": capivara marrom-alaranjada, focinho grande e quadrado, olhos pequenos meio fechados de quem esta sempre tranquila,
orelhinhas pequenas e redondas. Sempre de corpo inteiro, sentada, vista de frente levemente de lado (tres quartos), virada para a DIREITA,
todos do mesmo tamanho dentro de cada coluna e com o chao na mesma altura.

Cada COLUNA e uma fase de crescimento (da esquerda para a direita):
- Coluna 1: FILHOTE, pequena e magrinha, pelo mais claro.
- Coluna 2: JOVEM, um pouco maior, oculos escuros pretos levantados em cima da cabeca.
- Coluna 3: ADULTA, grande e gordinha, oculos escuros pretos no rosto, uma laranja pequena equilibrada em cima da cabeca.
- Coluna 4: LENDARIA, a maior e mais gorda, oculos escuros pretos no rosto, coroa de folhas verdes na cabeca, cachecol azul-petroleo.

Cada FILEIRA e um humor (o mesmo em todas as colunas):
- Fileira 1: TRANQUILA, sentada, olhos meio fechados, leve sorriso de canto.
- Fileira 2: FELIZ COMENDO, segurando uma fruta laranja com as duas patas da frente, mordendo, olhos fechados de satisfacao.
- Fileira 3: EMBURRADA COM FOME, deitada de barriga no chao, queixo apoiado no chao, olhar de lado de tedio, sobrancelha franzida.

MANTER IGUAL: o mesmo rosto, as mesmas cores, a mesma espessura de contorno em todos os 12 desenhos.""",

    'horta': CAB + ESTILO + """
IMAGEM (formato 3:2): grade de 5 COLUNAS e 2 FILEIRAS, com bastante espaco vazio entre os desenhos e nada encostando no vizinho.
Cada desenho e uma planta da horta em cima do MESMO montinho de terra marrom (montinho oval, visto de frente levemente de cima, sempre do mesmo tamanho
e na mesma altura). As plantas sao vistas de frente.

Fileira 1, planta saudavel crescendo (da esquerda para a direita):
1. so o montinho de terra com uma semente marrom aparecendo no meio.
2. broto pequeno com 2 folhinhas verdes.
3. muda com 5 folhas verdes e um caule fino.
4. arvorezinha baixa com tronco marrom fino e copa verde redonda.
5. a mesma arvorezinha com 3 frutas laranja redondas penduradas na copa.

Fileira 2, plantas murchas (precisando de agua):
6. o broto da imagem 2 murcho, folhinhas caidas e amareladas.
7. a muda da imagem 3 murcha, folhas caidas, amarelas e marrons.
8. a arvorezinha da imagem 4 murcha, copa caida e amarelada, algumas folhas no chao.
9. uma fruta laranja redonda sozinha, com uma folhinha verde no cabo (sem montinho de terra).
10. um regador de metal azul-petroleo, de lado, com o bico virado para a esquerda (sem montinho de terra).""",

    'fundo': """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Arte para um app de celular de estudar ingles ("Capi Fluente"). Esta imagem e o FUNDO da tela principal, onde fica a horta.

ESTILO
- cartoon desenhado a mao, contorno marrom-escuro de espessura uniforme, sombreamento em 2 tons, cores chapadas
- paleta quente de fim de tarde: verde-folha, marrom-terra, laranja, creme, um pouco de azul-petroleo
- sem texto, sem letras, sem numeros, sem pessoas, sem animais, sem brilho, sem glow

IMAGEM (formato retrato 2:3): um quintal de sitio no fim da tarde, visto de frente levemente de cima.
- Faixa de cima (um quarto da imagem): ceu laranja e creme com 2 nuvens simples, morros verdes ao longe.
- Lado esquerdo, la atras: uma casinha de madeira simples com telhado de telha.
- Lado direito, la atras: uma cerca baixa de madeira e uma arvore grande.
- O MEIO e a parte de BAIXO da imagem (tres quartos) sao um gramado verde liso e VAZIO, sem nenhum objeto, sem flores, sem pedras,
  porque o jogo vai colocar os canteiros ali por cima.""",

    'icones': CAB + ESTILO + """
IMAGEM (formato quadrado 1:1): grade de 4 COLUNAS e 3 FILEIRAS de icones para a interface do app, todos do mesmo tamanho,
cada um centralizado no seu quadrado, com bastante espaco vazio entre eles. Icones simples e legiveis de longe, sem fundo.
1. gota de agua azul-petroleo.
2. estrela laranja de 5 pontas (pontos de experiencia).
3. chama de fogo laranja e vermelha (sequencia de dias).
4. tela de video com botao de play triangular.
5. fones de ouvido.
6. balao de fala branco com contorno.
7. microfone.
8. cerebro rosa com uma lampada pequena (teste de memoria).
9. cartinha de estudo com o canto dobrado.
10. cadeado fechado.
11. sinal de visto verde dentro de um circulo.
12. trofeu dourado.""",
}


# ---------- ESTILO ESCOLHIDO (12/10/2026): recorte geometrico, referencia = estilo_a.png ----------
REF = os.path.join(OUT, 'estilo_a.png')

R_CAB = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Arte para um app de celular de estudar ingles ("Torrao"). O jogador cuida de uma horta e do Torrao, uma criatura ORIGINAL feita de terra e pedra.
Anexo 1 = a arte JA APROVADA do jogo (o Torrao adulto, o Torrao filhote e uma laranjeira). Copie EXATAMENTE esse estilo e esse personagem.

ESTILO (igual ao Anexo 1)
- recorte geometrico: tudo feito de formas simples e chapadas (circulos, retangulos, triangulos, ovais), como papel recortado
- SEM contorno preto: as formas se separam so pela cor
- a mesma paleta limitada do Anexo 1: marrom-terra, verde-oliva, laranja, creme e um pouco de azul-petroleo escuro
- a mesma textura leve de papel granulado do Anexo 1, sem degrade, sem sombra realista
- olhos de pontinho preto e sobrancelhas de bloco creme, como no Anexo 1
- sem brilho, sem glow, sem particulas, sem texto, sem letras, sem numeros, sem marca d'agua
- FUNDO TRANSPARENTE, cada desenho inteiro, nada cortado nas bordas
"""

R_TAREFAS = {
    'r_torrao': R_CAB + """
IMAGEM (formato 3:2): grade de 4 COLUNAS e 3 FILEIRAS com o Torrao, com bastante espaco vazio entre os desenhos e nada encostando no vizinho.
O Torrao e o mesmo do Anexo 1 (corpo de terra marrom em blocos, pedrinhas creme, olhos de pontinho, sobrancelhas de bloco creme, raizes no lugar das pernas).
Sempre de corpo inteiro, virado para a DIREITA, visto de frente levemente de lado, com o chao na mesma altura em todos.

Cada COLUNA e uma fase de crescimento (da esquerda para a direita), cada uma MAIOR que a anterior:
- Coluna 1: FILHOTE, igual ao filhote do Anexo 1: torrao redondo pequeno, raizes curtinhas, broto de 2 folhas na cabeca.
- Coluna 2: JOVEM, corpo maior, dois bracinhos curtos de pedra, manchas de musgo verde-oliva nos ombros, 3 folhas na cabeca.
- Coluna 3: ADULTO, igual ao adulto do Anexo 1: golem largo, bracos grossos, arbusto verde com florzinhas brancas nas costas.
- Coluna 4: LENDARIO, o maior e mais largo, uma pequena laranjeira com 3 laranjas crescendo nas costas, coroa de raizes finas na cabeca.

Cada FILEIRA e um humor (o mesmo em todas as colunas):
- Fileira 1: TRANQUILO, de pe, bracos cruzados (o filhote sem bracos so de pe), cara marrenta e confiante. Plantas verdes.
- Fileira 2: FELIZ COMENDO, segurando uma laranja com as maos (o filhote com a laranja na frente da boca), mordendo, olhos fechados em tracinho.
- Fileira 3: SECO E EMBURRADO, sentado no chao, o corpo num marrom mais claro e desbotado com rachaduras de seca, as plantas amareladas e caidas, olhar emburrado de lado.

MANTER IGUAL: o mesmo Torrao do Anexo 1 em todos os 12 desenhos, mesmas cores, mesma textura.""",

    'r_horta': R_CAB + """
IMAGEM (formato 3:2): grade de 5 COLUNAS e 2 FILEIRAS, com bastante espaco vazio entre os desenhos e nada encostando no vizinho.
Cada planta fica em cima do MESMO montinho de terra marrom (igual ao montinho da laranjeira do Anexo 1, sempre do mesmo tamanho e na mesma altura).

Fileira 1, planta saudavel crescendo (da esquerda para a direita):
1. so o montinho de terra com uma semente marrom-escura aparecendo no meio.
2. broto pequeno com 2 folhinhas verde-oliva.
3. muda com 5 folhas e um caule fino.
4. arvorezinha baixa com tronco marrom fino e copa verde de folhas geometricas.
5. a mesma arvorezinha com 3 laranjas, igual a laranjeira do Anexo 1.

Fileira 2:
6. o broto da imagem 2 murcho, folhinhas caidas e amarelo-mostarda.
7. a muda da imagem 3 murcha, folhas caidas amarelo-mostarda e marrons.
8. a arvorezinha da imagem 4 murcha, copa amarelo-mostarda caida, 3 folhas secas no chao.
9. uma laranja redonda sozinha com uma folhinha verde no cabo (sem montinho).
10. um regador azul-petroleo de lado, com o bico virado para a esquerda (sem montinho).""",

    'r_icones': R_CAB + """
IMAGEM (formato quadrado 1:1): grade de 4 COLUNAS e 3 FILEIRAS de icones da interface, todos do mesmo tamanho, centralizados cada um no seu quadrado,
com bastante espaco vazio entre eles. Icones simples, legiveis de longe, feitos de formas geometricas chapadas como o Anexo 1. Nenhum personagem.
1. gota de agua azul-petroleo.
2. estrela laranja de 5 pontas.
3. chama de fogo laranja e amarela.
4. tela de video creme com triangulo de play azul-petroleo.
5. fones de ouvido.
6. balao de fala creme.
7. microfone.
8. cerebro rosado com uma lampadinha amarela.
9. cartinha de estudo creme com o canto dobrado.
10. cadeado.
11. circulo verde-oliva com um sinal de visto creme.
12. trofeu laranja.""",

    'r_fundo': """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Arte para um app de celular de estudar ingles ("Torrao"). Esta imagem e o FUNDO da tela principal, onde fica a horta.
Anexo 1 = a arte JA APROVADA do jogo: copie EXATAMENTE esse estilo (recorte geometrico de papel, formas chapadas sem contorno,
paleta marrom-terra, verde-oliva, laranja, creme e azul-petroleo escuro, textura leve de papel granulado). Nao desenhe os personagens do anexo.

IMAGEM (formato retrato 2:3), um quintal de sitio no fim da tarde, visto de frente:
- Faixa de cima (um terco da imagem): ceu creme e laranja-claro com um sol laranja redondo e 2 nuvens de formas simples, morros verde-oliva ao longe em camadas.
- La atras, a esquerda: uma casinha simples de formas geometricas com telhado triangular laranja-escuro.
- La atras, a direita: uma arvore grande de copa geometrica e uma cerca baixa de madeira.
- Os dois tercos de BAIXO da imagem: um gramado verde-oliva liso e VAZIO, sem nenhum objeto, so com a textura de papel,
  porque o jogo vai colocar a criatura e os canteiros ali por cima.
- sem texto, sem letras, sem numeros, sem pessoas, sem animais.""",
}
TAREFAS.update(R_TAREFAS)
ANEXOS = {k: [REF] for k in R_TAREFAS}


def status(msg):
    os.makedirs(OUT, exist_ok=True)
    linha = time.strftime('%H:%M:%S ') + msg
    print(linha, flush=True)
    open(STATUS, 'a', encoding='utf-8').write(linha + '\n')


def w2l(p):
    return '/mnt/' + p[0].lower() + p[2:].replace('\\', '/')


def imagens(wsl):
    if wsl:
        r = subprocess.run(['wsl.exe', '-e', 'sh', '-c', 'find ~/.codex/generated_images -name "*.png" -printf "%T@ %p\\n" 2>/dev/null'], capture_output=True, text=True)
        out = {}
        for ln in r.stdout.splitlines():
            t, pth = ln.split(' ', 1)
            out[pth] = float(t)
        return out
    return {p: os.path.getmtime(p) for p in glob.glob(os.path.join(GEN, '**', '*.png'), recursive=True)}


def run_codex(prompt, wsl, anexos=()):
    if wsl:
        args = ' '.join('-i %s' % w2l(a) for a in anexos)
        # acha o codex em qualquer versão do node do nvm (se a versão padrão mudar, ele continua funcionando)
        acha = 'export PATH="$(dirname "$(ls $HOME/.nvm/versions/node/*/bin/codex 2>/dev/null | tail -1)"):$PATH"'
        cmd = ['wsl.exe', '-e', 'zsh', '-ic', '%s; cd %s && codex exec --skip-git-repo-check --sandbox workspace-write %s' % (acha, w2l(OUT), args)]
    else:
        cmd = [CODEX, 'exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-C', OUT]
        for a in anexos:
            cmd += ['-i', a]
    return subprocess.run(cmd, input=prompt, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=3600)


def gera(nome, prompt, wsl, anexos=()):
    antes = imagens(wsl)
    t0 = time.time()
    r = run_codex(prompt, wsl, anexos)
    log = (r.stdout or '') + '\n' + (r.stderr or '')
    open(os.path.join(OUT, nome + '_log.txt'), 'w', encoding='utf-8').write(log)
    depois = imagens(wsl)
    novas = sorted([p for p in depois if p not in antes], key=lambda p: depois[p])
    for i, p in enumerate(novas):
        dst = os.path.join(OUT, (nome if i == 0 else '%s_extra%d' % (nome, i)) + '.png')
        if wsl:
            subprocess.run(['wsl.exe', '-e', 'cp', p, w2l(dst)])
        else:
            shutil.copy(p, dst)
    status('%s: %d imagens em %.0f s (%s, codigo %d)' % (nome, len(novas), time.time() - t0, 'wsl' if wsl else 'windows', r.returncode))
    low = log.lower()
    cota = any(k in low for k in ('usage limit', 'rate limit', 'quota', "you've hit", 'limite de uso'))
    return len(novas), cota


def main():
    os.makedirs(OUT, exist_ok=True)
    wsl = '--wsl' in sys.argv
    so = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--so=')), None)
    for nome, prompt in TAREFAS.items():
        if so and nome != so:
            continue
        if os.path.exists(os.path.join(OUT, nome + '.png')):
            continue
        n, cota = gera(nome, prompt, wsl, ANEXOS.get(nome, ()))
        if cota and n == 0 and not wsl:
            status('cota do Windows acabou: passando para o codex do WSL'); wsl = True
            n, cota = gera(nome, prompt, wsl, ANEXOS.get(nome, ()))
        if n == 0:
            status('%s nao gerou nada. Parei.' % nome); return 3
    status('FIM')
    return 0


if __name__ == '__main__':
    sys.exit(main())

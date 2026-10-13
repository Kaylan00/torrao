"""Arte da versão 3 do Torrão: 2 mundos novos pro mapa (mês 2 e mês 3) e o guarda-roupa (acessórios).
Mesmo estilo aprovado (Anexo 1 = tools/art_src/estilo_a.png). Saída: tools/art_src/v3_<nome>.png. Prontas são puladas.
Uso: python tools/gerar_arte3.py [--so=nome]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G
from gerar_arte2 import CAB, TRANSP

ESTILO = os.path.join(G.OUT, 'estilo_a.png')
TORRAO = os.path.join(G.OUT, 'r_torrao.png')

FUNDO = CAB + """
IMAGEM (formato retrato 9:16), FUNDO OPACO (preenche a imagem inteira), cenario de fundo de um MAPA de fases:
{cena}
- O MEIO da imagem (de cima a baixo) fica com espaco LIVRE, so com o ceu ou o mar, porque o jogo coloca ilhas por cima.
- Sem personagens, sem pessoas, sem animais, sem texto."""

ILHAS = CAB + TRANSP + """
IMAGEM (formato quadrado 1:1): grade de 2 COLUNAS e 2 FILEIRAS com ilhas flutuantes para o mapa, vistas de frente levemente de cima,
com bastante espaco vazio entre elas, todas com a mesma base e o mesmo tamanho (a 4 e maior).
{ilhas}"""

TAREFAS = {
    'v3_mar_fundo': (FUNDO.format(cena="""- MUNDO "MAR DE PAPEL": um oceano de papel recortado em muitas faixas de ondas azul-petroleo e azul-claro, do meio ate embaixo.
- Ceu de papel em faixas creme e pessego em cima, com um sol laranja baixo e 3 gaivotas de papel bem pequenas e simples.
- Ao longe: 2 barquinhos de papel dobrado (origami) boiando e um farol listrado creme e laranja numa pedra pequena.
- Algumas ilhas de areia bem pequenas flutuando no ceu ao longe, com 1 palmeira geometrica cada."""), [ESTILO]),
    'v3_mar_ilhas': (ILHAS.format(ilhas="""Ilhas do MUNDO "MAR DE PAPEL": topo de AREIA creme-dourada e embaixo pedra marrom e azul-petroleo afinando como um cone,
com algas verdes penduradas no lugar de raizes e gotinhas de agua de papel caindo.
1. ilha pequena comum, topo de areia vazio com 2 conchinhas.
2. a mesma ilha com uma bandeirinha triangular laranja fincada no meio.
3. ilha media com uma palmeira geometrica e um barquinho de papel encalhado.
4. ilha GRANDE com um farol listrado creme e laranja em cima."""), [ESTILO]),
    'v3_picos_fundo': (FUNDO.format(cena="""- MUNDO "PICOS DE NUVEM": noite de papel. Ceu em faixas azul-petroleo escuro e roxo, com uma aurora feita de tiras de papel
  verde-agua e lilas ondulando la no alto, uma lua cheia de papel creme e estrelinhas de papel de 4 pontas.
- Picos de montanha de papel flutuando ao longe, com neve creme no topo, em varias camadas.
- Embaixo, um mar de nuvens de papel creme e lilas em camadas."""), [ESTILO]),
    'v3_picos_ilhas': (ILHAS.format(ilhas="""Ilhas do MUNDO "PICOS DE NUVEM": topo de NEVE creme com pedra cinza-azulada, embaixo pedra cinza e roxa afinando como um cone,
com pingentes de gelo de papel azul-claro pendurados no lugar de raizes.
1. ilha pequena comum, topo de neve vazio com 2 pedrinhas.
2. a mesma ilha com uma bandeirinha triangular laranja fincada no meio.
3. ilha media com um pinheiro geometrico nevado e uma lanterninha de papel laranja acesa pendurada nele.
4. ilha GRANDE com um observatorio de pedra com cupula azul-petroleo e um telescopio apontando para cima."""), [ESTILO]),
    'v3_acessorios': (CAB + """Anexo 2 = o personagem Torrao (so para referencia de TAMANHO e de DIRECAO: os acessorios vao ser usados na cabeca dele).
""" + TRANSP + """
IMAGEM (formato quadrado 1:1): grade de 3 COLUNAS e 3 FILEIRAS com 9 ACESSORIOS de vestir, SEM personagem, cada um sozinho e inteiro,
centralizado no seu quadrado, com bastante espaco vazio entre eles. Todos vistos de frente levemente de lado, virados para a DIREITA
(igual ao Torrao do Anexo 2), do tamanho certo para a cabeca do Torrao adulto.
1. bone azul-petroleo com a aba virada para a DIREITA.
2. chapeu de palha de abas largas com uma fita laranja.
3. gorro de la laranja com um pompom creme em cima.
4. coroa de papel dourado com 5 pontas e bolinhas vermelhas.
5. cartola alta preta de papel com uma faixa laranja.
6. chapeu de explorador cor de areia com uma pena verde.
7. oculos escuros pretos de armacao redonda, vistos de frente (as duas lentes lado a lado).
8. oculos de leitura de armacao laranja, redondos, vistos de frente.
9. tiara de flores: varias florzinhas brancas e laranja numa fileira levemente curvada.""", [ESTILO, TORRAO]),
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
        if cota and n == 0 and not wsl:
            G.status('cota do Windows acabou: passando para o codex do WSL'); wsl = True
            n, cota = G.gera(nome, prompt, wsl, anexos)
        if n == 0 and not wsl:
            G.status('%s falhou no Windows: tentando no WSL' % nome); wsl = True
            n, cota = G.gera(nome, prompt, wsl, anexos)
        if n == 0:
            G.status('%s nao gerou nada. Parei.' % nome); return 3
    G.status('FIM v3')
    return 0


if __name__ == '__main__':
    sys.exit(main())

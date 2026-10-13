"""Arte da versão 5 do Torrão: o cenário mais colorido (Ilhas Arco-Íris, o primeiro da lista) e 12 roupas novas.
Mesmo estilo aprovado (Anexo 1 = tools/art_src/estilo_a.png). Saída: tools/art_src/v5_<nome>.png. Prontas são puladas.
Uso: python tools/gerar_arte5.py [--so=nome]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G
from gerar_arte2 import TRANSP
from gerar_arte4 import CAB, FUNDO, ILHAS

ESTILO = os.path.join(G.OUT, 'estilo_a.png')
TORRAO = os.path.join(G.OUT, 'r_torrao.png')

TAREFAS = {
    'v5_arco_fundo': (FUNDO.format(cena="""- MUNDO "ILHAS ARCO-IRIS", o mais colorido de todos: ceu de papel em faixas largas de TODAS as cores do arco-iris
  (vermelho-coral, laranja, amarelo, verde-limao, turquesa, azul, roxo) em curvas suaves, como um arco-iris gigante recortado.
- Baloes de ar quente de papel listrados e coloridos flutuando ao longe, pipas coloridas com rabiolas, varais de bandeirinhas
  coloridas cruzando o ceu e confetes de papel espalhados.
- Ilhas pequenas ao longe com flores de todas as cores.
- Embaixo, morros de papel em camadas de verde-limao, rosa e amarelo, com flores grandes."""), [ESTILO]),
    'v5_arco_ilhas': (ILHAS.format(ilhas="""Ilhas do MUNDO "ILHAS ARCO-IRIS": topo de grama verde-limao com florzinhas de todas as cores,
embaixo terra em camadas de papel coloridas como um arco-iris (rosa, laranja, amarelo, turquesa, roxo) afinando como um cone,
com fitas coloridas penduradas no lugar de raizes.
1. ilha pequena comum, topo de grama florido vazio.
2. a mesma ilha com uma bandeirinha triangular laranja fincada no meio.
3. ilha media com um balao de ar quente listrado amarrado nela, flutuando logo acima.
4. ilha GRANDE com um arco-iris de papel em arco por cima e um castelinho colorido de torres listradas."""), [ESTILO]),
    'v5_roupas': (CAB + """Anexo 2 = o personagem Torrao (so para referencia de TAMANHO e de DIRECAO: os acessorios vao ser usados na cabeca dele).
""" + TRANSP + """
IMAGEM (formato 4:3): grade de 4 COLUNAS e 3 FILEIRAS com 12 ACESSORIOS de vestir, SEM personagem, cada um sozinho e inteiro,
centralizado no seu quadrado, com bastante espaco vazio entre eles, cores vivas. Todos vistos de frente levemente de lado, virados
para a DIREITA (igual ao Torrao do Anexo 2). Os chapeus sao vistos com a ABERTURA de baixo levemente visivel, como se fossem encaixar numa cabeca.
1. chapeu de cozinheiro branco alto e fofo.
2. chapeu de bruxo pontudo roxo com estrelinhas amarelas e a ponta caida.
3. bone com uma helice colorida em cima.
4. chapeu de pirata preto de 3 pontas com uma caveirinha simples branca.
5. chapeu de cowboy marrom com fita vermelha.
6. fones de ouvido grandes azul-turquesa com a haste em arco (para usar por cima da cabeca).
7. faixa de pano vermelha amarrada (bandana de testa) com as pontas soltas voando para tras.
8. coroa de folhas de louro douradas.
9. tiara com orelhinhas redondas de urso marrom.
10. oculos de coracao cor-de-rosa, vistos de frente.
11. oculos de mergulho azuis com a tira, vistos de frente.
12. bigode preto enrolado nas pontas.""", [ESTILO, TORRAO]),
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
    G.status('FIM v5')
    return 0


if __name__ == '__main__':
    sys.exit(main())

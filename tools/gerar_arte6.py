"""Torrão "sem planta na cabeça" (pra usar chapéu): mesma folha de 16 quadros de cada fase, sem o que cresce no alto da cabeça.
É a técnica de "encaixe" dos jogos: quando entra um chapéu, o "cabelo" (aqui, a planta) sai.
Anexo 1 = estilo aprovado, Anexo 2 = a folha de animação da fase (tools/art_src/v2_anim<fase>.png).
Saída: tools/art_src/v6_careca<fase>.png. Uso: python tools/gerar_arte6.py [--so=nome]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G

ESTILO = os.path.join(G.OUT, 'estilo_a.png')

O_QUE_SAI = {
    1: 'o broto de 2 folhas que nasce no alto da cabeca',
    2: 'as 3 folhas que nascem no alto da cabeca',
    3: 'as folhinhas que aparecem no alto da cabeca (o arbusto com florzinhas das COSTAS continua igual)',
    4: 'a coroa de raizes finas no alto da cabeca (a laranjeira das COSTAS continua igual)',
}

PROMPT = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Anexo 1 = o estilo aprovado do jogo (papel recortado, formas chapadas sem contorno, textura de papel).
Anexo 2 = a folha de animacao do personagem Torrao: 16 quadros numa grade de 4 colunas e 4 fileiras, com FUNDO TRANSPARENTE.

Redesenhe EXATAMENTE a mesma folha do Anexo 2: as mesmas 16 poses, na mesma ordem, no mesmo lugar da grade, mesmo tamanho,
mesmas cores, mesmas expressoes e mesma textura, com UMA unica diferenca: TIRE {sai}.
O alto da cabeca fica LISO e arredondado, so terra (a mesma cor e textura do resto da cabeca), como uma cabeca pronta para usar chapeu.
Nao mude mais nada: nem a pose, nem os bracos, nem as raizes, nem o rosto.
- FUNDO TRANSPARENTE, cada quadro separado do vizinho por espaco vazio, nada encostando no vizinho
- sem texto, sem letras, sem numeros, sem brilho, sem glow"""

TAREFAS = {'v6_careca%d' % f: (PROMPT.format(sai=O_QUE_SAI[f]), [ESTILO, os.path.join(G.OUT, 'v2_anim%d.png' % f)]) for f in range(1, 5)}


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
    G.status('FIM v6')
    return 0


if __name__ == '__main__':
    sys.exit(main())

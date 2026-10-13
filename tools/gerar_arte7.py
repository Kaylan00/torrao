"""Personagem novo pensado para o guarda-roupa (técnica dos jogos de vestir, tipo Finch / Animal Crossing):
visto de frente, sempre na mesma posição, cabeça lisa em cima (é onde o chapéu encaixa) e montado em peças
de papel (cabeça, corpo, braços, pés) que o código mexe. O chapéu fica preso na cabeça e acompanha tudo.
Etapa 1: p7_base (o personagem montado), para o dono aprovar. Depois: p7_kit (peças) e p7_rostos.
Saída: tools/art_src/p7_*.png. Uso: python tools/gerar_arte7.py [--so=nome] [--wsl]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G

ESTILO = os.path.join(G.OUT, 'estilo_a.png')

INICIO = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Anexo 1 = o estilo aprovado do jogo: papel recortado, formas chapadas SEM contorno, textura de papel,
sombras feitas com recortes de papel um tom mais escuro.
"""

PERSONAGEM = """PERSONAGEM (bichinho virtual de um app de estudar ingles; ele vai usar chapeus, oculos, fones, coroas,
entao o desenho e feito PARA RECEBER ROUPAS):
- visto EXATAMENTE de frente, simetrico, parado em pe, olhando para quem ve
- um torraozinho de terra vivo: corpo de argila cor terracota (#b0623a), sombras em recorte marrom (#7a3f22),
  2 manchinhas de musgo verde-oliva (#7d8a3a) nos ombros, barriga oval cor creme (#efd9b4)
- CABECA GRANDE e redonda, quase metade da altura total, mais larga que o corpo
- o ALTO DA CABECA e LISO e arredondado, SEM NADA em cima: sem cabelo, sem orelha, sem chifre, sem folha,
  sem broto, sem antena (e ali que o chapeu encaixa)
- cabeca separada do corpo por um sulco bem visivel (pescoco curtinho)
- rosto no meio da cabeca: 2 olhos grandes ovais brancos com pupila marrom-escura e um pontinho de luz,
  sobrancelhas grossas de papel creme, boquinha pequena sorrindo
- corpo pequeno em forma de pera, 2 bracinhos curtos e roliços soltos ao lado do corpo, um pouco afastados
  dele (com espaco vazio entre braco e corpo), maos redondas
- 2 pes redondos de raiz, um pouco separados, apoiados no chao
"""

FIM = """- FUNDO TRANSPARENTE, personagem inteiro e centralizado, nada cortado nas bordas
- sem texto, sem letras, sem sombra no chao, sem brilho, sem glow, sem contorno preto"""

BASE = os.path.join(G.OUT, 'p7_base.png')

# vestir de verdade: o gerador desenha o MESMO personagem usando a peça (assim ela já sai com o formato da cabeça)
# e depois tools/recortar7.py tira só a peça, comparando com o p7_base
VESTIR = """Anexo 2 = o personagem do jogo, parado de frente, com FUNDO TRANSPARENTE.

Desenhe EXATAMENTE o mesmo personagem do Anexo 2: mesma pose, mesmo tamanho, MESMA POSICAO na imagem,
mesmo enquadramento, mesmas cores, mesmo rosto. A UNICA diferenca: agora ele esta USANDO {peca}.
- a peca e vista de frente, igual ao personagem, e esta VESTIDA DE VERDADE: a cabeca entra dentro dela,
  a borda de baixo abraca a curva da cabeca, sem espaco vazio entre a peca e a cabeca
- a peca tem o mesmo estilo de papel recortado (formas chapadas, sem contorno, textura de papel)
- nao mude mais nada: nem o rosto, nem o corpo, nem os bracos, nem os pes
"""

PECAS = {
    'cowboy': 'um chapeu de cowboy de feltro marrom-caramelo (#9a5b2e) com faixa vermelha e abas largas levantadas dos lados',
    'gorro': 'um gorro de la laranja (#e8742a) com listras largas laranja-escuro, barra dobrada embaixo e um pompom creme em cima',
    'bone': 'um bone azul-marinho (#25384f) com a aba curva virada para a frente (para quem ve) e um botaozinho em cima',
}

TAREFAS = {
    'p7_base': (INICIO + '\n' + PERSONAGEM + '\nImagem: o personagem inteiro, sozinho, grande, ocupando a imagem.\n' + FIM, [ESTILO]),
}
for _id, _txt in PECAS.items():
    TAREFAS['p7_v_' + _id] = (INICIO + '\n' + VESTIR.format(peca=_txt) + FIM, [ESTILO, BASE])


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
    G.status('FIM p7')
    return 0


if __name__ == '__main__':
    sys.exit(main())

"""Chapéus "vestidos de verdade" no Torrão (técnica: o gerador desenha o personagem JÁ USANDO a peça,
e o computador recorta só a peça comparando com o personagem sem ela).

1) ref:      monta tools/art_src/p8_ref.png = o Torrão parado (quadro 0, sem planta) das 4 fases numa grade 2x2
2) gera:     o Codex redesenha essa grade com os 4 usando a peça -> tools/art_src/p8_v_<id>.png
3) recorta:  tira a peça de cada fase -> assets/roupa8/<id>_<fase>.png e src/roupa8_meta.js
             (posição da peça no quadro 0 de cada fase; nos outros quadros ela acompanha a cabeça pelo CF.ANCORAS_CARECA)
Conferir: tools/debug/p8_<id>.jpg (ref | vestido | ref + peça recortada)
Uso: python tools/arte8.py ref | gera [ids] [--wsl] | recorta [ids]
"""
import glob, json, os, re, sys
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_arte_codex as G

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'art_src')
DST = os.path.join(ROOT, 'assets', 'roupa8')
DBG = os.path.join(ROOT, 'tools', 'debug')
QW, QH = 768, 512          # cada fase ocupa um quadrado de 768x512 na grade (imagem 1536x1024)
ALTO = 0.62                # o personagem ocupa 62% da altura do quadrado (sobra espaço em cima pro chapéu)

PECAS = {
    'bone': 'um bone azul-marinho com a aba curva para a frente e um botaozinho em cima',
    'palha': 'um chapeu de palha amarelo-palha de aba larga com uma fita laranja',
    'gorro': 'um gorro de la laranja com listras largas laranja-escuro, barra dobrada embaixo e um pompom creme em cima',
    'explorador': 'um chapeu de explorador bege (de safari) com faixa marrom e uma peninha verde',
    'flores': 'uma tiara de florzinhas brancas e laranjas com folhinhas verdes, contornando o alto da cabeca',
    'cartola': 'uma cartola preta alta com faixa laranja',
    'coroa': 'uma coroa dourada pequena com bolinhas vermelhas nas pontas',
    'chef': 'um chapeu de cozinheiro branco, alto e fofo',
    'helice': 'um bone de helice com gomos vermelho, amarelo, azul e verde e uma helice azul em cima',
    'pirata': 'um chapeu de pirata preto de 3 pontas com uma caveirinha branca na frente e faixa vermelha',
    'cowboy': 'um chapeu de cowboy de feltro marrom-caramelo com faixa vermelha e abas largas levantadas dos lados',
    'fones': 'fones de ouvido grandes verde-agua com almofadas creme: o arco passa por cima da cabeca e as conchas ficam dos lados da cabeca',
    'bandana': 'uma faixa de testa vermelha amarrada em volta da cabeca, na altura da testa (acima das sobrancelhas), com o no e as pontas soltas do lado',
    'louros': 'uma coroa de louros dourada (ramos de folhinhas douradas) contornando o alto da cabeca',
    'urso': 'uma tiara marrom com 2 orelhas redondas de urso (com o miolo bege) no alto da cabeca',
    # peças novas (13/10/2026): só existem no jeito "vestido"; o ícone do guarda-roupa é a peça da fase 1
    'formatura': 'um capelo de formatura preto (chapeu quadrado e reto em cima) com um pendao dourado pendurado do lado',
    'sapo': 'um chapeu de sapo verde-folha, fofo, com 2 olhinhos redondos brancos de pupila preta em cima',
    'viking': 'um capacete viking cinza-prateado com uma faixa de rebites e 2 chifres creme curvados para cima',
    'festa': 'um chapeuzinho de festa em cone com listras azul e amarelo e um pompom vermelho na ponta',
    'cogumelo': 'um chapeu de cogumelo vermelho, redondo, com bolinhas brancas',
    'boina': 'uma boina francesa vinho, caida para um lado, com um cabinho curto em cima',
    'detetive': 'um chapeu de detetive xadrez marrom e bege, com aba na frente e atras e abas laterais amarradas em cima',
    'laranja': 'meia casca de laranja usada como chapeu, laranja vivo por fora, com um cabinho e uma folhinha verde em cima',
    # peças novas (26/10/2026)
    'pescador': 'um chapeu de pescador (bucket hat) de tecido amarelo-mostarda, com a aba curta caida em volta da cabeca',
    'noel': 'um gorro de Papai Noel vermelho, com a barra branca fofa embaixo e um pompom branco na ponta, caida para o lado',
    'abobora': 'meia abobora laranja usada como chapeu, com gomos marcados, um cabinho verde-escuro e uma folhinha em cima',
    'obra': 'um capacete de obra amarelo, liso, com uma aba curta na frente e um frisinho no meio de tras para a frente',
    'marinheiro': 'um chapeu de marinheiro branco, redondo, com a aba toda virada para cima e uma faixinha azul-marinho',
    'coelho': 'uma tiara com 2 orelhas compridas de coelho brancas com o miolo rosa, em pe no alto da cabeca',
    'unicornio': 'uma tiara com um chifre de unicornio dourado em espiral no alto da testa e 2 orelhinhas brancas dos lados',
    'gato': 'um gorro cinza de la com 2 orelhinhas de gato pontudas em cima, com o miolo rosa',
}
# cores da planta das costas (folha verde, laranja, flor branca) que o gerador redesenha: não são peça,
# a não ser que a peça tenha essa cor (aí fica aqui a lista do que MANTER)
MANTER = {'cowboy': 'marrom', 'detetive': 'marrom', 'urso': 'marrom', 'explorador': 'marrom verde', 'gorro': 'laranja', 'palha': 'laranja', 'cartola': 'laranja', 'flores': 'verde laranja branco',
          'chef': 'branco', 'helice': 'verde laranja', 'pirata': 'branco', 'fones': 'verde branco', 'coroa': 'laranja', 'louros': 'laranja',
          'formatura': 'laranja', 'sapo': 'verde branco', 'viking': 'branco', 'cogumelo': 'branco', 'laranja': 'laranja verde',
          'festa': 'laranja', 'noel': 'branco', 'abobora': 'laranja verde', 'marinheiro': 'branco', 'coelho': 'branco',
          'unicornio': 'branco'}
NOVAS = ['formatura', 'sapo', 'viking', 'festa', 'cogumelo', 'boina', 'detetive', 'laranja',
         'pescador', 'noel', 'abobora', 'obra', 'marinheiro', 'coelho', 'unicornio', 'gato']

PROMPT = """Use a sua ferramenta de GERAR IMAGEM para criar 1 imagem. Nao escreva codigo e nao crie arquivos: so gere a imagem.

Anexo 1 = o estilo aprovado do jogo (papel recortado, formas chapadas SEM contorno, textura de papel).
Anexo 2 = o personagem Torrao nas suas 4 fases, numa grade 2x2, parado, com FUNDO TRANSPARENTE.

Redesenhe EXATAMENTE a imagem do Anexo 2: os 4 personagens nos mesmos lugares, mesmo tamanho, mesma pose,
mesmas cores, mesmo rosto, mesma textura. A UNICA diferenca: agora os 4 estao USANDO {peca}.
- a peca esta VESTIDA DE VERDADE: a cabeca entra dentro dela e a borda de baixo abraca a curva da cabeca,
  sem espaco vazio entre a peca e a cabeca
- a peca fica no MESMO ANGULO da cabeca de cada um (a cabeca e vista um pouco de lado, olhando para a direita),
  e e a mesma peca nos 4, so no tamanho da cabeca de cada fase
- a peca tem o mesmo estilo de papel recortado
- nao mude mais nada: nem o rosto, nem o corpo, nem os bracos, nem as plantas das costas
- FUNDO TRANSPARENTE, nada encostando no vizinho, sem texto, sem brilho, sem glow"""


def celula(fase, k=0):
    s = Image.open(os.path.join(ROOT, 'assets', 'pet', 'anim%d_careca.png' % fase)).convert('RGBA')
    cw, ch = s.width // 4, s.height // 4
    return s.crop(((k % 4) * cw, (k // 4) * ch, (k % 4 + 1) * cw, (k // 4 + 1) * ch))


def encaixe(fase):
    """Onde a célula da fase entra na grade: (canto x, canto y, escala)."""
    c = celula(fase)
    esc = min(QH * ALTO / c.height, QW * 0.92 / c.width)
    qx, qy = ((fase - 1) % 2) * QW, ((fase - 1) // 2) * QH
    ox = qx + (QW - c.width * esc) / 2
    oy = qy + QH - 8 - c.height * esc
    return ox, oy, esc


def ref():
    os.makedirs(SRC, exist_ok=True)
    out = Image.new('RGBA', (QW * 2, QH * 2), (0, 0, 0, 0))
    for f in range(1, 5):
        c = celula(f)
        ox, oy, esc = encaixe(f)
        c = c.resize((round(c.width * esc), round(c.height * esc)), Image.LANCZOS)
        out.alpha_composite(c, (round(ox), round(oy)))
    out.save(os.path.join(SRC, 'p8_ref.png'))
    print('ref ok', out.size)


def exemplo():
    """tools/art_src/p8_exemplo.png = a grade de referência com 4 chapéus que já existem (cartola, palha, gorro,
    cogumelo), postos como no app. Serve de anexo 1 quando o estilo_a.png não está na máquina."""
    meta = json.loads(re.search(r'CF\.ROUPA8 = (\{.*\});', open(os.path.join(ROOT, 'src', 'roupa8_meta.js'), encoding='utf-8').read(), re.S).group(1))
    comp = Image.open(os.path.join(SRC, 'p8_ref.png')).convert('RGBA')
    for f, pid in zip(range(1, 5), ('cartola', 'palha', 'gorro', 'cogumelo')):
        x, y, _ = meta[pid][str(f)]
        ox, oy, esc = encaixe(f)
        c = celula(f)
        img = Image.open(os.path.join(DST, '%s_%d.png' % (pid, f))).convert('RGBA')   # já na escala da grade
        comp.alpha_composite(img, (round(ox + x * esc * c.width), round(oy + y * esc * c.height)))
    comp.save(os.path.join(SRC, 'p8_exemplo.png'))
    return os.path.join(SRC, 'p8_exemplo.png')


def gera(ids, wsl):
    estilo = os.path.join(SRC, 'estilo_a.png')
    refp = os.path.join(SRC, 'p8_ref.png')
    if not os.path.exists(refp):
        ref()
    texto = PROMPT
    if not os.path.exists(estilo):
        estilo = exemplo()
        texto = PROMPT.replace('Anexo 1 = o estilo aprovado do jogo (papel recortado, formas chapadas SEM contorno, textura de papel).',
                               'Anexo 1 = exemplo de outras pecas ja vestidas no Torrao (o estilo e o encaixe que o jogo usa: papel recortado, '
                               'formas chapadas SEM contorno, textura de papel). NAO copie essas pecas: desenhe so a peca pedida.')
    for pid in ids:
        nome = 'p8_v_' + pid
        if os.path.exists(os.path.join(SRC, nome + '.png')):
            continue
        n, _ = G.gera(nome, texto.format(peca=PECAS[pid]), wsl, [estilo, refp])
        if n == 0 and not wsl and os.name == 'nt':
            wsl = True
            n, _ = G.gera(nome, texto.format(peca=PECAS[pid]), wsl, [estilo, refp])
        if n == 0:
            G.status('%s nao gerou nada. Parei.' % nome)
            return
    G.status('FIM p8')


def ancoras():
    t = open(os.path.join(ROOT, 'src', 'careca_meta.js'), encoding='utf-8').read()
    return json.loads(re.search(r'CF\.ANCORAS_CARECA = (\{.*?\});', t, re.S).group(1))


def recorta_fase(base, vest, fase, an0, pid=''):
    """base/vest: arrays RGBA do quadrado da fase. Devolve a peça (RGBA do tamanho do quadrado) ou None."""
    ox, oy, esc = encaixe(fase)
    qx, qy = ((fase - 1) % 2) * QW, ((fase - 1) // 2) * QH
    c = celula(fase)
    cw, ch = c.size
    # âncoras do quadro 0 em pixels do quadrado
    ex, ey, topo, esq, dir_, _ = an0
    px = lambda fx: ox - qx + fx * cw * esc
    py = lambda fy: oy - qy + fy * ch * esc
    EX, EY, TOPO, ESQ, DIR = px(ex), py(ey), py(topo), px(esq), px(dir_)
    hw = DIR - ESQ
    ab = base[..., 3] > 128
    # alinha pelo corpo (abaixo dos olhos), onde a peça não mexe
    def prep(a):
        g = cv2.cvtColor(np.ascontiguousarray(a[..., :3]), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
        return cv2.GaussianBlur(g * (a[..., 3] > 128), (0, 0), 2.5)
    gb, gv = prep(base), prep(vest)
    mask = np.zeros(gb.shape, np.uint8)
    mask[int(EY + (EY - TOPO) * 0.6):] = 255
    W = np.eye(2, 3, dtype=np.float32)
    try:
        _, W = cv2.findTransformECC(gb, gv, W, cv2.MOTION_AFFINE,
                                    (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), mask, 5)
    except cv2.error as e:
        print('  alinhamento falhou, usando sem mexer', fase)
    v = cv2.warpAffine(vest, W, (QW, QH), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderValue=(0, 0, 0, 0))
    av = v[..., 3] > 128
    lb = cv2.cvtColor(cv2.GaussianBlur(np.ascontiguousarray(base[..., :3]), (0, 0), 1.5), cv2.COLOR_RGB2LAB).astype(np.float32)
    lv = cv2.cvtColor(cv2.GaussianBlur(np.ascontiguousarray(v[..., :3]), (0, 0), 1.5), cv2.COLOR_RGB2LAB).astype(np.float32)
    dif = np.linalg.norm(lb - lv, axis=2)
    fora = av & ~cv2.dilate(ab.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    dentro = av & ab & (dif > 28)
    # sobrancelha (creme rosado) que o gerador desenhou num lugar um pouco diferente não é peça
    vr, vg, vb = [v[..., i].astype(int) for i in range(3)]
    sobr = (vr > 200) & (vg > 165) & (vr - vb > 40) & (vr - vb < 85) & (vg - vb < 40)
    sobr[:int(TOPO + (EY - TOPO) * 0.3)] = False
    dentro &= ~sobr
    # cor da própria cabeça do Torrão (terra, sombra, musgo, sobrancelha): o gerador redesenha a cabeça um pouco
    # diferente e essas diferenças não são peça. Paleta tirada da cabeça da base (sem o preto dos olhos).
    pele = np.zeros(ab.shape, bool)
    zc = np.zeros(ab.shape, bool)
    zc[int(TOPO):int(EY + (EY - TOPO) * 0.4), max(0, int(ESQ)):int(DIR)] = True
    pix = lb[zc & ab & (lb[..., 0] > 60)].reshape(-1, 3).astype(np.float32)
    if len(pix) > 50:
        _, _, centros = cv2.kmeans(pix, 8, None, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0), 3, cv2.KMEANS_PP_CENTERS)
        if 'branco' in MANTER.get(pid, ''):      # peça branca/creme: a sobrancelha creme sai da paleta
            centros = centros[centros[:, 0] < 200]
        dist = np.min(np.linalg.norm(lv[..., None, :] - centros[None, None], axis=3), axis=2)
        if 'marrom' in MANTER.get(pid, ''):
            # peça marrom/bege: só limpa no rosto (da metade da testa pra baixo), com tolerância pequena
            pele = dist < 8
            pele[:int(TOPO + (EY - TOPO) * 0.55)] = False
            dentro &= ~pele
        else:
            pele = dist < 14
            dentro &= ~pele
            fora &= ~pele
    # olho repetido: pontinho escuro que o gerador desenhou na altura dos olhos, num lugar um pouco diferente
    escuro = lv[..., 0] < 60
    perto = np.zeros(ab.shape, bool)
    perto[int(TOPO + (EY - TOPO) * 0.8):int(EY + (EY - TOPO) * 0.5), max(0, int(EX - hw * 0.45)):int(EX + hw * 0.45)] = True
    dentro &= ~(escuro & perto)
    fora &= ~(escuro & perto)
    # tom de pele do Torrão (terra marrom-alaranjada, clara ou na sombra) e sobrancelha fora da cabeça:
    # vale pras peças que não têm essa cor (as marrons e laranjas ficam de fora)
    manter0 = MANTER.get(pid, '')
    if 'marrom' not in manter0 and 'laranja' not in manter0:
        hsv = cv2.cvtColor(np.ascontiguousarray(v[..., :3]), cv2.COLOR_RGB2HSV)
        tom = (hsv[..., 0] >= 6) & (hsv[..., 0] <= 22) & (hsv[..., 1] > 70) & (hsv[..., 2] > 50) & (hsv[..., 2] < 215)
        pele |= tom
        dentro &= ~tom
        fora &= ~tom
    if 'branco' not in manter0 and 'marrom' not in manter0:
        fora &= ~sobr
    m = (fora | dentro).astype(np.uint8)
    manter = MANTER.get(pid, '')
    planta = np.zeros(m.shape, bool)
    if 'verde' not in manter:
        planta |= (vg > vr) & (vg > vb)
    if 'laranja' not in manter:
        planta |= (vr > 200) & (vg > 90) & (vg < 170) & (vb < 80)
    if 'branco' not in manter:
        planta |= (vr > 225) & (vg > 225) & (vb > 210)
    m[planta] = 0
    # só perto da cabeça: da altura de baixo dos olhos pra cima, sem pegar as plantas das costas longe da cabeça
    zona = np.zeros_like(m)
    y1 = int(EY + (EY - TOPO) * 0.55)
    zona[:y1, max(0, int(ESQ - hw * 0.45)):int(DIR + hw * 0.45)] = 1
    m &= zona
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, rot, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n <= 1:
        return None, None
    maior = st[1:, cv2.CC_STAT_AREA].max()
    m = np.isin(rot, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > maior * 0.1]).astype(np.uint8)
    cont, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cheia = np.zeros_like(m)
    cv2.drawContours(cheia, cont, -1, 1, -1)
    abaixo = np.zeros(ab.shape, bool)
    abaixo[int(TOPO + (EY - TOPO) * 0.1):] = True
    m = cheia & av.astype(np.uint8) & (~(pele & abaixo)).astype(np.uint8)    # buraco tapado não traz pele de volta (da altura da cabeça pra baixo)
    peca = v.copy()
    # 1) vão entre a aba e a cabeça: o gerador desenhou a cabeça um pouco diferente, então em algumas colunas a borda
    #    de baixo da peça fica acima da cabeça da base e aparece o fundo. Estica a cor da peça pra baixo até encostar.
    hm = m.astype(bool)
    cab = ab[:int(EY)].any(axis=0)                    # colunas onde existe cabeça
    folga = max(3, int(hw * 0.06))
    vao = np.zeros(hm.shape, bool)
    for x in np.where(cab & hm.any(axis=0))[0]:
        yh = np.where(hm[:, x])[0].max()
        yb = np.argmax(ab[:, x])
        if ab[yb, x] and 0 < yb - yh <= folga:
            vao[yh + 1:min(QH, yb + 3), x] = True     # entra 2px na cabeça pra não sobrar fresta
    if vao.any():
        # cor espalhada a partir da peça (média dos vizinhos que são peça), sem listras
        cor = peca[..., :3].astype(np.float32) * hm[..., None]
        peso = hm.astype(np.float32)
        for _ in range(folga + 3):
            cor = np.maximum(cor, cv2.blur(cor, (5, 5)) / np.maximum(cv2.blur(peso, (5, 5)), 1e-3)[..., None] * (peso < 0.5)[..., None])
            peso = np.maximum(peso, (cv2.blur(peso, (5, 5)) > 0).astype(np.float32))
        peca[vao, :3] = np.clip(cor[vao], 0, 255).astype(np.uint8)
        peca[vao, 3] = 255
        hm |= vao
    m = hm.astype(np.uint8)
    # 2) bordinha clara do recorte: a cor da borda vem de dentro da peça (sem halo)
    miolo = cv2.erode(m, np.ones((5, 5), np.uint8))
    borda = (cv2.dilate(m, np.ones((3, 3), np.uint8)) & (1 - miolo)).astype(np.uint8)
    peca[..., :3] = cv2.inpaint(np.ascontiguousarray(peca[..., :3]), borda, 3, cv2.INPAINT_TELEA)
    alfa = np.minimum(cv2.GaussianBlur(m.astype(np.float32), (0, 0), 0.6), 1)
    peca[..., 3] = (alfa * np.maximum(peca[..., 3], m * 255)).astype(np.uint8)
    img = Image.fromarray(peca)
    bb = img.getbbox()
    if not bb:
        return None, None
    # posição em fração da célula (quadro 0)
    pos = [round((bb[0] - (ox - qx)) / esc / cw, 4), round((bb[1] - (oy - qy)) / esc / ch, 4),
           round((bb[2] - bb[0]) / esc / cw, 4)]
    return img.crop(bb), pos, v


def recorta(ids):
    base = np.array(Image.open(os.path.join(SRC, 'p8_ref.png')).convert('RGBA'))
    anc = ancoras()
    metap = os.path.join(ROOT, 'src', 'roupa8_meta.js')
    meta = {}
    if os.path.exists(metap):
        meta = json.loads(re.search(r'CF\.ROUPA8 = (\{.*\});', open(metap, encoding='utf-8').read(), re.S).group(1))
    os.makedirs(DST, exist_ok=True)
    for pid in ids:
        p = os.path.join(SRC, 'p8_v_%s.png' % pid)
        if not os.path.exists(p):
            print('falta', p)
            continue
        vest = Image.open(p).convert('RGBA')
        if vest.size != (QW * 2, QH * 2):
            vest = vest.resize((QW * 2, QH * 2), Image.LANCZOS)
        vest = np.array(vest)
        meta[pid] = {}
        comp = Image.fromarray(base).copy()
        alinhado = Image.new('RGBA', comp.size, (0, 0, 0, 0))
        for f in range(1, 5):
            qx, qy = ((f - 1) % 2) * QW, ((f - 1) // 2) * QH
            r = recorta_fase(base[qy:qy + QH, qx:qx + QW], vest[qy:qy + QH, qx:qx + QW], f, anc[str(f)][0], pid)
            if r[0] is None:
                print(pid, f, 'nao achou a peca')
                continue
            img, pos, v = r
            img.save(os.path.join(DST, '%s_%d.png' % (pid, f)), optimize=True)
            if f == 1 and pid in NOVAS:      # peça nova: o ícone do guarda-roupa é a peça da fase 1
                img.save(os.path.join(ROOT, 'assets', 'roupa', pid + '.png'), optimize=True)
            meta[pid][f] = pos
            ox, oy, esc = encaixe(f)
            comp.alpha_composite(img, (round(ox + pos[0] * esc * celula(f).width), round(oy + pos[1] * esc * celula(f).height)))
            alinhado.alpha_composite(Image.fromarray(v), (qx, qy))
        print(pid, meta[pid])
        fundo = lambda im: Image.alpha_composite(Image.new('RGBA', im.size, (120, 170, 200, 255)), im).convert('RGB')
        out = Image.new('RGB', (QW * 2 * 3, QH * 2))
        for i, im in enumerate([Image.fromarray(base), alinhado, comp]):
            out.paste(fundo(im), (i * QW * 2, 0))
        out.thumbnail((2400, 800))
        out.save(os.path.join(DBG, 'p8_%s.jpg' % pid), quality=85)
    with open(metap, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('// Gerado por tools/arte8.py: chapéus desenhados JÁ VESTIDOS no Torrão sem planta.\n')
        fh.write('// CF.ROUPA8[id][fase] = [x, y, largura] da peça no quadro 0 (fração da célula); nos outros quadros ela segue a cabeça.\n')
        fh.write('window.CF = window.CF || {};\nCF.ROUPA8 = %s;\n' % json.dumps(meta))


def ver(ids):
    """Cada peça nos 16 quadros de cada fase, com a mesma conta do src/pet.js -> tools/debug/p8_ver_<id>.jpg"""
    anc = ancoras()
    meta = json.loads(re.search(r'CF\.ROUPA8 = (\{.*\});', open(os.path.join(ROOT, 'src', 'roupa8_meta.js'), encoding='utf-8').read(), re.S).group(1))
    for pid in ids:
        if pid not in meta:
            continue
        linhas = []
        for f in range(1, 5):
            r8 = meta[pid].get(str(f))
            if not r8:
                continue
            peca = Image.open(os.path.join(DST, '%s_%d.png' % (pid, f))).convert('RGBA')
            a0 = anc[str(f)][0]
            cels = []
            for k in range(16):
                c = celula(f, k)
                cw, ch = c.size
                ex, ey, topo, esq, dir_, _ = anc[str(f)][k]
                sx = (dir_ - esq) / (a0[4] - a0[3]); sy = (ey - topo) / (a0[1] - a0[2])
                x = (esq + dir_) / 2 + (r8[0] - (a0[3] + a0[4]) / 2) * sx
                y = topo + (r8[1] - a0[2]) * sy
                w = max(1, round(r8[2] * sx * cw))
                p = peca.resize((w, max(1, round(peca.height * w / peca.width))), Image.LANCZOS)
                t = Image.new('RGBA', (cw, ch + 60), (120, 170, 200, 255))
                t.alpha_composite(c, (0, 60))
                t.alpha_composite(p, (round(x * cw), round(y * ch) + 60))
                cels.append(t.convert('RGB'))
            L = Image.new('RGB', (sum(c.width for c in cels), cels[0].height))
            xx = 0
            for c in cels:
                L.paste(c, (xx, 0)); xx += c.width
            linhas.append(L)
        out = Image.new('RGB', (max(l.width for l in linhas), sum(l.height for l in linhas)))
        yy = 0
        for l in linhas:
            out.paste(l, (0, yy)); yy += l.height
        out.thumbnail((2600, 1400))
        out.save(os.path.join(DBG, 'p8_ver_%s.jpg' % pid), quality=82)
        print('ver', pid, out.size)


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'ver':
        ids = next((a.split(',') for a in sys.argv[2:] if not a.startswith('--')), list(PECAS))
        return ver(ids)
    ids = next((a.split(',') for a in sys.argv[2:] if not a.startswith('--')), list(PECAS))
    if cmd == 'ref':
        ref()
    elif cmd == 'gera':
        gera(ids, '--wsl' in sys.argv)
    elif cmd == 'recorta':
        recorta(ids)
    else:
        print(__doc__)


if __name__ == '__main__':
    main()

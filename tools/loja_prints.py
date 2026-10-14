"""Prints da Play Store: python tools/loja_prints.py

1. Fotografa 6 telas do app (modo foto: src/foto.js) com o Edge sem janela, em 1080x1920.
2. Põe a legenda em cima de cada uma (tools/loja_legenda.html) e salva em loja/pt-BR/print_N.png.
Também gera loja/icone.png (512) e loja/banner.png (1024x500). Precisa do servidor local ligado (porta 8620).
A pasta loja/ fica fora do git.
"""
import os, shutil, subprocess, tempfile, time, urllib.parse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOJA = os.path.join(ROOT, 'loja')
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
BASE = 'http://localhost:8620/'

LEGENDAS = {
    1: ('Inglês todo dia', 'A aula do dia em 3 passos, uns 20 minutos'),
    2: ('Frases de verdade', 'Com áudio, pra ouvir e repetir'),
    3: ('Converse falando', 'A IA ouve sua voz e corrige gramática e pronúncia'),
    4: ('Descubra seu nível', 'Teste completo, no padrão A1 a C2'),
    5: ('Um bichinho que cresce', 'Estude, ganhe laranjas e decore o quarto do Torrão'),
    6: ('Revisão na hora certa', 'Cada frase vira uma planta: rega antes de esquecer'),
}


def foto(url, saida, larg, alt, escala=1):
    """Tela de larg x alt (pixels CSS). O Edge sem janela não aceita menos de ~492 de largura: por isso o app é fotografado
    em 504x896 (9:16) e ampliado pra 1080x1920."""
    perfil = tempfile.mkdtemp(prefix='torrao_foto_')
    try:
        subprocess.run([EDGE, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
                        '--window-size=%d,%d' % (larg, alt), '--force-device-scale-factor=%s' % escala,
                        '--virtual-time-budget=8000', '--user-data-dir=' + perfil, '--screenshot=' + saida, url],
                       capture_output=True, timeout=90)
    finally:
        time.sleep(0.5)
        shutil.rmtree(perfil, ignore_errors=True)
    if not os.path.exists(saida):
        raise SystemExit('não saiu: ' + saida)
    im = Image.open(saida)
    im.crop((0, 0, round(larg * escala), round(alt * escala))).convert('RGB').save(saida)


def main():
    cru = os.path.join(LOJA, 'cru'); os.makedirs(cru, exist_ok=True)
    pt = os.path.join(LOJA, 'pt-BR'); os.makedirs(pt, exist_ok=True)
    for n, (titulo, sub) in LEGENDAS.items():
        a = os.path.join(cru, '%d.png' % n)
        foto(BASE + '?foto=%d&loja=1&mudo=1' % n, a, 504, 896, 1080 / 504)
        q = urllib.parse.urlencode({'img': '../loja/cru/%d.png' % n, 't': titulo, 's': sub, 'n': n})
        foto(BASE + 'tools/loja_legenda.html?' + q, os.path.join(pt, 'print_%d.png' % n), 1080, 1920)
        print('print', n, Image.open(os.path.join(pt, 'print_%d.png' % n)).size)
    foto(BASE + 'tools/loja_legenda.html?banner=1', os.path.join(LOJA, 'banner.png'), 1024, 500)
    # ícone: o mesmo do app (creme com o Torrão), 512x512
    from build_apk import bicho, CREME
    ic = Image.new('RGBA', (512, 512), CREME)
    b = bicho(400)
    ic.paste(b, ((512 - b.width) // 2, (512 - b.height) // 2), b)
    ic.convert('RGB').save(os.path.join(LOJA, 'icone.png'))
    print('banner e ícone ok')


if __name__ == '__main__':
    main()

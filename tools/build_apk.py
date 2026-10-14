"""Gera o APK do Torrão: python tools/build_apk.py

Copia o app pra android/app/src/main/assets/www, gera os ícones a partir do Torrão e compila com as ferramentas
que já estão no PC (~/androidtools: JDK 21, Gradle 8.11.1, Android SDK 36), igual ao Frutas Fujonas.
Saída: Torrao.apk na pasta do projeto. Cada build ganha um número de versão novo (android/versao.txt).
"""
import os, shutil, subprocess, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AND = os.path.join(ROOT, 'android')
WWW = os.path.join(AND, 'app', 'src', 'main', 'assets', 'www')
RES = os.path.join(AND, 'app', 'src', 'main', 'res')
TOOLS = os.path.join(os.path.expanduser('~'), 'androidtools')
CREME = (244, 227, 195, 255)


def copia_app():
    if os.path.isdir(WWW):
        shutil.rmtree(WWW)
    os.makedirs(WWW)
    shutil.copy2(os.path.join(ROOT, 'index.html'), os.path.join(WWW, 'index.html'))
    for d in ('src', 'assets'):
        shutil.copytree(os.path.join(ROOT, d), os.path.join(WWW, d))


def bicho(lado):
    """O Torrão filhote centralizado numa tela quadrada transparente."""
    im = Image.open(os.path.join(ROOT, 'assets', 'pet', '1-tranquilo.png')).convert('RGBA')
    im = im.crop(im.getbbox())
    esc = lado / max(im.size)
    im = im.resize((max(1, round(im.width * esc)), max(1, round(im.height * esc))), Image.LANCZOS)
    t = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    t.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2), im)
    return t


def icones():
    # Android antigo: quadrado arredondado creme com o Torrão
    for nome, tam in (('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)):
        d = os.path.join(RES, 'mipmap-' + nome)
        os.makedirs(d, exist_ok=True)
        base = Image.new('RGBA', (tam, tam), (0, 0, 0, 0))
        ImageDraw.Draw(base).rounded_rectangle((0, 0, tam - 1, tam - 1), radius=tam // 5, fill=CREME)
        b = bicho(round(tam * 0.78))
        base.paste(b, ((tam - b.width) // 2, (tam - b.height) // 2), b)
        base.save(os.path.join(d, 'ic_launcher.png'))
    # Android 8+: ícone adaptativo (o aparelho recorta no formato dele; o desenho fica na área segura do meio)
    nd = os.path.join(RES, 'drawable-nodpi'); os.makedirs(nd, exist_ok=True)
    Image.new('RGB', (432, 432), CREME[:3]).save(os.path.join(nd, 'ic_fundo.png'))
    frente = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
    b = bicho(260)
    frente.paste(b, ((432 - b.width) // 2, (432 - b.height) // 2), b)
    frente.save(os.path.join(nd, 'ic_frente.png'))
    ad = os.path.join(RES, 'mipmap-anydpi-v26'); os.makedirs(ad, exist_ok=True)
    with open(os.path.join(ad, 'ic_launcher.xml'), 'w') as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n'
                '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
                '    <background android:drawable="@drawable/ic_fundo"/>\n'
                '    <foreground android:drawable="@drawable/ic_frente"/>\n'
                '</adaptive-icon>\n')


VERSAO = os.path.join(AND, 'versao.txt')


def proxima_versao():
    v = int(open(VERSAO).read().strip()) if os.path.exists(VERSAO) else 0
    v += 1
    with open(VERSAO, 'w') as f:
        f.write(str(v))
    return v


def grava_versao(v):
    """O app precisa saber a própria versão pra avisar quando tem uma mais nova no GitHub."""
    with open(os.path.join(ROOT, 'src', 'versao.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('// Gerado por tools/build_apk.py: número desta versão do app (igual ao versionCode do APK).\n'
                'window.CF = window.CF || {};\nCF.VERSAO = %d;\n' % v)


def compila(v):
    """Gera as duas versões: amigos (APK do GitHub) e loja (AAB pra Play Store)."""
    env = dict(os.environ, JAVA_HOME=os.path.join(TOOLS, 'jdk21'))
    gradle = os.path.join(TOOLS, 'gradle-8.11.1', 'bin', 'gradle.bat')
    tarefas = ['assembleAmigosRelease', 'bundleLojaRelease', '-q', '-PvCode=%d' % v]
    r = subprocess.run([gradle] + tarefas + ['--offline'], cwd=AND, env=env, shell=True)
    if r.returncode:
        r = subprocess.run([gradle] + tarefas, cwd=AND, env=env, shell=True)
    if r.returncode:
        sys.exit('falhou o gradle')
    apk = os.path.join(AND, 'app', 'build', 'outputs', 'apk', 'amigos', 'release', 'app-amigos-release.apk')
    aab = os.path.join(AND, 'app', 'build', 'outputs', 'bundle', 'lojaRelease', 'app-loja-release.aab')
    shutil.copy2(apk, os.path.join(ROOT, 'Torrao.apk'))
    shutil.copy2(aab, os.path.join(ROOT, 'Torrao.aab'))
    print('APK (amigos):', os.path.join(ROOT, 'Torrao.apk'), '%.1f MB' % (os.path.getsize(apk) / 1e6), 'versao', v)
    print('AAB (loja):', os.path.join(ROOT, 'Torrao.aab'), '%.1f MB' % (os.path.getsize(aab) / 1e6))


if __name__ == '__main__':
    v = proxima_versao()
    grava_versao(v)
    copia_app()
    icones()
    compila(v)

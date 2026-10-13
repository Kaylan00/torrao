"""Publica uma versão nova do Torrão no GitHub (repositório público Kaylan00/torrao).

Uso:  python tools/build_apk.py                      (gera o Torrao.apk com número de versão novo)
      python tools/publicar.py "o que mudou nesta versão"

O que faz: salva tudo no git (commit + push) e cria a Release "v<versão>" com o Torrao.apk anexado.
O app instalado confere a última Release e mostra "Versão nova!" no quarto, com o botão de baixar.
"""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = 'Kaylan00/torrao'


def roda(*cmd, ok_falha=False):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
    if r.returncode and not ok_falha:
        sys.exit('falhou: %s\n%s%s' % (' '.join(cmd), r.stdout, r.stderr))
    return r.stdout.strip()


def main():
    notas = sys.argv[1] if len(sys.argv) > 1 else 'Melhorias no Torrão.'
    v = int(open(os.path.join(ROOT, 'android', 'versao.txt')).read().strip())
    apk = os.path.join(ROOT, 'Torrao.apk')
    if not os.path.exists(apk):
        sys.exit('Falta o Torrao.apk. Roda antes: python tools/build_apk.py')
    roda('git', 'add', '-A')
    if roda('git', 'status', '--porcelain'):
        roda('git', 'commit', '-m', 'Versão %d: %s\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>' % (v, notas))
    roda('git', 'push', '-u', 'origin', 'HEAD')
    tag = 'v%d' % v
    if roda('gh', 'release', 'view', tag, '--repo', REPO, ok_falha=True):
        roda('gh', 'release', 'upload', tag, apk, '--clobber', '--repo', REPO)
        print('Release %s já existia: APK atualizado.' % tag)
    else:
        roda('gh', 'release', 'create', tag, apk, '--repo', REPO, '--title', 'Torrão versão %d' % v, '--notes', notas)
        print('Release %s publicada.' % tag)
    print('https://github.com/%s/releases/tag/%s' % (REPO, tag))


if __name__ == '__main__':
    main()

"""Servidorzinho local do Torrão (usado pelo ABRIR_TORRAO.bat), igual ao "python -m http.server",
mas mandando o navegador NÃO guardar cópia velha: assim a janela do PC sempre mostra a versão nova do app.
Uso: python tools/servidor.py [porta]   (padrão 8620, servindo a pasta do projeto)
"""
import functools, http.server, os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *a):
        pass   # janela do servidor quietinha


def main():
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8620
    h = functools.partial(SemCache, directory=RAIZ)
    with http.server.ThreadingHTTPServer(('127.0.0.1', porta), h) as s:
        print('Torrao em http://localhost:%d (pode minimizar esta janela)' % porta)
        s.serve_forever()


if __name__ == '__main__':
    main()

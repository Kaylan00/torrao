"""Torrão no Google Play pela API oficial (mesma conta de serviço do Frutas Fujonas).

Uso:
  python tools/play_torrao.py ficha        textos, contato e imagens da loja (loja/: tools/loja_prints.py)
  python tools/play_torrao.py versao [faixa] [--rascunho]   envia o Torrao.aab (faixa: production, internal...)
  python tools/play_torrao.py produtos     cria/atualiza os pacotes de laranja e o Torrão Completo

Chave da API: D:\\backups\\chaves_frutas\\play_api.json (nunca vai pro repositório).
"""
import glob, os, sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import loja_textos as T

P = 'com.temperaguache.torrao'
CHAVE = r'D:\backups\chaves_frutas\play_api.json'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOJA = os.path.join(ROOT, 'loja')
SITE = 'https://kaylan00.github.io/torrao/'
EMAIL = 'temperaguachegames@gmail.com'

# (id, título, descrição, BRL, USD, EUR)
PRODUTOS = [
    ('laranjas_120', '120 laranjas', 'Pacote de 120 laranjas pra comprar roupas, quartos e móveis pro Torrão.', '4.90', '0.99', '0.99'),
    ('laranjas_280', '280 laranjas', 'Pacote de 280 laranjas pra comprar roupas, quartos e móveis pro Torrão.', '9.90', '1.99', '1.99'),
    ('torrao_completo', 'Torrão Completo', 'Libera todas as roupas, skins, quartos e móveis de uma vez e dá 300 laranjas pras novidades. Pagamento único.', '19.90', '3.99', '3.99'),
]


def servico():
    c = service_account.Credentials.from_service_account_file(CHAVE, scopes=['https://www.googleapis.com/auth/androidpublisher'])
    return build('androidpublisher', 'v3', credentials=c, cache_discovery=False)


def ficha():
    assert len(T.TITULO) <= 30 and len(T.CURTA) <= 80 and len(T.COMPLETA) <= 4000, (len(T.TITULO), len(T.CURTA), len(T.COMPLETA))
    s = servico()
    e = s.edits().insert(packageName=P, body={}).execute()['id']
    s.edits().details().update(packageName=P, editId=e, body={'defaultLanguage': 'pt-BR', 'contactEmail': EMAIL, 'contactWebsite': SITE}).execute()
    s.edits().listings().update(packageName=P, editId=e, language='pt-BR',
                                body={'language': 'pt-BR', 'title': T.TITULO, 'shortDescription': T.CURTA, 'fullDescription': T.COMPLETA}).execute()
    prints = sorted(glob.glob(os.path.join(LOJA, 'pt-BR', 'print_*.png')))
    for tipo, arqs in (('icon', [os.path.join(LOJA, 'icone.png')]), ('featureGraphic', [os.path.join(LOJA, 'banner.png')]), ('phoneScreenshots', prints)):
        s.edits().images().deleteall(packageName=P, editId=e, language='pt-BR', imageType=tipo).execute()
        for a in arqs:
            s.edits().images().upload(packageName=P, editId=e, language='pt-BR', imageType=tipo, media_body=MediaFileUpload(a, mimetype='image/png')).execute()
        print('imagens', tipo, len(arqs))
    s.edits().commit(packageName=P, editId=e).execute()
    print('ficha ok')


def versao(faixa='production', rascunho=True):
    s = servico()
    e = s.edits().insert(packageName=P, body={}).execute()['id']
    b = s.edits().bundles().upload(packageName=P, editId=e, media_body=MediaFileUpload(os.path.join(ROOT, 'Torrao.aab'), mimetype='application/octet-stream', resumable=True)).execute()
    v = str(b['versionCode'])
    rel = {'versionCodes': [v], 'status': 'draft' if rascunho else 'completed', 'releaseNotes': [{'language': 'pt-BR', 'text': T.NOTAS}]}
    s.edits().tracks().update(packageName=P, editId=e, track=faixa, body={'track': faixa, 'releases': [rel]}).execute()
    s.edits().commit(packageName=P, editId=e).execute()
    print('versão', v, 'na faixa', faixa, rel['status'])


def money(moeda, valor):
    u, n = valor.split('.')
    return {'currencyCode': moeda, 'units': u, 'nanos': int(n.ljust(9, '0'))}


def produtos():
    s = servico()
    for pid, titulo, desc, brl, usd, eur in PRODUTOS:
        r = s.monetization().convertRegionPrices(packageName=P, body={'price': money('USD', usd)}).execute()
        versao_reg = r['regionVersion']['version']
        reg = []
        for rc, c in sorted(r['convertedRegionPrices'].items()):
            p = c['price']
            if rc == 'BR': p = money('BRL', brl)
            elif rc == 'US': p = money('USD', usd)
            elif p['currencyCode'] == 'EUR': p = money('EUR', eur)
            reg.append({'regionCode': rc, 'price': p, 'availability': 'AVAILABLE'})
        body = {
            'packageName': P, 'productId': pid,
            'listings': [{'languageCode': 'pt-BR', 'title': titulo, 'description': desc}],
            'purchaseOptions': [{
                'purchaseOptionId': 'compra',
                'buyOption': {'legacyCompatible': True, 'multiQuantityEnabled': False},
                'regionalPricingAndAvailabilityConfigs': reg,
                'newRegionsConfig': {'availability': 'AVAILABLE', 'usdPrice': money('USD', usd), 'eurPrice': money('EUR', eur)},
            }],
        }
        s.monetization().onetimeproducts().patch(packageName=P, productId=pid, allowMissing=True, updateMask='listings,purchaseOptions',
                                                 regionsVersion_version=versao_reg, body=body).execute()
        s.monetization().onetimeproducts().purchaseOptions().batchUpdateStates(packageName=P, productId=pid, body={'requests': [
            {'activatePurchaseOptionRequest': {'packageName': P, 'productId': pid, 'purchaseOptionId': 'compra'}}]}).execute()
        print('produto ok', pid)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'ficha': ficha()
    elif cmd == 'versao':
        args = [a for a in sys.argv[2:] if not a.startswith('--')]
        versao(args[0] if args else 'production', rascunho='--publicar' not in sys.argv)
    elif cmd == 'produtos': produtos()
    else: print(__doc__)

# Torrão na Play Store

## Como o app está dividido

- **loja** (Play Store, `Torrao.aab`):
  - Assinada com a chave oficial `~/androidtools/chaves/torrao.jks`, que tem cópia em `D:\backups\chaves_torrao`. Perder essa chave impede atualizar o app.
  - Roupas, skins e quartos custam laranjas. Os preços estão em `CF.precoRoupa`, `CF.precoSkin` e `CF.precoQuarto`, no `src/logic.js`.
  - Tem pacotes de laranja (Google Play Billing) e vídeo premiado (AdMob, até 3 por dia, +5 laranjas cada).
  - O plano usa frases genéricas (`src/generico.js`). Não tem aviso de versão nova pelo GitHub.
- **amigos** (GitHub, `Torrao.apk`):
  - Assinada com a chave de teste, pra quem já tem o app instalado conseguir atualizar por cima.
  - Tudo liberado, com o plano pessoal e o aviso "Versão nova!".
- **Código de testador** (só na loja): em Progresso > Ajustes > Tenho um código, `testador2026` libera tudo. O app guarda só o SHA-256 do código (`CODIGOS` no `src/app.js`). Serve pros amigos e pro revisor do Google. Pra criar outro código: SHA-256 dele em maiúsculas e sem espaços.
- **Testar a loja no PC:** abrir `http://localhost:8620/?loja=1&mudo=1`.

## Pacotes de laranja (criar no Play Console > Monetizar > Produtos no app)

| ID | Laranjas | Preço sugerido |
|---|---|---|
| laranjas_120 | 120 | R$ 4,90 |
| laranjas_280 | 280 | R$ 9,90 |
| torrao_completo | tudo liberado + 300 de bônus | R$ 19,90 |

Os pacotes de laranja são consumíveis: o app soma as laranjas e consome a compra.
O `torrao_completo` é compra única (não consumível): libera tudo que existe hoje e dá 300 laranjas pras novidades. O app só confirma a compra, sem consumir, e ela volta sozinha se a pessoa trocar de celular.
Os IDs precisam ser exatamente esses.

## Falta fazer

1. Conta do AdMob:
   - Criar o app no AdMob e um bloco de anúncio "Premiado".
   - Trocar `ADMOB_APP` e `ADMOB_PREMIADO` em `android/app/build.gradle`. Hoje estão os IDs de teste do Google.
   - Publicar o arquivo `app-ads.txt` no site da organização.
2. Política de privacidade: página pública explicando microfone, áudio e texto enviados pra IA (OpenRouter), anúncios (AdMob) e compras.
3. Play Console:
   - Criar o app (pacote `com.temperaguache.torrao`) e o perfil de pagamentos.
   - Criar os 3 produtos e preencher a "Segurança dos dados": microfone/áudio, ID de publicidade, compras.
   - Classificação indicativa 14+ (no Brasil, app com compras).
4. Página da loja: textos, ícone 512, banner 1024x500 e prints.
5. Testar a compra num teste interno instalado pela Play, com contas de "testador de licença".

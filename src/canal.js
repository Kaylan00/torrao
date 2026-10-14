// Qual versão do app é esta:
//   LOJA (Play Store): roupas, quartos e skins custam laranjas, dá pra comprar pacotes de laranja e ver vídeo premiado,
//                      o plano usa frases genéricas (src/generico.js) e não tem aviso de versão nova pelo GitHub.
//   amigos (APK do GitHub) e PC: tudo liberado, plano pessoal do dono, aviso "Versão nova!".
// Pra testar a versão da loja no PC: abre com ?loja=1 no endereço.
window.CF = window.CF || {};
CF.LOJA = (function () {
  try { if (window.Nativo && window.Nativo.loja && window.Nativo.loja()) return true; } catch (e) { /* segue */ }
  return /[?&]loja=1/.test(location.search);
})();

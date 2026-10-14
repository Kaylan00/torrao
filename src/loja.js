// Laranjas compradas (pacotes do Google Play) e vídeo premiado (AdMob). Só funciona na versão da Play Store,
// onde o Android liga as pontes window.Loja e window.Anuncio (android/app/src/loja).
// Pacotes são consumíveis: o app soma as laranjas, guarda o código da compra (nunca soma duas vezes) e manda consumir.
window.CF = window.CF || {};

(function () {
  const L = () => window.Loja, A = () => window.Anuncio;
  // preço padrão (antes de a Play responder); o de verdade vem da Play já na moeda de cada país
  CF.PACOTES = [
    { id: 'laranjas_60', qtd: 60, padrao: 'R$ 4,90' },
    { id: 'laranjas_150', qtd: 150, padrao: 'R$ 9,90', selo: 'Mais laranjas por real' },
    { id: 'laranjas_400', qtd: 400, padrao: 'R$ 19,90', selo: 'O melhor preço' }
  ];
  const precos = {};
  const avisa = (ev, x) => { if (CF.loja.aoMudar) CF.loja.aoMudar(ev, x); };

  CF.loja = {
    VIDEOS_DIA: 3, PREMIO_VIDEO: 5,
    aoMudar: null,                                  // o app liga isso (aviso + redesenhar)
    temCompra: () => !!L(),
    temVideo: () => !!A(),
    preco: id => precos[id] || (CF.PACOTES.find(p => p.id === id) || {}).padrao || '',
    iniciar() {
      try { if (L()) L().iniciar(CF.PACOTES.map(p => p.id).join(',')); } catch (e) { /* sem loja */ }
      try { if (A()) A().preparar(); } catch (e) { /* sem anúncio */ }
    },
    comprar(id) { try { if (L()) L().comprar(id); } catch (e) { avisa('cancelou'); } },
    videoPronto() { try { return !!(A() && A().pronto()); } catch (e) { return false; } },
    videosHoje() { const v = CF.estado.videos || {}; return v.data === CF.hoje() ? v.n || 0 : 0; },
    verVideo() { try { if (A()) A().mostrar(); } catch (e) { avisa('video-falhou'); } },
    temPrivacidade() { try { return !!(A() && A().temPrivacidade()); } catch (e) { return false; } },
    privacidade() { try { if (A()) A().privacidade(); } catch (e) { /* segue */ } }
  };

  window.CF_lojaPrecos = j => { Object.assign(precos, j || {}); avisa('precos'); };
  window.CF_lojaCompra = c => {
    const p = c && CF.PACOTES.find(x => x.id === c.id);
    if (!p || !c.token) return;
    const ts = (CF.estado.tokens = CF.estado.tokens || []);
    if (!ts.includes(c.token)) {
      CF.estado.frutas += p.qtd;
      ts.push(c.token);
      if (ts.length > 60) ts.splice(0, ts.length - 60);
      CF.salvar();
      avisa('compra', p);
    }
    try { L().consumir(c.token); } catch (e) { /* consome na próxima abertura */ }
  };
  window.CF_lojaFim = ok => { if (!ok) avisa('cancelou'); };
  window.CF_anuncio = ev => {
    if (ev === 'ganhou') {
      const v = CF.estado.videos && CF.estado.videos.data === CF.hoje() ? CF.estado.videos : { data: CF.hoje(), n: 0 };
      v.n = (v.n || 0) + 1;
      CF.estado.videos = v;
      CF.estado.frutas += CF.loja.PREMIO_VIDEO;
      CF.salvar();
    }
    avisa('video-' + ev);
  };
})();

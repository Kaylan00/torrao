// Voz do Torrão (falar) e ouvido (entender o que você fala em inglês).
// No APK: leitor de voz do Android (vozes neurais do Google, com sotaque à escolha) e reconhecimento de fala do Android,
// pela ponte window.Nativo. No navegador: vozes do sistema (no Edge, as "Natural" da Microsoft) e webkitSpeechRecognition.
window.CF = window.CF || {};

(function () {
  const MUDO = /[?&]mudo=1/.test(location.search);
  const N = () => window.Nativo;
  const CHAVE = 'torrao-voz';
  const SOTAQUE = { US: 'Americano', GB: 'Britânico', AU: 'Australiano', IN: 'Indiano', CA: 'Canadense', IE: 'Irlandês', ZA: 'Sul-africano', NZ: 'Neozelandês', NG: 'Nigeriano', SG: 'Singapura', PH: 'Filipino' };
  const ORDEM = ['US', 'GB', 'AU', 'CA', 'IE', 'IN', 'NZ', 'ZA', 'NG', 'SG', 'PH'];

  function cfg() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function salvar(c) { try { localStorage.setItem(CHAVE, JSON.stringify(Object.assign(cfg(), c))); } catch (e) { /* segue */ } }
  const pais = local => (String(local).split(/[-_]/)[1] || 'US').toUpperCase();

  // lista de vozes em inglês: [{ id, nome, sotaque, pais, nota }] (nota maior = soa mais natural)
  function vozes() {
    let lista = [];
    try {
      if (N() && N().vozes) {
        const brutas = JSON.parse(N().vozes() || '[]');
        // o Google tem a mesma voz "local" e "network": fica a de melhor qualidade
        const melhor = {};
        brutas.forEach(v => {
          const base = v.nome.replace(/-(local|network)$/, '');
          const nota = (v.qualidade || 0) + (v.rede ? 50 : 0);
          if (!melhor[base] || nota > melhor[base].nota) melhor[base] = Object.assign({}, v, { nota });
        });
        lista = Object.values(melhor).map(v => ({ id: v.nome, pais: pais(v.local), nota: v.nota }));
      } else if (window.speechSynthesis) {
        lista = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)).map(v => ({
          id: v.name, pais: pais(v.lang), apelido: v.name.replace(/^Microsoft\s+/, '').replace(/\s+-\s+.*$/, '').replace(/\s+Online/, ''),
          nota: (/natural/i.test(v.name) ? 300 : 0) + (/google/i.test(v.name) ? 100 : 0) + (v.localService ? 0 : 20)
        }));
      }
    } catch (e) { lista = []; }
    lista.sort((a, b) => (ORDEM.indexOf(a.pais) + 99) % 99 - (ORDEM.indexOf(b.pais) + 99) % 99 || b.nota - a.nota || (a.id < b.id ? -1 : 1));
    const cont = {};
    lista.forEach(v => {
      cont[v.pais] = (cont[v.pais] || 0) + 1;
      v.sotaque = SOTAQUE[v.pais] || v.pais;
      v.nome = v.sotaque + ' · ' + (v.apelido || 'voz ' + cont[v.pais]);
    });
    return lista;
  }

  // voz em uso: a escolhida, ou a mais natural com sotaque americano
  function atual() {
    const l = vozes(), c = cfg();
    return l.find(v => v.id === c.id) || l.filter(v => v.pais === 'US').sort((a, b) => b.nota - a.nota)[0] || l[0] || null;
  }

  let aoFimFala = null;
  window.CF_voz = function (ev) { if (ev === 'fim' && aoFimFala) { const f = aoFimFala; aoFimFala = null; f(); } };

  function falar(texto, aoFim) {
    const limpo = String(texto || '').replace(/\.\.\./g, '').replace(/[()]/g, '').trim();
    aoFimFala = null;
    if (MUDO || !limpo) { if (aoFim) setTimeout(aoFim, 300); return true; }
    const v = atual(), vel = cfg().vel || 1;
    try {
      if (N() && N().falar) {
        if (v && N().usarVoz) N().usarVoz(v.id);
        if (N().velocidade) N().velocidade(vel);
        aoFimFala = aoFim || null;
        N().falar(limpo);
        return true;
      }
      if (!window.speechSynthesis) return false;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(limpo);
      const sv = v && speechSynthesis.getVoices().find(x => x.name === v.id);
      if (sv) { u.voice = sv; u.lang = sv.lang; } else u.lang = 'en-US';
      u.rate = vel;
      if (aoFim) { u.onend = aoFim; u.onerror = aoFim; }
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function calar() {
    aoFimFala = null;
    try { if (N() && N().calar) N().calar(); else if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* segue */ }
  }

  // ---------- ouvido ----------
  // cb recebe { tipo: 'ouvindo'|'parcial'|'final'|'erro'|'fim', texto, erro }
  let cbOuvido = null, rec = null;
  window.CF_ouvido = function (ev) { if (cbOuvido) cbOuvido(ev); };

  function podeOuvir() {
    if (N() && N().temOuvido) { try { return !!N().temOuvido(); } catch (e) { return false; } }
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function ouvir(cb) {
    calar();
    cbOuvido = cb;
    if (N() && N().ouvir) { N().ouvir(); return; }
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) { cb({ tipo: 'erro', erro: 'sem' }); return; }
    try { if (rec) rec.abort(); } catch (e) { /* segue */ }
    rec = new R();
    rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
    let final = '';
    rec.onstart = () => window.CF_ouvido({ tipo: 'ouvindo' });
    rec.onresult = e => {
      let parcial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript; else parcial += e.results[i][0].transcript;
      }
      window.CF_ouvido({ tipo: parcial ? 'parcial' : 'final', texto: (final + parcial).trim() });
    };
    rec.onerror = e => window.CF_ouvido({ tipo: 'erro', erro: e.error === 'not-allowed' ? 'permissao' : e.error === 'no-speech' ? 'silencio' : e.error });
    rec.onend = () => window.CF_ouvido({ tipo: 'fim', texto: final.trim() });
    try { rec.start(); } catch (e) { cb({ tipo: 'erro', erro: 'ocupado' }); }
  }

  function pararOuvir() {
    try { if (N() && N().pararOuvir) N().pararOuvir(); else if (rec) rec.stop(); } catch (e) { /* segue */ }
  }

  function largar() { cbOuvido = null; try { if (N() && N().cancelarOuvir) N().cancelarOuvir(); else if (rec) rec.abort(); } catch (e) { /* segue */ } }

  CF.voz = { vozes, atual, cfg, salvar, falar, calar, podeOuvir, ouvir, pararOuvir, largar };
  // o resto do app (aula, horta, revisão) também fala com a voz escolhida
  CF.falar = texto => falar(texto);
  CF.temVoz = () => !!((N() && N().falar) || window.speechSynthesis);
  if (window.speechSynthesis) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) { /* segue */ } }
})();

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

  function largar() { pararGravacao(true); cbOuvido = null; try { if (N() && N().cancelarOuvir) N().cancelarOuvir(); else if (rec) rec.abort(); } catch (e) { /* segue */ } }

  // ---------- gravador: grava a sua voz de verdade (a IA ouve o áudio, com os erros e a pronúncia do jeito que saíram) ----------
  // cb recebe { tipo: 'ouvindo'|'nivel'|'falando'|'audio'|'erro', nivel, base64, segundos, erro }
  // opts: { max: segundos (padrão 30), silencio: ms de silêncio pra encerrar (padrão 1800), manual: true = só para no botão/tempo }
  let grav = null;
  function podeGravar() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext)); }

  async function gravar(cb, opts) {
    opts = opts || {};
    pararGravacao(true);
    calar();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    } catch (e) {
      cb({ tipo: 'erro', erro: e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'permissao' : 'sem' });
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) { /* segue */ } }
    const fonte = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const mudo = ctx.createGain(); mudo.gain.value = 0;   // o processador precisa estar ligado na saída, mas sem som
    const g = { ctx, stream, fonte, proc, mudo, pedacos: [], cb, opts, inicio: Date.now(), fala: 0, ultimaVoz: 0, piso: 0, nPiso: 0, acabou: false };
    grav = g;
    proc.onaudioprocess = ev => {
      if (g.acabou) return;
      const d = ev.inputBuffer.getChannelData(0);
      g.pedacos.push(new Float32Array(d));
      let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
      const rms = Math.sqrt(s / d.length), agora = Date.now(), t = agora - g.inicio;
      // primeiros 400 ms: mede o barulho do ambiente; depois, voz = bem acima disso
      if (t < 400) { g.piso = (g.piso * g.nPiso + rms) / (g.nPiso + 1); g.nPiso++; }
      const limiar = Math.max(0.012, g.piso * 3);
      cb({ tipo: 'nivel', nivel: Math.max(0, Math.min(1, rms / (limiar * 4))) });
      if (t >= 400 && rms > limiar) { if (!g.fala) { g.fala = agora; cb({ tipo: 'falando' }); } g.ultimaVoz = agora; }
      const max = (opts.max || 30) * 1000;
      if (t > max) { pararGravacao(); return; }
      if (opts.manual) return;
      if (g.fala && agora - g.ultimaVoz > (opts.silencio || 1800)) pararGravacao();
      else if (!g.fala && t > 9000) { pararGravacao(true); cb({ tipo: 'erro', erro: 'silencio' }); }
    };
    fonte.connect(proc); proc.connect(mudo); mudo.connect(ctx.destination);
    cb({ tipo: 'ouvindo' });
  }

  // descartar = true: joga fora sem mandar
  function pararGravacao(descartar) {
    const g = grav;
    if (!g || g.acabou) return;
    g.acabou = true; grav = null;
    try { g.proc.disconnect(); g.fonte.disconnect(); g.mudo.disconnect(); } catch (e) { /* segue */ }
    try { g.stream.getTracks().forEach(tr => tr.stop()); } catch (e) { /* segue */ }
    const taxa = g.ctx.sampleRate;
    try { g.ctx.close(); } catch (e) { /* segue */ }
    if (descartar) return;
    if (!g.fala) { g.cb({ tipo: 'erro', erro: 'silencio' }); return; }
    // corta o silêncio do fim (deixa meio segundo) e converte pra WAV 16 kHz mono
    let total = 0; g.pedacos.forEach(p => { total += p.length; });
    const tudo = new Float32Array(total); let o = 0; g.pedacos.forEach(p => { tudo.set(p, o); o += p.length; });
    const fim = Math.min(total, Math.round(((g.ultimaVoz - g.inicio) / 1000 + 0.5) * taxa));
    const ini = Math.max(0, Math.round(((g.fala - g.inicio) / 1000 - 0.4) * taxa));
    const trecho = g.opts.manual ? tudo : tudo.subarray(ini, Math.max(ini + 1, fim));
    const base64 = wav16k(trecho, taxa);
    g.cb({ tipo: 'audio', base64, segundos: trecho.length / taxa });
  }

  function wav16k(amostras, taxa) {
    const alvo = 16000, passo = taxa / alvo, n = Math.floor(amostras.length / passo);
    const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const txt = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    txt(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); txt(8, 'WAVE'); txt(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, alvo, true);
    v.setUint32(28, alvo * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); txt(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      // média do trecho (filtro simples contra chiado ao reduzir a taxa)
      const a = Math.floor(i * passo), b = Math.min(amostras.length, Math.floor((i + 1) * passo));
      let s = 0; for (let k = a; k < b; k++) s += amostras[k];
      const x = Math.max(-1, Math.min(1, s / Math.max(1, b - a)));
      v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
    }
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  CF.voz = { vozes, atual, cfg, salvar, falar, calar, podeOuvir, ouvir, pararOuvir, largar, podeGravar, gravar, pararGravacao };
  // o resto do app (aula, horta, revisão) também fala com a voz escolhida
  CF.falar = texto => falar(texto);
  CF.temVoz = () => !!((N() && N().falar) || window.speechSynthesis);
  if (window.speechSynthesis) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) { /* segue */ } }
})();

// Sons feitos na hora (sem arquivo de áudio) e voz em inglês.
// Receitas: madeira/marimba (seno + parcial 4x que some rápido), bolha (seno subindo rápido), papel (ruído filtrado),
// tudo passando por um eco curto (sala pequena) e um compressor pra nada estourar.
window.CF = window.CF || {};

(function () {
  let ctx = null, saida = null, eco = null, ruidoBuf = null;
  // ?mudo=1 no endereço: testes sem barulho nenhum (nem voz), sem mexer no ajuste salvo de som
  const MUDO = /[?&]mudo=1/.test(location.search);

  function montar(a) {
    const comp = a.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
    const mestre = a.createGain(); mestre.gain.value = 0.9;
    comp.connect(mestre); mestre.connect(a.destination);
    saida = comp;
    // eco de sala pequena: resposta de impulso feita de ruído que vai sumindo
    const conv = a.createConvolver(), n = Math.floor(a.sampleRate * 1.1), ir = a.createBuffer(2, n, a.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
    }
    conv.buffer = ir;
    const volEco = a.createGain(); volEco.gain.value = 0.22;
    conv.connect(volEco); volEco.connect(comp);
    eco = conv;
    ruidoBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const r = ruidoBuf.getChannelData(0);
    for (let i = 0; i < r.length; i++) r[i] = Math.random() * 2 - 1;
  }

  function audio() {
    if (MUDO || !CF.estado || !CF.estado.som) return null;
    try {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); montar(ctx); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  // liga um som na saída seca e (um pouco) no eco
  function ligar(no, comEco) {
    no.connect(saida);
    if (comEco) { const g = ctx.createGain(); g.gain.value = comEco; no.connect(g); g.connect(eco); }
  }

  // um tom com envelope: sobe rápido e some (opcional: desliza de freq até "para")
  function tom(freq, ini, o) {
    const a = audio(); if (!a) return;
    o = o || {};
    const t = a.currentTime + ini + 0.01, dur = o.dur || 0.2, vol = o.vol || 0.15;
    const osc = a.createOscillator(), g = a.createGain();
    osc.type = o.tipo || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.para) osc.frequency.exponentialRampToValueAtTime(o.para, t + (o.desliza || dur * 0.6));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.ataque || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let fim = g;
    if (o.filtro) { const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.filtro; g.connect(f); fim = f; }
    osc.connect(g); ligar(fim, o.eco);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // marimba de madeira: fundamental redondo + brilho 4x curtinho + "toc" do ataque
  function madeira(freq, ini, vol, dur) {
    vol = vol || 0.16; dur = dur || 0.55;
    tom(freq, ini, { vol, dur, eco: 0.5 });
    tom(freq * 4, ini, { vol: vol * 0.22, dur: 0.07, eco: 0.3 });
    tom(freq * 2.01, ini, { vol: vol * 0.12, dur: 0.18, tipo: 'triangle', eco: 0.3 });
  }

  // bolha / gota: seno que sobe rápido
  function bolha(de, para, ini, vol, dur) {
    tom(de, ini, { para, desliza: (dur || 0.08) * 0.8, dur: dur || 0.08, vol: vol || 0.14, eco: 0.35 });
  }

  // ruído filtrado (papel, mordida, vento)
  function ruido(ini, o) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + ini + 0.01, dur = o.dur || 0.05;
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = ruidoBuf;
    f.type = o.tipo || 'bandpass'; f.frequency.setValueAtTime(o.freq || 2500, t); f.Q.value = o.q || 1;
    if (o.para) f.frequency.exponentialRampToValueAtTime(o.para, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.1, t + (o.ataque || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); ligar(g, o.eco);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  const vari = () => 0.94 + Math.random() * 0.12;   // cada toque sai um tiquinho diferente (não cansa)
  let ultimoToque = 0;

  CF.som = {
    // toque num botão: estalinho de papel + bolinha macia
    toque() {
      const agora = Date.now(); if (agora - ultimoToque < 40) return; ultimoToque = agora;
      const v = vari();
      ruido(0, { freq: 3200 * v, q: 0.8, dur: 0.03, vol: 0.07 });
      bolha(420 * v, 720 * v, 0, 0.09, 0.07);
    },
    // marcou algo: duas notas de madeira subindo
    marca() { madeira(784, 0, 0.14); madeira(1175, 0.075, 0.13); },
    // acertou: "plim" brilhante com faísca
    acerto() {
      madeira(880, 0, 0.15); madeira(1319, 0.085, 0.16, 0.7);
      tom(2637, 0.09, { vol: 0.035, dur: 0.35, eco: 0.8 });
      bolha(1800, 3200, 0.16, 0.03, 0.06);
    },
    quase() { madeira(659, 0, 0.13); madeira(784, 0.1, 0.12); },
    // errou: um "bonk" macio de madeira caindo (sem buzina)
    erro() {
      tom(240, 0, { para: 170, dur: 0.22, tipo: 'triangle', vol: 0.16, filtro: 900, eco: 0.2 });
      tom(200, 0.13, { para: 140, dur: 0.28, tipo: 'triangle', vol: 0.13, filtro: 800, eco: 0.2 });
    },
    // gotinhas caindo
    agua() {
      bolha(650, 1500, 0, 0.13, 0.07);
      bolha(820, 1900, 0.1, 0.11, 0.06);
      bolha(560, 1300, 0.19, 0.09, 0.07);
      ruido(0.02, { freq: 5000, q: 0.7, dur: 0.12, vol: 0.025, eco: 0.4 });
    },
    // nhac nhac nhac + glup
    come() {
      [0, 0.17, 0.34].forEach((t, i) => {
        ruido(t, { tipo: 'lowpass', freq: 2400 - i * 300, dur: 0.07, vol: 0.22 });
        ruido(t + 0.02, { freq: 900, q: 2, dur: 0.05, vol: 0.08 });
        tom(210 - i * 15, t, { para: 120, dur: 0.07, vol: 0.08 });
      });
      bolha(240, 520, 0.6, 0.12, 0.12);
    },
    // pulo do Torrão: "boing" curtinho
    pulo() { tom(260, 0, { para: 620, desliza: 0.12, dur: 0.17, vol: 0.1, eco: 0.3 }); },
    // ganhou laranja: duas notas de moeda de madeira
    laranja() { madeira(988, 0, 0.13); madeira(1480, 0.08, 0.14, 0.6); tom(2960, 0.08, { vol: 0.03, dur: 0.3, eco: 0.8 }); },
    // folha abrindo: papel deslizando
    folha() { ruido(0, { freq: 900, para: 3200, q: 0.9, dur: 0.16, vol: 0.06, ataque: 0.04 }); },
    // festa: arpejo de marimba + acorde + faíscas
    festa() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => madeira(f, i * 0.085, 0.13));
      [1047, 1319, 1568].forEach(f => madeira(f, 0.5, 0.09, 1.1));
      for (let i = 0; i < 6; i++) tom(2000 + Math.random() * 1800, 0.55 + Math.random() * 0.5, { vol: 0.025, dur: 0.25, eco: 0.9 });
    }
  };

  CF.vibra = ms => { try { if (!MUDO && CF.estado.som && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sem vibração */ } };

  // Voz: no APK usa o leitor do Android (ponte "Nativo"); no navegador usa a voz do próprio navegador.
  CF.falar = function (texto) {
    if (MUDO) return true;
    const limpo = texto.replace(/\.\.\./g, '').replace(/[()]/g, '');
    try {
      if (window.Nativo && window.Nativo.falar) { window.Nativo.falar(limpo); return true; }
      if (!window.speechSynthesis) return false;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(limpo);
      u.lang = 'en-US';
      u.rate = 0.9;
      const voz = speechSynthesis.getVoices().find(v => /^en[-_]US/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^en/i.test(v.lang));
      if (voz) u.voice = voz;
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };

  CF.temVoz = () => !!((window.Nativo && window.Nativo.falar) || window.speechSynthesis);
})();

// Sons curtinhos feitos na hora (sem arquivo de áudio) e voz em inglês.
window.CF = window.CF || {};

(function () {
  let ctx = null;
  function audio() {
    if (!CF.estado.som) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  function nota(freq, ini, dur, tipo, vol) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = tipo || 'triangle';
    o.frequency.setValueAtTime(freq, a.currentTime + ini);
    g.gain.setValueAtTime(0.0001, a.currentTime + ini);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, a.currentTime + ini + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + ini + dur);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + ini); o.stop(a.currentTime + ini + dur + 0.05);
  }

  CF.som = {
    toque() { nota(520, 0, 0.07, 'triangle', 0.12); },
    marca() { nota(660, 0, 0.09); nota(990, 0.07, 0.12); },
    acerto() { nota(660, 0, 0.1); nota(880, 0.08, 0.1); nota(1320, 0.16, 0.18); },
    quase() { nota(520, 0, 0.12); nota(620, 0.1, 0.14); },
    erro() { nota(300, 0, 0.16, 'sine', 0.16); nota(220, 0.12, 0.22, 'sine', 0.14); },
    agua() { [900, 760, 1040, 820].forEach((f, i) => nota(f, i * 0.05, 0.08, 'sine', 0.09)); },
    come() { [180, 150, 190, 140, 170].forEach((f, i) => nota(f, i * 0.09, 0.06, 'square', 0.05)); },
    festa() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => nota(f, i * 0.11, 0.16)); }
  };

  CF.vibra = ms => { try { if (CF.estado.som && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sem vibração */ } };

  // Voz: no APK usa o leitor do Android (ponte "Nativo"); no navegador usa a voz do próprio navegador.
  CF.falar = function (texto) {
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

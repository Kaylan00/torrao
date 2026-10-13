// Formas de papel rasgado, céu conforme a hora do dia e nuvens de papel passando.
window.CF = window.CF || {};

(function () {
  // números "aleatórios" sempre iguais, pra borda rasgada não mudar a cada tela
  function semente(s) {
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  // borda rasgada: pontos tremidos em px nas 4 bordas (fica igual em folha pequena ou grande)
  function rasgo(seed, amp, so) {
    const r = semente(seed), p = [];
    const j = () => (r() * amp).toFixed(1) + 'px';
    const topo = !so || so === 'topo';
    const resto = !so;
    const N = 16, M = 10;
    for (let i = 0; i <= N; i++) p.push(`${(i / N * 100).toFixed(1)}% ${topo ? j() : '0px'}`);
    for (let i = 1; i < M; i++) p.push(`calc(100% - ${resto ? j() : '0px'}) ${(i / M * 100).toFixed(1)}%`);
    for (let i = N; i >= 0; i--) p.push(`${(i / N * 100).toFixed(1)}% calc(100% - ${resto ? j() : '0px'})`);
    for (let i = M - 1; i >= 1; i--) p.push(`${resto ? j() : '0px'} ${(i / M * 100).toFixed(1)}%`);
    return `polygon(${p.join(', ')})`;
  }

  // recorte de botão: um quadrilátero meio torto, como papel cortado na tesoura
  function corte(seed) {
    const r = semente(seed), a = () => (1 + r() * 4).toFixed(1) + 'px';
    return `polygon(${a()} ${a()}, calc(100% - ${a()}) 0px, 100% calc(100% - ${a()}), 0px 100%)`;
  }

  const raiz = document.documentElement.style;
  [11, 23, 37, 41, 59, 67].forEach((s, i) => raiz.setProperty('--rasgo-' + (i + 1), rasgo(s, 6)));
  raiz.setProperty('--rasgo-topo', rasgo(83, 9, 'topo'));
  [5, 17, 29, 43].forEach((s, i) => raiz.setProperty('--corte-' + (i + 1), corte(s)));

  // ---------- céu ----------
  CF.hora = function () {
    const h = new Date().getHours();
    if (h >= 6 && h < 16) return 'dia';
    if (h >= 16 && h < 19) return 'tarde';
    return 'noite';
  };
  // '../assets' funciona tanto resolvendo pela pasta src/ (CSS) quanto pela raiz (o app fica na raiz do site)
  CF.ceuUrl = () => '../assets/ceu/' + CF.hora() + '.jpg';

  // ---------- nuvens ----------
  CF.montarNuvens = function (caixa) {
    if (!caixa || caixa.dataset.pronto) return;
    caixa.dataset.pronto = '1';
    const r = semente(Date.now() % 100000 + 7);
    const largura = caixa.clientWidth || 400;
    for (let i = 0; i < 3; i++) {
      const img = document.createElement('img');
      img.src = 'assets/nuvem/' + (1 + Math.floor(r() * 6)) + '.png';
      img.alt = '';
      img.className = 'nuvem';
      const w = 90 + r() * 110, dur = 55 + r() * 70;
      img.style.width = w.toFixed(0) + 'px';
      img.style.top = (4 + i * 18 + r() * 6).toFixed(1) + '%';
      img.style.setProperty('--fim', (largura + 40) + 'px');
      img.style.animationDuration = dur.toFixed(0) + 's';
      img.style.animationDelay = (-r() * dur).toFixed(0) + 's';
      caixa.appendChild(img);
    }
  };

  // ---------- confete de papel ----------
  CF.confete = function (caixa, n) {
    const cores = ['#e8742a', '#a9b75a', '#6aa5a8', '#f3e6cc', '#d9775a', '#f4a259'];
    for (let i = 0; i < (n || 40); i++) {
      const c = document.createElement('i');
      c.className = 'confete';
      c.style.left = (Math.random() * 100) + '%';
      c.style.background = cores[i % cores.length];
      c.style.setProperty('--x', ((Math.random() - .5) * 160).toFixed(0) + 'px');
      c.style.setProperty('--r', ((Math.random() - .5) * 1440).toFixed(0) + 'deg');
      c.style.animationDuration = (2.2 + Math.random() * 2.2).toFixed(2) + 's';
      c.style.animationDelay = (Math.random() * .8).toFixed(2) + 's';
      c.style.clipPath = `polygon(${Math.random() * 20}% 0, 100% ${Math.random() * 20}%, ${80 + Math.random() * 20}% 100%, 0 ${80 + Math.random() * 20}%)`;
      caixa.appendChild(c);
    }
  };
})();

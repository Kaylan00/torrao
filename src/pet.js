// O Torrão animado: folha de 4x4 quadros por fase (assets/pet/anim<fase>.png).
// Fileira 1 parado respirando (0-3, o 3 é a piscada), 2 pulinho (4-7), 3 comendo (8-11), 4 seco (12-15).
window.CF = window.CF || {};

(function () {
  const vivos = new Set();

  function Pet(el) {
    this.el = el;
    this.sprite = el.querySelector('.sprite');
    this.corpo = el.querySelector('.corpo') || this.sprite;
    this.fase = Number(el.dataset.fase || 1);
    this.careca = el.dataset.careca === '1';
    this.roupas = [...el.querySelectorAll('.roupa')];
    this.humor = el.dataset.humor || 'tranquilo';
    this.t = null;
    this.passo = 0;
    this.ocupado = false;
    vivos.add(this);
    this.loop();
  }

  Pet.prototype.quadro = function (k) {
    const c = k % 4, f = Math.floor(k / 4);
    this.corpo.style.backgroundPosition = `${(c * 100 / 3).toFixed(3)}% ${(f * 100 / 3).toFixed(3)}%`;
    if (this.roupas.length) posicionarRoupas(this.roupas, this.fase, k, this.careca);
  };

  Pet.prototype.agenda = function (fn, ms) {
    clearTimeout(this.t);
    this.t = setTimeout(fn, ms);
  };

  Pet.prototype.loop = function () {
    if (!this.el.isConnected) { this.parar(); return; }
    if (this.ocupado) return;
    if (this.humor === 'seco') {
      const seq = [12, 13, 12, 14, 12, 15];
      this.quadro(seq[this.passo % seq.length]);
      this.passo++;
      this.agenda(() => this.loop(), 760);
      return;
    }
    // respirando: 0 1 0 2, com piscada de vez em quando e um pulinho raro
    const seq = [0, 1, 0, 2];
    const k = seq[this.passo % seq.length];
    this.passo++;
    if (k === 0 && Math.random() < 0.18) {
      this.quadro(3);
      this.agenda(() => { this.quadro(0); this.agenda(() => this.loop(), 380); }, 150);
      return;
    }
    if (this.passo % 24 === 0 && Math.random() < 0.5 && this.el.dataset.solto !== '0') { this.pular(true); return; }
    this.quadro(k);
    this.agenda(() => this.loop(), 520);
  };

  Pet.prototype.pular = function (pequeno) {
    if (!this.el.isConnected) return;
    this.ocupado = true;
    const alto = pequeno ? 22 : 58;
    const tempos = [[4, 0], [5, 110], [6, 260], [7, 430], [0, 600]];
    tempos.forEach(([k, ms]) => setTimeout(() => this.el.isConnected && this.quadro(k), ms));
    if (this.sprite.animate) {
      this.sprite.animate([
        { transform: 'translateY(0) scale(1.06, .9)' },
        { transform: `translateY(-${alto * .8}px) scale(.95, 1.07)`, offset: .3 },
        { transform: `translateY(-${alto}px) scale(1, 1)`, offset: .5 },
        { transform: 'translateY(0) scale(1.07, .9)', offset: .85 },
        { transform: 'translateY(0) scale(1, 1)' }
      ], { duration: 680, easing: 'ease-out' });
    }
    this.agenda(() => { this.ocupado = false; this.loop(); }, 700);
  };

  Pet.prototype.comer = function () {
    if (!this.el.isConnected) return;
    this.ocupado = true;
    const seq = [8, 9, 10, 9, 10, 9, 10, 11, 11];
    seq.forEach((k, i) => setTimeout(() => this.el.isConnected && this.quadro(k), i * 230));
    this.agenda(() => { this.ocupado = false; this.humor = 'tranquilo'; this.loop(); }, seq.length * 230 + 200);
  };

  Pet.prototype.parar = function () {
    clearTimeout(this.t);
    vivos.delete(this);
  };

  // ---------- roupas: acompanham os olhos de cada quadro (CF.ANCORAS, gerado por tools/fatiar3.py) ----------
  // an = [olhoX, olhoY, altoDaCabeca, cabecaEsq, cabecaDir, inclinacao] (frações da célula)
  function posicionarRoupas(imgs, fase, k, careca) {
    const tab = careca ? CF.ANCORAS_CARECA : CF.ANCORAS;
    const an = tab && tab[fase] && tab[fase][k];
    const cfg = CF.VESTIR && CF.VESTIR[fase];
    if (!an || !cfg) return;
    const [ex, ey, topo, esq, dir, ang] = an;
    const larg = dir - esq, testa = ey - topo;
    imgs.forEach(img => {
      // chapéu desenhado JÁ VESTIDO no Torrão (tools/arte8.py): a posição vem do quadro 0 e segue a cabeça
      const r8 = careca && img.classList.contains('enc') && CF.ROUPA8 && CF.ROUPA8[img.dataset.id] && CF.ROUPA8[img.dataset.id][fase];
      if (r8) {
        const a0 = tab[fase][0];
        const sx = larg / (a0[4] - a0[3]), sy = testa / (a0[1] - a0[2]);
        const cx = (esq + dir) / 2, cx0 = (a0[3] + a0[4]) / 2;
        img.style.left = ((cx + (r8[0] - cx0) * sx) * 100).toFixed(2) + '%';
        img.style.top = ((topo + (r8[1] - a0[2]) * sy) * 100).toFixed(2) + '%';
        img.style.width = (r8[2] * sx * 100).toFixed(2) + '%';
        return;
      }
      const aj = (CF.ROUPA_AJUSTE && CF.ROUPA_AJUSTE[img.dataset.id]) || {};
      const onde = aj.onde || (img.dataset.lugar === 'rosto' ? 'olhos' : 'topo');
      let x, y, w;
      if (onde === 'topo') {            // chapéu: a aba afunda um pouco na cabeça e tem a largura dela
        x = (esq + dir) / 2 + cfg.dx; y = topo + testa * (cfg.afunda + (aj.afunda || 0)); w = larg * cfg.larg;
      } else if (onde === 'testa') {    // faixa: no meio da testa
        x = (esq + dir) / 2 + cfg.dx; y = topo + testa * 0.62; w = larg * cfg.larg * 0.95;
      } else if (onde === 'boca') {     // bigode: abaixo dos olhos
        x = ex + cfg.olhoDx; y = ey + testa * 0.55; w = larg * cfg.rosto * 0.75;
      } else {                          // óculos: nos olhos
        x = ex + cfg.olhoDx; y = ey; w = larg * cfg.rosto;
      }
      w *= aj.s || 1;
      img.style.width = (w * 100).toFixed(2) + '%';
      img.style.left = ((x + (aj.dx || 0)) * 100).toFixed(2) + '%';
      img.style.top = ((y + (aj.dy || 0)) * 100).toFixed(2) + '%';
      img.style.setProperty('--ang', (ang || 0) + 'deg');
      img.classList.toggle('meio', onde === 'testa');   // faixa: presa pelo meio, não pela borda de baixo
    });
  }

  // liga todos os [data-pet] da tela
  CF.montarPets = function (raiz) {
    vivos.forEach(p => { if (!p.el.isConnected) p.parar(); });
    (raiz || document).querySelectorAll('[data-pet]').forEach(el => {
      if (el._pet) return;
      el._pet = new Pet(el);
    });
  };

  // roupa: { cabeca: id|null, rosto: id|null } (padrão: o que está vestido no estado)
  CF.petHtml = function (fase, humor, altura, extra, roupa, opts) {
    const meta = (CF.PET_META && CF.PET_META[fase + 1]) || { ar: 1 };
    const r = roupa || (CF.estado && CF.estado.roupa) || {};
    // com chapéu, usa o Torrão sem planta na cabeça (o "cabelo" sai e o chapéu encaixa no topo)
    const comChapeu = !!(r.cabeca && (!CF.roupaLiberada || CF.roupaLiberada(r.cabeca)) && CF.PET_META_CARECA && CF.PET_META_CARECA[fase + 1]);
    const pecas = ['rosto', 'cabeca'].filter(l => r[l] && (!CF.roupaLiberada || CF.roupaLiberada(r[l]))).map(l => {
      const cor = CF.corDaRoupa ? CF.corDaRoupa(r[l]).filtro : '';
      const vestida = l === 'cabeca' && comChapeu && CF.ROUPA8 && CF.ROUPA8[r[l]] && CF.ROUPA8[r[l]][fase + 1];
      const src = vestida ? `assets/roupa8/${r[l]}_${fase + 1}.png` : `assets/roupa/${r[l]}.png`;
      return `<img class="roupa ${l}${vestida ? ' enc' : ''}" data-lugar="${l}" data-id="${r[l]}" src="${src}" alt="" style="--cor:${cor || 'none'}">`;
    }).join('');
    const folha = comChapeu ? `assets/pet/anim${fase + 1}_careca.png` : `assets/pet/anim${fase + 1}.png`;
    const ar = comChapeu ? CF.PET_META_CARECA[fase + 1].ar : meta.ar;
    const skin = (opts && opts.skin) || (CF.skinAtual ? CF.skinAtual() : { filtro: '' });
    const filtro = skin.filtro === 'arcoiris' ? '' : skin.filtro;
    return `<div class="pet${skin.filtro === 'arcoiris' ? ' arcoiris' : ''}" data-pet="1" data-fase="${fase + 1}" data-careca="${comChapeu ? 1 : 0}" data-humor="${humor}" ${extra || ''} style="--pet-h:${altura}px; --pet-ar:${ar}" role="img" aria-label="Torrão">
      <div class="sprite"><div class="corpo" style="background-image:url(${folha});${filtro ? 'filter:' + filtro : ''}"></div>${pecas}</div></div>`;
  };
})();

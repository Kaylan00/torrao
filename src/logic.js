// Estado do jogo, pontos, revisão espaçada e humor do Torrão. Sem nada de tela aqui.
window.CF = window.CF || {};

(function () {
  const KEY = 'capifluente-v1';
  const KEY_BAK = 'capifluente-v1-bak';

  // ---------- datas (sempre no fuso do aparelho, por dia) ----------
  const pad = n => String(n).padStart(2, '0');
  const diaStr = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  CF.hoje = () => diaStr(new Date());
  CF.somaDias = (str, n) => {
    const [y, m, d] = str.split('-').map(Number);
    return diaStr(new Date(y, m - 1, d + n));
  };

  // ---------- estado ----------
  function novo() {
    return { v: 1, dias: {}, cartas: {}, frutas: 0, comeu: null, atividade: {}, faseVista: 0, som: true, criado: Date.now(), diaAberto: null, roupa: { cabeca: null, rosto: null }, roupasVistas: [], mundo: 'pomar', skin: 'terra', corRoupa: {}, toca: { tem: [], poe: {} } };
  }

  function valido(s) {
    return s && typeof s === 'object' && s.v === 1 && s.dias && s.cartas && typeof s.frutas === 'number';
  }

  function carregar() {
    for (const k of [KEY, KEY_BAK]) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const s = JSON.parse(raw);
        if (valido(s)) return Object.assign(novo(), s);
      } catch (e) { /* tenta o próximo */ }
    }
    return novo();
  }

  CF.estado = carregar();

  CF.salvar = function () {
    try {
      const raw = JSON.stringify(CF.estado);
      localStorage.setItem(KEY, raw);
      localStorage.setItem(KEY_BAK, raw);
    } catch (e) { /* sem armazenamento: o jogo segue funcionando nesta sessão */ }
  };

  CF.exportar = () => JSON.stringify(CF.estado);
  CF.importar = function (txt) {
    const s = JSON.parse(txt);
    if (!valido(s)) throw new Error('backup inválido');
    CF.estado = Object.assign(novo(), s);
    CF.salvar();
  };
  CF.zerar = function () {
    const som = CF.estado.som;
    CF.estado = novo();
    CF.estado.som = som;
    CF.salvar();
  };

  CF.marcarAtividade = function () {
    CF.estado.atividade[CF.hoje()] = true;
  };

  // ---------- dias e pontos ----------
  CF.dia = n => CF.DIAS[n - 1];
  CF.registro = n => CF.estado.dias[n] || (CF.estado.dias[n] = {});

  // passos de cada dia: { id, tipo: 'check' | 'teste' | 'usar', pts, opcoes?, opcional? }
  // Do jeito do Finch: poucas metas principais (é o que completa o dia) e o resto é extra opcional.
  CF.passos = function (d) {
    let p;
    if (d.tipo === 'chefao') {
      p = [
        { id: 'usar', tipo: 'usar', opcoes: [20, 30] },
        { id: 'resultado', tipo: 'check', pts: 0 }
      ];
    } else if (d.tipo === 'leve') {
      p = [{ id: 'regar', tipo: 'check', pts: 10 }];
    } else if (d.tipo === 'desafio') {
      p = [
        { id: 'testar', tipo: 'teste', pts: 10 },
        { id: 'usar', tipo: 'usar', opcoes: [10, 20, 30] }
      ];
    } else {
      p = [
        { id: 'aprender', tipo: 'check', pts: 10 },
        { id: 'testar', tipo: 'teste', pts: 10 },
        { id: 'usar', tipo: 'usar', opcoes: [10, 20, 30] }
      ];
    }
    // extras: ajudam (dão laranja), mas o dia fica completo sem eles
    p.push({ id: 'ouvir', tipo: 'check', pts: 10, opcional: true });
    if (!d.tipo) p.push({ id: 'anki', tipo: 'check', pts: 10, opcional: true });
    if (d.efset) p.push({ id: 'efset', tipo: 'check', pts: 20, opcional: true });
    p.push({ id: 'amigo', tipo: 'check', pts: 15, opcional: true });
    return p;
  };

  // laranjas que cada passo dá (a única recompensa que aparece na tela; os pontos ficam por baixo, pra evolução)
  CF.LARANJAS_PASSO = { aprender: 2, testar: 0, ouvir: 1, anki: 1, efset: 3, amigo: 2, resultado: 1, regar: 1 };
  CF.laranjasPasso = (id, v) => (id === 'usar' ? ({ 10: 1, 20: 2, 30: 3 }[v] || 0) : (CF.LARANJAS_PASSO[id] || 0));
  // dá as laranjas de um passo só uma vez por dia (marcar, desmarcar e marcar de novo não dá de novo)
  CF.ganharPasso = function (n, id, v) {
    const r = CF.registro(n);
    r.ganhou = r.ganhou || {};
    const q = CF.laranjasPasso(id, v), ja = r.ganhou[id] || 0;
    if (q > ja) { CF.estado.frutas += q - ja; r.ganhou[id] = q; return q - ja; }
    return 0;
  };

  CF.pontosDia = function (n) {
    const d = CF.dia(n), r = CF.estado.dias[n] || {};
    let t = 0;
    for (const p of CF.passos(d)) {
      if (p.tipo === 'usar') t += r.usar || 0;
      else if (r[p.id]) t += p.pts;
    }
    return t;
  };

  CF.maxDia = function (n) {
    return CF.passos(CF.dia(n)).filter(p => !p.opcional).reduce((a, p) => a + (p.tipo === 'usar' ? Math.max(...p.opcoes) : p.pts), 0);
  };

  CF.diaCompleto = function (n) {
    const d = CF.dia(n), r = CF.estado.dias[n] || {};
    if (d.tipo === 'leve') return !!r.regar;
    if (!r.usar) return false;
    if (d.tipo === 'chefao') return !!r.resultado;
    if (d.tipo === 'desafio') return !!r.testar;
    return !!(r.aprender && (r.testar || r.ouvir));   // "ouvir" vale pra quem completou dias antes da mudança
  };

  // metas principais de hoje (as que aparecem no quarto) e a energia do Torrão (quantas já foram)
  CF.metas = n => CF.passos(CF.dia(n)).filter(p => !p.opcional);
  CF.metaFeita = (n, p) => { const r = CF.estado.dias[n] || {}; return p.tipo === 'usar' ? !!r.usar : !!r[p.id]; };

  // surpresa do dia seguinte (o "passeio" do Finch): completou o dia, amanhã o Torrão traz uma frase nova e laranjas
  CF.marcarSurpresa = function (n) {
    const s = CF.estado.surpresa;
    if (!s || s.feita || s.data === CF.hoje()) CF.estado.surpresa = { data: CF.hoje(), dia: n };
  };
  CF.temSurpresa = () => !!(CF.estado.surpresa && !CF.estado.surpresa.feita && CF.estado.surpresa.data < CF.hoje());
  CF.abrirSurpresa = function () {
    const vistos = CF.estado.cartoesVistos = CF.estado.cartoesVistos || [];
    let k = CF.CARTOES.findIndex((_, i) => !vistos.includes(i));
    if (k < 0) { vistos.length = 0; k = 0; }
    vistos.push(k);
    CF.estado.surpresa.feita = true;
    CF.estado.frutas += 3;
    CF.salvar();
    return CF.CARTOES[k];
  };

  CF.pontosTotal = () => CF.DIAS.reduce((a, d) => a + CF.pontosDia(d.n), 0);

  CF.diaAtual = function () {
    for (const d of CF.DIAS) if (!CF.diaCompleto(d.n)) return d.n;
    return CF.DIAS.length;
  };

  CF.fasePet = function (pts) {
    let i = 0;
    CF.FASES_PET.forEach((f, k) => { if (pts >= f.min) i = k; });
    return i;
  };

  CF.nivelCatalogo = function (pts) {
    let i = 0;
    CF.CATALOGO.forEach((c, k) => { if (pts >= c[0]) i = k; });
    return i;
  };

  // ---------- horta (revisão espaçada) ----------
  CF.TODAS_CARTAS = {};
  CF.DIAS.forEach(d => (d.cartas || []).forEach(c => {
    CF.TODAS_CARTAS[c[0]] = { id: c[0], dia: d.n, pt: c[1], en: c[2], dica: c[3] || '', tipo: c[4] || 'traduzir' };
  }));

  CF.plantarDia = function (n) {
    const d = CF.dia(n);
    let novas = 0;
    (d.cartas || []).forEach(c => {
      if (!CF.estado.cartas[c[0]]) {
        CF.estado.cartas[c[0]] = { e: 0, due: CF.somaDias(CF.hoje(), 1), ok: 0, erro: 0 };   // a prática de hoje já treina; revisão começa amanhã
        novas++;
      }
    });
    return novas;
  };

  CF.plantas = () => Object.keys(CF.estado.cartas)
    .filter(id => CF.TODAS_CARTAS[id])
    .sort((a, b) => CF.TODAS_CARTAS[a].dia - CF.TODAS_CARTAS[b].dia || (a < b ? -1 : 1));

  CF.precisaAgua = id => {
    const c = CF.estado.cartas[id];
    return !!c && c.due <= CF.hoje();
  };

  CF.paraRegar = () => CF.plantas().filter(CF.precisaAgua);

  CF.dominadas = () => CF.plantas().filter(id => CF.estado.cartas[id].e >= CF.ESTAGIO_DOMINADO).length;

  // imagem da planta conforme estágio e sede
  CF.imgPlanta = function (id) {
    const c = CF.estado.cartas[id];
    const seca = CF.precisaAgua(id);
    if (c.e <= 0) return 'semente';
    if (c.e === 1) return seca ? 'broto-murcho' : 'broto';
    if (c.e === 2) return seca ? 'muda-murcha' : 'muda';
    if (c.e === 3) return seca ? 'arvore-murcha' : 'arvore';
    return seca ? 'arvore-murcha' : 'frutos';
  };

  // resultado: 'acertei' | 'quase' | 'errei'. Devolve { frutas, cresceu, antes, depois }
  CF.responder = function (id, resultado) {
    const c = CF.estado.cartas[id];
    if (!c) return { frutas: 0, cresceu: false };
    const antes = c.e;
    let frutas = 0;
    if (resultado === 'acertei') {
      c.e = Math.min(c.e + 1, CF.ESTAGIO_MAX);
      c.due = CF.somaDias(CF.hoje(), CF.INTERVALOS[c.e]);
      c.ok++;
      frutas = c.e >= CF.ESTAGIO_DOMINADO ? 2 : 1;
    } else if (resultado === 'quase') {
      c.e = Math.max(c.e, 1);
      c.due = CF.somaDias(CF.hoje(), 1);
    } else {
      c.e = Math.max(c.e - 1, 0);
      c.due = CF.hoje();
      c.erro++;
    }
    CF.estado.frutas += frutas;
    CF.marcarAtividade();
    CF.salvar();
    return { frutas, cresceu: c.e > antes, antes, depois: c.e };
  };

  // ---------- Torrão ----------
  CF.humor = function () {
    const ref = CF.estado.comeu || CF.estado.criado;
    const horas = (Date.now() - ref) / 36e5;
    return horas > 24 ? 'seco' : 'tranquilo';
  };

  CF.alimentar = function () {
    if (CF.estado.frutas <= 0) return false;
    CF.estado.frutas--;
    CF.estado.comeu = Date.now();
    CF.salvar();
    return true;
  };

  // ---------- guarda-roupa ----------
  CF.roupaLiberada = id => { const r = CF.ROUPAS.find(x => x.id === id); return !!r && (CF.TUDO_LIBERADO || CF.pontosTotal() >= r.pts); };
  CF.vestir = function (id) {
    const r = CF.ROUPAS.find(x => x.id === id);
    if (!r || !CF.roupaLiberada(id)) return false;
    CF.estado.roupa = CF.estado.roupa || { cabeca: null, rosto: null };
    CF.estado.roupa[r.lugar] = CF.estado.roupa[r.lugar] === id ? null : id;
    CF.salvar();
    return true;
  };
  // peças que acabaram de ser liberadas (pra avisar uma vez só)
  CF.roupasNovas = function () {
    if (CF.TUDO_LIBERADO) return [];
    CF.estado.roupasVistas = CF.estado.roupasVistas || [];
    const novas = CF.ROUPAS.filter(r => CF.roupaLiberada(r.id) && !CF.estado.roupasVistas.includes(r.id));
    if (novas.length) { novas.forEach(r => CF.estado.roupasVistas.push(r.id)); CF.salvar(); }
    return novas;
  };

  // ---------- skins e cores ----------
  CF.skinLiberada = id => { const s = CF.SKINS.find(x => x.id === id); return !!s && (CF.TUDO_LIBERADO || CF.pontosTotal() >= s.pts); };
  CF.skinAtual = function () {
    const s = CF.SKINS.find(x => x.id === CF.estado.skin);
    return s && CF.skinLiberada(s.id) ? s : CF.SKINS[0];
  };
  CF.usarSkin = function (id) { if (!CF.skinLiberada(id)) return false; CF.estado.skin = id; CF.salvar(); return true; };
  CF.corDaRoupa = id => CF.CORES_ROUPA.find(c => c.id === ((CF.estado.corRoupa || {})[id] || 'original')) || CF.CORES_ROUPA[0];
  CF.trocarCorRoupa = function (id, cor) { CF.estado.corRoupa = CF.estado.corRoupa || {}; CF.estado.corRoupa[id] = cor; CF.salvar(); };

  // ---------- a Toca ----------
  CF.toca = function () {
    const t = (CF.estado.toca = CF.estado.toca || { tem: [], poe: {} });
    // presente de boas-vindas: o quarto não começa vazio (um tapete e uma plantinha)
    if (!t.presente) {
      t.presente = true;
      ['tapete_redondo', 'planta'].forEach(id => { if (!t.tem.includes(id)) t.tem.push(id); });
      if (!t.poe.chao) t.poe.chao = 'tapete_redondo';
      if (!t.poe.frente_e) t.poe.frente_e = 'planta';
    }
    return t;
  };
  // quarto (papel de parede e chão): trocar é de graça
  CF.quartoAtual = () => CF.QUARTOS.find(q => q.id === CF.toca().quarto) || CF.QUARTOS[0];
  CF.usarQuarto = function (id) { if (!CF.QUARTOS.find(q => q.id === id)) return false; CF.toca().quarto = id; CF.salvar(); return true; };
  CF.comprarMovel = function (id) {
    const m = CF.MOVEIS.find(x => x.id === id), t = CF.toca();
    if (!m || t.tem.includes(id) || CF.estado.frutas < m.preco) return false;
    CF.estado.frutas -= m.preco;
    t.tem.push(id);
    t.poe[m.lugar] = id;
    CF.marcarAtividade();
    CF.salvar();
    return true;
  };
  CF.alternarMovel = function (id) {
    const m = CF.MOVEIS.find(x => x.id === id), t = CF.toca();
    if (!m || !t.tem.includes(id)) return false;
    t.poe[m.lugar] = t.poe[m.lugar] === id ? null : id;
    CF.salvar();
    return true;
  };

  // ---------- sequência ----------
  CF.sequencia = function () {
    const a = CF.estado.atividade;
    let dia = CF.hoje();
    if (!a[dia]) dia = CF.somaDias(dia, -1);
    let n = 0;
    while (a[dia]) { n++; dia = CF.somaDias(dia, -1); }
    return n;
  };

  // ---------- comparar o que a pessoa escreveu ----------
  const norm = s => s.toLowerCase()
    .replace(/[’‘`]/g, "'")
    // no celular muita gente escreve sem apóstrofo: "im", "dont", "cant"...
    .replace(/\bim\b/g, "i'm").replace(/\bdont\b/g, "don't").replace(/\bdidnt\b/g, "didn't").replace(/\bisnt\b/g, "isn't")
    .replace(/\bive\b/g, "i've").replace(/\bthats\b/g, "that's").replace(/\bwhats\b/g, "what's").replace(/\bcant\b/g, "can't")
    .replace(/\bcan't\b/g, 'can not').replace(/\bcannot\b/g, 'can not')
    .replace(/\bi'm\b/g, 'i am').replace(/\bit's\b/g, 'it is').replace(/\bthat's\b/g, 'that is')
    .replace(/\bdon't\b/g, 'do not').replace(/\bdidn't\b/g, 'did not').replace(/\bisn't\b/g, 'is not')
    .replace(/\bi'll\b/g, 'i will').replace(/\bi've\b/g, 'i have').replace(/\blet's\b/g, 'let us')
    .replace(/\bwhat's\b/g, 'what is').replace(/\bthere's\b/g, 'there is').replace(/\bi'd\b/g, 'i would')
    .replace(/\bwon't\b/g, 'will not').replace(/\bhow's\b/g, 'how is')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  CF.confere = function (digitado, aceitas) {
    const d = norm(digitado || '');
    if (!d) return null;
    return aceitas.some(a => norm(a) === d);
  };
})();

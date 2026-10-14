// Telas do Torrão: Casa (o quarto dele, tela inicial), Horta (frases plantadas), Mapa (os dias) e Progresso.
// Revisão, folha do dia, folha da planta e festa de evolução abrem por cima (#camada).
(function () {
  const $app = document.getElementById('app');
  const $conteudo = document.getElementById('conteudo');
  const $camada = document.getElementById('camada');
  // folha ou tela por cima abrindo: barulhinho de papel deslizando
  let camadaAberta = false;
  new MutationObserver(() => {
    const aberta = !!$camada.innerHTML;
    if (aberta && !camadaAberta && CF.som) CF.som.folha();
    camadaAberta = aberta;
  }).observe($camada, { childList: true });
  const $aviso = document.getElementById('aviso');

  const ui = { tela: 'estudar', folha: null, vaga: 'quarto', ultimoDia: null, adiantar: false, fala: null, confirmaZerar: false, mostraRestaurar: false };
  let rev = null;          // revisão aberta
  let diaAberto = null;    // folha do dia aberta
  let plantaAberta = null; // folha da planta aberta
  let apr = null;          // aula de hoje aberta (aprender as frases)
  let chat = null;         // conversa com o Torrão (IA)

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IC = n => 'assets/ic/' + n + '.png';
  const PLANTA = n => 'assets/horta/' + n + '.png';
  const fraseEn = c => (c.tipo === 'ouvir' ? c.pt : c.en[0]);
  const PET_IMG = (fase, humor) => 'assets/pet/' + (fase + 1) + '-' + humor + '.png';
  const ESTAGIO = ['Semente', 'Broto', 'Muda', 'Árvore', 'Árvore com laranjas', 'Árvore com laranjas', 'Árvore com laranjas'];
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
  const FECHAR = acao => `<button class="fechar" data-acao="${acao}" aria-label="Fechar"><i></i><i></i></button>`;
  const ALTURA_PET = [150, 178, 200, 222];

  // fundo: o cenário que você escolheu (o Pomar do Céu usa o céu que muda com a hora)
  function mundoVisivel() { return CF.mundoEscolhido(); }
  function aplicarCeu() {
    const m = mundoVisivel();
    const url = `url("${m.fundo || CF.ceuUrl()}")`;
    document.documentElement.style.setProperty('--ceu-img', url);
    // nuvens mais escuras só quando o fundo que aparece é de noite
    const noite = m.noite || (!m.fundo && CF.hora() === 'noite');
    const nuvens = $app.querySelector('.nuvens');
    if (nuvens) nuvens.classList.toggle('noite', noite);
    document.body.classList.toggle('noite', noite);
  }

  // ---------- utilidades ----------
  let avisoT = null;
  function aviso(msg) {
    if (/^\+\d/.test(msg) && /laranja/.test(msg)) CF.som.laranja();
    $aviso.textContent = msg;
    $aviso.classList.add('on');
    clearTimeout(avisoT);
    avisoT = setTimeout(() => $aviso.classList.remove('on'), 2300);
  }

  function copiar(texto) {
    const ok = () => { aviso('Copiado! Agora é só colar.'); CF.som.marca(); };
    try { if (window.Nativo && window.Nativo.copiar) { window.Nativo.copiar(texto); ok(); return; } } catch (e) { /* segue */ }
    const reserva = () => {
      const t = document.createElement('textarea');
      t.value = texto; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      let feito = false;
      try { feito = document.execCommand('copy'); } catch (e) { feito = false; }
      t.remove();
      if (feito) ok(); else aviso('Não deu pra copiar. Segura o dedo no texto pra copiar.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok, reserva);
    else reserva();
  }

  function abrirLink(url) {
    try { if (window.Nativo && window.Nativo.abrir) { window.Nativo.abrir(url); return; } } catch (e) { /* segue */ }
    window.open(url, '_blank', 'noopener');
  }

  const blocoCopiar = (texto, rotulo) =>
    `<div class="copiar"><q>${esc(texto)}</q><button class="botao mini azul c2" data-acao="copiar" data-texto="${esc(texto)}">${esc(rotulo)}</button></div>`;

  // ---------- Torrão ----------
  function falaPadrao() {
    const plantas = CF.plantas(), regar = CF.paraRegar(), seco = CF.humor() === 'seco', fr = CF.estado.frutas;
    const atual = CF.diaAtual();
    if (!plantas.length && !CF.diaCompleto(1)) return { pt: 'Oi! Bora aprender as primeiras frases em inglês?' };
    if (seco && fr > 0) return { pt: 'Tô com fome... me dá uma laranja?' };
    if (seco) return { pt: 'Tô com fome. Revisando as frases você ganha laranja pra mim.' };
    if (regar.length) return { pt: plural(regar.length, 'frase pedindo revisão', 'frases pedindo revisão') + '. Bora?' };
    if (!CF.diaCompleto(atual)) return { pt: `Bora pro Dia ${atual}: ${CF.dia(atual).tema}?` };
    if (fr > 0) return { pt: 'Tudo em dia! Sobrou laranja, hein?' };
    return { pt: 'Tudo em dia. Assim eu gosto.' };
  }

  function falaHtml(f) {
    return `<div class="fala papel r2">${f.en ? `<span class="en-fala">${esc(f.en)}</span><span class="pt-fala">${esc(f.pt)}</span>` : esc(f.pt)}<span class="rabo"></span></div>`;
  }

  function petAtual() { const el = $conteudo.querySelector('.casa-quarto [data-pet]'); return el && el._pet; }

  function checarEvolucao() {
    // completou o dia agora: amanhã o Torrão volta do passeio com uma frase nova (e laranjas)
    const n = ui.ultimoDia;
    if (n && CF.diaCompleto(n)) {
      const r = CF.registro(n);
      if (!r.completou) {
        r.completou = CF.hoje(); CF.marcarSurpresa(n); ui.adiantar = false; CF.salvar();
        CF.som.festa();
        if (!$camada.innerHTML) render();
        setTimeout(() => aviso(`Dia ${n} completo! Amanhã o Torrão traz uma surpresa.`), 300);
      }
    }
    const fase = CF.fasePet(CF.pontosTotal());
    if (fase > CF.estado.faseVista) { CF.estado.faseVista = fase; CF.salvar(); festa(fase); }
    else if (fase < CF.estado.faseVista) { CF.estado.faseVista = fase; CF.salvar(); }
  }

  function festa(fase) {
    CF.som.festa(); CF.vibra([40, 60, 40]);
    const f = CF.FASES_PET[fase];
    $camada.innerHTML = `<div class="festa" role="dialog" aria-label="O Torrão evoluiu"><div class="ceu"></div>
      <div class="festa-box">
        ${CF.petHtml(fase, 'tranquilo', 250, 'data-solto="0"')}
        <div class="papel r4"><span class="fita"></span>
          <h1>O Torrão evoluiu!</h1>
          <p>Agora ele é <b>${esc(f.nome)}</b>. É o seu estudo fazendo ele crescer.</p>
          ${Number.isInteger(CF.estado.idade) ? '<p style="font-weight:600">No quarto ele continua na idade que você escolheu. Pra ver ele crescer, escolhe "Crescendo" em Roupas.</p>' : ''}
          <p style="font-weight:600">${esc(CF.CATALOGO[CF.nivelCatalogo(CF.pontosTotal())][1])}</p>
        </div>
        <button class="botao grande laranja" data-acao="fechar">Bora!</button>
      </div></div>`;
    const box = $camada.querySelector('.festa');
    CF.confete(box, 50);
    CF.montarPets($camada);
    const el = $camada.querySelector('[data-pet]');
    let n = 0;
    const pula = () => { if (el && el.isConnected && n++ < 4) { el._pet.pular(); setTimeout(pula, 900); } };
    setTimeout(pula, 300);
  }

  // ---------- telas ----------
  function render() {
    aplicarCeu();
    let html;
    $app.dataset.tela = ui.tela;
    if (ui.tela === 'estudar') html = telaEstudar();
    else if (ui.tela === 'casa') html = telaCasa();
    else if (ui.tela === 'horta') html = telaHorta();
    else if (ui.tela === 'hoje') html = telaHoje();
    else html = telaProgresso();
    const regar = CF.paraRegar().length;
    html += `<nav class="nav" aria-label="Telas">
      <button data-acao="tela" data-tela="estudar" ${ui.tela === 'estudar' || ui.tela === 'hoje' ? 'aria-current="page"' : ''}><img src="${IC('video')}" alt="">Estudar</button>
      <button data-acao="tela" data-tela="horta" ${ui.tela === 'horta' ? 'aria-current="page"' : ''}><img src="${PLANTA('frutos')}" alt="">Frases${regar ? `<span class="bolinha">${regar}</span>` : ''}</button>
      <button data-acao="tela" data-tela="casa" ${ui.tela === 'casa' ? 'aria-current="page"' : ''}><img src="assets/toca/icone.png" alt="">Torrão</button>
      <button data-acao="tela" data-tela="progresso" ${ui.tela === 'progresso' ? 'aria-current="page"' : ''}><img src="${IC('trofeu')}" alt="">Progresso</button>
    </nav>`;
    const antiga = $conteudo.querySelector('.tela');
    const y = antiga && antiga.dataset.tela === ui.tela ? antiga.scrollTop : null;
    $conteudo.innerHTML = html;
    const nova = $conteudo.querySelector('.tela');
    if (nova && y !== null) nova.scrollTop = y;
    else if (nova && ui.tela === 'hoje') {
      const atual = nova.querySelector('.ilha-dia.atual'), mapa = nova.querySelector('.mapa');
      if (atual && mapa) nova.scrollTop = Math.max(0, mapa.offsetTop + atual.offsetTop - nova.clientHeight * 0.45);
    }
    CF.montarPets($conteudo);
    ui.novoMovel = null;   // só o móvel recém-posto anima (os outros não piscam a cada redesenho)
    if (ui.tela === 'casa' && !$camada.innerHTML && CF.temSurpresa() && CF.estado.introVista)
      setTimeout(() => { if (!$camada.innerHTML && CF.temSurpresa()) mostrarSurpresa(); }, 700);
  }

  // ---------- Casa: o quarto do Torrão (tela inicial, do jeito do Pou/Finch) ----------
  // Tudo num lugar só: ele grande no meio do quarto, a janela mostra o cenário escolhido,
  // botões redondos embaixo (laranja, roupas, decorar, janela) e o cartão do próximo passo.
  const PET_NO_QUARTO = [0.30, 0.37, 0.41, 0.45];   // altura do Torrão em fração da altura do quarto
  function telaCasa() {
    const pts = CF.pontosTotal(), fase = CF.faseMostrada(), humor = CF.humor();
    const regar = CF.paraRegar(), t = CF.toca(), m = CF.mundoEscolhido();
    const fala = ui.fala || falaPadrao();
    const larg = Math.min($app.clientWidth || 375, 480), alt = larg * 4 / 3;
    const petH = Math.round(alt * PET_NO_QUARTO[fase]);
    const vista = m.fundo ? m.previa : CF.ceuUrl();
    const q = CF.quartoAtual(), decorando = ui.folha === 'loja';
    const moveis = CF.LUGARES_TOCA.filter(l => t.poe[l]).map(l => {
      const mv = CF.MOVEIS.find(x => x.id === t.poe[l]) || {};
      return `<img class="movel m-${l} ${decorando && ui.vaga === l ? 'brilha' : ''} ${ui.novoMovel === t.poe[l] ? 'novo' : ''}" src="assets/toca/${t.poe[l]}.png" alt="" ${mv.larg ? `style="width:${mv.larg}%"` : ''}>`;
    }).join('');
    const abs = f => new URL('assets/toca/' + f, location.href).href;
    const [jx, jy, jw, jh] = q.janela;
    const mascara = `url('${abs('janela_' + q.id + '.png')}')`;
    // decorando: cada lugar vazio ganha um "+" pra tocar (e o lugar escolhido fica marcado)
    const vagas = decorando ? CF.LUGARES_TOCA.filter(l => !t.poe[l] || ui.vaga === l).map(l =>
      `<button class="vaga v-${l} ${ui.vaga === l ? 'sel' : ''} ${t.poe[l] ? 'cheia' : ''}" data-acao="vaga" data-lugar="${l}" aria-label="${esc(CF.NOME_LUGAR[l])}">${t.poe[l] ? '' : '+'}</button>`).join('') : '';
    return `<main class="tela casa ${decorando ? 'decorando' : ''}" data-tela="casa">
      <section class="casa-quarto" style="--parede:url('${abs('parede_' + q.id + '.jpg')}'); --chao:url('${abs('chao_' + q.id + '.jpg')}')">
        <div class="hud hud-casa"><span class="bilhete" title="Laranjas"><img src="${PLANTA('fruta')}" alt="Laranjas">${CF.estado.frutas}</span></div>
        <div class="quarto-base">
          <img class="quarto-fundo" src="${q.img}" alt="">
          <div class="janela" style="left:${jx}%; top:${jy}%; width:${jw}%; height:${jh}%; background-image:url('${esc(vista)}'); -webkit-mask-image:${mascara}; mask-image:${mascara}"></div>
          ${moveis}
          ${vagas}
          <div class="quarto-pet">
            <div class="fala-casa" style="bottom:${petH + 12}px">${falaHtml(fala)}</div>
            <button data-acao="pet" aria-label="Torrão" style="display:block">${CF.petHtml(fase, humor, petH)}</button>
          </div>
        </div>
      <nav class="acoes-casa" aria-label="O que fazer no quarto">
        <button class="acao-redonda" data-acao="alimentar"><span><img src="${PLANTA('fruta')}" alt=""></span>Dar laranja</button>
        <button class="acao-redonda" data-acao="folha" data-qual="roupas"><span><img src="assets/roupa/bone.png" alt=""></span>Roupas</button>
        <button class="acao-redonda" data-acao="folha" data-qual="loja"><span><img src="assets/toca/icone.png" alt=""></span>Decorar</button>
        <button class="acao-redonda" data-acao="perguntar"><span><img src="${IC('fala')}" alt=""></span>Perguntar</button>
      </nav>
      </section>
    </main>`;
  }

  // ---------- Estudar: a tela inicial, com cara de app de estudo (o quarto do Torrão virou a recompensa, na aba dele) ----------
  const PASSO_INFO = {
    aprender: ['Aprender as frases', 'Ouve e repete as frases novas do dia.', 'video', '5 min'],
    testar: ['Praticar escrevendo', 'Escreve cada frase em inglês e a IA corrige.', 'cerebro', '5 min'],
    usar: ['Falar inglês', 'Conversa por voz com o Torrão sobre o tema.', 'mic', '10 min'],
    regar: ['Revisar', 'As frases que estão pedindo revisão hoje.', 'gota', '5 min'],
    resultado: ['Resultado da semana', 'Pede pra IA seus erros mais comuns.', 'trofeu', '5 min']
  };
  const NIVEL_TXT = {
    A1: 'Entende e usa frases bem simples do dia a dia.',
    A2: 'Se comunica em situações simples e conhecidas.',
    B1: 'Se vira em viagem, trabalho e conversa sobre assuntos do dia a dia.',
    B2: 'Conversa com fluência com nativos e entende textos mais complexos.',
    C1: 'Usa o inglês com facilidade em quase qualquer situação.',
    C2: 'Domina o inglês como um nativo culto.'
  };
  function telaEstudar() {
    const regar = CF.paraRegar(), s = CF.estado.surpresa;
    const n = CF.diaAtual(), d = CF.dia(n), metas = CF.metas(n);
    const feitas = metas.filter(p => CF.metaFeita(n, p)).length;
    const prox = metas.find(p => !CF.metaFeita(n, p));
    const terminouHoje = s && s.data === CF.hoje() && !s.feita && s.dia && !s.adiantou && !CF.diaCompleto(CF.diaAtual());
    const semana = CF.semanaDe(n), dSem = CF.DIAS.filter(x => CF.semanaDe(x.n) === semana);
    const feitosSem = dSem.filter(x => CF.diaCompleto(x.n)).length;
    const testes = CF.estado.testesNivel || [], ult = testes[testes.length - 1];
    const fala = CF.voz.podeOuvir() || CF.voz.podeGravar();
    let aula;
    if (terminouHoje) {
      aula = `<section class="cartao-estudo papel r2 aula-feita">
        <span class="rotulo">Aula de hoje</span>
        <h2><img src="${IC('check')}" alt="">Dia ${s.dia} completo!</h2>
        <p>Amanhã tem aula nova. Se estiver com pique, dá pra adiantar.</p>
        <div class="linha-botoes"><button class="botao laranja c2" data-acao="adiantar">Começar o Dia ${CF.diaAtual()}</button></div>
      </section>`;
    } else {
      const passos = metas.map((p, i) => {
        const ok = CF.metaFeita(n, p), [nome, txt, ic, min] = PASSO_INFO[p.id] || [NOME_PASSO[p.id], '', 'carta', ''];
        const agora = p === prox;
        return `<button class="passo-estudo ${ok ? 'ok' : ''} ${agora ? 'agora' : ''}" data-acao="meta" data-id="${p.id}">
          <span class="passo-num">${ok ? `<img src="${IC('check')}" alt="feito">` : i + 1}</span>
          <span class="passo-txt"><b>${esc(nome)}</b><small>${esc(txt)}</small></span>
          <span class="passo-lado">${agora ? '<span class="botao mini laranja c2">Começar</span>' : ok ? '<small>feito</small>' : `<small>${min}</small>`}</span>
        </button>`;
      }).join('');
      aula = `<section class="cartao-estudo papel r2">
        <div class="linha-topo"><span class="rotulo">Aula de hoje · Dia ${n}</span><button class="link" data-acao="abrirDia" data-n="${n}">Detalhes</button></div>
        <h2>${esc(d.tema)}</h2>
        <div class="barra verde"><i style="width:${(feitas / metas.length * 100).toFixed(0)}%"></i></div>
        <small class="progresso-txt">${feitas} de ${metas.length} etapas · uns 20 minutos</small>
        <div class="passos-estudo">${passos}</div>
      </section>`;
    }
    return `<main class="tela estudar" data-tela="estudar">
      <header class="estudo-topo">
        <div class="estudo-ola">
          <span class="rotulo">Semana ${semana} de 12 · Dia ${n} de ${CF.DIAS.length}</span>
          <h1>${feitas === metas.length || terminouHoje ? 'Mandou bem hoje!' : feitas ? 'Continua de onde parou' : 'Bora estudar?'}</h1>
          <div class="estudo-chips">
            <span class="chip-info"><img src="${IC('chama')}" alt="">${plural(CF.sequencia(), 'dia seguido', 'dias seguidos')}</span>
            <span class="chip-info"><img src="${PLANTA('frutos')}" alt="">${CF.dominadas()} de ${CF.plantas().length} frases dominadas</span>
          </div>
        </div>
        <button class="estudo-pet" data-acao="tela" data-tela="casa" aria-label="Ver o quarto do Torrão">${CF.petHtml(CF.faseMostrada(), CF.humor(), 78, 'data-solto="0"')}</button>
      </header>
      <div class="secao estudo-secao">
        ${ui.novaVersao ? `<button class="versao-nova faixa" data-acao="atualizar">Versão nova do app! Toca pra baixar</button>` : ''}
        ${aula}
        <section class="cartao-estudo papel r4">
          <div class="cartao-linha"><img class="cartao-ic" src="${IC('gota')}" alt="">
            <div><h3>Revisão</h3><p>${regar.length ? `${plural(regar.length, 'frase está', 'frases estão')} pedindo revisão. Revisar na hora certa é o que faz você não esquecer.` : 'Tudo revisado por hoje. As próximas aparecem quando chegar a hora.'}</p></div></div>
          ${regar.length ? `<button class="botao azul cheio c1" data-acao="regar"><img src="${IC('gota')}" alt="">Revisar ${plural(regar.length, 'frase', 'frases')}</button>` : ''}
        </section>
        <section class="cartao-estudo papel r5">
          <div class="cartao-linha"><img class="cartao-ic" src="${IC(fala ? 'mic' : 'fala')}" alt="">
            <div><h3>Conversar em inglês</h3><p>${fala ? 'Fala com o Torrão por voz. Ele ouve o que você disse de verdade e corrige gramática e pronúncia.' : 'Conversa escrevendo com o Torrão. Ele corrige seus erros com jeitinho.'}</p></div></div>
          <div class="linha-botoes">
            <button class="botao laranja c2" data-acao="abrirConversa" data-n="${n}" ${fala ? 'data-voz="1"' : ''}>${fala ? 'Conversar falando' : 'Conversar'}</button>
            <button class="botao kraft c3" data-acao="perguntar">Tirar uma dúvida</button>
          </div>
        </section>
        <section class="cartao-estudo papel r6">
          <div class="cartao-linha"><img class="cartao-ic" src="${IC('trofeu')}" alt="">
            <div><h3>${ult ? `Seu nível: ${ult.geral}` : 'Qual é o seu nível?'}</h3>
            <p>${ult ? `${esc(NIVEL_TXT[ult.geral] || '')} Teste feito em ${ult.data.split('-').reverse().join('/')}.` : 'Teste completo de vocabulário, gramática, leitura, escuta, escrita e fala. Uns 25 minutos, com nível no padrão internacional (A1 a C2).'}</p></div></div>
          <div class="linha-botoes">${ult ? `<button class="botao kraft c1" data-acao="verTeste">Ver o resultado</button><button class="botao kraft c3" data-acao="testeNivel">Refazer</button>` : `<button class="botao verde c3" data-acao="testeNivel">Fazer o teste de nível</button>`}</div>
        </section>
        <section class="cartao-estudo papel r1">
          <div class="cartao-linha"><img class="cartao-ic" src="${IC('estrela')}" alt="">
            <div><h3>Plano de ${CF.DIAS.length} dias</h3><p>Semana ${semana}: ${feitosSem} de ${dSem.length} dias feitos.</p></div></div>
          <div class="semana-pontos">${dSem.map(x => `<i class="${CF.diaCompleto(x.n) ? 'ok' : ''} ${x.n === n ? 'hoje' : ''}"></i>`).join('')}</div>
          <button class="botao kraft c4" data-acao="tela" data-tela="hoje">Ver o plano completo</button>
        </section>
      </div>
    </main>`;
  }


  // ---------- teste de nível (CEFR): vocabulário, gramática, leitura, escuta, escrita e fala ----------
  // As 4 primeiras partes são de múltipla escolha (corrigidas no app); escrita e fala são avaliadas pela IA (ela ouve o áudio).
  const NIVEIS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const PARTES = { vocab: 'Vocabulário', gramatica: 'Gramática', leitura: 'Leitura', escuta: 'Escuta', escrita: 'Escrita', fala: 'Fala' };
  const PARTE_DICA = {
    vocab: 'Escolhe a palavra certa.', gramatica: 'Escolhe o que completa a frase.', leitura: 'Lê o texto e responde.',
    escuta: 'Ouve com atenção e responde. Dá pra ouvir de novo 2 vezes.'
  };
  const TREINAR = {
    vocab: 'Vocabulário: faz as frases do app todo dia e uns 10 minutos de Anki.',
    gramatica: 'Gramática: pratica escrevendo no app e lê a dica da IA quando errar.',
    leitura: 'Leitura: lê coisas curtas em inglês sobre o que você gosta (notícias de jogo, posts, legendas).',
    escuta: 'Escuta: vídeos com legenda em inglês e, depois, o mesmo trecho sem legenda.',
    escrita: 'Escrita: escreve 3 ou 4 frases por dia na conversa com o Torrão.',
    fala: 'Fala: conversa falando com o Torrão todo dia, nem que seja 5 minutos.'
  };
  let tn = null;

  function abrirTeste() {
    const T = CF.TESTE_NIVEL, ord = (a, b) => NIVEIS.indexOf(a.n) - NIVEIS.indexOf(b.n);
    const itens = [];
    T.vocab.slice().sort(ord).forEach(q => itens.push(Object.assign({ sec: 'vocab' }, q)));
    T.gramatica.slice().sort(ord).forEach(q => itens.push(Object.assign({ sec: 'gramatica' }, q)));
    T.leitura.slice().sort(ord).forEach(tx => tx.perguntas.forEach(q => itens.push(Object.assign({ sec: 'leitura', n: tx.n, titulo: tx.titulo, texto: tx.texto }, q))));
    T.escuta.slice().sort(ord).forEach(q => itens.push(Object.assign({ sec: 'escuta', ouviu: 0 }, q)));
    tn = { fase: 'intro', itens, pos: 0, resp: [], escrita: null, fala: null };
    renderTeste();
  }

  function nivelParte(itens) {
    // o nível da parte é o mais alto que a pessoa acerta (60% ou mais) sem ter falhado num nível abaixo
    // (nível com 1 questão só conta se o nível de baixo foi todo certo: assim um chute não sobe o resultado)
    let nivel = 0, antes = 1;
    for (let k = 0; k < 5; k++) {
      const qs = itens.filter(q => q.n === NIVEIS[k]);
      if (!qs.length) continue;
      const ok = qs.filter(q => q.certo).length / qs.length;
      if (ok >= 0.6 && (qs.length > 1 || antes === 1)) nivel = k; else break;
      antes = ok;
    }
    return nivel;
  }

  function nivelObjetivo() {
    const r = {};
    ['vocab', 'gramatica', 'leitura', 'escuta'].forEach(s => { r[s] = nivelParte(tn.itens.filter(q => q.sec === s)); });
    return r;
  }

  function renderTeste() {
    if (!tn) return;
    const total = tn.itens.length + (CF.ia.pronta() ? (CF.voz.podeGravar() ? 2 : 1) : 0);
    let feitas = tn.fase === 'q' ? tn.pos : tn.fase === 'intro' ? 0 : tn.fase === 'escrita' ? tn.itens.length : tn.fase === 'fala' ? tn.itens.length + 1 : total;
    let corpo = '';
    if (tn.fase === 'intro') {
      const ia = CF.ia.pronta();
      corpo = `<div class="bilhete-rev papel r3 teste-intro"><span class="fita"></span>
        <div class="rev-dica">TESTE DE NÍVEL</div>
        <div class="rev-pergunta">Descubra seu nível de inglês</div>
        <ol class="teste-partes">
          <li><b>Vocabulário</b> e <b>gramática</b>: escolher a resposta certa</li>
          <li><b>Leitura</b>: 3 textos curtos</li>
          <li><b>Escuta</b>: ouvir frases e áudios</li>
          <li><b>Escrita</b>: um texto curto em inglês${ia ? '' : ' (precisa da chave da IA)'}</li>
          <li><b>Fala</b>: falar uns 30 a 60 segundos${ia && CF.voz.podeGravar() ? '' : ia ? ' (precisa de microfone)' : ' (precisa da chave da IA)'}</li>
        </ol>
        <p class="apr-txt">Uns 25 minutos. As perguntas vão ficando mais difíceis: se não souber, chuta ou escolhe a que parecer melhor. Ninguém acerta tudo.</p>
        <p class="apr-txt" style="font-size:13px">O resultado sai no padrão internacional (A1 a C2), igual aos testes oficiais.</p>
      </div>
      <button class="botao grande laranja cheio c2" data-acao="tnComecar">Começar o teste</button>`;
    } else if (tn.fase === 'q') {
      const q = tn.itens[tn.pos], primeira = !tn.pos || tn.itens[tn.pos - 1].sec !== q.sec;
      const ordem = ['vocab', 'gramatica', 'leitura', 'escuta'].indexOf(q.sec) + 1;
      corpo = `<div class="bilhete-rev papel r3 teste-q"><span class="fita"></span>
        <div class="rev-dica">PARTE ${ordem} DE 6 · ${PARTES[q.sec].toUpperCase()}</div>
        ${primeira ? `<p class="teste-dica">${PARTE_DICA[q.sec]}</p>` : ''}
        ${q.sec === 'leitura' ? `<div class="teste-texto"><b>${esc(q.titulo || '')}</b><p>${esc(q.texto)}</p></div>` : ''}
        ${q.sec === 'escuta' ? `<div style="display:flex; justify-content:center"><button class="botao azul c1" data-acao="tnOuvir" ${q.ouviu >= 3 ? 'disabled' : ''}><img src="${IC('fone')}" alt="">${q.ouviu ? `Ouvir de novo (${3 - q.ouviu})` : 'Ouvir'}</button></div>` : ''}
        <div class="rev-pergunta teste-p">${esc(q.p)}</div>
        <div class="teste-ops">${q.op.map((o, i) => `<button class="teste-op" data-acao="tnResp" data-i="${i}">${esc(o)}</button>`).join('')}</div>
      </div>`;
    } else if (tn.fase === 'escrita') {
      const e = tn.escrita, palavras = (e.texto.trim().match(/\S+/g) || []).length;
      corpo = `<div class="bilhete-rev papel r3"><span class="fita"></span>
        <div class="rev-dica">PARTE 5 DE 6 · ESCRITA</div>
        <div class="rev-pergunta teste-p">${esc(e.tarefa.tarefa)}</div>
        <textarea id="tnTexto" class="teste-area" placeholder="Escreve em inglês aqui..." autocapitalize="sentences" spellcheck="false">${esc(e.texto)}</textarea>
        <div class="teste-cont"><span id="tnCont">${palavras}</span> palavras (pede pelo menos ${e.tarefa.min})</div>
      </div>
      <button class="botao grande laranja cheio c2" data-acao="tnEscrita">Enviar o texto</button>
      <button class="link" data-acao="tnPularEscrita">Pular essa parte</button>`;
    } else if (tn.fase === 'fala') {
      const f = tn.fala;
      corpo = `<div class="bilhete-rev papel r3"><span class="fita"></span>
        <div class="rev-dica">PARTE 6 DE 6 · FALA</div>
        <div class="rev-pergunta teste-p">${esc(f.tarefa.tarefa)}</div>
        <p class="teste-dica">${esc(f.tarefa.dica)}</p>
        <div class="chat-voz" style="padding:6px 0 0">
          <div class="voz-status">${f.gravando ? `Gravando... <span id="tnTempo">${f.seg || 0}</span>s (fala uns 30 a 60 segundos)` : f.aviso || 'Toca no microfone e fala em inglês. Toca de novo quando terminar.'}</div>
          <button class="mic ${f.gravando ? 'ouvindo' : ''}" data-acao="tnGravar" aria-label="Gravar"><img src="${IC('mic')}" alt=""></button>
        </div>
      </div>
      <button class="link" data-acao="tnPularFala">Pular essa parte</button>`;
    } else if (tn.fase === 'avaliando') {
      corpo = `<div class="bilhete-rev papel r3"><span class="fita"></span>
        <div class="rev-pergunta">Calculando seu nível...</div>
        <div class="corrigindo"><span class="bolinhas"><i></i><i></i><i></i></span>A IA está avaliando sua escrita e sua fala. Leva uns segundos.</div>
      </div>`;
    } else if (tn.fase === 'fim') {
      $camada.innerHTML = resultadoTesteHtml(tn.resultado, true);
      return;
    }
    $camada.innerHTML = `<div class="revisao estudo teste" role="dialog" aria-label="Teste de nível"><div class="ceu"></div><div class="rev">
      <div class="rev-topo">${FECHAR('tnSair')}<div class="barra verde"><i style="width:${(feitas / total * 100).toFixed(0)}%"></i></div><span class="rev-cont">${Math.min(feitas + 1, total)}/${total}</span></div>
      ${corpo}</div></div>`;
    const area = document.getElementById('tnTexto');
    if (area) area.addEventListener('input', () => {
      tn.escrita.texto = area.value;
      const c = document.getElementById('tnCont');
      if (c) c.textContent = (area.value.trim().match(/\S+/g) || []).length;
    });
    if (tn.fase === 'q' && tn.itens[tn.pos].sec === 'escuta' && !tn.itens[tn.pos].ouviu) setTimeout(() => ouvirItem(), 350);
  }

  function ouvirItem() {
    const q = tn && tn.itens[tn.pos];
    if (!q || q.sec !== 'escuta' || q.ouviu >= 3) return;
    q.ouviu++;
    CF.falar(q.audio);
    const b = $camada.querySelector('[data-acao="tnOuvir"]');
    if (b) { b.innerHTML = `<img src="${IC('fone')}" alt="">Ouvir de novo (${3 - q.ouviu})`; b.disabled = q.ouviu >= 3; }
  }

  function responderItem(i) {
    const q = tn.itens[tn.pos];
    q.escolha = i; q.certo = i === q.c;
    CF.som.toque();
    tn.pos++;
    if (tn.pos < tn.itens.length) { renderTeste(); return; }
    // fim da múltipla escolha: escrita e fala no nível que a pessoa mostrou até aqui
    const obj = nivelObjetivo(), media = Math.round((obj.vocab + obj.gramatica + obj.leitura + obj.escuta) / 4);
    const alvo = NIVEIS[Math.max(1, Math.min(3, media))];
    const T = CF.TESTE_NIVEL, pega = lista => lista.find(x => x.n === alvo) || lista[lista.length - 1];
    tn.escrita = { tarefa: pega(T.escrita), texto: '', res: null };
    tn.fala = { tarefa: pega(T.fala), res: null };
    if (!CF.ia.pronta()) { finalizarTeste(); return; }
    tn.fase = 'escrita';
    renderTeste();
  }

  function irPraFala() {
    if (!CF.voz.podeGravar()) { finalizarTeste(); return; }
    tn.fase = 'fala';
    renderTeste();
  }

  function gravarTeste() {
    const f = tn.fala;
    if (f.gravando) { CF.voz.pararGravacao(); return; }
    f.gravando = true; f.seg = 0; f.aviso = '';
    renderTeste();
    clearInterval(f.relogio);
    f.relogio = setInterval(() => { f.seg++; const el = document.getElementById('tnTempo'); if (el) el.textContent = f.seg; }, 1000);
    const alvo = tn;
    CF.voz.gravar(ev => {
      if (tn !== alvo) return;
      if (ev.tipo === 'nivel') { const m = $camada.querySelector('.mic'); if (m) m.style.setProperty('--nivel', ev.nivel.toFixed(2)); }
      else if (ev.tipo === 'erro') {
        clearInterval(f.relogio); f.gravando = false;
        f.aviso = ev.erro === 'silencio' ? 'Não ouvi nada. Toca no microfone e tenta de novo.' : 'O app precisa do microfone. Toca de novo e permite.';
        renderTeste();
      } else if (ev.tipo === 'audio') {
        clearInterval(f.relogio); f.gravando = false;
        if (ev.segundos < 8) { f.aviso = 'Ficou bem curtinho. Tenta falar pelo menos uns 30 segundos.'; renderTeste(); return; }
        f.promessa = CF.ia.avaliarFala(ev.base64, f.tarefa.tarefa).then(r => { f.res = r; }).catch(e => { f.erro = e.message; });
        finalizarTeste();
      }
    }, { manual: true, max: 90 });
  }

  async function finalizarTeste() {
    const alvo = tn;
    tn.fase = 'avaliando';
    renderTeste();
    try { await Promise.all([tn.escrita && tn.escrita.promessa, tn.fala && tn.fala.promessa].filter(Boolean)); } catch (e) { /* cada parte guarda o próprio erro */ }
    if (tn !== alvo) return;
    const obj = nivelObjetivo(), skills = {};
    Object.keys(obj).forEach(s => { skills[s] = NIVEIS[obj[s]]; });
    const valido = n => NIVEIS.includes(String(n || '').toUpperCase()) ? String(n).toUpperCase() : null;
    const esc2 = tn.escrita && tn.escrita.res, fal = tn.fala && tn.fala.res;
    if (esc2 && valido(esc2.nivel)) skills.escrita = valido(esc2.nivel);
    if (fal && valido(fal.nivel)) skills.fala = valido(fal.nivel);
    // nível geral: a média das partes, puxando pra baixo (um nível só conta quando está firme).
    // Parte que já bateu no teto do que ela mede (a leitura vai até B2) não derruba quem está acima disso.
    const teto = s => Math.max(...tn.itens.filter(q => q.sec === s).map(q => NIVEIS.indexOf(q.n)));
    let idx = Object.keys(skills).map(s => ({ s, v: NIVEIS.indexOf(skills[s]), noTeto: obj[s] != null && obj[s] === teto(s) }));
    const mediaOutras = x => { const o = idx.filter(y => y !== x); return o.length ? o.reduce((a, y) => a + y.v, 0) / o.length : x.v; };
    idx = idx.filter(x => !(x.noTeto && x.v < mediaOutras(x))).map(x => x.v);
    const media = idx.reduce((a, b) => a + b, 0) / idx.length, base = Math.max(0, Math.floor(media + 0.1));
    const geral = NIVEIS[base], quase = media - base >= 0.5 && NIVEIS[base + 1] ? NIVEIS[base + 1] : '';
    const erros = tn.itens.filter(q => !q.certo).map(q => ({ parte: PARTES[q.sec], n: q.n, p: q.sec === 'escuta' ? `${q.p} (áudio: "${q.audio}")` : q.p, certa: q.op[q.c], sua: q.op[q.escolha] }));
    const acertos = tn.itens.filter(q => q.certo).length;
    const res = {
      data: CF.hoje(), geral, quase, skills, acertos, total: tn.itens.length, erros,
      escrita: esc2 ? { nivel: skills.escrita, comentario: esc2.comentario || '', correcao: esc2.correcao || '', texto: tn.escrita.texto } : (tn.escrita && tn.escrita.erro ? { erro: tn.escrita.erro } : null),
      fala: fal ? { nivel: skills.fala, comentario: fal.comentario || '', transcricao: fal.transcricao || '' } : (tn.fala && tn.fala.erro ? { erro: tn.fala.erro } : null)
    };
    CF.estado.testesNivel = (CF.estado.testesNivel || []).concat([res]).slice(-10);
    CF.marcarAtividade(); CF.salvar();
    CF.som.festa();
    tn.resultado = res; tn.fase = 'fim';
    renderTeste();
  }

  function resultadoTesteHtml(r, novo) {
    const lista = CF.estado.testesNivel || [], i = lista.indexOf(r), antes = i > 0 ? lista[i - 1] : null;
    const barras = Object.keys(PARTES).filter(s => r.skills[s]).map(s => {
      const k = NIVEIS.indexOf(r.skills[s]);
      return `<div class="nivel-barra"><span>${PARTES[s]}</span><div class="barra verde"><i style="width:${((k + 1) / 6 * 100).toFixed(0)}%"></i></div><b>${r.skills[s]}</b></div>`;
    }).join('');
    const fracas = Object.keys(r.skills).sort((a, b) => NIVEIS.indexOf(r.skills[a]) - NIVEIS.indexOf(r.skills[b])).slice(0, 2);
    const falta = ['escrita', 'fala'].filter(s => !r.skills[s]);
    return `<div class="revisao estudo teste" role="dialog" aria-label="Resultado do teste"><div class="ceu"></div><div class="rev teste-res">
      <div class="rev-topo">${FECHAR('fechar')}<span class="rotulo" style="flex:1">Resultado do teste · ${r.data.split('-').reverse().join('/')}</span></div>
      <div class="bilhete-rev papel r2"><span class="fita"></span>
        <div class="rev-dica">SEU NÍVEL DE INGLÊS</div>
        <div class="nivel-grande">${r.geral}</div>
        ${r.quase ? `<p class="apr-txt" style="margin-top:-4px"><b>Quase ${r.quase}</b>: várias partes já estão no ${r.quase}.</p>` : ''}
        <p class="apr-txt">${esc(NIVEL_TXT[r.geral] || '')}</p>
        ${antes ? `<p class="apr-txt" style="font-size:13px">No teste anterior (${antes.data.split('-').reverse().join('/')}): ${antes.geral}</p>` : ''}
        <p class="apr-txt" style="font-size:13px">Acertou ${r.acertos} de ${r.total} na múltipla escolha.${falta.length ? ` Sem ${falta.map(s => PARTES[s].toLowerCase()).join(' e ')}: o nível geral pode estar impreciso.` : ''}</p>
      </div>
      <div class="papel r4 teste-bloco"><h3>Por parte</h3>${barras}</div>
      ${r.fala && r.fala.comentario ? `<div class="papel r5 teste-bloco"><h3>Sua fala (${r.fala.nivel})</h3><p>${esc(r.fala.comentario)}</p>${r.fala.transcricao ? `<details class="como"><summary>O que a IA ouviu</summary><p class="en">${esc(r.fala.transcricao)}</p></details>` : ''}</div>` : r.fala && r.fala.erro ? `<div class="papel r5 teste-bloco"><h3>Fala</h3><p>A IA não conseguiu avaliar agora (${esc(r.fala.erro)}).</p></div>` : ''}
      ${r.escrita && r.escrita.comentario ? `<div class="papel r6 teste-bloco"><h3>Sua escrita (${r.escrita.nivel})</h3><p>${esc(r.escrita.comentario)}</p>${r.escrita.correcao ? `<details class="como"><summary>Seu texto corrigido</summary><p class="en">${esc(r.escrita.correcao)}</p></details>` : ''}</div>` : r.escrita && r.escrita.erro ? `<div class="papel r6 teste-bloco"><h3>Escrita</h3><p>A IA não conseguiu avaliar agora (${esc(r.escrita.erro)}).</p></div>` : ''}
      <div class="papel r1 teste-bloco"><h3>O que treinar agora</h3>${fracas.map(s => `<p>${esc(TREINAR[s])}</p>`).join('')}<p style="font-size:13px; color:var(--tinta-2)">Refaz o teste daqui a umas 4 semanas pra ver quanto você subiu.</p></div>
      ${r.erros && r.erros.length ? `<div class="papel r3 teste-bloco"><details class="como"><summary>Ver as ${r.erros.length} que você errou</summary>${r.erros.map(e => `<div class="teste-erro"><small>${esc(e.parte)} · ${e.n}</small><p>${esc(e.p)}</p><p>Certa: <b>${esc(e.certa)}</b> · Você: ${esc(e.sua || '')}</p></div>`).join('')}</details></div>` : ''}
      <button class="botao grande laranja cheio c2" data-acao="fechar">${novo ? 'Voltar a estudar' : 'Fechar'}</button>
    </div></div>`;
  }

  // ---------- Horta: as frases plantadas ----------
  function telaHorta() {
    const regar = CF.paraRegar(), plantas = CF.plantas();
    const ordem = plantas.slice().sort((a, b) => (CF.precisaAgua(b) ? 1 : 0) - (CF.precisaAgua(a) ? 1 : 0));
    let horta;
    if (!plantas.length) {
      horta = `<div class="vazio"><img src="${PLANTA('semente')}" alt="">
        <div class="papel r3 torto-e"><span class="fita"></span><p>Sua horta ainda está vazia. Cada frase que você aprende vira uma plantinha aqui.</p></div>
        <button class="botao verde c3" data-acao="abrirDia" data-n="${CF.diaAtual()}">Ir pro Dia ${CF.diaAtual()}</button></div>`;
    } else {
      horta = '<div class="lotes">' + ordem.map((id, i) => {
        const c = CF.TODAS_CARTAS[id], sede = CF.precisaAgua(id);
        return `<button class="lote" data-acao="planta" data-id="${id}" aria-label="${esc(fraseEn(c))}${sede ? ', pedindo revisão' : ''}" style="--d:${(-(i * 0.73) % 5).toFixed(2)}s; --t:${(4.6 + (i % 4) * 0.5).toFixed(1)}s">
          <img class="planta" src="${PLANTA(CF.imgPlanta(id))}" alt="">${sede ? `<img class="gotinha" src="${IC('gota')}" alt="">` : ''}
          <span class="tira">${esc(fraseEn(c))}</span></button>`;
      }).join('') + '</div>';
    }
    return `<main class="tela" data-tela="horta">
      <header class="topo"><div class="papel r1 torto-e"><h1>A horta</h1>
        <p>${plantas.length ? `Cada frase que você aprende vira uma planta. ${CF.dominadas()} de ${plantas.length} você já sabe bem.` : 'Cada frase que você aprende vira uma planta.'} Planta com gotinha está pedindo revisão.</p>
        ${regar.length ? `<button class="botao azul cheio c1" data-acao="regar" style="margin-top:10px"><img src="${IC('gota')}" alt="">Revisar ${plural(regar.length, 'frase', 'frases')}</button>` : ''}
      </div></header>
      <section class="horta">${horta}</section>
    </main>`;
  }

  // ---------- o que fazer agora (cartão da tela inicial) ----------
  // ---------- metas de hoje (no quarto, do jeito do Finch) ----------
  const META = { aprender: ['Aprender', 'video'], testar: ['Praticar', 'cerebro'], usar: ['Falar', 'fala'], regar: ['Revisar', 'gota'], resultado: ['Resultado', 'trofeu'] };
  function contasHtml(regar) {
    return `<span class="contas"><span title="Laranjas"><img src="${PLANTA('fruta')}" alt="Laranjas">${CF.estado.frutas}</span>`
      + `<span title="Frases pra revisar"><img src="${IC('gota')}" alt="Frases pra revisar">${regar.length}</span></span>`;
  }
  function hojeHtml(regar) {
    const s = CF.estado.surpresa;
    const versao = ui.novaVersao ? `<button class="versao-nova" data-acao="atualizar">Versão nova do app! Toca pra baixar</button>` : '';
    const revisar = regar.length ? `<button class="botao azul mini c1 regar-hoje" data-acao="regar"><img src="${IC('gota')}" alt="">Revisar ${plural(regar.length, 'frase', 'frases')}</button>` : '';
    // terminou um dia hoje: energia cheia, volta amanhã (ou adianta o próximo)
    if (s && s.data === CF.hoje() && !s.feita && s.dia && !s.adiantou && !CF.diaCompleto(CF.diaAtual())) {
      return `<div class="papel r2 hoje">${versao}
        <div class="hoje-topo"><span class="rotulo">Hoje · Dia ${s.dia}</span>${contasHtml(regar)}</div>
        <h2>Dia completo!</h2>
        <div class="energia"><span>Energia cheia! Amanhã o Torrão traz uma surpresa.</span><div class="barra verde"><i style="width:100%"></i></div></div>
        <div class="linha-botoes">${revisar}<button class="botao kraft mini c3" data-acao="adiantar">Adiantar o Dia ${CF.diaAtual()}</button></div>
      </div>`;
    }
    const n = CF.diaAtual(), d = CF.dia(n), metas = CF.metas(n);
    const feitas = metas.filter(p => CF.metaFeita(n, p)).length;
    const prox = metas.find(p => !CF.metaFeita(n, p));
    const botoes = metas.map(p => {
      const ok = CF.metaFeita(n, p), [nome, ic] = META[p.id] || [NOME_PASSO[p.id], 'carta'];
      return `<button class="meta ${ok ? 'ok' : ''} ${p === prox ? 'agora' : ''}" data-acao="meta" data-id="${p.id}"><img src="${IC(ok ? 'check' : ic)}" alt="">${esc(nome)}</button>`;
    }).join('');
    return `<div class="papel r2 hoje">${versao}
      <div class="hoje-topo"><span class="rotulo">Hoje · Dia ${n}</span>${contasHtml(regar)}<button class="link" data-acao="abrirDia" data-n="${n}">Ver o dia</button></div>
      <h2>${esc(d.tema)}</h2>
      <div class="metas">${botoes}</div>
      <div class="energia"><span>Energia do Torrão</span><div class="barra verde"><i style="width:${(feitas / metas.length * 100).toFixed(0)}%"></i></div></div>
      ${revisar && !metas.some(p => p.id === 'regar') ? `<div class="linha-botoes">${revisar}</div>` : ''}
    </div>`;
  }

  // ---------- apresentação (primeira vez) ----------
  const INTRO = [
    { t: 'Oi, eu sou o Torrão!', p: 'Vou te ajudar a falar inglês. Um pouquinho por dia.', img: 'pet' },
    { t: 'Metas curtinhas todo dia', p: 'Aprende as frases, pratica escrevendo e fala um pouco. Uns 20 minutos (e tem dia leve).', img: 'plantas' },
    { t: 'Acertou, ganha laranja', p: 'Cada frase vira uma planta. Laranja me alimenta e decora meu quarto.', img: 'fruta' }
  ];
  function intro(i) {
    const x = INTRO[i], ultimo = i === INTRO.length - 1, fase = CF.faseMostrada();
    const figura = x.img === 'pet' ? CF.petHtml(fase, 'tranquilo', 200, 'data-solto="0"')
      : x.img === 'plantas' ? `<div class="intro-plantas"><img src="${PLANTA('broto-murcho')}" alt=""><img src="${PLANTA('frutos')}" alt=""></div>`
        : `<img class="intro-fruta" src="${PLANTA('fruta')}" alt="">`;
    $camada.innerHTML = `<div class="festa intro" role="dialog" aria-label="Apresentação"><div class="ceu"></div>
      <div class="festa-box">
        ${figura}
        <div class="papel r4"><span class="fita"></span><h1>${esc(x.t)}</h1><p>${esc(x.p)}</p></div>
        <div class="pontinhos">${INTRO.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        ${ultimo ? `<button class="botao grande laranja c2" data-acao="introFim">Bora!</button>`
          : `<button class="botao grande laranja c2" data-acao="introProx" data-i="${i + 1}">Próximo</button><button class="link" data-acao="introPular">Pular</button>`}
      </div></div>`;
    if (i > 0) { const f = $camada.querySelector('.festa'); if (f) f.style.animation = 'none'; }
    CF.montarPets($camada);
  }

  // ---------- mapa (os dias, mês a mês, no cenário escolhido) ----------
  const XS = [50, 74, 30, 64, 26, 70, 46];
  function layoutMapa(m) {
    const pos = [];
    let y = 40;
    CF.DIAS.filter(d => d.n >= m.de && d.n <= m.ate).forEach((d, i) => {
      if ((d.n - 1) % 7 === 0) { pos.push({ semana: CF.semanaDe(d.n), y }); y += 130; }
      const grande = d.tipo === 'chefao' || d.tipo === 'desafio' || !!d.efset;
      const x = d.tipo === 'chefao' ? 50 : XS[i % XS.length];
      y += grande ? 40 : 0;
      pos.push({ d, x, y, grande });
      y += grande ? 200 : 150;
    });
    return { pos, altura: y + 40 };
  }

  function imgIlha(m, d, feito) {
    if (d.tipo === 'chefao' || (d.efset && d.tipo === 'leve')) return m.ilhas + 'chefao.png';
    if (d.tipo === 'desafio') return m.ilhas + 'desafio.png';
    return m.ilhas + (feito ? 'feito' : 'comum') + '.png';
  }

  function telaHoje() {
    const atual = CF.diaAtual();
    if (ui.mes == null) ui.mes = Math.min(CF.MESES.length, CF.mesDe(atual)) - 1;
    const mes = CF.MESES[ui.mes];
    const m = CF.mundoEscolhido();
    const { pos, altura } = layoutMapa(mes);
    const ilhas = pos.filter(p => p.d);
    let caminho = '';
    ilhas.forEach((p, i) => {
      const x = p.x * 4.2, y = p.y;
      if (!i) caminho += `M ${x} ${y}`;
      else {
        const a = ilhas[i - 1], ax = a.x * 4.2;
        caminho += ` C ${ax} ${(a.y + y) / 2}, ${x} ${(a.y + y) / 2}, ${x} ${y}`;
      }
    });
    const fase = CF.faseMostrada();
    const html = pos.map((p, i) => {
      if (p.semana) return `<div class="semana papel r${(p.semana % 6) + 1}" style="top:${p.y}px">Semana ${p.semana}</div>`;
      const d = p.d, feito = CF.diaCompleto(d.n), eAtual = d.n === atual;
      const cls = ['ilha-dia', feito ? 'feito' : '', eAtual ? 'atual' : '', d.n > atual ? 'futuro' : '', p.grande ? 'grande' : '', d.tipo === 'leve' ? 'leve' : ''].join(' ');
      return `<button class="${cls}" data-acao="abrirDia" data-n="${d.n}" style="left:${p.x}%; top:${p.y}px; --d:${(-(i * 0.9) % 6).toFixed(2)}s" aria-label="Dia ${d.n}: ${esc(d.tema)}${feito ? ', feito' : ''}">
        <span class="num">${d.n}</span>
        <img class="ilha-img" src="${imgIlha(m, d, feito)}" alt="">
        ${eAtual ? `<div class="marcador">${CF.petHtml(fase, CF.humor(), 74, 'data-solto="0"')}</div>` : ''}
        <span class="tira">${esc(d.tema)}${d.efset ? ' + teste de nível' : ''}</span>
      </button>`;
    }).join('');
    const abas = CF.MESES.map((x, k) => `<button class="aba-mundo ${k === ui.mes ? 'on' : ''}" data-acao="mes" data-k="${k}">
      <small>Dias ${x.de} a ${x.ate}</small>Mês ${k + 1}</button>`).join('');
    return `<main class="tela" data-tela="hoje">
      <header class="topo"><div class="papel r1 torto-e"><h1>O mapa</h1><p>Você está no Dia ${atual}. Toca numa ilha pra abrir o dia.</p>
</div></header>
      <nav class="abas-mundo" aria-label="Meses">${abas}</nav>
      <div class="mapa" style="height:${altura}px">
        <svg class="linha" viewBox="0 0 420 ${altura}" preserveAspectRatio="none" aria-hidden="true">
          <path d="${caminho}" fill="none" stroke="rgba(58,38,23,.5)" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 12"/>
        </svg>
        ${html}
      </div>
    </main>`;
  }

  // ---------- folhas da Casa: Roupas e Decorar (abrem por cima, o quarto continua atrás) ----------
  function decorarHtml() {
    const t = CF.toca(), lugar = ui.vaga || 'quarto';
    const chips = ['quarto', 'janela'].concat(CF.LUGARES_TOCA).map(l =>
      `<button class="chip ${l === lugar ? 'on' : ''}" data-acao="vaga" data-lugar="${l}">${l === 'quarto' ? 'Quarto' : l === 'janela' ? 'Janela' : esc(CF.NOME_LUGAR_CURTO[l])}${CF.NOME_LUGAR_CURTO[l] && !t.poe[l] ? ' +' : ''}</button>`).join('');
    let itens;
    if (lugar === 'janela') {
      const atual = CF.mundoEscolhido().id;
      itens = CF.MUNDOS.map(m => `<button class="peca quarto-op ${m.id === atual ? 'vestida' : ''}" data-acao="usarMundo" data-id="${m.id}">
        <img src="${esc(m.fundo ? m.previa : CF.ceuUrl())}" alt=""><span>${esc(m.nome)}</span><small>${m.id === atual ? 'na janela' : 'grátis'}</small></button>`).join('');
    } else if (lugar === 'quarto') {
      const atual = CF.quartoAtual().id;
      itens = CF.QUARTOS.map(q => `<button class="peca quarto-op ${q.id === atual ? 'vestida' : ''}" data-acao="usarQuarto" data-id="${q.id}">
        <img src="${q.img}" alt=""><span>${esc(q.nome)}</span><small>${q.id === atual ? 'usando' : 'grátis'}</small></button>`).join('');
    } else {
      itens = CF.MOVEIS.filter(m => m.lugar === lugar).map(m => {
        const tem = t.tem.includes(m.id), posto = t.poe[lugar] === m.id, pode = CF.estado.frutas >= m.preco;
        return `<button class="peca ${posto ? 'vestida' : ''} ${!tem && !pode ? 'caro' : ''}" data-acao="${tem ? 'porMovel' : 'comprarMovel'}" data-id="${m.id}">
          <img src="assets/toca/${m.id}.png" alt=""><span>${esc(m.nome)}</span>
          <small>${tem ? (posto ? 'no quarto (tirar)' : 'tocar pra pôr') : `<b class="preco"><img src="${PLANTA('fruta')}" alt="">${m.preco}</b>`}</small></button>`;
      }).join('');
    }
    return `<div class="chips">${chips}</div><div class="itens-linha">${itens}</div>`;
  }

  function abrirFolha(qual) {
    ui.folha = qual;
    const pts = CF.pontosTotal(), fase = CF.faseMostrada();
    const titulo = qual === 'roupas' ? 'Roupas' : 'Decorar';
    const antiga = $camada.querySelector('.folha');
    const y = antiga ? antiga.scrollTop : 0;
    const xs = [...$camada.querySelectorAll('.chips, .itens-linha')].map(el => el.scrollLeft);
    if (qual === 'roupas') {
      $camada.innerHTML = `<div class="escuro" data-acao="fecharFora"><div class="folha papel folha-casa" role="dialog" aria-label="${titulo}">
        <div class="folha-topo"><h2>${titulo}</h2>${FECHAR('fechar')}</div>
        ${guardaRoupa(pts, fase)}
      </div></div>`;
    } else {
      // sem fundo escuro e sem fechar ao tocar fora: o quarto fica visível e os "+" do quarto continuam tocáveis
      $camada.innerHTML = `<div class="escuro claro"><div class="folha papel folha-decorar" role="dialog" aria-label="${titulo}">
        <div class="folha-topo"><h2>${titulo}</h2><span class="bilhete"><img src="${PLANTA('fruta')}" alt="">${CF.estado.frutas}</span>${FECHAR('fechar')}</div>
        ${decorarHtml()}
      </div></div>`;
      [...$camada.querySelectorAll('.chips, .itens-linha')].forEach((el, k) => { if (antiga && xs[k] != null && el.classList.contains('chips')) el.scrollLeft = xs[k]; });
      const on = $camada.querySelector('.chip.on');
      if (on) on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: antiga ? 'smooth' : 'auto' });
    }
    const f = $camada.querySelector('.folha');
    if (f) f.scrollTop = y;
    if (antiga) $camada.querySelectorAll('.escuro, .folha').forEach(el => { el.style.animation = 'none'; });   // já estava aberta: sem piscar
    CF.montarPets($camada);
    if (qual === 'roupas') subirQuarto(); else encaixarDecorar();
  }

  function encaixarDecorar() {
    const casa = $conteudo.querySelector('.tela.casa'), base = casa && casa.querySelector('.quarto-base');
    const f = $camada.querySelector('.folha');
    if (!base || !f) return;
    const topo = casa.getBoundingClientRect().top + base.offsetTop, alt = base.offsetHeight;
    const livre = window.innerHeight - f.offsetHeight - 8 - 8;
    const s = Math.min(1, livre / alt);
    base.style.setProperty('--dy', Math.round(Math.max(8, window.innerHeight - f.offsetHeight - 8 - alt * s) - topo) + 'px');
    base.style.setProperty('--s', s.toFixed(3));
  }

  // roupas: o quarto sobe até o Torrão ficar inteiro acima da folha (cada celular tem uma altura)
  function subirQuarto() {
    const casa = $conteudo.querySelector('.tela.casa'), base = casa && casa.querySelector('.quarto-base');
    const pet = base && base.querySelector('.pet'), f = $camada.querySelector('.folha');
    if (!pet || !f) return;
    casa.classList.add('vestindo');
    base.style.setProperty('--sobe', '0px');
    const falta = pet.getBoundingClientRect().bottom - window.innerHeight * 0.44 + 14;   // a folha de roupas sempre enche os 56vh dela (as imagens ainda podem estar carregando)
    base.style.setProperty('--sobe', Math.max(0, Math.round(falta)) + 'px');
  }

  // ---------- escolher o cenário ----------
  function abrirCenarios() {
    const atual = CF.mundoEscolhido().id;
    const cards = CF.MUNDOS.map(m => `<div class="cenario ${m.id === atual ? 'on' : ''}">
      <img src="${esc(m.previa)}" alt="">
      <div style="display:grid; gap:6px; align-content:center">
        <b>${esc(m.nome)}</b><p>${esc(m.texto)}</p>
        ${m.id === atual ? `<span class="feito-selo" style="font-size:15px"><img src="${IC('check')}" alt="" style="width:24px;height:24px">Usando este</span>`
          : `<button class="botao mini verde c2" data-acao="usarMundo" data-id="${m.id}">Usar este cenário</button>`}
      </div></div>`).join('');
    $camada.innerHTML = `<div class="escuro" data-acao="fecharFora"><div class="folha papel" role="dialog" aria-label="Cenários">
      <div class="folha-topo"><div style="display:grid; gap:4px"><span class="rotulo">Você escolhe</span><h2>Vista da janela</h2></div>${FECHAR('fechar')}</div>
      <p style="margin:0">É o que aparece na janela do quarto, no fundo e nas ilhas do mapa. Pode trocar quando quiser.</p>
      ${cards}
    </div></div>`;
  }

  // ---------- folha do dia ----------
  const NOME_PASSO = { aprender: 'Aprender', ouvir: 'Ouvir', testar: 'Praticar', usar: 'Falar', anki: 'Vocabulário (Anki)',
    regar: 'Revisar', efset: 'Teste de nível', resultado: 'Resultado', amigo: 'Conversa com o amigo' };
  const passoFeito = (r, p) => (p.tipo === 'usar' ? !!r.usar : !!r[p.id]);

  function passoHtml(d, p, agora) {
    const s = CF.semanaDe(d.n), r = CF.estado.dias[d.n] || {};
    const marcado = passoFeito(r, p);
    const lar = p.tipo === 'usar' ? CF.laranjasPasso('usar', r.usar || 30) : CF.laranjasPasso(p.id);
    const premio = p.id === 'testar' ? '+1 por acerto' : lar ? (p.tipo === 'usar' && !r.usar ? 'até +' : '+') + lar : '';
    const feito = txt => `<button class="botao mini ${marcado ? 'on' : 'kraft'} c3" data-acao="passo" data-passo="${p.id}">${marcado ? `<img class="ok" src="${IC('check')}" alt="">Feito` : esc(txt || 'Fiz')}</button>`;
    const ok = txt => `<img class="ok" src="${IC('check')}" alt="">${txt}`;
    let ic = 'carta', titulo = NOME_PASSO[p.id], resumo = '', acoes = '', detalhe = '';
    if (p.id === 'aprender') {
      ic = 'video'; resumo = 'Ouve as frases de hoje e repete em voz alta.';
      acoes = `<button class="botao mini ${marcado ? 'on' : 'laranja'} c2" data-acao="aprenderDia" data-n="${d.n}">${marcado ? ok('Feito (ver de novo)') : 'Aprender as frases'}</button>`;
      if (d.video && d.video.link) detalhe = `<p>Se quiser, tem um vídeo sobre o tema:</p><button class="botao mini azul c1" data-acao="link" data-url="${esc(d.video.link)}"><img src="${IC('video')}" alt="">Abrir vídeo</button>`;
      else if (d.video) detalhe = `<p>Se quiser um vídeo sobre o tema, cola isso no Gemini:</p>${blocoCopiar(CF.promptGemini(d.video.gemini), 'Copiar')}`;
    } else if (p.id === 'ouvir') {
      ic = 'fone'; resumo = '10 a 15 minutos ouvindo inglês de verdade.';
      detalhe = `<p>${esc(CF.ouvirTexto(d.n))}</p>`;
      acoes = feito();
    } else if (p.id === 'testar') {
      ic = 'cerebro';
      resumo = d.tipo === 'desafio' ? `Teste com as frases da semana ${d.semanaTeste}.` : 'Você escreve as frases de hoje em inglês e vê se acertou.';
      acoes = `<button class="botao mini ${r.testar ? 'on' : 'laranja'} c2" data-acao="teste">${r.testar ? ok('Feito (refazer)') : 'Praticar'}</button>`;
    } else if (p.id === 'usar') {
      ic = 'fala';
      if (d.tipo === 'chefao') titulo = 'Chefão: 20 min sem português';
      resumo = d.tipo === 'desafio' ? 'Hoje, se der, conversa com uma pessoa de verdade.' : 'Conversa em inglês: escrevendo com o Torrão, por voz com uma IA ou com alguém.';
      if (d.aprender) detalhe = `<p>${esc(d.aprender)}</p>`;
      acoes = `<button class="botao mini ${r.usar ? 'on' : 'laranja'} c2" data-acao="falarDia" data-n="${d.n}">${r.usar ? ok('Feito (mudar)') : 'Falar'}</button>`;
    } else if (p.id === 'anki') {
      ic = 'carta'; resumo = '10 minutos no Anki com as palavras mais comuns.';
      detalhe = '<p>Baixa o AnkiDroid (grátis) e um baralho das palavras mais comuns do inglês. É o que mais aumenta o vocabulário.</p>';
      acoes = feito();
    } else if (p.id === 'regar') {
      ic = 'gota'; resumo = 'Dia leve: revisa as frases que estão pedindo e descansa.';
      const sede = CF.paraRegar().length;
      acoes = sede && !marcado ? `<button class="botao mini azul c1" data-acao="regarDia" data-n="${d.n}"><img src="${IC('gota')}" alt="">Revisar ${sede}</button>` : feito(sede ? 'Revisei' : 'Marcar como feito');
    } else if (p.id === 'efset') {
      ic = 'trofeu'; resumo = 'Teste de nível grátis (uns 50 minutos). Faz num dia com calma.';
      detalhe = `<p>O EF SET dá seu nível no padrão internacional (A1 a C2). ${d.n === 1 ? 'Fazendo agora você sabe de onde está partindo.' : 'Compara com o resultado anterior: é a prova de que você evoluiu.'}</p>`;
      acoes = `<button class="botao mini azul c2" data-acao="link" data-url="https://www.efset.org/">Abrir o teste</button>` + feito('Fiz o teste');
    } else if (p.id === 'resultado') {
      ic = 'trofeu'; resumo = 'Pede pra IA seus erros mais comuns e seu nível.';
      detalhe = `${blocoCopiar('Tell me my 5 most common mistakes and my English level.', 'Copiar pra IA')}<p>Depois manda a resposta pro Claude montar as próximas semanas.</p>`;
      acoes = feito('Pedi');
    } else if (p.id === 'amigo') {
      ic = 'fala'; titulo = 'Conversa com o amigo';
      resumo = 'Conversou em inglês com seu amigo hoje?';
      acoes = feito('Conversei');
    }
    return `<div class="passo${marcado ? ' ok' : ''}${agora ? ' agora' : ''}${p.opcional ? ' opcional' : ''}">
      <div class="passo-ic"><img src="${IC(ic)}" alt=""></div>
      <div class="passo-corpo">
        <div class="passo-titulo"><b>${agora ? '<span class="agora-tag">Agora</span>' : ''}${esc(titulo)}</b><span class="pts">${premio ? `<img src="${PLANTA('fruta')}" alt="">${premio}` : ''}</span></div>
        <p class="resumo">${esc(resumo)}</p>
        <div class="linha-botoes">${acoes}</div>
        ${detalhe ? `<details class="como"><summary>Como fazer</summary>${detalhe}</details>` : ''}
      </div></div>`;
  }

  function abrirDia(n) {
    diaAberto = n;
    const folhaAntiga = $camada.querySelector('.folha');
    const y = folhaAntiga && folhaAntiga.dataset.dia === String(n) ? folhaAntiga.scrollTop : 0;
    const d = CF.dia(n), s = CF.semanaDe(n), completo = CF.diaCompleto(n);
    const reg = CF.estado.dias[n] || {}, passos = CF.passos(d);
    const metas = passos.filter(p => !p.opcional), extras = passos.filter(p => p.opcional);
    const feitosN = metas.filter(p => passoFeito(reg, p)).length;
    const proximo = metas.find(p => !passoFeito(reg, p));
    $camada.innerHTML = `<div class="escuro" data-acao="fecharFora"><div class="folha papel" data-dia="${n}" role="dialog" aria-label="Dia ${n}">
      <div class="folha-topo"><div style="display:grid; gap:4px"><span class="rotulo">Dia ${n} · Semana ${s}</span><h2>${esc(d.tema)}</h2></div>${FECHAR('fechar')}</div>
      <div class="progresso-dia"><span>${completo ? 'Dia completo!' : `${feitosN} de ${metas.length} metas feitas`}</span><div class="barra verde"><i style="width:${(feitosN / metas.length * 100).toFixed(0)}%"></i></div></div>
      <div class="passos">${metas.map(p => passoHtml(d, p, p === proximo)).join('')}</div>
      ${extras.length ? `<h3 class="extras-titulo">Extras (se quiser, dão mais laranja)</h3><div class="passos">${extras.map(p => passoHtml(d, p, false)).join('')}</div>` : ''}
      ${completo && n < CF.DIAS.length ? `<div class="total"><div class="feito-selo"><img src="${IC('check')}" alt="">Dia completo!</div><button class="botao verde cheio c2" data-acao="abrirDia" data-n="${n + 1}">Ir pro Dia ${n + 1}</button></div>` : ''}
    </div></div>`;
    const f = $camada.querySelector('.folha');
    if (f) f.scrollTop = y;
  }

  // ---------- progresso ----------
  function telaProgresso() {
    const pts = CF.pontosTotal(), fase = CF.fasePet(pts), prox = CF.FASES_PET[fase + 1];
    const nivel = CF.nivelCatalogo(pts);
    const feitos = CF.DIAS.filter(d => CF.diaCompleto(d.n)).length;
    const cresc = prox ? ((pts - CF.FASES_PET[fase].min) / (prox.min - CF.FASES_PET[fase].min) * 100) : 100;
    const vendo = CF.faseMostrada();
    const evol = CF.FASES_PET.map((f, k) => `<button class="${k === vendo ? 'agora' : ''}" data-acao="idade" data-k="${k}" aria-label="Mostrar o Torrão ${esc(f.nome)}">
      <img src="${PET_IMG(k, 'tranquilo')}" alt=""><span>${esc(f.nome)}</span></button>`).join('');
    const agora = CF.CATALOGO[nivel], depois = CF.CATALOGO[nivel + 1];
    const caminho = CF.CATALOGO.map((c, k) => `<div class="nivel ${k <= nivel ? 'ok' : ''} ${k === nivel ? 'agora' : ''}"><b>${k <= nivel ? `<img src="${IC('check')}" alt="">` : ''}</b><p>${esc(c[1])}</p></div>`).join('');
    const ia = CF.ia.cfg();
    return `<main class="tela" data-tela="progresso">
      <header class="topo"><div class="papel r2 torto-d"><h1>Seu progresso</h1><p>Quanto mais você estuda, mais o Torrão cresce.</p></div></header>
      <div class="secao">
        <section class="papel r3" style="display:grid; gap:12px">
          <span class="fita e"></span>
          <span class="rotulo">Torrão ${esc(CF.FASES_PET[fase].nome)}</span>
          <div class="barra verde"><i style="width:${cresc.toFixed(0)}%"></i></div>
          <p style="margin:0; font-weight:700">${prox ? `Crescendo pra virar ${esc(prox.nome)}: ${cresc.toFixed(0)}%` : 'Ele chegou na fase final!'}</p>
          <div class="evolucao">${evol}</div>
          <p class="ia-status" style="margin:0">Todas as idades estão liberadas: toca numa pra ver ele assim no quarto.</p>
        </section>
        <div class="stats">
          <div class="stat papel r4"><img src="${IC('chama')}" alt=""><b>${CF.sequencia()}</b><span>dias seguidos</span></div>
          <div class="stat papel r5"><img src="${IC('check')}" alt=""><b>${feitos}/${CF.DIAS.length}</b><span>dias feitos</span></div>
          <div class="stat papel r6"><img src="${PLANTA('frutos')}" alt=""><b>${CF.dominadas()}</b><span>frases que você já sabe</span></div>
          <div class="stat papel r1"><img src="${PLANTA('muda')}" alt=""><b>${CF.plantas().length}</b><span>frases aprendidas</span></div>
        </div>
        <section class="papel r6" style="display:grid; gap:8px"><span class="fita d"></span>
          <h2 style="font-size:21px">Seu inglês agora</h2>
          <p style="margin:0; font-weight:700">${esc(agora[1])}</p>
          ${depois ? `<span class="rotulo" style="margin-top:4px">Próximo passo</span><p style="margin:0">${esc(depois[1])}</p>` : ''}
          <details class="como"><summary>Ver o caminho todo</summary><div class="catalogo">${caminho}</div></details>
        </section>
        <section class="papel creme2 r4 ajustes" id="ajustes">
          <h2 style="font-size:20px">Ajustes</h2>
          <div class="ia-ajuste"><b>Chave da IA</b>
            <p>Cola uma vez e pronto: a IA corrige, tira dúvidas e conversa com você. Fica salva só neste celular.</p>
            <input id="iaChave" type="password" autocomplete="off" placeholder="cola a chave aqui (sk-or-...)" value="${esc(ia.chave || '')}">
            <button class="botao verde c2" data-acao="iaSalvar">Salvar</button>
            <p class="ia-status">${ia.chave ? 'Chave salva.' : 'Sem chave: o app funciona, só sem a IA.'}</p>
          </div>
          ${vozAjusteHtml()}
          <button class="botao kraft c1" data-acao="som">${CF.estado.som ? 'Som e vibração: ligados' : 'Som e vibração: desligados'}</button>
          <button class="botao kraft c2" data-acao="backup">Copiar backup do progresso</button>
          ${ui.mostraRestaurar
            ? `<textarea id="txtBackup" placeholder="Cola o backup aqui"></textarea><button class="botao verde c3" data-acao="restaurar">Restaurar este backup</button>`
            : `<button class="botao kraft c3" data-acao="mostraRestaurar">Restaurar um backup</button>`}
          ${ui.confirmaZerar
            ? `<p style="margin:0;font-weight:700">Isso apaga tudo: frases, horta e laranjas. Não tem volta.</p><div class="linha-botoes"><button class="botao terra c4" data-acao="zerar">Apagar tudo</button><button class="botao c1" data-acao="naoZerar">Cancelar</button></div>`
            : `<button class="link" data-acao="confirmaZerar">Começar do zero</button>`}
          <button class="botao kraft c4" data-acao="introVer">Ver a apresentação de novo</button>
          ${CF.VERSAO ? `<div class="linha-botoes" style="align-items:center"><span class="ia-status">Versão ${CF.VERSAO}</span><button class="link" data-acao="conferirVersao">Conferir se tem versão nova</button></div>` : ''}
        </section>
      </div>
    </main>`;
  }

  function vozAjusteHtml() {
    const lista = CF.voz.vozes(), atual = CF.voz.atual(), vel = CF.voz.cfg().vel || 1;
    return `<div class="ia-ajuste"><b>Voz do Torrão</b>
      ${lista.length ? `<p>Escolhe o sotaque. Ele fala com essa voz na aula, na revisão e na conversa.</p>
        <select id="vozEscolha">${lista.map(v => `<option value="${esc(v.id)}" ${atual && v.id === atual.id ? 'selected' : ''}>${esc(v.nome)}</option>`).join('')}</select>
        <div class="linha-botoes"><button class="botao kraft c3" data-acao="vozOuvir">Ouvir</button><button class="botao kraft c1" data-acao="vozVel">${vel < 1 ? 'Velocidade: devagar' : 'Velocidade: normal'}</button></div>
        <p class="ia-status">Quer mais vozes? No celular: Configurações > Idioma > Saída de texto para fala > Google > Instalar dados de voz > Inglês.</p>`
        : `<p class="ia-status">As vozes ainda estão carregando. Sai e volta pra essa tela daqui a pouco.</p>`}
    </div>`;
  }

  // ---------- guarda-roupa ----------
  function guardaRoupa(pts, fase) {
    const r = CF.estado.roupa || {};
    const pecas = CF.ROUPAS.map(x => {
      const livre = CF.roupaLiberada(x.id), vestido = livre && r[x.lugar] === x.id;
      return `<button class="peca ${livre ? '' : 'trancada'} ${vestido ? 'vestida' : ''}" data-acao="vestir" data-id="${x.id}" ${livre ? '' : 'aria-disabled="true"'}
        aria-label="${esc(x.nome)}${livre ? (vestido ? ', vestido' : '') : ', libera com ' + x.pts + ' pontos'}">
        <img src="assets/roupa/${x.id}.png" alt=""><span>${esc(x.nome)}</span><small>${livre ? (vestido ? 'vestido' : 'tocar pra vestir') : x.pts + ' pontos'}</small></button>`;
    }).join('');
    const prox = CF.TUDO_LIBERADO ? null : CF.ROUPAS.find(x => pts < x.pts);
    // cores das peças vestidas
    const cores = ['cabeca', 'rosto'].filter(l => r[l] && CF.roupaLiberada(r[l])).map(l => {
      const id = r[l], atual = CF.corDaRoupa(id).id, nome = CF.ROUPAS.find(x => x.id === id).nome;
      return `<div class="linha-cores"><span>Cor: ${esc(nome)}</span><div class="cores">${CF.CORES_ROUPA.map(c =>
        `<button class="cor ${c.id === atual ? 'on' : ''}" data-acao="corRoupa" data-id="${id}" data-cor="${c.id}" aria-label="${esc(c.nome)}">
          <img src="assets/roupa/${id}.png" alt="" style="${c.filtro ? 'filter:' + c.filtro : ''}"></button>`).join('')}</div></div>`;
    }).join('');
    // skins (cor do Torrão)
    const skinAtual = CF.skinAtual().id;
    const skins = CF.SKINS.map(k => {
      const livre = CF.skinLiberada(k.id), on = k.id === skinAtual;
      const f = k.filtro === 'arcoiris' ? 'hue-rotate(200deg) saturate(1.8)' : k.filtro;
      return `<button class="peca skin ${livre ? '' : 'trancada'} ${on ? 'vestida' : ''}" data-acao="skin" data-id="${k.id}">
        <img src="${PET_IMG(fase, 'tranquilo')}" alt="" style="${livre && f ? 'filter:' + f : ''}"><span>${esc(k.nome)}</span>
        <small>${livre ? (on ? 'usando' : 'tocar pra usar') : k.pts + ' pontos'}</small></button>`;
    }).join('');
    const escolhida = Number.isInteger(CF.estado.idade) ? CF.estado.idade : null;
    const idades = CF.FASES_PET.map((f, k) => `<button class="peca idade ${escolhida === k ? 'vestida' : ''}" data-acao="idade" data-k="${k}">
        <img src="${PET_IMG(k, 'tranquilo')}" alt=""><span>${esc(f.nome)}</span><small>${escolhida === k ? 'usando' : 'tocar pra usar'}</small></button>`).join('')
      + `<button class="peca idade ${escolhida === null ? 'vestida' : ''}" data-acao="idade" data-k="">
        <img src="${PET_IMG(CF.fasePet(pts), 'tranquilo')}" alt=""><span>Crescendo</span><small>${escolhida === null ? 'usando' : 'cresce com o estudo'}</small></button>`;
    return `<section class="guarda" style="display:grid; gap:12px">
      <div class="provador">${CF.petHtml(fase, 'tranquilo', 170, 'data-solto="0"')}</div>
      <h3 style="font-size:19px">Idade</h3>
      <div class="pecas idades">${idades}</div>
      <h3 style="font-size:19px; margin-top:6px">Roupas</h3>
      <p style="margin:0; font-weight:700; text-align:center">${prox ? `Próxima peça: ${esc(prox.nome)}, com ${prox.pts} pontos (faltam ${prox.pts - pts}).` : 'Todas as peças e skins estão liberadas. Escolhe à vontade!'}</p>
      <div class="pecas">${pecas}</div>
      ${cores}
      <h3 style="font-size:19px; margin-top:6px">Skins</h3>
      <div class="pecas">${skins}</div>
    </section>`;
  }

  // ---------- folha da planta ----------
  function abrirPlanta(id) {
    plantaAberta = id;
    const c = CF.TODAS_CARTAS[id], st = CF.estado.cartas[id], sede = CF.precisaAgua(id);
    let quando;
    if (sede) quando = 'Pedindo revisão: revisa hoje pra não esquecer.';
    else {
      const [y, m, d] = st.due.split('-').map(Number);
      const dias = Math.round((new Date(y, m - 1, d) - new Date(new Date().toDateString())) / 864e5);
      quando = dias === 1 ? 'Próxima revisão: amanhã.' : `Próxima revisão: daqui a ${dias} dias.`;
    }
    $camada.innerHTML = `<div class="escuro" data-acao="fecharFora"><div class="folha papel" role="dialog" aria-label="Planta">
      <div class="folha-topo"><span class="rotulo">${ESTAGIO[st.e]} · Dia ${c.dia}</span>${FECHAR('fechar')}</div>
      <div style="display:grid; grid-template-columns:120px minmax(0,1fr); gap:12px; align-items:center">
        <img src="${PLANTA(CF.imgPlanta(id))}" alt="" style="width:120px; animation: boia 5s ease-in-out infinite">
        <div style="display:grid; gap:6px"><div class="resposta-linha"><span class="en">${esc(fraseEn(c))}</span>
          ${CF.temVoz() ? `<button class="ouvir" data-acao="falar" data-texto="${esc(fraseEn(c))}" aria-label="Ouvir"><img src="${IC('fone')}" alt=""></button>` : ''}</div>
          <span style="font-weight:600; color:var(--tinta-2)">${c.tipo === 'ouvir' ? 'Responde, por exemplo: ' + esc(c.en[0]) : esc(c.pt)}</span></div>
      </div>
      <p style="margin:0; font-weight:700">${quando}</p>
      ${sede ? `<button class="botao grande azul cheio c2" data-acao="regarUma" data-id="${id}"><img src="${IC('gota')}" alt="">Revisar agora</button>`
        : `<button class="botao kraft cheio c3" data-acao="treinarUma" data-id="${id}">Treinar essa (fora da revisão)</button>`}
    </div></div>`;
  }

  // ---------- revisão ----------
  function iniciarRevisao(ids, modo, aoFim) {
    if (!ids.length) { aviso('Nada pra revisar agora.'); return; }
    diaAberto = null; plantaAberta = null;
    rev = { fila: ids.slice(), pos: 0, total: ids.length, modo, aoFim, fase: 'pergunta', digitado: '', ok: 0, quase: 0, erro: 0, frutas: 0, cresceram: 0, repetidas: new Set() };
    renderRev();
  }

  function renderRev() {
    if (!rev) return;
    if (rev.fase === 'fim') { renderFim(); return; }
    const id = rev.fila[rev.pos], c = CF.TODAS_CARTAS[id];
    const prog = Math.min(rev.pos, rev.fila.length) / rev.fila.length * 100;
    const ouvir = c.tipo === 'ouvir', ia = CF.ia.pronta();
    const ouvirBtn = t => CF.temVoz() ? `<button class="ouvir" data-acao="falar" data-texto="${esc(t)}" aria-label="Ouvir"><img src="${IC('fone')}" alt=""></button>` : '';
    let corpo;
    if (rev.fase === 'pergunta') {
      corpo = `<div class="rev-planta"><img src="${PLANTA(CF.imgPlanta(id))}" alt=""></div>
        <div class="bilhete-rev papel r3"><span class="fita"></span>
          <div class="rev-dica">${ouvir ? 'OUVE A PERGUNTA E RESPONDE EM INGLÊS' : 'COMO SE DIZ ISSO EM INGLÊS?'}</div>
          ${ouvir ? `<div style="display:flex; justify-content:center"><button class="botao grande azul c1" data-acao="ouvirPergunta" data-texto="${esc(c.pt)}"><img src="${IC('fone')}" alt="">Ouvir de novo</button></div>` : `<div class="rev-pergunta">${esc(c.pt)}</div>`}
          <input id="revInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="${ia ? 'escreve em inglês que o Torrão corrige' : 'fala em voz alta ou escreve aqui'}" value="${esc(rev.digitado)}">
        </div>
        <button class="botao grande laranja cheio c2" data-acao="revelar">${ia ? 'Corrigir' : ouvir ? 'Ver a pergunta' : 'Ver resposta'}</button>`;
    } else if (rev.fase === 'corrigindo') {
      corpo = `<div class="bilhete-rev papel r3"><span class="fita"></span>
          <div class="rev-pergunta" style="font-size:18px">${esc(c.pt)}</div>
          <div class="voce">Você escreveu: ${esc(rev.digitado)}</div>
          <div class="corrigindo"><span class="bolinhas"><i></i><i></i><i></i></span>O Torrão está corrigindo...</div></div>`;
    } else {
      let veredito = '';
      if (rev.ia) {
        const t = { acertei: ['Acertou!', 'igual'], quase: ['Quase!', 'quase'], errei: ['Ainda não', 'diferente'] }[rev.ia.nota];
        veredito = `<div class="veredito ${t[1]}"><b>${t[0]}</b>${rev.ia.explicacao ? `<p>${esc(rev.ia.explicacao)}</p>` : ''}
          <div class="resposta-linha"><span>Jeito certo: <b>${esc(rev.ia.correta)}</b></span>${ouvirBtn(rev.ia.correta)}</div></div>`;
      } else if (rev.digitado && !ouvir) {
        const confere = CF.confere(rev.digitado, c.en);
        veredito = `<div class="voce ${confere ? 'igual' : 'diferente'}">${confere ? 'Você escreveu igualzinho!' : 'Você escreveu: ' + esc(rev.digitado)}</div>`;
      } else if (rev.digitado) veredito = `<div class="voce igual">Você respondeu: ${esc(rev.digitado)}</div>`;
      const resposta = `<div class="resposta">
          ${ouvir ? `<div class="rev-dica" style="text-align:left">A PERGUNTA ERA</div><div class="resposta-linha"><span class="en" style="font-size:18px">${esc(c.pt)}</span>${ouvirBtn(c.pt)}</div><div class="rev-dica" style="text-align:left">JEITOS DE RESPONDER</div>` : ''}
          ${c.en.map((o, k) => `<div class="resposta-linha"><span class="en" ${k || ouvir ? 'style="font-size:17px"' : ''}>${esc(o)}</span>${k || ouvir ? '' : ouvirBtn(o)}</div>`).join('')}
          ${c.dica ? `<div class="tambem">${esc(c.dica)}</div>` : ''}
        </div>`;
      const manual = `<div style="display:flex; justify-content:center"><span class="bilhete">${ouvir ? 'Você conseguiu responder?' : 'E aí, você lembrou?'}</span></div>
        <div class="notas">
          <button class="botao terra c1" data-acao="nota" data-v="errei">${ouvir ? 'Não' : 'Errei'}</button>
          <button class="botao kraft c2" data-acao="nota" data-v="quase">${ouvir ? 'Mais ou menos' : 'Quase'}</button>
          <button class="botao verde c3" data-acao="nota" data-v="acertei">${ouvir ? 'Sim' : 'Acertei'}</button>
        </div>`;
      const auto = rev.ia ? `<button class="botao grande laranja cheio c2" data-acao="nota" data-v="${rev.ia.nota}">Continuar</button>
        <button class="link" data-acao="discordo">Não concordo com a correção</button>` : '';
      corpo = `${ouvir ? '' : `<div class="bilhete-rev papel r3" style="padding-bottom:16px"><span class="fita"></span><div class="rev-pergunta" style="font-size:18px">${esc(c.pt)}</div></div>`}
        ${veredito}${rev.iaErro ? `<div class="tambem">A IA não respondeu agora (${esc(rev.iaErro)}). Avalia você mesmo dessa vez.</div>` : ''}
        ${rev.ia ? (c.en.length > 1 || c.dica ? `<div class="resposta">${c.en.length > 1 ? `<div class="tambem">Também vale: ${c.en.filter(o => o !== rev.ia.correta).map(o => '<b>' + esc(o) + '</b>').join(' · ')}</div>` : ''}${c.dica ? `<div class="tambem">${esc(c.dica)}</div>` : ''}</div>` : '') : resposta}
        ${rev.ia ? auto : manual}`;
    }
    $camada.innerHTML = `<div class="revisao" role="dialog" aria-label="Revisão"><div class="ceu"></div><div class="rev">
      <div class="rev-topo">${FECHAR('fecharRev')}
        <div class="barra verde"><i style="width:${prog.toFixed(0)}%"></i></div>
        <span class="rev-cont">${Math.min(rev.pos + 1, rev.fila.length)}/${rev.fila.length}</span></div>
      ${corpo}
    </div></div>`;
    if (rev.fase === 'pergunta' && ouvir && rev.falouPos !== rev.pos) {
      rev.falouPos = rev.pos;
      setTimeout(() => CF.falar(CF.TODAS_CARTAS[rev.fila[rev.pos]].pt), 350);
    }
    const inp = document.getElementById('revInput');
    if (inp) {
      inp.addEventListener('input', () => { rev.digitado = inp.value; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); revelar(); } });
    }
  }

  function revelar() {
    if (!rev || rev.fase !== 'pergunta') return;
    const inp = document.getElementById('revInput');
    if (inp) rev.digitado = inp.value.trim();
    const c = CF.TODAS_CARTAS[rev.fila[rev.pos]];
    CF.som.toque();
    // escreveu igualzinho: nem precisa da IA
    if (rev.digitado && c.tipo !== 'ouvir' && CF.confere(rev.digitado, c.en)) {
      rev.ia = { nota: 'acertei', explicacao: 'Igualzinho à resposta.', correta: c.en.find(o => CF.confere(rev.digitado, [o])) || c.en[0] };
      rev.fase = 'resposta'; renderRev(); setTimeout(() => CF.falar(rev.ia.correta), 150);
      return;
    }
    // escreveu e tem IA: o Torrão corrige (você não precisa se avaliar)
    if (rev.digitado && CF.ia.pronta()) {
      rev.fase = 'corrigindo'; renderRev();
      const pos = rev.pos, alvo = rev;
      CF.ia.corrigir(c, rev.digitado)
        .then(r => { if (rev !== alvo || rev.pos !== pos || rev.fase !== 'corrigindo') return; rev.ia = r; rev.fase = 'resposta'; renderRev(); setTimeout(() => CF.falar(r.correta), 150); })
        .catch(e => { if (rev !== alvo || rev.pos !== pos || rev.fase !== 'corrigindo') return; rev.iaErro = e.message; rev.fase = 'resposta'; renderRev(); });
      return;
    }
    rev.fase = 'resposta';
    renderRev();
    if (c.tipo !== 'ouvir') setTimeout(() => CF.falar(c.en[0]), 150);
  }

  function nota(v) {
    if (!rev || rev.fase !== 'resposta' || !v) return;
    rev.ia = null; rev.iaErro = null;
    const id = rev.fila[rev.pos];
    if (rev.modo !== 'treino') {
      const r = CF.responder(id, v);
      rev.frutas += r.frutas;
      if (r.cresceu) rev.cresceram++;
    }
    if (v === 'acertei') { rev.ok++; CF.som.acerto(); CF.vibra(25); }
    else if (v === 'quase') { rev.quase++; CF.som.quase(); }
    else {
      rev.erro++; CF.som.erro(); CF.vibra([20, 40, 20]);
      if (!rev.repetidas.has(id)) { rev.repetidas.add(id); rev.fila.push(id); }
    }
    rev.pos++;
    rev.digitado = '';
    rev.fase = rev.pos >= rev.fila.length ? 'fim' : 'pergunta';
    if (rev.fase === 'fim' && rev.aoFim) { rev.aoFim(); rev.aoFim = null; }
    renderRev();
  }

  function renderFim() {
    const fase = CF.faseMostrada();
    const titulo = rev.modo === 'teste' ? 'Prática feita!' : rev.modo === 'treino' ? 'Treino feito!' : 'Revisão feita!';
    const ganhos = [`<span class="bilhete"><img src="${IC('check')}" alt="">${plural(rev.ok, 'acerto', 'acertos')}</span>`];
    if (rev.modo !== 'treino') {
      ganhos.push(`<span class="bilhete"><img src="${PLANTA('fruta')}" alt="">+${rev.frutas}</span>`);
      ganhos.push(`<span class="bilhete"><img src="${PLANTA('broto')}" alt="">${plural(rev.cresceram, 'cresceu', 'cresceram')}</span>`);
    }
    const frase = rev.erro ? 'As que você errou voltam logo pra você treinar de novo.' : 'Mandou bem. Elas só voltam quando estiverem perto de você esquecer.';
    $camada.innerHTML = `<div class="revisao" role="dialog" aria-label="${titulo}"><div class="ceu"></div><div class="rev"><div class="rev-fim">
      ${CF.petHtml(fase, 'tranquilo', 210, 'data-solto="0"')}
      <div class="papel r4 torto-e" style="display:grid; gap:12px; justify-items:center"><span class="fita"></span>
        <h2>${titulo}</h2>
        <div class="ganhos">${ganhos.join('')}</div>
        <p style="margin:0; font-weight:600; max-width:32ch">${frase}</p>
      </div>
      <button class="botao grande verde c3" data-acao="fecharRev">Voltar</button>
    </div></div></div>`;
    CF.montarPets($camada);
    const el = $camada.querySelector('[data-pet]');
    CF.som.festa();
    if (el) setTimeout(() => (rev && rev.frutas ? el._pet.comer() : el._pet.pular()), 250);
    if (rev.ok) CF.confete($camada.querySelector('.revisao'), 24);
  }

  function fecharCamada() {
    const voltarDia = rev && rev.modo === 'teste' && rev.dia ? rev.dia : null;
    rev = null; plantaAberta = null; diaAberto = null; ui.folha = null; apr = null; chat = null;
    if (tn) { CF.voz.pararGravacao(true); if (tn.fala) clearInterval(tn.fala.relogio); tn = null; }
    $camada.innerHTML = '';
    render();
    checarEvolucao();
    if (voltarDia && !$camada.innerHTML && !CF.diaCompleto(voltarDia)) abrirDia(voltarDia);
  }

  // ---------- aula de hoje: aprender as frases dentro do app (com áudio) ----------
  function abrirAprender(n) {
    const d = CF.dia(n);
    if (!d.cartas || !d.cartas.length) { abrirDia(n); return; }
    apr = { n, pos: -1, ids: d.cartas.map(c => c[0]) };
    ui.ultimoDia = n;
    renderAprender();
  }

  function renderAprender() {
    if (!apr) return;
    const d = CF.dia(apr.n), total = apr.ids.length;
    const ouvirBtn = t => CF.temVoz() ? `<button class="ouvir" data-acao="falar" data-texto="${esc(t)}" aria-label="Ouvir"><img src="${IC('fone')}" alt=""></button>` : '';
    let corpo;
    if (apr.pos < 0) {
      corpo = `<div class="bilhete-rev papel r3"><span class="fita"></span>
          <div class="rev-dica">DIA ${apr.n} · AULA DE HOJE</div>
          <div class="rev-pergunta">${esc(d.tema)}</div>
          ${d.blocos ? `<p class="apr-txt">Os pedaços que você vai usar muito:</p><div class="blocos">${d.blocos.map(b => `<span class="tira">${esc(b)}</span>`).join('')}</div>` : ''}
          <p class="apr-txt">São ${total} frases. Ouve cada uma e repete em voz alta.</p>
          ${d.video && d.video.link ? `<div style="display:flex; justify-content:center"><button class="link" data-acao="link" data-url="${esc(d.video.link)}">Ver um vídeo sobre o tema (opcional)</button></div>` : ''}
        </div>
        <button class="botao grande laranja cheio c2" data-acao="aprProx">Começar</button>`;
    } else if (apr.pos >= total) {
      corpo = `<div class="rev-fim">${CF.petHtml(CF.faseMostrada(), 'tranquilo', 180, 'data-solto="0"')}
        <div class="papel r4 torto-e" style="display:grid; gap:10px; justify-items:center"><span class="fita"></span>
          <h2>Aprendeu as ${total} frases!</h2>
          <p style="margin:0; font-weight:600; text-align:center; max-width:30ch">Elas viraram sementes na sua horta. Agora pratica escrevendo pra elas brotarem.</p></div>
        <button class="botao grande laranja c2" data-acao="aprPraticar">Praticar agora</button>
        <button class="link" data-acao="fecharApr">Depois</button></div>`;
    } else {
      const c = CF.TODAS_CARTAS[apr.ids[apr.pos]];
      corpo = `<div class="bilhete-rev papel r3 apr-carta"><span class="fita"></span>
          <div class="rev-dica">FRASE ${apr.pos + 1} DE ${total}</div>
          <div class="resposta-linha" style="justify-content:center"><span class="en apr-en">${esc(fraseEn(c))}</span>${ouvirBtn(fraseEn(c))}</div>
          ${c.tipo === 'ouvir'
            ? `<div class="apr-pt">Alguém te pergunta isso. Jeitos de responder:</div><div class="tambem">${c.en.map(o => '<b>' + esc(o) + '</b>').join(' · ')}</div>`
            : `<div class="apr-pt">${esc(c.pt)}</div>${c.en.length > 1 ? `<div class="tambem">Também dá pra dizer: ${c.en.slice(1).map(o => '<b>' + esc(o) + '</b>').join(' · ')}</div>` : ''}`}
          ${c.dica ? `<div class="tambem">${esc(c.dica)}</div>` : ''}
          <div style="display:flex; justify-content:center"><button class="link" data-acao="perguntarFrase" data-texto="${esc(fraseEn(c))}">Tenho uma dúvida sobre essa frase</button></div>
        </div>
        <div class="linha-botoes apr-nav">
          <button class="botao kraft c1" data-acao="aprVolta">Voltar</button>
          <button class="botao grande laranja c2" data-acao="aprProx">${apr.pos + 1 < total ? 'Próxima' : 'Terminei'}</button></div>`;
    }
    const feitas = Math.max(0, Math.min(apr.pos + 1, total));
    $camada.innerHTML = `<div class="revisao estudo" role="dialog" aria-label="Aula de hoje"><div class="ceu"></div><div class="rev">
      <div class="rev-topo">${FECHAR('fecharApr')}<div class="barra verde"><i style="width:${(feitas / total * 100).toFixed(0)}%"></i></div><span class="rev-cont">${feitas}/${total}</span></div>
      ${corpo}</div></div>`;
    CF.montarPets($camada);
    if (apr.pos >= 0 && apr.pos < total) { const c = CF.TODAS_CARTAS[apr.ids[apr.pos]]; setTimeout(() => CF.falar(fraseEn(c)), 250); }
  }

  function terminarAprender() {
    const n = apr.n, r = CF.registro(n);
    CF.plantarDia(n);
    if (!r.aprender) {
      r.aprender = true; CF.marcarAtividade();
      const q = CF.ganharPasso(n, 'aprender');
      if (q) aviso(`+${q} laranjas`);
    }
    CF.salvar();
  }

  // ---------- falar: conversa escrita com o Torrão, ou marcar o que fez ----------
  function abrirFalar(n) {
    const d = CF.dia(n), r = CF.registro(n), p = CF.passos(d).find(x => x.id === 'usar');
    const nomes = { 10: 'Falei sozinho em voz alta', 20: 'Conversei com uma IA', 30: 'Conversei com uma pessoa' };
    $camada.innerHTML = `<div class="escuro" data-acao="fecharFora"><div class="folha papel" role="dialog" aria-label="Falar">
      <div class="folha-topo"><div style="display:grid; gap:4px"><span class="rotulo">Dia ${n} · Falar</span><h2>Bora falar inglês</h2></div>${FECHAR('fechar')}</div>
      ${CF.voz.podeOuvir()
        ? `<p style="margin:0; font-weight:600">Conversa com o Torrão em inglês, falando de verdade. Ele te ouve, responde com voz e corrige seus erros com jeitinho.</p>
      <button class="botao grande laranja cheio c2" data-acao="abrirConversa" data-n="${n}" data-voz="1"><img src="${IC('mic')}" alt="">Conversar falando</button>
      <button class="botao kraft cheio c3" data-acao="abrirConversa" data-n="${n}"><img src="${IC('fala')}" alt="">Conversar escrevendo</button>`
        : `<p style="margin:0; font-weight:600">O jeito mais fácil: conversa escrevendo com o Torrão. Ele corrige seus erros com jeitinho.</p>
      <button class="botao grande laranja cheio c2" data-acao="abrirConversa" data-n="${n}"><img src="${IC('fala')}" alt="">Conversar com o Torrão</button>`}
      <span class="rotulo" style="margin-top:6px">Ou marca o que você fez</span>
      <div class="opcoes-falar">${(p ? p.opcoes : [10, 20, 30]).map((v, i) => `<button class="botao ${r.usar === v ? 'on' : 'kraft'} c${i + 1}" data-acao="usarFalar" data-n="${n}" data-v="${v}">${nomes[v]}<small>+${CF.laranjasPasso('usar', v)}</small></button>`).join('')}</div>
      <details class="como"><summary>Conversar por voz com uma IA</summary><p>No Gemini Live ou no modo de voz do Claude, começa com:</p>${blocoCopiar(CF.promptIA(d.ia, CF.semanaDe(n)), 'Copiar')}</details>
    </div></div>`;
  }

  // ---------- conversa com o Torrão (IA): treinar inglês ou tirar dúvida ----------
  function abrirChat(modo, n, pergunta, voz) {
    const dia = n || CF.diaAtual();
    const ola = modo === 'conversa'
      ? "Hi! I'm Torrão. Let's chat in English! How are you today?"
      : 'Oi! Pode me perguntar qualquer coisa sobre inglês: uma palavra, uma frase, a diferença entre duas coisas...';
    chat = { modo, n: dia, msgs: [{ role: 'assistant', content: ola }], esperando: false, rascunho: '', voltar: apr ? 'aprender' : diaAberto ? 'dia' : null,
      voz: !!voz && modo === 'conversa' && CF.voz.podeOuvir(), estado: 'parado', parcial: '', aviso: '' };
    renderChat();
    if (chat.voz && CF.ia.pronta()) falarTorrao(ola);
    if (pergunta && CF.ia.pronta()) enviarChat(pergunta);
  }

  function renderChat() {
    if (!chat) return;
    const ia = CF.ia.pronta(), conversa = chat.modo === 'conversa';
    const minhas = Math.max(0, chat.msgs.filter(m => m.role === 'assistant').length - 1);   // trocas respondidas (a 1ª fala é o "oi")
    const bolhas = chat.msgs.map(m => {
      if (m.role === 'erro') return `<div class="msg erro">${esc(m.content)}</div>`;
      const meu = m.role === 'user';
      let html = esc(m.content).replace(/\n/g, '<br>');
      if (!meu) html = html.replace(/(^|<br>)((?:Dica|Pronúncia):.*?)(?=<br>|$)/g, '$1<span class="msg-dica">$2</span>').replace(/<\/span><br>/g, '</span>');
      const falar = !meu && conversa ? `data-acao="falar" data-texto="${esc(semDica(m.content))}"` : '';
      return `<div class="msg ${meu ? 'eu' : 'ele'}" ${falar}>${html}</div>`;
    }).join('');
    const dica = conversa ? `<div class="chat-tema">Tema de hoje: ${esc(CF.dia(chat.n).tema)}. ${chat.voz ? 'Fala em inglês; se travar, fala em português que ele te ajuda.' : 'Escreve em inglês; se travar, escreve em português que ele te ajuda.'} ${minhas < 4 ? `Troca ${4 - minhas} ${4 - minhas === 1 ? 'mensagem' : 'mensagens'} pra completar a meta.` : 'Meta feita! Pode continuar ou tocar em Terminei.'}</div>` : '';
    $camada.innerHTML = `<div class="chat" role="dialog" aria-label="Conversa com o Torrão">
      <div class="chat-topo">${FECHAR('fecharChat')}<div class="chat-titulo"><b>${conversa ? 'Conversar em inglês' : 'Perguntar ao Torrão'}</b><small>${chat.voz ? 'Fala em inglês, ele responde com voz' : conversa ? 'Toca na fala dele pra ouvir' : 'Dúvidas sobre inglês'}</small></div>
        ${conversa && minhas >= 4 ? `<button class="botao mini verde c3" data-acao="chatFim">Terminei</button>` : ''}</div>
      ${ia ? `${dica}<div class="chat-msgs">${bolhas}${chat.esperando ? '<div class="msg ele"><span class="bolinhas"><i></i><i></i><i></i></span></div>' : ''}</div>
      ${chat.voz
        ? `<div class="chat-voz"><div class="voz-status" aria-live="polite"></div>
            <button class="mic ${chat.estado}" data-acao="micToque" aria-label="Microfone"><img src="${IC('mic')}" alt=""></button>
            <button class="link" data-acao="chatModo">Prefiro escrever</button></div>`
        : `<div class="chat-escrever">${conversa && CF.voz.podeOuvir() ? `<button class="mic-mini" data-acao="chatModo" aria-label="Conversar falando"><img src="${IC('mic')}" alt=""></button>` : ''}<input id="chatInput" type="text" autocomplete="off" enterkeyhint="send" placeholder="${conversa ? 'Escreve em inglês...' : 'Escreve sua dúvida...'}" value="${esc(chat.rascunho)}"><button class="botao laranja c2" data-acao="chatEnviar" ${chat.esperando ? 'disabled' : ''}>Enviar</button></div>`}`
      : `<div class="papel r3 chat-sem"><span class="fita"></span><h2>Falta a chave da IA</h2><p>Pra conversar com o Torrão, cola a chave da IA nos Ajustes (aba Progresso). Só precisa fazer uma vez.</p><button class="botao laranja c2" data-acao="irAjustes">Ir pros Ajustes</button></div>`}
    </div>`;
    const lista = $camada.querySelector('.chat-msgs');
    if (lista) lista.scrollTop = lista.scrollHeight;
    atualizaVoz();
    const inp = document.getElementById('chatInput');
    if (inp) {
      inp.addEventListener('input', () => { if (chat) chat.rascunho = inp.value; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enviarChat(); } });
    }
  }

  const semDica = s => String(s).replace(/^\s*(Dica|Pronúncia):.*$/gim, '').trim();

  // ---------- conversa falada: o Torrão fala, depois escuta; você fala, ele responde ----------
  const TXT_VOZ = {
    parado: 'Toca no microfone e fala em inglês',
    ouvindo: 'Pode falar...',
    pensando: 'O Torrão está pensando...',
    falando: 'O Torrão está falando (toca pra interromper)'
  };
  function atualizaVoz() {
    if (!chat || !chat.voz) return;
    const st = $camada.querySelector('.voz-status'), mic = $camada.querySelector('.mic');
    if (st) st.textContent = chat.estado === 'ouvindo' && chat.parcial ? chat.parcial : (chat.estado === 'parado' && chat.aviso) || TXT_VOZ[chat.estado];
    if (mic) mic.className = 'mic ' + chat.estado;
  }
  function falarTorrao(texto) {
    if (!chat || !chat.voz) return;
    const alvo = chat;
    chat.estado = 'falando'; chat.aviso = ''; atualizaVoz();
    CF.voz.falar(semDica(texto), () => { if (chat === alvo && chat.voz && chat.estado === 'falando') ouvirFala(); });
  }
  function ouvirFala() {
    if (!chat || !chat.voz) return;
    if (CF.voz.podeGravar() && CF.ia.pronta() && !chat.semAudio) { gravarFala(); return; }
    const alvo = chat;
    chat.estado = 'ouvindo'; chat.parcial = ''; chat.aviso = ''; atualizaVoz();
    CF.voz.ouvir(ev => {
      if (chat !== alvo || !chat.voz) return;
      if (ev.tipo === 'parcial' || ev.tipo === 'final') { chat.parcial = ev.texto || ''; atualizaVoz(); }
      else if (ev.tipo === 'nivel') { const m = $camada.querySelector('.mic'); if (m) m.style.setProperty('--nivel', Math.max(0, Math.min(1, (ev.nivel + 2) / 12)).toFixed(2)); }
      else if (ev.tipo === 'erro') {
        if (chat.estado !== 'ouvindo') return;
        chat.estado = 'parado';
        chat.aviso = ev.erro === 'silencio' ? 'Não ouvi nada. Toca no microfone e fala de novo.'
          : ev.erro === 'permissao' ? 'O app precisa do microfone. Toca de novo e permite.'
            : ev.erro === 'rede' ? 'Sem internet pra entender a fala agora.'
              : ev.erro === 'sem' ? 'Esse celular não tem reconhecimento de fala. Usa o modo escrever.' : 'Não deu pra ouvir. Toca no microfone de novo.';
        atualizaVoz();
      } else if (ev.tipo === 'fim') {
        if (chat.estado !== 'ouvindo') return;
        const t = String(ev.texto || chat.parcial || '').trim();
        chat.parcial = '';
        if (t) { chat.estado = 'pensando'; enviarChat(t); }
        else { chat.estado = 'parado'; chat.aviso = 'Não ouvi nada. Toca no microfone e fala de novo.'; atualizaVoz(); }
      }
    });
  }
  // grava a sua voz e manda o ÁUDIO pra IA: ela escreve exatamente o que você falou (com os erros) e corrige gramática e pronúncia
  function gravarFala() {
    const alvo = chat;
    chat.estado = 'ouvindo'; chat.parcial = ''; chat.aviso = ''; chat.gravando = true; atualizaVoz();
    CF.voz.gravar(ev => {
      if (chat !== alvo || !chat.voz) return;
      if (ev.tipo === 'nivel') { const m = $camada.querySelector('.mic'); if (m) m.style.setProperty('--nivel', ev.nivel.toFixed(2)); }
      else if (ev.tipo === 'falando') { chat.parcial = 'Ouvindo você...'; atualizaVoz(); }
      else if (ev.tipo === 'erro') {
        chat.gravando = false;
        if (ev.erro === 'sem') { chat.semAudio = true; ouvirFala(); return; }
        chat.estado = 'parado';
        chat.aviso = ev.erro === 'silencio' ? 'Não ouvi nada. Toca no microfone e fala de novo.' : 'O app precisa do microfone. Toca de novo e permite.';
        atualizaVoz();
      } else if (ev.tipo === 'audio') { chat.gravando = false; chat.estado = 'pensando'; enviarAudio(ev.base64); }
    }, { max: 30 });
  }

  async function enviarAudio(b64) {
    if (!chat || chat.esperando) return;
    const alvo = chat, eu = { role: 'user', content: '(áudio)' };
    chat.msgs.push(eu); chat.esperando = true; renderChat();
    try {
      const hist = chat.msgs.filter(m => m.role !== 'erro' && m !== eu);
      const r = await CF.ia.conversarAudio(hist, b64, CF.dia(chat.n));
      if (chat !== alvo) return;
      eu.content = r.ouvi || '(áudio)';
      const fala = (r.pronuncia ? `Pronúncia: ${r.pronuncia}\n` : '') + (r.dica ? `Dica: ${r.dica}\n` : '') + r.resposta;
      chat.msgs.push({ role: 'assistant', content: fala });
      chat.esperando = false;
      renderChat();
      falarTorrao(fala);
    } catch (e) {
      if (chat !== alvo) return;
      chat.msgs.splice(chat.msgs.indexOf(eu), 1);
      chat.esperando = false;
      // a IA que ouve áudio falhou (lotada/fora do ar): segue com o reconhecimento de fala do celular
      if (!/chave/i.test(e.message) && CF.voz.podeOuvir()) {
        chat.semAudio = true;
        chat.msgs.push({ role: 'erro', content: 'A IA que ouve áudio não respondeu agora. Vou usar o reconhecimento de fala do celular.' });
      } else chat.msgs.push({ role: 'erro', content: e.message });
      chat.estado = 'parado'; chat.aviso = 'Toca no microfone pra falar de novo.';
      renderChat();
    }
  }

  function tocarMic() {
    if (!chat || !chat.voz) return;
    if (chat.estado === 'ouvindo' && chat.gravando) { CF.voz.pararGravacao(); return; }
    if (chat.estado === 'ouvindo') { CF.voz.pararOuvir(); return; }
    if (chat.estado === 'pensando') return;
    CF.voz.calar(); ouvirFala();
  }

  async function enviarChat(texto) {
    if (!chat || chat.esperando) return;
    const t = String(texto != null ? texto : chat.rascunho).trim();
    if (!t) return;
    chat.msgs.push({ role: 'user', content: t }); chat.rascunho = ''; chat.esperando = true; renderChat();
    const alvo = chat;
    try {
      const hist = chat.msgs.filter(m => m.role !== 'erro').slice(-12).map(m => ({ role: m.role, content: m.content }));
      const r = await CF.ia.pedir([{ role: 'system', content: CF.ia.sistema(chat.modo, CF.dia(chat.n), chat.voz) }].concat(hist), { temp: 0.6, max: 400 });
      if (chat !== alvo) return;
      chat.msgs.push({ role: 'assistant', content: r });
      chat.esperando = false;
      renderChat();
      if (chat.voz) falarTorrao(r);
      else if (chat.modo === 'conversa') CF.falar(semDica(r));
      return;
    } catch (e) {
      if (chat !== alvo) return;
      chat.msgs.push({ role: 'erro', content: e.message });
      if (chat.voz) { chat.estado = 'parado'; chat.aviso = 'Toca no microfone pra tentar de novo.'; }
    }
    chat.esperando = false;
    renderChat();
  }

  function fecharChat() {
    const v = chat && chat.voltar;
    CF.voz.largar(); CF.voz.calar();
    chat = null;
    if (v === 'aprender' && apr) renderAprender();
    else if (v === 'dia' && diaAberto) abrirDia(diaAberto);
    else fecharCamada();
  }

  // ---------- surpresa: o Torrão volta do passeio com uma frase nova ----------
  function mostrarSurpresa() {
    const c = CF.abrirSurpresa();
    CF.som.festa();
    $camada.innerHTML = `<div class="escuro" data-acao="fecharFora"><div class="folha papel cartao-passeio" role="dialog" aria-label="O Torrão voltou">
      <div class="folha-topo"><div style="display:grid; gap:4px"><span class="rotulo">Surpresa</span><h2>O Torrão voltou do passeio!</h2></div>${FECHAR('fechar')}</div>
      <p style="margin:0; font-weight:600">Ele foi ${esc(c.lugar)} e aprendeu uma frase pra te ensinar:</p>
      <div class="cartao-frase"><div class="resposta-linha" style="justify-content:center"><span class="en">${esc(c.en)}</span>${CF.temVoz() ? `<button class="ouvir" data-acao="falar" data-texto="${esc(c.en)}" aria-label="Ouvir"><img src="${IC('fone')}" alt=""></button>` : ''}</div><p>${esc(c.pt)}</p></div>
      <div style="display:flex; justify-content:center"><span class="bilhete"><img src="${PLANTA('fruta')}" alt="">+3 laranjas de presente</span></div>
      <button class="botao grande laranja cheio c2" data-acao="fechar">Valeu, Torrão!</button>
    </div></div>`;
    setTimeout(() => CF.falar(c.en), 400);
  }

  // ---------- versão nova no GitHub ----------
  // O APK confere (no máximo a cada 6 horas) a última Release do repositório; se for mais nova que CF.VERSAO, avisa no quarto.
  const REPO = 'Kaylan00/torrao';
  function checarAtualizacao(forcar) {
    if (!CF.VERSAO) return;
    let c = {};
    try { c = JSON.parse(localStorage.getItem('torrao-atualizacao')) || {}; } catch (e) { c = {}; }
    if (c.versao > CF.VERSAO) ui.novaVersao = c;
    if (!forcar && c.quando && Date.now() - c.quando < 6 * 36e5) return;
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (!j || !j.tag_name) return;
        const v = parseInt(String(j.tag_name).replace(/\D/g, ''), 10) || 0;
        const apk = (j.assets || []).find(a => /\.apk$/i.test(a.name));
        const info = { quando: Date.now(), versao: v, link: apk ? apk.browser_download_url : j.html_url, notas: String(j.body || '').slice(0, 600) };
        try { localStorage.setItem('torrao-atualizacao', JSON.stringify(info)); } catch (e) { /* segue */ }
        const antes = !!ui.novaVersao;
        ui.novaVersao = v > CF.VERSAO ? info : null;
        if (!!ui.novaVersao !== antes && !$camada.innerHTML) render();
        if (forcar) aviso(ui.novaVersao ? `Tem a versão ${v}!` : 'Você já está na versão mais nova.');
      })
      .catch(() => { if (forcar) aviso('Sem internet pra conferir agora.'); });
  }

  function abrirAtualizacao() {
    const n = ui.novaVersao;
    if (!n) return;
    $camada.innerHTML = `<div class="escuro" data-acao="fecharFora"><div class="folha papel" role="dialog" aria-label="Versão nova">
      <div class="folha-topo"><div style="display:grid; gap:4px"><span class="rotulo">Versão ${n.versao}</span><h2>Tem Torrão novo!</h2></div>${FECHAR('fechar')}</div>
      <p style="margin:0; font-weight:600">Baixa o APK novo e instala por cima. Seu progresso, suas roupas e seu quarto continuam.</p>
      ${n.notas ? `<div class="tambem" style="white-space:pre-line">${esc(n.notas)}</div>` : ''}
      <button class="botao grande laranja cheio c2" data-acao="link" data-url="${esc(n.link)}">Baixar a versão ${n.versao}</button>
      <button class="link" data-acao="fechar">Depois</button>
    </div></div>`;
  }

  // ---------- ações ----------
  function alimentar(botao) {
    if (!CF.estado.frutas) { aviso('Sem laranja ainda. Cumpre uma meta de hoje que você ganha.'); return; }
    if (!CF.alimentar()) return;
    const alvo = $conteudo.querySelector('.casa-quarto .pet');
    if (botao && alvo) voar(botao, alvo);
    CF.som.come(); CF.vibra(30);
    CF.marcarAtividade(); CF.salvar();
    ui.fala = { pt: ['Hmm, essa tava boa.', 'Agora sim.', 'Valeu. Continua revisando que vem mais.'][Math.floor(Math.random() * 3)] };
    render();
    setTimeout(() => { const p = petAtual(); if (p) { p.humor = 'tranquilo'; p.comer(); } }, 450);
    clearTimeout(alimentar.t);
    alimentar.t = setTimeout(() => { ui.fala = null; if (ui.tela === 'casa' && !$camada.innerHTML) render(); }, 3600);
  }

  function voar(de, para) {
    const a = de.getBoundingClientRect(), b = para.getBoundingClientRect();
    const el = document.createElement('img');
    el.src = PLANTA('fruta'); el.className = 'voa'; el.alt = '';
    el.style.left = (a.left + a.width / 2 - 22) + 'px'; el.style.top = (a.top + a.height / 2 - 22) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height * 0.4 - a.top - a.height / 2}px) scale(.55) rotate(200deg)`;
      el.style.opacity = '0.3';
    });
    setTimeout(() => el.remove(), 700);
  }

  function marcarPasso(n, id) {
    const r = CF.registro(n);
    r[id] = !r[id];
    ui.ultimoDia = n;
    if (r[id]) {
      CF.marcarAtividade(); CF.som.marca(); CF.vibra(15);
      if (id === 'aprender') CF.plantarDia(n);
      const q = CF.ganharPasso(n, id);
      if (q) aviso(`+${q} ${q === 1 ? 'laranja' : 'laranjas'}`);
    }
    CF.salvar();
    render(); abrirDia(n);
    checarEvolucao();
  }

  function fazerTeste(n) {
    const d = CF.dia(n);
    let ids;
    if (d.tipo === 'desafio') {
      const dias = CF.DIAS.filter(x => CF.semanaDe(x.n) === d.semanaTeste && x.cartas);
      dias.forEach(x => CF.plantarDia(x.n));
      ids = dias.flatMap(x => x.cartas.map(c => c[0]));
    } else {
      // praticar antes de aprender não faz sentido: primeiro a aula
      if (d.cartas && d.cartas.length && !CF.registro(n).aprender) { aviso('Primeiro aprende as frases, depois pratica.'); abrirAprender(n); return; }
      CF.plantarDia(n);
      ids = d.cartas.map(c => c[0]);
    }
    CF.salvar();
    ui.ultimoDia = n;
    const daFolha = diaAberto === n;
    const jaFez = CF.registro(n).testar;
    iniciarRevisao(ids, jaFez ? 'treino' : 'teste', () => { CF.registro(n).testar = true; CF.marcarAtividade(); CF.salvar(); });
    if (jaFez) aviso('Treino extra: não muda a revisão das frases.');
    rev.dia = daFolha ? n : null;
  }

  document.addEventListener('change', e => {
    if (e.target && e.target.id === 'vozEscolha') { CF.voz.salvar({ id: e.target.value }); CF.voz.falar("Hi! I'm going to talk like this now."); }
  });

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    const a = b.dataset.acao;
    if (a === 'fecharFora' && e.target !== b) return;   // clique dentro da folha não fecha
    switch (a) {
      case 'tela':
        ui.tela = b.dataset.tela; ui.confirmaZerar = false; ui.mostraRestaurar = false; ui.fala = null; ui.mes = null;
        CF.som.toque(); render(); { const t = $conteudo.querySelector('.tela'); if (t && ui.tela !== 'hoje') t.scrollTop = 0; } break;
      case 'abrirDia': CF.som.toque(); abrirDia(Number(b.dataset.n)); break;
      case 'meta': {
        const n = CF.diaAtual(), id = b.dataset.id;
        CF.som.toque(); ui.ultimoDia = n;
        if (id === 'aprender') abrirAprender(n);
        else if (id === 'testar') fazerTeste(n);
        else if (id === 'usar') abrirFalar(n);
        else if (id === 'regar') {
          const s = CF.paraRegar(), fim = () => { CF.registro(n).regar = true; CF.ganharPasso(n, 'regar'); CF.marcarAtividade(); CF.salvar(); };
          if (s.length) iniciarRevisao(s, 'regar', fim); else { fim(); render(); checarEvolucao(); }
        } else abrirDia(n);
        break;
      }
      case 'adiantar': if (CF.estado.surpresa) { CF.estado.surpresa.adiantou = true; CF.salvar(); } CF.som.toque(); render(); break;
      case 'atualizar': CF.som.toque(); abrirAtualizacao(); break;
      case 'conferirVersao': checarAtualizacao(true); break;
      case 'aprenderDia': CF.som.toque(); abrirAprender(Number(b.dataset.n)); break;
      case 'aprProx': CF.som.toque(); if (apr) { apr.pos++; if (apr.pos === apr.ids.length) terminarAprender(); renderAprender(); } break;
      case 'aprVolta': if (apr) { apr.pos = Math.max(-1, apr.pos - 1); renderAprender(); } break;
      case 'aprPraticar': { const n = apr ? apr.n : CF.diaAtual(); apr = null; fazerTeste(n); break; }
      case 'fecharApr': fecharCamada(); break;
      case 'perguntarFrase': abrirChat('duvida', apr ? apr.n : CF.diaAtual(), `Me explica a frase "${b.dataset.texto}": quando usar e como responder.`); break;
      case 'perguntar': CF.som.toque(); abrirChat('duvida'); break;
      case 'falarDia': CF.som.toque(); abrirFalar(Number(b.dataset.n)); break;
      case 'abrirConversa': CF.som.toque(); abrirChat('conversa', Number(b.dataset.n), null, b.dataset.voz === '1'); break;
      case 'usarFalar': {
        const n = Number(b.dataset.n), r = CF.registro(n), v = Number(b.dataset.v);
        if (r.usar === v) { aviso('Isso já está marcado.'); fecharCamada(); break; }
        r.usar = v; ui.ultimoDia = n;
        if (r.usar) { CF.marcarAtividade(); CF.som.marca(); CF.vibra(15); const q = CF.ganharPasso(n, 'usar', v); if (q) aviso(`+${q} ${q === 1 ? 'laranja' : 'laranjas'}`); }
        CF.salvar(); fecharCamada(); break;
      }
      case 'chatEnviar': enviarChat(); break;
      case 'testeNivel': CF.som.toque(); abrirTeste(); break;
      case 'verTeste': { const l = CF.estado.testesNivel || []; if (l.length) $camada.innerHTML = resultadoTesteHtml(l[l.length - 1], false); break; }
      case 'tnComecar': CF.som.toque(); tn.fase = 'q'; renderTeste(); break;
      case 'tnResp': if (tn && tn.fase === 'q') responderItem(Number(b.dataset.i)); break;
      case 'tnOuvir': ouvirItem(); break;
      case 'tnEscrita': {
        const e = tn.escrita, txt = e.texto.trim(), n = (txt.match(/\S+/g) || []).length;
        if (n < Math.ceil(e.tarefa.min * 0.5)) { aviso(`Escreve um pouco mais: pelo menos ${e.tarefa.min} palavras.`); break; }
        e.promessa = CF.ia.avaliarEscrita(txt, e.tarefa.tarefa).then(r => { e.res = r; }).catch(er => { e.erro = er.message; });
        CF.som.marca(); irPraFala(); break;
      }
      case 'tnPularEscrita': irPraFala(); break;
      case 'tnGravar': gravarTeste(); break;
      case 'tnPularFala': CF.voz.pararGravacao(true); if (tn.fala) clearInterval(tn.fala.relogio); finalizarTeste(); break;
      case 'tnSair': CF.voz.pararGravacao(true); if (tn && tn.fala) clearInterval(tn.fala.relogio); tn = null; fecharCamada(); break;
      case 'micToque': tocarMic(); break;
      case 'vozOuvir': CF.voz.falar("Hi! Let's practice English together. How was your day?"); break;
      case 'vozVel': CF.voz.salvar({ vel: (CF.voz.cfg().vel || 1) < 1 ? 1 : 0.82 }); render(); CF.voz.falar('This is how fast I talk now.'); break;
      case 'chatModo':
        if (!chat) break;
        chat.voz = !chat.voz; chat.estado = 'parado'; chat.aviso = '';
        CF.voz.largar(); CF.voz.calar(); renderChat();
        if (chat.voz) ouvirFala();
        break;
      case 'chatFim': {
        const n = chat.n, r = CF.registro(n);
        if ((r.usar || 0) < 20) r.usar = 20;
        ui.ultimoDia = n; CF.marcarAtividade();
        const q = CF.ganharPasso(n, 'usar', r.usar); CF.salvar();
        if (q) aviso(`Conversa feita! +${q} laranjas`);
        CF.voz.largar(); CF.voz.calar();
        chat = null; fecharCamada(); break;
      }
      case 'fecharChat': fecharChat(); break;
      case 'discordo': if (rev) { rev.ia = null; renderRev(); } break;
      case 'irAjustes': chat = null; apr = null; $camada.innerHTML = ''; ui.tela = 'progresso'; render(); setTimeout(() => { const a = document.getElementById('ajustes'); if (a) a.scrollIntoView({ behavior: 'smooth' }); }, 60); break;
      case 'iaSalvar': {
        // salvou: já testa sozinho
        const c = document.getElementById('iaChave'), chave = c ? c.value.trim() : '';
        CF.ia.salvar({ chave });
        render();
        if (!chave) { aviso('Chave apagada.'); break; }
        aviso('Chave salva! Testando a IA...');
        CF.ia.pedir([{ role: 'user', content: 'Say hi to me in one short sentence.' }], { max: 40, temp: 0.3 })
          .then(() => aviso('Pronto! A IA está funcionando.')).catch(e => aviso(e.message));
        break;
      }
      case 'regarDia': {
        const n = Number(b.dataset.n);
        iniciarRevisao(CF.paraRegar(), 'regar', () => { CF.registro(n).regar = true; CF.ganharPasso(n, 'regar'); CF.marcarAtividade(); CF.salvar(); });
        ui.ultimoDia = n; break;
      }
      case 'vestir': {
        const x = CF.ROUPAS.find(y => y.id === b.dataset.id);
        if (!x) break;
        if (!CF.roupaLiberada(x.id)) { aviso(`Libera com ${x.pts} pontos. Faltam ${x.pts - CF.pontosTotal()}.`); break; }
        CF.vestir(x.id); CF.som.marca(); render(); abrirFolha('roupas');
        { const el = $conteudo.querySelector('.casa-quarto [data-pet]'); if (el && el._pet) setTimeout(() => el._pet.pular(true), 40); }
        break;
      }
      case 'idade': {
        CF.usarIdade(b.dataset.k === '' ? null : Number(b.dataset.k));
        CF.som.marca(); render();
        if (ui.tela === 'casa') abrirFolha('roupas');
        { const el = $conteudo.querySelector('.casa-quarto [data-pet]'); if (el && el._pet) setTimeout(() => el._pet.pular(true), 40); }
        break;
      }
      case 'skin': {
        const k = CF.SKINS.find(x => x.id === b.dataset.id);
        if (!k) break;
        if (!CF.skinLiberada(k.id)) { aviso(`Libera com ${k.pts} pontos. Faltam ${k.pts - CF.pontosTotal()}.`); break; }
        CF.usarSkin(k.id); CF.som.marca(); render(); abrirFolha('roupas');
        { const el = $conteudo.querySelector('.casa-quarto [data-pet]'); if (el && el._pet) setTimeout(() => el._pet.pular(true), 40); }
        break;
      }
      case 'corRoupa': CF.trocarCorRoupa(b.dataset.id, b.dataset.cor); CF.som.toque(); render(); abrirFolha('roupas'); break;
      case 'comprarMovel': {
        const m = CF.MOVEIS.find(x => x.id === b.dataset.id);
        if (!m) break;
        if (CF.estado.frutas < m.preco) { aviso(`Faltam ${m.preco - CF.estado.frutas} laranjas. Cumpre as metas e revisa as frases pra ganhar mais!`); break; }
        CF.comprarMovel(m.id); ui.novoMovel = m.id; CF.som.festa(); CF.vibra(30); aviso(`${m.nome} no quarto!`); render(); abrirFolha('loja');
        { const el = $conteudo.querySelector('.casa-quarto [data-pet]'); if (el && el._pet) setTimeout(() => el._pet.pular(), 60); }
        break;
      }
      case 'porMovel': CF.alternarMovel(b.dataset.id); ui.novoMovel = b.dataset.id; CF.som.toque(); render(); abrirFolha('loja'); break;
      case 'folha': CF.som.toque(); ui.folha = b.dataset.qual; if (ui.folha === 'loja') { ui.vaga = 'quarto'; render(); } abrirFolha(b.dataset.qual); break;
      case 'vaga': CF.som.toque(); ui.vaga = b.dataset.lugar; ui.folha = 'loja'; render(); abrirFolha('loja'); break;
      case 'usarQuarto': CF.usarQuarto(b.dataset.id); CF.som.marca(); render(); abrirFolha('loja');
        { const el = $conteudo.querySelector('.casa-quarto [data-pet]'); if (el && el._pet) setTimeout(() => el._pet.pular(), 60); } break;
      case 'introProx': CF.som.toque(); intro(Number(b.dataset.i)); break;
      case 'introPular': case 'introFim':
        CF.estado.introVista = true; CF.salvar(); $camada.innerHTML = ''; render();
        break;
      case 'introVer': intro(0); break;
      case 'mes': ui.mes = Number(b.dataset.k); CF.som.toque(); render(); { const t = $conteudo.querySelector('.tela'); if (t) t.scrollTop = 0; } break;
      case 'cenarios': CF.som.toque(); abrirCenarios(); break;
      case 'usarMundo': CF.estado.mundo = b.dataset.id; CF.estado.mundoManual = true; CF.salvar(); CF.som.marca(); render(); if (ui.folha === 'loja') abrirFolha('loja'); else abrirCenarios(); aviso('Vista nova: ' + CF.mundoEscolhido().nome + '!'); break;
      case 'ouvirPergunta': CF.falar(b.dataset.texto); break;
      case 'passo': marcarPasso(diaAberto, b.dataset.passo); break;
      case 'usar': {
        const n = diaAberto, r = CF.registro(n), v = Number(b.dataset.v);
        r.usar = r.usar === v ? 0 : v; ui.ultimoDia = n;
        if (r.usar) { CF.marcarAtividade(); CF.som.marca(); CF.vibra(15); CF.ganharPasso(n, 'usar', v); }
        CF.salvar(); render(); abrirDia(n); checarEvolucao(); break;
      }
      case 'teste': fazerTeste(diaAberto); break;
      case 'copiar': copiar(b.dataset.texto); break;
      case 'link': abrirLink(b.dataset.url); break;
      case 'regar': {
        CF.som.agua();
        const n = CF.diaAtual();
        iniciarRevisao(CF.paraRegar(), 'regar', () => {
          if (CF.metas(n).some(p => p.id === 'regar')) { CF.registro(n).regar = true; CF.ganharPasso(n, 'regar'); CF.marcarAtividade(); CF.salvar(); }
        });
        break;
      }
      case 'regarUma': CF.som.agua(); iniciarRevisao([b.dataset.id], 'regar'); break;
      case 'treinarUma': iniciarRevisao([b.dataset.id], 'treino'); break;
      case 'alimentar': alimentar(b); break;
      case 'planta': CF.som.toque(); abrirPlanta(b.dataset.id); break;
      case 'pet': {
        const ids = CF.plantas();
        const c = ids.length ? CF.TODAS_CARTAS[ids[Math.floor(Math.random() * ids.length)]] : null;
        ui.fala = c ? (c.tipo === 'ouvir' ? { en: c.pt, pt: 'Me responde em inglês!' } : { en: c.en[0], pt: c.pt }) : { en: "Hi! I'm Torrão.", pt: 'Oi! Eu sou o Torrão.' };
        CF.falar(ui.fala.en);
        render();
        setTimeout(() => { const p = petAtual(); if (p) p.pular(); }, 30);
        clearTimeout(ui.tFala);
        ui.tFala = setTimeout(() => { ui.fala = null; if (ui.tela === 'casa' && !$camada.innerHTML) render(); }, 4200);
        break;
      }
      case 'falar': CF.falar(b.dataset.texto); break;
      case 'revelar': revelar(); break;
      case 'nota': nota(b.dataset.v); break;
      case 'fechar': case 'fecharFora': case 'fecharRev': fecharCamada(); break;
      case 'som': CF.estado.som = !CF.estado.som; CF.salvar(); render(); break;
      case 'backup': copiar(CF.exportar()); break;
      case 'mostraRestaurar': ui.mostraRestaurar = true; render(); break;
      case 'restaurar': {
        const t = document.getElementById('txtBackup');
        try { CF.importar(t.value.trim()); ui.mostraRestaurar = false; aviso('Backup restaurado!'); render(); }
        catch (err) { aviso('Esse texto não é um backup válido.'); }
        break;
      }
      case 'confirmaZerar': ui.confirmaZerar = true; render(); break;
      case 'naoZerar': ui.confirmaZerar = false; render(); break;
      case 'zerar': CF.zerar(); ui.confirmaZerar = false; ui.tela = 'estudar'; aviso('Tudo apagado. Começando do zero.'); render(); break;
    }
  });

  // botão voltar do Android (o APK chama esta função)
  window.CF_voltar = function () {
    if (chat) { fecharChat(); return true; }
    if ($camada.querySelector('.intro')) { CF.estado.introVista = true; CF.salvar(); $camada.innerHTML = ''; render(); return true; }
    if (apr && apr.pos > 0 && apr.pos < apr.ids.length) { apr.pos--; renderAprender(); return true; }
    if ($camada.innerHTML) { fecharCamada(); return true; }
    if (ui.tela !== 'estudar') { ui.tela = 'estudar'; render(); return true; }
    return false;
  };

  // voltou pro app (outro dia, outra hora): atualiza céu, frases pra revisar e humor
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    checarAtualizacao();
    if (!$camada.innerHTML) render(); else aplicarCeu();
  });

  if (window.speechSynthesis) speechSynthesis.getVoices();
  aplicarCeu();
  CF.montarNuvens($app.querySelector('.nuvens'));
  render();
  if (!CF.estado.introVista) intro(0); else checarEvolucao();
  checarAtualizacao();
})();

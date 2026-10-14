// Modo foto (só no PC, com ?foto=N no endereço): monta um progresso de exemplo pra tirar os prints da Play Store.
// Roda depois do logic.js e antes do app.js. Usado por tools/loja_prints.py num perfil descartável do Edge.
// 1 Estudar · 2 Aula · 3 Conversa por voz · 4 Resultado do teste · 5 Quarto do Torrão · 6 Frases
window.CF = window.CF || {};

(function () {
  const n = Number((location.search.match(/foto=(\d)/) || [])[1]);
  if (!n) return;
  const E = CF.estado, hoje = CF.hoje();
  E.introVista = true; E.som = false;
  for (let i = 0; i < 6; i++) E.atividade[CF.somaDias(hoje, -i)] = true;
  [1, 2].forEach(d => { CF.plantarDia(d); const r = CF.registro(d); r.aprender = true; r.testar = true; r.usar = 20; r.completou = CF.somaDias(hoje, d - 3); });
  CF.plantarDia(3); CF.registro(3).aprender = true;
  Object.keys(E.cartas).forEach((id, i) => {
    const c = E.cartas[id]; c.e = [1, 2, 3, 4, 2, 1, 3][i % 7]; c.ok = c.e;
    c.due = i % 5 === 0 ? hoje : CF.somaDias(hoje, 2 + (i % 4));
  });
  E.frutas = 86;
  E.faseVista = CF.fasePet(CF.pontosTotal());
  E.roupasTem = ['palha'];
  E.roupa = { cabeca: 'palha', rosto: null };
  E.toca = { presente: true, quarto: 'listras', tem: ['tapete_redondo', 'planta', 'luzinhas', 'quadro', 'estante', 'cama', 'pufe', 'relogio'],
    poe: { chao: 'tapete_redondo', frente_e: 'planta', teto: 'luzinhas', parede_e: 'quadro', parede_d: 'relogio', fundo_e: 'estante', fundo_d: 'cama', frente_d: 'pufe' } };
  E.testesNivel = [{
    data: hoje, geral: 'B1', quase: '', acertos: 36, total: 54, erros: [],
    skills: { vocab: 'B1', gramatica: 'A2', leitura: 'B1', escuta: 'B1', escrita: 'B1', fala: 'A2' },
    escrita: { nivel: 'B1', comentario: 'Texto claro e bem organizado. Cuidado com o passado: "I go" vira "I went". Usa mais conectivos, como because e so.', correcao: '' },
    fala: { nivel: 'A2', comentario: 'Você se comunica bem! Treina o som do "th" em "think" e tenta fazer menos pausas entre as frases.', transcricao: '' }
  }];
  try { localStorage.setItem('torrao-ia', JSON.stringify({ chave: 'demo' })); } catch (e) { /* perfil descartável */ }

  const clica = sel => { const b = document.querySelector(sel); if (b) b.click(); };
  window.addEventListener('load', () => {
    if (n === 2) { clica('[data-acao=meta][data-id=aprender]'); setTimeout(() => clica('[data-acao=aprProx]'), 150); }
    else if (n === 3) {
      let vez = 0;
      CF.voz.podeGravar = () => true;
      CF.voz.falar = (t, f) => { if (f) setTimeout(f, 30); return true; };
      CF.voz.gravar = cb => { cb({ tipo: 'ouvindo' }); if (vez++ === 0) setTimeout(() => cb({ tipo: 'audio', base64: 'x', segundos: 3 }), 80); };
      CF.ia.conversarAudio = async () => ({
        ouvi: 'Yesterday I go to the beach with three friends',
        pronuncia: '"three" começa com a língua entre os dentes: "thrii", não "tri".',
        dica: 'No passado, "go" vira "went": Yesterday I went to the beach.',
        resposta: 'That sounds fun! What did you do at the beach?'
      });
      clica('[data-acao=abrirConversa]');
    }
    else if (n === 4) clica('[data-acao=verTeste]');
    else if (n === 5) clica('[data-acao=tela][data-tela=casa]');
    else if (n === 6) clica('[data-acao=tela][data-tela=horta]');
  });
})();

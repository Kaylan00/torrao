// IA grátis da OpenRouter: corrige o que você escreve, tira dúvidas e conversa em inglês com você.
// A chave fica só no aparelho (localStorage 'torrao-ia'): não vai no código, nem no backup.
// Modelo padrão 'openrouter/free': a OpenRouter escolhe um modelo grátis que esteja funcionando (eles mudam muito).
window.CF = window.CF || {};

(function () {
  const CHAVE_LOCAL = 'torrao-ia';
  const ENDERECO = 'https://openrouter.ai/api/v1/chat/completions';
  const MODELO = 'openrouter/free';
  // reservas: se o primeiro estiver fora do ar ou lotado, a OpenRouter tenta o próximo sozinha
  const RESERVAS = ['google/gemma-4-31b-it:free', 'nvidia/nemotron-3-super-120b-a12b:free'];

  function cfg() {
    try { return JSON.parse(localStorage.getItem(CHAVE_LOCAL)) || {}; } catch (e) { return {}; }
  }

  // sem emoji em lugar nenhum do app (nem no que a IA escreve)
  const semEmoji = s => String(s).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu, '').replace(/[ \t]+\n/g, '\n').trim();

  CF.ia = {
    cfg,
    salvar(c) { try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(c)); } catch (e) { /* sem espaço: segue sem IA */ } },
    pronta() { return !!cfg().chave; },

    // mensagens no formato [{ role, content }]. Devolve o texto da resposta.
    // Sem modelo escolhido: tenta o roteador grátis e, se falhar (fora do ar, lotado, vazio), tenta uma reserva.
    async pedir(mensagens, opts) {
      const c = cfg();
      if (!c.chave) throw new Error('Sem chave da OpenRouter. Coloca nos Ajustes (aba Progresso).');
      opts = opts || {};
      const modelos = c.modelo ? [c.modelo] : [MODELO].concat(RESERVAS);
      let erro;
      for (const modelo of modelos) {
        try { return await this.chamar(c.chave, modelo, mensagens, opts); }
        catch (e) { erro = e; if (e.final) break; }
      }
      throw erro;
    },

    async chamar(chave, modelo, mensagens, opts) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), opts.tempo || 35000);
      const falha = (msg, final) => { const e = new Error(msg); e.final = !!final; return e; };
      try {
        const r = await fetch(ENDERECO, {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Authorization': 'Bearer ' + chave, 'Content-Type': 'application/json', 'X-Title': 'Torrao' },
          body: JSON.stringify({ model: modelo, messages: mensagens, temperature: opts.temp == null ? 0.5 : opts.temp, max_tokens: Math.max(opts.max || 500, 900) })
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) {
          if (r.status === 401) throw falha('A chave não funcionou. Confere nos Ajustes.', true);
          if (r.status === 402) throw falha('A OpenRouter pediu crédito pra esse modelo. Deixa o campo de modelo vazio nos Ajustes.', true);
          if (r.status === 429) throw falha('Muita gente usando a IA grátis agora. Tenta de novo daqui a pouco.');
          throw falha((j.error && j.error.message) || ('A IA deu erro ' + r.status + '. Tenta de novo.'));
        }
        let txt = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        if (txt) txt = String(txt).replace(/<think>[\s\S]*?<\/think>/g, '').trim();   // modelo que "pensa em voz alta"
        if (!txt) throw falha('A IA respondeu vazio. Tenta de novo.');
        return semEmoji(txt);
      } catch (e) {
        if (e.name === 'AbortError') throw falha('A IA demorou demais. Tenta de novo.');
        throw e;
      } finally {
        clearTimeout(t);
      }
    },

    // corrige a resposta do teste/revisão: { nota: 'acertei'|'quase'|'errei', explicacao, correta }
    async corrigir(carta, resposta) {
      const sis = 'Você é um professor de inglês gentil corrigindo um aluno brasileiro iniciante. ' +
        'Responda SÓ com um JSON, sem nada antes ou depois: {"nota":"acertei","explicacao":"...","correta":"..."}. ' +
        'nota: "acertei" quando a resposta passa a ideia com inglês correto e natural (aceite outras formas certas; maiúscula, pontuação e contração não importam); ' +
        '"quase" quando dá pra entender mas tem um erro pequeno; "errei" quando está errado, incompleto ou em português. ' +
        'explicacao: 1 ou 2 frases curtas em português do Brasil, falando direto com o aluno (sem emoji). correta: a frase certa em inglês mais parecida com o que o aluno tentou.';
      const usuario = carta.tipo === 'ouvir'
        ? `O aluno ouviu esta pergunta em inglês e respondeu: ${carta.pt}\nExemplos de boas respostas: ${carta.en.join(' | ')}\nResposta do aluno: ${resposta}\n(acertei = respondeu a pergunta com inglês correto, mesmo que com outras palavras)`
        : `Pedido (em português): ${carta.pt}\nRespostas de referência: ${carta.en.join(' | ')}\nResposta do aluno: ${resposta}`;
      const txt = await this.pedir([{ role: 'system', content: sis }, { role: 'user', content: usuario }], { temp: 0.1, max: 300 });
      const m = txt.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('A IA não corrigiu direito. Avalia você mesmo dessa vez.');
      let o;
      try { o = JSON.parse(m[0]); } catch (e) { throw new Error('A IA não corrigiu direito. Avalia você mesmo dessa vez.'); }
      const nota = String(o.nota || '').toLowerCase();
      if (!['acertei', 'quase', 'errei'].includes(nota)) throw new Error('A IA não corrigiu direito. Avalia você mesmo dessa vez.');
      return { nota, explicacao: semEmoji(o.explicacao || ''), correta: semEmoji(o.correta || carta.en[0]) };
    },

    // personalidade do Torrão em cada conversa
    sistema(modo, d, falando) {
      if (modo === 'conversa') {
        return (falando ? 'The learner is TALKING to you through speech recognition: ignore missing punctuation, capitalization and obvious transcription glitches, and only correct real grammar or vocabulary mistakes. Your English reply will be read aloud, so keep it very short (1 or 2 sentences, under 30 words), conversational, with no lists or symbols. ' : '') +
          'You are Torrão, a friendly little earth creature who is chatting in English with a Brazilian learner (level A2, wants to reach B1). ' +
          `Today's topic: ${d && d.ia ? d.ia : 'everyday life'}. ` +
          'Write short, simple English (1 to 3 sentences) and always end with a question so the conversation keeps going. ' +
          'If the learner made a mistake in the last message, start your reply with ONE short line in Brazilian Portuguese beginning with "Dica:" showing the correct way, then continue in English. ' +
          'If the learner writes in Portuguese, help them say it in English. Never use emojis.';
      }
      return 'Você é o Torrão, um bichinho de terra simpático que ensina inglês para um brasileiro (iniciante, quer chegar no intermediário em 2 meses). ' +
        'Responda dúvidas sobre inglês em português do Brasil, bem curto (até 6 linhas), com 1 ou 2 exemplos em inglês. ' +
        'Se pedirem pra traduzir, traduza e explique rapidinho. Nunca use emoji.';
    }
  };
})();

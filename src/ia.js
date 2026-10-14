// IA grátis da OpenRouter: corrige o que você escreve, tira dúvidas e conversa em inglês com você.
// A chave fica só no aparelho (localStorage 'torrao-ia'): não vai no código, nem no backup.
// Modelos: só grátis e dos melhores, em ordem. Se um estiver lotado ou fora do ar, tenta o próximo.
window.CF = window.CF || {};

(function () {
  const CHAVE_LOCAL = 'torrao-ia';
  const ENDERECO = 'https://openrouter.ai/api/v1/chat/completions';
  // (lista conferida em out/2026 em openrouter.ai/api/v1/models; o último é o roteador grátis da OpenRouter, que acha qualquer um no ar)
  const MODELOS = ['google/gemma-4-31b-it:free', 'nvidia/nemotron-3-super-120b-a12b:free', 'thinkingmachines/inkling:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free', 'openrouter/free'];
  // modelos grátis que OUVEM áudio (a IA escuta a sua voz de verdade, com erro e sotaque, em vez do texto "consertado" do celular)
  const MODELOS_AUDIO = ['thinkingmachines/inkling-small:free', 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', 'thinkingmachines/inkling:free'];
  const json = txt => {
    const m = String(txt).match(/\{[\s\S]*\}/);
    if (!m) return null;
    try { return JSON.parse(m[0]); } catch (e) { return null; }
  };
  const audioMsg = (texto, base64) => ({ role: 'user', content: [{ type: 'text', text: texto }, { type: 'input_audio', input_audio: { data: base64, format: 'wav' } }] });

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
      if (!c.chave) throw new Error('Falta a chave da IA. Coloca nos Ajustes (aba Progresso).');
      opts = opts || {};
      const modelos = opts.modelos || MODELOS;
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
        const corpo = { model: modelo, messages: mensagens, temperature: opts.temp == null ? 0.5 : opts.temp, max_tokens: Math.max(opts.max || 500, 900) };
        if (!opts.semRaciocinio) corpo.reasoning = { effort: 'low', exclude: true };
        const r = await fetch(ENDERECO, {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Authorization': 'Bearer ' + chave, 'Content-Type': 'application/json', 'X-Title': 'Torrao' },
          body: JSON.stringify(corpo)
        });
        const j = await r.json().catch(() => ({}));
        if (r.status === 400 && !opts.semRaciocinio) { clearTimeout(t); return this.chamar(chave, modelo, mensagens, Object.assign({}, opts, { semRaciocinio: true })); }
        if (!r.ok) {
          if (r.status === 401) throw falha('A chave não funcionou. Confere nos Ajustes.', true);
          if (r.status === 402) throw falha('Esse modelo pediu crédito. Tentando outro...');
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

    // conversa por voz com áudio: { ouvi, pronuncia, dica, resposta }
    async conversarAudio(historico, base64, d) {
      const sis = 'You are Torrão, a friendly little earth creature having a spoken English conversation with a Brazilian learner (around A2, aiming B1). ' +
        `Today's topic: ${d && d.ia ? d.ia : 'everyday life'}. You will receive the learner's voice as audio. ` +
        'Answer ONLY with JSON, nothing before or after: {"ouvi":"...","pronuncia":"...","dica":"...","resposta":"..."}. ' +
        'ouvi: EXACTLY what the learner said, word for word, as it actually sounded, keeping their grammar mistakes, missing words and any Portuguese words. Do not fix anything here. ' +
        'pronuncia: if a word was clearly mispronounced, 1 short sentence in Brazilian Portuguese saying which word and how to say it (for example: "work" soa como "uârk", não "uórk"); otherwise "". ' +
        'dica: if there was a grammar or vocabulary mistake, 1 short sentence in Brazilian Portuguese with the correct way to say it in English; otherwise "". ' +
        'resposta: your spoken reply in simple, natural English, 1 or 2 short sentences (under 30 words), ending with a question to keep the conversation going. No lists, no symbols, no emojis. ' +
        'If the learner spoke Portuguese, put in resposta how to say it in English and ask them to try.';
      const hist = historico.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const txt = await this.pedir([{ role: 'system', content: sis }].concat(hist, [audioMsg('(learner audio)', base64)]), { temp: 0.4, max: 500, modelos: MODELOS_AUDIO, tempo: 45000 });
      const o = json(txt);
      if (!o || !o.resposta) throw new Error('A IA não entendeu o áudio. Tenta falar de novo.');
      return { ouvi: semEmoji(o.ouvi || ''), pronuncia: semEmoji(o.pronuncia || ''), dica: semEmoji(o.dica || ''), resposta: semEmoji(o.resposta) };
    },

    // teste de nível: fala (áudio). { transcricao, nivel, fluencia, pronuncia, gramatica, vocabulario, comentario }
    async avaliarFala(base64, tarefa) {
      const sis = 'You are a strict, experienced CEFR speaking examiner (IELTS/Cambridge style). Evaluate the learner’s spoken answer from the audio. ' +
        'Answer ONLY with JSON: {"transcricao":"...","nivel":"B1","fluencia":"B1","pronuncia":"A2","gramatica":"B1","vocabulario":"B1","comentario":"..."}. ' +
        'transcricao: exactly what was said, keeping mistakes. Each level is one of A1, A2, B1, B2, C1, C2, judged only on what you hear (a very short or mostly Portuguese answer is A1). ' +
        'comentario: 2 or 3 short sentences in Brazilian Portuguese: what was good and the 2 most important things to improve, with a concrete example.';
      const txt = await this.pedir([{ role: 'system', content: sis }, audioMsg('Task given to the learner (in Portuguese): ' + tarefa, base64)], { temp: 0.1, max: 600, modelos: MODELOS_AUDIO, tempo: 60000 });
      const o = json(txt);
      if (!o || !o.nivel) throw new Error('A IA não conseguiu avaliar a fala.');
      return o;
    },

    // teste de nível: escrita. { nivel, gramatica, vocabulario, coerencia, tarefa, comentario, correcao }
    async avaliarEscrita(texto, tarefa) {
      const sis = 'You are a strict, experienced CEFR writing examiner (Cambridge style). Evaluate this text written by a Brazilian learner. ' +
        'Answer ONLY with JSON: {"nivel":"B1","gramatica":"B1","vocabulario":"A2","coerencia":"B1","tarefa":"B1","comentario":"...","correcao":"..."}. ' +
        'Each level is one of A1, A2, B1, B2, C1, C2, judged only on the text (too short, off-topic or in Portuguese means A1). ' +
        'comentario: 2 or 3 short sentences in Brazilian Portuguese with what was good and the 2 most important things to improve. ' +
        'correcao: the learner’s text rewritten in correct, natural English, keeping their ideas.';
      const txt = await this.pedir([{ role: 'system', content: sis }, { role: 'user', content: `Task (in Portuguese): ${tarefa}\n\nLearner text:\n${texto}` }], { temp: 0.1, max: 900 });
      const o = json(txt);
      if (!o || !o.nivel) throw new Error('A IA não conseguiu avaliar a escrita.');
      return o;
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

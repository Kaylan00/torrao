// Versão da Play Store: o plano foi escrito pro dono do app (faz jogos, joga LoL, fez o Frutas Fujonas).
// Aqui essas frases viram genéricas, pra servir pra qualquer pessoa. Os códigos das frases (d2b, d19a...) continuam
// os mesmos, então o progresso e a revisão não mudam. Na versão dos amigos e no PC, nada disso roda.
window.CF = window.CF || {};

(function () {
  if (!CF.LOJA) return;
  const O = 'ouvir';
  const DIA = {
    19: { blocos: ["I'm working on...", "I've been working on...", 'I started...', 'The idea is...'], ia: 'Ask me about my projects at work, at school or in my free time.' },
    20: { ia: "I'm going to explain how my favorite sport or game works. Ask me questions." },
    32: { ia: 'Talk with me about the games I like to play.' }
  };
  // [pedido em português, respostas aceitas, dica opcional, tipo opcional]
  const CARTA = {
    d2b: ['Diz que você trabalha com tecnologia.', ['I work in tech.', 'I work with technology.', 'I work in IT.']],
    d2c: ['Diz que você joga videogame há 5 anos.', ["I've been playing video games for 5 years.", "I've been playing games for five years."], 'Pra algo que começou no passado e continua: "I\'ve been ... for ..."'],
    d4b: ['Diz que você jogou videogame o dia todo.', ['I played video games all day.', 'I played games all day.']],
    d19a: ['Diz que está trabalhando num projeto novo.', ["I'm working on a new project."]],
    d19b: ['Diz que começou um curso online.', ['I started an online course.', "I've started an online course."]],
    d19c: ['Diz que está nesse projeto há um ano.', ["I've been working on this project for a year.", "I've been working on it for a year."]],
    d20a: ['Explicando um esporte: "basicamente, são dois times."', ['Basically, there are two teams.']],
    d20b: ['Diz que o objetivo é fazer mais gols que o outro time.', ['The goal is to score more goals than the other team.', 'The goal is to score more goals.']],
    d20c: ['Diz que cada time tem onze jogadores.', ['Each team has eleven players.']],
    d20d: ['Diz que o jogo acaba depois de noventa minutos.', ['The game ends after ninety minutes.', 'After ninety minutes, the game ends.']],
    d22c: ['Pergunta se a pessoa já jogou algum jogo online.', ['Have you ever played online games?', 'Have you ever played an online game?']],
    d25c: ['Diz que você joga videogame quase todo dia.', ['I play video games almost every day.', 'I play games almost every day.']],
    d32c: ['Diz que você está preso no mesmo nível do ranking.', ["I'm stuck at the same rank.", "I'm stuck in the same rank."]],
    d32e: ['What kind of games do you like?', ['I like strategy games.', 'Mostly shooters, like Valorant.', 'I love puzzle games on my phone.'], '', O],
    d72a: ['Diz que foi responsável pelo planejamento e pela execução.', ['I was responsible for the planning and the execution.']],
    d72b: ['Diz que trabalhou num projeto grande da empresa.', ['I worked on a big project at my company.', 'I worked on a big company project.']],
    d72c: ['Diz que conseguiu entregar em duas semanas.', ['I managed to deliver it in two weeks.', 'I managed to finish it in two weeks.']],
    d72d: ['Diz: "o resultado foi um aumento de 20% nas vendas".', ['The result was a 20% increase in sales.', 'The result was a twenty percent increase in sales.']],
    d72e: ['What project are you most proud of?', ["I'm most proud of a project I led last year.", 'A website I built for a small business.', 'Probably my last project, because I did most of it myself.'], '', O]
  };
  CF.DIAS.forEach(d => {
    if (DIA[d.n]) Object.assign(d, DIA[d.n]);
    (d.cartas || []).forEach(c => {
      const o = CARTA[c[0]];
      if (!o) return;
      c[1] = o[0]; c[2] = o[1];
      if (o.length > 2) { c[3] = o[2]; c[4] = o[3]; }
    });
  });
  // dicas de "ouvir": sem LoL
  const troca = s => String(s).replace(/vídeo de LoL/g, 'vídeo sobre algo que você curte').replace(/streamer de LoL/g, 'canal sobre algo que você curte');
  Object.keys(CF.OUVIR || {}).forEach(k => { CF.OUVIR[k] = troca(CF.OUVIR[k]); });
  if (CF.ouvirTexto) { const orig = CF.ouvirTexto; CF.ouvirTexto = n => troca(orig(n)); }
})();

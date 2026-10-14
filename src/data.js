// Conteúdo do plano de 3 semanas (mesmo de Desktop\Ingles\PLANO_INGLES.md).
// Cada dia normal tem blocos e cartas de revisão. Cada carta vira uma planta na horta.
// carta: [id, situação em português, respostas aceitas (a primeira é a principal), dica opcional]
window.CF = window.CF || {};

CF.VELOCIDADE = {
  1: 'speak slowly',
  2: 'speak a little slower than normal',
  3: 'speak at normal speed'
};

CF.OUVIR = {
  1: 'Easy English no YouTube (entrevistas na rua) ou vídeo de LoL em inglês, com legenda em inglês.',
  2: 'Um episódio de série (Brooklyn Nine-Nine ou Friends) ou streamer de LoL, com legenda em inglês.',
  3: 'Vídeo em inglês: o começo sem legenda, depois revê com legenda em inglês.'
};

CF.promptGemini = tema =>
  `Me indica 3 vídeos do YouTube em português, de até 20 minutos, que ensinem ${tema} com frases prontas e prática de repetição em voz alta, estilo aula prática e não aula de gramática. Me manda os links.`;

CF.promptIA = (assunto, semana) =>
  `Let's practice English. I'm intermediate. ${assunto} Ask me one question at a time, ${CF.VELOCIDADE[Math.min(semana, 3)]}, and at the end tell me my 3 main mistakes.`;

// o que fazer no passo "Ouvir": vai ficando mais difícil, e a partir da semana 4 tem ditado dia sim, dia não
CF.ouvirTexto = function (n) {
  const s = CF.semanaDe(n);
  if (s <= 3) return CF.OUVIR[s];
  const ditado = 'Ditado: escolhe 30 segundos de um vídeo em inglês, escreve tudo que ouvir (pode pausar), depois confere com a legenda. Depois assiste o resto normal.';
  if (n % 2 === 0) return ditado;
  if (s <= 8) return 'Um episódio de série ou um vídeo de LoL em inglês, com legenda em inglês, sem pausar.';
  return 'Um episódio de série ou um vídeo em inglês SEM legenda. Se perder o fio, liga a legenda em inglês só naquele trecho.';
};

CF.DIAS = [
  { n: 1, tema: 'Blocos de pergunta', blocos: ['Do you have...?', 'What time are you...?', 'What else...?', "Let's..."],
    video: { link: 'https://www.youtube.com/watch?v=1ikjJmdFVKM' },
    ia: 'Talk with me about my plans for this week.',
    cartas: [
      ['d1a', 'Pergunta se a pessoa tem tempo hoje.', ['Do you have time today?']],
      ['d1b', 'Pergunta se a pessoa tem planos pra hoje à noite.', ['Do you have plans for tonight?', 'Do you have any plans for tonight?']],
      ['d1c', 'Pergunta que horas a pessoa está livre.', ['What time are you free?']],
      ['d1d', 'Pergunta o que mais a pessoa tem.', ['What else do you have?']],
      ['d1e', 'Chama a pessoa pra resolver o problema junto com você.', ["Let's solve this problem together.", "Let's solve it together."]],
      ['d1f', 'Pergunta o que a pessoa está fazendo.', ['What are you doing?']]
    ] },
  { n: 2, tema: 'Falar de você', blocos: ["I'm from...", 'I work with...', "I've been playing... for... years", "I'm into..."],
    video: { gemini: 'como se apresentar em inglês de forma natural' },
    ia: 'Get to know me. Ask about my life, my work and my hobbies.',
    cartas: [
      ['d2a', 'Diz que você é do Brasil.', ["I'm from Brazil."]],
      ['d2b', 'Diz que você trabalha com jogos.', ['I work in games.', 'I make games.', 'I work with games.']],
      ['d2c', 'Diz que você joga LoL há 5 anos.', ["I've been playing LoL for 5 years.", "I've been playing League for five years."], 'Pra algo que começou no passado e continua: "I\'ve been ... for ..."'],
      ['d2d', 'Diz que você curte muito games.', ["I'm really into games.", "I'm into games."]],
      ['d2e', 'Diz que você mora com a sua família.', ['I live with my family.']]
    ] },
  { n: 3, tema: 'Fazer perguntas pra conversa não morrer', blocos: ['What about you?', 'What do you do?', 'What kind of... do you like?', 'How long have you...?'],
    video: { gemini: 'perguntas para manter uma conversa em inglês' },
    ia: "Let's talk about hobbies. I will ask you questions too.",
    cartas: [
      ['d3a', 'Depois de falar de você, devolve a pergunta: "e você?"', ['What about you?', 'How about you?', 'And you?']],
      ['d3b', 'Pergunta com o que a pessoa trabalha.', ['What do you do?', 'What do you do for a living?']],
      ['d3c', 'Pergunta que tipo de música a pessoa gosta.', ['What kind of music do you like?']],
      ['d3d', 'Pergunta há quanto tempo a pessoa mora ali.', ['How long have you lived here?', 'How long have you been living here?']],
      ['d3e', 'Pergunta se a pessoa joga algum jogo.', ['Do you play any games?', 'Do you play video games?']]
    ] },
  { n: 4, tema: 'Contar o que você fez', blocos: ['I went...', 'I had...', 'I was...', "I didn't...", 'Did you...?'],
    video: { gemini: 'como falar do passado em inglês com os verbos mais usados (went, had, did, got)' },
    ia: 'Ask me what I did last weekend.',
    cartas: [
      ['d4a', 'Diz que você foi ao shopping ontem.', ['I went to the mall yesterday.']],
      ['d4b', 'Diz que você jogou LoL o dia todo.', ['I played LoL all day.', 'I played League all day.']],
      ['d4c', 'Diz que você não fez nada no fim de semana.', ["I didn't do anything on the weekend.", "I didn't do anything this weekend.", 'I did nothing this weekend.']],
      ['d4d', 'Pergunta se a pessoa viu o jogo ontem.', ['Did you see the game yesterday?', 'Did you watch the game yesterday?']],
      ['d4e', 'Diz que foi muito divertido.', ['It was really fun.', 'It was so much fun.', 'It was a lot of fun.']]
    ] },
  { n: 5, tema: 'Planos', blocos: ["I'm gonna...", "I'm planning to...", 'I want to...', "I'll probably...", 'Are you gonna...?'],
    video: { gemini: 'como falar de planos em inglês: going to, gonna, will' },
    ia: 'Ask me about my plans for next month.',
    cartas: [
      ['d5a', 'Diz que você vai jogar hoje à noite.', ["I'm gonna play tonight.", "I'm going to play tonight."]],
      ['d5b', 'Diz que você está planejando viajar ano que vem.', ["I'm planning to travel next year."]],
      ['d5c', 'Diz que você provavelmente vai ficar em casa.', ["I'll probably stay home.", "I'll probably stay at home."]],
      ['d5d', 'Pergunta se a pessoa vai sair amanhã.', ['Are you gonna go out tomorrow?', 'Are you going out tomorrow?', 'Are you going to go out tomorrow?']],
      ['d5e', 'Diz que você quer aprender inglês esse ano.', ['I want to learn English this year.', 'I wanna learn English this year.']]
    ] },
  { n: 6, tema: 'Gostos e opinião', blocos: ['I think...', "I'm not a big fan of...", 'I prefer... because...', 'It depends'],
    video: { gemini: 'como dar opinião em inglês de forma natural' },
    ia: 'Ask me my opinion about games, movies and food.',
    cartas: [
      ['d6a', 'Diz que você acha esse jogo muito bom.', ['I think this game is really good.', 'I think this game is great.']],
      ['d6b', 'Diz que você não é muito fã de filme de terror.', ["I'm not a big fan of horror movies."]],
      ['d6c', 'Diz que você prefere pizza porque é mais rápido.', ["I prefer pizza because it's faster.", 'I prefer pizza because it is faster.']],
      ['d6d', 'Alguém pergunta qual é melhor. Responde "depende".', ['It depends.']],
      ['d6e', 'Pergunta o que a pessoa acha.', ['What do you think?']]
    ] },
  { n: 7, tipo: 'desafio', semanaTeste: 1, tema: 'Desafio da semana 1',
    aprender: 'Assistir de novo o vídeo do dia 1, agora sem pausar.',
    video: { link: 'https://www.youtube.com/watch?v=1ikjJmdFVKM' },
    ia: 'Talk with me about anything: my life, my plans, what I did last weekend and my opinions.' },

  { n: 8, tema: 'Ganhar tempo pra pensar', blocos: ['Well...', 'Let me think...', 'You know...', 'I mean...', 'How can I say it...'],
    video: { gemini: 'filler words em inglês, como ganhar tempo pra pensar numa conversa' },
    ia: 'Ask me difficult questions so I need to think.',
    cartas: [
      ['d8a', 'Pergunta difícil. Ganha tempo: "Bom... deixa eu pensar."', ['Well... let me think.', 'Well, let me think.']],
      ['d8b', 'No meio da frase: "tipo, sabe?"', ['Like, you know?']],
      ['d8c', 'Corrige o que disse: "quer dizer, não é bem assim."', ["I mean, it's not exactly like that.", "I mean, it's not really like that."]],
      ['d8d', 'Procurando a palavra: "como posso dizer..."', ['How can I say it...', 'How can I put it...']],
      ['d8e', 'Alguém faz uma pergunta difícil: "boa pergunta!"', ["Good question!", "That's a good question!"]]
    ] },
  { n: 9, tema: 'Quando falta a palavra', blocos: ["It's a thing you use to...", "It's kind of like...", "What's the word...", "I don't know how to say it, but..."],
    video: { gemini: 'como explicar uma palavra em inglês quando você esquece ela' },
    ia: "Let's play a game: I describe a word without saying it, and you guess. Then you describe one and I guess.",
    cartas: [
      ['d9a', 'Esqueceu "chave". Explica: é uma coisa que você usa pra abrir a porta.', ["It's a thing you use to open the door.", "It's something you use to open the door."]],
      ['d9b', 'Explica: é tipo um carro, mas menor.', ["It's kind of like a car, but smaller.", "It's like a car, but smaller."]],
      ['d9c', 'Tentando lembrar: "qual é a palavra..."', ["What's the word...", 'What is the word...']],
      ['d9d', 'Diz que não sabe como falar, mas vai tentar.', ["I don't know how to say it, but...", "I don't know how to say it, but I'll try."]],
      ['d9e', 'Pergunta como se diz "geladeira" em inglês.', ['How do you say "geladeira" in English?']]
    ] },
  { n: 10, tema: 'Reagir', blocos: ['Really?', 'No way!', 'That makes sense', 'That sounds fun', 'Oh, I see', "That's crazy"],
    video: { gemini: 'expressões para reagir numa conversa em inglês' },
    ia: 'Tell me some stories and I will react.',
    cartas: [
      ['d10a', 'Alguém conta algo surpreendente: "não acredito!"', ['No way!']],
      ['d10b', 'Alguém explica o motivo de algo: "faz sentido."', ['That makes sense.']],
      ['d10c', 'Alguém conta um plano legal: "parece divertido!"', ['That sounds fun!', 'Sounds fun!']],
      ['d10d', 'Você entendeu a explicação: "ah, entendi."', ['Oh, I see.', 'I see.', 'Got it.']],
      ['d10e', 'Alguém conta algo muito doido: "que loucura!"', ["That's crazy!", "That's insane!"]]
    ] },
  { n: 11, tema: 'Contar uma história', blocos: ['So, the other day...', 'And then...', 'Suddenly...', 'In the end...', 'It was so...'],
    video: { gemini: 'como contar uma história em inglês de forma natural' },
    ia: 'Ask me to tell you a funny story from my life.',
    cartas: [
      ['d11a', 'Começa a história: "então, outro dia..."', ['So, the other day...']],
      ['d11b', 'Na história: "e aí, do nada..."', ['And then, suddenly...', 'And then, out of nowhere...']],
      ['d11c', 'Termina a história: "no final, deu tudo certo."', ['In the end, everything was fine.', 'In the end, it worked out.', 'In the end, everything worked out.']],
      ['d11d', 'Diz que foi muito engraçado.', ['It was so funny.', 'It was really funny.']],
      ['d11e', 'Prende a atenção: "você não vai acreditar no que aconteceu."', ["You won't believe what happened."]]
    ] },
  { n: 12, tema: 'Phrasal verbs do dia a dia', blocos: ['hang out', 'figure out', 'give up', 'show up', 'pick up', 'come back'],
    video: { gemini: 'phrasal verbs mais usados no dia a dia em inglês' },
    ia: 'Talk with me about my week and use common phrasal verbs.',
    cartas: [
      ['d12a', 'Chama a pessoa pra sair junto no sábado (hang out).', ['Do you wanna hang out on Saturday?', 'Do you want to hang out on Saturday?', "Let's hang out on Saturday."]],
      ['d12b', 'Diz que finalmente descobriu como fazer isso (figure out).', ['I finally figured out how to do it.', 'I finally figured it out.']],
      ['d12c', 'Fala pra pessoa não desistir (give up).', ["Don't give up!"]],
      ['d12d', 'Diz que ele não apareceu (show up).', ["He didn't show up."]],
      ['d12e', 'Diz que vai buscar a pessoa às 8 (pick up).', ["I'll pick you up at 8.", "I'll pick you up at eight."]]
    ] },
  { n: 13, tema: 'Entender nativo falando rápido', blocos: ['gonna', 'wanna', 'gotta', 'kinda', 'whaddaya'],
    video: { gemini: 'como nativos falam rápido em inglês: gonna, wanna, palavras conectadas' },
    ia: "Speak naturally and I will tell you when I don't understand.",
    cartas: [
      ['d13a', 'Do jeito falado: "eu vou comer" (gonna).', ["I'm gonna eat."]],
      ['d13b', 'Do jeito falado: "quer jogar?" (wanna).', ['Wanna play?', 'Do you wanna play?']],
      ['d13c', 'Do jeito falado: "tenho que ir" (gotta).', ['I gotta go.', "I've gotta go."]],
      ['d13d', 'Do jeito falado: "é meio estranho" (kinda).', ["It's kinda weird.", "It's kinda strange."]],
      ['d13e', 'Do jeito falado: "o que você quer fazer?"', ['Whaddaya wanna do?', 'What do you wanna do?'], 'Rápido, "what do you" vira "whaddaya".']
    ] },
  { n: 14, tipo: 'desafio', semanaTeste: 2, tema: 'Desafio da semana 2',
    aprender: 'Contar uma história de 2 min em voz alta sem parar (pode gravar no celular).',
    ia: 'Talk with me about anything. Ask me to tell you stories, react to them and ask follow-up questions.' },

  { n: 15, tema: 'Puxar papo com desconhecido', blocos: ["How's it going?", 'Where are you from?', 'What brings you here?', 'Nice to meet you'],
    video: { gemini: 'small talk em inglês, como puxar conversa com desconhecido' },
    ia: 'Pretend we just met at a party.',
    cartas: [
      ['d15a', 'Cumprimenta alguém de um jeito casual: "e aí, tudo bem?"', ["How's it going?", "What's up?", 'How are you doing?']],
      ['d15b', 'Pergunta de onde a pessoa é.', ['Where are you from?']],
      ['d15c', 'Pergunta o que traz a pessoa ali.', ['What brings you here?']],
      ['d15d', 'Diz que foi um prazer conhecer a pessoa.', ['Nice to meet you.', 'Nice meeting you.']],
      ['d15e', 'Pergunta se a pessoa mora por ali.', ['Do you live around here?']]
    ] },
  { n: 16, tema: 'Resolver um problema', blocos: ['I have a problem with...', 'Could you help me...?', "It's not working", "There's something wrong with..."],
    video: { gemini: 'inglês para resolver problemas e reclamar em hotel e loja' },
    ia: 'You are a hotel receptionist and my room has a problem.',
    cartas: [
      ['d16a', 'No hotel: diz que está com um problema no seu quarto.', ['I have a problem with my room.']],
      ['d16b', 'Diz que o ar-condicionado não está funcionando.', ["The air conditioning isn't working.", "The AC isn't working.", 'The air conditioning is not working.']],
      ['d16c', 'Pede ajuda com educação.', ['Could you help me?', 'Can you help me?', 'Could you help me, please?']],
      ['d16d', 'Diz que tem algo errado com a sua conta.', ["There's something wrong with my bill.", 'There is something wrong with my bill.']],
      ['d16e', 'Na loja: diz que gostaria de trocar isso.', ["I'd like to exchange this.", 'I would like to exchange this.']]
    ] },
  { n: 17, tema: 'Pedir e oferecer', blocos: ['Could you...?', 'Would you mind...?', 'Do you want me to...?', 'Would you like...?'],
    video: { gemini: 'como pedir favor e oferecer ajuda em inglês com educação' },
    ia: 'We are friends planning a trip together.',
    cartas: [
      ['d17a', 'Pede pra pessoa abrir a janela.', ['Could you open the window?', 'Could you open the window, please?']],
      ['d17b', 'Pergunta se a pessoa se importa se você sentar ali.', ['Do you mind if I sit here?']],
      ['d17c', 'Oferece ajuda: "quer que eu te ajude?"', ['Do you want me to help you?', 'Do you want me to help?']],
      ['d17d', 'Oferece um café.', ['Would you like a coffee?', 'Would you like some coffee?']],
      ['d17e', 'Pergunta se a pessoa pode te fazer um favor.', ['Can you do me a favor?', 'Could you do me a favor?']]
    ] },
  { n: 18, tema: 'Concordar e discordar', blocos: ['I agree', 'I completely disagree', 'I see your point, but...', "That's not fair", 'Fair enough'],
    video: { gemini: 'como concordar e discordar em inglês de forma educada' },
    ia: "Let's debate about games. Disagree with me.",
    cartas: [
      ['d18a', 'Diz que concorda completamente.', ['I completely agree.', 'I agree completely.']],
      ['d18b', 'Diz que discorda completamente.', ['I completely disagree.', 'I disagree completely.']],
      ['d18c', 'Discorda com educação: "entendo seu ponto, mas..."', ['I see your point, but...']],
      ['d18d', 'Reclama: "isso não é justo."', ["That's not fair.", 'This is not fair.', "That's unfair."]],
      ['d18e', 'Aceita o argumento da pessoa: "justo."', ['Fair enough.']]
    ] },
  { n: 19, tema: 'Falar dos seus projetos', blocos: ["I'm working on...", "I've been making...", 'I made a game called...', 'The idea is...'],
    video: { gemini: "present perfect em inglês na prática: I've been, I have done" },
    ia: 'Ask me about my projects. I make games.',
    cartas: [
      ['d19a', 'Diz que está trabalhando num jogo novo.', ["I'm working on a new game."]],
      ['d19b', 'Diz que fez um jogo chamado Frutas Fujonas.', ['I made a game called Frutas Fujonas.']],
      ['d19c', 'Diz que faz jogos há um ano.', ["I've been making games for a year.", "I've been making games for one year."]],
      ['d19d', 'Começa a explicar o jogo: "a ideia é..."', ['The idea is...']],
      ['d19e', 'Diz que já terminou a primeira versão.', ["I've already finished the first version.", 'I already finished the first version.']]
    ] },
  { n: 20, tema: 'Explicar uma coisa que você entende', blocos: ['Basically...', 'The goal is to...', 'First you..., then you...', 'The tricky part is...'],
    video: { gemini: 'como explicar algo passo a passo em inglês' },
    ia: "I'm going to explain how League of Legends works. Ask me questions.",
    cartas: [
      ['d20a', 'Explicando o LoL: "basicamente, são dois times."', ['Basically, there are two teams.']],
      ['d20b', 'Diz que o objetivo é destruir a base inimiga.', ['The goal is to destroy the enemy base.']],
      ['d20c', 'Diz que primeiro você escolhe um campeão.', ['First, you pick a champion.', 'First, you choose a champion.']],
      ['d20d', 'Diz que depois você vai pra sua rota.', ['Then you go to your lane.']],
      ['d20e', 'Começa a explicar a parte difícil: "a parte difícil é..."', ['The tricky part is...', 'The hard part is...']]
    ] },
  { n: 21, tipo: 'chefao', tema: 'Chefão',
    ia: 'This is a 20 minute test, so keep the conversation going and do not let me switch to Portuguese.' }
];

CF.semanaDe = n => Math.ceil(n / 7);
CF.mesDe = n => Math.ceil(n / 28);

// Catálogo de pontos (somados desde o dia 1)
CF.CATALOGO = [
  [0, 'Entende frases simples, mas monta a frase em português antes de falar.'],
  [50, 'Faz perguntas básicas sem montar palavra por palavra ("Do you have...?", "What time are you...?").'],
  [150, 'Se apresenta e fala de você sem travar.'],
  [250, 'Mantém a conversa fazendo perguntas de volta e conta o que fez no fim de semana.'],
  [350, 'Fala do que vai fazer e dá opinião simples. Aguenta 5 a 10 min com IA falando devagar.'],
  [450, 'Quando trava, ganha tempo ("Well...", "Let me think...") em vez de ficar calado.'],
  [550, 'Quando falta a palavra, explica com outras. Reage na conversa de forma natural.'],
  [650, 'Conta uma história curta com começo, meio e fim.'],
  [750, 'Entende a maior parte de uma série com legenda em inglês e reconhece "gonna", "wanna", "gotta".'],
  [850, 'Puxa papo com desconhecido.'],
  [950, 'Resolve problema (hotel, loja) e pede ou oferece ajuda com educação.'],
  [1050, 'Concorda, discorda e defende sua opinião. Fala dos seus projetos.'],
  [1150, 'Aguenta 20 min de conversa sem português. Está chegando no "me viro".'],
  [1450, 'Conta o que já fez na vida ("Have you ever...?") e se vira em restaurante e loja. Fim do mês 1.'],
  [1750, 'Compara coisas, dá direções e fala de séries e jogos sem travar.'],
  [2050, 'Marca, desmarca e remarca planos. Usa "if" no dia a dia.'],
  [2350, 'Dá e pede conselho, explica o que está sentindo na farmácia e pede permissão com educação.'],
  [2650, 'Conta histórias com detalhes ("I was... when...") e fala da infância. Fim do mês 2: nível de se virar.'],
  [2950, 'Resolve aeroporto, hotel e ligação com perguntas educadas.'],
  [3250, 'Dá opinião com nuance, concorda em parte e explica um processo passo a passo.'],
  [3550, 'Se apresenta e fala dos seus projetos numa entrevista simples.'],
  [3850, 'Aguenta 30 minutos de conversa sem português. Pronto pro próximo nível.']
];

// Fases do Torrão por pontos
CF.FASES_PET = [
  { min: 0, nome: 'Filhote' },
  { min: 500, nome: 'Jovem' },
  { min: 1400, nome: 'Adulto' },
  { min: 2600, nome: 'Lendário' }
];

// Cenários: quem escolhe é você (vale pro app todo: fundo, ilhas do mapa e horta).
// O Pomar do Céu usa o céu que muda com a hora do dia.
CF.MUNDO_PADRAO = 'pomar';   // o mais calmo
CF.MUNDOS = [
  { id: 'pomar', nome: 'Pomar do Céu', fundo: null, previa: 'assets/ceu/dia.jpg', ilhas: 'assets/mapa/', noite: false,
    texto: 'Ilhas de grama num céu de papel que muda com a hora: manhã, fim de tarde e noite.' },
  { id: 'mar', nome: 'Mar de Papel', fundo: '../assets/mundo/mar/fundo.jpg', previa: 'assets/mundo/mar/fundo.jpg', ilhas: 'assets/mundo/mar/', noite: false,
    texto: 'Ilhas de areia sobre um oceano de papel, com barquinhos de origami e um farol.' },
  { id: 'picos', nome: 'Picos de Nuvem', fundo: '../assets/mundo/picos/fundo.jpg', previa: 'assets/mundo/picos/fundo.jpg', ilhas: 'assets/mundo/picos/', noite: true,
    texto: 'Ilhas de neve com pingentes de gelo, numa noite de aurora e lua cheia.' },
  { id: 'doce', nome: 'Doceria Flutuante', fundo: '../assets/mundo/doce/fundo.jpg', previa: 'assets/mundo/doce/fundo.jpg', ilhas: 'assets/mundo/doce/', noite: false,
    texto: 'Ilhas de bolo com cobertura, árvores de pirulito e nuvens de algodão-doce.' },
  { id: 'cogumelo', nome: 'Floresta de Cogumelos', fundo: '../assets/mundo/cogumelo/fundo.jpg', previa: 'assets/mundo/cogumelo/fundo.jpg', ilhas: 'assets/mundo/cogumelo/', noite: false,
    texto: 'Cogumelos gigantes de bolinhas, samambaias enormes e uma casinha dentro de um cogumelo.' },
  { id: 'recife', nome: 'Recife de Papel', fundo: '../assets/mundo/recife/fundo.jpg', previa: 'assets/mundo/recife/fundo.jpg', ilhas: 'assets/mundo/recife/', noite: false,
    texto: 'O fundo do mar: corais coloridos, peixinhos, tartaruga e um baú do tesouro.' }
];
CF.mundoEscolhido = () => CF.MUNDOS.find(m => m.id === (CF.estado && CF.estado.mundoManual ? CF.estado.mundo : CF.MUNDO_PADRAO)) || CF.MUNDOS[0];
// os meses do mapa (só pra navegar entre os dias)
CF.MESES = [{ de: 1, ate: 28 }, { de: 29, ate: 56 }, { de: 57, ate: 84 }];

// Guarda-roupa do Torrão: desbloqueia com pontos. Cada peça vai num lugar (cabeça ou rosto).
CF.ROUPAS = [
  { id: 'bone', nome: 'Boné', lugar: 'cabeca', pts: 150 },
  { id: 'palha', nome: 'Chapéu de palha', lugar: 'cabeca', pts: 350 },
  { id: 'gorro', nome: 'Gorro de lã', lugar: 'cabeca', pts: 700 },
  { id: 'leitura', nome: 'Óculos de leitura', lugar: 'rosto', pts: 1000 },
  { id: 'escuros', nome: 'Óculos escuros', lugar: 'rosto', pts: 1700 },
  { id: 'flores', nome: 'Tiara de flores', lugar: 'cabeca', pts: 2100 },
  { id: 'cartola', nome: 'Cartola', lugar: 'cabeca', pts: 2600 },
  { id: 'coroa', nome: 'Coroa', lugar: 'cabeca', pts: 3200 },
  { id: 'chef', nome: 'Chapéu de cozinheiro', lugar: 'cabeca', pts: 400 },
  { id: 'helice', nome: 'Boné de hélice', lugar: 'cabeca', pts: 500 },
  { id: 'pirata', nome: 'Chapéu de pirata', lugar: 'cabeca', pts: 1500 },
  { id: 'bandana', nome: 'Faixa de testa', lugar: 'cabeca', pts: 300 },
  { id: 'louros', nome: 'Coroa de louros', lugar: 'cabeca', pts: 2400 },
  { id: 'urso', nome: 'Orelhas de urso', lugar: 'cabeca', pts: 600 },
  { id: 'coracao', nome: 'Óculos de coração', lugar: 'rosto', pts: 1400 },
  { id: 'mergulho', nome: 'Óculos de mergulho', lugar: 'rosto', pts: 1900 },
  { id: 'bigode', nome: 'Bigode', lugar: 'rosto', pts: 2000 },
  // fora por enquanto (recorte com defeito, cor parecida com a do Torrão): cowboy, detetive, explorador, fones, bruxo
  // novas (13/10/2026): desenhadas já vestidas no Torrão (tools/arte8.py)
  { id: 'formatura', nome: 'Capelo de formatura', lugar: 'cabeca', pts: 3600 },
  { id: 'sapo', nome: 'Chapéu de sapo', lugar: 'cabeca', pts: 450 },
  { id: 'viking', nome: 'Capacete viking', lugar: 'cabeca', pts: 1800 },
  { id: 'festa', nome: 'Chapéu de festa', lugar: 'cabeca', pts: 250 },
  { id: 'cogumelo', nome: 'Chapéu de cogumelo', lugar: 'cabeca', pts: 1100 },
  { id: 'boina', nome: 'Boina', lugar: 'cabeca', pts: 650 },
  { id: 'laranja', nome: 'Chapéu de laranja', lugar: 'cabeca', pts: 1000 }
];

// TUDO LIBERADO na versão dos amigos e no PC (o dono pediu tudo liberado em 12/10/2026).
// Na versão da Play Store (CF.LOJA), roupas, skins e quartos custam laranjas (CF.precoRoupa etc. no logic.js).
CF.TUDO_LIBERADO = !CF.LOJA;

// Cartões do passeio: completou o dia, no dia seguinte o Torrão volta com uma dessas (e 3 laranjas)
CF.CARTOES = [
  { en: 'No worries.', pt: 'Sem problema. (resposta pra "desculpa" ou "obrigado")', lugar: 'na praça' },
  { en: "I'm on my way.", pt: 'Tô a caminho.', lugar: 'na estação de trem' },
  { en: 'It depends.', pt: 'Depende.', lugar: 'na biblioteca' },
  { en: "That makes sense.", pt: 'Faz sentido.', lugar: 'no laboratório' },
  { en: "I'm not sure.", pt: 'Não tenho certeza.', lugar: 'no mercado' },
  { en: 'Could you say that again?', pt: 'Pode repetir?', lugar: 'num show' },
  { en: "Let me think.", pt: 'Deixa eu pensar.', lugar: 'no alto de uma montanha' },
  { en: 'Sounds good!', pt: 'Parece ótimo! / Fechado!', lugar: 'na padaria' },
  { en: 'How was your day?', pt: 'Como foi o seu dia?', lugar: 'na casa da vizinha' },
  { en: "I'm into video games.", pt: 'Eu curto videogame.', lugar: 'numa loja de jogos' },
  { en: 'What do you mean?', pt: 'Como assim?', lugar: 'num museu' },
  { en: "I'll let you know.", pt: 'Eu te aviso.', lugar: 'no correio' },
  { en: 'Never mind.', pt: 'Deixa pra lá.', lugar: 'no parque' },
  { en: "I can't wait!", pt: 'Mal posso esperar!', lugar: 'num aeroporto' },
  { en: "It's up to you.", pt: 'Você que sabe. / Você decide.', lugar: 'num restaurante' },
  { en: 'Take your time.', pt: 'Sem pressa.', lugar: 'num jardim japonês' },
  { en: "I'm just looking, thanks.", pt: 'Só estou olhando, obrigado. (em loja)', lugar: 'numa feira' },
  { en: 'Can I get the check, please?', pt: 'A conta, por favor?', lugar: 'numa lanchonete' },
  { en: 'Same here.', pt: 'Eu também. / Comigo também.', lugar: 'na praia' },
  { en: 'My bad.', pt: 'Foi mal.', lugar: 'num campo de futebol' },
  { en: "What's up?", pt: 'E aí? Tudo certo?', lugar: 'na esquina' },
  { en: "I'm running late.", pt: 'Tô atrasado.', lugar: 'num ponto de ônibus' },
  { en: 'Good luck!', pt: 'Boa sorte!', lugar: 'num estádio' },
  { en: 'Have fun!', pt: 'Divirta-se!', lugar: 'num parque de diversões' },
  { en: "I'm kind of tired.", pt: 'Tô meio cansado.', lugar: 'numa rede no quintal' },
  { en: 'Do you want to hang out?', pt: 'Quer sair / ficar junto?', lugar: 'no cinema' },
  { en: 'That was close!', pt: 'Foi por pouco!', lugar: 'numa ponte' },
  { en: 'Keep it up!', pt: 'Continua assim!', lugar: 'numa academia' },
  { en: "I'm good, thanks. And you?", pt: 'Tô bem, obrigado. E você?', lugar: 'num café' },
  { en: 'See you tomorrow!', pt: 'Até amanhã!', lugar: 'na porta de casa' }
];

// Skins: cor do corpo do Torrão (filtro no desenho), liberadas com pontos
CF.SKINS = [
  { id: 'terra', nome: 'Terra', pts: 0, filtro: '' },
  { id: 'argila', nome: 'Argila rosa', pts: 250, filtro: 'hue-rotate(-25deg) saturate(1.5) brightness(1.08)' },
  { id: 'musgo', nome: 'Musgo', pts: 600, filtro: 'hue-rotate(55deg) saturate(1.3)' },
  { id: 'cristal', nome: 'Cristal', pts: 1100, filtro: 'hue-rotate(160deg) saturate(1.6) brightness(1.1)' },
  { id: 'lavanda', nome: 'Lavanda', pts: 1600, filtro: 'hue-rotate(230deg) saturate(1.4) brightness(1.08)' },
  { id: 'dourado', nome: 'Dourado', pts: 2200, filtro: 'sepia(.6) saturate(2.6) hue-rotate(-12deg) brightness(1.12)' },
  { id: 'noturno', nome: 'Noturno', pts: 2800, filtro: 'saturate(.4) brightness(.72) contrast(1.25)' },
  { id: 'arcoiris', nome: 'Arco-íris', pts: 3400, filtro: 'arcoiris' }
];

// Cores das roupas (filtro só na peça)
CF.CORES_ROUPA = [
  { id: 'original', nome: 'Original', filtro: '' },
  { id: 'rosa', nome: 'Rosa', filtro: 'hue-rotate(-60deg) saturate(1.4)' },
  { id: 'azul', nome: 'Azul', filtro: 'hue-rotate(170deg) saturate(1.3)' },
  { id: 'verde', nome: 'Verde', filtro: 'hue-rotate(80deg) saturate(1.3)' },
  { id: 'roxo', nome: 'Roxo', filtro: 'hue-rotate(240deg) saturate(1.3)' }
];

// A Toca do Torrão: móveis comprados com laranjas, cada um num lugar do quarto
CF.LUGARES_TOCA = ['teto', 'parede_e', 'parede_d', 'fundo_e', 'fundo_d', 'chao', 'frente_e', 'frente_d'];
CF.NOME_LUGAR = { teto: 'Teto', parede_e: 'Parede (esquerda)', parede_d: 'Parede (direita)', fundo_e: 'Canto esquerdo',
  fundo_d: 'Canto direito', chao: 'Chão', frente_e: 'Frente (esquerda)', frente_d: 'Frente (direita)' };
// Quartos: mesma planta (janela, paredes e chão no mesmo lugar), só muda o tema. Trocar é de graça.
// janela = onde fica o vidro (x, y, largura, altura em % do quarto), medido por tools/fatiar9.py
CF.QUARTOS = [
  { id: 'listras', nome: 'Listrado', img: 'assets/toca/quarto.jpg', janela: [30.67, 17.0, 38.67, 29.08] },
  { id: 'toca', nome: 'Toca de raízes', img: 'assets/toca/quarto_toca.jpg', janela: [30.78, 17.0, 38.56, 28.92] },
  { id: 'cabana', nome: 'Cabana de madeira', img: 'assets/toca/quarto_cabana.jpg', janela: [30.78, 16.83, 38.33, 27.92] },
  { id: 'celeste', nome: 'Quarto celeste', img: 'assets/toca/quarto_celeste.jpg', janela: [30.78, 16.92, 38.44, 29.0] }
];
CF.NOME_LUGAR_CURTO = { teto: 'Teto', parede_e: 'Parede esq.', parede_d: 'Parede dir.', fundo_e: 'Canto esq.',
  fundo_d: 'Canto dir.', chao: 'Chão', frente_e: 'Frente esq.', frente_d: 'Frente dir.' };
// larg = largura do móvel em % do quarto (o lugar dá a posição; cada peça tem a sua escala)
CF.MOVEIS = [
  { id: 'tapete_redondo', nome: 'Tapete redondo', lugar: 'chao', preco: 4, larg: 62 },
  { id: 'tapete_verde', nome: 'Tapete de franjas', lugar: 'chao', preco: 4, larg: 62 },
  { id: 'luzinhas', nome: 'Varal de luzinhas', lugar: 'teto', preco: 5, larg: 56 },
  { id: 'guarda_chuva', nome: 'Guarda-chuva de flores', lugar: 'teto', preco: 6, larg: 24 },
  { id: 'quadro', nome: 'Quadro da laranja', lugar: 'parede_e', preco: 3, larg: 14 },
  { id: 'relogio', nome: 'Relógio', lugar: 'parede_d', preco: 3, larg: 14 },
  { id: 'prateleira', nome: 'Prateleira de potinhos', lugar: 'parede_d', preco: 4, larg: 17 },
  { id: 'estante', nome: 'Estante de livros', lugar: 'fundo_e', preco: 8, larg: 30 },
  { id: 'cama', nome: 'Cama de folhas', lugar: 'fundo_d', preco: 10, larg: 32 },
  { id: 'aquario', nome: 'Aquário', lugar: 'fundo_d', preco: 9, larg: 22 },
  { id: 'luminaria', nome: 'Luminária', lugar: 'frente_e', preco: 5, larg: 18 },
  { id: 'planta', nome: 'Planta no vaso', lugar: 'frente_e', preco: 4, larg: 22 },
  { id: 'cacto', nome: 'Cacto', lugar: 'frente_e', preco: 3, larg: 15 },
  { id: 'pufe', nome: 'Pufe', lugar: 'frente_d', preco: 6, larg: 22 },
  { id: 'mesinha', nome: 'Mesinha com chá', lugar: 'frente_d', preco: 6, larg: 22 },
  { id: 'radio', nome: 'Rádio', lugar: 'frente_d', preco: 7, larg: 18 },
  // novos (13/10/2026)
  { id: 'lustre', nome: 'Lustre de folhas', lugar: 'teto', preco: 7, larg: 22 },
  { id: 'espelho', nome: 'Espelho de flores', lugar: 'parede_e', preco: 5, larg: 15 },
  { id: 'mapa', nome: 'Mapa-múndi', lugar: 'parede_e', preco: 4, larg: 19 },
  { id: 'poltrona', nome: 'Poltrona', lugar: 'fundo_e', preco: 9, larg: 28 },
  { id: 'escrivaninha', nome: 'Escrivaninha', lugar: 'fundo_e', preco: 8, larg: 28 },
  { id: 'tapete_retalhos', nome: 'Tapete de retalhos', lugar: 'chao', preco: 5, larg: 60 },
  { id: 'livros', nome: 'Pilha de livros', lugar: 'frente_e', preco: 3, larg: 17 },
  { id: 'cesto', nome: 'Cesto de laranjas', lugar: 'frente_d', preco: 5, larg: 22 },
  { id: 'violao', nome: 'Violão', lugar: 'fundo_d', preco: 8, larg: 14 }
];

// Dias de intervalo depois de acertar, por estágio da planta
CF.INTERVALOS = [0, 1, 3, 7, 14, 30, 60];
CF.ESTAGIO_MAX = 6;
CF.ESTAGIO_DOMINADO = 4;

// Semanas 4 a 12 (dias 22 a 84): o plano vai até 3 meses (meta: 2 meses, com 1 de folga).
// Cada semana: 5 dias de tema (com 1 estrutura de gramática em foco), 1 desafio (4/3/2 + pessoa de verdade) e 1 dia leve.
// Carta "ouvir" (5º item = 'ouvir'): o app fala uma pergunta em inglês e você responde em inglês, sem passar pelo português.
window.CF = window.CF || {};

(function () {
  const O = 'ouvir';
  const N = (n, tema, blocos, gemini, ia, cartas) => ({ n, tema, blocos, video: { gemini }, ia, cartas });
  const DESAFIO = (n, semana, historia, ia) => ({
    n, tipo: 'desafio', semanaTeste: semana, tema: 'Desafio da semana ' + semana,
    aprender: `4/3/2: conta a mesma história em voz alta 3 vezes seguidas: primeiro em 4 minutos, depois em 3, depois em 2 (pode gravar no celular ou contar pra IA). História: ${historia}`,
    ia
  });
  const LEVE = (n, extra) => Object.assign({ n, tipo: 'leve', tema: 'Dia leve' }, extra || {});

  CF.GRAMATICA = {
    1: 'Perguntas com do/does e what time',
    2: 'Passado simples e conectores de história',
    3: 'Pedir, oferecer e concordar',
    4: 'Present perfect: Have you ever...? / I\'ve never...',
    5: 'Comparar: better than, the best, as... as',
    6: 'Futuro com "if": If it rains, I\'ll...',
    7: 'Modais: should, have to, might, can',
    8: 'Passado contínuo e used to',
    9: 'Perguntas educadas: Could you tell me...?',
    10: 'Opinião com nuance e phrasal verbs',
    11: 'Inglês de entrevista',
    12: 'Revisão geral'
  };

  const MAIS = [
    // ---------- Semana 4: present perfect ----------
    N(22, 'Já fez isso?', ['Have you ever...?', "I've never...", "I've ... before", 'Yeah, once'],
      'present perfect em inglês: have you ever, I have never', 'Ask me about things I have and have never done in my life.', [
        ['d22a', 'Pergunta se a pessoa já foi pra fora do país.', ['Have you ever been abroad?', 'Have you ever traveled abroad?', 'Have you ever been to another country?']],
        ['d22b', 'Diz que você nunca andou de avião.', ["I've never been on a plane.", "I've never flown before.", "I've never taken a plane."]],
        ['d22c', 'Pergunta se a pessoa já jogou League of Legends.', ['Have you ever played League of Legends?', 'Have you ever played LoL?']],
        ['d22d', 'Diz que você já viu esse filme duas vezes.', ["I've seen this movie twice.", "I've already seen this movie twice."]],
        ['d22e', 'Have you ever eaten sushi?', ['Yes, I have. I love it.', "No, I haven't. I've never tried it.", 'Yeah, once. It was good.'], 'Responde com "Yes, I have" ou "No, I haven\'t" e fala mais uma frase.', O]
      ]),
    N(23, 'Viagens e lugares', ["I've been to...", "I'd like to visit...", "It's famous for...", 'How long were you there?'],
      'como falar de viagens e lugares em inglês', 'Talk with me about places I have been to and places I want to visit.', [
        ['d23a', 'Diz que você já foi pra São Paulo.', ["I've been to São Paulo.", "I've been to Sao Paulo."]],
        ['d23b', 'Diz que gostaria de visitar o Japão.', ["I'd like to visit Japan.", 'I would like to visit Japan.', "I'd love to visit Japan."]],
        ['d23c', 'Diz que a sua cidade é famosa pela comida.', ['My city is famous for its food.', 'My city is famous for the food.']],
        ['d23d', 'Pergunta quanto tempo a pessoa ficou lá.', ['How long were you there?', 'How long did you stay there?']],
        ['d23e', 'Where would you like to travel?', ["I'd like to go to Japan.", "I'd love to travel to Canada.", 'I want to visit Europe someday.'], '', O]
      ]),
    N(24, 'No restaurante', ['What do you recommend?', "I'll have...", 'Could we get the check?', "It's on me"],
      'inglês no restaurante: pedir, recomendar e pedir a conta', 'Pretend you are a waiter and I am ordering dinner.', [
        ['d24a', 'Pergunta pro garçom o que ele recomenda.', ['What do you recommend?', 'What would you recommend?']],
        ['d24b', 'Pede o hambúrguer: "vou querer o hambúrguer".', ["I'll have the burger.", "I'll have the hamburger.", 'Can I get the burger?']],
        ['d24c', 'Pede a conta.', ['Could we get the check, please?', 'Can we get the check, please?', 'Can I have the bill, please?']],
        ['d24d', 'Diz que é por sua conta (você paga).', ["It's on me.", "I'll pay.", "This one's on me."]],
        ['d24e', 'Are you ready to order?', ["Yes, I'll have the chicken, please.", 'Not yet, can we have a minute?', 'Yes, can I get a coffee and a sandwich?'], '', O]
      ]),
    N(25, 'Rotina e hábitos', ['I usually...', 'I always / never...', 'How often do you...?', 'Once a week'],
      'falar de rotina em inglês: usually, always, how often', 'Ask me about my daily routine and my habits.', [
        ['d25a', 'Diz que você normalmente acorda às 9.', ['I usually wake up at 9.', 'I usually get up at nine.']],
        ['d25b', 'Pergunta com que frequência a pessoa vai na academia.', ['How often do you go to the gym?', 'How often do you work out?']],
        ['d25c', 'Diz que você joga LoL quase todo dia.', ['I play LoL almost every day.', 'I play League almost every day.']],
        ['d25d', 'Diz que você nunca toma café da manhã.', ['I never have breakfast.', 'I never eat breakfast.']],
        ['d25e', 'What do you usually do on weekends?', ['I usually play games and hang out with friends.', 'I usually sleep late and watch series.', 'On weekends I usually relax at home.'], '', O]
      ]),
    N(26, 'Celular e tecnologia', ['My phone died', 'Can you send me...?', 'I need to charge...', 'It keeps crashing'],
      'inglês sobre celular, internet e tecnologia no dia a dia', 'Talk with me about technology problems I have every day.', [
        ['d26a', 'Diz que a bateria do seu celular acabou.', ['My phone died.', 'My phone is dead.', 'My battery died.']],
        ['d26b', 'Pede pra pessoa te mandar a foto.', ['Can you send me the photo?', 'Could you send me the picture?']],
        ['d26c', 'Diz que precisa carregar o celular.', ['I need to charge my phone.']],
        ['d26d', 'Diz que o jogo fica travando.', ['The game keeps crashing.', 'The game keeps freezing.']],
        ['d26e', "What's the wifi password?", ["It's on the back of the router.", "I don't know, let me check.", "It's written on that paper."], '', O]
      ]),
    DESAFIO(27, 4, 'a viagem ou o passeio mais legal que você já fez.', 'Ask me about my experiences: places, food and things I have never done.'),
    LEVE(28, { efset: true }),

    // ---------- Semana 5: comparar ----------
    N(29, 'Comparar coisas', ['...is bigger than...', '...is better than...', 'the best...', 'not as... as...'],
      'comparativo e superlativo em inglês na prática: better than, the best', 'Ask me to compare games, cities and food.', [
        ['d29a', 'Diz que esse jogo é melhor que aquele.', ['This game is better than that one.']],
        ['d29b', 'Diz que São Paulo é maior que a sua cidade.', ['São Paulo is bigger than my city.', 'Sao Paulo is bigger than my city.']],
        ['d29c', 'Diz que essa é a melhor pizza da cidade.', ['This is the best pizza in town.', 'This is the best pizza in the city.']],
        ['d29d', 'Diz que inglês não é tão difícil quanto parece.', ["English isn't as hard as it looks.", 'English is not as difficult as it seems.']],
        ['d29e', 'Which is better, cats or dogs?', ['I think dogs are better.', "Cats, because they're more independent.", 'It depends, but I prefer dogs.'], '', O]
      ]),
    N(30, 'Compras', ['Do you have this in...?', 'Can I try it on?', "It's too expensive", "I'm just looking"],
      'inglês para fazer compras em loja de roupa', 'Pretend you are a shop assistant in a clothing store.', [
        ['d30a', 'Pergunta se tem essa camiseta em tamanho M.', ['Do you have this shirt in medium?', 'Do you have this T-shirt in a medium?']],
        ['d30b', 'Pergunta se pode experimentar.', ['Can I try it on?', 'Could I try it on?']],
        ['d30c', 'Diz que está caro demais.', ["It's too expensive.", 'It is too expensive.']],
        ['d30d', 'O vendedor oferece ajuda. Diz que está só olhando.', ["I'm just looking, thanks.", "I'm just looking."]],
        ['d30e', 'Can I help you find something?', ["I'm just looking, thanks.", "Yes, I'm looking for a jacket.", 'Do you have this in black?'], '', O]
      ]),
    N(31, 'Séries e filmes', ["It's about...", "It's based on...", 'No spoilers!', 'You should watch...'],
      'como falar de séries e filmes em inglês', 'Talk with me about series and movies I like. Recommend me some.', [
        ['d31a', 'Diz que a série é sobre duas irmãs.', ["It's about two sisters.", 'The series is about two sisters.']],
        ['d31b', 'Diz que é baseada num jogo.', ["It's based on a game.", "It's based on a video game."]],
        ['d31c', 'Pede pra pessoa não dar spoiler.', ['No spoilers, please!', "Don't spoil it!"]],
        ['d31d', 'Recomenda: "você devia assistir Arcane".', ['You should watch Arcane.']],
        ['d31e', "What's your favorite series?", ['My favorite series is Arcane.', 'I really like Brooklyn Nine-Nine.', "Right now it's Arcane, it's amazing."], '', O]
      ]),
    N(32, 'Jogos competitivos', ['We won / We lost', 'My teammate...', "I'm stuck in...", 'Good game'],
      'vocabulário de games em inglês: gamer slang e expressões', 'Talk with me about my last ranked games in League of Legends.', [
        ['d32a', 'Diz que vocês ganharam por pouco.', ['We barely won.', 'It was a close win.', 'We won by a little.']],
        ['d32b', 'Diz que seu colega de time ficou AFK o jogo todo.', ['My teammate was AFK the whole game.']],
        ['d32c', 'Diz que você está preso no ouro.', ["I'm stuck in Gold.", "I'm hardstuck Gold."]],
        ['d32d', 'Diz que o outro time era mais forte.', ['The other team was stronger.', 'The enemy team was stronger.']],
        ['d32e', "What's your main in League?", ['My main is Yasuo.', 'I main support, usually Thresh.', 'I play mid, mostly Ahri.'], '', O]
      ]),
    N(33, 'Direções e transporte', ['How do I get to...?', 'Take the...', "It's next to...", 'Is it far from here?'],
      'pedir e dar direções em inglês, transporte público', 'Pretend I am a tourist asking you for directions in your city.', [
        ['d33a', 'Pergunta como chegar na estação.', ['How do I get to the station?', 'How can I get to the station?']],
        ['d33b', 'Diz pra pegar o metrô.', ['Take the subway.', 'Take the metro.']],
        ['d33c', 'Diz que fica do lado do banco.', ["It's next to the bank."]],
        ['d33d', 'Pergunta se é longe daqui.', ['Is it far from here?']],
        ['d33e', 'Excuse me, is there a pharmacy near here?', ["Yes, there's one around the corner.", "Sorry, I'm not from here.", 'Yes, go straight and turn left.'], '', O]
      ]),
    DESAFIO(34, 5, 'compara duas coisas que você conhece bem (dois jogos, duas cidades ou duas comidas) e diz qual é melhor e por quê.', 'Ask me to compare things and to explain my choices.'),
    LEVE(35),

    // ---------- Semana 6: futuro com if ----------
    N(36, 'Marcar com os amigos', ['Are you free on...?', 'How about...?', "Let's meet at...", 'Sounds good!'],
      'como marcar encontros e fazer planos com amigos em inglês', 'We are friends making plans for the weekend.', [
        ['d36a', 'Pergunta se a pessoa está livre no sábado.', ['Are you free on Saturday?']],
        ['d36b', 'Sugere: "que tal ir ao cinema?"', ['How about going to the movies?', 'What about going to the movies?', 'How about the movies?']],
        ['d36c', 'Diz: "vamos nos encontrar às 7 no shopping".', ["Let's meet at 7 at the mall.", "Let's meet at the mall at seven."]],
        ['d36d', 'Concorda com o plano: "fechou!"', ['Sounds good!', 'Deal!', 'Sounds great!']],
        ['d36e', 'Do you want to hang out this weekend?', ['Sure! What do you want to do?', "Yeah, I'm free on Sunday.", "I can't this weekend, maybe next week?"], '', O]
      ]),
    N(37, 'Se isso, então aquilo', ["If it rains, I'll...", "If I have time, I'll...", 'If you need help...', 'What will you do if...?'],
      'first conditional em inglês na prática: if + will', 'Ask me what I will do in different situations, using "if".', [
        ['d37a', 'Diz: "se chover, eu fico em casa".', ["If it rains, I'll stay home.", "If it rains, I'll stay at home."]],
        ['d37b', 'Diz: "se eu tiver tempo, eu te ligo".', ["If I have time, I'll call you."]],
        ['d37c', 'Diz: "se precisar de ajuda, me avisa".', ['If you need help, let me know.']],
        ['d37d', 'Pergunta o que a pessoa vai fazer se perder o ônibus.', ['What will you do if you miss the bus?']],
        ['d37e', "If it's sunny tomorrow, what will you do?", ["If it's sunny, I'll go to the beach.", "I'll go for a walk.", "I'll probably play outside with my friends."], '', O]
      ]),
    N(38, 'Sonhos e metas', ["I'd love to...", 'My goal is to...', 'One day I want to...', "I'm working on it"],
      'como falar de sonhos e metas em inglês', 'Ask me about my dreams and goals for the future.', [
        ['d38a', 'Diz que adoraria morar fora.', ["I'd love to live abroad.", 'I would love to live abroad.']],
        ['d38b', 'Diz que sua meta é falar inglês bem.', ['My goal is to speak English well.', 'My goal is to speak good English.']],
        ['d38c', 'Diz: "um dia eu quero lançar um jogo famoso".', ['One day I want to release a famous game.', 'One day I want to make a famous game.']],
        ['d38d', 'Diz que está trabalhando nisso.', ["I'm working on it."]],
        ['d38e', "What's your dream job?", ['My dream job is making games.', "I'd love to be a game developer.", 'I want to have my own game studio.'], '', O]
      ]),
    N(39, 'Combinar e remarcar', ['Something came up', 'Can we reschedule?', "I'm running late", 'No worries'],
      'como desmarcar, remarcar e avisar atraso em inglês', 'We had plans, but something came up. Let\'s reschedule.', [
        ['d39a', 'Diz que surgiu um imprevisto.', ['Something came up.']],
        ['d39b', 'Pergunta se dá pra remarcar.', ['Can we reschedule?', 'Could we reschedule?']],
        ['d39c', 'Avisa que vai chegar uns 10 minutos atrasado.', ["I'm running about 10 minutes late.", "I'll be 10 minutes late.", "I'm running 10 minutes late."]],
        ['d39d', 'A pessoa pede desculpa. Diz que não tem problema.', ['No worries.', 'No problem.', "Don't worry about it."]],
        ['d39e', 'Sorry, can we move it to tomorrow?', ['Sure, no problem.', 'Tomorrow works for me.', 'No worries, what time?'], '', O]
      ]),
    N(40, 'Clima e conversa fiada', ["It's freezing", "What's the weather like?", "It's so hot today", 'Nice day, huh?'],
      'small talk sobre o tempo em inglês', 'Make small talk with me about the weather and my day.', [
        ['d40a', 'Diz que está um frio de congelar.', ["It's freezing.", "It's freezing today."]],
        ['d40b', 'Pergunta como está o tempo aí.', ["What's the weather like there?", "How's the weather there?"]],
        ['d40c', 'Diz que hoje está muito quente.', ["It's so hot today.", "It's really hot today."]],
        ['d40d', 'Puxa assunto: "dia bonito, né?"', ['Nice day, huh?', "Beautiful day, isn't it?", 'Nice day, right?']],
        ['d40e', 'How was your day?', ['It was good, thanks. How about you?', 'Pretty busy, but good.', 'Kind of tiring, to be honest.'], '', O]
      ]),
    DESAFIO(41, 6, 'os seus planos pro próximo ano: o que você vai fazer se tudo der certo, e o que vai fazer se der errado.', 'Ask me about my plans and what I will do if things change.'),
    LEVE(42),

    // ---------- Semana 7: modais ----------
    N(43, 'Dar conselhos', ['You should...', "You shouldn't...", "If I were you, I'd...", "Why don't you...?"],
      'como dar conselhos em inglês: should, if I were you', 'Tell me your problems and I will give you advice. Then ask me for advice.', [
        ['d43a', 'Diz que a pessoa deveria descansar.', ['You should get some rest.', 'You should rest.']],
        ['d43b', 'Diz que ela não deveria jogar a noite toda.', ["You shouldn't play all night."]],
        ['d43c', 'Diz: "se eu fosse você, eu pediria ajuda".', ["If I were you, I'd ask for help.", 'If I were you, I would ask for help.']],
        ['d43d', 'Sugere: "por que você não fala com ele?"', ["Why don't you talk to him?"]],
        ['d43e', "I can't sleep at night. What should I do?", ['You should stop using your phone before bed.', "Why don't you try drinking some tea?", "If I were you, I'd go to bed earlier."], '', O]
      ]),
    N(44, 'Saúde e farmácia', ['I have a headache', 'I feel sick', 'I need something for...', 'How many times a day?'],
      'inglês na farmácia e no médico: sintomas e remédios', 'Pretend you are a pharmacist and I am not feeling well.', [
        ['d44a', 'Diz que está com dor de cabeça.', ['I have a headache.', "I've got a headache."]],
        ['d44b', 'Diz que não está se sentindo bem.', ["I don't feel well.", "I'm not feeling well.", 'I feel sick.']],
        ['d44c', 'Na farmácia: pede algo pra dor de garganta.', ['I need something for a sore throat.', 'Do you have something for a sore throat?']],
        ['d44d', 'Pergunta quantas vezes por dia tem que tomar.', ['How many times a day should I take it?', 'How many times a day do I take it?']],
        ['d44e', 'What are your symptoms?', ['I have a fever and a headache.', "My throat hurts and I'm coughing.", 'I feel dizzy and tired.'], '', O]
      ]),
    N(45, 'Regras e obrigações', ['You have to...', "You don't have to...", "You're not allowed to...", 'Do I need to...?'],
      'have to, must e not allowed em inglês na prática', 'Explain to me the rules of a place, then ask me about rules in Brazil.', [
        ['d45a', 'Diz que você tem que trabalhar amanhã.', ['I have to work tomorrow.']],
        ['d45b', 'Diz que a pessoa não precisa pagar.', ["You don't have to pay."]],
        ['d45c', 'Diz que não é permitido fumar aqui.', ["You're not allowed to smoke here.", 'Smoking is not allowed here.']],
        ['d45d', 'Pergunta se precisa de passaporte.', ['Do I need a passport?', 'Do I need my passport?']],
        ['d45e', 'Do I need to book in advance?', ['Yes, you have to book online.', "No, you don't have to.", "It's better to book, it gets busy."], '', O]
      ]),
    N(46, 'Pedir permissão', ['Is it okay if...?', 'Can I...?', 'Would it be possible to...?', 'Go ahead'],
      'como pedir permissão em inglês com educação', 'Pretend we are coworkers. I will ask you for permission to do things.', [
        ['d46a', 'Pergunta se tudo bem você abrir a janela.', ['Is it okay if I open the window?', 'Is it OK if I open the window?']],
        ['d46b', 'Pergunta se pode usar o banheiro.', ['Can I use the bathroom?', 'Can I use the restroom?', 'May I use the bathroom?']],
        ['d46c', 'Pergunta com educação se seria possível sair mais cedo.', ['Would it be possible to leave early?', 'Would it be possible to leave a bit earlier?']],
        ['d46d', 'Alguém pede permissão. Diz "pode, fica à vontade".', ['Go ahead.', 'Sure, go ahead.', 'Of course, go ahead.']],
        ['d46e', 'Do you mind if I sit here?', ['No, go ahead.', 'Not at all, sit down.', 'Sorry, someone is sitting there.'], '', O]
      ]),
    N(47, 'Possibilidades', ['It might...', 'Maybe...', "I'm not sure, but...", 'Probably'],
      'might, maybe e probably em inglês: falar de possibilidades', 'Ask me about my plans, and I will answer with maybe, might and probably.', [
        ['d47a', 'Diz que pode chover mais tarde.', ['It might rain later.']],
        ['d47b', 'Diz: "não tenho certeza, mas acho que ele vem".', ["I'm not sure, but I think he's coming.", "I'm not sure, but I think he'll come."]],
        ['d47c', 'Diz que talvez você jogue mais tarde.', ['I might play later.', "Maybe I'll play later."]],
        ['d47d', 'Diz que provavelmente vai estar cheio.', ["It'll probably be crowded.", 'It will probably be busy.']],
        ['d47e', 'Are you coming to the party tonight?', ["Maybe, I'm not sure yet.", 'I might, if I finish my work.', 'Probably, yeah.'], '', O]
      ]),
    DESAFIO(48, 7, 'um problema que um amigo teve e os conselhos que você daria pra ele.', 'Tell me about a problem and ask me for advice. Then I will ask you.'),
    LEVE(49),

    // ---------- Semana 8: passado contínuo e used to ----------
    N(50, 'O que você estava fazendo', ['I was ... when...', 'While I was...', 'What were you doing?', 'All of a sudden'],
      'past continuous em inglês: I was doing when', 'Ask me what I was doing at different moments yesterday.', [
        ['d50a', 'Diz: "eu estava jogando quando a internet caiu".', ['I was playing when the internet went down.', 'I was playing when the internet stopped working.']],
        ['d50b', 'Pergunta o que a pessoa estava fazendo ontem à noite.', ['What were you doing last night?']],
        ['d50c', 'Diz: "enquanto eu estava cozinhando, alguém tocou a campainha".', ['While I was cooking, someone rang the doorbell.']],
        ['d50d', 'Diz: "de repente, a luz acabou".', ['All of a sudden, the power went out.', 'Suddenly, the power went out.']],
        ['d50e', 'What were you doing when I called you?', ['I was taking a shower.', 'I was playing a game.', 'Sorry, I was sleeping.'], '', O]
      ]),
    N(51, 'Infância', ['I used to...', 'When I was a kid...', "I didn't use to...", 'Did you use to...?'],
      'used to em inglês: falar da infância', 'Ask me about my childhood.', [
        ['d51a', 'Diz que você jogava futebol quando era criança.', ['I used to play soccer when I was a kid.', 'When I was a kid, I used to play soccer.']],
        ['d51b', 'Diz que você não gostava de verdura.', ["I didn't use to like vegetables.", "I didn't like vegetables."]],
        ['d51c', 'Pergunta se a pessoa jogava videogame quando era criança.', ['Did you use to play video games as a kid?', 'Did you play video games when you were a kid?']],
        ['d51d', 'Diz que você morava em outra cidade.', ['I used to live in another city.']],
        ['d51e', 'What did you use to do as a kid?', ['I used to play outside all day.', 'I used to watch cartoons every morning.', 'I used to play video games with my brother.'], '', O]
      ]),
    N(52, 'Problemas que aconteceram', ['I lost my...', 'My flight was delayed', 'Someone stole...', 'It broke'],
      'como contar problemas e imprevistos em inglês', 'Ask me about bad things that happened to me and help me solve them.', [
        ['d52a', 'Diz que perdeu a carteira.', ['I lost my wallet.']],
        ['d52b', 'Diz que seu voo atrasou.', ['My flight was delayed.']],
        ['d52c', 'Diz que roubaram seu celular.', ['Someone stole my phone.', 'My phone was stolen.']],
        ['d52d', 'Diz que o carregador quebrou.', ['My charger broke.', 'The charger broke.']],
        ['d52e', 'What happened? You look upset.', ['I lost my keys.', 'My flight got cancelled.', 'I had a bad day at work.'], '', O]
      ]),
    N(53, 'Sentimentos', ["I'm so stressed", 'I was really nervous', "I'm excited about...", "I'm fed up with..."],
      'como falar de sentimentos e emoções em inglês', 'Ask me how I feel about different things in my life.', [
        ['d53a', 'Diz que está muito estressado.', ["I'm so stressed.", "I'm really stressed."]],
        ['d53b', 'Diz que estava muito nervoso na entrevista.', ['I was really nervous in the interview.', 'I was so nervous at the interview.']],
        ['d53c', 'Diz que está animado com a viagem.', ["I'm excited about the trip.", "I'm so excited about the trip."]],
        ['d53d', 'Diz que está de saco cheio do trânsito.', ["I'm fed up with the traffic.", "I'm sick of the traffic."]],
        ['d53e', 'How are you feeling today?', ['A bit tired, but okay.', "Great, I'm in a good mood.", 'Honestly, a little stressed.'], '', O]
      ]),
    N(54, 'Desculpas e explicações', ["Sorry, I didn't mean to...", 'It was my fault', "It won't happen again", 'Let me explain'],
      'como pedir desculpas e se explicar em inglês', 'Pretend I did something wrong and I need to apologize to you.', [
        ['d54a', 'Diz: "desculpa, não foi minha intenção".', ["Sorry, I didn't mean to.", "Sorry, I didn't mean it."]],
        ['d54b', 'Assume: "foi culpa minha".', ['It was my fault.']],
        ['d54c', 'Promete que não vai acontecer de novo.', ["It won't happen again."]],
        ['d54d', 'Diz: "deixa eu explicar".', ['Let me explain.']],
        ['d54e', 'Why are you so late?', ['Sorry, the traffic was terrible.', "My bus was late. It won't happen again.", 'Sorry, I overslept.'], '', O]
      ]),
    DESAFIO(55, 8, 'um dia em que deu tudo errado: o que você estava fazendo, o que aconteceu e como terminou.', 'Ask me to tell you about a day when everything went wrong.'),
    LEVE(56, { efset: true }),

    // ---------- Semana 9: perguntas educadas ----------
    N(57, 'Perguntas indiretas', ['Do you know where...?', 'Could you tell me...?', 'I was wondering if...', 'Do you happen to know...?'],
      'indirect questions em inglês: could you tell me, do you know where', 'Pretend I am a tourist asking you polite questions.', [
        ['d57a', 'Pergunta educadamente se a pessoa sabe onde fica o banheiro.', ['Do you know where the bathroom is?', 'Do you know where the restroom is?']],
        ['d57b', 'Pergunta educadamente que horas a loja fecha.', ['Could you tell me what time the store closes?', 'Could you tell me what time the shop closes?']],
        ['d57c', 'Diz: "eu estava pensando se você podia me ajudar".', ['I was wondering if you could help me.']],
        ['d57d', 'Pergunta se a pessoa por acaso sabe a senha do wifi.', ['Do you happen to know the wifi password?']],
        ['d57e', 'Could you tell me where the train station is?', ["Sure, it's two blocks that way.", "Sorry, I'm not from around here.", "Yes, go straight and it's on your left."], '', O]
      ]),
    N(58, 'Serviços e reservas', ["I'd like to book...", 'Is there a...?', 'How long does it take?', 'Is ... included?'],
      'como fazer reservas e perguntar sobre serviços em inglês', 'Pretend you work at a hotel front desk and I want to book things.', [
        ['d58a', 'Diz que gostaria de reservar uma mesa pra dois.', ["I'd like to book a table for two.", 'I would like to book a table for two.']],
        ['d58b', 'Pergunta se tem um mercado por perto.', ['Is there a supermarket nearby?', 'Is there a grocery store near here?']],
        ['d58c', 'Pergunta quanto tempo demora.', ['How long does it take?']],
        ['d58d', 'Pergunta se o café da manhã está incluso.', ['Is breakfast included?']],
        ['d58e', 'For how many people?', ['For two, please.', 'Just one.', 'A table for four, please.'], '', O]
      ]),
    N(59, 'No aeroporto', ["I'd like to check in", 'Window or aisle?', "Where's gate...?", 'I missed my flight'],
      'inglês no aeroporto: check-in, portão, imigração', 'Pretend you work at the airport check-in and I am traveling.', [
        ['d59a', 'Diz que quer fazer o check-in.', ["I'd like to check in, please.", 'I want to check in.']],
        ['d59b', 'Pede o assento da janela.', ['A window seat, please.', 'Can I have a window seat?']],
        ['d59c', 'Pergunta onde fica o portão 12.', ["Where's gate 12?", 'Where is gate twelve?']],
        ['d59d', 'Diz que perdeu o voo.', ['I missed my flight.']],
        ['d59e', 'Do you have any bags to check?', ['Yes, just one bag.', 'No, only carry-on.', 'Yes, two bags.'], '', O]
      ]),
    N(60, 'No hotel', ['I have a reservation', 'Could I get a late checkout?', "The wifi isn't working", 'Could I get an extra towel?'],
      'inglês no hotel: check-in, pedidos e problemas', 'Pretend you are a hotel receptionist. I am checking in and I have some requests.', [
        ['d60a', 'Diz que tem uma reserva no seu nome.', ['I have a reservation under my name.', 'I have a reservation.']],
        ['d60b', 'Pergunta se dá pra sair mais tarde do quarto.', ['Could I get a late checkout?', 'Can I have a late checkout?']],
        ['d60c', 'Diz que o wifi não está funcionando.', ["The wifi isn't working.", 'The wifi is not working.']],
        ['d60d', 'Pede uma toalha extra.', ['Could I get an extra towel?', 'Can I have an extra towel, please?']],
        ['d60e', 'Can I see your passport, please?', ['Sure, here you go.', 'Yes, here it is.', 'One second, let me find it.'], '', O]
      ]),
    N(61, 'Ligação e mensagens', ['Can you hear me?', "You're breaking up", "I'll call you back", 'Text me'],
      'inglês ao telefone e em videochamada', 'Pretend we are on a phone call with a bad connection.', [
        ['d61a', 'Pergunta se a pessoa está te ouvindo.', ['Can you hear me?']],
        ['d61b', 'Diz que a ligação está cortando.', ["You're breaking up.", 'The call is breaking up.']],
        ['d61c', 'Diz que liga de volta depois.', ["I'll call you back.", "I'll call you back later."]],
        ['d61d', 'Pede pra pessoa te mandar mensagem.', ['Text me.', 'Send me a message.']],
        ['d61e', 'Hey, is this a good time to talk?', ["Sure, what's up?", 'Not really, can I call you back?', 'Yeah, I have a few minutes.'], '', O]
      ]),
    DESAFIO(62, 9, 'uma viagem inteira, do aeroporto até o hotel, com um problema no meio e como você resolveu.', 'Pretend we are at an airport and then at a hotel. Create small problems for me to solve.'),
    LEVE(63),

    // ---------- Semana 10: opinião com nuance e phrasal verbs ----------
    N(64, 'Opinião com nuance', ["I'd say...", 'To be honest...', 'As far as I know...', "I'm not a fan, but..."],
      'como dar opinião em inglês de forma natural e educada', 'Ask me my opinion about technology, games and social media.', [
        ['d64a', 'Dá opinião: "eu diria que é um bom jogo".', ["I'd say it's a good game.", 'I would say it is a good game.']],
        ['d64b', 'Diz: "pra ser sincero, eu não gostei".', ["To be honest, I didn't like it.", "Honestly, I didn't like it."]],
        ['d64c', 'Diz: "até onde eu sei, a loja abre às 10".', ['As far as I know, the store opens at 10.']],
        ['d64d', 'Diz: "não sou fã, mas entendo por que as pessoas gostam".', ["I'm not a fan, but I get why people like it.", "I'm not a fan, but I understand why people like it."]],
        ['d64e', 'What do you think about social media?', ["I'd say it's useful, but it wastes a lot of time.", 'To be honest, I use it too much.', 'It depends on how you use it.'], '', O]
      ]),
    N(65, 'Concordar em parte', ['You have a point, but...', 'I see what you mean', "That's true, but...", "I'm not so sure"],
      'como concordar em parte e discordar com educação em inglês', 'Give me some strong opinions and let me partly agree or disagree.', [
        ['d65a', 'Diz que a pessoa tem razão, mas...', ['You have a point, but...']],
        ['d65b', 'Diz que entende o que ela quer dizer.', ['I see what you mean.']],
        ['d65c', 'Diz: "é verdade, mas é caro".', ["That's true, but it's expensive."]],
        ['d65d', 'Mostra dúvida: "não tenho tanta certeza".', ["I'm not so sure.", "I'm not so sure about that."]],
        ['d65e', 'I think video games are a waste of time.', ['I see what you mean, but they can teach a lot.', 'You have a point, but not all of them.', "I'm not so sure. Some games are really creative."], '', O]
      ]),
    N(66, 'Phrasal verbs 2', ['look forward to', 'run out of', 'get along with', 'find out'],
      'phrasal verbs intermediários: look forward to, run out of, get along with, find out', 'Talk with me about my week and my family, using phrasal verbs.', [
        ['d66a', 'Diz que está ansioso pela viagem (look forward to).', ["I'm looking forward to the trip."]],
        ['d66b', 'Diz que o leite acabou (run out of).', ['We ran out of milk.', "We've run out of milk."]],
        ['d66c', 'Diz que você se dá bem com seu irmão (get along with).', ['I get along with my brother.', 'I get along well with my brother.']],
        ['d66d', 'Diz que descobriu a verdade (find out).', ['I found out the truth.']],
        ['d66e', 'Do you get along with your neighbors?', ["Yes, they're really nice.", "Not really, they're too loud.", "I don't really know them."], '', O]
      ]),
    N(67, 'Explicar um processo', ['First...', 'After that...', 'Make sure you...', 'Once you...'],
      'como explicar passo a passo em inglês: first, then, make sure', 'Ask me to explain how to do things, step by step.', [
        ['d67a', 'Explica: "primeiro você baixa o app".', ['First, you download the app.']],
        ['d67b', 'Diz: "depois disso, você cria uma conta".', ['After that, you create an account.']],
        ['d67c', 'Diz: "não esquece de salvar".', ['Make sure you save it.', "Don't forget to save."]],
        ['d67d', 'Diz: "quando terminar, me avisa".', ['Once you finish, let me know.', 'When you finish, let me know.']],
        ['d67e', 'How do you make your favorite dish?', ['First, you boil the pasta. Then you add the sauce.', "It's easy: first you cut the vegetables...", 'Honestly, I just order it.'], '', O]
      ]),
    N(68, 'Notícias e curiosidades', ['Did you hear that...?', 'Apparently...', 'It turns out...', 'I read somewhere that...'],
      'como contar notícias e fofocas em inglês: apparently, it turns out', 'Tell me some interesting news and react to mine.', [
        ['d68a', 'Pergunta se a pessoa ficou sabendo que o jogo foi atualizado.', ['Did you hear that the game got updated?', 'Did you hear the game was updated?']],
        ['d68b', 'Diz: "pelo jeito, vai chover o fim de semana todo".', ["Apparently, it's going to rain all weekend."]],
        ['d68c', 'Diz: "no fim, ele estava certo".', ['It turns out he was right.']],
        ['d68d', 'Diz: "eu li em algum lugar que..."', ['I read somewhere that...']],
        ['d68e', 'Did you hear the news?', ['No, what happened?', "Yeah, I can't believe it.", 'Not yet, tell me!'], '', O]
      ]),
    DESAFIO(69, 10, 'a sua opinião sobre jogos: o que você ama, o que você mudaria e por quê.', 'Debate with me about video games. Disagree with some of my opinions.'),
    LEVE(70),

    // ---------- Semana 11: entrevista ----------
    N(71, 'Fale sobre você', ["I'm a ... from...", "I've been working on...", "I'm passionate about...", 'In my free time...'],
      'como responder tell me about yourself em entrevista em inglês', 'Pretend you are interviewing me for a job at a game studio. Start with "Tell me about yourself".', [
        ['d71a', 'Começa a se apresentar: "sou desenvolvedor de jogos do Brasil".', ["I'm a game developer from Brazil."]],
        ['d71b', 'Diz que é apaixonado por criar jogos.', ["I'm passionate about making games.", "I'm passionate about creating games."]],
        ['d71c', 'Diz que nos últimos meses tem trabalhado num jogo de celular.', ["For the past few months, I've been working on a mobile game.", "I've been working on a mobile game for the past few months."]],
        ['d71d', 'Diz: "no meu tempo livre, eu estudo inglês e jogo".', ['In my free time, I study English and play games.']],
        ['d71e', 'So, tell me a little about yourself.', ["Sure. I'm a game developer from Brazil.", 'I make mobile games and I love learning new things.', "Well, I'm from Brazil and I've been making games for a while."], '', O]
      ]),
    N(72, 'Experiência e projetos', ['I was responsible for...', 'I worked on...', 'I managed to...', 'The result was...'],
      'como falar de experiência e projetos numa entrevista em inglês', 'Interview me about my projects and my experience.', [
        ['d72a', 'Diz que foi responsável pela arte e pelo código.', ['I was responsible for the art and the code.']],
        ['d72b', 'Diz que trabalhou num jogo de plataforma.', ['I worked on a platform game.', 'I worked on a platformer.']],
        ['d72c', 'Diz que conseguiu lançar em duas semanas.', ['I managed to release it in two weeks.', 'I managed to launch it in two weeks.']],
        ['d72d', 'Diz: "o resultado foi um jogo com mais de 100 fases".', ['The result was a game with more than 100 levels.', 'The result was a game with over 100 levels.']],
        ['d72e', 'What project are you most proud of?', ["I'm most proud of Frutas Fujonas, my platform game.", 'A mobile game I made. It has over 100 levels.', 'Probably my last game, because I did everything myself.'], '', O]
      ]),
    N(73, 'Pontos fortes e fracos', ['One of my strengths is...', "I'm good at...", "I'm working on...", 'I tend to...'],
      'strengths and weaknesses: como responder em entrevista em inglês', 'Interview me about my strengths and weaknesses.', [
        ['d73a', 'Diz que um dos seus pontos fortes é aprender rápido.', ['One of my strengths is that I learn fast.', 'One of my strengths is learning quickly.']],
        ['d73b', 'Diz que você é bom em resolver problemas.', ["I'm good at solving problems.", "I'm good at problem solving."]],
        ['d73c', 'Diz que está melhorando seu inglês.', ["I'm working on my English.", "I'm improving my English."]],
        ['d73d', 'Diz que você costuma ser perfeccionista.', ['I tend to be a perfectionist.']],
        ['d73e', "What's your biggest weakness?", ["I tend to be a perfectionist, but I'm working on it.", "My English isn't perfect yet, but I'm improving every day.", "Sometimes I take on too much, so I'm learning to prioritize."], '', O]
      ]),
    N(74, 'Perguntas difíceis', ['Why should we hire you?', "I'm a fast learner", 'Where do you see yourself...?', "I'm looking for..."],
      'perguntas difíceis de entrevista em inglês e como responder', 'Ask me the hardest interview questions you know, one at a time.', [
        ['d74a', 'Diz que você aprende rápido e trabalha bem sozinho.', ["I'm a fast learner and I work well on my own.", 'I learn fast and I work well alone.']],
        ['d74b', 'Diz: "em cinco anos, eu me vejo liderando um time".', ['In five years, I see myself leading a team.']],
        ['d74c', 'Diz que está procurando um lugar onde possa crescer.', ["I'm looking for a place where I can grow."]],
        ['d74d', 'Pede um momento pra pensar.', ['Let me think about that for a second.', 'Give me a second to think.']],
        ['d74e', 'Why should we hire you?', ["Because I learn fast and I've already built complete games on my own.", 'I bring creativity and I deliver results quickly.', "I'm passionate about this and I have real experience making games."], '', O]
      ]),
    N(75, 'Perguntar pro entrevistador', ['What does a typical day look like?', 'What are the next steps?', 'Is there room to grow?', 'Thank you for your time'],
      'perguntas para fazer ao entrevistador no fim da entrevista em inglês', 'At the end of the interview, let me ask you questions about the job.', [
        ['d75a', 'Pergunta como é um dia normal no trabalho.', ['What does a typical day look like?']],
        ['d75b', 'Pergunta quais são os próximos passos.', ['What are the next steps?']],
        ['d75c', 'Pergunta se tem espaço pra crescer na empresa.', ['Is there room to grow in the company?', 'Is there room for growth?']],
        ['d75d', 'Agradece pelo tempo da pessoa.', ['Thank you for your time.', 'Thanks for your time.']],
        ['d75e', 'Do you have any questions for us?', ['Yes, what does a typical day look like?', 'What are the next steps in the process?', 'Yes, how big is the team?'], '', O]
      ]),
    Object.assign(DESAFIO(76, 11, 'responde "Tell me about yourself" como se fosse numa entrevista de verdade.',
      'Do a full job interview with me for a game developer position, from "Tell me about yourself" to "Do you have any questions?". At the end, give me feedback.'),
      { tema: 'Desafio: entrevista completa' }),
    LEVE(77),

    // ---------- Semana 12: revisão geral ----------
    N(78, 'Revisão: perguntas rápidas', ['Do you have...?', 'Have you ever...?', 'How often...?', 'Could you tell me...?'],
      'revisão de perguntas em inglês: do, have you ever, how often', 'Ask me quick questions about everything, one after another, and make me ask you too.', [
        ['d78a', 'Pergunta se a pessoa já foi ao Canadá.', ['Have you ever been to Canada?']],
        ['d78b', 'Pergunta com que frequência ela viaja.', ['How often do you travel?']],
        ['d78c', 'Pergunta o que mais ela tem pra fazer hoje.', ['What else do you have to do today?']],
        ['d78d', 'Pergunta educadamente se ela sabe que horas são.', ['Do you know what time it is?', 'Could you tell me what time it is?']],
        ['d78e', 'Have you been studying English for long?', ['For about three months now.', 'Not long, but I study every day.', 'I started a few months ago.'], '', O]
      ]),
    N(79, 'Revisão: contar histórias', ['So, the other day...', 'I was ... when...', 'It turns out...', 'In the end...'],
      'storytelling em inglês: como contar histórias de forma natural', 'Ask me to tell you three short stories from my life and react to them.', [
        ['d79a', 'Começa: "então, outro dia eu estava voltando pra casa quando..."', ['So, the other day I was going home when...', 'So, the other day I was coming home when...']],
        ['d79b', 'Diz: "no fim, era só um gato".', ['It turns out it was just a cat.', 'In the end, it was just a cat.']],
        ['d79c', 'Diz: "eu fiquei tão assustado".', ['I was so scared.']],
        ['d79d', 'Diz: "a gente riu muito depois".', ['We laughed a lot afterwards.', 'We laughed a lot after that.']],
        ['d79e', "What's the funniest thing that happened to you this year?", ['So, once I was playing online and...', 'Hmm, let me think... one day my cat...', 'Probably when I fell asleep during a game.'], '', O]
      ]),
    N(80, 'Revisão: viagem', ["I'd like...", "Where's...?", 'Could I get...?', "There's a problem with..."],
      'revisão de inglês para viagem: hotel, táxi, dinheiro', 'Take me on a full trip: taxi, hotel, restaurant and a shop, with small problems.', [
        ['d80a', 'No hotel: diz que tem um problema com o chuveiro.', ["There's a problem with the shower.", "The shower isn't working."]],
        ['d80b', 'Pede um táxi pro aeroporto.', ["I'd like a taxi to the airport, please.", 'Could you call me a taxi to the airport?']],
        ['d80c', 'Pergunta onde pode trocar dinheiro.', ['Where can I exchange money?']],
        ['d80d', 'Pergunta se aceitam cartão.', ['Do you take cards?', 'Do you accept credit cards?']],
        ['d80e', 'Cash or card?', ['Card, please.', 'Cash.', 'Can I pay by card?'], '', O]
      ]),
    N(81, 'Revisão: opinião e debate', ['I think...', 'I see your point, but...', 'To be honest...', 'It depends'],
      'revisão de opinião e debate em inglês', 'Debate with me about three topics. Push back on my opinions.', [
        ['d81a', 'Diz: "pra ser sincero, eu prefiro jogar sozinho".', ['To be honest, I prefer playing alone.', 'Honestly, I prefer to play alone.']],
        ['d81b', 'Discorda com educação: "entendo, mas não concordo".', ['I see your point, but I disagree.', "I get it, but I don't agree."]],
        ['d81c', 'Diz que depende do dia.', ['It depends on the day.']],
        ['d81d', 'Diz que concorda totalmente.', ['I totally agree.', 'I completely agree.']],
        ['d81e', 'Is it better to study alone or in a group?', ['I think alone, because I can go at my own pace.', 'It depends, but I prefer groups.', 'To be honest, a mix of both.'], '', O]
      ]),
    N(82, 'Revisão: falar de você', ["I'm...", "I've been ... for...", 'I used to..., but now...', 'My goal is...'],
      'como falar de você e do seu progresso em inglês', 'Ask me how my life and my English changed in the last three months.', [
        ['d82a', 'Diz que antes você travava pra falar inglês, mas agora consegue conversar.', ['I used to freeze when speaking English, but now I can have a conversation.', 'I used to get stuck speaking English, but now I can talk.']],
        ['d82b', 'Diz que estuda inglês há três meses.', ["I've been studying English for three months."]],
        ['d82c', 'Diz que sua próxima meta é ser fluente.', ['My next goal is to become fluent.', 'My next goal is to be fluent.']],
        ['d82d', 'Diz que está orgulhoso do seu progresso.', ["I'm proud of my progress."]],
        ['d82e', 'How has your English changed in the last three months?', ['A lot! Now I can actually have conversations.', "I'm much more confident speaking.", 'I understand way more than before.'], '', O]
      ]),
    Object.assign(DESAFIO(83, 12, 'a sua jornada aprendendo inglês: como era antes, o que você fez e como está agora.',
      'Have a 30 minute conversation with me about anything. Do not let me switch to Portuguese.'),
      { tema: 'Desafio final: 30 minutos', pessoa30: true }),
    { n: 84, tipo: 'chefao', tema: 'Chefão final', efset: true,
      ia: 'This is my final test after three months. Have a 20 minute conversation with me about my life, my work, my plans and my opinions. Do not let me switch to Portuguese.' }
  ];

  CF.DIAS.push(...MAIS);

  // o teste de nível no começo também
  CF.DIAS[0].efset = true;

  // reconstrói o índice de cartas com os dias novos
  CF.TODAS_CARTAS = {};
  CF.DIAS.forEach(d => (d.cartas || []).forEach(c => {
    CF.TODAS_CARTAS[c[0]] = { id: c[0], dia: d.n, pt: c[1], en: c[2], dica: c[3] || '', tipo: c[4] || 'traduzir' };
  }));
})();

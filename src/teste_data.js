// Banco de questões do teste de nível (CEFR A1 a C1). Cada questão tem o nível que ela mede.
window.CF = window.CF || {};
CF.TESTE_NIVEL = {
  vocab: [
    { n: 'A1', p: 'Qual é a palavra em inglês para "cozinha"?', op: ['chicken', 'kitchen', 'kitten', 'cushion'], c: 1 },
    { n: 'A1', p: 'Complete: I drink coffee every ___.', op: ['yesterday', 'tomorrow', 'morning', 'soon'], c: 2 },
    { n: 'A1', p: 'Qual é o oposto de "cheap"?', op: ['easy', 'small', 'new', 'expensive'], c: 3 },

    { n: 'A2', p: 'Na porta está escrito "empurre". Como se diz isso em inglês?', op: ['push', 'pull', 'press', 'pass'], c: 0 },
    { n: 'A2', p: 'Complete: Can you ___ me a favor?', op: ['make', 'give', 'take', 'do'], c: 3 },
    { n: 'A2', p: 'Complete: She was so ___ after a twelve-hour shift that she fell asleep on the bus.', op: ['tiring', 'exhausted', 'exciting', 'relaxing'], c: 1 },

    { n: 'B1', p: 'Complete: We\'ve ___ milk. Can you buy some on your way home?', op: ['run into', 'run over', 'run out of', 'run away'], c: 2 },
    { n: 'B1', p: 'Complete: Could you ___ the kids while I go to the store?', op: ['look after', 'look for', 'look up', 'look into'], c: 0 },
    { n: 'B1', p: '"Actually, I\'m from Recife, not Salvador." Aqui, actually significa:', op: ['atualmente', 'eventualmente', 'ultimamente', 'na verdade'], c: 3 },

    { n: 'B2', p: 'Complete: I ___ to finish the report by Friday.', op: ['pretend', 'intend', 'attend', 'extend'], c: 1 },
    { n: 'B2', p: 'Complete: I can\'t ___ the noise from my neighbors anymore.', op: ['put off', 'come up with', 'put up with', 'put away'], c: 2 },
    { n: 'B2', p: 'Complete: We had ___ rain all night, and some streets flooded.', op: ['heavy', 'strong', 'big', 'thick'], c: 0 },

    { n: 'C1', p: '"My uncle pulled some strings to get me the job." Aqui, pulled some strings significa:', op: ['desistiu de ajudar', 'usou seus contatos influentes', 'fez uma brincadeira comigo', 'trabalhou mais horas'], c: 1 },
    { n: 'C1', p: 'Complete: Her explanation was so ___ that nobody in the meeting understood it.', op: ['concise', 'candid', 'compelling', 'convoluted'], c: 3 },
    { n: 'C1', p: 'Complete: After months of delays, the project finally got off the ___.', op: ['floor', 'earth', 'ground', 'land'], c: 2 }
  ],

  gramatica: [
    { n: 'A1', p: 'I ___ 30 years old.', op: ['have', 'am', 'has', 'do'], c: 1 },
    { n: 'A1', p: 'Where ___ your brother work?', op: ['do', 'is', 'are', 'does'], c: 3 },
    { n: 'A1', p: 'People in my city ___ very friendly.', op: ['are', 'is', 'was', 'has'], c: 0 },

    { n: 'A2', p: 'Look! It ___ outside. Take an umbrella.', op: ['rains', 'rained', 'is raining', 'has rain'], c: 2 },
    { n: 'A2', p: 'Last summer we ___ to Bahia by bus.', op: ['went', 'go', 'goed', 'have gone'], c: 0 },
    { n: 'A2', p: 'My sister is ___ than me.', op: ['more tall', 'taller', 'tallest', 'more taller'], c: 1 },
    { n: 'A2', p: 'Tomorrow I ___ my grandmother.', op: ['going to visit', 'am going to visit', 'will to visit', 'am going visit'], c: 1 },

    { n: 'B1', p: 'I ___ in São Paulo since 2019.', op: ['live', 'am living', 'have lived', 'lived'], c: 2 },
    { n: 'B1', p: 'If it ___ tomorrow, we will cancel the picnic.', op: ['rains', 'will rain', 'would rain', 'rained'], c: 0 },
    { n: 'B1', p: 'You ___ wear a seatbelt in the car. It\'s the law.', op: ['might', 'would', 'could', 'must'], c: 3 },
    { n: 'B1', p: 'That\'s the man ___ dog bit my son.', op: ['who', 'which', 'whose', 'that'], c: 2 },

    { n: 'B2', p: 'If I ___ about the traffic, I would have left earlier.', op: ['knew', 'had known', 'have known', 'would know'], c: 1 },
    { n: 'B2', p: 'This bridge ___ in 1974.', op: ['was built', 'built', 'has built', 'was building'], c: 0 },
    { n: 'B2', p: 'Yesterday Ana ___ me that she had found a new job.', op: ['said', 'spoke', 'explained', 'told'], c: 3 },
    { n: 'B2', p: 'When I moved to London, it took me months to get used to ___ on the left.', op: ['drive', 'driving', 'drove', 'have driven'], c: 1 },

    { n: 'C1', p: 'Rarely ___ such a beautiful sunset.', op: ['I have seen', 'did I saw', 'have I seen', 'I saw'], c: 2 },
    { n: 'C1', p: 'If I had studied medicine, I ___ a doctor now.', op: ['would be', 'would have been', 'will be', 'had been'], c: 0 },
    { n: 'C1', p: 'If only I ___ to her advice! Now it\'s too late.', op: ['listened', 'would listen', 'have listened', 'had listened'], c: 3 }
  ],

  leitura: [
    {
      n: 'A2',
      titulo: 'Mensagem de uma colega de casa',
      texto: 'Hi Lucas, I\'m going to my parents\' house this weekend, so I won\'t be home until Sunday night. Can you water the plants on Saturday? They\'re on the balcony, not in the kitchen. Also, the internet bill arrived today. It\'s on the table. I already paid my half, so you only need to pay yours by Friday. There\'s some pizza in the fridge if you\'re hungry. Thanks! Marina',
      perguntas: [
        { p: 'Onde estão as plantas?', op: ['Na cozinha', 'Na sala', 'Na varanda', 'Na mesa'], c: 2 },
        { p: 'Por que Marina escreveu a mensagem?', op: ['Para convidar Lucas para viajar', 'Porque vai passar o fim de semana fora', 'Porque está doente', 'Para reclamar da conta de internet'], c: 1 },
        { p: 'No texto, "my half" quer dizer:', op: ['a primeira parcela', 'o valor total', 'uma multa', 'a minha metade'], c: 3 }
      ]
    },
    {
      n: 'B1',
      titulo: 'Blog: meu primeiro mês de bicicleta',
      texto: 'Last month I decided to stop driving to work and start cycling instead. My office is only eight kilometers from my apartment, but traffic is so bad that the drive often took forty minutes. On my bike, it takes about twenty-five. The first week was hard. My legs hurt, and one morning I got caught in heavy rain without a jacket. But by the third week, I was enjoying it. I feel more awake when I arrive, and I\'ve saved a lot of money on gas and parking. The only downside is that there are no showers at my office, so on hot days I have to bring a change of clothes. I\'m not going back to my car anytime soon.',
      perguntas: [
        { p: 'Quanto tempo o autor leva para ir ao trabalho de bicicleta?', op: ['Cerca de vinte e cinco minutos', 'Oito minutos', 'Quarenta minutos', 'Uma hora'], c: 0 },
        { p: 'Qual é a opinião geral do autor sobre a mudança?', op: ['Ele se arrepende e quer voltar a dirigir', 'Ele gostou desde o primeiro dia', 'Ele está satisfeito, apesar de alguns problemas', 'Ele só pedala quando não chove'], c: 2 },
        { p: 'No texto, "downside" significa:', op: ['descida', 'vantagem', 'atraso', 'desvantagem'], c: 3 }
      ]
    },
    {
      n: 'B2',
      titulo: 'Opinião: a semana de quatro dias',
      texto: 'A growing number of companies are experimenting with a four-day work week, and early results look promising. In several trials, employees reported lower stress and better sleep, while productivity stayed the same or even rose slightly. Supporters argue that people who are well rested simply work more efficiently, so the lost day is largely made up for. Critics, however, point out that the model does not suit every industry. Hospitals, schools, and restaurants cannot easily close for an extra day, and squeezing five days of work into four can lead to longer, more exhausting shifts. There is also a risk that the benefits will fade once the novelty wears off. In my view, the four-day week is worth testing, but it should not be treated as a one-size-fits-all solution. Each company needs to look honestly at its own workload before making the switch.',
      perguntas: [
        { p: 'Segundo o texto, o que aconteceu com a produtividade nos testes?', op: ['Caiu bastante', 'Ficou igual ou aumentou um pouco', 'Dobrou', 'Não foi medida'], c: 1 },
        { p: 'Qual é a posição do autor?', op: ['Todas as empresas devem adotar a semana de quatro dias', 'A ideia não funciona e deve ser abandonada', 'Vale a pena testar, mas cada empresa deve avaliar o seu caso', 'Só hospitais e escolas devem adotá-la'], c: 2 },
        { p: 'Em "once the novelty wears off", a expressão significa:', op: ['quando a novidade passar', 'quando as roupas se desgastarem', 'quando a lei mudar', 'quando o turno terminar'], c: 0 }
      ]
    }
  ],

  escuta: [
    { n: 'A1', audio: 'My name is Paula, and I am from Chile.', p: 'De onde Paula é?', op: ['Do Chile', 'Do Peru', 'Da Espanha', 'Da Colômbia'], c: 0 },
    { n: 'A1', audio: 'The bank opens at nine and closes at four.', p: 'A que horas o banco fecha?', op: ['Às nove', 'Às quatro', 'Às cinco', 'Às duas'], c: 1 },

    { n: 'A2', audio: 'Hi, this is Tom. I can\'t meet you at six today, so let\'s meet tomorrow at the same time.', p: 'Quando Tom quer se encontrar?', op: ['Hoje às seis', 'Hoje às sete', 'Amanhã às sete', 'Amanhã às seis'], c: 3 },
    { n: 'A2', audio: 'The pharmacy is not on this street. Go straight, turn left at the bank, and it is next to the bakery.', p: 'Onde fica a farmácia?', op: ['Ao lado da padaria', 'Nesta rua', 'Em frente ao banco', 'Ao lado do banco'], c: 0 },

    { n: 'B1', audio: 'Hi, this is Doctor Lima\'s office calling about your appointment on Thursday afternoon. Unfortunately, the doctor has to travel that day, so we need to move it to Friday morning. Please call us back to confirm.', p: 'Para quando a consulta foi remarcada?', op: ['Quinta de manhã', 'Quinta à tarde', 'Sexta de manhã', 'Sexta à tarde'], c: 2 },
    { n: 'B1', audio: 'Attention, passengers on flight 482 to Miami. Your departure gate has changed from gate 12 to gate 21. Boarding will now begin at ten fifteen, twenty minutes later than scheduled.', p: 'Qual é o novo portão de embarque?', op: ['Portão 21', 'Portão 12', 'Portão 20', 'Portão 15'], c: 0 },
    { n: 'B1', audio: 'I used to take the bus to work every day, but now I work from home three days a week. On the other two days, I usually ride my bike.', p: 'Hoje em dia, como ela vai ao trabalho nos dias presenciais?', op: ['De ônibus', 'De carro', 'A pé', 'De bicicleta'], c: 3 },

    { n: 'B2', audio: 'I was supposed to give the presentation today, but my boss decided to put it off until next week. Honestly, it\'s a weight off my shoulders, because I wasn\'t nearly as prepared as I wanted to be. Now I\'ve got a few more days to get my act together.', p: 'Como a pessoa se sente sobre o adiamento?', op: ['Irritada, porque já estava pronta', 'Aliviada, porque não estava bem preparada', 'Preocupada, porque o chefe ficou bravo', 'Indiferente, porque a apresentação foi cancelada'], c: 1 },
    { n: 'B2', audio: 'Our team was supposed to launch the new website on Monday, but we hit a snag with the payment system. We\'re not back to square one, but it\'ll probably take another week to iron out the problems. In the meantime, the old site will stay up.', p: 'Qual é a situação do projeto?', op: ['Foi cancelado e vai recomeçar do zero', 'Foi lançado na segunda-feira', 'Está atrasado cerca de uma semana por causa de um problema', 'O site antigo foi desligado'], c: 2 },

    { n: 'C1', audio: 'Thanks for sending over your proposal. I can see you put a lot of work into it, and some of the ideas are genuinely interesting. That said, the budget is well beyond what we discussed, and the timeline seems a bit optimistic. Perhaps we could set up a call to see where there might be some room for compromise.', p: 'O que a pessoa realmente quer dizer?', op: ['Aprovou a proposta sem mudanças', 'Rejeitou a proposta de forma definitiva', 'Não leu a proposta com atenção', 'Não aceita a proposta como está, mas quer negociar'], c: 3 }
  ],

  escrita: [
    { n: 'A2', tarefa: 'Descreva em inglês o seu fim de semana típico: o que você faz no sábado e no domingo, com quem e onde.', min: 30 },
    { n: 'B1', tarefa: 'Escreva um e-mail em inglês para um amigo convidando-o para algo (um show, um churrasco, uma viagem). Diga quando e onde vai ser, o que vocês vão fazer e peça uma resposta.', min: 60 },
    { n: 'B2', tarefa: 'Dê sua opinião em inglês sobre trabalhar de casa (home office). Apresente pelo menos duas razões e um exemplo da sua experiência ou de alguém que você conhece.', min: 100 }
  ],

  fala: [
    { n: 'A2', tarefa: 'Apresente-se em inglês: seu nome, de onde você é, seu trabalho ou estudo e o que gosta de fazer no tempo livre.', dica: 'Frases simples: My name is..., I work as..., In my free time I like...' },
    { n: 'B1', tarefa: 'Conte em inglês sobre uma viagem ou experiência marcante do seu passado.', dica: 'Diga onde e quando foi, o que aconteceu e como você se sentiu. Use o passado (went, saw, was).' },
    { n: 'B2', tarefa: 'Compare morar numa cidade grande e morar no campo. Escolha uma opção e defenda sua escolha.', dica: 'Fale de vantagens e desvantagens das duas, diga sua preferência e justifique com exemplos. Use conectivos como however e on the other hand.' }
  ]
};

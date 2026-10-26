# Torrão (pasta CapiFluente)

App de celular pra estudar inglês com o plano de 3 semanas do dono (`Desktop\Ingles\PLANO_INGLES.md`).
O Torrão é uma criatura original de terra e pedra; cada frase aprendida vira uma planta na horta.
A pasta se chama CapiFluente porque o primeiro bicho era uma capivara (o dono vetou: **nada de capivara**).

## Ideia do jogo
- **Hoje:** os 21 dias do plano. Cada passo dá pontos (aprender 10, ouvir 10, testar 5, conversar 10/20/30, Anki 5).
- **Horta:** cada frase do dia vira semente. Revisão espaçada (1, 3, 7, 14, 30, 60 dias): quando chega a hora, a planta murcha.
  Regar = responder a frase. Acertei cresce, Quase rega amanhã, Errei volta um estágio. Estágio 4+ = árvore com laranjas (frase dominada).
- **Laranjas:** cada acerto dá laranja; o Torrão come. Sem comer por 24h ele fica seco e emburrado.
- **Pontos** evoluem o Torrão (0 filhote, 350 jovem, 750 adulto, 1150 lendário) e marcam o catálogo de níveis.

## Código (sem build, HTML/CSS/JS puro)
- `src/data.js` conteúdo (dias, blocos, cartas de revisão, catálogo, fases)
- `src/logic.js` estado (localStorage `capifluente-v1` + cópia `-bak`), pontos, revisão espaçada, humor
- `src/app.js` telas (Horta, Hoje, Progresso), revisão em tela cheia, folha da planta, festa de evolução
- `src/som.js` sons feitos na hora (WebAudio) e voz em inglês (`Nativo.falar` no APK, speechSynthesis no navegador)
- `android/` WebView (`MainActivity.java`): serve `assets/www` em https://appassets.androidplatform.net, ponte `window.Nativo`
  (falar, copiar, abrir link), botão voltar chama `window.CF_voltar()`.

## Versão 2 (12/10/2026): "horta no céu de papel"
O dono achou a v1 genérica e o bicho duro. A v2:
- Céu de papel que muda com a hora (`assets/ceu/dia|tarde|noite.jpg`), laranjas-planeta, nuvens de papel passando (`src/papel.js`).
- Torrão numa ilha flutuante (`assets/ilha.png`, `CF.ILHA_TOPO` em `src/pet_meta.js`), animado quadro a quadro:
  `assets/pet/anim1..4.png` = 4x4 quadros (respira/pisca, pulo, comendo, seco), tocados por `src/pet.js`.
- Plantas em torrões flutuantes; aba Mapa = 21 ilhas ligadas por linha de costura; folhas de papel rasgado (`--rasgo-*`),
  botões de papel em camadas (`--corte-*`), tirinhas com fita. Fonte Fraunces nos títulos.
- Arte v2: `python tools/gerar_arte2.py` (Codex) e `python tools/fatiar2.py` (corte + pet_meta.js).
- Ao mudar CSS/JS, subir o `?v=N` no index.html (o navegador guarda a versão velha).
- Rodar a geração do Codex em primeiro plano ou acompanhar: se a sessão cair, o processo morre (o script pula o que já existe).
- Sem emoji em lugar nenhum (o dono pediu): só ícones desenhados.

## Versão 3 (12/10/2026): 3 meses, mundos e guarda-roupa
- Plano: 84 dias (`src/data.js` dias 1-21 + `src/data2.js` dias 22-84). Tipos de dia: normal, desafio (4/3/2), leve, chefão.
  `d.efset` adiciona o passo do teste de nível. Carta com 5º item `'ouvir'` = o app fala a pergunta em inglês e a pessoa responde.
- Mundos (`CF.MUNDOS`): Pomar do Céu (1-28, céu pela hora), Mar de Papel (29-56), Picos de Nuvem (57-84). Arte em `assets/mundo/`.
- Guarda-roupa (`CF.ROUPAS`): peças por pontos, 2 lugares (cabeça e rosto). As peças seguem os olhos de cada quadro
  (`src/roupa_meta.js`, gerado por `tools/fatiar3.py`); encaixe por fase em `src/vestir.js`, conferido com `python tools/ver_roupas.py`.
- Arte v3: `python tools/gerar_arte3.py` + `python tools/fatiar3.py`. Desligar o WSL depois (`wsl --shutdown`): ele pesa no PC do dono.

## Versão 4 (12/10/2026): mais cenários, skins, cores e a Toca
- 6 cenários escolhidos pelo dono (`CF.MUNDOS`): + Doceria Flutuante, Floresta de Cogumelos, Recife de Papel (o dono quer coisa colorida e divertida).
- Skins (`CF.SKINS`): filtro CSS só no corpo (`.pet .corpo`), liberadas por pontos; "arcoiris" é animado. Cores de roupa (`CF.CORES_ROUPA`): filtro só na peça.
- A Toca (aba nova): quarto `assets/toca/quarto.jpg` + 16 móveis (`CF.MOVEIS`) comprados com laranjas; 1 móvel por lugar (`CF.LUGARES_TOCA`),
  posições em `.m-<lugar>` no style.css. Estado: `estado.toca = { tem: [], poe: {lugar: id} }`.
- Passo opcional "Conversa com o amigo" (+15) em todo dia: não conta pra completar o dia nem pro máximo (`opcional: true`).
- Arte v4: `python tools/gerar_arte4.py` + `python tools/fatiar4.py`.

## Versão 5 (12/10/2026): mais fácil de entender, roupas que encaixam, Arco-Íris
- O dono achou que tinha informação demais: agora tem apresentação na 1ª vez (`estado.introVista`, rever em Ajustes),
  cartão "Seu próximo passo" na Horta e folha do dia enxuta (passo "Agora" destacado, detalhes em "Como fazer").
- Cenário padrão: Pomar do Céu (`CF.MUNDO_PADRAO`). O cenário Ilhas Arco-Íris foi APAGADO a pedido do dono (achou ruim e exagerado); a arte bruta continua em tools/art_src/v5_arco_*. Se o dono escolher outro, `estado.mundoManual = true`.
- O dono quer tela LIMPA: pouca informação por vez, nada de excesso de cor. Véu de papel por cima do cenário (`.ceu::after`), 3 nuvens, só laranjas e sede no topo da Horta, cartão do próximo passo visível sem rolar.
- Roupas: `CF.ANCORAS[fase][quadro] = [olhoX, olhoY, altoDaCabeca, cabecaEsq, cabecaDir, inclinacao]` (tools/fatiar3.py).
  O chapéu afunda na cabeça (`afunda`), tem a largura dela (`larg`), inclina com os olhos e tem sombrinha embaixo.
  Peças com `onde`: topo (chapéu), testa (faixa), olhos (óculos), boca (bigode). 21 peças no total.
- Arte v5: `python tools/gerar_arte5.py` + `python tools/fatiar5.py`; depois `python tools/fatiar3.py` e conferir com `python tools/ver_roupas.py`.

## GitHub e atualização (13/10/2026)
- Repositório PÚBLICO: https://github.com/Kaylan00/torrao (o dono pediu). Fora do git (.gitignore): builds do Android,
  `*.apk`, `tools/art_src/` (arte bruta), `tools/debug/`, `.claude/`. A assinatura do APK usa a chave debug do PC (fora do repo):
  gerar sempre neste PC pra o APK novo instalar por cima do antigo.
- Publicar versão nova: `python tools/build_apk.py` e depois `python tools/publicar.py "o que mudou"` (commit + push +
  Release v<versão> com o Torrao.apk). O build grava `src/versao.js` (CF.VERSAO); o app confere a última Release
  (no máximo a cada 6 h) e mostra "Versão nova!" no quarto com o botão de baixar. Ajustes têm "Conferir se tem versão nova".
- Commits com autor Kaylan00 <Kaylan00@users.noreply.github.com> (config local do repo).

## Versão 10 (13/10/2026): simples como o Finch, com cara de estudo e IA grátis
- O dono achou complexo demais. Agora: 3 metas por dia no quarto (Aprender, Praticar, Falar; dia leve = Revisar;
  chefão = Falar + Resultado; desafio = Praticar + Falar) com a "Energia do Torrão". Ouvir, Anki, EF SET e amigo viraram
  extras opcionais (CF.passos com `opcional`). Completou o dia: no dia seguinte o Torrão "volta do passeio" com um cartão
  (CF.CARTOES, 30 frases) e +3 laranjas (estado.surpresa). Dá pra "Adiantar o Dia N+1".
- Uma moeda só na tela: laranja. Cada passo dá laranja uma vez (CF.ganharPasso / LARANJAS_PASSO); os pontos ficam por baixo
  só pra evolução e nível (Progresso mostra % de crescimento, sem número de pontos).
- Aula dentro do app (abrirAprender): frases com áudio, uma por vez; terminar planta as frases (revisão começa amanhã).
  Praticar antes de aprender manda pra aula.
- IA grátis (src/ia.js, OpenRouter, modelo padrão `openrouter/free`): corrige a resposta escrita no teste/revisão
  (acertei/quase/errei + explicação; "Não concordo" volta pro manual), chat "Perguntar" (dúvidas, em português) e
  "Conversar" (inglês com dicas; 4 mensagens + "Terminei" completam a meta Falar). Chave colada pelo dono nos Ajustes,
  guardada só no aparelho (localStorage 'torrao-ia'), fora do backup. APK precisa de INTERNET (adicionado no manifesto).
- Telas de estudo com papel de parede listrado (não mais o céu de ilhas). Janela (cenário) foi pra dentro do Decorar;
  o botão redondo virou "Perguntar". Progresso enxuto (crescimento, 4 números, nível atual + próximo). Bugs: 0/21 -> /84.
- Revisão fina (13/10): resposta igualzinha não chama a IA; IA falhou = avalia sozinho com aviso; IA tenta `openrouter/free`
  e depois uma reserva (ia.js `RESERVAS`); aceita resposta sem apóstrofo (im, dont, cant). Depois de praticar pela tela
  inicial volta pro quarto (pela folha do dia, volta pra folha). Frases novas só pedem revisão no dia seguinte.
- PC: ABRIR_TORRAO.bat usa `tools/servidor.py` (manda o navegador não guardar cópia velha; antes a janela podia mostrar
  versão antiga). Testar sempre pelo navegador com estado limpo e com um save antigo (compatibilidade).

## Versão 9 (13/10/2026): 4 quartos e decorar do jeito do Pou
- `CF.QUARTOS` (data.js): Listrado, Toca de raízes, Cabana de madeira, Quarto celeste. Mesma planta (janela, paredes, chão
  no mesmo lugar), trocar é grátis (`estado.toca.quarto`). Arte: `python tools/gerar_arte9.py --wsl` + `python tools/fatiar9.py`
  (quarto_<id>.jpg, janela_<id>.png = máscara do vidro, parede_<id>.jpg e chao_<id>.jpg = faixas pra tela cheia).
  O cenário escolhido aparece só dentro do vidro (mask-image). Chão de tábua: última fileira esticada; lajota: espelhada.
- Decorar: o quarto sobe, faixa embaixo com abas (Quarto, Teto, Parede esq. ...) e itens lado a lado; lugar vazio ganha "+"
  no quarto (tocar abre aquele lugar). Só o móvel recém-posto anima (`ui.novoMovel`).
- Presente de boas-vindas: tapete redondo + planta (CF.toca, `presente`). 25 móveis (9 novos; `larg` = largura própria).
- Lugares medidos nos 4 quartos (chão começa a ~62% da altura): fundo_e/d `bottom:36%` (encostado no rodapé), paredes
  `top:24%` a 17,5%/82,5% (entre a janela e o canto), chão `bottom:11%`, frente `bottom:2%`. Cada móvel tem `larg` própria.

## Versão 8 (13/10/2026): a Casa é a tela inicial (do jeito do Pou/Finch)
- O dono achou confuso: vários cenários + quarto + ilha flutuando sem relação. Agora tudo conversa:
  a tela inicial é o QUARTO do Torrão em tela cheia (`telaCasa` em src/app.js), ele grande no meio, a janela redonda
  mostra o cenário escolhido (cenário = "vista da janela", fundo e ilhas do mapa), bilhete do próximo passo preso na
  parede, botões redondos no chão: Dar laranja, Roupas, Decorar, Janela. Roupas e Decorar abrem folha baixa (56vh)
  pra ver o quarto mudar atrás. Abas: Casa, Horta (só as plantas), Mapa, Progresso. A aba Toca e a ilha da Horta saíram.
- Tela cheia: o desenho do quarto (3:4) fica embaixo; em cima a parede continua esticando a 1ª fileira do quarto.jpg
  (listras verticais) e uma viga de papel esconde a emenda. Janela medida no quarto.jpg: centro 50% x 31,46%, 38,8% da largura.

## Versão 7 (13/10/2026): chapéus desenhados JÁ VESTIDOS (o jeito que funcionou)
- Pesquisa: pedir ao gerador o chapéu SOZINHO não funciona (cada um sai num ângulo e tamanho). O que funciona: o gerador
  desenha o personagem JÁ USANDO a peça e o computador recorta só a peça comparando com o personagem sem ela.
- `python tools/arte8.py ref` monta `tools/art_src/p8_ref.png` (Torrão sem planta, quadro 0 das 4 fases, grade 2x2).
  `python tools/arte8.py gera [ids] --wsl` pede ao Codex essa grade com os 4 usando a peça (`p8_v_<id>.png`).
  `python tools/arte8.py recorta [ids]` alinha pelo corpo, recorta por diferença de cor (filtra sobrancelha e a planta das
  costas; `MANTER` diz quais cores são da peça) -> `assets/roupa8/<id>_<fase>.png` e `src/roupa8_meta.js` (`CF.ROUPA8`).
  `python tools/arte8.py ver [ids]` mostra a peça nos 16 quadros de cada fase (`tools/debug/p8_ver_<id>.jpg`).
  `python tools/zoom8.py [ids]` = zoom GRANDE na junção chapéu + cabeça (o dono vê fresta de 1px entre a aba e a cabeça:
  conferir SEMPRE nesse zoom antes de dizer que está pronto). O recorte estica a peça até encostar na cabeça e limpa a borda.
  Fora do guarda-roupa por enquanto (recorte com defeito, cor parecida com a do Torrão): cowboy, detetive, explorador, fones;
  o de bruxo foi descartado a pedido do dono.
  `python tools/revisar8.py` = revisão AMPLIADA (cabeça grande, 4 fases por chapéu). Na miniatura passam defeitos
  (chapéu de bruxo torto, olho repetido, pedaço de sobrancelha): conferir sempre a ampliada. Chapéu que saiu torto:
  mover o `p8_v_<id>.png` pra `tools/art_src/descartadas/`, deixar a descrição mais precisa em `PECAS` e gerar de novo.
- No app (`src/pet.js`): com chapéu, a folha é a sem planta e a peça (classe `.enc`) vem do quadro 0 e segue a cabeça
  pelas âncoras `CF.ANCORAS_CARECA`. Peça nova: põe em `PECAS` (e `NOVAS`, que gera o ícone) no arte8.py e em `CF.ROUPAS`.
- 24 chapéus (16 antigos refeitos + formatura, sapo, viking, festa, cogumelo, boina, detetive, laranja). Óculos e bigode
  continuam no jeito antigo (`CF.VESTIR`). O dono NÃO quis trocar o Torrão por um boneco novo (teste p7 descartado).

## Versão 6 (12/10/2026): chapéu que encaixa de verdade
- Técnica dos jogos (slot de "cabelo" que sai quando entra chapéu, como no Spine/Terraria): com chapéu, o app troca a folha
  pelo Torrão SEM a planta na cabeça (`assets/pet/anim<fase>_careca.png`, meta em `src/careca_meta.js`).
- Arte: `python tools/gerar_arte6.py` (Codex redesenha a folha v2 sem a planta) e `python tools/fatiar6.py` (corta e mede).
  `fatiar6.py` mede a cabeça no quadro parado e acha a mesma cabeça nos outros 15 quadros por encaixe de forma
  (funciona com olho fechado e braço pra cima). Conferir com `python tools/ver_roupas.py` (tools/debug/roupas.jpg).
- `CF.VESTIR`: `afunda` 0.55 a 0.58 (a aba fica logo acima das sobrancelhas), `larg` 1.0 a 1.35 (fases 3 e 4 têm cabeça mais estreita).
  A faixa (`onde: testa`) é presa pelo meio (classe `.meio`).
- WSL: `gerar_arte_codex.py` acha o codex em qualquer versão do node do nvm. Depois de usar: `wsl --shutdown`.

## Tudo liberado (pedido do dono, 12/10/2026)
- `CF.TUDO_LIBERADO = true` em `src/data.js`: todas as skins e roupas liberadas, porque o dono usa o app sozinho.
- Se um dia quiser lançar pra mais gente (Play Store), é só trocar pra `false`: as peças voltam a liberar por pontos
  (`pts` de cada item em `CF.ROUPAS` e `CF.SKINS`) e o aviso de "roupa nova" volta a aparecer.
- Os móveis da Toca continuam sendo comprados com laranjas (isso não mudou).

## Arte
- Estilo escolhido pelo dono: **recorte geométrico** (formas chapadas sem contorno, textura de papel, paleta marrom/verde-oliva/laranja/creme/azul-petróleo).
  Referência aprovada: `tools/art_src/estilo_a.png`.
- Gerada pelo Codex: `python tools/gerar_arte_codex.py` (tarefas `r_*` usam a referência). Imagens prontas são puladas.
- Cortada por `python tools/fatiar.py` → `assets/pet`, `assets/horta`, `assets/ic`, `assets/fundo.jpg`.
- Regras de arte do dono: `Desktop\GUIA_ARTE_CHATGPT.md` (nada infantil, fundo transparente, um prompt só).

## Testar e gerar
- Navegador: `python -m http.server 8620` na pasta e abrir http://localhost:8620 (tela de celular).
- APK: `python tools/build_apk.py` → `Torrao.apk` (assinado com chave de teste; Play Store vai precisar de chave oficial).

## Dono
- Fala português informal; quer que o Claude decida e execute. Respostas curtas e simples.
- Listas simples no chat, sem separar por tópicos.


## Mais skins e cores (26/10/2026)
- `CF.SKINS` ganhou 9: Menta, Cobre, Oceano, Neve, Cereja (paradas) e Aurora, Brasa, Galáxia, Fantasminha, que MEXEM:
  `anim: '<id>'` vira a classe `.anim-<id>` no `.pet` (keyframes no style.css; `filtro` fica só pra miniatura do guarda-roupa).
  Arco-íris continua no jeito antigo (`filtro: 'arcoiris'`). Com "reduzir movimento" no celular, as animadas ficam paradas.
- `CF.CORES_ROUPA` ganhou 5: Dourado, Prata e Carvão (sépia/cinza: saem iguais em qualquer peça), Pastel e Bem vivo.
- Chapéus gerados em 26/10/2026 (noite): só o gato passou no zoom e entrou no CF.ROUPAS. noel, abobora,
  marinheiro, coelho, unicornio (fresta ou pedaço solto), obra (baixo na fase 1) e pescador (recorte vazio: o Codex
  mudou a pose) ficam pra refazer: apagar tools/art_src/p8_v_<id>.png e rodar gera/recorta/zoom de novo.
- Chapéus novos (antes de gerar): pescador, noel, abobora, obra, marinheiro, coelho, unicornio, gato
  (`PECAS`/`NOVAS` no arte8.py). Gerar: `python tools/arte8.py gera <ids>` -> `recorta <ids>` -> `ver`/`zoom8.py`/`revisar8.py`
  -> só depois de aprovado no zoom, pôr em `CF.ROUPAS`. Sem o `estilo_a.png` (fora do PC do dono), o anexo 1 vira
  `tools/art_src/p8_exemplo.png` (4 chapéus que já existem vestidos). `gerar_arte_codex.py` agora acha o codex no Linux também.
- Móveis novos (26/10/2026, PRONTOS e no CF.MOVEIS, conferidos no quarto): `python tools/arte10.py gera` (1 imagem = 9 móveis: balão, quadro de
  estrelas, prateleira de plantas, baú, piano, tapete de laranja, globo, girassol, vitrola) -> `corta` -> conferir olhando
  -> pôr no `CF.MOVEIS` (o `corta` imprime as linhas com lugar e larg). Anexo 1 = `tools/art_src/v10_ref.png` (9 móveis atuais).
- Cuidado (26/10/2026): `gerar_arte_codex.gera` acha a imagem nova pela pasta ~/.codex/generated_images inteira; se
  outro projeto estiver usando o Codex ao mesmo tempo, as imagens dele entram como `_extraN`. Rodar sozinho, ou conferir
  olhando qual é a certa. `arte8.py gera` pede os ids separados por VÍRGULA (`gera pescador,noel,...`).

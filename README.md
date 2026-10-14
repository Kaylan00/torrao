# Torrão

App de celular pra estudar inglês com um bichinho de terra, feito todo em estilo papel recortado.
O plano tem 84 dias (2 meses pra chegar no "me viro", mais 1 mês de folga).

## Como funciona

- A tela inicial é a aula do dia: **Aprender** as frases (com áudio), **Praticar** escrevendo e **Falar** inglês.
- **Conversa por voz**: você fala, a IA ouve o áudio de verdade e corrige gramática e pronúncia.
- **Teste de nível** completo (vocabulário, gramática, leitura, escuta, escrita e fala), no padrão A1 a C2.
- Cada frase vira uma planta na horta. Quando ela pede água, é hora de revisar (revisão espaçada).
- Acertou, ganha laranja. Laranja alimenta o Torrão e compra móveis pro quarto dele.
- Completou o dia, o Torrão sai pra passear e no dia seguinte volta com uma frase nova.
- Roupas, 4 quartos pra decorar e 6 vistas da janela.

## IA grátis (opcional)

O app pode usar a IA grátis da [OpenRouter](https://openrouter.ai) pra corrigir o que você escreve,
tirar dúvidas e conversar em inglês com você. Crie uma chave na OpenRouter e cole em
**Progresso > Ajustes** dentro do app. A chave fica salva só no seu aparelho.

## Instalar no Android

Baixe o `Torrao.apk` da [última versão](https://github.com/Kaylan00/torrao/releases/latest) e instale.
Quando sair uma versão nova, o app avisa ("Versão nova!" no quarto). É só baixar e instalar por cima:
o progresso continua.

## Rodar no computador

Dê dois cliques em `ABRIR_TORRAO.bat` (precisa de Python e do Microsoft Edge).

## Pra quem for mexer no código

- `src/` e `assets/`: o app (HTML, CSS e JavaScript puro, sem framework).
- `android/`: o projeto Android que embala o app num APK.
- `tools/`: scripts em Python (gerar e cortar a arte, gerar o APK, publicar versão nova).
- Gerar o APK: `python tools/build_apk.py`. Publicar: `python tools/publicar.py "o que mudou"`.

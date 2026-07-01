# 🎮 Pokémon Valentine's Game — Um Experimento de "Vibe Coding"

Um mini-game inspirado no clássico jogo Pokémon do Game Boy Color, apresentando personagens estilo pixel art personalizados, músicas ambientais retro, e escolhas interativas. Este projeto foi desenvolvido como um presente de Dia dos Namorados e serviu como um desafio técnico explorando a assistência da IA.

---

## 🤖 Sobre o Projeto & O Debate do "Vibe Coding"

Este projeto foi construído do zero durante o mês de junho. Como eu não possuía um conhecimento profundo em **HTML5, CSS3 e JavaScript**, decidi adotar a abordagem de **"Vibe Coding"**. 

Utilizei as Inteligências Artificiais **Claude (Anthropic)** e **Gemini (Google)** como copilotos para guiar a estruturação do código, enquanto atuei diretamente na arquitetura de software, na lógica de jogo e no direcionamento estratégico.

### 🧠 Aprendizado Real vs. Atalhos
Embora as IAs tenham acelerado drasticamente a velocidade de entrega, este projeto provou que o desenvolvimento assistido por IA **não é apenas escrever um prompt simples**. Foram dias dedicados a:
* **Debugging Intenso:** Encontrar e resolver conflitos na integração de scripts, áudios e folhas de estilo.
* **Análise Crítica:** Estudar o propósito por trás de cada linha gerada pelas IAs para garantir boas práticas e evitar "código caixa-preta".
* **Persistência:** Ajustar manualmente os gatilhos lógicos para que a transição de telas e músicas funcionasse sem falhas.

No fim, as IAs funcionaram como excelentes tutores em tempo real, permitindo focar na experiência do usuário e na engenharia do ecossistema do jogo.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5** – Estruturação semântica do jogo e elementos de interface.
* **CSS3** – Estilização retrô, layout simulando o console portátil e responsividade baseada na estética pixel art.
* **JavaScript** – Lógica das mecânicas, manipulação de estados do DOM e gerenciamento das faixas de áudio.
* **Claude & Gemini** – Engenharia de prompt e auxílio no desenvolvimento técnico (Copilots).

---

## ✨ Mecânicas e Diferenciais do Jogo

* **Interface Clássica:** O jogo simula visualmente a tela e o corpo de um clássico Game Boy, operado através de cliques nos botões direcionais e no botão **A** (utilizado para avançar as ações e diálogos).
* **Narrativa Interativa (The Valentine's Dilemma):** O jogador é confrontado com a pergunta *"Will you be my valentine?"*. 
  * A escolha **"No"** transporta o jogador para uma tela de batalha clássica de Pokémon.
  * A escolha **"Yes"** destrava a tela de vitória com um texto personalizado de declaração.
* **Trilha Sonora Dinâmica de 8-bits:** Sistema de áudio modularizado que altera a música ambiente em tempo real conforme as decisões do jogador:
  1. *Tela Inicial:* Trilha clássica e nostálgica de Pokémon.
  2. *Tela de Batalha (Opção Não):* Música de batalha acelerada e agitada no melhor estilo Game Boy.
  3. *Tela de Declaração (Opção Sim):* Versão retrô chiptune (8-bits) romântica da música do artista *Tyler, the Creator - See You Again*.

---

## 🕹️ Como Jogar (Versão Pública)

O jogo está publicado e pronto para ser testado no **GitHub Pages**! 

👉 **[CLIQUE AQUI PARA JOGAR](https://mouraleticia.github.io/pokemon-valentines-game/)**

* **Controles:** Utilize o mouse ou o toque na tela para interagir com o Game Boy virtual. Clique nas setas para navegar e no botão **A** para confirmar e avançar.

---

## 📂 Estrutura do Repositório

```text
├── index.html          # Arquivo principal do jogo (Estrutura do Game Boy)
├── css/                # Estilização, layout retrô 
├── js/                 # Inteligência, lógica das escolhas e manipulação de estados
├── img/                # Imagens e cenários
├── audio/              # Pasta com as trilhas sonoras em 8-bits (Menu, Batalha e Tyler, the Creator)
└── assets/             # Sprites pixelizados personalizados públicos

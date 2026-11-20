# Painel EMANX

Página que mostra o painel (Apps Script) em tela inteira, sem a faixa do Google, e cuida da tela cheia do modo exibição.
Não guarda dado nenhum: só o endereço do app. O código do painel fica no repositório privado `painel-emanx`.

Endereço: https://jpaapw-star.github.io/painel/

## Meus apps

`apps/index.html` é a página central com o link de todos os apps (menos RLCAR e Produção por voz).
Endereço: https://jpaapw-star.github.io/painel/apps/
Para incluir um app, copie um bloco `<li>` e troque `data-app`, endereço, nome e frase.
O robô `.github/workflows/status.yml` testa os apps a cada 30 min e grava `apps/status.json`; a página mostra um ponto vermelho no app que não responde. Publica sozinho ao entrar na `main`.

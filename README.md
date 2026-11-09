# FutsalCam AI Web v0.4

Protótipo de enquadramento digital para uma câmara fixa. Funciona com vídeo local e com a câmara do navegador. A análise corre no dispositivo.

## Testar

No Windows, abre `index.html` no Edge com os três ficheiros JavaScript na mesma pasta. No iPhone, abre a página HTTPS no Safari. Escolhe **Testar com vídeo** e carrega um MP4/H.264, ou **Iniciar câmara** e autoriza a utilização da câmara.

Em **Automático**, escolhe **Selecionar região** e toca em dois cantos opostos para abranger todo o campo. A região limita a procura, incluindo quando a imagem está ampliada. Um toque normal passa para **Manual**. Usa **Automático** para retomar a análise.

## Seguimento e enquadramento

A aplicação procura pequenos detalhes claros em movimento e associa posições entre fotogramas. Exige pelo menos três observações e deslocamento antes de aproximar. Quando as trajetórias são ambíguas, a imagem abre progressivamente até à vista completa da fonte. O zoom automático respeita o valor escolhido até 1,5×. O modo manual mantém o intervalo até 2,5×.

O círculo verde assinala um candidato. Uma sapatilha pode ter o mesmo aspeto. Uma bola parada, tapada, escura ou muito pequena pode passar despercebida. O plano geral é intencional nestas condições. O protótipo não identifica a bola com fiabilidade nem transmite o jogo.

**Análise** mede comparações por segundo e **Ecrã** mede desenhos da pré-visualização. **Área ativa** descreve o movimento geral dentro da região. O controlo de luminosidade altera a sensibilidade aos detalhes móveis. A área mínima ativa regula apenas o diagnóstico de movimento geral.

## Verificação no Windows

Num passe simulado com um ponto claro e uma figura grande em movimento no lado oposto, a v0.4 manteve o ponto visível em nove de nove instantes e abriu o plano quando o ponto desapareceu. A v0.3 manteve-o visível em seis dos nove. Num excerto de futsal, as três posições de bola verificadas ficaram visíveis em ambas as versões. Na v0.4, o plano estava aberto ou quase aberto nesses instantes. Falta verificar o seguimento e o desempenho no iPhone físico.

## Publicar no GitHub Pages a partir do Windows

1. No repositório [carlosmdmarques/futsalcam-ai](https://github.com/carlosmdmarques/futsalcam-ai), seleciona o ramo `main`. Em **Add file → Upload files**, carrega os ficheiros extraídos para a raiz. Carrega `index.html`, `app.js`, `motion.js`, `tracking.js` e `README.md`. Os ícones, o manifesto e `.nojekyll` já existem no repositório.
2. Confirma em **Commit changes**. Em **Settings → Pages**, confirma **Deploy from a branch**, ramo **main**, pasta **/(root)**. Se já estiver assim, basta o commit. [Documentação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
3. Quando a publicação terminar, abre [FutsalCam AI](https://carlosmdmarques.github.io/futsalcam-ai/?v=04) e confirma o distintivo **WEB · v0.4**.


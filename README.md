# FutsalCam AI Web v0.3

Protótipo de enquadramento digital por movimento para uma câmara fixa. Funciona com um ficheiro local ou com a câmara traseira pedida pelo navegador. O vídeo é processado no dispositivo. A versão não identifica a bola nem transmite o jogo.

## Testar no Windows

1. Extrai o ZIP para uma pasta e abre `index.html` no Edge. Mantém `app.js` e `motion.js` ao lado do HTML.
2. Clica em **Testar com vídeo** e escolhe um MP4/H.264. Para um teste controlado usa o MP4 de ensaio que acompanha a entrega. O retângulo desloca-se na parte superior da imagem.
3. Em **Automático**, verifica se aparece um círculo verde sobre o movimento. O diagnóstico apresenta a posição na imagem original e a percentagem de píxeis ativos. O zoom inicial é 1,3×. A 1×, uma fonte 16:9 já ocupa a imagem inteira e o enquadramento não pode deslocar-se.
4. Escolhe **Selecionar região**. A aplicação mostra a imagem original completa. Toca num canto e no canto oposto para delimitar o campo. No vídeo de ensaio, selecionar apenas a metade inferior deve dar área ativa de 0% e retirar o círculo. **Imagem inteira** volta a incluir o movimento. Cada nova fonte começa com a imagem inteira.
5. Um toque normal na pré-visualização passa para **Manual**. Usa **Automático** para retomar a análise. Zoom, suavidade, centrar e fotografia continuam disponíveis.

## Interpretar o diagnóstico

- **Análise** conta comparações concluídas por segundo entre amostras sucessivas do vídeo. **Ecrã** conta desenhos da pré-visualização. Com reprodução contínua, a análise visa cerca de 8–10 fps, conforme a cadência da fonte e o dispositivo. Em modo manual ou durante a seleção da região, fica suspensa.
- **Área ativa** é a percentagem da região selecionada que mudou acima da diferença mínima de luminosidade. Se o vídeo avança e esta percentagem fica perto de zero, verifica a região e baixa a diferença mínima. Se há atividade mas nenhum alvo, baixa a área mínima ativa. O mínimo tem de estar concentrado numa vizinhança local.
- Com público ou bancos em movimento, começa por os excluir da região. Se houver ruído persistente, sobe gradualmente o limiar de luminosidade. Mudanças que atingem mais de 55% da região são tratadas como alteração global. Após três segundos de análises sem alvo o enquadramento regressa ao centro.
- O círculo marca a posição medida na última comparação, e o enquadramento aproxima-se dela com a suavidade escolhida. Em grupos separados pode ganhar o que gerar mais movimento. O algoritmo não distingue jogadores, público e bola.

## Publicar no GitHub Pages a partir do Windows

1. No repositório [carlosmdmarques/futsalcam-ai](https://github.com/carlosmdmarques/futsalcam-ai), seleciona o ramo `main`. Em **Add file → Upload files**, carrega os ficheiros extraídos para a raiz. Os ficheiros novos são `app.js` e `motion.js`. Os atualizados são `index.html` e `README.md`. Os ícones, o manifesto e `.nojekyll` já existem no repositório.
2. Confirma em **Commit changes**. Em **Settings → Pages**, confirma **Deploy from a branch**, ramo **main**, pasta **/(root)**. Se já estiver assim, basta o commit. [Documentação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
3. Quando a publicação terminar, abre [FutsalCam AI](https://carlosmdmarques.github.io/futsalcam-ai/?v=03) e confirma o distintivo **WEB · v0.3**.

## Verificar no Safari do iPhone

Abre o endereço HTTPS no Safari com o ecrã ativo. Começa por **Testar com vídeo**, escolhe um MP4 nos Ficheiros e repete o teste da região. Depois toca em **Iniciar câmara**, autoriza o acesso, coloca o iPhone num suporte e movimenta-te dentro e fora da região. Compara os FPS de análise e confirma que o círculo desaparece quando o movimento cessa. O vídeo usa reprodução em linha e silenciada. A análise aproveita os fotogramas entregues pelo navegador quando disponíveis e usa o avanço do tempo de reprodução como alternativa.

## Verificação desta entrega

No Windows, o Edge reproduziu um MP4 de ensaio e um excerto local de jogo. Com o mesmo ensaio, a v0.2 acumulou análises sem alvo e a v0.3 localizou o movimento. Foram verificados a exclusão de movimento fora da região, o reaparecimento do alvo, os limiares de área, o marcador, a passagem Manual/Automático e o caminho alternativo de análise sem callback de fotograma. O WebKit de teste no Windows abriu a página mas recusou a reprodução de MP4 e WebM. A reprodução e a câmara no Safari de um iPhone físico ficam por confirmar.

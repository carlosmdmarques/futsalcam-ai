# FutsalCam AI — Web v0.1

Protótipo experimental que funciona no Safari do iPhone e em navegadores de computador, sem Mac e sem instalar SDK.

## Funções implementadas
- Captura da câmara traseira do iPhone (mediante autorização, em HTTPS)
- Carregar um vídeo local para ensaiar sem usar a câmara
- Deteção simples da região de maior movimento por diferença de fotogramas
- Pan/zoom digital, suavização, modo manual, toque para recentrar e fotografia instantânea
- Processamento local; nenhuma imagem é enviada para servidores

**Não inclui ainda:** reconhecimento da bola por IA, livestream RTMP, gravação de vídeo ou funcionamento em segundo plano. A pré-visualização não é prova de desempenho em jogo real.

## Publicar gratuitamente com GitHub Pages (a partir do Windows)
1. Cria uma conta em https://github.com/ (ou entra na tua conta).
2. Clica **New repository** e dá o nome `futsalcam-ai`. Seleciona **Public** (necessário no plano gratuito para GitHub Pages).
3. Descompacta o ZIP. Dentro do repositório usa **Add file > Upload files** e carrega `index.html`, `manifest.webmanifest`, `icon.svg`, `icon.png` e `.nojekyll`. Confirma em **Commit changes**.
4. Em **Settings > Pages**, em **Build and deployment**, escolhe **Deploy from a branch**, branch **main**, pasta **/(root)**; guarda.
5. Quando a página estiver publicada, abre no Safari do iPhone `https://TEU-UTILIZADOR.github.io/futsalcam-ai/` (substitui pelo teu utilizador GitHub).
6. Toca **Iniciar câmara** e aceita a permissão. Na partilha do Safari escolhe **Adicionar ao ecrã principal** se quiseres um ícone.

### Testar primeiro sem publicar
Podes abrir `index.html` num navegador do Windows e carregar um vídeo local em **Testar com vídeo**. Para usar a câmara no iPhone, a abordagem fiável é publicar com HTTPS; abrir o HTML diretamente pode ter restrições.

## Teste recomendado
- iPhone na horizontal, num suporte estável e elevado, com a câmara traseira.
- Garantir que a imagem original abrange todo o campo; experimentar 1,0× a 1,4×.
- Testar durante 2–3 minutos, primeiro em modo automático e depois manual.
- Verificar a perda de acompanhamento, os movimentos bruscos e a latência.
- Manter o ecrã ligado; o Safari pode suspender captação em segundo plano.

## Limitações técnicas
A análise simples de movimento pode seguir um jogador ou o público, confundir alterações de luz e não identificar a bola. Não existe livestream nesta versão. Uma aplicação nativa pode ser necessária para fiabilidade e codificação de vídeo em produção. GitHub Pages publica apenas o código da aplicação: não recebe imagens da câmara nem transmite o jogo.

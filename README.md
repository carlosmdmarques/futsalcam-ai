# FutsalCam AI Web v0.2 — protótipo experimental

## Mudanças da v0.2
- Acompanhamento por **movimento**, nunca por identificação da bola.
- Máscara poligonal **aproximada** para excluir parte da bancada e teto. Desligar «Zona de jogo» quando o ângulo não corresponder.
- Agrupamento de movimento por regiões horizontais, zona morta de 3%, limite de velocidade da câmara e regresso ao centro após 3 segundos sem movimento fiável.
- Diagnósticos do alvo horizontal e FPS de desenho.
- Ficheiro manifest.webmanifest incluído.

## Instalação no GitHub Pages
1. Abrir repositório carlosmdmarques/futsalcam-ai.
2. Substituir `index.html` e carregar `manifest.webmanifest` e `icon.png` na raiz do ramo main.
3. Fazer commit. Aguarde a publicação no GitHub Pages e abra o site no Safari do iPhone.
4. Se a versão antiga estiver em cache, feche e volte a abrir o Safari; para testes pode usar URL com ?v=02.

## Limitações
- Não há IA de deteção de bola, nem livestream, nem gravação.
- A máscara de jogo só é adequada para ângulos panorâmicos semelhantes ao vídeo de teste.
- Valores de confiança representam concentração do movimento e **não probabilidade de haver uma bola**.
- A visualização no browser não comprova autonomia da bateria, qualidade de encoder ou desempenho em direto.

## Teste recomendado
Usar um vídeo amplo a partir de câmara fixa. Comparar com o modo «Zona de jogo: OFF» e avaliar se a jogada fica dentro de campo. O movimento automático é uma prova de conceito.

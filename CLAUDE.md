# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visao Geral do Projeto

HotGhost é uma aplicacao React client-side para transformacao de conteudo criativo. Oferece três modos de transformacao:
- **Texto**: Transforma texto usando homoglifos Unicode (caracteres visualmente identicos de alfabetos Cirilico/Grego)
- **Imagem**: Aplica templates com marca (Metropoles, Choquei) com overlays, gradientes e efeitos
- **Video**: Mesmos templates de imagem + template Classico, processados client-side usando FFmpeg.wasm

## Comandos

```bash
npm run dev      # Inicia servidor de desenvolvimento (http://localhost:5173)
npm run build    # Build de producao para dist/
npm run preview  # Preview do build de producao
```

## Arquitetura

```
src/
  main.jsx              # Entry point React
  App.jsx               # Navegacao por abas (texto/imagem/video)
  index.css             # Estilos globais + CSS custom properties
  components/
    TextCamo.jsx        # UI de transformacao de texto
    ImageCamo.jsx       # UI de aplicacao de templates em imagem
    VideoCamo.jsx       # UI de aplicacao de templates em video
  utils/
    textTransform.js    # Mapeamento de caracteres homoglifos
    imageTransform.js   # Processamento de imagem via Canvas
    videoTransform.js   # Processamento de video via FFmpeg.wasm
```

## Detalhes Tecnicos

### Configuracao Vite
O servidor requer headers CORS especiais para FFmpeg.wasm (SharedArrayBuffer):
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Templates de Imagem/Video
Três templates disponiveis, todos com saida 1080x1920:
- **Metropoles**: Imagem/video unico com overlay de gradiente, logo embaixo, texto opcional
- **Choquei**: Duas imagens/videos lado a lado com header/footer, logos e campos de texto
- **Classico** (apenas video): Video com imagem inicial (milisegundos.png ~100ms), overlay de transparencia durante todo o video, e video do relogio no final

### Sistema de Efeitos
Imagem e video suportam estes efeitos ajustaveis:
- Blur, Ruido, Brilho, Contraste (todos os templates)
- Intensidade do gradiente, Posicao vertical (apenas Metropoles)

### FFmpeg.wasm
- Carregado sob demanda no primeiro acesso a aba de video
- Core carregado do CDN unpkg
- Processa video inteiramente no navegador (sem upload para servidor)

### Assets do Template Classico
- `/public/images/milisegundos.png` - Imagem exibida no inicio por ~100ms
- `/public/images/transparencia.mp4` - Video de overlay aplicado durante todo o video (6% opacidade)
- `/public/images/relogio.mp4` - Video concatenado no final

## Sistema de Design

Tema Terminal/Matrix usando CSS custom properties. Tokens principais em `src/index.css`:
- Cor primaria: `#00FF41` (verde neon)
- Background: `#0a0a0a`
- Fonte: JetBrains Mono
- Grid de espacamento: 8px

Documentacao completa do design system em `.interface-design/system.md`.

## Formatacao de Texto

Inputs de texto de imagem e video suportam sintaxe `*bold*` para enfase (parseado durante renderizacao).

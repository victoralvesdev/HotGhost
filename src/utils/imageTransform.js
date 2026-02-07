// Templates disponiveis
export const TEMPLATES = [
  { id: 'metropoles', label: 'Metropoles', slots: 1 },
  { id: 'choquei', label: 'Choquei', slots: 2 },
]

// Efeitos disponiveis
export const EFFECTS = [
  { id: 'blur', label: 'Blur', min: 0, max: 20, default: 0 },
  { id: 'noise', label: 'Ruido', min: 0, max: 100, default: 0 },
  { id: 'brightness', label: 'Brilho', min: -100, max: 100, default: 0 },
  { id: 'contrast', label: 'Contraste', min: -100, max: 100, default: 0 },
]

// Efeitos especificos do Metropoles
export const METROPOLES_EFFECTS = [
  { id: 'gradient', label: 'Intensidade Gradiente', min: 0, max: 100, default: 70 },
  { id: 'positionY', label: 'Posição Vertical', min: -50, max: 50, default: 0 },
]

// Aplica efeitos na imagem
function applyEffects(ctx, canvas, effects = {}) {
  const { blur = 0, noise = 0, brightness = 0, contrast = 0 } = effects

  // Aplica blur usando filter do canvas
  if (blur > 0) {
    ctx.filter = `blur(${blur}px)`
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(canvas, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.filter = 'none'
  }

  // Aplica brilho e contraste
  if (brightness !== 0 || contrast !== 0) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const brightnessFactor = brightness / 100 * 255
    const contrastFactor = (contrast + 100) / 100

    for (let i = 0; i < data.length; i += 4) {
      // Contraste
      data[i] = ((data[i] - 128) * contrastFactor + 128)
      data[i + 1] = ((data[i + 1] - 128) * contrastFactor + 128)
      data[i + 2] = ((data[i + 2] - 128) * contrastFactor + 128)

      // Brilho
      data[i] = Math.max(0, Math.min(255, data[i] + brightnessFactor))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightnessFactor))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightnessFactor))
    }
    ctx.putImageData(imageData, 0, 0)
  }

  // Aplica ruido
  if (noise > 0) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const intensity = noise * 2.55 // Converte 0-100 para 0-255

    for (let i = 0; i < data.length; i += 4) {
      const randomNoise = (Math.random() - 0.5) * intensity
      data[i] = Math.max(0, Math.min(255, data[i] + randomNoise))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + randomNoise))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + randomNoise))
    }
    ctx.putImageData(imageData, 0, 0)
  }
}

// Carrega imagem
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Template Metropoles - criado programaticamente
// 1080x1920, imagem de fundo, gradiente preto, logo e texto no footer
export async function applyMetropoles(userImageSrc, texts = {}, effects = {}) {
  const { subtitle = '' } = texts

  // Carrega fonte
  await loadFont()

  const [userImg, logo] = await Promise.all([
    loadImage(userImageSrc),
    loadImage('/images/logo-metropoles.webp')
  ])

  // Dimensoes do canvas
  const WIDTH = 1080
  const HEIGHT = 1920
  const FOOTER_HEIGHT = 420
  const GRADIENT_START = 450 // Quase no topo
  const LOGO_WIDTH = 800
  const LOGO_HEIGHT = 160
  const PADDING = 50

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // === IMAGEM DE FUNDO ===
  // Desenha imagem do usuario cobrindo todo o canvas
  const imgAspect = userImg.width / userImg.height
  const canvasAspect = WIDTH / HEIGHT

  // Posição vertical ajustável (-50 a +50, onde negativo sobe e positivo desce)
  const positionY = effects.left?.positionY ?? 0

  let drawWidth, drawHeight, drawX, drawY

  // Escala extra para permitir movimento (20% extra)
  const extraScale = 1.2

  if (imgAspect > canvasAspect) {
    // Imagem mais larga - escala pela altura com extra
    drawHeight = HEIGHT * extraScale
    drawWidth = drawHeight * imgAspect
    drawX = (WIDTH - drawWidth) / 2
  } else {
    // Imagem mais alta - escala pela largura com extra
    drawWidth = WIDTH * extraScale
    drawHeight = drawWidth / imgAspect
    drawX = (WIDTH - drawWidth) / 2
  }

  // Calcula o range de movimento vertical possível
  const extraHeight = drawHeight - HEIGHT
  // Converte -50 a +50 para o range de movimento (negativo = sobe, positivo = desce)
  const offsetY = (positionY / 50) * (extraHeight / 2)
  drawY = (HEIGHT - drawHeight) / 2 + offsetY

  // Canvas temporario para aplicar efeitos na imagem
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = WIDTH
  tempCanvas.height = HEIGHT
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.drawImage(userImg, drawX, drawY, drawWidth, drawHeight)

  // Aplica efeitos se habilitado
  if (effects.left && effects.left.enabled) {
    applyEffects(tempCtx, tempCanvas, effects.left)
  }

  // Copia para o canvas principal
  ctx.drawImage(tempCanvas, 0, 0)

  // === GRADIENTE PRETO ===
  // Intensidade do gradiente (0-100)
  const gradientIntensity = (effects.left?.gradient ?? 70) / 100

  const gradient = ctx.createLinearGradient(0, GRADIENT_START, 0, HEIGHT)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(0.3, `rgba(0, 0, 0, ${0.7 * gradientIntensity})`)
  gradient.addColorStop(0.6, `rgba(0, 0, 0, ${0.9 * gradientIntensity})`)
  gradient.addColorStop(1, `rgba(0, 0, 0, ${1 * gradientIntensity})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, GRADIENT_START, WIDTH, HEIGHT - GRADIENT_START)

  // === LOGO NO FOOTER ===
  const logoX = (WIDTH - LOGO_WIDTH) / 2
  const logoY = HEIGHT - FOOTER_HEIGHT
  ctx.drawImage(logo, logoX, logoY, LOGO_WIDTH, LOGO_HEIGHT)

  // === SUBTEXTO ===
  if (subtitle) {
    const SUBTITLE_FONT_SIZE = 42
    const TEXT_COLOR = '#FFFFFF'
    const FONT_FAMILY = 'Open Sans'
    const MAX_TEXT_WIDTH = WIDTH - (PADDING * 2)

    const subtitleY = logoY + LOGO_HEIGHT + 50
    drawTextWithBold(ctx, subtitle, WIDTH / 2, subtitleY, SUBTITLE_FONT_SIZE, FONT_FAMILY, TEXT_COLOR, 'center', MAX_TEXT_WIDTH)
  }

  return canvas.toDataURL('image/png')
}

// Funcao para quebrar texto em linhas
function wrapText(ctx, text, maxWidth, fontSize, fontFamily) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  // Configura fonte para medir
  ctx.font = `normal ${fontSize}px "${fontFamily}"`

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    // Remove asteriscos para medir corretamente
    const cleanLine = testLine.replace(/\*/g, '')
    const metrics = ctx.measureText(cleanLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

// Funcao para renderizar texto com suporte a *bold* e quebra de linha
function drawTextWithBold(ctx, text, x, y, fontSize, fontFamily, color, align = 'left', maxWidth = null, lineHeight = 1.3) {
  // Se tem maxWidth, quebra em linhas
  if (maxWidth) {
    const lines = wrapText(ctx, text, maxWidth, fontSize, fontFamily)
    let currentY = y

    for (const line of lines) {
      drawSingleLineWithBold(ctx, line, x, currentY, fontSize, fontFamily, color, align)
      currentY += fontSize * lineHeight
    }
    return
  }

  drawSingleLineWithBold(ctx, text, x, y, fontSize, fontFamily, color, align)
}

// Funcao para renderizar uma linha com suporte a *bold*
function drawSingleLineWithBold(ctx, text, x, y, fontSize, fontFamily, color, align = 'left') {
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'

  // Divide o texto em partes (normal e bold)
  const parts = text.split(/(\*[^*]+\*)/g).filter(p => p)

  // Calcula largura total primeiro
  let totalWidth = 0
  parts.forEach(part => {
    const isBold = part.startsWith('*') && part.endsWith('*')
    const cleanText = isBold ? part.slice(1, -1) : part
    ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize}px "${fontFamily}"`
    totalWidth += ctx.measureText(cleanText).width
  })

  // Define posicao inicial baseado no alinhamento
  let currentX = x
  if (align === 'center') {
    currentX = x - totalWidth / 2
  } else if (align === 'right') {
    currentX = x - totalWidth
  }

  // Desenha cada parte
  ctx.textAlign = 'left'
  parts.forEach(part => {
    if (!part) return
    const isBold = part.startsWith('*') && part.endsWith('*')
    const cleanText = isBold ? part.slice(1, -1) : part
    ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize}px "${fontFamily}"`
    ctx.fillText(cleanText, currentX, y)
    currentX += ctx.measureText(cleanText).width
  })
}

// Carrega fonte Open Sans
async function loadFont() {
  const font = new FontFace('Open Sans', 'url(https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVI.woff2)')
  await font.load()
  document.fonts.add(font)

  const fontBold = new FontFace('Open Sans', 'url(https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVI.woff2)', { weight: 'bold' })
  await fontBold.load()
  document.fonts.add(fontBold)
}

// Template Choquei - criado programaticamente
// 1080x1920, logo header esquerda, 2 midias lado a lado, logo central
export async function applyChoquei(leftMediaSrc, rightMediaSrc, texts = {}, effects = {}) {
  const { title = '', subtitle = '', footer = '' } = texts

  // Carrega fonte antes de usar
  await loadFont()

  const logo = await loadImage('/images/logo-choquei.png')

  // Carrega as midias (imagens)
  const [leftImg, rightImg] = await Promise.all([
    loadImage(leftMediaSrc),
    loadImage(rightMediaSrc)
  ])

  // Dimensoes do canvas
  const WIDTH = 1080
  const HEIGHT = 1920
  const GAP = 15
  const HEADER_PADDING_LEFT = 80
  const HEADER_HEIGHT = 330
  const FOOTER_HEIGHT = 330
  const LOGO_HEADER_SIZE = 200
  const LOGO_CENTER_SIZE = 190

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // Fundo branco
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // === HEADER ===
  // Logo no header - alinhada a esquerda, centralizada verticalmente no header
  const logoHeaderY = (HEADER_HEIGHT - LOGO_HEADER_SIZE) / 2
  ctx.drawImage(logo, HEADER_PADDING_LEFT, logoHeaderY, LOGO_HEADER_SIZE, LOGO_HEADER_SIZE)

  // Titulo - ao lado da logo
  const TITLE_FONT_SIZE = 65
  const SUBTITLE_FONT_SIZE = 32
  const FOOTER_FONT_SIZE = 32
  const TEXT_COLOR = '#000000'
  const FONT_FAMILY = 'Open Sans'

  if (title) {
    const titleX = HEADER_PADDING_LEFT + LOGO_HEADER_SIZE + 40
    const titleY = HEADER_HEIGHT / 2 - (subtitle ? 35 : 0)
    drawTextWithBold(ctx, title, titleX, titleY, TITLE_FONT_SIZE, FONT_FAMILY, TEXT_COLOR, 'left')
  }

  // Subtexto - abaixo do titulo
  if (subtitle) {
    const subtitleX = HEADER_PADDING_LEFT + LOGO_HEADER_SIZE + 40
    const subtitleY = HEADER_HEIGHT / 2 + 50
    drawTextWithBold(ctx, subtitle, subtitleX, subtitleY, SUBTITLE_FONT_SIZE, FONT_FAMILY, TEXT_COLOR, 'left')
  }

  // === AREA DE MIDIA ===
  // Calcula area disponivel para as midias (entre header e footer)
  const mediaTop = HEADER_HEIGHT
  const mediaHeight = HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT
  const mediaWidth = (WIDTH - GAP) / 2

  // Funcao para desenhar midia com cover e aplicar efeitos
  const drawMediaCover = (img, x, y, areaWidth, areaHeight, sideEffects) => {
    // Cria canvas temporario para a midia
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = areaWidth
    tempCanvas.height = areaHeight
    const tempCtx = tempCanvas.getContext('2d')

    const imgAspect = img.width / img.height
    const areaAspect = areaWidth / areaHeight

    let drawWidth, drawHeight, drawX, drawY

    if (imgAspect > areaAspect) {
      drawHeight = areaHeight
      drawWidth = areaHeight * imgAspect
      drawX = (areaWidth - drawWidth) / 2
      drawY = 0
    } else {
      drawWidth = areaWidth
      drawHeight = areaWidth / imgAspect
      drawX = 0
      drawY = (areaHeight - drawHeight) / 2
    }

    // Desenha imagem no canvas temporario
    tempCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Aplica efeitos apenas se habilitado
    if (sideEffects && sideEffects.enabled) {
      applyEffects(tempCtx, tempCanvas, sideEffects)
    }

    // Copia para o canvas principal
    ctx.drawImage(tempCanvas, x, y)
  }

  // Midia esquerda
  drawMediaCover(leftImg, 0, mediaTop, mediaWidth, mediaHeight, effects.left)

  // Midia direita
  drawMediaCover(rightImg, mediaWidth + GAP, mediaTop, mediaWidth, mediaHeight, effects.right)

  // === LOGO CENTRAL ===
  // Centralizada vertical e horizontal na area de midia
  const logoCenterX = (WIDTH - LOGO_CENTER_SIZE) / 2
  const logoCenterY = mediaTop + (mediaHeight - LOGO_CENTER_SIZE) / 2
  ctx.drawImage(logo, logoCenterX, logoCenterY, LOGO_CENTER_SIZE, LOGO_CENTER_SIZE)

  // === FOOTER ===
  // Texto centralizado vertical e horizontalmente
  if (footer) {
    const footerTop = HEIGHT - FOOTER_HEIGHT
    const footerY = footerTop + FOOTER_HEIGHT / 2
    const MAX_TEXT_WIDTH = WIDTH - 100
    drawTextWithBold(ctx, footer, WIDTH / 2, footerY, FOOTER_FONT_SIZE, FONT_FAMILY, TEXT_COLOR, 'center', MAX_TEXT_WIDTH)
  }

  return canvas.toDataURL('image/jpeg', 0.95)
}

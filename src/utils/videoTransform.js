import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg = null

// Templates disponiveis
export const VIDEO_TEMPLATES = [
  { id: 'metropoles', label: 'Metropoles', slots: 1 },
  { id: 'choquei', label: 'Choquei', slots: 2 },
  { id: 'classico', label: 'Clássico', slots: 1 },
]

// Efeitos disponiveis
export const VIDEO_EFFECTS = [
  { id: 'blur', label: 'Blur', min: 0, max: 20, default: 0 },
  { id: 'noise', label: 'Ruido', min: 0, max: 50, default: 0 },
  { id: 'brightness', label: 'Brilho', min: -50, max: 50, default: 0 },
  { id: 'contrast', label: 'Contraste', min: -50, max: 50, default: 0 },
]

// Efeitos especificos do Metropoles
export const VIDEO_METROPOLES_EFFECTS = [
  { id: 'gradient', label: 'Intensidade Gradiente', min: 0, max: 100, default: 70 },
  { id: 'positionY', label: 'Posição Vertical', min: -50, max: 50, default: 0 },
]

export function isFFmpegLoaded() {
  return ffmpeg !== null && ffmpeg.loaded
}

export async function initFFmpeg() {
  if (isFFmpegLoaded()) return

  ffmpeg = new FFmpeg()

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })
}

// Carrega arquivo de imagem (logo) para o FFmpeg
async function loadImageToFFmpeg(imagePath, fileName) {
  const response = await fetch(imagePath)
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()
  await ffmpeg.writeFile(fileName, new Uint8Array(arrayBuffer))
}

// Gera filtro de efeitos para o video
function getEffectsFilter(effects = {}) {
  const filters = []

  if (effects.blur && effects.blur > 0) {
    filters.push(`boxblur=${effects.blur}:${effects.blur}`)
  }

  if (effects.brightness && effects.brightness !== 0) {
    const bright = effects.brightness / 50 // -1 a 1
    filters.push(`eq=brightness=${bright}`)
  }

  if (effects.contrast && effects.contrast !== 0) {
    const cont = 1 + (effects.contrast / 50) // 0.5 a 1.5
    filters.push(`eq=contrast=${cont}`)
  }

  if (effects.noise && effects.noise > 0) {
    filters.push(`noise=alls=${effects.noise}:allf=t`)
  }

  return filters.length > 0 ? filters.join(',') : null
}

// Remove formatação *bold* do texto para FFmpeg
function cleanTextForFFmpeg(text) {
  return text.replace(/\*/g, '').replace(/'/g, "\\'").replace(/:/g, "\\:")
}

// Quebra texto em linhas para caber na largura maxima
function wrapText(ctx, text, maxWidth) {
  const words = text.replace(/\*/g, '').split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)

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

// Desenha texto com quebra de linha
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, align = 'center') {
  const lines = wrapText(ctx, text, maxWidth)
  const startY = y - ((lines.length - 1) * lineHeight) / 2

  ctx.textAlign = align
  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * lineHeight)
  })

  return lines.length
}

// Cria imagem de overlay (gradiente + logo + texto) usando Canvas
async function createMetropolesOverlay(texts = {}, gradientIntensity = 0.7) {
  const { subtitle = '' } = texts

  const WIDTH = 1080
  const HEIGHT = 1920
  const LOGO_WIDTH = 800
  const LOGO_HEIGHT = 160
  const FOOTER_Y = HEIGHT - 420

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // Fundo transparente
  ctx.clearRect(0, 0, WIDTH, HEIGHT)

  // Gradiente preto
  const GRADIENT_START = 450
  const gradient = ctx.createLinearGradient(0, GRADIENT_START, 0, HEIGHT)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(0.3, `rgba(0, 0, 0, ${0.7 * gradientIntensity})`)
  gradient.addColorStop(0.6, `rgba(0, 0, 0, ${0.9 * gradientIntensity})`)
  gradient.addColorStop(1, `rgba(0, 0, 0, ${1 * gradientIntensity})`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, GRADIENT_START, WIDTH, HEIGHT - GRADIENT_START)

  // Carrega e desenha logo
  const logo = await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = '/images/logo-metropoles.webp'
  })

  const logoX = (WIDTH - LOGO_WIDTH) / 2
  ctx.drawImage(logo, logoX, FOOTER_Y, LOGO_WIDTH, LOGO_HEIGHT)

  // Adiciona texto se houver
  if (subtitle) {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '42px sans-serif'
    ctx.textBaseline = 'middle'
    const textY = FOOTER_Y + LOGO_HEIGHT + 70
    const maxWidth = WIDTH - 100 // Padding de 50px de cada lado
    drawWrappedText(ctx, subtitle, WIDTH / 2, textY, maxWidth, 52, 'center')
  }

  // Converte para blob PNG
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
}

// Carrega video de transparencia
async function loadTransparencyVideo() {
  const response = await fetch('/images/transparencia.mp4')
  const blob = await response.blob()
  return new Uint8Array(await blob.arrayBuffer())
}

// Template Metropoles - Video com gradiente, logo e texto
export async function applyVideoMetropoles(videoFile, texts = {}, effects = {}, onProgress = () => {}) {
  if (!isFFmpegLoaded()) {
    await initFFmpeg()
  }

  const gradientIntensity = (effects.left?.gradient ?? 70) / 100
  const positionY = effects.left?.positionY ?? 0

  // Dimensoes
  const WIDTH = 1080
  const HEIGHT = 1920

  // Arquivos
  const inputVideo = 'input_video.mp4'
  const overlayFile = 'overlay.png'
  const transparencyFile = 'transparency.mp4'
  const outputFile = `output_${Date.now()}.mp4`

  // Configura callback de progresso
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(progress)
  })

  // Carrega video
  await ffmpeg.writeFile(inputVideo, await fetchFile(videoFile))

  // Cria overlay com Canvas (gradiente + logo + texto)
  const overlayBlob = await createMetropolesOverlay(texts, gradientIntensity)
  await ffmpeg.writeFile(overlayFile, new Uint8Array(await overlayBlob.arrayBuffer()))

  // Carrega video de transparencia
  const transparencyData = await loadTransparencyVideo()
  await ffmpeg.writeFile(transparencyFile, transparencyData)

  // Calcula offset Y para posicao vertical
  const maxOffset = 200
  const offsetY = Math.round((positionY / 50) * maxOffset)

  // Monta filtro complexo
  let filterComplex = []

  // 1. Escala video para cobrir 1080x1920 com crop centralizado
  filterComplex.push(`[0:v]scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}:(iw-${WIDTH})/2:(ih-${HEIGHT})/2+${offsetY},setsar=1[scaled]`)

  // 2. Aplica efeitos se habilitado
  let videoLabel = 'scaled'
  if (effects.left?.enabled) {
    const effectsFilter = getEffectsFilter(effects.left)
    if (effectsFilter) {
      filterComplex.push(`[scaled]${effectsFilter}[effected]`)
      videoLabel = 'effected'
    }
  }

  // 3. Escala e aplica video de transparencia com 6% de opacidade
  filterComplex.push(`[2:v]scale=${WIDTH}:${HEIGHT},loop=-1:size=32767,format=rgba,colorchannelmixer=aa=0.06[transparency]`)
  filterComplex.push(`[${videoLabel}][transparency]overlay=0:0:shortest=1[with_trans]`)

  // 4. Aplica overlay (gradiente + logo + texto)
  filterComplex.push(`[with_trans][1:v]overlay=0:0[final]`)

  // Monta comando FFmpeg
  const command = [
    '-i', inputVideo,
    '-i', overlayFile,
    '-i', transparencyFile,
    '-filter_complex', filterComplex.join(';'),
    '-map', '[final]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-shortest',
    '-y', outputFile
  ]

  await ffmpeg.exec(command)

  // Le resultado
  const data = await ffmpeg.readFile(outputFile)

  // Limpa arquivos
  await ffmpeg.deleteFile(inputVideo)
  await ffmpeg.deleteFile(overlayFile)
  await ffmpeg.deleteFile(transparencyFile)
  await ffmpeg.deleteFile(outputFile)

  const blob = new Blob([data.buffer], { type: 'video/mp4' })
  return URL.createObjectURL(blob)
}

// Cria imagem de overlay para Choquei (fundo branco, header, footer, logos, textos)
async function createChoqueiOverlay(texts = {}) {
  const { title = '', subtitle = '', footer = '' } = texts

  const WIDTH = 1080
  const HEIGHT = 1920
  const GAP = 15
  const HEADER_HEIGHT = 330
  const FOOTER_HEIGHT = 330
  const HEADER_PADDING_LEFT = 80
  const LOGO_HEADER_SIZE = 200
  const LOGO_CENTER_SIZE = 190

  const mediaWidth = Math.floor((WIDTH - GAP) / 2)
  const mediaHeight = HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT
  const mediaTop = HEADER_HEIGHT

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // Fundo branco
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Area dos videos (transparente para mostrar os videos por baixo)
  // Na verdade, vamos criar um overlay separado apenas com header/footer/logos
  // O fundo branco fica apenas no header e footer

  // Limpa area central (onde vao os videos)
  ctx.clearRect(0, mediaTop, WIDTH, mediaHeight)

  // Carrega logo
  const logo = await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = '/images/logo-choquei.png'
  })

  // Logo no header
  const logoHeaderY = Math.floor((HEADER_HEIGHT - LOGO_HEADER_SIZE) / 2)
  ctx.drawImage(logo, HEADER_PADDING_LEFT, logoHeaderY, LOGO_HEADER_SIZE, LOGO_HEADER_SIZE)

  // Logo central
  const logoCenterX = Math.floor((WIDTH - LOGO_CENTER_SIZE) / 2)
  const logoCenterY = mediaTop + Math.floor((mediaHeight - LOGO_CENTER_SIZE) / 2)
  ctx.drawImage(logo, logoCenterX, logoCenterY, LOGO_CENTER_SIZE, LOGO_CENTER_SIZE)

  // Textos
  ctx.fillStyle = '#000000'
  ctx.textBaseline = 'middle'

  // Largura maxima para textos do header (ao lado da logo)
  const headerTextMaxWidth = WIDTH - HEADER_PADDING_LEFT - LOGO_HEADER_SIZE - 80

  // Titulo
  if (title) {
    ctx.font = 'bold 65px sans-serif'
    ctx.textAlign = 'left'
    const titleX = HEADER_PADDING_LEFT + LOGO_HEADER_SIZE + 40
    const titleY = Math.floor(HEADER_HEIGHT / 2) - (subtitle ? 35 : 0)

    // Quebra titulo se necessario
    const titleLines = wrapText(ctx, title, headerTextMaxWidth)
    titleLines.forEach((line, index) => {
      ctx.fillText(line, titleX, titleY + index * 70)
    })
  }

  // Subtexto
  if (subtitle) {
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'left'
    const subtitleX = HEADER_PADDING_LEFT + LOGO_HEADER_SIZE + 40
    const subtitleY = Math.floor(HEADER_HEIGHT / 2) + 50

    // Quebra subtexto se necessario
    const subtitleLines = wrapText(ctx, subtitle, headerTextMaxWidth)
    subtitleLines.forEach((line, index) => {
      ctx.fillText(line, subtitleX, subtitleY + index * 40)
    })
  }

  // Footer
  if (footer) {
    ctx.font = '32px sans-serif'
    const footerY = HEIGHT - FOOTER_HEIGHT + Math.floor(FOOTER_HEIGHT / 2)
    const footerMaxWidth = WIDTH - 100 // Padding de 50px de cada lado
    drawWrappedText(ctx, footer, WIDTH / 2, footerY, footerMaxWidth, 42, 'center')
  }

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
}

// Template Choquei - Dois videos lado a lado com logos e texto
export async function applyVideoChoquei(leftVideoFile, rightVideoFile, texts = {}, effects = {}, onProgress = () => {}) {
  if (!isFFmpegLoaded()) {
    await initFFmpeg()
  }

  // Dimensoes
  const WIDTH = 1080
  const HEIGHT = 1920
  const GAP = 15
  const HEADER_HEIGHT = 330
  const FOOTER_HEIGHT = 330

  const mediaWidth = Math.floor((WIDTH - GAP) / 2)
  const mediaHeight = HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT
  const mediaTop = HEADER_HEIGHT

  // Arquivos
  const leftInput = 'left_video.mp4'
  const rightInput = 'right_video.mp4'
  const overlayFile = 'overlay.png'
  const transparencyFile = 'transparency.mp4'
  const outputFile = `output_${Date.now()}.mp4`

  // Configura callback de progresso
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(progress)
  })

  // Carrega videos
  await ffmpeg.writeFile(leftInput, await fetchFile(leftVideoFile))
  await ffmpeg.writeFile(rightInput, await fetchFile(rightVideoFile))

  // Cria overlay com Canvas (header, footer, logos, textos)
  const overlayBlob = await createChoqueiOverlay(texts)
  await ffmpeg.writeFile(overlayFile, new Uint8Array(await overlayBlob.arrayBuffer()))

  // Carrega video de transparencia
  const transparencyData = await loadTransparencyVideo()
  await ffmpeg.writeFile(transparencyFile, transparencyData)

  // Monta filtro complexo
  let filterComplex = []

  // 1. Cria fundo branco
  filterComplex.push(`color=white:${WIDTH}x${HEIGHT}[bg]`)

  // 2. Escala video esquerdo
  let leftLabel = 'left_scaled'
  filterComplex.push(`[0:v]scale=${mediaWidth}:${mediaHeight}:force_original_aspect_ratio=increase,crop=${mediaWidth}:${mediaHeight}[${leftLabel}]`)

  // Aplica efeitos no video esquerdo se habilitado
  if (effects.left?.enabled) {
    const effectsFilter = getEffectsFilter(effects.left)
    if (effectsFilter) {
      filterComplex.push(`[${leftLabel}]${effectsFilter}[left_eff]`)
      leftLabel = 'left_eff'
    }
  }

  // 3. Escala video direito
  let rightLabel = 'right_scaled'
  filterComplex.push(`[1:v]scale=${mediaWidth}:${mediaHeight}:force_original_aspect_ratio=increase,crop=${mediaWidth}:${mediaHeight}[${rightLabel}]`)

  // Aplica efeitos no video direito se habilitado
  if (effects.right?.enabled) {
    const effectsFilter = getEffectsFilter(effects.right)
    if (effectsFilter) {
      filterComplex.push(`[${rightLabel}]${effectsFilter}[right_eff]`)
      rightLabel = 'right_eff'
    }
  }

  // 4. Coloca videos lado a lado sobre o fundo branco
  filterComplex.push(`[bg][${leftLabel}]overlay=0:${mediaTop}[with_left]`)
  filterComplex.push(`[with_left][${rightLabel}]overlay=${mediaWidth + GAP}:${mediaTop}[with_videos]`)

  // 5. Escala e aplica video de transparencia com 6% de opacidade (apenas na area dos videos)
  filterComplex.push(`[3:v]scale=${WIDTH}:${mediaHeight},loop=-1:size=32767,format=rgba,colorchannelmixer=aa=0.06[transparency]`)
  filterComplex.push(`[with_videos][transparency]overlay=0:${mediaTop}:shortest=1[with_trans]`)

  // 6. Aplica overlay (header, footer, logos, textos)
  filterComplex.push(`[with_trans][2:v]overlay=0:0[final]`)

  // Monta comando FFmpeg
  const command = [
    '-i', leftInput,
    '-i', rightInput,
    '-i', overlayFile,
    '-i', transparencyFile,
    '-filter_complex', filterComplex.join(';'),
    '-map', '[final]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-shortest',
    '-y', outputFile
  ]

  await ffmpeg.exec(command)

  // Le resultado
  const data = await ffmpeg.readFile(outputFile)

  // Limpa arquivos
  await ffmpeg.deleteFile(leftInput)
  await ffmpeg.deleteFile(rightInput)
  await ffmpeg.deleteFile(overlayFile)
  await ffmpeg.deleteFile(transparencyFile)
  await ffmpeg.deleteFile(outputFile)

  const blob = new Blob([data.buffer], { type: 'video/mp4' })
  return URL.createObjectURL(blob)
}

// Carrega imagem de milisegundos
async function loadMillisecondsImage() {
  const response = await fetch('/images/milisegundos.png')
  const blob = await response.blob()
  return new Uint8Array(await blob.arrayBuffer())
}

// Carrega video do relogio
async function loadRelogioVideo() {
  const response = await fetch('/images/relogio.mp4')
  const blob = await response.blob()
  return new Uint8Array(await blob.arrayBuffer())
}

// Template Classico - Video com imagem inicial, transparencia e video final
export async function applyVideoClassico(videoFile, effects = {}, onProgress = () => {}) {
  if (!isFFmpegLoaded()) {
    await initFFmpeg()
  }

  const WIDTH = 1080
  const HEIGHT = 1920
  const ts = Date.now()

  // Arquivos
  const inputVideo = `in_${ts}.mp4`
  const introVideo = `intro_${ts}.mp4`
  const mainVideo = `main_${ts}.mp4`
  const relogioScaled = `relogio_${ts}.mp4`
  const outputFile = `out_${ts}.mp4`

  const filesToCleanup = []

  try {
    console.log('[Classico] Carregando arquivos...')
    onProgress(0.05)

    await ffmpeg.writeFile(inputVideo, await fetchFile(videoFile))
    filesToCleanup.push(inputVideo)

    await ffmpeg.writeFile('ms.png', await loadMillisecondsImage())
    filesToCleanup.push('ms.png')

    await ffmpeg.writeFile('relogio.mp4', await loadRelogioVideo())
    filesToCleanup.push('relogio.mp4')

    onProgress(0.1)

    // PASSO 1: Criar video da imagem (0.1 segundo) sem audio (sera adicionado depois)
    console.log('[Classico] Passo 1: Criando intro da imagem...')
    let result = await ffmpeg.exec([
      '-loop', '1',
      '-i', 'ms.png',
      '-c:v', 'libx264',
      '-t', '0.1',
      '-pix_fmt', 'yuv420p',
      '-vf', `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`,
      '-r', '30',
      '-preset', 'ultrafast',
      '-an',
      '-y', introVideo
    ])
    console.log('[Classico] Passo 1 resultado:', result)
    filesToCleanup.push(introVideo)
    onProgress(0.2)

    // PASSO 2: Processar video principal com efeitos
    console.log('[Classico] Passo 2: Processando video principal...')

    // Monta filtro: escala + crop + fps + efeitos opcionais
    let vf = `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=30`

    // Adiciona efeitos se habilitado
    if (effects.left?.enabled) {
      if (effects.left.blur > 0) vf += `,boxblur=${effects.left.blur}:${effects.left.blur}`
      if (effects.left.brightness !== 0) vf += `,eq=brightness=${effects.left.brightness / 50}`
      if (effects.left.contrast !== 0) vf += `,eq=contrast=${1 + effects.left.contrast / 50}`
      if (effects.left.noise > 0) vf += `,noise=alls=${effects.left.noise}:allf=t`
    }

    result = await ffmpeg.exec([
      '-i', inputVideo,
      '-vf', vf,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-y', mainVideo
    ])
    console.log('[Classico] Passo 2 resultado:', result)
    filesToCleanup.push(mainVideo)
    onProgress(0.4)

    // PASSO 3: Escalar video do relogio (sem audio, limitado a 1m30s)
    console.log('[Classico] Passo 3: Escalando relogio...')
    result = await ffmpeg.exec([
      '-i', 'relogio.mp4',
      '-t', '90',
      '-vf', `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=30`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-y', relogioScaled
    ])
    console.log('[Classico] Passo 3 resultado:', result)
    filesToCleanup.push(relogioScaled)
    onProgress(0.6)

    // PASSO 4: Concatenar os 3 videos (apenas video, sem audio)
    console.log('[Classico] Passo 4: Concatenando videos...')
    const concatVideo = `concat_${ts}.mp4`

    const concatList = `file '${introVideo}'
file '${mainVideo}'
file '${relogioScaled}'`
    await ffmpeg.writeFile('list.txt', concatList)
    filesToCleanup.push('list.txt')

    result = await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'list.txt',
      '-c', 'copy',
      '-y', concatVideo
    ])
    console.log('[Classico] Passo 4 resultado:', result)
    filesToCleanup.push(concatVideo)
    onProgress(0.75)

    // PASSO 5: Adicionar audio original
    // Extrai audio do video original e adiciona ao video concatenado
    console.log('[Classico] Passo 5: Adicionando audio...')

    // Primeiro tenta extrair o audio
    const audioFile = `audio_${ts}.aac`
    result = await ffmpeg.exec([
      '-i', inputVideo,
      '-vn',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y', audioFile
    ])

    if (result === 0) {
      // Combina video + audio
      filesToCleanup.push(audioFile)
      result = await ffmpeg.exec([
        '-i', concatVideo,
        '-i', audioFile,
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-y', outputFile
      ])

      if (result !== 0) {
        console.log('[Classico] Falha ao combinar, usando video sem audio...')
        await ffmpeg.exec(['-i', concatVideo, '-c', 'copy', '-y', outputFile])
      }
    } else {
      // Video sem audio, copia direto
      console.log('[Classico] Video sem audio, copiando...')
      await ffmpeg.exec(['-i', concatVideo, '-c', 'copy', '-y', outputFile])
    }

    console.log('[Classico] Passo 5 resultado:', result)
    filesToCleanup.push(outputFile)
    onProgress(0.9)

    // Ler resultado
    const data = await ffmpeg.readFile(outputFile)
    console.log('[Classico] Tamanho final:', data.length, 'bytes')

    if (data.length < 1000) {
      throw new Error('Video de saida vazio ou corrompido')
    }

    // Limpar
    for (const f of filesToCleanup) {
      await ffmpeg.deleteFile(f).catch(() => {})
    }

    onProgress(1)
    console.log('[Classico] Concluido!')

    return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))

  } catch (error) {
    console.error('[Classico] Erro:', error)
    for (const f of filesToCleanup) {
      await ffmpeg.deleteFile(f).catch(() => {})
    }
    throw error
  }
}

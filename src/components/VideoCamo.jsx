import { useState, useRef, useEffect } from 'react'
import {
  VIDEO_TEMPLATES,
  VIDEO_EFFECTS,
  VIDEO_METROPOLES_EFFECTS,
  initFFmpeg,
  isFFmpegLoaded,
  applyVideoMetropoles,
  applyVideoChoquei,
  applyVideoClassico
} from '../utils/videoTransform'

function VideoCamo() {
  const [template, setTemplate] = useState('metropoles')
  const [videos, setVideos] = useState({ left: null, right: null })
  const [videoFiles, setVideoFiles] = useState({ left: null, right: null })
  const [texts, setTexts] = useState({ title: '', subtitle: '', footer: '' })
  const [effects, setEffects] = useState({
    left: { enabled: false, blur: 0, noise: 0, brightness: 0, contrast: 0, gradient: 70, positionY: 0 },
    right: { enabled: false, blur: 0, noise: 0, brightness: 0, contrast: 0, gradient: 70, positionY: 0 }
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [ffmpegReady, setFfmpegReady] = useState(false)
  const [ffmpegLoading, setFfmpegLoading] = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const leftInputRef = useRef(null)
  const rightInputRef = useRef(null)

  const currentTemplate = VIDEO_TEMPLATES.find(t => t.id === template)
  const needsTwoSlots = currentTemplate?.slots === 2
  const isChoquei = template === 'choquei'
  const isClassico = template === 'classico'

  // Carrega FFmpeg ao montar
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (isFFmpegLoaded()) {
        setFfmpegReady(true)
        return
      }

      setFfmpegLoading(true)
      try {
        await initFFmpeg()
        setFfmpegReady(true)
      } catch (err) {
        console.error('Erro ao carregar FFmpeg:', err)
      } finally {
        setFfmpegLoading(false)
      }
    }

    loadFFmpeg()
  }, [])

  const handleFileSelect = (file, side) => {
    if (!file) return

    // Aceita video/* ou arquivos com extensao de video comum
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v']
    const isVideo = file.type.startsWith('video/') ||
      videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!isVideo) {
      console.error('[VideoCamo] Arquivo não é um video:', file.type, file.name)
      alert('Por favor, selecione um arquivo de vídeo válido.')
      return
    }

    console.log('[VideoCamo] Carregando video:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    })

    // Revoga URL anterior se existir
    if (videos[side]) {
      URL.revokeObjectURL(videos[side])
    }

    const videoUrl = URL.createObjectURL(file)

    // Testa se o video pode ser carregado
    const testVideo = document.createElement('video')
    testVideo.onloadedmetadata = () => {
      console.log('[VideoCamo] Video carregado com sucesso:', {
        duration: `${testVideo.duration.toFixed(2)}s`,
        width: testVideo.videoWidth,
        height: testVideo.videoHeight
      })
      setVideoFiles(prev => ({ ...prev, [side]: file }))
      setVideos(prev => ({ ...prev, [side]: videoUrl }))
      setResult(null)
    }
    testVideo.onerror = (e) => {
      console.error('[VideoCamo] Erro ao carregar video:', e)
      URL.revokeObjectURL(videoUrl)
      alert('Erro ao carregar o vídeo. O formato pode não ser suportado pelo navegador.')
    }
    testVideo.src = videoUrl
  }

  const handleDrop = (e, side) => {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file, side)
  }

  const handleDragOver = (e, side) => {
    e.preventDefault()
    setDragOver(side)
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const canGenerate = () => {
    if (!ffmpegReady) return false
    if (needsTwoSlots) {
      return videoFiles.left && videoFiles.right
    }
    return videoFiles.left
  }

  const handleGenerate = async () => {
    if (!canGenerate()) return
    setLoading(true)
    setProgress(0)

    try {
      let resultVideo
      if (template === 'metropoles') {
        resultVideo = await applyVideoMetropoles(videoFiles.left, texts, effects, (p) => {
          setProgress(Math.round(p * 100))
        })
      } else if (template === 'choquei') {
        resultVideo = await applyVideoChoquei(videoFiles.left, videoFiles.right, texts, effects, (p) => {
          setProgress(Math.round(p * 100))
        })
      } else if (template === 'classico') {
        resultVideo = await applyVideoClassico(videoFiles.left, effects, (p) => {
          setProgress(Math.round(p * 100))
        })
      }
      setResult(resultVideo)
    } catch (err) {
      console.error('Erro ao gerar video:', err)
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const link = document.createElement('a')
    link.href = result
    link.download = `hotghost_${template}_${Date.now()}.mp4`
    link.click()
  }

  const defaultEffects = { enabled: false, blur: 0, noise: 0, brightness: 0, contrast: 0, gradient: 70, positionY: 0 }

  const handleClear = () => {
    if (videos.left) URL.revokeObjectURL(videos.left)
    if (videos.right) URL.revokeObjectURL(videos.right)
    if (result) URL.revokeObjectURL(result)

    setVideos({ left: null, right: null })
    setVideoFiles({ left: null, right: null })
    setTexts({ title: '', subtitle: '', footer: '' })
    setEffects({ left: { ...defaultEffects }, right: { ...defaultEffects } })
    setResult(null)
    if (leftInputRef.current) leftInputRef.current.value = ''
    if (rightInputRef.current) rightInputRef.current.value = ''
  }

  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate)
    if (videos.left) URL.revokeObjectURL(videos.left)
    if (videos.right) URL.revokeObjectURL(videos.right)
    if (result) URL.revokeObjectURL(result)

    setVideos({ left: null, right: null })
    setVideoFiles({ left: null, right: null })
    setTexts({ title: '', subtitle: '', footer: '' })
    setEffects({ left: { ...defaultEffects }, right: { ...defaultEffects } })
    setResult(null)
  }

  const handleTextChange = (field, value) => {
    setTexts(prev => ({ ...prev, [field]: value }))
    setResult(null)
  }

  const handleEffectToggle = (side) => {
    setEffects(prev => ({
      ...prev,
      [side]: { ...prev[side], enabled: !prev[side].enabled }
    }))
    setResult(null)
  }

  const handleEffectChange = (side, effectId, value) => {
    setEffects(prev => ({
      ...prev,
      [side]: { ...prev[side], [effectId]: Number(value) }
    }))
    setResult(null)
  }

  const renderDropZone = (side, label) => {
    const video = videos[side]
    const inputRef = side === 'left' ? leftInputRef : rightInputRef
    const sideEffects = effects[side]

    return (
      <div className="media-slot">
        <div
          className={`drop-zone ${dragOver === side ? 'drag-over' : ''} ${video ? 'has-video' : ''}`}
          onDrop={(e) => handleDrop(e, side)}
          onDragOver={(e) => handleDragOver(e, side)}
          onDragLeave={handleDragLeave}
          onClick={() => !video && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e.target.files[0], side)}
            style={{ display: 'none' }}
          />
          {video ? (
            <div className="video-preview">
              <video src={video} controls />
              <button className="change-btn" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
                Trocar
              </button>
            </div>
          ) : (
            <div className="drop-content">
              <span className="drop-icon">[VID]</span>
              <p>{label}</p>
              <p className="text-dim">Clique ou arraste</p>
            </div>
          )}
        </div>

        {video && (
          <div className="effect-box">
            <label className="effect-toggle">
              <input
                type="checkbox"
                checked={sideEffects.enabled}
                onChange={() => handleEffectToggle(side)}
              />
              <span>Aplicar efeitos</span>
            </label>

            {sideEffects.enabled && (
              <div className="effect-controls">
                {VIDEO_EFFECTS.map((effect) => (
                  <div key={effect.id} className="effect-control">
                    <div className="effect-header">
                      <span>{effect.label}</span>
                      <span className="effect-value">
                        {sideEffects[effect.id]}{effect.id === 'blur' ? 'px' : '%'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={effect.min}
                      max={effect.max}
                      value={sideEffects[effect.id]}
                      onChange={(e) => handleEffectChange(side, effect.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {!isChoquei && !isClassico && (
              <div className="effect-controls gradient-controls">
                <label className="label">Ajustes Metrópoles</label>
                {VIDEO_METROPOLES_EFFECTS.map((effect) => (
                  <div key={effect.id} className="effect-control">
                    <div className="effect-header">
                      <span>{effect.label}</span>
                      <span className="effect-value">
                        {effect.id === 'positionY'
                          ? (sideEffects[effect.id] < 0 ? `↑ ${Math.abs(sideEffects[effect.id])}` : sideEffects[effect.id] > 0 ? `↓ ${sideEffects[effect.id]}` : '0')
                          : `${sideEffects[effect.id]}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={effect.min}
                      max={effect.max}
                      value={sideEffects[effect.id]}
                      onChange={(e) => handleEffectChange(side, effect.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="video-camo">
      {ffmpegLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Carregando...</p>
            <p className="text-dim">Isso pode levar alguns segundos</p>
          </div>
        </div>
      )}

      <div className="template-select">
        <label className="label">Template:</label>
        <div className="template-buttons">
          {VIDEO_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`template-btn ${template === t.id ? 'active' : ''}`}
              onClick={() => handleTemplateChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`upload-area ${needsTwoSlots ? 'two-videos' : 'one-video'}`}>
        {renderDropZone('left', needsTwoSlots ? 'Video Esquerdo' : 'Selecionar Video')}
        {needsTwoSlots && renderDropZone('right', 'Video Direito')}
      </div>

      {!isClassico && (
        <div className="text-fields">
          {isChoquei && (
            <>
              <div className="field">
                <label className="label">Titulo</label>
                <input
                  type="text"
                  value={texts.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  placeholder="Titulo ao lado da logo..."
                />
              </div>
              <div className="field">
                <label className="label">Subtexto</label>
                <input
                  type="text"
                  value={texts.subtitle}
                  onChange={(e) => handleTextChange('subtitle', e.target.value)}
                  placeholder="Texto abaixo do titulo..."
                />
              </div>
              <div className="field">
                <label className="label">Footer</label>
                <input
                  type="text"
                  value={texts.footer}
                  onChange={(e) => handleTextChange('footer', e.target.value)}
                  placeholder="Texto do rodape (centralizado)..."
                />
              </div>
            </>
          )}
          {!isChoquei && (
            <div className="field">
              <label className="label">Texto</label>
              <input
                type="text"
                value={texts.subtitle}
                onChange={(e) => handleTextChange('subtitle', e.target.value)}
                placeholder="Texto abaixo da logo..."
              />
            </div>
          )}
        </div>
      )}

      <div className="controls">
        <button
          className="primary"
          onClick={handleGenerate}
          disabled={!canGenerate() || loading}
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <span className="spinner"></span> {progress}%
            </span>
          ) : (
            '> Gerar'
          )}
        </button>
        {result && (
          <button onClick={handleDownload}>
            {'>'} Download
          </button>
        )}
        <button onClick={handleClear}>
          {'>'} Limpar
        </button>
      </div>

      {result && (
        <div className="result-section">
          <label className="label">Resultado</label>
          <div className="result-preview">
            <video src={result} controls />
          </div>
        </div>
      )}

      <div className="info card">
        <p className="text-dim">
          <strong className="text-bright">Info:</strong> {needsTwoSlots
            ? 'O template Choquei combina dois videos lado a lado com logo e textos personalizaveis.'
            : isClassico
              ? 'O template Clássico adiciona uma imagem inicial (milisegundos), overlay de transparência e vídeo do relógio no final.'
              : 'O template Metropoles aplica seu video com gradiente escuro, logo e texto no rodape.'}
        </p>
        <p className="text-dim" style={{ marginTop: '8px' }}>
          <strong className="text-bright">Aviso:</strong> O processamento de video pode levar alguns minutos dependendo do tamanho do arquivo.
        </p>
      </div>

      <style>{`
        .video-camo {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          position: relative;
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 10, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }
        .template-select {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .template-buttons {
          display: flex;
          gap: var(--space-1);
        }
        .template-btn {
          padding: var(--space-1) var(--space-3);
          border: var(--border-width) solid var(--color-border);
          background: var(--bg-secondary);
          color: var(--color-text-dim);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .template-btn:hover {
          border-color: var(--color-text-dim);
        }
        .template-btn.active {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: var(--color-secondary);
        }
        .label {
          font-size: var(--font-size-sm);
          color: var(--color-text-dim);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .upload-area {
          display: grid;
          gap: var(--space-3);
        }
        .upload-area.one-video {
          grid-template-columns: 1fr;
        }
        .upload-area.two-videos {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 600px) {
          .upload-area.two-videos {
            grid-template-columns: 1fr;
          }
        }
        .drop-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--border-radius);
          padding: var(--space-4);
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drop-zone:hover,
        .drop-zone.drag-over {
          border-color: var(--color-primary);
          background: var(--color-secondary);
        }
        .drop-zone.has-video {
          padding: var(--space-2);
          cursor: default;
        }
        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
        }
        .drop-icon {
          font-size: var(--font-size-xl);
          color: var(--color-text-dim);
        }
        .video-preview {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }
        .video-preview video {
          max-width: 100%;
          max-height: 250px;
          border-radius: var(--border-radius);
        }
        .change-btn {
          padding: var(--space-1) var(--space-2);
          font-size: var(--font-size-sm);
        }
        .text-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .text-fields .field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .text-fields input {
          width: 100%;
          padding: var(--space-2);
          border: var(--border-width) solid var(--color-border);
          border-radius: var(--border-radius);
          background: var(--bg-secondary);
          color: var(--color-text);
          font-size: var(--font-size-base);
        }
        .text-fields input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .media-slot {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .effect-box {
          padding: var(--space-2);
          border: var(--border-width) solid var(--color-border);
          border-radius: var(--border-radius);
          background: var(--bg-secondary);
        }
        .effect-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
          font-size: var(--font-size-sm);
        }
        .effect-toggle input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--color-primary);
        }
        .effect-controls {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: var(--border-width) solid var(--color-border);
        }
        .gradient-controls {
          margin-top: var(--space-2);
        }
        .gradient-controls .label {
          margin-bottom: var(--space-1);
        }
        .effect-control {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .effect-header {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-sm);
        }
        .effect-value {
          color: var(--color-primary);
          font-weight: bold;
        }
        .effect-control input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--color-border);
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
        }
        .effect-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
        }
        .effect-control input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: none;
        }
        .controls {
          display: flex;
          gap: var(--space-2);
        }
        .result-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .result-preview {
          border: var(--border-width) solid var(--color-border);
          border-radius: var(--border-radius);
          background: var(--bg-secondary);
          padding: var(--space-2);
          display: flex;
          justify-content: center;
        }
        .result-preview video {
          max-width: 100%;
          max-height: 500px;
        }
        .info {
          margin-top: var(--space-2);
        }
        .text-bright {
          color: var(--color-text);
        }
      `}</style>
    </div>
  )
}

export default VideoCamo

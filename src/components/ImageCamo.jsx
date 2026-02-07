import { useState, useRef } from 'react'
import { TEMPLATES, EFFECTS, METROPOLES_EFFECTS, applyMetropoles, applyChoquei } from '../utils/imageTransform'

function ImageCamo() {
  const [template, setTemplate] = useState('metropoles')
  const [images, setImages] = useState({ left: null, right: null })
  const [texts, setTexts] = useState({ title: '', subtitle: '', footer: '' })
  const [effects, setEffects] = useState({
    left: { enabled: false, blur: 0, noise: 0, brightness: 0, contrast: 0, gradient: 70, positionY: 0 },
    right: { enabled: false, blur: 0, noise: 0, brightness: 0, contrast: 0, gradient: 70, positionY: 0 }
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const leftInputRef = useRef(null)
  const rightInputRef = useRef(null)

  const currentTemplate = TEMPLATES.find(t => t.id === template)
  const needsTwoSlots = currentTemplate?.slots === 2
  const isChoquei = template === 'choquei'

  const handleFileSelect = (file, side) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setImages(prev => ({ ...prev, [side]: e.target.result }))
      setResult(null)
    }
    reader.readAsDataURL(file)
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
    if (needsTwoSlots) {
      return images.left && images.right
    }
    return images.left
  }

  const handleGenerate = async () => {
    if (!canGenerate()) return
    setLoading(true)

    try {
      let resultImage
      if (template === 'metropoles') {
        resultImage = await applyMetropoles(images.left, texts, effects)
      } else if (template === 'choquei') {
        resultImage = await applyChoquei(images.left, images.right, texts, effects)
      }
      setResult(resultImage)
    } catch (err) {
      console.error('Erro ao gerar imagem:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const link = document.createElement('a')
    link.href = result
    link.download = `hotghost_${template}_${Date.now()}.${template === 'choquei' ? 'jpg' : 'png'}`
    link.click()
  }

  const defaultEffects = { enabled: false, blur: 0, noise: 0, brightness: 0, contrast: 0, gradient: 70, positionY: 0 }

  const handleClear = () => {
    setImages({ left: null, right: null })
    setTexts({ title: '', subtitle: '', footer: '' })
    setEffects({ left: { ...defaultEffects }, right: { ...defaultEffects } })
    setResult(null)
    if (leftInputRef.current) leftInputRef.current.value = ''
    if (rightInputRef.current) rightInputRef.current.value = ''
  }

  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate)
    setImages({ left: null, right: null })
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
    const image = images[side]
    const inputRef = side === 'left' ? leftInputRef : rightInputRef
    const sideEffects = effects[side]

    return (
      <div className="media-slot">
        <div
          className={`drop-zone ${dragOver === side ? 'drag-over' : ''} ${image ? 'has-image' : ''}`}
          onDrop={(e) => handleDrop(e, side)}
          onDragOver={(e) => handleDragOver(e, side)}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files[0], side)}
            style={{ display: 'none' }}
          />
          {image ? (
            <img src={image} alt={label} className="preview-thumb" />
          ) : (
            <div className="drop-content">
              <span className="drop-icon">[IMG]</span>
              <p>{label}</p>
              <p className="text-dim">Clique ou arraste</p>
            </div>
          )}
        </div>

        {image && (
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
                {EFFECTS.map((effect) => (
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

            {!isChoquei && (
              <div className="effect-controls gradient-controls">
                <label className="label">Ajustes Metrópoles</label>
                {METROPOLES_EFFECTS.map((effect) => (
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
    <div className="image-camo">
      <div className="template-select">
        <label className="label">Template:</label>
        <div className="template-buttons">
          {TEMPLATES.map((t) => (
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

      <div className={`upload-area ${needsTwoSlots ? 'two-images' : 'one-image'}`}>
        {renderDropZone('left', needsTwoSlots ? 'Imagem Esquerda' : 'Selecionar Imagem')}
        {needsTwoSlots && renderDropZone('right', 'Imagem Direita')}
      </div>

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
        <p className="hint">Use *texto* para deixar em <strong>negrito</strong></p>
      </div>

      <div className="controls">
        <button
          className="primary"
          onClick={handleGenerate}
          disabled={!canGenerate() || loading}
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <span className="spinner"></span> Gerando...
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
            <img src={result} alt="Resultado" />
          </div>
        </div>
      )}

      <div className="info card">
        <p className="text-dim">
          <strong className="text-bright">Info:</strong> {needsTwoSlots
            ? 'O template Choquei combina duas imagens lado a lado com logo e textos personalizaveis.'
            : 'O template Metropoles aplica sua imagem com gradiente escuro, logo e texto no rodape.'}
        </p>
      </div>

      <style>{`
        .image-camo {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
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
        .upload-area.one-image {
          grid-template-columns: 1fr;
        }
        .upload-area.two-images {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 600px) {
          .upload-area.two-images {
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
        .drop-zone.has-image {
          padding: var(--space-2);
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
        .preview-thumb {
          max-width: 100%;
          max-height: 250px;
          object-fit: contain;
          border-radius: var(--border-radius);
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
        .text-fields .hint {
          font-size: var(--font-size-sm);
          color: var(--color-text-dim);
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
        .result-preview img {
          max-width: 100%;
          max-height: 500px;
          object-fit: contain;
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

export default ImageCamo

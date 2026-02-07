import { useState } from 'react'
import { transformText } from '../utils/textTransform'

function TextCamo() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [copied, setCopied] = useState(false)

  const handleTransform = () => {
    if (!inputText.trim()) return
    const result = transformText(inputText)
    setOutputText(result)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setCopied(false)
  }

  return (
    <div className="text-camo">
      <div className="section">
        <label className="label">Texto Original</label>
        <textarea
          className="input-area"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Cole seu texto aqui..."
        />
      </div>

      <div className="controls">
        <button className="primary" onClick={handleTransform} disabled={!inputText.trim()}>
          {'>'} Camuflar
        </button>
        <button onClick={handleClear}>
          {'>'} Limpar
        </button>
      </div>

      <div className="section">
        <div className="output-header">
          <label className="label">Texto Camuflado</label>
          {outputText && (
            <button onClick={handleCopy}>
              {copied ? '[ Copiado! ]' : '> Copiar'}
            </button>
          )}
        </div>
        <div className="output-area">
          {outputText || <span className="placeholder">O texto camuflado aparecera aqui...</span>}
        </div>
      </div>

      <div className="info card">
        <p className="text-dim">
          <strong className="text-bright">Info:</strong> O texto camuflado usa caracteres Unicode visualmente
          identicos mas com codigos diferentes, tornando-o unico para sistemas de deteccao.
        </p>
      </div>

      <style>{`
        .text-camo {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .section {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .label {
          font-size: var(--font-size-sm);
          color: var(--color-text-dim);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .input-area {
          min-height: 150px;
          width: 100%;
        }
        .controls {
          display: flex;
          gap: var(--space-2);
        }
        .output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .output-area {
          min-height: 150px;
          padding: var(--space-2);
          border: var(--border-width) solid var(--color-border);
          border-radius: var(--border-radius);
          background: var(--bg-secondary);
          white-space: pre-wrap;
          word-break: break-word;
        }
        .placeholder {
          color: var(--color-text-dim);
          font-style: italic;
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

export default TextCamo

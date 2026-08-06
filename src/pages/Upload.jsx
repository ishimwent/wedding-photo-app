import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Upload.css'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function randomFilename(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const safe = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
  return `${crypto.randomUUID()}.${safe}`
}

export default function Upload() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'gallery'
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setError('')

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed.')
      return
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a photo first.'); return }
    setUploading(true)
    setError('')

    try {
      const filename = randomFilename(file)
      const storagePath = `photos/${filename}`

      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .upload(storagePath, file, { contentType: file.type, upsert: false })

      if (storageError) throw storageError

      const { error: dbError } = await supabase.from('photos').insert({
        guest_name: guestName.trim() || null,
        caption: caption.trim() || null,
        storage_path: storagePath,
        status: 'approved',
      })

      if (dbError) {
        await supabase.storage.from('wedding-photos').remove([storagePath])
        throw dbError
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setGuestName('')
    setCaption('')
    setError('')
    setSuccess(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (success) {
    return (
      <div className="upload-page">
        <div className="success-card card">
          <div className="success-icon">🎉</div>
          <h2>Thank you for sharing this memory!</h2>
          <p>Your photo has been submitted and will appear in the gallery once approved.</p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={handleReset}>UPLOAD ANOTHER</button>
            <button className="btn btn-gold" onClick={() => navigate('/gallery')}>VIEW GALLERY</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-page">
      <div className="upload-container card">
        <h2 className="upload-title">{mode === 'camera' ? '📸 Take a Photo' : '🖼️ Choose a Photo'}</h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture={mode === 'camera' ? 'environment' : undefined}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />

        {!preview ? (
          <label htmlFor="file-input" className="upload-dropzone">
            <span className="dropzone-icon">{mode === 'camera' ? '📷' : '🖼️'}</span>
            <span className="dropzone-text">{mode === 'camera' ? 'Tap to open camera' : 'Tap to choose photo'}</span>
            <span className="dropzone-hint">JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB</span>
          </label>
        ) : (
          <div className="preview-wrap">
            <img src={preview} alt="Preview" className="preview-img" />
            <button className="btn btn-secondary btn-sm change-btn" onClick={() => fileInputRef.current?.click()}>
              Change Photo
            </button>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Your Name (optional)</label>
          <input
            type="text"
            placeholder="e.g. John & Mary"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            maxLength={80}
          />
        </div>

        <div className="form-group">
          <label>Caption (optional)</label>
          <textarea
            placeholder="Share a message or memory..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            maxLength={300}
          />
        </div>

        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Uploading...' : '💌 Share This Memory'}
        </button>
        <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate('/')}>
          Cancel
        </button>
      </div>
    </div>
  )
}

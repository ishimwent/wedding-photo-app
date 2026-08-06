import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Gallery.css'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('photos')
      .select('id, guest_name, caption, storage_path, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error) setPhotos(data || [])
    setLoading(false)
  }

  const getUrl = (path) => {
    const { data } = supabase.storage.from('wedding-photos').getPublicUrl(path)
    return data.publicUrl
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="gallery-page page">
      <div className="gallery-header">
        <h1>💍 Wedding Gallery</h1>
        <p>Memories shared by our guests</p>
      </div>

      {photos.length === 0 ? (
        <div className="gallery-empty">
          <p>📷 No photos yet — be the first to share a memory!</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map(photo => (
            <div key={photo.id} className="gallery-item" onClick={() => setLightbox(photo)}>
              <img src={getUrl(photo.storage_path)} alt={photo.caption || 'Wedding photo'} loading="lazy" />
              {(photo.guest_name || photo.caption) && (
                <div className="gallery-overlay">
                  {photo.guest_name && <span className="overlay-name">{photo.guest_name}</span>}
                  {photo.caption && <span className="overlay-caption">{photo.caption}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={getUrl(lightbox.storage_path)} alt={lightbox.caption || 'Wedding photo'} />
            {(lightbox.guest_name || lightbox.caption) && (
              <div className="lightbox-info">
                {lightbox.guest_name && <p className="lb-name">📸 {lightbox.guest_name}</p>}
                {lightbox.caption && <p className="lb-caption">"{lightbox.caption}"</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

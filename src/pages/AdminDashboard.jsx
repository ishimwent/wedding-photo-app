import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

const STATUS_LABELS = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' }

export default function AdminDashboard() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { fetchPhotos() }, [])

  const fetchPhotos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError(`Fetch error (${error.code}): ${error.message}`)
      console.error('fetchPhotos error:', error)
    } else {
      setPhotos(data || [])
      console.log('fetchPhotos result:', data)
    }
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    setActionLoading(id + status)
    const { error } = await supabase.from('photos').update({ status }).eq('id', id)
    if (error) setError(error.message)
    else setPhotos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    setActionLoading(null)
  }

  const deletePhoto = async (photo) => {
    if (!window.confirm('Delete this photo permanently?')) return
    setActionLoading(photo.id + 'delete')
    const { error: storageErr } = await supabase.storage.from('wedding-photos').remove([photo.storage_path])
    if (storageErr) { setError(storageErr.message); setActionLoading(null); return }
    const { error: dbErr } = await supabase.from('photos').delete().eq('id', photo.id)
    if (dbErr) setError(dbErr.message)
    else setPhotos(prev => prev.filter(p => p.id !== photo.id))
    setActionLoading(null)
  }

  const getUrl = (path) => supabase.storage.from('wedding-photos').getPublicUrl(path).data.publicUrl

  const counts = {
    all: photos.length,
    pending: photos.filter(p => p.status === 'pending').length,
    approved: photos.filter(p => p.status === 'approved').length,
    rejected: photos.filter(p => p.status === 'rejected').length,
  }

  const filtered = filter === 'all' ? photos : photos.filter(p => p.status === filter)

  if (loading) return <div className="spinner" />

  return (
    <div className="admin-page page">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
      </div>

      {error && <div className="alert alert-error" style={{ margin: '0 16px 16px' }}>{error}</div>}

      <div className="stats-row">
        {Object.entries(counts).map(([key, val]) => (
          <div key={key} className={`stat-card ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            <span className="stat-num">{val}</span>
            <span className="stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
          </div>
        ))}
      </div>

      <div className="admin-photos">
        {filtered.length === 0 && (
          <p className="no-photos">No photos in this category.</p>
        )}
        {filtered.map(photo => (
          <div key={photo.id} className="admin-photo-card card">
            <img src={getUrl(photo.storage_path)} alt="Guest photo" className="admin-thumb" />
            <div className="admin-photo-info">
              <div className="admin-meta">
                <span className="admin-status">{STATUS_LABELS[photo.status]}</span>
                <span className="admin-date">{new Date(photo.created_at).toLocaleDateString()}</span>
              </div>
              {photo.guest_name && <p className="admin-name">👤 {photo.guest_name}</p>}
              {photo.caption && <p className="admin-caption">"{photo.caption}"</p>}
              <div className="admin-actions">
                {photo.status !== 'approved' && (
                  <button
                    className="btn btn-sm"
                    style={{ background: '#38a169', color: '#fff' }}
                    disabled={actionLoading === photo.id + 'approved'}
                    onClick={() => updateStatus(photo.id, 'approved')}
                  >
                    ✅ Approve
                  </button>
                )}
                {photo.status !== 'rejected' && (
                  <button
                    className="btn btn-sm"
                    style={{ background: '#dd6b20', color: '#fff' }}
                    disabled={actionLoading === photo.id + 'rejected'}
                    onClick={() => updateStatus(photo.id, 'rejected')}
                  >
                    ❌ Reject
                  </button>
                )}
                <button
                  className="btn btn-sm btn-danger"
                  disabled={actionLoading === photo.id + 'delete'}
                  onClick={() => deletePhoto(photo)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

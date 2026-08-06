import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Nav({ session }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">💍 Teddy &amp; Oreste</Link>
      <div className="nav-links">
        <Link to="/gallery" className={`nav-link ${pathname === '/gallery' ? 'active' : ''}`}>Gallery</Link>
        {session ? (
          <>
            <Link to="/admin/dashboard" className={`nav-link ${pathname.startsWith('/admin/dashboard') ? 'active' : ''}`}>Admin</Link>
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <Link to="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}>Admin</Link>
        )}
      </div>
    </nav>
  )
}

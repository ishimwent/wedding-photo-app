import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Gallery from './pages/Gallery'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import QRPage from './pages/QRPage'
import Nav from './components/Nav'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/admin" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="spinner" />

  return (
    <BrowserRouter>
      <Nav session={session} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin" element={session ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute session={session}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

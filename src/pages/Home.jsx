import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-flowers">🌸</div>
        <h1 className="home-names">Oreste &amp; Teddy</h1>
        <p className="home-title">Welcome to Our Wedding ❤️</p>
        <p className="home-subtitle">"Help us capture our special day!"</p>
        <div className="home-divider">✦ ✦ ✦</div>
      </div>

      <div className="home-actions">
        <button className="btn btn-primary home-btn" onClick={() => navigate('/upload?mode=camera')}>
          <span className="btn-icon">📸</span>
          <span>TAKE A PHOTO</span>
        </button>
        <button className="btn btn-secondary home-btn" onClick={() => navigate('/upload?mode=gallery')}>
          <span className="btn-icon">🖼️</span>
          <span>CHOOSE FROM GALLERY</span>
        </button>
        <button className="btn btn-gold home-btn" onClick={() => navigate('/gallery')}>
          <span className="btn-icon">❤️</span>
          <span>VIEW WEDDING GALLERY</span>
        </button>
      </div>

      <p className="home-footer">Scan the QR code at your table to share your photos</p>
    </div>
  )
}

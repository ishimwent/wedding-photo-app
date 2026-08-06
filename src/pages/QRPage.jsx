import { useEffect, useRef } from 'react'
import './QRPage.css'

export default function QRPage() {
  const canvasRef = useRef(null)
  const siteUrl = window.location.origin

  // Encode URL into a QR code using the free QR API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}&color=a85570&bgcolor=fdf8f0&margin=20`

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = 'wedding-qr-code.png'
    link.click()
  }

  return (
    <div className="qr-page">
      <div className="qr-card card">
        <h2>📱 Wedding QR Code</h2>
        <p className="qr-sub">Print this and place it on each table so guests can scan and share photos.</p>

        <div className="qr-wrap">
          <img src={qrUrl} alt="QR Code" className="qr-img" />
        </div>

        <p className="qr-url">{siteUrl}</p>

        <button className="btn btn-primary" onClick={handleDownload}>
          ⬇️ Download QR Code
        </button>

        <div className="qr-instructions">
          <h3>How to use:</h3>
          <ol>
            <li>Download and print this QR code</li>
            <li>Place printed cards on each table</li>
            <li>Guests scan with their phone camera</li>
            <li>They are taken directly to the upload page</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

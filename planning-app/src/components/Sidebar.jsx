import React from 'react'
import { SECTIONS } from '../constants.js'

const LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd2ibeoitNx-CvSDz0iX_K84bKeNdc7UeMevziWh_OC1SmTiHKnYegZ5E&s=10'

const svg = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  gemba: (
    <svg {...svg}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  bureau: (
    <svg {...svg}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </svg>
  ),
  '5s': (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  ),
  dashboard: (
    <svg {...svg}>
      <path d="M4 20h16" />
      <path d="M7 16v-5M12 16V6M17 16v-8" />
    </svg>
  ),
}

export default function Sidebar({ open, onToggle, section, onSelect }) {
  const onLogoError = (e) => {
    if (e.currentTarget.src !== LOGO_URL) {
      e.currentTarget.onerror = null
      e.currentTarget.src = LOGO_URL
    }
  }

  const item = (s) => (
    <button
      key={s.id}
      className={`nav-item ${section === s.id ? 'active' : ''}`}
      onClick={() => onSelect(s.id)}
    >
      <span className="icon">{ICONS[s.id]}</span>
      {s.label}
    </button>
  )

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="brand">
        <div className="logo-box">
          <img src="/logo.png" alt="Logo" onError={onLogoError} />
        </div>
        <div className="brand-text">
          <strong>Planning OJT</strong>
          <span>Gemba & 5S</span>
        </div>
        <button className="close" onClick={onToggle} aria-label="Fermer">
          ✕
        </button>
      </div>

      <p className="nav-title">Plannings</p>
      <nav className="sidebar-nav">
        {SECTIONS.filter((s) => s.id !== 'dashboard').map(item)}
      </nav>

      <p className="nav-title">Analyse</p>
      <nav className="sidebar-nav">
        {SECTIONS.filter((s) => s.id === 'dashboard').map(item)}
      </nav>

      <div className="sidebar-foot">KPI-AC · {new Date().getFullYear()}</div>
    </aside>
  )
}

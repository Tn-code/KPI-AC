import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import MonthNav from './components/MonthNav.jsx'
import AuditForm from './components/AuditForm.jsx'
import AuditTable from './components/AuditTable.jsx'
import Stats from './components/Stats.jsx'
import Dashboard from './components/Dashboard.jsx'
import { MOIS, SECTIONS } from './constants.js'
import useAudits from './useAudits.js'
import { downloadCsv } from './exportCsv.js'

const isMobile = () => window.innerWidth <= 900

export default function Planning({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile())
  const [section, setSection] = useState(null) // 'gemba' | '5s' | 'bureau'
  const [mois, setMois] = useState(null) // 0..11
  const [editingId, setEditingId] = useState(null)
  const { audits, loading, error, addAudit, updateAudit, deleteAudit } = useAudits()

  const annee = new Date().getFullYear()

  const handleSelectSection = (id) => {
    setSection(id)
    setMois(null)
    setEditingId(null)
    if (isMobile()) setSidebarOpen(false)
  }

  const handleSelectMonth = (i) => {
    setMois(i)
    setEditingId(null)
  }

  const handleSubmit = (audit) => {
    if (editingId) {
      updateAudit(editingId, audit)
      setEditingId(null)
    } else {
      addAudit({ ...audit, section, mois, annee })
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer cet audit ?')) return
    deleteAudit(id)
    if (editingId === id) setEditingId(null)
  }

  const handleEdit = (id) => {
    setEditingId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtered = audits
    .filter((a) => a.section === section && a.mois === mois)
    .sort((a, b) => a.date.localeCompare(b.date))

  const countByMonth = (m) =>
    audits.filter((a) => a.section === section && a.mois === m).length

  const editing = editingId ? filtered.find((a) => a.id === editingId) : null

  const exportMonth = () =>
    downloadCsv(`planning-${section}-${MOIS[mois]}-${annee}.csv`, filtered, section)

  const exportYear = () => {
    const all = audits
      .filter((a) => a.section === section)
      .sort((a, b) => a.mois - b.mois || a.date.localeCompare(b.date))
    if (all.length === 0) {
      window.alert('Aucun audit à exporter pour cette section.')
      return
    }
    downloadCsv(`planning-${section}-${annee}.csv`, all, section)
  }

  const title = section ? SECTIONS.find((s) => s.id === section).label : 'Planning OJT'
  const subtitle = !section
    ? 'Bienvenue'
    : section === 'dashboard'
      ? `Année ${annee}`
    : mois === null
      ? `${annee} · Sélectionnez un mois`
      : `${MOIS[mois]} ${annee}`

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        section={section}
        onSelect={handleSelectSection}
      />
      {sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}

      <main className="content">
        {error && <div className="banner">Erreur Supabase : {error}</div>}
        {loading && <div className="banner info">Chargement des audits…</div>}
        <header className="topbar">
          <button
            className="burger"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Ouvrir / fermer la barre latérale"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <p className="crumb">{subtitle}</p>
            <h1>{title}</h1>
          </div>
          <div className="userbox no-print">
            <span className="user-email">{user?.email}</span>
            <button className="btn" onClick={onLogout}>Déconnexion</button>
          </div>
        </header>

        {!section && (
          <div className="welcome">
            <h2>Que voulez-vous planifier ?</h2>
            <p>Choisissez un planning pour consulter les mois et saisir vos audits.</p>
            <div className="welcome-actions">
              {SECTIONS.map((s) => (
                <button key={s.id} className="welcome-card" onClick={() => handleSelectSection(s.id)}>
                  <strong>{s.label}</strong>
                  <span>Ouvrir →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {section === 'dashboard' && <Dashboard audits={audits} annee={annee} />}

        {section && section !== 'dashboard' && (
          <>
            <MonthNav selected={mois} onSelect={handleSelectMonth} counts={countByMonth} />

            {mois === null ? (
              <div className="empty">
                <p>Cliquez sur un mois pour voir le planning et ajouter un audit.</p>
              </div>
            ) : (
              <>
                <Stats audits={filtered} section={section} />
                <div className="panel">
                  <AuditForm
                    key={`${section}-${mois}-${editingId || 'new'}`}
                    mois={mois}
                    annee={annee}
                    section={section}
                    editing={editing}
                    onSubmit={handleSubmit}
                    onCancel={() => setEditingId(null)}
                  />
                  <AuditTable
                    audits={filtered}
                    section={section}
                    editingId={editingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onExportMonth={exportMonth}
                    onExportYear={exportYear}
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

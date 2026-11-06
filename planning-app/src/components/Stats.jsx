import React from 'react'
import { SEUIL_OK, SEUIL_WARN } from '../constants.js'

const level = (r) => (r >= SEUIL_OK ? 'ok' : r >= SEUIL_WARN ? 'warn' : 'ko')

export default function Stats({ audits, section }) {
  const bureau = section === 'bureau'
  const nums = audits.map((a) => a.resultat).filter((r) => typeof r === 'number')
  const moy = nums.length ? nums.reduce((s, r) => s + r, 0) / nums.length : null
  const conformes = nums.filter((r) => r >= SEUIL_OK).length
  const distincts = new Set(audits.map((a) => (bureau ? a.departement : a.ligne))).size

  return (
    <section className="stats">
      <div className="stat">
        <span className="stat-label">Audits du mois</span>
        <span className="stat-value">{audits.length}</span>
      </div>
      <div className="stat">
        <span className="stat-label">{bureau ? 'Départements audités' : 'Lignes auditées'}</span>
        <span className="stat-value">{distincts}</span>
      </div>
      <div className={`stat ${moy !== null ? level(moy) : ''}`}>
        <span className="stat-label">Moyenne</span>
        <span className="stat-value">{moy !== null ? `${moy.toFixed(1)} %` : '-'}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Objectif atteint (≥ {SEUIL_OK} %)</span>
        <span className="stat-value">
          {conformes}
          <small> / {nums.length}</small>
        </span>
      </div>
    </section>
  )
}

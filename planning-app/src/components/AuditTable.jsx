import React from 'react'
import { SEUIL_OK, SEUIL_WARN } from '../constants.js'

const level = (r) => (r >= SEUIL_OK ? 'ok' : r >= SEUIL_WARN ? 'warn' : 'ko')
const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR')

export default function AuditTable({
  audits,
  onDelete,
  onEdit,
  editingId,
  section,
  onExportMonth,
  onExportYear,
}) {
  const bureau = section === 'bureau'

  return (
    <div className="table-wrap">
      <div className="table-head">
        <h2>Audits du mois</h2>
        <div className="actions">
          <button className="btn" onClick={onExportMonth} disabled={audits.length === 0}>
            Excel (mois)
          </button>
          <button className="btn" onClick={onExportYear}>
            Excel (année)
          </button>
          <button className="btn" onClick={() => window.print()}>
            PDF / Imprimer
          </button>
        </div>
      </div>

      {audits.length === 0 ? (
        <p className="muted">Aucun audit enregistré pour ce mois.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                {bureau ? (
                  <th>Département</th>
                ) : (
                  <>
                    <th>UAP</th>
                    <th>Ligne</th>
                  </>
                )}
                <th>Auditeur</th>
                <th>Résultat</th>
                <th className="no-print" />
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => {
                const isNum = typeof a.resultat === 'number'
                return (
                  <tr key={a.id} className={editingId === a.id ? 'row-editing' : ''}>
                    <td>{fmt(a.date)}</td>
                    {bureau ? (
                      <td><span className="chip">{a.departement || '-'}</span></td>
                    ) : (
                      <>
                        <td><span className="chip">{a.uap || '-'}</span></td>
                        <td><strong>{a.ligne}</strong></td>
                      </>
                    )}
                    <td>{a.auditeur}</td>
                    <td>
                      {isNum ? (
                        <div className="score">
                          <div className="track">
                            <div
                              className={`bar ${level(a.resultat)}`}
                              style={{ width: `${Math.min(100, Math.max(0, a.resultat))}%` }}
                            />
                          </div>
                          <span className={`pct-val ${level(a.resultat)}`}>{a.resultat} %</span>
                        </div>
                      ) : (
                        <span className="muted">{a.resultat}</span>
                      )}
                    </td>
                    <td className="no-print row-actions">
                      <button className="icon-btn" onClick={() => onEdit(a.id)} aria-label="Modifier">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button className="icon-btn danger" onClick={() => onDelete(a.id)} aria-label="Supprimer">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

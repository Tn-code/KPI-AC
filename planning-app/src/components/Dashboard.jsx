import React, { useState } from 'react'
import { MOIS, SECTIONS, LIGNES, DEPARTEMENTS, UAPS, SEUIL_OK, SEUIL_WARN } from '../constants.js'

const SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const TABS = SECTIONS.filter((s) => s.id !== 'dashboard')

const level = (r) => (r >= SEUIL_OK ? 'ok' : r >= SEUIL_WARN ? 'warn' : 'ko')
const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null)
const fmtPct = (v) => (v === null ? '–' : `${v.toFixed(1)} %`)
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR')

function MonthChart({ data }) {
  const W = 720, H = 270, L = 36, R = 12, T = 22, B = 30
  const pw = W - L - R
  const ph = H - T - B
  const step = pw / 12
  const bw = step * 0.58
  const y = (v) => T + ph * (1 - v / 100)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Moyenne par mois">
      {[0, 20, 40, 60, 80, 100].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} className="grid" />
          <text x={L - 6} y={y(g) + 4} textAnchor="end">{g}</text>
        </g>
      ))}
      {data.map((v, i) => {
        const x = L + i * step + (step - bw) / 2
        return (
          <g key={i}>
            {v !== null && (
              <>
                <rect x={x} y={y(v)} width={bw} height={Math.max(2, y(0) - y(v))} rx="4" className={`b-${level(v)}`} />
                <text x={x + bw / 2} y={y(v) - 5} textAnchor="middle" className="val">{Math.round(v)}</text>
              </>
            )}
            <text x={x + bw / 2} y={H - 10} textAnchor="middle">{SHORT[i]}</text>
          </g>
        )
      })}
      <line x1={L} x2={W - R} y1={y(SEUIL_OK)} y2={y(SEUIL_OK)} className="goal" />
      <text x={W - R} y={y(SEUIL_OK) - 5} textAnchor="end" className="goal-t">Objectif {SEUIL_OK} %</text>
    </svg>
  )
}

export default function Dashboard({ audits, annee }) {
  const [view, setView] = useState('gemba')
  const bureau = view === 'bureau'

  const all = audits.filter((a) => typeof a.resultat === 'number')
  const list = all.filter((a) => a.section === view)

  const keyOf = (a) => (bureau ? a.departement : a.ligne)
  const catalogue = bureau ? DEPARTEMENTS : LIGNES
  const entityLabel = bureau ? 'départements' : 'lignes'

  const perMonth = MOIS.map((_, m) => avg(list.filter((a) => a.mois === m).map((a) => a.resultat)))
  const moyAnnee = avg(list.map((a) => a.resultat))
  const atteint = list.length
    ? Math.round((100 * list.filter((a) => a.resultat >= SEUIL_OK).length) / list.length)
    : null
  const withData = perMonth.map((v, i) => ({ v, i })).filter((x) => x.v !== null)
  const best = withData.length ? withData.reduce((a, b) => (b.v > a.v ? b : a)) : null

  const map = new Map()
  list.forEach((a) => {
    const k = keyOf(a)
    if (!k) return
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(a.resultat)
  })
  const ranking = [...map.entries()]
    .map(([name, vals]) => ({ name, n: vals.length, avg: avg(vals) }))
    .sort((a, b) => b.avg - a.avg)
  const missing = catalogue.filter((c) => !map.has(c))
  const coverage = Math.round((100 * map.size) / catalogue.length)

  const byUap = UAPS.map((u) => {
    const vals = list.filter((a) => a.uap === u).map((a) => a.resultat)
    return { name: u, n: vals.length, avg: avg(vals) }
  }).filter((x) => x.n > 0)

  const below = list
    .filter((a) => a.resultat < SEUIL_OK)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  return (
    <div className="dash">
      <div className="dash-tabs">
        {TABS.map((t) => {
          const l = all.filter((a) => a.section === t.id)
          return (
            <button
              key={t.id}
              className={`dash-tab ${view === t.id ? 'active' : ''}`}
              onClick={() => setView(t.id)}
            >
              <span className="dash-tab-label">{t.label}</span>
              <span className="dash-tab-val">{fmtPct(avg(l.map((a) => a.resultat)))}</span>
              <span className="dash-tab-sub">{l.length} audit(s) en {annee}</span>
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p>Aucun audit enregistré en {annee} pour cette section.</p>
        </div>
      ) : (
        <>
          <section className="stats">
            <div className="stat">
              <span className="stat-label">Audits {annee}</span>
              <span className="stat-value">{list.length}</span>
            </div>
            <div className={`stat ${level(moyAnnee)}`}>
              <span className="stat-label">Moyenne annuelle</span>
              <span className="stat-value">{fmtPct(moyAnnee)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Audits ≥ {SEUIL_OK} %</span>
              <span className="stat-value">{atteint} %</span>
            </div>
            <div className="stat">
              <span className="stat-label">Meilleur mois</span>
              <span className="stat-value">
                {best ? MOIS[best.i] : '–'}
                {best && <small> {best.v.toFixed(1)} %</small>}
              </span>
            </div>
          </section>

          <div className="card dash-card">
            <h2>Moyenne par mois</h2>
            <MonthChart data={perMonth} />
          </div>

          <div className="dash-grid">
            <div className="card">
              <h2>Classement des {entityLabel}</h2>
              {ranking.map((r, i) => (
                <div className="rank-row" key={r.name}>
                  <span className="rank-n">{i + 1}</span>
                  <span className="rank-name">
                    {r.name} <small>({r.n})</small>
                  </span>
                  <div className="track">
                    <div className={`bar ${level(r.avg)}`} style={{ width: `${Math.min(100, r.avg)}%` }} />
                  </div>
                  <span className={`pct-val ${level(r.avg)}`}>{r.avg.toFixed(1)} %</span>
                </div>
              ))}
            </div>

            <div className="stack">
              <div className="card">
                <h2>Couverture</h2>
                <p className="muted">
                  <strong>{map.size} / {catalogue.length}</strong> {entityLabel} audités en {annee}
                </p>
                <div className="track" style={{ marginTop: 10 }}>
                  <div className="bar ok" style={{ width: `${coverage}%` }} />
                </div>
                {missing.length > 0 ? (
                  <>
                    <p className="muted" style={{ marginTop: 14 }}>Pas encore audités :</p>
                    <div className="chips">
                      {missing.map((m) => (
                        <span key={m} className="chip soft">{m}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="muted" style={{ marginTop: 14 }}>Tout est couvert ✓</p>
                )}
              </div>

              {!bureau && byUap.length > 0 && (
                <div className="card">
                  <h2>Par UAP</h2>
                  {byUap.map((u) => (
                    <div className="rank-row uap" key={u.name}>
                      <span className="rank-name">{u.name} <small>({u.n})</small></span>
                      <div className="track">
                        <div className={`bar ${level(u.avg)}`} style={{ width: `${Math.min(100, u.avg)}%` }} />
                      </div>
                      <span className={`pct-val ${level(u.avg)}`}>{u.avg.toFixed(1)} %</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card dash-card">
            <h2>Derniers audits sous l'objectif ({SEUIL_OK} %)</h2>
            {below.length === 0 ? (
              <p className="muted">Aucun audit sous l'objectif. Bravo !</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>{bureau ? 'Département' : 'Ligne'}</th>
                      {!bureau && <th>UAP</th>}
                      <th>Auditeur</th>
                      <th>Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {below.map((a) => (
                      <tr key={a.id}>
                        <td>{fmtDate(a.date)}</td>
                        <td><strong>{keyOf(a)}</strong></td>
                        {!bureau && <td><span className="chip">{a.uap || '-'}</span></td>}
                        <td>{a.auditeur}</td>
                        <td><span className={`pct-val ${level(a.resultat)}`}>{a.resultat} %</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

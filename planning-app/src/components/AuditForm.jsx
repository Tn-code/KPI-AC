import React, { useState } from 'react'
import { LIGNES, UAPS, DEPARTEMENTS } from '../constants.js'

const empty = { date: '', uap: '', ligne: '', departement: '', auditeur: '', resultat: '' }

const toForm = (a) =>
  a
    ? {
        date: a.date,
        uap: a.uap || '',
        ligne: a.ligne || '',
        departement: a.departement || '',
        auditeur: a.auditeur,
        resultat: String(a.resultat),
      }
    : empty

export default function AuditForm({ mois, annee, onSubmit, section, editing, onCancel }) {
  const [form, setForm] = useState(() => toForm(editing))
  const bureau = section === 'bureau'

  const pad = (n) => String(n).padStart(2, '0')
  const min = `${annee}-${pad(mois + 1)}-01`
  const lastDay = new Date(annee, mois + 1, 0).getDate()
  const max = `${annee}-${pad(mois + 1)}-${pad(lastDay)}`

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const base = { date: form.date, auditeur: form.auditeur, resultat: Number(form.resultat) }
    onSubmit(
      bureau
        ? { ...base, departement: form.departement }
        : { ...base, uap: form.uap, ligne: form.ligne }
    )
    if (!editing) setForm(empty)
  }

  return (
    <form className={`form ${editing ? 'editing' : ''}`} onSubmit={submit}>
      <h2>{editing ? "Modifier l'audit" : 'Nouvel audit'}</h2>

      <label>
        Date
        <input type="date" value={form.date} min={min} max={max} onChange={set('date')} required />
      </label>

      {bureau ? (
        <label>
          Département
          <select value={form.departement} onChange={set('departement')} required>
            <option value="" disabled>Choisir…</option>
            {DEPARTEMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      ) : (
        <>
          <label>
            UAP
            <select value={form.uap} onChange={set('uap')} required>
              <option value="" disabled>Choisir…</option>
              {UAPS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>

          <label>
            Ligne
            <select value={form.ligne} onChange={set('ligne')} required>
              <option value="" disabled>Choisir…</option>
              {LIGNES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </>
      )}

      <label>
        Auditeur
        <input type="text" placeholder="Nom de l'auditeur" value={form.auditeur} onChange={set('auditeur')} required />
      </label>

      <label>
        Résultat
        <div className="pct">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0 - 100"
            value={form.resultat}
            onChange={set('resultat')}
            required
          />
          <span>%</span>
        </div>
      </label>

      <div className="form-actions">
        <button type="submit" className="primary">
          {editing ? 'Mettre à jour' : 'Enregistrer'}
        </button>
        {editing && (
          <button type="button" className="ghost" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}

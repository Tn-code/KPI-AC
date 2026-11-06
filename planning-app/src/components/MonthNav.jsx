import React from 'react'
import { MOIS } from '../constants.js'

export default function MonthNav({ selected, onSelect, counts }) {
  const current = new Date().getMonth()
  return (
    <nav className="monthnav" aria-label="Mois">
      {MOIS.map((m, i) => {
        const n = counts(i)
        return (
          <button
            key={m}
            className={`month ${selected === i ? 'active' : ''} ${i === current ? 'current' : ''}`}
            onClick={() => onSelect(i)}
          >
            {m}
            {n > 0 && <span className="badge">{n}</span>}
          </button>
        )
      })}
    </nav>
  )
}

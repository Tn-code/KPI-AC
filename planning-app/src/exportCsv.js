import { MOIS } from './constants.js'

const esc = (v) => {
  const s = v === undefined || v === null ? '' : String(v)
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// CSV compatible Excel français (séparateur ; + BOM UTF-8)
export function downloadCsv(filename, audits, section) {
  const bureau = section === 'bureau'
  const head = bureau
    ? ['Mois', 'Date', 'Département', 'Auditeur', 'Résultat (%)']
    : ['Mois', 'Date', 'UAP', 'Ligne', 'Auditeur', 'Résultat (%)']

  const rows = audits.map((a) => {
    const date = new Date(a.date + 'T00:00:00').toLocaleDateString('fr-FR')
    const res = typeof a.resultat === 'number' ? String(a.resultat).replace('.', ',') : a.resultat
    return bureau
      ? [MOIS[a.mois], date, a.departement, a.auditeur, res]
      : [MOIS[a.mois], date, a.uap, a.ligne, a.auditeur, res]
  })

  const csv = '\uFEFF' + [head, ...rows].map((r) => r.map(esc).join(';')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

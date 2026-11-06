import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const ANNEE = new Date().getFullYear()
const FIELDS = ['section', 'annee', 'mois', 'date', 'uap', 'ligne', 'departement', 'auditeur', 'resultat']

const fromRow = (r) => ({
  id: r.id,
  section: r.section,
  annee: r.annee,
  mois: r.mois,
  date: r.date,
  uap: r.uap ?? undefined,
  ligne: r.ligne ?? undefined,
  departement: r.departement ?? undefined,
  auditeur: r.auditeur,
  resultat: Number(r.resultat),
})

const toRow = (a) => {
  const row = {}
  FIELDS.forEach((k) => {
    if (a[k] !== undefined) row[k] = a[k]
  })
  return row
}

export default function useAudits() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('annee', ANNEE)
      .order('date', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setAudits(data.map(fromRow))
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('audits-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audits' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  const addAudit = async (audit) => {
    const { data, error } = await supabase.from('audits').insert(toRow(audit)).select().single()
    if (error) return setError(error.message)
    setAudits((prev) => (prev.some((a) => a.id === data.id) ? prev : [...prev, fromRow(data)]))
  }

  const updateAudit = async (id, patch) => {
    setAudits((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    const { error } = await supabase.from('audits').update(toRow(patch)).eq('id', id)
    if (error) {
      setError(error.message)
      load()
    }
  }

  const deleteAudit = async (id) => {
    setAudits((prev) => prev.filter((a) => a.id !== id))
    const { error } = await supabase.from('audits').delete().eq('id', id)
    if (error) {
      setError(error.message)
      load()
    }
  }

  return { audits, loading, error, addAudit, updateAudit, deleteAudit }
}

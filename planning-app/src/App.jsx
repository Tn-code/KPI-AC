import React, { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import Login from './components/Login.jsx'
import Planning from './Planning.jsx'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = chargement

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="splash">Chargement…</div>
  if (!session) return <Login />

  return <Planning user={session.user} onLogout={() => supabase.auth.signOut()} />
}

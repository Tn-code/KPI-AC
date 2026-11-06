import React, { useState } from 'react'
import { supabase } from '../supabase.js'

const LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd2ibeoitNx-CvSDz0iX_K84bKeNdc7UeMevziWh_OC1SmTiHKnYegZ5E&s=10'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onLogoError = (e) => {
    if (e.currentTarget.src !== LOGO_URL) {
      e.currentTarget.onerror = null
      e.currentTarget.src = LOGO_URL
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setError(
        error.message.toLowerCase().includes('invalid login')
          ? 'Email ou mot de passe incorrect.'
          : error.message
      )
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <img src="/logo.png" alt="Logo" onError={onLogoError} />
        </div>
        <h1>Planning OJT</h1>
        <p className="login-sub">Gemba & 5S · Connexion</p>

        {error && <div className="banner">{error}</div>}

        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            placeholder="nom@entreprise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Mot de passe
          <div className="pwd">
            <input
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="eye" onClick={() => setShow((v) => !v)}>
              {show ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </label>

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <p className="login-help">Mot de passe oublié ? Contactez l'administrateur.</p>
      </form>
    </div>
  )
}

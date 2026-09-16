'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/journal')
      router.refresh()
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Warm gradient hero */}
      <div className="flex-shrink-0 flex flex-col items-center justify-end pb-10 pt-16"
           style={{ background: 'linear-gradient(160deg, #92400e 0%, #b45309 40%, #d97706 100%)' }}>
        <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-[22px] flex items-center
                        justify-center mb-5 shadow-2xl ring-1 ring-white/20">
          <span className="text-4xl">📔</span>
        </div>
        <h1 className="text-[32px] font-bold text-white tracking-tight">Journal</h1>
        <p className="text-white/70 text-[15px] mt-1">Your private space to reflect</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-8 pb-8" style={{ background: 'var(--bg)' }}>
        <div className="card px-5 py-6">
          <h2 className="text-[22px] font-bold text-stone-900 mb-6">Welcome back</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-2 ml-1">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-1">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-stone-500 text-[15px] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-amber-600 font-bold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

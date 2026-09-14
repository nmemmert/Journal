'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
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
      {/* Gradient hero */}
      <div className="flex-shrink-0 bg-gradient-to-b from-purple-600 via-indigo-500 to-indigo-400 flex flex-col items-center justify-end pb-10 pt-16">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-[22px] flex items-center justify-center mb-5 shadow-xl">
          <span className="text-4xl">✨</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Journal</h1>
        <p className="text-white/75 text-[15px] mt-1">Start your journey today</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-[#f2f2f7] px-6 pt-8 pb-8">
        <div className="bg-white rounded-3xl shadow-sm px-6 py-7" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)' }}>
          <h2 className="text-[22px] font-bold text-gray-900 mb-6">Create account</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2 ml-1">Your name</label>
              <input
                type="text"
                autoComplete="name"
                className="input-field"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2 ml-1">Email</label>
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
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2 ml-1">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="input-field"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center mt-2"
            >
              {loading ? 'Creating account…' : 'Get Started'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-[15px] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

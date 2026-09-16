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
      {/* Hero */}
      <div className="relative flex-shrink-0 flex flex-col items-center justify-end pb-12 pt-20 overflow-hidden"
           style={{ background: 'linear-gradient(155deg, #6B2A00 0%, #A03E0A 45%, #C4591A 75%, #D97520 100%)' }}>
        {/* Subtle texture circles */}
        <div className="absolute top-6 left-6 w-48 h-48 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-8"
             style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%,30%)' }} />

        <div className="relative w-20 h-20 rounded-[22px] flex items-center justify-center mb-5"
             style={{
               background: 'rgba(255,255,255,0.15)',
               backdropFilter: 'blur(16px)',
               WebkitBackdropFilter: 'blur(16px)',
               boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
             }}>
          <span className="text-4xl">📔</span>
        </div>
        <h1 className="relative text-[34px] font-black text-white tracking-tight">Journal</h1>
        <p className="relative text-white/65 text-[15px] mt-1 font-medium">Your private space to reflect</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-8 pb-8" style={{ background: 'var(--bg-grad)' }}>
        <div className="bg-white rounded-3xl px-5 py-7"
             style={{ boxShadow: 'var(--card-shadow)' }}>
          <h2 className="text-[22px] font-black mb-6" style={{ color: 'var(--text)' }}>
            Welcome back
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[14px] font-semibold
                            px-4 py-3 rounded-2xl mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest block mb-2"
                     style={{ color: 'var(--text-3)' }}>Email</label>
              <input type="email" autoComplete="email" className="input-field"
                placeholder="you@example.com" value={form.email} required
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest block mb-2"
                     style={{ color: 'var(--text-3)' }}>Password</label>
              <input type="password" autoComplete="current-password" className="input-field"
                placeholder="••••••••" value={form.password} required
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-1 text-[15px]">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[15px] mt-6" style={{ color: 'var(--text-2)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold" style={{ color: 'var(--primary)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

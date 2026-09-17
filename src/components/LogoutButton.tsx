'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full py-3.5 text-red-400 font-bold rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
      style={{ background: 'var(--card)', boxShadow: 'var(--card-shadow-sm)' }}
    >
      {loading ? 'Signing out…' : 'Sign Out'}
    </button>
  )
}

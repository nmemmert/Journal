'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/journal',
    label: 'Journal',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'}
           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/journal/new',
    label: '',
    icon: (_active: boolean) => null,
  },
  {
    href: '/tags',
    label: 'Tags',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'}
           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Me',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'}
           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex flex-col items-center"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="relative flex items-center w-[calc(100%-2rem)] max-w-md mb-4 h-16 px-2"
           style={{
             background: 'rgba(28,28,30,0.96)',
             backdropFilter: 'blur(24px)',
             WebkitBackdropFilter: 'blur(24px)',
             borderRadius: 28,
             boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
           }}>

        {tabs.map((tab, i) => {
          if (tab.href === '/journal/new') {
            return <div key="spacer" className="flex-1" />
          }
          const active =
            pathname === tab.href ||
            (tab.href !== '/journal' && pathname.startsWith(tab.href))
          const _isRight = i > 2

          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-3xl transition-colors">
              <span style={{ color: active ? 'var(--primary)' : 'var(--text-3)' }}
                    className="transition-colors">
                {tab.icon(active)}
              </span>
              <span className="text-[10px] font-semibold tracking-wide transition-colors"
                    style={{ color: active ? 'var(--primary)' : 'var(--text-3)' }}>
                {tab.label}
              </span>
            </Link>
          )
        })}

        {/* Floating center compose button */}
        <Link href="/journal/new"
          className="absolute left-1/2 -translate-x-1/2 -translate-y-7 w-14 h-14
                     flex items-center justify-center rounded-2xl active:scale-90 transition-transform"
          style={{
            background: 'linear-gradient(145deg, #E8784F, #C45A30)',
            boxShadow: '0 6px 20px rgba(232,120,79,0.5), 0 2px 6px rgba(232,120,79,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

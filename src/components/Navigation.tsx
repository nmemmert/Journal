'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/journal',
    label: 'Journal',
    d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    href: '/search',
    label: 'Search',
    d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    href: '/journal/new',
    label: 'New',
    d: 'M12 4v16m8-8H4',
    isCompose: true,
  },
  {
    href: '/tags',
    label: 'Tags',
    d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
  },
  {
    href: '/profile',
    label: 'Me',
    d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: 'rgba(17,17,19,0.97)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.09)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        height: '58px',
      }}>
        {TABS.map(tab => {
          const active = pathname === tab.href ||
            (tab.href !== '/journal' && pathname.startsWith(tab.href))
          const color = tab.isCompose
            ? '#E8784F'
            : active
            ? '#E8784F'
            : 'rgba(242,242,247,0.42)'

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                textDecoration: 'none',
                color,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={active && !tab.isCompose ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={tab.isCompose ? '2.5' : active ? '0' : '1.8'}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tab.d} />
              </svg>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

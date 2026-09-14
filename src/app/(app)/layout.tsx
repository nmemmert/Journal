import Navigation from '@/components/Navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f7]">
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <Navigation />
    </div>
  )
}

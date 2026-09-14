import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import EntryEditor from '@/components/EntryEditor'

export default async function NewEntryPage() {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  return <EntryEditor />
}

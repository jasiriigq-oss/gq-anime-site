import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/payload'
import { CreatorForm } from '@/components/creator/CreatorForm'

export const dynamic = 'force-dynamic'

export default async function CreatePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="gradient-hero rounded-2xl px-6 py-5">
        <h1 className="text-2xl font-black text-white">GQE Creator Tool</h1>
        <p className="text-sm text-white/70">Build and publish an anime quiz.</p>
      </div>
      <CreatorForm user={{ id: user.id, username: user.username }} />
    </div>
  )
}

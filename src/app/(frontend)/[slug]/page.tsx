import { notFound } from 'next/navigation'
import { getPayloadLocal } from '@/lib/payload'
import { richTextToPlain } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
    limit: 1,
  })
  const page = docs[0]
  if (!page) notFound()

  const content = richTextToPlain(page.content)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-white">{page.title}</h1>
      <div className="mt-6 space-y-4 whitespace-pre-line text-white/75 leading-relaxed">{content}</div>
    </div>
  )
}

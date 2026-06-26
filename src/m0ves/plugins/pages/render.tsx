'use server'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'
import config from '@/payload.config'
import { getPageBySlug } from './operations'
import { notFound } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'
import { RouteProps } from '../../lib/RouteProps'

/**
 * Renders Pages
 * @param param0
 * @returns
 */
export default async function PageRenderer({ params, searchParams }: RouteProps<{ slug: string }>) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const slug = (await params).slug
  const pageQuery = await getPageBySlug('/' + slug)
  console.log({ slug })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  if (pageQuery.totalDocs == 0) {
    return notFound()
  }
  const page = pageQuery.docs[0]

  return (
    <>
      <h1>{page.title}</h1>
    </>
  )
}

export async function generatePageMetadata(
  { params, searchParams }: RouteProps<{ slug: string }>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = (await params).slug

  // fetch post information
  const pageQuery = await getPageBySlug(slug)
  const page = pageQuery.docs[0]

  return {
    title: page?.meta?.title ?? '',
    description: page?.meta?.description ?? '',
  }
}

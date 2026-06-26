import { RouteProps } from '@/m0ves/lib/RouteProps'
import PageRenderer, { generatePageMetadata } from '@/m0ves/plugins/pages/render'
import { ResolvingMetadata } from 'next'

export default async function (props: RouteProps<{ slug: string }>) {
  return await PageRenderer(props)
}
export const generateMetadata = async (
  props: RouteProps<{ slug: string }>,
  parent: ResolvingMetadata,
) => await generatePageMetadata(props, parent)

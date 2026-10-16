import { JoinForm } from '@/components/game/JoinForm'

export default function JoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <JoinFormWrap searchParams={searchParams} />
}

async function JoinFormWrap({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const code = (params.code as string) ?? ''
  return <JoinForm initialCode={code.toUpperCase()} />
}

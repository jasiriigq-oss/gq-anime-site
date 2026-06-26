import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email'
import BaseLayout from './components/base-layout'

export default function RecoverPasswordEmail({
  token,
  socials,
}: {
  token: string
  socials?: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
    tiktok: string
  }
}) {
  const link_url = `${process.env.SERVER_URL ?? 'https://sample.server.com'}/auth/recovery?recoveryToken=${token ?? '{recovery code goes here}'}`
  return (
    <BaseLayout socials={socials}>
      <Preview>{token}</Preview>
      <Section className="bg-black text-white">
        <Text className="text-center">Follow the link below to recover your password</Text>
        <Text className="text-center">
          <Link className="text-yellow-600" href={link_url}>
            Recover Password
          </Link>
        </Text>
        <Text className="text-center">{link_url}</Text>
      </Section>
    </BaseLayout>
  )
}

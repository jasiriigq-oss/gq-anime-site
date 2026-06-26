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
  Hr,
  Text,
} from 'react-email'
import BaseLayout from './components/base-layout'
import Article from './components/Article'

export default function WelcomeEmail({
  socials,
}: {
  socials?: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
    tiktok: string
  }
}) {
  return (
    <BaseLayout socials={socials}>
      <Section className="py-2 font-mono uppercase text-yellow-600 font-black text-center bg-black">
        <Heading>Thank You for Signing Up!</Heading>
        <Hr className="my-[16px] border-yellow-600" />
        <Article />
        <Hr className="my-[16px] border-yellow-600" />
      </Section>
    </BaseLayout>
  )
}

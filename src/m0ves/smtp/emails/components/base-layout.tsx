import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Row,
  Column,
  Img,
  Link,
  Preview,
  Text,
  Hr,
  Tailwind,
} from 'react-email'

import Header from './base-layout.header'
import Footer from './base-layout.footer'

interface BaseLayoutProps extends React.PropsWithChildren {
  socials?: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
    tiktok: string
  }
}
export default function BaseLayout({ children, socials }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ padding: '8px' }}>
        <Tailwind>
          <Header />
          {children}
          <Footer socials={socials} />
        </Tailwind>
      </Body>
    </Html>
  )
}

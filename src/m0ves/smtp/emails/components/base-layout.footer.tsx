import { Tailwind, Section, Row, Column, Img, Link, Text } from 'react-email'

export default function ({
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
    <Tailwind>
      <Section className="bg-black text-white">
        <Row>
          <Column align="center" className="table-cell align-bottom pb-[20px]">
            <Row className="table-cell h-[44px] w-[56px] align-bottom">
              <Column className="pr-[8px]">
                <Link href={socials?.facebook ?? '#'}>
                  <Img
                    alt="Facebook"
                    height="36"
                    src="https://react.email/static/facebook-logo.png"
                    width="36"
                  />
                </Link>
              </Column>
              <Column className="pr-[8px]">
                <Link href={socials?.twitter ?? '#'}>
                  <Img alt="X" height="36" src="https://react.email/static/x-logo.png" width="36" />
                </Link>
              </Column>
              <Column>
                <Link href={socials?.instagram ?? '#'}>
                  <Img
                    alt="Instagram"
                    height="36"
                    src="https://react.email/static/instagram-logo.png"
                    width="36"
                  />
                </Link>
              </Column>
            </Row>
          </Column>
        </Row>
      </Section>
    </Tailwind>
  )
}

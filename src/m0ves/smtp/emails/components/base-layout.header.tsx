import { Section, Row, Column, Img, Link, Tailwind } from 'react-email'
export default function () {
  return (
    <Tailwind>
      <Section className="px-[32px] py-[40px] bg-black">
        <Row align="center">
          <Img
            width="100%"
            className="mx-auto "
            src="https://fullycharcoal.netlify.app/assets/full-logo-w-bar.png"
          />
        </Row>
        <Row>
          <Column className="w-[80%]">
            <Img
              alt="React Email logo"
              height="42"
              src="https://react.email/static/logo-without-background.png"
            />
          </Column>
        </Row>
      </Section>
    </Tailwind>
  )
}

import { Section, Img, Text, Heading, Button, Tailwind, Row, Column } from 'react-email'

export default function Article({ link }: { link?: string }) {
  return (
    <Tailwind>
      <Section className="my-[16px]">
        <Section className="mt-[32px] text-center">
          <Heading
            as="h1"
            className="m-0 mt-[8px] font-semibold text-[36px] text-gray-900 leading-[36px] text-yellow-600"
          >
            Reach Out
          </Heading>
          <Text className="text-[16px] text-white leading-[24px]">
            We move fast, think big, and respond with intention. Drop us a message below and let’s
            start shaping what’s next. General Inquiries: info@fullycharcoal.com Event Bookings:
            events@fullycharcoal.com Talent & Management: management@fullycharcoal.com Press &
          </Text>
          <Button
            className="mt-[16px] border-2 border-yellow-600 bg-black px-[40px] py-[12px] font-semibold text-white"
            href={link ?? 'https://react.email'}
          >
            Read more
          </Button>
        </Section>
        <Section className="mt-[32px] text-center">
          <Heading
            as="h1"
            className="m-0 mt-[8px] font-semibold text-[36px] text-gray-900 leading-[36px] text-yellow-600"
          >
            Check out our Events
          </Heading>
          <Row className="mx-auto max-w-[450px]" align="center">
            <Column className="w-1/2">
              <Text className="text-left text-xs text-white">
                Fully Charcoal Events is where luxury meets energy. From curated nightlife to
                private, invitation‑only gatherings, every experience is crafted with intention —
                the music, the atmosphere, the people, the feeling.
              </Text>
            </Column>
            <Column className="w-1/2" align="center">
              <Img
                className="max-w-full w-full"
                src="https://fullycharcoal.netlify.app/assets/crowd-optimized.jpg"
                alt="crowd"
              />
            </Column>
          </Row>
          <Button
            className="mt-[16px] border-2 border-yellow-600 bg-black px-[40px] py-[12px] font-semibold text-white"
            href={link ?? 'https://react.email'}
          >
            View Events
          </Button>
        </Section>
      </Section>
    </Tailwind>
  )
}

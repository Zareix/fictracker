import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Font,
  Tailwind,
  Button,
} from "@react-email/components";
import * as React from "react";

interface ChangeEmailAddressEmailProps {
  url: string;
  title?: string;
}

export default function ChangeEmailAddressEmail({
  url,
  title = "Confirm Your Email Change on Fictracker",
}: ChangeEmailAddressEmailProps) {
  return (
    <Tailwind>
      <Html>
        <Head>
          <Font
            fontFamily="Inter"
            fallbackFontFamily="Arial"
            webFont={{
              url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto max-w-xl py-5 pb-12">
            <Section className="rounded-lg border border-gray-200 bg-white p-10">
              <Heading className="m-0 mb-5 text-center text-2xl font-semibold text-gray-900">
                {title}
              </Heading>
              <Text className="m-0 mb-6 text-center text-base leading-6 text-gray-600">
                We received a request to change your email address. Please click
                the button below to confirm this change:
              </Text>
              <Section className="my-6 text-center">
                <Button
                  href={url}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-center text-base font-medium text-white
                    no-underline hover:bg-blue-700"
                >
                  Confirm Email Change
                </Button>
              </Section>
              <Text className="m-0 mb-4 text-center text-sm leading-5 text-gray-500">
                If you didn&apos;t request this change, you can safely ignore
                this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

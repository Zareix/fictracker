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
} from "@react-email/components";
import * as React from "react";

interface OTPEmailProps {
  otpCode?: string;
  title?: string;
}

export default function OTPEmail({
  otpCode = "123456",
  title = "Your Verification Code For Fictracker",
}: OTPEmailProps) {
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
                Please use the following verification code to complete your
                authentication:
              </Text>
              <Section
                className="my-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6
                  text-center"
              >
                <Text className="m-0 font-mono text-3xl font-bold tracking-widest text-gray-900">
                  {otpCode}
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

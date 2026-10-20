import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";

// Internal notification: a visitor requested a Kordi visibility report.
// Sent TO the team inbox (REPORT_LEAD_TO), not to the visitor.
export interface ReportLeadEmailProps {
  name: string;
  email: string;
  website: string;
  competitors?: string;
  notes?: string;
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "-apple-system, Segoe UI, sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "480px" };
const label = { color: "#6b7280", fontSize: "12px", margin: "12px 0 0" };
const value = { margin: "2px 0 0" };

export function ReportLeadEmail({
  name,
  email,
  website,
  competitors,
  notes,
}: ReportLeadEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New visibility-report lead: {website}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading>New visibility-report request</Heading>
          <Text style={label}>Name</Text>
          <Text style={value}>{name}</Text>
          <Text style={label}>Work email</Text>
          <Text style={value}>{email}</Text>
          <Text style={label}>Company website</Text>
          <Text style={value}>{website}</Text>
          {competitors ? (
            <>
              <Text style={label}>Competitors</Text>
              <Text style={value}>{competitors}</Text>
            </>
          ) : null}
          {notes ? (
            <>
              <Text style={label}>Notes</Text>
              <Text style={value}>{notes}</Text>
            </>
          ) : null}
          <Hr />
          <Text style={{ color: "#6b7280", fontSize: "12px" }}>
            Sent by the Kordi landing page report form.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

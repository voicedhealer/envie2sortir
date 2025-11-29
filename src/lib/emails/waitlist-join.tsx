/**
 * Template email pour confirmation d'inscription à la waitlist
 * À utiliser avec Resend React Email
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import { formatLaunchDate, getDaysUntilLaunch, formatTimeUntilLaunch } from '@/lib/launch';

interface WaitlistJoinEmailProps {
  firstName: string;
  daysUntilLaunch: number;
}

export function WaitlistJoinEmail({ firstName, daysUntilLaunch }: WaitlistJoinEmailProps) {
  const launchDate = formatLaunchDate();
  const timeUntilLaunch = formatTimeUntilLaunch();

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={title}>🎉 Bienvenue dans la waitlist premium !</Text>
            
            <Text style={paragraph}>
              Bonjour {firstName},
            </Text>

            <Text style={paragraph}>
              Merci de votre intérêt pour envie2sortir.fr ! Votre inscription à la waitlist premium
              a été confirmée avec succès.
            </Text>

            <Text style={paragraph}>
              <strong>Vous bénéficiez dès maintenant de l'accès premium gratuitement</strong> jusqu'au
              lancement officiel du site.
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightText}>
                📅 Date de lancement : {launchDate}
              </Text>
              <Text style={highlightText}>
                ⏰ {timeUntilLaunch}
              </Text>
            </Section>

            <Text style={paragraph}>
              Pendant cette période, vous pouvez :
            </Text>

            <ul style={list}>
              <li>✅ Ajouter jusqu'à 5 photos avec l'effet Papillon</li>
              <li>✅ Créer des événements temporaires</li>
              <li>✅ Publier des bons plans quotidiens</li>
              <li>✅ Accéder aux analyses avancées</li>
              <li>✅ Bénéficier du support prioritaire</li>
            </ul>

            <Text style={paragraph}>
              Au moment du lancement officiel, votre abonnement premium sera automatiquement activé
              et la facturation commencera.
            </Text>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr'}/dashboard`}
              >
                Accéder à mon dashboard
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              À bientôt sur envie2sortir.fr !<br />
              L'équipe Envie2Sortir
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const section = {
  padding: '0 48px',
};

const title = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#ff751f',
  margin: '0 0 20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '0 0 16px',
};

const highlightBox = {
  backgroundColor: '#fff5f0',
  border: '2px solid #ff751f',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const highlightText = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#ff751f',
  fontWeight: '600',
  margin: '8px 0',
};

const list = {
  fontSize: '16px',
  lineHeight: '1.8',
  color: '#333333',
  margin: '16px 0',
  paddingLeft: '24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#ff751f',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#6b7280',
  textAlign: 'center' as const,
};


/**
 * Template email pour notification de lancement officiel
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

interface LaunchReadyEmailProps {
  firstName: string;
  establishmentName?: string;
}

export function LaunchReadyEmail({ firstName, establishmentName }: LaunchReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={title}>🎉 Le site est lancé !</Text>
            
            <Text style={paragraph}>
              Bonjour {firstName},
            </Text>

            <Text style={paragraph}>
              <strong>Excellente nouvelle !</strong> Le site envie2sortir.fr est maintenant officiellement lancé !
            </Text>

            <Text style={paragraph}>
              Votre abonnement premium a été automatiquement activé. Vous pouvez maintenant profiter
              pleinement de toutes les fonctionnalités premium.
            </Text>

            {establishmentName && (
              <Text style={paragraph}>
                Votre établissement <strong>{establishmentName}</strong> est maintenant en ligne avec
                tous les avantages premium.
              </Text>
            )}

            <Section style={highlightBox}>
              <Text style={highlightText}>
                ✨ Votre abonnement premium est actif
              </Text>
              <Text style={paragraph}>
                La facturation a commencé. Vous recevrez votre première facture selon le plan choisi.
              </Text>
            </Section>

            <Text style={paragraph}>
              N'hésitez pas à explorer toutes les fonctionnalités disponibles :
            </Text>

            <ul style={list}>
              <li>🦋 Effet Papillon : jusqu'à 5 photos</li>
              <li>📢 Créer des événements temporaires</li>
              <li>🎁 Publier des bons plans quotidiens</li>
              <li>⭐ Mise en avant prioritaire</li>
              <li>📊 Analyses avancées</li>
            </ul>

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
              Merci de votre confiance !<br />
              L'équipe Envie2Sortir
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (réutilisés depuis waitlist-join.tsx)
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
  fontSize: '18px',
  lineHeight: '1.5',
  color: '#ff751f',
  fontWeight: '700',
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


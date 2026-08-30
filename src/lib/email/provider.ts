// ============================================
// Email Provider Abstraction
// ============================================
// This interface defines the contract for any email provider.
// To switch providers, implement this interface and update
// the getProvider() function in index.ts.

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

// Resend implementation
export class ResendProvider implements EmailProvider {
  name = 'resend';
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'IIITSocial <noreply@iiitsocial.in>';
    this.fromName = process.env.EMAIL_FROM_NAME || 'IIITSocial';
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.apiKey) {
      console.warn('[Email] RESEND_API_KEY not set. Email not sent to:', message.to);
      return {
        success: false,
        error: 'RESEND_API_KEY environment variable is not set',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `Resend API error: ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      };
    }
  }
}

// Console provider for development/testing
// Logs emails to console instead of actually sending them
export class ConsoleProvider implements EmailProvider {
  name = 'console';

  async send(message: EmailMessage): Promise<EmailSendResult> {
    console.log('═══════════════════════════════════════════════');
    console.log('[EMAIL] Simulated send (ConsoleProvider)');
    console.log('  To:', message.to);
    console.log('  Subject:', message.subject);
    console.log('  HTML length:', message.html.length, 'chars');
    console.log('═══════════════════════════════════════════════');
    return {
      success: true,
      messageId: 'console_' + Date.now(),
    };
  }
}

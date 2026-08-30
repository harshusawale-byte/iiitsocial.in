// ============================================
// Email Provider Factory
// ============================================
// Returns the configured email provider based on environment.
// Change this single function to switch email providers.

import type { EmailProvider } from './provider';
import { ResendProvider, ConsoleProvider } from './provider';

let providerInstance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (providerInstance) return providerInstance;

  const provider = process.env.EMAIL_PROVIDER || 'console';

  switch (provider) {
    case 'resend':
      providerInstance = new ResendProvider();
      break;
    case 'console':
    default:
      providerInstance = new ConsoleProvider();
      break;
  }

  console.log(`[Email] Using provider: ${providerInstance.name}`);
  return providerInstance;
}

// Reset provider (for testing)
export function resetEmailProvider(): void {
  providerInstance = null;
}

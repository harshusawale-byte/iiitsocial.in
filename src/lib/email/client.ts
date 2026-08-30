// ============================================
// Client-Side Email Helper
// ============================================
// This module is safe to import in client components.
// It calls the server-side /api/email route.
// API keys are NEVER exposed to the browser.

import type { EmailEventType } from '../../types';

interface SendEmailOptions {
  to: string;
  eventType: EmailEventType;
  data?: Record<string, string>;
}

/**
 * Request an email to be sent via the server-side API.
 * Safe to call from client components.
 */
export async function requestEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send email' };
    }

    return { success: data.success, error: data.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Convenience functions for common email events.
 */
export const emailNotifications = {
  accountCreated(to: string, userName: string) {
    return requestEmail({
      to,
      eventType: 'ACCOUNT_CREATED',
      data: { userName },
    });
  },

  loginAlert(to: string, userName: string, details: { ip?: string; device?: string; location?: string }) {
    return requestEmail({
      to,
      eventType: 'LOGIN_ALERT',
      data: {
        userName,
        ...details,
        time: new Date().toLocaleString(),
      },
    });
  },

  developerAccessApproved(to: string, userName: string) {
    return requestEmail({
      to,
      eventType: 'DEVELOPER_ACCESS_APPROVED',
      data: { userName },
    });
  },

  developerAccessRejected(to: string, userName: string, reason?: string) {
    return requestEmail({
      to,
      eventType: 'DEVELOPER_ACCESS_REJECTED',
      data: { userName, reason: reason || '' },
    });
  },

  developerAccessRevoked(to: string, userName: string, reason?: string) {
    return requestEmail({
      to,
      eventType: 'DEVELOPER_ACCESS_REVOKED',
      data: { userName, reason: reason || '' },
    });
  },

  accountChanged(to: string, userName: string, changeType: string) {
    return requestEmail({
      to,
      eventType: 'ACCOUNT_CHANGED',
      data: { userName, changeType },
    });
  },

  passwordChanged(to: string, userName: string) {
    return requestEmail({
      to,
      eventType: 'PASSWORD_CHANGED',
      data: { userName },
    });
  },

  emailChanged(to: string, userName: string, newEmail: string) {
    return requestEmail({
      to,
      eventType: 'EMAIL_CHANGED',
      data: { userName, newEmail },
    });
  },
};

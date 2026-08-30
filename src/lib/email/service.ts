// ============================================
// Email Service
// ============================================
// High-level service that sends emails and logs delivery.
// All email sending goes through this service.

import type { EmailEventType, EmailDeliveryStatus } from '../../types';
import { getEmailProvider } from './index';

export interface SendEmailParams {
  to: string;
  eventType: EmailEventType;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendLog {
  id: string;
  to: string;
  eventType: EmailEventType;
  subject: string;
  status: EmailDeliveryStatus;
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
}

// In-memory log for prototype (would be database in production)
const emailLogs: EmailSendLog[] = [];

/**
 * Send an email and log the result.
 * All email sending should go through this function.
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailSendLog> {
  const logId = 'elog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();

  const log: EmailSendLog = {
    id: logId,
    to: params.to,
    eventType: params.eventType,
    subject: params.subject,
    status: 'FAILED',
    createdAt: now,
  };

  try {
    const provider = getEmailProvider();
    const result = await provider.send({
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (result.success) {
      log.status = 'SENT';
      log.providerMessageId = result.messageId;
      log.sentAt = new Date().toISOString();
    } else {
      log.status = 'FAILED';
      log.errorMessage = result.error;
    }
  } catch (error) {
    log.status = 'FAILED';
    log.errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  // Store log
  emailLogs.unshift(log);

  // Keep only last 500 logs in memory
  if (emailLogs.length > 500) {
    emailLogs.length = 500;
  }

  // Console log for visibility
  const emojiMap: Record<EmailDeliveryStatus, string> = { SENT: '✅', FAILED: '❌', BOUNCED: '🔁' };
  console.log(`[Email] ${emojiMap[log.status]} ${log.status} → ${log.to} | ${log.eventType} | ${log.subject}`);

  return log;
}

/**
 * Get email logs, optionally filtered.
 */
export function getEmailLogs(filters?: {
  eventType?: EmailEventType;
  status?: EmailDeliveryStatus;
  to?: string;
  limit?: number;
}): EmailSendLog[] {
  let logs = [...emailLogs];

  if (filters?.eventType) {
    logs = logs.filter(l => l.eventType === filters.eventType);
  }
  if (filters?.status) {
    logs = logs.filter(l => l.status === filters.status);
  }
  if (filters?.to) {
    logs = logs.filter(l => l.to === filters.to);
  }

  const limit = filters?.limit || 50;
  return logs.slice(0, limit);
}

/**
 * Mark an email as bounced (called by webhook handler in production).
 */
export function markEmailBounced(logId: string): void {
  const log = emailLogs.find(l => l.id === logId);
  if (log) {
    log.status = 'BOUNCED';
    console.log(`[Email] Bounced → ${log.to} | ${log.eventType}`);
  }
}

/**
 * Get email delivery statistics.
 */
export function getEmailStats(): {
  total: number;
  sent: number;
  failed: number;
  bounced: number;
} {
  return {
    total: emailLogs.length,
    sent: emailLogs.filter(l => l.status === 'SENT').length,
    failed: emailLogs.filter(l => l.status === 'FAILED').length,
    bounced: emailLogs.filter(l => l.status === 'BOUNCED').length,
  };
}

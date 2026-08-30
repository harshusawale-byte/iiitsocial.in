// ============================================
// POST /api/email
// ============================================
// Server-side email sending endpoint.
// NEVER exposes API keys to the browser.
// All email requests go through this route.

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, type SendEmailParams } from '../../../lib/email/service';
import {
  accountCreatedTemplate,
  loginAlertTemplate,
  developerAccessApprovedTemplate,
  developerAccessRejectedTemplate,
  developerAccessRevokedTemplate,
  accountChangedTemplate,
  passwordChangedTemplate,
  emailChangedTemplate,
} from '../../../lib/email/templates';
import type { EmailEventType } from '../../../types';

interface SendRequest {
  to: string;
  eventType: EmailEventType;
  data?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: to, eventType' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate template based on event type
    const template = generateTemplate(body.eventType, body.data || {});

    // Send email via service (which uses the configured provider)
    const log = await sendEmail({
      to: body.to,
      eventType: body.eventType,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return NextResponse.json({
      success: log.status === 'SENT',
      logId: log.id,
      status: log.status,
      messageId: log.providerMessageId,
      error: log.errorMessage,
    });
  } catch (error) {
    console.error('[Email API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateTemplate(eventType: EmailEventType, data: Record<string, string>) {
  const name = data.userName || data.name || 'Student';

  switch (eventType) {
    case 'ACCOUNT_CREATED':
      return accountCreatedTemplate(name);

    case 'LOGIN_ALERT':
      return loginAlertTemplate(name, {
        ip: data.ip,
        device: data.device,
        location: data.location,
        time: data.time || new Date().toLocaleString(),
      });

    case 'DEVELOPER_ACCESS_APPROVED':
      return developerAccessApprovedTemplate(name);

    case 'DEVELOPER_ACCESS_REJECTED':
      return developerAccessRejectedTemplate(name, data.reason);

    case 'DEVELOPER_ACCESS_REVOKED':
      return developerAccessRevokedTemplate(name, data.reason);

    case 'ACCOUNT_CHANGED':
      return accountChangedTemplate(name, data.changeType || 'Account updated');

    case 'PASSWORD_CHANGED':
      return passwordChangedTemplate(name);

    case 'EMAIL_CHANGED':
      return emailChangedTemplate(name, data.newEmail || '');

    default:
      return {
        subject: 'IIITSocial Notification',
        html: '<p>You have a new notification from IIITSocial.</p>',
        text: 'You have a new notification from IIITSocial.',
      };
  }
}

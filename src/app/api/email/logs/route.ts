// ============================================
// GET /api/email/logs
// ============================================
// Returns email delivery logs for the admin dashboard.

import { NextRequest, NextResponse } from 'next/server';
import { getEmailLogs, getEmailStats } from '../../../../lib/email/service';
import type { EmailEventType, EmailDeliveryStatus } from '../../../../types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const eventType = searchParams.get('eventType') as EmailEventType | null;
  const status = searchParams.get('status') as EmailDeliveryStatus | null;
  const to = searchParams.get('to') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const logs = getEmailLogs({
    eventType: eventType || undefined,
    status: status || undefined,
    to,
    limit,
  });

  const stats = getEmailStats();

  return NextResponse.json({ logs, stats });
}

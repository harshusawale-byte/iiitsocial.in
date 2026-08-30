// ============================================
// Email Templates
// ============================================
// All templates return { subject, html, text } for a given event.
// Templates use IIITSocial branding (black/red theme).
// Provider can be swapped without touching these templates.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://iiitsocial.in';
const SITE_NAME = 'IIITSocial';

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IIITSocial</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background-color:#e50914;border-radius:8px;padding:6px 10px;">
                    <span style="color:#ffffff;font-weight:bold;font-size:14px;">II</span>
                  </td>
                  <td style="padding-left:8px;">
                    <span style="color:#ffffff;font-weight:bold;font-size:20px;letter-spacing:-0.5px;">IIIT<strong style="color:#e50914;">Social</strong></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background-color:#141414;border-radius:12px;border:1px solid #262626;padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="color:#666666;font-size:12px;margin:0;">
                Your IIIT. Your people. Your world.
              </p>
              <p style="color:#444444;font-size:11px;margin:8px 0 0;">
                This is a transactional email from ${SITE_NAME}.<br>
                <a href="${SITE_URL}/preferences" style="color:#666;">Manage email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ─── ACCOUNT CREATED ────────────────────────────────────────────────────────

export function accountCreatedTemplate(userName: string): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px;">
      Welcome to ${SITE_NAME}! 🎉
    </h1>
    <p style="color:#a0a0a0;font-size:15px;margin:0 0 24px;">
      Hey ${userName},
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Your account has been created successfully. You're now part of the ${SITE_NAME} community — a social world built exclusively around your IIIT life.
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 24px;">
      <strong style="color:#ffffff;">Next step:</strong> Complete your IIIT verification to unlock the full experience — find your batchmates, join communities, and start sharing.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      <tr>
        <td align="center">
          <a href="${SITE_URL}/onboarding" style="display:inline-block;background-color:#e50914;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
            Complete Verification →
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#666666;font-size:13px;margin:0;line-height:1.5;">
      If you didn't create this account, please ignore this email or contact our support team.
    </p>
  `;

  return {
    subject: `Welcome to ${SITE_NAME}, ${userName}! 🎉`,
    html: baseLayout(content),
    text: `Welcome to ${SITE_NAME}!\n\nHey ${userName},\n\nYour account has been created successfully. Complete your IIIT verification to unlock the full experience.\n\nVerify now: ${SITE_URL}/onboarding`,
  };
}

// ─── LOGIN ALERT ────────────────────────────────────────────────────────────

export function loginAlertTemplate(
  userName: string,
  loginInfo: { ip?: string; device?: string; location?: string; time: string }
): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      New Login Detected 🔐
    </h1>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Hey ${userName}, we noticed a new sign-in to your ${SITE_NAME} account.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:8px;border:1px solid #262626;margin:0 0 20px;">
      <tr>
        <td style="padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#666;font-size:12px;padding:4px 0;">Time</td>
              <td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${loginInfo.time}</td>
            </tr>
            ${loginInfo.device ? `<tr><td style="color:#666;font-size:12px;padding:4px 0;">Device</td><td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${loginInfo.device}</td></tr>` : ''}
            ${loginInfo.location ? `<tr><td style="color:#666;font-size:12px;padding:4px 0;">Location</td><td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${loginInfo.location}</td></tr>` : ''}
            ${loginInfo.ip ? `<tr><td style="color:#666;font-size:12px;padding:4px 0;">IP Address</td><td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${loginInfo.ip}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    <p style="color:#a0a0a0;font-size:13px;margin:0 0 8px;">
      If this was you, no action needed.
    </p>
    <p style="color:#e50914;font-size:13px;font-weight:600;margin:0;">
      If this wasn't you, secure your account immediately →
    </p>
  `;

  return {
    subject: `🔐 New login to your ${SITE_NAME} account`,
    html: baseLayout(content),
    text: `New Login Detected\n\nHey ${userName},\n\nA new sign-in was detected on your ${SITE_NAME} account.\n\nTime: ${loginInfo.time}${loginInfo.device ? `\nDevice: ${loginInfo.device}` : ''}${loginInfo.location ? `\nLocation: ${loginInfo.location}` : ''}\n\nIf this wasn't you, please secure your account.`,
  };
}

// ─── DEVELOPER ACCESS APPROVED ──────────────────────────────────────────────

export function developerAccessApprovedTemplate(userName: string): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      Developer Access Approved ✅
    </h1>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Hey ${userName}, great news! Your developer access request has been approved.
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 24px;">
      You now have access to developer features on ${SITE_NAME}. This includes API access, advanced analytics, and developer tools.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      <tr>
        <td align="center">
          <a href="${SITE_URL}/profile" style="display:inline-block;background-color:#e50914;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
            View Your Profile →
          </a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `✅ Your developer access has been approved`,
    html: baseLayout(content),
    text: `Developer Access Approved\n\nHey ${userName}, your developer access request has been approved. You now have access to developer features on ${SITE_NAME}.`,
  };
}

// ─── DEVELOPER ACCESS REJECTED ──────────────────────────────────────────────

export function developerAccessRejectedTemplate(userName: string, reason?: string): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      Developer Access Update
    </h1>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Hey ${userName},
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Unfortunately, your developer access request was not approved at this time.
    </p>
    ${reason ? `<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;background-color:#1a1a1a;padding:12px 16px;border-radius:8px;border:1px solid #262626;">
      <strong style="color:#a0a0a0;">Reason:</strong> ${reason}
    </p>` : ''}
    <p style="color:#a0a0a0;font-size:13px;margin:0;">
      You may reapply after 30 days. If you have questions, contact our support team.
    </p>
  `;

  return {
    subject: `Developer access request update`,
    html: baseLayout(content),
    text: `Developer Access Update\n\nHey ${userName},\n\nYour developer access request was not approved at this time.${reason ? `\n\nReason: ${reason}` : ''}\n\nYou may reapply after 30 days.`,
  };
}

// ─── DEVELOPER ACCESS REVOKED ───────────────────────────────────────────────

export function developerAccessRevokedTemplate(userName: string, reason?: string): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      Developer Access Revoked ⚠️
    </h1>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Hey ${userName},
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Your developer access on ${SITE_NAME} has been revoked.
    </p>
    ${reason ? `<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;background-color:#1a1a1a;padding:12px 16px;border-radius:8px;border:1px solid #262626;">
      <strong style="color:#a0a0a0;">Reason:</strong> ${reason}
    </p>` : ''}
    <p style="color:#a0a0a0;font-size:13px;margin:0;">
      If you believe this was done in error, please contact our support team.
    </p>
  `;

  return {
    subject: `⚠️ Your developer access has been revoked`,
    html: baseLayout(content),
    text: `Developer Access Revoked\n\nHey ${userName},\n\nYour developer access on ${SITE_NAME} has been revoked.${reason ? `\n\nReason: ${reason}` : ''}\n\nIf you believe this was done in error, please contact support.`,
  };
}

// ─── ACCOUNT CHANGED ────────────────────────────────────────────────────────

export function accountChangedTemplate(userName: string, changeType: string): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      Account Updated 🔔
    </h1>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Hey ${userName},
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Your ${SITE_NAME} account was recently updated.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:8px;border:1px solid #262626;margin:0 0 24px;">
      <tr>
        <td style="padding:16px;">
          <p style="color:#666;font-size:12px;margin:0 0 4px;">Change type</p>
          <p style="color:#fff;font-size:14px;margin:0;">${changeType}</p>
        </td>
      </tr>
    </table>
    <p style="color:#a0a0a0;font-size:13px;margin:0;">
      If you didn't make this change, secure your account immediately.
    </p>
  `;

  return {
    subject: `Your ${SITE_NAME} account was updated`,
    html: baseLayout(content),
    text: `Account Updated\n\nHey ${userName},\n\nYour ${SITE_NAME} account was recently updated.\n\nChange type: ${changeType}\n\nIf you didn't make this change, please secure your account.`,
  };
}

// ─── PASSWORD CHANGED ───────────────────────────────────────────────────────

export function passwordChangedTemplate(userName: string): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      Password Changed 🔒
    </h1>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Hey ${userName},
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Your ${SITE_NAME} account password was recently changed. This email confirms the change.
    </p>
    <p style="color:#e50914;font-size:13px;font-weight:600;margin:0;">
      If you didn't change your password, contact support immediately.
    </p>
  `;

  return {
    subject: `🔒 Your password was changed`,
    html: baseLayout(content),
    text: `Password Changed\n\nHey ${userName},\n\nYour ${SITE_NAME} account password was recently changed.\n\nIf you didn't change your password, contact support immediately.`,
  };
}

// ─── EMAIL CHANGED ──────────────────────────────────────────────────────────

export function emailChangedTemplate(userName: string, newEmail: string): EmailTemplate {
  const content = `
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      Email Address Changed 📧
    </h1>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Hey ${userName},
    </p>
    <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Your ${SITE_NAME} account email has been changed to <strong style="color:#fff;">${newEmail}</strong>.
    </p>
    <p style="color:#a0a0a0;font-size:13px;margin:0;">
      If you didn't make this change, secure your account immediately.
    </p>
  `;

  return {
    subject: `📧 Your email address was changed`,
    html: baseLayout(content),
    text: `Email Address Changed\n\nHey ${userName},\n\nYour ${SITE_NAME} account email has been changed to ${newEmail}.\n\nIf you didn't make this change, secure your account immediately.`,
  };
}

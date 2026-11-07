function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function licenseEmailText(key: string): string {
  return `Thank you for choosing JSON Viewer PRO. Keep this key safe:\n\n${key}\n\nActivate it at https://jsonviewer.io/pro`;
}

export function licenseEmailHtml(key: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your JSON Viewer PRO license key</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; color: #2a2a2a; font-family: Ubuntu, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; table-layout: fixed; background-color: #ffffff; border: 1px solid #e1e1e1; border-radius: 12px;">
          <tr>
            <td style="padding: 32px 24px 24px;">
              <span style="font-size: 22px; font-weight: 700; color: #2a2a2a;">jsonviewer.io</span>
              <span style="display: inline-block; margin-left: 8px; padding: 3px 8px; border: 1px solid #2a2a2a; border-radius: 6px; font-size: 12px; font-weight: 700; vertical-align: middle;">PRO</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 24px 32px;">
              <h1 style="margin: 0 0 12px; font-size: 26px; line-height: 1.3; font-weight: 700;">Your license key is ready</h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Thank you for choosing JSON Viewer PRO.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; table-layout: fixed;">
                <tr>
                  <td style="padding: 16px; background-color: #f5f5f5; border: 1px solid #e1e1e1; border-radius: 6px; font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace; font-size: 14px; line-height: 1.6; word-break: break-all; overflow-wrap: anywhere;">${escapeHtml(key)}</td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #318e99; border-radius: 6px;">
                    <a href="https://jsonviewer.io/pro" style="display: inline-block; padding: 14px 20px; border: 1px solid #318e99; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none;">Activate your license</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6;">Keep this key safe. You’ll need it to activate JSON Viewer PRO.</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">Lost your key? <a href="https://jsonviewer.io/pro/lost-key" style="color: #246a73; text-decoration: underline;">Recover your license key</a>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 24px; border-top: 1px solid #e1e1e1; font-size: 12px; line-height: 1.6; color: #666666;">Questions? Email <a href="mailto:support@jsonviewer.io" style="color: #666666; text-decoration: underline;">support@jsonviewer.io</a>.</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Responsive HTML Email Templates for UpSpace 3D Skyline
 */

const BASE_STYLES = `
  body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
  .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
  .header { padding: 32px 32px 24px; text-align: center; background: linear-gradient(180deg, rgba(249, 115, 22, 0.15) 0%, rgba(15, 23, 42, 0) 100%); border-bottom: 1px solid #1e293b; }
  .logo { font-size: 26px; font-weight: 900; color: #f97316; letter-spacing: -0.5px; text-decoration: none; }
  .badge { display: inline-block; padding: 4px 12px; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 999px; font-size: 11px; font-weight: 800; color: #fb923c; text-transform: uppercase; margin-top: 10px; }
  .content { padding: 32px; }
  .title { font-size: 22px; font-weight: 900; margin: 0 0 12px; color: #ffffff; line-height: 1.3; }
  .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px; }
  .card { background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
  .row:last-child { border-bottom: none; }
  .label { color: #64748b; font-weight: 600; }
  .value { color: #f8fafc; font-weight: 700; text-align: right; }
  .btn { display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff !important; text-align: center; padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none; margin: 20px 0 10px; }
  .btn-outline { display: inline-block; width: 100%; box-sizing: border-box; background-color: transparent; border: 1px solid #334155; color: #cbd5e1 !important; text-align: center; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 700; text-decoration: none; }
  .token-box { background-color: #032541; border: 1px dashed #0284c7; border-radius: 10px; padding: 14px; text-align: center; margin: 18px 0; font-family: monospace; font-size: 15px; font-weight: 800; color: #38bdf8; }
  .footer { padding: 24px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; }
`;

/**
 * 1. Order & Placement Confirmation Receipt Email
 */
export function getOrderConfirmationHtml(data: {
  buyerName: string;
  brandTitle: string;
  targetUrl: string;
  displayLevel: number;
  amount: number;
  paymentId: string;
  orderId: string;
  claimCode: string;
  siteUrl?: string;
}): string {
  const siteUrl = data.siteUrl || 'https://upspace.live';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <a href="${siteUrl}" class="logo">UpSpace 3D Skyline</a>
        <br/>
        <div class="badge">Permanent Placement Confirmed</div>
      </div>
      <div class="content">
        <h1 class="title">Congratulations! Your Billboard is Now Live on Level #${data.displayLevel}</h1>
        <p class="text">
          Hello ${data.buyerName}, your advertising campaign for <strong>${data.brandTitle}</strong> has been successfully placed on the UpSpace virtual 3D tower and is now broadcasting to visitors worldwide.
        </p>

        <div class="card">
          <div class="row">
            <span class="label">Floor Level:</span>
            <span class="value">Level #${data.displayLevel} (Permanent)</span>
          </div>
          <div class="row">
            <span class="label">Brand / Campaign:</span>
            <span class="value">${data.brandTitle}</span>
          </div>
          <div class="row">
            <span class="label">Target URL:</span>
            <span class="value">${data.targetUrl}</span>
          </div>
          <div class="row">
            <span class="label">Payment ID:</span>
            <span class="value">${data.paymentId}</span>
          </div>
          <div class="row">
            <span class="label">Amount Paid:</span>
            <span class="value" style="color: #f97316; font-size: 15px;">₹${data.amount.toLocaleString('en-IN')} INR</span>
          </div>
        </div>

        <p class="text" style="font-size: 12px; margin-bottom: 6px;">
          Save your unique claim authentication token to link this floor to your account:
        </p>
        <div class="token-box">${data.claimCode}</div>

        <a href="${siteUrl}" class="btn">View Live on 3D Skyline →</a>
      </div>
      <div class="footer">
        UpSpace 3D Virtual Real Estate &amp; Billboard Infrastructure<br/>
        Permanent Placement · SSL Encrypted · Automated Telemetry
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 2. Floor View & Website Click Milestone Alert Email
 */
export function getViewMilestoneHtml(data: {
  buyerName: string;
  brandTitle: string;
  displayLevel: number;
  floorClicks: number;
  websiteVisits: number;
  ctr: number;
  siteUrl?: string;
}): string {
  const siteUrl = data.siteUrl || 'https://upspace.live';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <a href="${siteUrl}" class="logo">UpSpace 3D Skyline</a>
        <br/>
        <div class="badge" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #34d399;">Proof of Eyeballs Milestone</div>
      </div>
      <div class="content">
        <h1 class="title">🔥 Your Level #${data.displayLevel} Billboard is Trending!</h1>
        <p class="text">
          Great news, ${data.buyerName}! Your brand <strong>${data.brandTitle}</strong> is getting heavy engagement on the 3D tower skyline.
        </p>

        <div class="card" style="text-align: center; padding: 24px 16px;">
          <div style="font-size: 32px; font-weight: 900; color: #38bdf8; margin-bottom: 4px;">
            ${data.floorClicks.toLocaleString()} Floor Views
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #34d399; margin-bottom: 12px;">
            ${data.websiteVisits.toLocaleString()} Outbound Website Visits (${data.ctr}% CTR)
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            Users are rotating the 3D skyline, inspecting your level, and clicking your destination link.
          </p>
        </div>

        <a href="${siteUrl}" class="btn">Inspect Live Telemetry Drawer →</a>
      </div>
      <div class="footer">
        UpSpace 3D Virtual Real Estate · Real-Time Telemetry Tracking
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 3. Outbid Notice Email
 */
export function getOutbidAlertHtml(data: {
  buyerName: string;
  brandTitle: string;
  currentLevel: number;
  newTopLevel: number;
  newTopBidder: string;
  nextRequiredBid: number;
  siteUrl?: string;
}): string {
  const siteUrl = data.siteUrl || 'https://upspace.live';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <a href="${siteUrl}" class="logo">UpSpace 3D Skyline</a>
        <br/>
        <div class="badge" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); color: #f87171;">⚠️ Skyline Outbid Notice</div>
      </div>
      <div class="content">
        <h1 class="title">Someone Just Built Above Your Floor!</h1>
        <p class="text">
          Attention ${data.buyerName}, <strong>${data.newTopBidder}</strong> just claimed <strong>Level #${data.newTopLevel}</strong>, placing them at the highest altitude on the tower.
        </p>

        <div class="card">
          <div class="row">
            <span class="label">Your Floor Position:</span>
            <span class="value">Level #${data.currentLevel}</span>
          </div>
          <div class="row">
            <span class="label">New Highest Leader:</span>
            <span class="value">${data.newTopBidder} (Level #${data.newTopLevel})</span>
          </div>
          <div class="row">
            <span class="label">Price to Reclaim #1 Rank:</span>
            <span class="value" style="color: #f97316;">₹${data.nextRequiredBid.toLocaleString('en-IN')} INR</span>
          </div>
        </div>

        <p class="text" style="font-size: 13px;">
          Build the next pinnacle level on top of the tower to regain the #1 Rank, exclusive rooftop grand billboard, and sky airplane banner!
        </p>

        <a href="${siteUrl}" class="btn">Claim Top Floor #${data.newTopLevel + 1} Now →</a>
      </div>
      <div class="footer">
        UpSpace 3D Virtual Real Estate · Outbid &amp; Skyline Leaderboard Alerts
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 4. Weekly & Monthly Analytics Digest Email
 */
export function getAnalyticsDigestHtml(data: {
  buyerName: string;
  brandTitle: string;
  displayLevel: number;
  period: 'Weekly' | 'Monthly';
  totalImpressions: number;
  floorClicks: number;
  websiteVisits: number;
  ctr: number;
  siteUrl?: string;
}): string {
  const siteUrl = data.siteUrl || 'https://upspace.live';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <a href="${siteUrl}" class="logo">UpSpace 3D Skyline</a>
        <br/>
        <div class="badge">${data.period} Analytics Performance</div>
      </div>
      <div class="content">
        <h1 class="title">${data.period} Advertising Report for ${data.brandTitle}</h1>
        <p class="text">
          Here is your ${data.period.toLowerCase()} campaign performance overview for <strong>Level #${data.displayLevel}</strong> on UpSpace.
        </p>

        <div class="card">
          <div class="row">
            <span class="label">Total 3D Orbit Impressions:</span>
            <span class="value" style="color: #a855f7;">${data.totalImpressions.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Floor Detail Inspects:</span>
            <span class="value" style="color: #38bdf8;">${data.floorClicks.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Outbound Website Visitors:</span>
            <span class="value" style="color: #34d399;">${data.websiteVisits.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Click-Through Conversion (CTR):</span>
            <span class="value" style="color: #f97316;">${data.ctr}%</span>
          </div>
        </div>

        <a href="${siteUrl}" class="btn">Open Interactive Dashboard →</a>
      </div>
      <div class="footer">
        UpSpace 3D Virtual Real Estate · Automated Analytics Digest
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 5. Skyline Top Floor Recommendation Email
 */
export function getSkylineRecommendationHtml(data: {
  userName: string;
  recommendedLevel: number;
  topBrand: string;
  nextBidPrice: number;
  siteUrl?: string;
}): string {
  const siteUrl = data.siteUrl || 'https://upspace.live';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <a href="${siteUrl}" class="logo">UpSpace 3D Skyline</a>
        <br/>
        <div class="badge" style="background: rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.4); color: #facc15;">👑 Skyline Prime Spot Opportunity</div>
      </div>
      <div class="content">
        <h1 class="title">Exclusive Opportunity: Claim the Top Penthouse Spot</h1>
        <p class="text">
          Hi ${data.userName}, the highest level on the UpSpace skyline (<strong>Level #${data.recommendedLevel}</strong>) is currently available to claim.
        </p>

        <div class="card">
          <div class="row">
            <span class="label">Prime Available Spot:</span>
            <span class="value">Level #${data.recommendedLevel} (Penthouse)</span>
          </div>
          <div class="row">
            <span class="label">Current Pinnacle Leader:</span>
            <span class="value">${data.topBrand}</span>
          </div>
          <div class="row">
            <span class="label">Price to Outbid:</span>
            <span class="value" style="color: #f97316;">₹${data.nextBidPrice.toLocaleString('en-IN')} INR</span>
          </div>
        </div>

        <p class="text" style="font-size: 13px;">
          Top floor sponsors receive prime placement, the massive rooftop grand billboard, helicopter helipad view, and the sky airplane aerial banner!
        </p>

        <a href="${siteUrl}" class="btn">Claim Pinnacle Level #${data.recommendedLevel} →</a>
      </div>
      <div class="footer">
        UpSpace 3D Virtual Real Estate · Curated Placement Opportunities
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

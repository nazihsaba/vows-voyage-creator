export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  const parts = url.pathname.split('/').filter(Boolean);
  const slug     = parts[1];
  const linkSlug = parts[2];
  const num      = parts[3];

  if (!slug || slug === 'preview') {
    return context.next();
  }

  const ua = request.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|slackbot|discordbot/i.test(ua);

  if (!isCrawler) {
    return context.next();
  }

  const imageUrl   = `https://zpwnpxkznlgdgkticiem.supabase.co/storage/v1/object/public/invitation-images/invites/${slug}/main.jpg`;
  const guestLabel = linkSlug
    ? decodeURIComponent(linkSlug).replace(/-/g, ' ')
    : null;
  const personWord = num === '1' ? 'person' : 'people';

  const title = guestLabel
    ? `${titleCase(guestLabel)} — You're invited`
    : `You're invited`;

  const description = guestLabel && num
    ? `Invitation for ${titleCase(guestLabel)} · ${num} ${personWord}`
    : `Open your personal invitation on Aurea Invites`;

  const canonicalUrl = `https://aureainvites.com${url.pathname}`;

  return new Response(buildOGPage({ title, description, imageUrl, canonicalUrl }), {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

function buildOGPage({ title, description, imageUrl, canonicalUrl }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <meta property="og:type"         content="website">
  <meta property="og:url"          content="${esc(canonicalUrl)}">
  <meta property="og:title"        content="${esc(title)}">
  <meta property="og:description"  content="${esc(description)}">
  <meta property="og:image"        content="${esc(imageUrl)}">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image"       content="${esc(imageUrl)}">
</head>
<body>${esc(title)}</body>
</html>`;
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

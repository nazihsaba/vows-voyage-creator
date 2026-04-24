import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_ORIGIN = "https://aureainvites.com";
const APP_ORIGIN = "https://app.aureainvites.com";
const DEFAULT_TITLE = "You're Invited 💍 | A Special Wedding Celebration";
const DEFAULT_DESCRIPTION =
  "Celebrate love and joy with a beautifully crafted wedding invitation. Discover all the details of this special day and join the celebration.✨";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/images/og-preview.jpg`;

/** Ensure any image URL we hand back is absolute + public. */
function toAbsoluteImageUrl(raw: string | null | undefined, supabaseUrl: string): string {
  if (!raw) return DEFAULT_IMAGE;
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${SITE_ORIGIN}${trimmed}`;
  return `${supabaseUrl}/storage/v1/object/public/${trimmed.replace(/^\/+/, "")}`;
}

/** Escape HTML special chars to prevent broken tags / XSS */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getImageMime(imageUrl: string): string {
  const lower = imageUrl.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("whatsapp") ||
    ua.includes("facebookexternalhit") ||
    ua.includes("facebot") ||
    ua.includes("twitterbot") ||
    ua.includes("telegrambot") ||
    ua.includes("linkedinbot") ||
    ua.includes("slackbot") ||
    ua.includes("discordbot") ||
    ua.includes("skypeuripreview") ||
    ua.includes("bot") ||
    ua.includes("crawler") ||
    ua.includes("spider")
  );
}

function buildOgHtml({
  title,
  description,
  imageUrl,
  imageAlt,
  canonicalUrl,
  redirectUrl,
  forCrawler,
}: {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  canonicalUrl: string;
  redirectUrl: string;
  forCrawler: boolean;
}): string {
  const t = esc(title);
  const d = esc(description);
  const img = esc(imageUrl);
  const alt = esc(imageAlt);
  const url = esc(canonicalUrl);
  const redir = esc(redirectUrl);
  const mime = getImageMime(imageUrl);

  // For crawlers (WhatsApp, Facebook, etc.) we serve PURE OG metadata
  // with NO redirect — meta refresh / 3xx confuses Meta's central crawler
  // and breaks the desktop/web preview. Real users get a JS redirect (crawlers don't run JS).
  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t}</title>
  <meta name="description" content="${d}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Aurea Invites" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:secure_url" content="${img}" />
  <meta property="og:image:type" content="${mime}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${alt}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${img}" />

  <link rel="canonical" href="${url}" />
  ${
    forCrawler
      ? ""
      : `<script>window.location.replace(${JSON.stringify(redirectUrl)});</script>`
  }
</head>
<body>
  <p>Redirecting to <a href="${redir}">your invitation</a>&hellip;</p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const userAgent = req.headers.get("user-agent") || "";
  const forCrawler = isCrawler(userAgent);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Path: /og-invite/{slug} or /og-invite/{slug}/{linkSlug}/{numberOfPersons}
    const fnIndex = pathParts.indexOf("og-invite");
    const slug = pathParts[fnIndex + 1];
    const linkSlug = pathParts[fnIndex + 2];
    const numberOfPersons = pathParts[fnIndex + 3];

    if (!slug) {
      return new Response("Missing slug", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: wedding, error } = await supabase
      .from("weddings")
      .select(
        "id, groom_name, bride_name, wedding_date, main_picture_url, event_title, template_type"
      )
      .eq("slug", slug)
      .maybeSingle();

    // ── Build redirect path ──
    const siteOrigin =
      url.searchParams.get("origin") || SITE_ORIGIN;
    let redirectPath = `/invite/${slug}`;
    if (linkSlug && numberOfPersons) {
      redirectPath = `/invite/${slug}/${linkSlug}/${numberOfPersons}`;
    }
    const redirectUrl = `${siteOrigin}${redirectPath}`;
    const canonicalUrl = `${SITE_ORIGIN}${redirectPath}`;

    // ── Fallback when wedding not found ──
    if (error || !wedding) {
      const html = buildOgHtml({
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        imageUrl: DEFAULT_IMAGE,
        imageAlt: "Wedding Invitation",
        canonicalUrl,
        redirectUrl,
        forCrawler,
      });

      return new Response(html, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=600",
        },
      });
    }

    // ── Dynamic values ──
    const groomName = wedding.groom_name || "Groom";
    const brideName = wedding.bride_name || "Bride";

    const title = `You are invited to ${groomName} and ${brideName}'s wedding`;
    const description = `Join us in celebrating the union of ${groomName} & ${brideName}. Tap to view your invitation and RSVP.`;

    // Resolve image: try the dedicated synced OG image first, then fall back.
    // We DO NOT probe with HEAD because Supabase Storage doesn't always honor it
    // and sequential probes can exceed Meta's crawler timeout (~5s),
    // which is the main reason WhatsApp Desktop/Web shows no preview.
    let imageUrl = `${supabaseUrl}/storage/v1/object/public/invitation-images/invites/${slug}/main.jpg`;

    // If the synced OG image doesn't exist, we still need a valid fallback.
    // Use main_picture_url or first gallery image — do this in a single query path.
    if (wedding.main_picture_url) {
      // Prefer the curated main picture as a stronger guarantee of existence
      imageUrl = wedding.main_picture_url;
    } else {
      const { data: coverImage } = await supabase
        .from("gallery_images")
        .select("image_url")
        .eq("wedding_id", wedding.id)
        .order("image_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (coverImage?.image_url) {
        imageUrl = coverImage.image_url;
      } else {
        imageUrl = DEFAULT_IMAGE;
      }
    }

    const imageAlt = `Wedding invitation for ${groomName} and ${brideName}`;

    const html = buildOgHtml({
      title,
      description,
      imageUrl,
      imageAlt,
      canonicalUrl,
      redirectUrl,
      forCrawler,
    });

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        // Shorter cache so updates propagate; Meta caches separately on its side.
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (err) {
    console.error("OG invite error:", err);

    // Even on error, return valid OG HTML so crawlers get something
    const fallbackHtml = buildOgHtml({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      imageUrl: DEFAULT_IMAGE,
      imageAlt: "Wedding Invitation",
      canonicalUrl: SITE_ORIGIN,
      redirectUrl: SITE_ORIGIN,
      forCrawler,
    });

    return new Response(fallbackHtml, {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
});

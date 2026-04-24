import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_ORIGIN = "https://app.aureainvites.com";
const DEFAULT_TITLE = "Wedding Invitation";
const DEFAULT_DESCRIPTION = "Tap to view your invitation";
const DEFAULT_IMAGE =
  "https://zpwnpxkznlgdgkticiem.supabase.co/storage/v1/object/public/wedding-images/og-default.png";

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

    // Resolve image: invitation-images bucket → main_picture_url → gallery → default
    let imageUrl = "";

    // Try the dedicated OG image from invitation-images bucket first
    const ogBasePath = `invites/${slug}/main`;
    for (const ext of ["jpg", "png", "webp"]) {
      const candidateUrl = `${supabaseUrl}/storage/v1/object/public/invitation-images/${ogBasePath}.${ext}`;
      try {
        const headResp = await fetch(candidateUrl, { method: "HEAD" });
        if (headResp.ok) {
          imageUrl = candidateUrl;
          break;
        }
      } catch {
        // continue trying
      }
    }

    // Fallback to main_picture_url from the wedding record
    if (!imageUrl) {
      imageUrl = wedding.main_picture_url || "";
    }

    // Fallback to first gallery image
    if (!imageUrl) {
      const { data: coverImage } = await supabase
        .from("gallery_images")
        .select("image_url")
        .eq("wedding_id", wedding.id)
        .order("image_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      imageUrl = coverImage?.image_url || "";
    }

    if (!imageUrl) {
      imageUrl = DEFAULT_IMAGE;
    }

    const imageAlt = `Wedding invitation for ${groomName} and ${brideName}`;

    const html = buildOgHtml({
      title,
      description,
      imageUrl,
      imageAlt,
      canonicalUrl,
      redirectUrl,
    });

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
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

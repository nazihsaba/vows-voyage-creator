import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const linkSlug = url.searchParams.get("link");
    const persons = url.searchParams.get("persons");

    if (!slug) {
      return new Response("Missing slug", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: wedding, error } = await supabase
      .from("weddings")
      .select("groom_name, bride_name, wedding_date, main_picture_url, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !wedding) {
      return new Response("Wedding not found", { status: 404 });
    }

    const groomName = wedding.groom_name || "Groom";
    const brideName = wedding.bride_name || "Bride";
    const weddingDate = wedding.wedding_date
      ? new Date(wedding.wedding_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    const title = `${groomName} & ${brideName}'s Wedding Invitation`;
    const description = weddingDate
      ? `You're invited to celebrate the wedding of ${groomName} & ${brideName} on ${weddingDate}. Open to view & RSVP 💍`
      : `You're invited to celebrate the wedding of ${groomName} & ${brideName}. Open to view & RSVP 💍`;

    const ogImage = wedding.main_picture_url || `${supabaseUrl}/storage/v1/object/public/wedding-images/default-og.jpg`;

    // Build the redirect URL to the actual invitation page
    const appUrl = Deno.env.get("APP_URL") || "https://aureainvites.com";
    let redirectPath = `/invite/${slug}`;
    if (linkSlug) redirectPath += `/${linkSlug}`;
    if (persons) redirectPath += `/${persons}`;
    const redirectUrl = `${appUrl}${redirectPath}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:url" content="${redirectUrl}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />

  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <script>window.location.href = "${redirectUrl}";</script>
</head>
<body>
  <p>Redirecting to <a href="${redirectUrl}">${title}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Internal error", { status: 500 });
  }
});

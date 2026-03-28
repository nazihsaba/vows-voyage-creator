import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Expected path: /og-invite/{slug} or /og-invite/{slug}/{linkSlug}/{numberOfPersons}
    // Edge function name is the first part, so we skip it
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
      .select("id, groom_name, bride_name, wedding_date, main_picture_url, event_title, template_type")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !wedding) {
      return new Response("Wedding not found", { status: 404 });
    }

    // Build the redirect URL to the actual SPA invitation page
    const siteOrigin = url.searchParams.get("origin") || "https://app.aureainvites.com";
    let redirectPath = `/invite/${slug}`;
    if (linkSlug && numberOfPersons) {
      redirectPath = `/invite/${slug}/${linkSlug}/${numberOfPersons}`;
    }
    const redirectUrl = `${siteOrigin}${redirectPath}`;

    const title = `Wedding of ${wedding.groom_name} & ${wedding.bride_name}`;
    const description = `You are invited to the wedding of ${wedding.groom_name} and ${wedding.bride_name}`;

    let imageUrl = wedding.main_picture_url || "";

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

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${redirectUrl}" />
  <meta property="og:site_name" content="Aurea Invites" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:alt" content="Wedding invitation cover for ${wedding.groom_name} and ${wedding.bride_name}" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${redirectUrl}">invitation</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("OG invite error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});

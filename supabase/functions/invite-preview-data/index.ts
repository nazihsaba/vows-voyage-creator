import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_TITLE = "Wedding Invitation";
const DEFAULT_DESCRIPTION = "Tap to view your invitation";
const DEFAULT_IMAGE = "https://aureainvites.com/default-preview.jpg";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const fnIndex = pathParts.indexOf("invite-preview-data");
    const slug = pathParts[fnIndex + 1] || url.searchParams.get("slug");

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Missing slug parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: wedding, error } = await supabase
      .from("weddings")
      .select("id, slug, groom_name, bride_name, main_picture_url, main_description")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !wedding) {
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Resolve image: invitation-images bucket → main_picture_url → gallery → default
    let mainImageUrl = "";
    const ogBase = `invites/${slug}/main`;
    for (const ext of ["jpg", "png", "webp"]) {
      const candidate = `${supabaseUrl}/storage/v1/object/public/invitation-images/${ogBase}.${ext}`;
      try {
        const head = await fetch(candidate, { method: "HEAD" });
        if (head.ok) {
          mainImageUrl = candidate;
          break;
        }
      } catch {
        // continue
      }
    }

    if (!mainImageUrl) {
      mainImageUrl = wedding.main_picture_url || "";
    }

    if (!mainImageUrl) {
      const { data: cover } = await supabase
        .from("gallery_images")
        .select("image_url")
        .eq("wedding_id", wedding.id)
        .order("image_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      mainImageUrl = cover?.image_url || "";
    }

    const groom = wedding.groom_name || "";
    const bride = wedding.bride_name || "";
    const title =
      groom && bride
        ? `You are invited to ${groom} and ${bride}'s wedding`
        : DEFAULT_TITLE;

    const payload = {
      slug: wedding.slug,
      groom_name: groom || "Groom",
      bride_name: bride || "Bride",
      title,
      main_image_url: mainImageUrl || DEFAULT_IMAGE,
      preview_description: wedding.main_description || DEFAULT_DESCRIPTION,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("invite-preview-data error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

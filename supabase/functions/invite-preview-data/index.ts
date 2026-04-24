import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_ORIGIN = "https://aureainvites.com";
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
  // Relative app path → site origin
  if (trimmed.startsWith("/")) return `${SITE_ORIGIN}${trimmed}`;
  // Bare storage path → public Supabase storage URL
  return `${supabaseUrl}/storage/v1/object/public/${trimmed.replace(/^\/+/, "")}`;
}

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
      // Return defaults (with absolute URLs) so the worker still serves a valid card
      return new Response(
        JSON.stringify({
          slug: slug,
          groom_name: "",
          bride_name: "",
          title: DEFAULT_TITLE,
          main_image_url: DEFAULT_IMAGE,
          preview_description: DEFAULT_DESCRIPTION,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        }
      );
    }

    // Resolve image: invitation-images bucket (synced OG) → main_picture_url → gallery → default
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

    if (!mainImageUrl && wedding.main_picture_url) {
      mainImageUrl = wedding.main_picture_url;
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

    // Always normalize to an absolute, public URL
    const absoluteImageUrl = toAbsoluteImageUrl(mainImageUrl, supabaseUrl);

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
      main_image_url: absoluteImageUrl,
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

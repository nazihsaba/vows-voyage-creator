import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get auth token from request for storage upload
    const authHeader = req.headers.get("authorization") || "";

    // ---- STEP 1: Detect tables ----
    const systemPrompt = `You are a venue layout analysis assistant. You analyze venue floor plan images and detect all tables, seating areas, and notable elements (like bars, cake tables, DJ booths, dance floors).

For each detected element, return its:
- name: A descriptive name (e.g. "Table 1", "Bridal Table", "Bar", "Dance Floor")
- shape: One of "round", "rectangle", "square", or "oval"
- x_percent: Center X position as a percentage (0-100) of the image width
- y_percent: Center Y position as a percentage (0-100) of the image height
- width_percent: Width as a percentage of the image width. IMPORTANT: Tables are typically SMALL — round tables are usually 3-7% of the image width. Do NOT overestimate sizes.
- height_percent: Height as a percentage of the image height. IMPORTANT: Keep proportional to width_percent for round/square tables.
- guest_count: Estimated number of guests/chairs visible around the table (0 for non-table elements)
- You must also add the chairs to the tables. Number of chairs should be equal to the number of guests on the table.

CRITICAL SIZING RULES:
- Round tables with chairs typically occupy only 4-6% of a venue plan's width
- Rectangle/banquet tables are typically 8-12% wide and 3-5% tall
- When in doubt, make tables SMALLER rather than larger
- When a table is detected, it should cover the table already available in the image, have the same size and shape`;

    const userPrompt = `Analyze this venue floor plan image and detect all tables and notable elements. Return ONLY a valid JSON array of objects with the fields: name, shape, x_percent, y_percent, width_percent, height_percent, guest_count. No markdown, no explanation, just the JSON array.`;

    const detectResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!detectResponse.ok) {
      const errorText = await detectResponse.text();
      console.error("AI detection error:", detectResponse.status, errorText);
      if (detectResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (detectResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI detection error: ${detectResponse.status}`);
    }

    const detectData = await detectResponse.json();
    const detectContent = detectData.choices?.[0]?.message?.content || "";

    let jsonStr = detectContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const tables = JSON.parse(jsonStr);
    if (!Array.isArray(tables)) throw new Error("AI response is not an array");

    console.log(`Detected ${tables.length} tables. Now editing image to remove them...`);

    // ---- STEP 2: Edit image to remove detected elements ----
    const elementDescriptions = tables
      .map((t: any) => `${t.name} (${t.shape}, at ${t.x_percent}%/${t.y_percent}%)`)
      .join(", ");

    const editPrompt = `Remove ALL tables, chairs, seating elements, and furniture from this venue floor plan image. The elements to remove are: ${elementDescriptions}. Replace each removed element with the floor/background pattern that surrounds it, so the result looks like an empty venue with no tables or chairs — just the bare room layout (walls, doors, stage, etc.). Keep everything else intact.`;

    const editResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: editPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!editResponse.ok) {
      const errText = await editResponse.text();
      console.error("AI image edit error:", editResponse.status, errText);
      // If image editing fails, still return the detected tables with the original image
      return new Response(JSON.stringify({ tables, cleanedImageUrl: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const editData = await editResponse.json();
    const editedImageBase64 = editData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    let cleanedImageUrl: string | null = null;

    if (editedImageBase64) {
      // Upload the cleaned image to storage
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Extract base64 data
        const base64Data = editedImageBase64.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        const path = `venue-cleaned/cleaned-${Date.now()}.png`;
        const { error: uploadErr } = await supabaseAdmin.storage
          .from("wedding-images")
          .upload(path, binaryData, { contentType: "image/png", upsert: true });

        if (uploadErr) {
          console.error("Upload error:", uploadErr);
        } else {
          const { data: urlData } = supabaseAdmin.storage.from("wedding-images").getPublicUrl(path);
          cleanedImageUrl = urlData.publicUrl;
          console.log("Cleaned image uploaded:", cleanedImageUrl);
        }
      } catch (uploadErr) {
        console.error("Failed to upload cleaned image:", uploadErr);
      }
    }

    return new Response(JSON.stringify({ tables, cleanedImageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("detect-venue-tables error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

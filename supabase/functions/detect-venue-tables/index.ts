import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a venue layout analysis assistant. You analyze venue floor plan images and detect all tables, seating areas, and notable elements (like bars, cake tables, DJ booths, dance floors).

For each detected element, return its:
- name: A descriptive name (e.g. "Table 1", "Bridal Table", "Bar", "Dance Floor")
- shape: One of "round", "rectangle", "square", or "oval"
- x_percent: Center X position as a percentage (0-100) of the image width
- y_percent: Center Y position as a percentage (0-100) of the image height
- width_percent: Width as a percentage of the image width
- height_percent: Height as a percentage of the image height
- guest_count: Estimated number of guests/chairs visible around the table (0 for non-table elements)

Focus on accuracy of positions. Round tables with chairs around them are the most common element. Count chairs carefully for guest_count.`;

    const userPrompt = `Analyze this venue floor plan image and detect all tables and notable elements. Return ONLY a valid JSON array of objects with the fields: name, shape, x_percent, y_percent, width_percent, height_percent, guest_count. No markdown, no explanation, just the JSON array.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON array from response (handle potential markdown wrapping)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const tables = JSON.parse(jsonStr);

    if (!Array.isArray(tables)) {
      throw new Error("AI response is not an array");
    }

    return new Response(JSON.stringify({ tables }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("detect-venue-tables error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

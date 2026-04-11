import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `Analyze this venue/floor plan image. Detect all tables visible in the image.

For each table found, return a JSON object with:
- name: a label like "Table 1", "Table 2", etc.
- shape: one of "round", "square", "rectangle", "oval"
- x_percent: horizontal position as a percentage (0-100) of the image width
- y_percent: vertical position as a percentage (0-100) of the image height
- width_percent: width as a percentage of image width (typically 5-15%)
- height_percent: height as a percentage of image height (typically 5-15%)
- guest_count: estimated number of seats/chairs around the table (count visible chairs, default to 8 if unclear)

Return ONLY a JSON array of table objects. No explanation, no markdown, just the JSON array.
If no tables are detected, return an empty array [].

Example output:
[{"name":"Table 1","shape":"round","x_percent":25,"y_percent":30,"width_percent":10,"height_percent":10,"guest_count":8}]`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    const detectedTables = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ tables: detectedTables }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error detecting tables:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

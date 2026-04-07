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
    const { texts, targetLanguage } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: "texts must be a non-empty array of strings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      return new Response(
        JSON.stringify({ error: "targetLanguage is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isArabic = targetLanguage.includes("العربية") || targetLanguage.toLowerCase().includes("arabic");
    
    const prompt = `Translate the following texts to ${targetLanguage}. Return ONLY a JSON array of translated strings in the same order. Do not add any explanation or markdown formatting.
${isArabic ? "\nIMPORTANT: Use Modern Standard Arabic (فصحى). Use natural, fluent Arabic phrasing — not word-by-word translation. For wedding/formal contexts, use elegant and culturally appropriate Arabic expressions." : ""}

Input texts:
${JSON.stringify(texts)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 8192,
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator specializing in wedding and formal event content. You translate text accurately while preserving tone, meaning, and cultural nuances. For Arabic, always use Modern Standard Arabic with elegant, formal phrasing appropriate for wedding invitations. Never translate proper nouns or names. You MUST translate ALL provided texts completely — never truncate or skip any.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_translations",
              description: "Return the translated texts as an array",
              parameters: {
                type: "object",
                properties: {
                  translations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of translated strings in the same order as input",
                  },
                },
                required: ["translations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_translations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ translations: parsed.translations }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: try parsing content directly
    const content = data.choices?.[0]?.message?.content || "[]";
    const translations = JSON.parse(content);
    return new Response(
      JSON.stringify({ translations }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

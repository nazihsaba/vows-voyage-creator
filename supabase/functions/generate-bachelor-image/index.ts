import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { groomName, brideName, eventDate, theme } = await req.json();

    // Generate image prompt based on bachelor party details
    const prompt = `Create a stylish bachelor party invitation card with the following details:
    - Event: Bachelor Party for ${groomName}
    - Bride: ${brideName}
    - Date: ${eventDate}
    - Theme: ${theme || 'fun and celebratory with leafy green elements'}
    
    Design requirements:
    - Modern, elegant design
    - Include subtle greenery/leaf elements
    - Professional yet fun aesthetic
    - Space for text overlay
    - High quality, suitable for invitation card
    - Warm, inviting colors
    - 16:9 aspect ratio for banner`;

    // Call Lovable AI to generate the image
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      throw new Error(`AI generation failed: ${error}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    // Upload the generated image to Supabase storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert base64 to blob
    const base64Data = imageUrl.split(",")[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const fileName = `bachelor-${Date.now()}.png`;
    const filePath = `generated/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("wedding-images")
      .upload(filePath, binaryData, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("wedding-images")
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: urlData.publicUrl 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating bachelor image:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
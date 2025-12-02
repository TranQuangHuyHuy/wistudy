import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idolImageBase64, userImageBase64, backgroundPrompt } = await req.json();

    // Try Gemini API key first, fallback to Lovable AI
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("No API key configured");
    }

    // Build the prompt for image generation - focus on generating a study scene
    // Don't try to extract/place a person from the reference image
    const prompt = `Create a beautiful, aesthetic anime-style study scene illustration. The scene shows a cozy ${backgroundPrompt || "study environment with warm lighting and a desk setup"}.

Style requirements:
- Soft, warm lighting with gentle shadows
- Clean, minimal aesthetic similar to lo-fi study backgrounds
- Comfortable, inviting atmosphere with study elements (books, lamp, window)
- High quality anime/illustration style rendering
- Aspect ratio: 4:3
- The image should evoke a calm, focused study mood
- Include a cute anime character studying at a desk
- Pastel colors and dreamy atmosphere`;

    let response;
    let useGemini = !!GEMINI_API_KEY;

    // Try Gemini API first
    if (useGemini) {
      console.log("Trying Gemini API...");
      
      const parts: any[] = [{ text: prompt }];

      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
          }),
        }
      );

      // If rate limited, try Lovable AI
      if (response.status === 429 && LOVABLE_API_KEY) {
        console.log("Gemini rate limited, falling back to Lovable AI...");
        useGemini = false;
      }
    }

    // Use Lovable AI as fallback or primary
    if (!useGemini && LOVABLE_API_KEY) {
      console.log("Using Lovable AI...");
      
      const messageContent: any[] = [{ type: "text", text: prompt }];

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: messageContent }],
          modalities: ["image", "text"]
        }),
      });
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : "No response";
      console.error("API error:", response?.status, errorText);
      
      if (response?.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu. Vui lòng đợi 1-2 phút rồi thử lại." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`API error: ${response?.status || 'unknown'}`);
    }

    const data = await response.json();
    console.log("API response received");

    // Extract image based on which API was used
    let generatedImageUrl = null;
    let textResponse = "";

    if (useGemini) {
      // Gemini response format
      if (data.candidates && data.candidates[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inline_data?.data) {
            const mimeType = part.inline_data.mime_type || "image/png";
            generatedImageUrl = `data:${mimeType};base64,${part.inline_data.data}`;
          }
          if (part.text) {
            textResponse = part.text;
          }
        }
      }
    } else {
      // Lovable AI response format
      generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      textResponse = data.choices?.[0]?.message?.content || "";
    }

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      // Return a more helpful error message
      return new Response(
        JSON.stringify({ 
          error: "AI không thể tạo ảnh lúc này. Vui lòng thử lại.",
          details: textResponse || "Unknown error"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImageUrl,
        message: textResponse || "Đã tạo ảnh thành công!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-study-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo ảnh" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

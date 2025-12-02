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

    // Build the prompt for image generation
    let prompt = `Create a beautiful, aesthetic study scene image. The scene shows a cozy ${backgroundPrompt || "study environment with warm lighting"}. 
    
Style requirements:
- Soft, warm lighting with gentle shadows
- Clean, minimal aesthetic similar to Pinterest study setups
- Comfortable, inviting atmosphere
- High quality, photorealistic rendering
- Aspect ratio: 4:3
- The image should evoke a calm, focused study mood`;

    // If we have an idol image, update the prompt
    if (idolImageBase64) {
      prompt = `Based on the person in this reference photo, create an image of them studying in a ${backgroundPrompt || "cozy study environment"}. Keep their likeness but show them focused on studying. The scene should have soft, warm lighting and a calm atmosphere. Make it photorealistic and aesthetic. Aspect ratio 4:3.`;
    }

    let response;
    let useGemini = !!GEMINI_API_KEY;

    // Try Gemini API first
    if (useGemini) {
      console.log("Trying Gemini API...");
      
      const parts: any[] = [{ text: prompt }];

      if (idolImageBase64) {
        const base64Data = idolImageBase64.includes(',') 
          ? idolImageBase64.split(',')[1] 
          : idolImageBase64;
        
        let mimeType = "image/jpeg";
        if (idolImageBase64.includes("image/png")) {
          mimeType = "image/png";
        } else if (idolImageBase64.includes("image/webp")) {
          mimeType = "image/webp";
        }

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      }

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

      if (idolImageBase64) {
        messageContent.push({
          type: "image_url",
          image_url: {
            url: idolImageBase64.startsWith('data:') ? idolImageBase64 : `data:image/jpeg;base64,${idolImageBase64}`
          }
        });
      }

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
      throw new Error("Không thể tạo ảnh. Vui lòng thử lại.");
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

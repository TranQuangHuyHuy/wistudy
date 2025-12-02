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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
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

    console.log("Generating image with Gemini API (Nano Banana)...");

    // Prepare the content parts
    const parts: any[] = [{ text: prompt }];

    // Add idol image as inline data if provided
    if (idolImageBase64) {
      // Extract base64 data from data URL
      const base64Data = idolImageBase64.includes(',') 
        ? idolImageBase64.split(',')[1] 
        : idolImageBase64;
      
      // Determine mime type
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

    // Call Gemini API with gemini-2.0-flash-exp-image-generation model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts
            }
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: "API key không hợp lệ hoặc không có quyền truy cập." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini response received:", JSON.stringify(data).substring(0, 500));

    // Extract the generated image from response
    let generatedImageUrl = null;
    let textResponse = "";

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inline_data?.data) {
          // Found image data
          const mimeType = part.inline_data.mime_type || "image/png";
          generatedImageUrl = `data:${mimeType};base64,${part.inline_data.data}`;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("Không thể tạo ảnh. Gemini có thể không hỗ trợ yêu cầu này.");
    }

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImageUrl,
        message: textResponse || "Đã tạo ảnh thành công!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-study-image function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo ảnh" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

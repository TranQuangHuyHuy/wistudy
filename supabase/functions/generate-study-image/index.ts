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

    const isAnonymous = !idolImageBase64 || idolImageBase64 === 'anonymous';
    
    let prompt: string;
    const parts: any[] = [];

    if (isAnonymous) {
      // Anonymous mode - generate a random person
      prompt = `Create a beautiful artistic illustration of a person studying in a ${backgroundPrompt || "cozy study room with warm lighting"}.

Requirements:
- Create a unique, attractive character (can be male or female, any ethnicity)
- Show them sitting at a desk, deeply focused on studying with books and notes
- Include cozy study elements: desk lamp, books, coffee/tea cup, plants, stationery
- Soft, warm lighting atmosphere with gentle shadows
- Pastel colors, dreamy lo-fi aesthetic similar to study music video backgrounds
- Anime/illustration art style
- Aspect ratio 4:3
- The character should look peaceful and focused`;
      
      parts.push({ text: prompt });
    } else {
      // With reference image - create based on the person
      prompt = `Look at this reference image of a person. Create a new artistic illustration showing this same person studying in a ${backgroundPrompt || "cozy study room with warm lighting"}.

Requirements:
- Draw the person from the reference image in an artistic anime/illustration style
- Show them sitting at a desk, studying with books and notes
- Include cozy study elements: desk lamp, books, coffee/tea cup, plants
- Soft, warm lighting atmosphere
- Pastel colors, dreamy lo-fi aesthetic
- Aspect ratio 4:3
- The person should look similar to the reference but in illustration style`;

      parts.push({ text: prompt });
      
      // Extract base64 data (remove data URL prefix if present)
      let base64Data = idolImageBase64;
      let mimeType = "image/jpeg";
      
      if (idolImageBase64.startsWith('data:')) {
        const match = idolImageBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    console.log(`Using Gemini API (${isAnonymous ? 'anonymous mode' : 'with reference'})...`);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu. Vui lòng đợi 1-2 phút rồi thử lại." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 400) {
        return new Response(
          JSON.stringify({ error: "Yêu cầu không hợp lệ. Vui lòng thử ảnh khác." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API response received");

    // Extract image from Gemini response
    let generatedImageUrl = null;
    let textResponse = "";
    
    const candidates = data.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.text) {
          textResponse = part.text;
        }
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || "image/png";
          const base64Data = part.inlineData.data;
          generatedImageUrl = `data:${mimeType};base64,${base64Data}`;
        }
      }
    }

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 1000));
      
      // If model refuses, return helpful message
      if (textResponse.toLowerCase().includes("can't") || textResponse.toLowerCase().includes("cannot") || textResponse.toLowerCase().includes("sorry")) {
        return new Response(
          JSON.stringify({ 
            error: isAnonymous 
              ? "AI không thể tạo ảnh. Vui lòng thử lại."
              : "AI không thể tạo ảnh với yêu cầu này. Hãy thử ảnh khác hoặc dùng chế độ ẩn danh.",
            details: textResponse
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Không thể tạo ảnh. Vui lòng thử lại.",
          details: textResponse
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImageUrl,
        message: isAnonymous 
          ? "Đã tạo không gian học tập thành công!" 
          : "Đã tạo ảnh thành công!"
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

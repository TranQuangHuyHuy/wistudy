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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("No API key configured");
    }

    // Build prompt - ask to create image inspired by the reference
    const prompt = `Look at this reference image of a person. Create a new artistic illustration showing this same person studying in a ${backgroundPrompt || "cozy study room with warm lighting"}.

Requirements:
- Draw the person from the reference image in an artistic anime/illustration style
- Show them sitting at a desk, studying with books and notes
- Include cozy study elements: desk lamp, books, coffee/tea cup, plants
- Soft, warm lighting atmosphere
- Pastel colors, dreamy lo-fi aesthetic
- Aspect ratio 4:3
- The person should look similar to the reference but in illustration style`;

    console.log("Using Lovable AI with gemini-3-pro-image-preview...");
    
    const messageContent: any[] = [
      { type: "text", text: prompt }
    ];

    // Add idol image as reference
    if (idolImageBase64) {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: idolImageBase64.startsWith('data:') ? idolImageBase64 : `data:image/jpeg;base64,${idolImageBase64}`
        }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: messageContent }],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu. Vui lòng đợi 1-2 phút rồi thử lại." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Cần nạp thêm credits. Vui lòng liên hệ admin." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response received");

    // Extract image from Lovable AI response
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || "";

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 1000));
      
      // If model refuses, return helpful message
      if (textResponse.toLowerCase().includes("can't") || textResponse.toLowerCase().includes("cannot")) {
        return new Response(
          JSON.stringify({ 
            error: "AI không thể tạo ảnh với yêu cầu này. Hãy thử ảnh idol khác.",
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
        message: "Đã tạo ảnh học cùng idol thành công!"
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

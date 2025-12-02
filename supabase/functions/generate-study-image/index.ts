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
      throw new Error("LOVABLE_API_KEY is not configured");
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

    // If we have reference images, include them in the request
    const messageContent: any[] = [
      {
        type: "text",
        text: prompt
      }
    ];

    // Add idol image as reference if provided
    if (idolImageBase64) {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: idolImageBase64.startsWith('data:') ? idolImageBase64 : `data:image/jpeg;base64,${idolImageBase64}`
        }
      });
      messageContent[0].text = `Based on the person in this reference photo, create an image of them studying in a ${backgroundPrompt || "cozy study environment"}. Keep their likeness but show them focused on studying. The scene should have soft, warm lighting and a calm atmosphere. Make it photorealistic and aesthetic.`;
    }

    console.log("Generating image with Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Cần nạp thêm credits. Vui lòng liên hệ admin." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the generated image
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("Không thể tạo ảnh. Vui lòng thử lại.");
    }

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImageUrl,
        message: data.choices?.[0]?.message?.content || "Đã tạo ảnh thành công!"
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

async function generateWithOpenAI(prompt: string, isAnonymous: boolean): Promise<Response> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  console.log(`Trying OpenAI (${isAnonymous ? 'anonymous mode' : 'with reference'})...`);

  return await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    }),
  });
}

async function generateWithLovableAI(parts: any[], isAnonymous: boolean): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const messages = [{
    role: "user",
    content: parts.map(part => {
      if (part.text) {
        return { type: "text", text: part.text };
      }
      if (part.inlineData) {
        return {
          type: "image_url",
          image_url: {
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          }
        };
      }
      return part;
    })
  }];

  console.log(`Trying Lovable AI (${isAnonymous ? 'anonymous mode' : 'with reference'})...`);

  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
      messages,
      modalities: ["image", "text"]
    }),
  });
}

async function generateWithGeminiAPI(parts: any[], isAnonymous: boolean): Promise<Response> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  console.log(`Trying Gemini API (${isAnonymous ? 'anonymous mode' : 'with reference'})...`);

  return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
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
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idolImageBase64, backgroundPrompt } = await req.json();

    const isAnonymous = !idolImageBase64 || idolImageBase64 === 'anonymous';
    
    let prompt: string;
    const parts: any[] = [];

    if (isAnonymous) {
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

    let generatedImageUrl = null;
    let textResponse = "";
    let lastError: string | null = null;

    // Try Gemini API first with retries
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await generateWithGeminiAPI(parts, isAnonymous);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Gemini API response received");
          
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
          
          if (generatedImageUrl) break;
        } else if (response.status === 429) {
          const errorText = await response.text();
          console.log(`Gemini API rate limited (attempt ${attempt + 1}/${MAX_RETRIES}): ${errorText.substring(0, 200)}`);
          lastError = "Gemini API rate limited";
          
          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
            console.log(`Waiting ${delay}ms before retry...`);
            await sleep(delay);
          }
        } else {
          const errorText = await response.text();
          console.error("Gemini API error:", response.status, errorText);
          lastError = `Gemini API error: ${response.status}`;
          break;
        }
      } catch (e) {
        console.error("Gemini API exception:", e);
        lastError = e instanceof Error ? e.message : "Unknown error";
        break;
      }
    }

    // Fallback to Lovable AI if Gemini API failed
    if (!generatedImageUrl) {
      console.log("Falling back to Lovable AI...");
      
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const response = await generateWithLovableAI(parts, isAnonymous);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Lovable AI response received");
            
            const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            if (imageUrl) {
              generatedImageUrl = imageUrl;
              break;
            }
            textResponse = data.choices?.[0]?.message?.content || "";
          } else if (response.status === 429 || response.status === 402) {
            console.log(`Lovable AI rate limited (attempt ${attempt + 1}/${MAX_RETRIES}): ${response.status}`);
            lastError = `Lovable AI: ${response.status}`;
            
            if (attempt < MAX_RETRIES - 1) {
              const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
              console.log(`Waiting ${delay}ms before retry...`);
              await sleep(delay);
            }
          } else {
            const errorText = await response.text();
            console.error("Lovable AI error:", response.status, errorText);
            lastError = `Lovable AI error: ${response.status}`;
            break;
          }
        } catch (e) {
          console.error("Lovable AI exception:", e);
          lastError = e instanceof Error ? e.message : "Unknown error";
          break;
        }
      }
    }

    // Fallback to OpenAI if both Gemini and Lovable AI failed
    if (!generatedImageUrl) {
      console.log("Falling back to OpenAI...");
      
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const response = await generateWithOpenAI(prompt, isAnonymous);
          
          if (response.ok) {
            const data = await response.json();
            console.log("OpenAI response received");
            
            // OpenAI returns base64 data in data[0].b64_json or URL in data[0].url
            if (data.data && data.data[0]) {
              if (data.data[0].b64_json) {
                generatedImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
              } else if (data.data[0].url) {
                // Fetch the image and convert to base64
                const imgResponse = await fetch(data.data[0].url);
                const imgBuffer = await imgResponse.arrayBuffer();
                const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
                generatedImageUrl = `data:image/png;base64,${base64}`;
              }
            }
            
            if (generatedImageUrl) break;
          } else if (response.status === 429) {
            console.log(`OpenAI rate limited (attempt ${attempt + 1}/${MAX_RETRIES})`);
            lastError = `OpenAI rate limited`;
            
            if (attempt < MAX_RETRIES - 1) {
              const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
              console.log(`Waiting ${delay}ms before retry...`);
              await sleep(delay);
            }
          } else {
            const errorText = await response.text();
            console.error("OpenAI error:", response.status, errorText);
            lastError = `OpenAI error: ${response.status}`;
            break;
          }
        } catch (e) {
          console.error("OpenAI exception:", e);
          lastError = e instanceof Error ? e.message : "Unknown error";
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      console.error("All AI providers failed. Last error:", lastError);
      
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
          error: "Tất cả AI đều đang bận. Vui lòng đợi 1-2 phút rồi thử lại.",
          details: lastError
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

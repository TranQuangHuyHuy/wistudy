import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing codes for this email
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("email", email);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("email_verification_codes")
      .insert({
        email,
        code: otpCode,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userName = fullName || "bạn";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận email WiStudy</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #5BA8F1; font-size: 28px; margin: 0; font-weight: 700;">WiStudy</h1>
          </div>
          
          <h2 style="color: #1D1D1F; font-size: 20px; margin-bottom: 16px; text-align: center;">Xác nhận email của bạn</h2>
          
          <p style="color: #666666; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
            Xin chào ${userName}! Cảm ơn bạn đã đăng ký WiStudy. Vui lòng nhập mã xác nhận bên dưới để hoàn tất đăng ký:
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #888888; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Mã xác nhận của bạn</p>
            <div style="font-size: 36px; font-weight: 700; color: #1D1D1F; letter-spacing: 8px; font-family: monospace;">
              ${otpCode}
            </div>
          </div>
          
          <p style="color: #888888; font-size: 13px; text-align: center; margin-bottom: 24px;">
            Mã này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          
          <p style="color: #999999; font-size: 12px; text-align: center; margin: 0;">
            Email này được gửi tự động từ WiStudy.<br>
            Vui lòng không trả lời email này.
          </p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "WiStudy <onboarding@resend.dev>",
      to: [email],
      subject: `${otpCode} là mã xác nhận WiStudy của bạn`,
      html: emailHtml,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

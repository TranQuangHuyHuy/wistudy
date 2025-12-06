import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/wistudy/Logo";
import { StepIndicator } from "@/components/wistudy/StepIndicator";
import { useWiStudy } from "@/contexts/WiStudyContext";
import { backgrounds } from "@/data/backgrounds";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface GeneratedImage {
  id: string;
  image_url: string;
  background_prompt: string | null;
  created_at: string;
}

export default function GeneratePage() {
  const navigate = useNavigate();
  const { userData, setGeneratedImage } = useWiStudy();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(userData.generatedImage);
  const hasGeneratedRef = useRef(false);
  const [userName, setUserName] = useState<string>("bạn");
  const [todayImages, setTodayImages] = useState<GeneratedImage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const maxDailyGenerations = 3;

  const isTextPrompt = userData.selectedBackground?.startsWith("text:");
  const textPromptValue = isTextPrompt ? userData.selectedBackground?.substring(5) : null;
  const selectedBg = !isTextPrompt ? backgrounds.find((b) => b.id === userData.selectedBackground) : null;
  const customBackground = userData.selectedBackground?.startsWith("data:") ? userData.selectedBackground : null;

  // Fetch user and today's images
  useEffect(() => {
    const fetchUserAndImages = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);

      // Fetch user name
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

      if (profile?.full_name) {
        const nameParts = profile.full_name.trim().split(" ");
        setUserName(nameParts[nameParts.length - 1]);
      }

      // Fetch today's generated images
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: images } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString())
        .order("created_at", { ascending: false });

      const typedImages = (images || []) as GeneratedImage[];
      setTodayImages(typedImages);
      setIsLoadingHistory(false);

      // If there are images today, show the latest one
      if (typedImages.length > 0) {
        setGeneratedPreview(typedImages[0].image_url);
      }
    };

    fetchUserAndImages();
  }, [navigate]);

  // Auto generate first image if no images today
  useEffect(() => {
    if (!isLoadingHistory && todayImages.length === 0 && userData.idolImage && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateImage();
    }
  }, [isLoadingHistory, todayImages.length, userData.idolImage]);

  const remainingGenerations = Math.max(0, maxDailyGenerations - todayImages.length);

  const saveGeneratedImage = async (imageUrl: string) => {
    if (!userId) return;

    const backgroundPrompt = textPromptValue || selectedBg?.prompt || "cozy modern study room with warm lighting";

    const { data, error } = await supabase
      .from("generated_images")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        background_prompt: backgroundPrompt,
      })
      .select()
      .single();

    if (!error && data) {
      const typedData = data as GeneratedImage;
      setTodayImages((prev) => [typedData, ...prev]);
    }
  };

  const generateImage = async () => {
    if (!userData.idolImage) {
      navigate("/upload-idol");
      return;
    }

    if (remainingGenerations <= 0 && todayImages.length > 0) {
      // No generations left, just select the first image
      setGeneratedPreview(todayImages[0].image_url);
      return;
    }

    setIsGenerating(true);

    try {
      const backgroundPrompt = textPromptValue || selectedBg?.prompt || "cozy modern study room with warm lighting";

      const { data, error } = await supabase.functions.invoke("generate-study-image", {
        body: {
          idolImageBase64: userData.idolImage,
          userImageBase64: userData.userImage !== "anonymous" ? userData.userImage : null,
          backgroundPrompt,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Không thể tạo ảnh");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.imageUrl) {
        setGeneratedPreview(data.imageUrl);
        await saveGeneratedImage(data.imageUrl);
      } else {
        // Fallback: use idol image as preview if AI fails
        setGeneratedPreview(userData.idolImage);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      // Fallback to idol image
      setGeneratedPreview(userData.idolImage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (remainingGenerations > 0) {
      generateImage();
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setGeneratedPreview(imageUrl);
  };

  const handleContinue = () => {
    if (!generatedPreview) {
      return;
    }
    setGeneratedImage(generatedPreview);
    navigate("/choose-music");
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button
          onClick={() => navigate("/choose-background")}
          className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 page-transition overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={3} totalSteps={6} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Ảnh học tập</h1>
            <p className="text-muted-foreground text-sm">
              {selectedBg
                ? `Background: ${selectedBg.nameVi}`
                : isTextPrompt
                  ? "Background từ mô tả"
                  : customBackground
                    ? "Background tùy chỉnh"
                    : "Đang tạo ảnh..."}
            </p>
          </div>

          {/* Generated Image Preview */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-accent-gray border border-border shadow-card">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent-blue/40 to-accent-pink/40">
                <div className="p-5 bg-gradient-to-br from-accent-blue to-accent-pink rounded-2xl mb-4 animate-pulse shadow-soft">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-foreground font-semibold">Đang tạo ảnh với AI...</p>
                <p className="text-xs text-muted-foreground mt-1">Có thể mất 10-30 giây</p>
                <div className="mt-4 flex gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            ) : generatedPreview ? (
              <img
                src={generatedPreview}
                alt="Generated study image"
                className="w-full h-full object-cover animate-scale-in"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Button onClick={generateImage} className="shadow-soft" disabled={remainingGenerations <= 0}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo ảnh
                </Button>
              </div>
            )}
          </div>

          {/* Regenerate Button */}
          {!isGenerating && generatedPreview && (
            <Button
              variant="secondary"
              className="w-full shadow-soft"
              onClick={handleRegenerate}
              disabled={remainingGenerations <= 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {remainingGenerations > 0
                ? `Tạo lại ảnh khác (còn ${remainingGenerations} lần hôm nay)`
                : "Đã hết lượt tạo hôm nay"}
            </Button>
          )}

          {/* Today's Generated Images Gallery */}
          {todayImages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                📸 Ảnh đã tạo hôm nay ({todayImages.length}/{maxDailyGenerations} lượt)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {todayImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImage(img.image_url)}
                    className={cn(
                      "aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-[1.02]",
                      generatedPreview === img.image_url
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <img src={img.image_url} alt="Generated" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Out of generations message */}
          {remainingGenerations === 0 && todayImages.length > 0 && (
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
              <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Đã hết lượt tạo ảnh hôm nay. Lượt mới sẽ reset vào <strong>00:00</strong> ngày mai.
                  <br />
                  Bạn có thể chọn một trong các ảnh đã tạo ở trên.
                </span>
              </p>
            </div>
          )}

          {/* Info Card */}
          <div className="p-4 bg-gradient-to-r from-accent-blue/40 to-accent-pink/30 rounded-2xl border border-primary/20">
            <p className="text-sm text-foreground leading-relaxed">
              💡 <strong>Mẹo:</strong> Ảnh được tạo bằng AI. Mỗi ngày {userName} có thể tạo tối đa 2 ảnh (reset lúc
              00:00).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-sm flex justify-center">
        <Button
          size="lg"
          className="w-full md:max-w-md mx-auto shadow-soft"
          onClick={handleContinue}
          disabled={isGenerating || !generatedPreview}
        >
          Chọn nhạc
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>
    </div>
  );
}

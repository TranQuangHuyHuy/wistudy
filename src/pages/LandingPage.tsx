import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { BookOpen, Sparkles, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle OAuth callback - check for tokens in URL hash
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // OAuth callback detected, wait for session to be established
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          navigate('/upload-idol', { replace: true });
          return;
        }
      }

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          navigate('/upload-idol', { replace: true });
        }
      });

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/upload-idol', { replace: true });
        return;
      }

      setIsLoading(false);
      return () => subscription.unsubscribe();
    };

    handleAuthCallback();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md space-y-10 page-transition text-center">
          {/* Hero */}
          <div className="space-y-5">
            <div className="inline-flex p-5 bg-gradient-to-br from-accent-blue to-accent-pink rounded-3xl mb-4 group cursor-default shadow-soft">
              <BookOpen className="w-16 h-16 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Chào mừng đến WiStudy
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
              Tạo không gian học tập cá nhân với AI. Tập trung hơn, hiệu quả hơn.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group p-5 bg-card rounded-2xl shadow-soft text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated cursor-default border border-border/50">
              <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-125" />
              </div>
              <p className="text-sm font-semibold mb-1">AI tạo ảnh</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Không gian học tập cá nhân hóa</p>
            </div>
            <div className="group p-5 bg-card rounded-2xl shadow-soft text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated cursor-default border border-border/50">
              <div className="w-10 h-10 bg-accent-pink rounded-xl flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-125" />
              </div>
              <p className="text-sm font-semibold mb-1">Pomodoro</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Quản lý thời gian hiệu quả</p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Button asChild size="lg" className="w-full">
              <Link to="/login">
                Bắt đầu ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { BookOpen, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    handleAuthCallback();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6 page-transition">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-5 bg-gradient-to-br from-accent-blue to-accent-pink rounded-3xl mb-2 group cursor-default shadow-soft">
              <BookOpen className="w-14 h-14 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Chào mừng đến WiStudy
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tạo không gian học tập cá nhân với AI. Tập trung hơn, hiệu quả hơn.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group p-4 bg-card rounded-2xl shadow-soft text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated cursor-default border border-border/50">
              <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">AI tạo ảnh</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Không gian học tập cá nhân hóa</p>
            </div>
            <div className="group p-4 bg-card rounded-2xl shadow-soft text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated cursor-default border border-border/50">
              <div className="w-10 h-10 bg-accent-pink rounded-xl flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Pomodoro</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Quản lý thời gian hiệu quả</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-sm flex justify-center">
        <Button asChild size="lg" className="w-full md:max-w-md mx-auto shadow-soft">
          <Link to={isLoggedIn ? "/upload-idol" : "/login"}>
            {isLoggedIn ? "Tiếp tục học" : "Bắt đầu ngay"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </footer>
    </div>
  );
}

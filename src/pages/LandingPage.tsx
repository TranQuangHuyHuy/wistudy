import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { BookOpen, Sparkles, Clock, ArrowRight, Settings, Check, X, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionTier = 'free' | 'pro';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier | null>(null);

  const fetchTier = async (userId: string) => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle();
    if (data?.tier) {
      setTier(data.tier as SubscriptionTier);
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const { data } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          window.history.replaceState(null, '', window.location.pathname);
          
          if (data?.session?.user) {
            setIsLoggedIn(true);
            fetchTier(data.session.user.id);
            return;
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        fetchTier(session.user.id);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        setTimeout(() => fetchTier(session.user.id), 0);
      } else {
        setTier(null);
      }
    });

    handleAuthCallback();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-accent-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          {isLoggedIn && tier && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-300 hover:scale-105 ${
              tier === 'pro' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-lg shadow-amber-500/25' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {tier === 'pro' ? 'PRO ✨' : 'FREE'}
            </span>
          )}
          {isLoggedIn ? (
            <Link to="/settings" className="p-2.5 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pb-6 page-transition overflow-y-auto relative z-10">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center space-y-5 animate-slide-up">
            <div className="inline-flex p-6 bg-gradient-to-br from-accent-blue via-accent-pink/50 to-accent-blue rounded-3xl mb-2 group cursor-default shadow-xl shadow-primary/20 animate-float">
              <BookOpen className="w-16 h-16 text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Chào mừng đến <span className="gradient-text">WiStudy</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              Tạo không gian học tập cá nhân với AI. Tập trung hơn, hiệu quả hơn.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group p-5 bg-card rounded-2xl shadow-soft text-left card-hover-lift cursor-default border border-border/50 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-primary/20 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">AI tạo ảnh</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Không gian học tập cá nhân hóa</p>
            </div>
            <div className="group p-5 bg-card rounded-2xl shadow-soft text-left card-hover-lift cursor-default border border-border/50 opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-pink to-primary/20 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">Pomodoro</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Quản lý thời gian hiệu quả</p>
            </div>
          </div>

          {/* So sánh FREE vs PRO - hiển thị khi đã đăng nhập */}
          {isLoggedIn && (
            <div className="space-y-4 opacity-0 animate-slide-up stagger-3" style={{ animationFillMode: 'forwards' }}>
              {/* Bảng so sánh */}
              <div className="bg-card rounded-3xl shadow-card border border-border/50 p-6 glass-card">
                <h2 className="text-lg font-bold text-center mb-5 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>So sánh gói dịch vụ</span>
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* FREE Column */}
                  <div className="bg-emerald-500/5 rounded-2xl p-4 border-2 border-emerald-500/20 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md">
                    <div className="text-center mb-4">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">FREE 🆓</span>
                      <p className="text-xs text-muted-foreground mt-1">Miễn phí mãi mãi</p>
                    </div>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Chọn ảnh nền từ thư viện</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Pomodoro thông minh</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Nhạc Lo-fi, Piano, Ambient</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>AI tạo ảnh độc quyền</span>
                      </li>
                    </ul>
                  </div>

                  {/* PRO Column */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl p-4 border-2 border-amber-500/30 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10">
                    <div className="text-center mb-4">
                      <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">PRO ✨</span>
                      <p className="text-xs text-muted-foreground mt-1">Trải nghiệm cao cấp</p>
                    </div>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Tất cả tính năng FREE</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Upload ảnh cá nhân</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>AI tạo ảnh độc quyền</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Background đa dạng</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Thông tin liên lạc Zalo */}
              <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-5 text-center glass-card">
                <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Cần hỗ trợ?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Hỏi đáp • Báo lỗi • Nâng cấp PRO
                </p>
                <a 
                  href="https://zalo.me/0777542766" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4" />
                  Chat Zalo: 0777 542 766
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-xl flex justify-center relative z-10">
        <Button asChild size="lg" className="w-full md:max-w-md mx-auto">
          <Link to={isLoggedIn ? (tier === 'free' ? "/free-background" : "/upload-idol") : "/login"}>
            {isLoggedIn ? "Tiếp tục học" : "Bắt đầu ngay"}
            <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </footer>
    </div>
  );
}

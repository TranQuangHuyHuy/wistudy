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
      
      // Handle OAuth callback tokens
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
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          {isLoggedIn && tier && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              tier === 'pro' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {tier === 'pro' ? 'PRO ✨' : 'FREE'}
            </span>
          )}
          {isLoggedIn ? (
            <Link to="/settings" className="p-2.5 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-105">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pb-6 page-transition overflow-y-auto">
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

          {/* So sánh FREE vs PRO - hiển thị khi đã đăng nhập */}
          {isLoggedIn && (
            <div className="space-y-4">
              {/* Bảng so sánh */}
              <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-5">
                <h2 className="text-lg font-bold text-center mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  So sánh gói dịch vụ
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* FREE Column */}
                  <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                    <div className="text-center mb-3">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">FREE 🆓</span>
                      <p className="text-xs text-muted-foreground">Miễn phí mãi mãi</p>
                    </div>
                    <ul className="space-y-2 text-xs">
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
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-4 border border-amber-500/30">
                    <div className="text-center mb-3">
                      <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">PRO ✨</span>
                      <p className="text-xs text-muted-foreground">Trải nghiệm cao cấp</p>
                    </div>
                    <ul className="space-y-2 text-xs">
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
              <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-5 text-center">
                <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Cần hỗ trợ?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Hỏi đáp • Báo lỗi • Nâng cấp PRO
                </p>
                <a 
                  href="https://zalo.me/0777542766" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-soft"
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
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-sm flex justify-center">
        <Button asChild size="lg" className="w-full md:max-w-md mx-auto shadow-soft">
          <Link to={isLoggedIn ? (tier === 'free' ? "/free-background" : "/upload-idol") : "/login"}>
            {isLoggedIn ? "Tiếp tục học" : "Bắt đầu ngay"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </footer>
    </div>
  );
}
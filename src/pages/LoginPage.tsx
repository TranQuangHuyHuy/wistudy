import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Check for OAuth error in URL (from failed Google login)
      const errorCode = searchParams.get('error') || 
                        (hash ? new URLSearchParams(hash.substring(1)).get('error') : null);
      const errorDescription = searchParams.get('error_description') ||
                              (hash ? new URLSearchParams(hash.substring(1)).get('error_description') : null);
      
      if (errorCode) {
        // Clear error from URL
        window.history.replaceState(null, '', window.location.pathname);
        
        // Show error message to user
        if (errorCode === 'server_error' || errorCode === 'access_denied') {
          toast.error('Đăng nhập Google thất bại. Vui lòng thử lại sau.');
        } else {
          toast.error(`Lỗi đăng nhập: ${errorDescription || errorCode}`);
        }
        
        if (isMounted) {
          setIsCheckingAuth(false);
          setIsGoogleLoading(false);
        }
        return; // Stay on login page
      }
      
      // Handle successful OAuth callback with tokens in hash
      if (hash && hash.includes('access_token')) {
        try {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (data?.session && isMounted) {
              window.history.replaceState(null, '', window.location.pathname);
              window.location.href = '/';
              return;
            }
          }
        } catch (err) {
          console.error('[LoginPage] Error parsing OAuth tokens:', err);
        }
      }

      if (isMounted) {
        setIsCheckingAuth(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        window.location.href = '/';
      }
    });

    handleAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        if (error.message.includes('Invalid login')) {
          toast.error('Email hoặc mật khẩu không đúng');
        } else {
          toast.error('Đăng nhập thất bại: ' + error.message);
        }
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) {
        toast.error('Đăng nhập Google thất bại: ' + error.message);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent-pink/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <button onClick={() => navigate('/')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6 page-transition relative z-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Hero */}
          <div className="text-center space-y-4 animate-slide-up">
            <div className="inline-flex p-5 bg-gradient-to-br from-accent-blue via-accent-pink/50 to-accent-blue rounded-3xl mb-2 group cursor-default shadow-xl shadow-primary/20 animate-float">
              <BookOpen className="w-12 h-12 text-primary transition-all duration-500 group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Đăng nhập
            </h1>
            <p className="text-muted-foreground text-sm">
              Đăng nhập để tiếp tục sử dụng WiStudy
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-5 bg-card p-7 rounded-3xl shadow-card border border-border/50 glass-card animate-scale-in">
            {/* Google Login Button */}
            <Button
              type="button"
              variant="google"
              className="w-full flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Đăng nhập với Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">hoặc</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </div>

          <p className="text-sm text-center text-muted-foreground animate-fade-in">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline transition-all">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

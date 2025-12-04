import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Họ tên tối thiểu 2 ký tự" }).max(100),
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/upload-idol');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/upload-idol');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/upload-idol`
        }
      });
      if (error) {
        toast.error('Đăng nhập Google thất bại: ' + error.message);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = registerSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Email này đã được đăng ký. Vui lòng đăng nhập.');
        } else if (error.message.includes('Email not confirmed')) {
          navigate('/email-confirmation', { state: { email } });
        } else {
          toast.error('Đăng ký thất bại: ' + error.message);
        }
      } else {
        navigate('/email-confirmation', { state: { email } });
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-[360px] space-y-6">
          {/* Title Section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Đăng ký tài khoản
            </h1>
            <p className="text-muted-foreground text-sm">
              Tạo tài khoản để bắt đầu sử dụng WiStudy
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/30">
            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-full border-2 border-border/50 bg-background hover:bg-secondary/50 font-medium"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Đăng ký với Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-border/50"></div>
              <span className="px-4 text-xs text-muted-foreground font-medium tracking-wider">HOẶC</span>
              <div className="flex-1 h-px bg-border/50"></div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/30 border-0 focus:bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/30 border-0 focus:bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/30 border-0 focus:bg-background"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/30 border-0 focus:bg-background"
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-full text-base font-medium mt-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Đăng ký
              </Button>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-sm text-center text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

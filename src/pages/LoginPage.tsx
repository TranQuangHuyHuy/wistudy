import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        window.location.href = '/upload-idol';
        return;
      }

      if (isMounted) {
        setIsCheckingAuth(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        window.location.href = '/upload-idol';
      }
    });

    checkAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-8 page-transition">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-accent-blue to-accent-pink rounded-2xl mb-2 group cursor-default shadow-soft">
              <BookOpen className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Đăng nhập
            </h1>
            <p className="text-muted-foreground text-sm">
              Đăng nhập để tiếp tục sử dụng WiStudy
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-4 bg-card p-6 rounded-2xl shadow-soft border border-border/50">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

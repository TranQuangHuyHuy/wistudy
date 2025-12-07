import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Họ tên tối thiểu 2 ký tự" }).max(100),
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string()
    .min(8, { message: "Mật khẩu tối thiểu 8 ký tự" })
    .regex(/[A-Z]/, { message: "Mật khẩu phải có ít nhất 1 chữ hoa" })
    .regex(/[a-z]/, { message: "Mật khẩu phải có ít nhất 1 chữ thường" })
    .regex(/[0-9]/, { message: "Mật khẩu phải có ít nhất 1 số" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = registerSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`,
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          toast.error('Email này đã được đăng ký. Vui lòng đăng nhập.');
        } else if (error.message.includes('Email not confirmed')) {
          navigate('/email-confirmation', { state: { email } });
        } else {
          toast.error('Đăng ký thất bại: ' + error.message);
        }
        return;
      }
      
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        toast.error('Email này đã được đăng ký. Vui lòng đăng nhập.');
        return;
      }
      
      navigate('/email-confirmation', { state: { email } });
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent-pink/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <header className="p-6 flex items-center justify-between relative z-10">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        <div className="w-full max-w-sm space-y-8 page-transition">
          {/* Hero */}
          <div className="text-center space-y-4 animate-slide-up">
            <div className="inline-flex p-5 bg-gradient-to-br from-accent-pink via-accent-blue/50 to-accent-pink rounded-3xl mb-2 group cursor-default shadow-xl shadow-primary/20 animate-float">
              <UserPlus className="w-12 h-12 text-primary transition-all duration-500 group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Đăng ký tài khoản
            </h1>
            <p className="text-muted-foreground text-sm">
              Tạo tài khoản để bắt đầu sử dụng WiStudy
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4 bg-card p-7 rounded-3xl shadow-card border border-border/50 glass-card animate-scale-in">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
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
                placeholder="Tối thiểu 8 ký tự, chữ hoa, thường, số"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              Đăng ký
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground animate-fade-in">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline transition-all">
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

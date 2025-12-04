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
      
      // Check if user already exists (Supabase returns user with empty identities for existing email)
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        toast.error('Email này đã được đăng ký. Vui lòng đăng nhập.');
        return;
      }
      
      // Success - redirect to email confirmation page
      navigate('/email-confirmation', { state: { email } });
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/20 via-background to-background flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-8 page-transition">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-accent-pink to-accent-blue rounded-2xl mb-2 group cursor-default shadow-soft">
              <UserPlus className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Đăng ký tài khoản
            </h1>
            <p className="text-muted-foreground text-sm">
              Tạo tài khoản để bắt đầu sử dụng WiStudy
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4 bg-card p-6 rounded-2xl shadow-soft border border-border/50">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tối thiểu 8 ký tự, chữ hoa, thường, số"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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
                required
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Đăng ký
            </Button>
          </form>

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

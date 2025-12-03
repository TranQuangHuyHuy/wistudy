import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/wistudy/Logo';
import { UserPlus, Loader2 } from 'lucide-react';
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
        } else {
          toast.error('Đăng ký thất bại: ' + error.message);
        }
      } else {
        // Sign out to prevent auto-login, then redirect to login page
        await supabase.auth.signOut();
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <Logo size="sm" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-8 page-transition">
          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-accent-blue rounded-2xl mb-2 group cursor-default">
              <UserPlus className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Đăng ký tài khoản
            </h1>
            <p className="text-muted-foreground text-sm">
              Tạo tài khoản để bắt đầu sử dụng WiStudy
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/wistudy/Logo';
import { BookOpen, Sparkles, Clock, Loader2, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
});

const phoneSchema = z.object({
  phone: z.string().regex(/^(\+84|0)[0-9]{9,10}$/, { message: "Số điện thoại không hợp lệ" })
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

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
    setIsLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/upload-idol`
        }
      });
      if (error) {
        toast.error('Đăng nhập thất bại: ' + error.message);
        setIsLoading(null);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi đăng nhập');
      setIsLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading('email');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/upload-idol`
          }
        });
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Email này đã được đăng ký');
          } else {
            toast.error('Đăng ký thất bại: ' + error.message);
          }
        } else {
          toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        }
      } else {
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
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(null);
    }
  };

  const handleSendOtp = async () => {
    const validation = phoneSchema.safeParse({ phone });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading('phone');
    try {
      // Format phone to international format
      const formattedPhone = phone.startsWith('0') ? `+84${phone.slice(1)}` : phone;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });
      if (error) {
        toast.error('Gửi OTP thất bại: ' + error.message);
      } else {
        setOtpSent(true);
        toast.success('Đã gửi mã OTP đến số điện thoại của bạn');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Mã OTP phải có 6 số');
      return;
    }

    setIsLoading('otp');
    try {
      const formattedPhone = phone.startsWith('0') ? `+84${phone.slice(1)}` : phone;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      if (error) {
        toast.error('Mã OTP không đúng');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <Logo size="sm" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-accent-blue rounded-2xl mb-2">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Góc Học Tập
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tạo không gian học tập cá nhân với AI
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card rounded-xl shadow-soft">
              <Sparkles className="w-4 h-4 text-primary mb-1" />
              <p className="text-xs font-medium">AI tạo ảnh</p>
            </div>
            <div className="p-3 bg-card rounded-xl shadow-soft">
              <Clock className="w-4 h-4 text-primary mb-1" />
              <p className="text-xs font-medium">Pomodoro</p>
            </div>
          </div>

          {/* Auth Methods */}
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="text-xs">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="text-xs">
                <Phone className="w-3 h-3 mr-1" />
                SĐT
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs">
                Google
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs">Mật khẩu</Label>
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
                  disabled={isLoading !== null}
                >
                  {isLoading === 'email' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground">
                {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              </p>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 mt-4">
              {!otpSent ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={isLoading !== null}
                  >
                    {isLoading === 'phone' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Gửi mã OTP
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="otp" className="text-xs">Nhập mã OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading !== null}
                  >
                    {isLoading === 'otp' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Xác nhận
                  </Button>
                  <button
                    type="button"
                    className="w-full text-xs text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                  >
                    Thay đổi số điện thoại
                  </button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="social" className="space-y-3 mt-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading !== null}
              >
                {isLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Đăng nhập bằng Google
              </Button>
            </TabsContent>
          </Tabs>
          
          <p className="text-xs text-center text-muted-foreground">
            Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng
          </p>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EmailConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if user just verified their email (redirected from magic link)
    const checkVerification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    // Listen for auth state changes (when user clicks magic link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setIsVerified(true);
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    });

    checkVerification();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Không tìm thấy email. Vui lòng đăng ký lại.');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        toast.error('Gửi lại email thất bại');
      } else {
        toast.success('Đã gửi lại email xác nhận');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent-pink/20 via-background to-background flex flex-col">
        <header className="p-6 flex items-center justify-between">
          <Logo size="sm" />
          <ThemeToggle />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm space-y-8 page-transition text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-2 shadow-soft">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Xác nhận thành công!
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tài khoản của bạn đã được xác nhận. Đang chuyển đến trang đăng nhập...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/20 via-background to-background flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-8 page-transition text-center">
          {/* Icon */}
          <div className="inline-flex p-4 bg-gradient-to-br from-accent-pink to-accent-blue rounded-2xl mb-2 shadow-soft">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Kiểm tra email của bạn
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Chúng tôi đã gửi link xác nhận đến{' '}
              <span className="font-medium text-foreground">{email || 'email của bạn'}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-card p-6 rounded-xl border border-border/50 space-y-4 text-left">
            <p className="text-sm text-foreground font-medium">Các bước tiếp theo:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Mở email và tìm thư từ WiStudy</li>
              <li>Click nút <strong>"Xác minh Email"</strong> trong email</li>
              <li>Sau khi xác nhận, quay lại đây để đăng nhập</li>
            </ol>
          </div>

          {/* Resend */}
          <div className="bg-card p-4 rounded-xl border border-border/50 space-y-3">
            <p className="text-sm text-muted-foreground">
              Không nhận được email? Kiểm tra thư mục spam hoặc
            </p>
            <Button
              onClick={handleResend}
              variant="outline"
              disabled={isResending}
              className="w-full"
            >
              {isResending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gửi lại email xác nhận
            </Button>
          </div>

          {/* Back to login */}
          <Link to="/login">
            <Button variant="ghost" className="w-full mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

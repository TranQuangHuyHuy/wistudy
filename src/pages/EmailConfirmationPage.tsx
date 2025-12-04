import React, { useState } from 'react';
import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EmailConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã xác nhận');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await supabase.functions.invoke('verify-otp', {
        body: { email, code: otp }
      });

      if (response.error || !response.data?.valid) {
        toast.error('Mã xác nhận không đúng hoặc đã hết hạn');
      } else {
        setIsVerified(true);
        // Sign out after verification to require login
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Không tìm thấy email. Vui lòng đăng ký lại.');
      return;
    }

    setIsResending(true);
    try {
      const response = await supabase.functions.invoke('send-otp', {
        body: { email }
      });

      if (response.error) {
        toast.error('Gửi lại mã thất bại');
      } else {
        toast.success('Đã gửi lại mã xác nhận');
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
              Xác nhận email của bạn
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Chúng tôi đã gửi mã xác nhận 6 số đến{' '}
              <span className="font-medium text-foreground">{email || 'email của bạn'}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="bg-card p-6 rounded-xl border border-border/50 space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận
            </Button>

            <div className="text-sm text-muted-foreground">
              Không nhận được mã?{' '}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-primary font-medium hover:underline disabled:opacity-50"
              >
                {isResending ? 'Đang gửi...' : 'Gửi lại'}
              </button>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-card p-4 rounded-xl border border-border/50 text-left space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Lưu ý:</span> Email có thể mất vài phút để đến. 
              Hãy kiểm tra cả thư mục spam nếu bạn không thấy email.
            </p>
          </div>

          {/* Back to login */}
          <Link to="/login">
            <Button variant="outline" className="w-full mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

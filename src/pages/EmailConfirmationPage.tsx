import { Logo } from '@/components/wistudy/Logo';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function EmailConfirmationPage() {
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
              Chúng tôi đã gửi email xác nhận đến địa chỉ email bạn đã đăng ký. 
              Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác nhận.
            </p>
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

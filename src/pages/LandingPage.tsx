import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { BookOpen, Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <Logo size="sm" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md space-y-10 page-transition text-center">
          {/* Hero */}
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-accent-blue rounded-3xl mb-4 group cursor-default">
              <BookOpen className="w-14 h-14 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Chào mừng đến WiStudy
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Tạo không gian học tập cá nhân với AI. Tập trung hơn, hiệu quả hơn.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group p-4 bg-card rounded-2xl shadow-soft text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated cursor-default">
              <Sparkles className="w-6 h-6 text-primary mb-2 transition-transform duration-300 group-hover:scale-125" />
              <p className="text-sm font-medium">AI tạo ảnh</p>
              <p className="text-xs text-muted-foreground">Không gian học tập cá nhân hóa</p>
            </div>
            <div className="group p-4 bg-card rounded-2xl shadow-soft text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated cursor-default">
              <Clock className="w-6 h-6 text-primary mb-2 transition-transform duration-300 group-hover:scale-125" />
              <p className="text-sm font-medium">Pomodoro</p>
              <p className="text-xs text-muted-foreground">Quản lý thời gian hiệu quả</p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Button asChild size="lg" className="w-full">
              <Link to="/login">
                Bắt đầu ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

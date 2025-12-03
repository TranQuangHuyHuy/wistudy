import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/wistudy/Logo';
import { ArrowLeft, User, Mail, Calendar, LogOut, Loader2, Save, Moon, Sun, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || '',
              email: user.email
            })
            .select()
            .single();

          if (!insertError && newProfile) {
            setProfile(newProfile);
            setFullName(newProfile.full_name || '');
          }
        } else {
          console.error('Error fetching profile:', error);
        }
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) {
        toast.error('Lưu thất bại: ' + error.message);
      } else {
        toast.success('Đã lưu thông tin');
        setProfile({ ...profile, full_name: fullName });
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success('Đã đăng xuất');
      navigate('/');
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex flex-col">
      <header className="p-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:scale-105 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Logo size="sm" />
      </header>

      <main className="flex-1 px-6 pb-12 page-transition">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài đặt</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="p-5 bg-card rounded-2xl shadow-soft border border-border/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold">Thông tin cá nhân</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.email || 'Chưa có'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ngày tham gia</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile?.created_at ? formatDate(profile.created_at) : 'Không xác định'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving || fullName === profile?.full_name}
                  className="w-full shadow-soft"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="p-5 bg-card rounded-2xl shadow-soft border border-border/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-pink rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold">Giao diện</h2>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10 shadow-soft' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Sáng</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10 shadow-soft' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Tối</span>
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="p-5 bg-card rounded-2xl shadow-soft border border-border/50">
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

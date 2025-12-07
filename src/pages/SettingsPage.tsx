import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/wistudy/Logo';
import { ArrowLeft, User, Mail, Calendar, LogOut, Loader2, Save, Moon, Sun, Palette, Shield, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useThemeSync } from '@/hooks/useThemeSync';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

type SubscriptionTier = 'free' | 'pro';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeSync();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    fetchProfile();
    checkAdminRole();
    fetchTier();
  }, []);

  const fetchTier = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.tier) {
          setTier(data.tier as SubscriptionTier);
        }
      }
    } catch (error) {
      console.error('Error fetching tier:', error);
    }
  };

  const checkAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc('has_role', { 
          _user_id: user.id, 
          _role: 'admin' 
        });
        setIsAdmin(data === true);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-10 w-48 h-48 bg-accent-pink/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <header className="p-6 flex items-center gap-4 relative z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:scale-110 transition-all duration-300">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Logo size="sm" />
      </header>

      <main className="flex-1 px-6 pb-12 page-transition relative z-10">
        <div className="w-full max-w-md mx-auto space-y-5">
          <div className="animate-slide-up">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài đặt</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="p-6 bg-card rounded-3xl shadow-card border border-border/50 space-y-5 glass-card animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-primary/30 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-bold text-lg">Thông tin cá nhân</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Email</Label>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{profile?.email || 'Chưa có'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ngày tham gia</Label>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">
                      {profile?.created_at ? formatDate(profile.created_at) : 'Không xác định'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving || fullName === profile?.full_name}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="p-6 bg-card rounded-3xl shadow-card border border-border/50 space-y-5 glass-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-pink to-primary/30 rounded-2xl flex items-center justify-center shadow-lg">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-bold text-lg">Giao diện</h2>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                      : 'border-border hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    theme === 'light' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary'
                  }`}>
                    <Sun className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">Sáng</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                      : 'border-border hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    theme === 'dark' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary'
                  }`}>
                    <Moon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">Tối</span>
                </button>
              </div>
            </div>

            {/* Subscription Tier */}
            <div className="p-6 bg-card rounded-3xl shadow-card border border-border/50 space-y-5 glass-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  tier === 'pro' 
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                    : 'bg-emerald-500/20'
                }`}>
                  <Crown className={`w-6 h-6 ${tier === 'pro' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                </div>
                <h2 className="font-bold text-lg">Gói đăng ký</h2>
              </div>
              
              <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                tier === 'pro'
                  ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/30'
                  : 'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-xl font-bold ${
                      tier === 'pro' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {tier === 'pro' ? 'PRO ✨' : 'FREE'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier === 'pro' ? 'Truy cập đầy đủ tính năng' : 'Gói miễn phí cơ bản'}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 ${
                    tier === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}>
                    {tier.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Section */}
            {isAdmin && (
              <div className="p-6 bg-card rounded-3xl shadow-card border border-border/50 space-y-5 glass-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="font-bold text-lg">Quản trị</h2>
                </div>
                <Link to="/admin">
                  <Button variant="outline" className="w-full">
                    <Shield className="w-5 h-5 mr-2" />
                    Trang quản trị Admin
                  </Button>
                </Link>
              </div>
            )}

            {/* Logout */}
            <div className="p-6 bg-card rounded-3xl shadow-card border border-border/50 glass-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5 mr-2" />
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

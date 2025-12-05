import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { ArrowLeft, Crown, User, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserSubscription {
  id: string;
  user_id: string;
  email: string | null;
  tier: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTierChange = async (userId: string, newTier: 'free' | 'pro') => {
    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ tier: newTier })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating tier:', error);
      } else {
        setUsers(prev => 
          prev.map(user => 
            user.user_id === userId ? { ...user, tier: newTier } : user
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full">
          <Crown className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Admin</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Subscription</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý tier subscription của người dùng
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="w-32">Tier</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang tải...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Chưa có người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{user.email || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {user.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.tier}
                        onValueChange={(value: 'free' | 'pro') => 
                          handleTierChange(user.user_id, value)
                        }
                        disabled={updatingUserId === user.user_id}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              FREE
                            </span>
                          </SelectItem>
                          <SelectItem value="pro">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                              PRO ✨
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Tổng cộng: {users.length} người dùng
        </p>
      </main>
    </div>
  );
}

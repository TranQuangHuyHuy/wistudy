import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';

export function useThemeSync() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load theme from DB on mount
  useEffect(() => {
    const loadThemeFromDB = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.theme_preference) {
            setTheme(profile.theme_preference);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeFromDB();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        // Load theme preference when user logs in
        setTimeout(() => {
          supabase
            .from('profiles')
            .select('theme_preference')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data?.theme_preference) {
                setTheme(data.theme_preference);
              }
            });
        }, 0);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setTheme]);

  // Save theme to DB when it changes
  const saveTheme = async (newTheme: string) => {
    setTheme(newTheme);
    
    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', userId);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  return { theme, setTheme: saveTheme, isLoading, isLoggedIn: !!userId };
}

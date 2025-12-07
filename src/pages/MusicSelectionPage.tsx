import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Youtube, Music2, Headphones, TreePine, Piano, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { musicPlaylists, MusicPlaylist } from '@/data/musicPlaylists';
import { supabase } from '@/integrations/supabase/client';

type MusicSource = 'preset' | 'youtube' | 'spotify';
type MusicCategory = 'lofi' | 'classical' | 'ambient';

export default function MusicSelectionPage() {
  const navigate = useNavigate();
  const { setSelectedMusic } = useWiStudy();
  const [musicSource, setMusicSource] = useState<MusicSource>('preset');
  const [selectedCategory, setSelectedCategory] = useState<MusicCategory>('lofi');
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [lastName, setLastName] = useState('bạn');
  const [tier, setTier] = useState<string>('free');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profileData?.full_name) {
          const nameParts = profileData.full_name.split(' ');
          setLastName(nameParts[nameParts.length - 1]);
        }
        
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .single();
        if (subData?.tier) {
          setTier(subData.tier);
        }
      }
    };
    fetchUserData();
  }, []);

  const filteredPlaylists = musicPlaylists.filter(p => p.category === selectedCategory);

  const handlePlaylistSelect = (playlist: MusicPlaylist) => {
    setSelectedPlaylist(prev => prev?.id === playlist.id ? null : playlist);
    setCustomUrl('');
  };

  const handleContinue = () => {
    if (musicSource === 'preset' && selectedPlaylist) {
      setSelectedMusic({
        type: 'preset',
        url: selectedPlaylist.embedUrl,
        name: selectedPlaylist.nameVi
      });
    } else if (musicSource === 'youtube' && customUrl) {
      const videoId = extractYouTubeId(customUrl);
      if (videoId) {
        setSelectedMusic({
          type: 'youtube',
          url: `https://www.youtube.com/embed/${videoId}`,
          name: 'YouTube'
        });
      }
    } else if (musicSource === 'spotify' && customUrl) {
      const embedUrl = convertSpotifyUrl(customUrl);
      if (embedUrl) {
        setSelectedMusic({
          type: 'spotify',
          url: embedUrl,
          name: 'Spotify'
        });
      }
    }
    navigate('/pomodoro-setup');
  };

  const handleSkip = () => {
    setSelectedMusic(null);
    navigate('/pomodoro-setup');
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const convertSpotifyUrl = (url: string): string | null => {
    if (url.includes('open.spotify.com')) {
      return url.replace('open.spotify.com', 'open.spotify.com/embed');
    }
    return null;
  };

  const canContinue = () => {
    if (musicSource === 'preset') return selectedPlaylist !== null;
    if (musicSource === 'youtube') return extractYouTubeId(customUrl) !== null;
    if (musicSource === 'spotify') return convertSpotifyUrl(customUrl) !== null;
    return false;
  };

  const categories = [
    { id: 'lofi' as MusicCategory, name: 'Lo-fi', icon: Headphones },
    { id: 'classical' as MusicCategory, name: 'Piano', icon: Piano },
    { id: 'ambient' as MusicCategory, name: 'Ambient', icon: TreePine },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-5 w-56 h-56 bg-accent-pink/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-5 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <button onClick={() => navigate(tier === 'free' ? '/free-background' : '/generate')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 page-transition relative z-10">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center animate-fade-in">
            <StepIndicator currentStep={tier === 'free' ? 2 : 4} totalSteps={tier === 'free' ? 4 : 6} />
          </div>
          
          {/* Title */}
          <div className="text-center space-y-2 animate-slide-up">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Chọn nhạc cho {lastName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Âm nhạc sẽ giúp bạn tập trung hơn khi học
            </p>
          </div>

          {/* Music Source Selection */}
          <div className="grid grid-cols-3 gap-3 animate-scale-in">
            <Button
              variant={musicSource === 'preset' ? 'default' : 'outline'}
              onClick={() => setMusicSource('preset')}
              className="flex flex-col h-auto py-4 gap-2"
            >
              <Radio className="h-6 w-6" />
              <span className="text-xs font-bold">Gợi ý</span>
            </Button>
            <Button
              variant={musicSource === 'youtube' ? 'default' : 'outline'}
              onClick={() => setMusicSource('youtube')}
              className="flex flex-col h-auto py-4 gap-2"
            >
              <Youtube className="h-6 w-6" />
              <span className="text-xs font-bold">YouTube</span>
            </Button>
            <Button
              variant={musicSource === 'spotify' ? 'default' : 'outline'}
              onClick={() => setMusicSource('spotify')}
              className="flex flex-col h-auto py-4 gap-2"
            >
              <Music2 className="h-6 w-6" />
              <span className="text-xs font-bold">Spotify</span>
            </Button>
          </div>

          {/* Preset Playlists */}
          {musicSource === 'preset' && (
            <div className="space-y-5">
              {/* Category Selection */}
              <div className="grid grid-cols-3 gap-3">
                {categories.map((cat, index) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedPlaylist(null);
                    }}
                    className="flex items-center justify-center gap-2 text-xs px-3 py-2.5 opacity-0 animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                  >
                    <cat.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate font-bold">{cat.name}</span>
                  </Button>
                ))}
              </div>

              {/* Playlist Grid */}
              <div className="grid grid-cols-1 gap-3">
                {filteredPlaylists.map((playlist, index) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistSelect(playlist)}
                    className={`
                      p-4 rounded-2xl border-2 transition-all duration-300 text-left
                      flex items-center gap-4 opacity-0 animate-slide-up
                      ${selectedPlaylist?.id === playlist.id 
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                        : 'border-border hover:border-primary/50 bg-card hover:shadow-lg'
                      }
                    `}
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                  >
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                      ${playlist.type === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}
                      ${selectedPlaylist?.id === playlist.id ? 'scale-110' : ''}
                    `}>
                      {playlist.type === 'youtube' ? <Youtube className="h-6 w-6" /> : <Music2 className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{playlist.nameVi}</p>
                      <p className="text-xs text-muted-foreground">{playlist.type === 'youtube' ? 'YouTube' : 'Spotify'}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Preview Player */}
              {selectedPlaylist && (
                <div className="space-y-3 animate-slide-up">
                  <p className="text-sm text-muted-foreground text-center font-medium">
                    🎵 Đang phát: {selectedPlaylist.nameVi}
                  </p>
                  <div className="rounded-2xl overflow-hidden border-2 border-border bg-card shadow-lg">
                    <iframe
                      key={selectedPlaylist.id}
                      src={
                        selectedPlaylist.type === 'youtube' 
                          ? `${selectedPlaylist.embedUrl}?autoplay=1&loop=1`
                          : `${selectedPlaylist.embedUrl}?utm_source=generator&autoplay=1`
                      }
                      width="100%"
                      height="152"
                      allow="autoplay; clipboard-write; encrypted-media"
                      loading="eager"
                      className="block"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* YouTube Custom URL */}
          {musicSource === 'youtube' && (
            <div className="space-y-4 animate-slide-up">
              <p className="text-sm text-muted-foreground">
                Dán link YouTube bạn muốn nghe khi học
              </p>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="bg-card h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {customUrl && !extractYouTubeId(customUrl) && (
                <p className="text-xs text-destructive font-medium">Link YouTube không hợp lệ</p>
              )}
            </div>
          )}

          {/* Spotify Custom URL */}
          {musicSource === 'spotify' && (
            <div className="space-y-4 animate-slide-up">
              <p className="text-sm text-muted-foreground">
                Dán link Spotify playlist hoặc track
              </p>
              <Input
                placeholder="https://open.spotify.com/..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="bg-card h-12 rounded-xl border-2 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {customUrl && !convertSpotifyUrl(customUrl) && (
                <p className="text-xs text-destructive font-medium">Link Spotify không hợp lệ</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-xl relative z-10">
        <div className="max-w-md mx-auto flex gap-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleSkip}
            className="flex-1"
          >
            Bỏ qua
          </Button>
          <Button 
            size="lg"
            onClick={handleContinue}
            disabled={!canContinue()}
            className="flex-1"
          >
            Pomodoro
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

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

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (data?.full_name) {
          const nameParts = data.full_name.split(' ');
          setLastName(nameParts[nameParts.length - 1]);
        }
      }
    };
    fetchUserName();
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
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/generate')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-105">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 page-transition">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={4} totalSteps={6} />
          </div>
          
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Chọn nhạc cho {lastName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Âm nhạc sẽ giúp bạn tập trung hơn khi học
            </p>
          </div>

          {/* Music Source Selection */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={musicSource === 'preset' ? 'default' : 'outline'}
              onClick={() => setMusicSource('preset')}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <Radio className="h-5 w-5" />
              <span className="text-xs">Gợi ý</span>
            </Button>
            <Button
              variant={musicSource === 'youtube' ? 'default' : 'outline'}
              onClick={() => setMusicSource('youtube')}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <Youtube className="h-5 w-5" />
              <span className="text-xs">YouTube</span>
            </Button>
            <Button
              variant={musicSource === 'spotify' ? 'default' : 'outline'}
              onClick={() => setMusicSource('spotify')}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <Music2 className="h-5 w-5" />
              <span className="text-xs">Spotify</span>
            </Button>
          </div>

          {/* Preset Playlists */}
          {musicSource === 'preset' && (
            <div className="space-y-4">
              {/* Category Selection */}
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedPlaylist(null);
                    }}
                    className="flex items-center justify-center gap-1 text-xs px-2"
                  >
                    <cat.icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </Button>
                ))}
              </div>

              {/* Playlist Grid */}
              <div className="grid grid-cols-1 gap-2">
                {filteredPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistSelect(playlist)}
                    className={`
                      p-3 rounded-xl border-2 transition-all duration-200 text-left
                      flex items-center gap-3
                      ${selectedPlaylist?.id === playlist.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 bg-card'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${playlist.type === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}
                    `}>
                      {playlist.type === 'youtube' ? <Youtube className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{playlist.nameVi}</p>
                      <p className="text-xs text-muted-foreground">{playlist.type === 'youtube' ? 'YouTube' : 'Spotify'}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Preview Player - Audio Only with Autoplay */}
              {selectedPlaylist && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    🎵 Đang phát: {selectedPlaylist.nameVi}
                  </p>
                  <div className="rounded-xl overflow-hidden border border-border bg-card">
                    <iframe
                      key={selectedPlaylist.id}
                      src={
                        selectedPlaylist.type === 'youtube' 
                          ? `${selectedPlaylist.embedUrl}?autoplay=1&loop=1`
                          : `${selectedPlaylist.embedUrl}?utm_source=generator&autoplay=1`
                      }
                      width="100%"
                      height={selectedPlaylist.type === 'youtube' ? '80' : '80'}
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
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Dán link YouTube bạn muốn nghe khi học
              </p>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="bg-card"
              />
              {customUrl && !extractYouTubeId(customUrl) && (
                <p className="text-xs text-destructive">Link YouTube không hợp lệ</p>
              )}
            </div>
          )}

          {/* Spotify Custom URL */}
          {musicSource === 'spotify' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Dán link Spotify playlist hoặc track
              </p>
              <Input
                placeholder="https://open.spotify.com/..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="bg-card"
              />
              {customUrl && !convertSpotifyUrl(customUrl) && (
                <p className="text-xs text-destructive">Link Spotify không hợp lệ</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex gap-3">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleSkip}
            className="flex-1 shadow-soft"
          >
            Bỏ qua
          </Button>
          <Button 
            size="lg"
            onClick={handleContinue}
            disabled={!canContinue()}
            className="flex-1 shadow-soft"
          >
            Pomodoro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

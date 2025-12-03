import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Youtube, Music2, Headphones, TreePine, Piano, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { ThemeToggle } from '@/components/wistudy/ThemeToggle';
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
    { id: 'lofi' as MusicCategory, name: 'Lo-fi / Chill', icon: Headphones },
    { id: 'classical' as MusicCategory, name: 'Classical / Piano', icon: Piano },
    { id: 'ambient' as MusicCategory, name: 'Ambient / Nature', icon: TreePine },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/generate')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Logo />
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-md space-y-6">
          <StepIndicator currentStep={4} totalSteps={6} />
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
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
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedPlaylist(null);
                    }}
                    className="flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <cat.icon className="h-4 w-4" />
                    {cat.name}
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
      <footer className="p-4 border-t border-border">
        <div className="max-w-md mx-auto flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="flex-1"
          >
            Bỏ qua
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!canContinue()}
            className="flex-1"
          >
            Tiếp tục
          </Button>
        </div>
      </footer>
    </div>
  );
}

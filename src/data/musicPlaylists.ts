export interface MusicPlaylist {
  id: string;
  name: string;
  nameVi: string;
  category: 'lofi' | 'classical' | 'ambient';
  type: 'youtube' | 'spotify';
  url: string;
  embedUrl: string;
}

export const musicPlaylists: MusicPlaylist[] = [
  // Lo-fi / Chill beats
  {
    id: 'lofi-girl-youtube',
    name: 'Lofi Girl',
    nameVi: 'Lofi Girl',
    category: 'lofi',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk'
  },
  {
    id: 'lofi-spotify',
    name: 'Lo-fi Beats',
    nameVi: 'Nhạc Lo-fi',
    category: 'lofi',
    type: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn'
  },
  {
    id: 'chill-beats-youtube',
    name: 'Chill Study Beats',
    nameVi: 'Nhạc Chill Học Bài',
    category: 'lofi',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
    embedUrl: 'https://www.youtube.com/embed/lTRiuFIWV54'
  },
  
  // Classical / Piano
  {
    id: 'classical-piano-youtube',
    name: 'Classical Piano',
    nameVi: 'Piano Cổ Điển',
    category: 'classical',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=mIYzp5rcTvU',
    embedUrl: 'https://www.youtube.com/embed/mIYzp5rcTvU'
  },
  {
    id: 'peaceful-piano-spotify',
    name: 'Peaceful Piano',
    nameVi: 'Piano Nhẹ Nhàng',
    category: 'classical',
    type: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO'
  },
  {
    id: 'focus-classical-youtube',
    name: 'Focus Classical',
    nameVi: 'Nhạc Cổ Điển Tập Trung',
    category: 'classical',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=WPni755-Krg',
    embedUrl: 'https://www.youtube.com/embed/WPni755-Krg'
  },
  
  // Ambient / Nature sounds
  {
    id: 'rain-sounds-youtube',
    name: 'Rain Sounds',
    nameVi: 'Tiếng Mưa',
    category: 'ambient',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
    embedUrl: 'https://www.youtube.com/embed/mPZkdNFkNps'
  },
  {
    id: 'nature-sounds-spotify',
    name: 'Nature Sounds',
    nameVi: 'Âm Thanh Thiên Nhiên',
    category: 'ambient',
    type: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8'
  },
  {
    id: 'ocean-waves-youtube',
    name: 'Ocean Waves',
    nameVi: 'Sóng Biển',
    category: 'ambient',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=WHPEKLQID4U',
    embedUrl: 'https://www.youtube.com/embed/WHPEKLQID4U'
  }
];

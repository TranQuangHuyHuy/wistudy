export interface UserData {
  idolImage: string | null;
  userImage: string | null;
  selectedBackground: string | null;
  generatedImage: string | null;
  pomodoroSettings: PomodoroSettings;
  selectedMusic: MusicSelection | null;
}

export interface PomodoroSettings {
  studyTime: number;
  breakTime: number;
  rounds: number;
}

export interface MusicSelection {
  type: 'youtube' | 'spotify' | 'preset';
  url: string;
  name: string;
}

export interface Background {
  id: string;
  name: string;
  nameVi: string;
  preview: string;
  prompt: string;
}

export type AppStep = 'login' | 'idol-upload' | 'background' | 'generate' | 'music' | 'pomodoro' | 'study-room';

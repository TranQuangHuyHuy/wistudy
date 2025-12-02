export interface UserData {
  idolImage: string | null;
  userImage: string | null;
  selectedBackground: string | null;
  generatedImage: string | null;
  pomodoroSettings: PomodoroSettings;
}

export interface PomodoroSettings {
  studyTime: number;
  breakTime: number;
  rounds: number;
}

export interface Background {
  id: string;
  name: string;
  nameVi: string;
  preview: string;
  prompt: string;
}

export type AppStep = 'login' | 'idol-upload' | 'background' | 'generate' | 'pomodoro' | 'study-room';

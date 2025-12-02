import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserData, AppStep, PomodoroSettings } from '@/types/wistudy';

interface WiStudyContextType {
  currentStep: AppStep;
  setCurrentStep: (step: AppStep) => void;
  userData: UserData;
  setIdolImage: (image: string | null) => void;
  setUserImage: (image: string | null) => void;
  setSelectedBackground: (background: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
  setPomodoroSettings: (settings: PomodoroSettings) => void;
  resetApp: () => void;
}

const defaultPomodoroSettings: PomodoroSettings = {
  studyTime: 25,
  breakTime: 5,
  rounds: 4
};

const defaultUserData: UserData = {
  idolImage: null,
  userImage: null,
  selectedBackground: null,
  generatedImage: null,
  pomodoroSettings: defaultPomodoroSettings
};

const WiStudyContext = createContext<WiStudyContextType | undefined>(undefined);

export function WiStudyProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  const setIdolImage = (image: string | null) => {
    setUserData(prev => ({ ...prev, idolImage: image }));
  };

  const setUserImage = (image: string | null) => {
    setUserData(prev => ({ ...prev, userImage: image }));
  };

  const setSelectedBackground = (background: string | null) => {
    setUserData(prev => ({ ...prev, selectedBackground: background }));
  };

  const setGeneratedImage = (image: string | null) => {
    setUserData(prev => ({ ...prev, generatedImage: image }));
  };

  const setPomodoroSettings = (settings: PomodoroSettings) => {
    setUserData(prev => ({ ...prev, pomodoroSettings: settings }));
  };

  const resetApp = () => {
    setCurrentStep('login');
    setUserData(defaultUserData);
  };

  return (
    <WiStudyContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        userData,
        setIdolImage,
        setUserImage,
        setSelectedBackground,
        setGeneratedImage,
        setPomodoroSettings,
        resetApp
      }}
    >
      {children}
    </WiStudyContext.Provider>
  );
}

export function useWiStudy() {
  const context = useContext(WiStudyContext);
  if (context === undefined) {
    throw new Error('useWiStudy must be used within a WiStudyProvider');
  }
  return context;
}

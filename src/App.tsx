import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WiStudyProvider } from "@/contexts/WiStudyContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UploadIdolPage from "./pages/UploadIdolPage";
import SettingsPage from "./pages/SettingsPage";
import ChooseBackgroundPage from "./pages/ChooseBackgroundPage";
import GeneratePage from "./pages/GeneratePage";
import MusicSelectionPage from "./pages/MusicSelectionPage";
import PomodoroSetupPage from "./pages/PomodoroSetupPage";
import StudyRoomPage from "./pages/StudyRoomPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WiStudyProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/upload-idol" element={<UploadIdolPage />} />
                  <Route path="/choose-background" element={<ChooseBackgroundPage />} />
                  <Route path="/generate" element={<GeneratePage />} />
                  <Route path="/choose-music" element={<MusicSelectionPage />} />
                  <Route path="/pomodoro-setup" element={<PomodoroSetupPage />} />
                  <Route path="/study-room" element={<StudyRoomPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WiStudyProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default App;

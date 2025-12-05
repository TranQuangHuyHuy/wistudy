import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WiStudyProvider } from "@/contexts/WiStudyContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import UploadIdolPage from "./pages/UploadIdolPage";
import SettingsPage from "./pages/SettingsPage";
import ChooseBackgroundPage from "./pages/ChooseBackgroundPage";
import GeneratePage from "./pages/GeneratePage";
import MusicSelectionPage from "./pages/MusicSelectionPage";
import PomodoroSetupPage from "./pages/PomodoroSetupPage";
import StudyRoomPage from "./pages/StudyRoomPage";
import AdminPage from "./pages/AdminPage";
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
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/upload-idol" element={<ProtectedRoute><UploadIdolPage /></ProtectedRoute>} />
                  <Route path="/choose-background" element={<ProtectedRoute><ChooseBackgroundPage /></ProtectedRoute>} />
                  <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
                  <Route path="/choose-music" element={<ProtectedRoute><MusicSelectionPage /></ProtectedRoute>} />
                  <Route path="/pomodoro-setup" element={<ProtectedRoute><PomodoroSetupPage /></ProtectedRoute>} />
                  <Route path="/study-room" element={<ProtectedRoute><StudyRoomPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                  
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

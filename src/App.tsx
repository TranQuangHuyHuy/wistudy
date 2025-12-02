import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WiStudyProvider } from "@/contexts/WiStudyContext";
import Index from "./pages/Index";
import UploadIdolPage from "./pages/UploadIdolPage";
import ChooseBackgroundPage from "./pages/ChooseBackgroundPage";
import GeneratePage from "./pages/GeneratePage";
import PomodoroSetupPage from "./pages/PomodoroSetupPage";
import StudyRoomPage from "./pages/StudyRoomPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WiStudyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/upload-idol" element={<UploadIdolPage />} />
            <Route path="/choose-background" element={<ChooseBackgroundPage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/pomodoro-setup" element={<PomodoroSetupPage />} />
            <Route path="/study-room" element={<StudyRoomPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WiStudyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

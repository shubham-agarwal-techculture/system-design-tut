import { Routes, Route } from "react-router-dom";
import { ProgressProvider } from "@/context/ProgressContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Curriculum from "@/pages/Curriculum";
import LessonPage from "@/pages/LessonPage";
import SessionPage from "@/pages/SessionPage";
import Challenges from "@/pages/Challenges";
import ChallengePage from "@/pages/ChallengePage";
import Resources from "@/pages/Resources";
import Explore from "@/pages/Explore";
import Radar from "@/pages/Radar";
import WhatsNew from "@/pages/WhatsNew";
import QuizPage from "@/pages/QuizPage";
import Appearance from "@/pages/Appearance";
import DesignGuide from "@/pages/DesignGuide";

export default function App() {
  return (
    <ProgressProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="lesson/:lessonId" element={<LessonPage />} />
          <Route path="session" element={<SessionPage />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenge/:challengeId" element={<ChallengePage />} />
          <Route path="resources" element={<Resources />} />
          <Route path="explore" element={<Explore />} />
          <Route path="radar" element={<Radar />} />
          <Route path="whats-new" element={<WhatsNew />} />
          <Route path="quiz/:lessonId" element={<QuizPage />} />
          <Route path="appearance" element={<Appearance />} />
          <Route path="design" element={<DesignGuide />} />
        </Route>
      </Routes>
    </ProgressProvider>
  );
}

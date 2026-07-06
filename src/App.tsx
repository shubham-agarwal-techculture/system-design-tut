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
        </Route>
      </Routes>
    </ProgressProvider>
  );
}

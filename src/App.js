import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import LearningPage from './pages/LearningPage';
import EnhancedLearningPage from './pages/EnhancedLearningPage';
import AdvancedLearningPage from './pages/AdvancedLearningPage';
import TestPage from './pages/TestPage';
import TestResultPage from './pages/TestResultPage';
import CertificatePage from './pages/CertificatePage';
import HomeSupportUserDetailPage from './pages/HomeSupportUserDetailPage';
import DailyRecordsPage from './pages/DailyRecordsPage';
import HomeSupportDailyRecordsPage from './pages/HomeSupportDailyRecordsPage';
import HomeSupportEvaluationsPage from './pages/HomeSupportEvaluationsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 管理者・指導員用ログインページ（メインページ） */}
          <Route path="/" element={<LoginPage />} />
          {/* 管理者用ダッシュボード */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* 指導員用ダッシュボード */}
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          {/* 互換性のため古いパスも残す */}
          <Route path="/teacher/dashboard" element={<InstructorDashboard />} />
          {/* 生徒用ログイン（トークンベース） */}
          <Route path="/student/login/:token" element={<StudentLogin />} />
          {/* 生徒用ダッシュボード */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          {/* 学習画面 */}
          <Route path="/student/learning" element={<LearningPage />} />
          {/* 改善版学習画面（提案版） */}
          <Route path="/student/enhanced-learning" element={<EnhancedLearningPage />} />
          {/* 高度な学習画面（第3案） */}
          <Route path="/student/advanced-learning" element={<AdvancedLearningPage />} />
          {/* 学習効果テスト関連 */}
          <Route path="/student/test" element={<TestPage />} />
          <Route path="/student/test-result" element={<TestResultPage />} />
          <Route path="/student/certificate" element={<CertificatePage />} />
          {/* 指導員用利用者詳細画面 */}
          <Route path="/instructor/student/:studentId" element={<HomeSupportUserDetailPage />} />
          {/* 在宅支援：日々の記録ページ */}
          <Route path="/instructor/student/:studentId/daily-records" element={<DailyRecordsPage />} />
          {/* 在宅支援管理：日々の記録管理 */}
          <Route path="/instructor/daily-records" element={<HomeSupportDailyRecordsPage />} />
          {/* 在宅支援管理：達成度評価管理 */}
          <Route path="/instructor/evaluations" element={<HomeSupportEvaluationsPage />} />
          <Route path="/instructor/home-support-evaluations" element={<HomeSupportEvaluationsPage />} />
          {/* 在宅支援管理：利用者詳細画面 */}
          <Route path="/instructor/student-detail/:studentId" element={<HomeSupportUserDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
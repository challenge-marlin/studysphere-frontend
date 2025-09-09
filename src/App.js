import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import TokenCountdown from './components/TokenCountdown';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import AutoLoginPage from './pages/AutoLoginPage';
import { EnhancedLearningPageRefactored } from './components/learning';
import TestPage from './pages/TestPage';
import SectionTestPage from './pages/SectionTestPage';
import LessonTestPage from './pages/LessonTestPage';
import TestResultPage from './pages/TestResultPage';
import CertificatePage from './pages/CertificatePage';
import HomeSupportUserDetailPage from './pages/HomeSupportUserDetailPage';
import DailyRecordsPage from './pages/DailyRecordsPage';
import HomeSupportDailyRecordsPage from './pages/HomeSupportDailyRecordsPage';
import HomeSupportEvaluationsPage from './pages/HomeSupportEvaluationsPage';
import InstructorStudentDetail from './pages/InstructorStudentDetail';
import './App.css';

// デバッグ用のテストコンポーネント
const TestComponent = () => (
  <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
    <h1>Test Component - App is working!</h1>
    <p>If you can see this, the React app is loading correctly.</p>
    <p>Current URL: {window.location.href}</p>
    <p>PUBLIC_URL: {process.env.PUBLIC_URL}</p>
    <p>NODE_ENV: {process.env.NODE_ENV}</p>
  </div>
);

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* デバッグ用テストルート */}
            <Route path="/test" element={<TestComponent />} />
            {/* ルートパスから /homepage へのリダイレクト */}
            <Route path="/" element={<Navigate to="/homepage" replace />} />
            {/* 一般向け概要説明ページ（メインページ） */}
            <Route path="/homepage" element={<HomePage />} />
            {/* 管理者・指導員用ログインページ */}
            <Route path="/admin-instructor-login" element={<LoginPage />} />
            {/* 管理者用ダッシュボード */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* 指導員用ダッシュボード */}
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            {/* 互換性のため古いパスも残す */}
            <Route path="/teacher/dashboard" element={<InstructorDashboard />} />
            {/* 利用者用ログイン（トークンベース） */}
            <Route path="/student/login/:token" element={<StudentLogin />} />
            {/* 利用者用ログイン（パラメータなし） */}
            <Route path="/student-login/" element={<StudentLogin />} />
            {/* 利用者用ログイン（シンプルパス） */}
            <Route path="/student/login" element={<StudentLogin />} />
            {/* 自動ログインページ（アプリからの自動ログイン用） */}
            <Route path="/auto-login/" element={<AutoLoginPage />} />
            {/* 利用者用ダッシュボード */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            {/* 学習画面（リファクタリング版を使用） */}
            <Route path="/student/enhanced-learning" element={<EnhancedLearningPageRefactored />} />
            {/* 学習効果テスト関連 */}
            <Route path="/student/test" element={<TestPage />} />
            <Route path="/student/section-test" element={<SectionTestPage />} />
            <Route path="/student/lesson-test" element={<LessonTestPage />} />
            <Route path="/student/test-result" element={<TestResultPage />} />
            <Route path="/student/certificate" element={<CertificatePage />} />
            {/* 指導員用利用者詳細画面 */}
            <Route path="/instructor/student/:studentId" element={<HomeSupportUserDetailPage />} />
            {/* 指導員用学生詳細画面（学習進捗・合否確認） */}
            <Route path="/instructor/student-detail/:studentId" element={<InstructorStudentDetail />} />
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
          <TokenCountdown />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 
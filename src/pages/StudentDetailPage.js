import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateDailyReportPDF, generateWeeklyReportPDF, generateMonthlyReportPDF } from '../utils/pdfGenerator';
import DailyReportTab from '../components/DailyReportTab';
import UnifiedReportsList from '../components/UnifiedReportsList';

const StudentDetailPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });

  // 生徒データを取得
  useEffect(() => {
    const mockStudents = [
      { 
        id: 'student001', 
        name: '末吉　元気', 
        email: 'sueyoshi@example.com', 
        instructorId: 'instructor001',
        instructorName: '佐藤指導員',
        locationId: 'location001',
        locationName: '東京本校',
        recipientNumber: '123456789012',
        lastLogin: '2024-01-15',
        status: 'active',
        loginToken: 'f9Ul-7OlL-OPZE',
        joinDate: '2024-01-01',
        canStudyAtHome: true,
        tags: ['佐藤指導員', 'ITリテラシー・AIの基本', '東京本校', '中級者', '必修科目', '初級コース']
      }
    ];

    const foundStudent = mockStudents.find(s => s.id === studentId);
    setStudent(foundStudent);

    // モック報告書データ
    const mockReports = {
      daily: [
        {
          id: 'daily001',
          date: '2024-01-15',
          temperature: '36.2',
          healthCondition: 'good',
          healthNotes: '体調は良好です。',
          plannedWork: 'ITリテラシー・AIの基本の学習を進めます。',
          actualWork: 'HTML/CSS基礎学習とレスポンシブデザイン実習を行い、基本概念を理解しました。',
          thoughts: '学習が順調に進んでいます。',
          nextGoal: '次回はより高度な内容に挑戦したいと思います。'
        },
        {
          id: 'daily002',
          date: '2024-01-14',
          temperature: '36.5',
          healthCondition: 'normal',
          healthNotes: '少し疲れ気味ですが、作業は可能です。',
          plannedWork: 'AIの基本概念について学習します。',
          actualWork: 'AIの基本概念とChatGPTの使い方について学習しました。',
          thoughts: 'AIの可能性を実感できました。',
          nextGoal: '実際のプロジェクトでAIを活用してみたい。'
        }
      ],
      weekly: [
        {
          id: 'weekly001',
          period: '2024-01-08 - 2024-01-14',
          evaluationDate: '2024-01-14',
          overallProgress: 85,
          achievements: ['HTML基礎完了', 'CSS基本概念理解'],
          challenges: ['CSS Gridの応用'],
          nextWeekPlan: 'JavaScript基礎学習開始',
          instructorNotes: '順調に進捗している'
        }
      ],
      monthly: [
        {
          id: 'monthly001',
          period: '2024-01-01 - 2024-01-31',
          evaluationDate: '2024-01-31',
          overallProgress: 75,
          skillImprovements: ['HTML/CSS基礎スキル習得', 'Webデザイン基礎理解'],
          workHabits: '規則正しい学習習慣が身についた',
          goals: 'JavaScript習得とポートフォリオ作成',
          instructorEvaluation: '着実にスキルアップしている'
        }
      ]
    };

    setReports(mockReports);
  }, [studentId]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-indigo-600 text-xl font-semibold">生徒情報を読み込み中...</div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/instructor/dashboard?tab=home-support');
  };

  // 報告書の保存
  const handleSaveReport = (reportData, type) => {
    const newReport = {
      id: reportData.id || `${type}_${Date.now()}`,
      ...reportData
    };
    
    setReports(prev => ({
      ...prev,
      [type]: prev[type].filter(r => r.id !== newReport.id).concat(newReport)
    }));
    
    console.log(`${type}報告書を保存:`, newReport);
  };

  // 日次報告書の保存（後方互換性）
  const handleSaveDailyReport = (reportData) => {
    handleSaveReport(reportData, 'daily');
  };

  // 日次報告書の編集
  const handleEditDailyReport = (reportId) => {
    const report = reports.daily.find(r => r.id === reportId);
    if (report) {
      console.log('日次報告書を編集:', report);
    }
  };

  // 報告書の削除
  const handleDeleteReport = (reportId, type) => {
    setReports(prev => ({
      ...prev,
      [type]: prev[type].filter(r => r.id !== reportId)
    }));
    
    console.log(`${type}報告書を削除:`, reportId);
  };

  // 日次報告書の削除（後方互換性）
  const handleDeleteDailyReport = (reportId) => {
    handleDeleteReport(reportId, 'daily');
  };

  // 報告書詳細ページへの遷移
  const handleNavigateToReport = (type, date, report) => {
    setSelectedReport({ type, date, report });
  };

  // 報告書一覧に戻る
  const handleBackToReports = () => {
    setSelectedReport(null);
  };

  const handleCreateReport = (type) => {
    // 報告書作成モーダルを開く
    console.log(`${type}報告書を作成します`);
  };

  const handleEditReport = (type, reportId) => {
    // 報告書編集モーダルを開く
    console.log(`${type}報告書を編集します: ${reportId}`);
  };

  const handleDownloadPDF = (type, reportId) => {
    // PDFダウンロード機能
    let report;
    switch (type) {
      case 'daily':
        report = reports.daily.find(r => r.id === reportId);
        if (report) generateDailyReportPDF(report, student);
        break;
      case 'weekly':
        report = reports.weekly.find(r => r.id === reportId);
        if (report) generateWeeklyReportPDF(report, student);
        break;
      case 'monthly':
        report = reports.monthly.find(r => r.id === reportId);
        if (report) generateMonthlyReportPDF(report, student);
        break;
      default:
        console.log(`${type}報告書をPDFでダウンロードします: ${reportId}`);
    }
  };

  // 統合リスト用のPDF出力機能
  const handleDownloadPDFFromList = (report) => {
    try {
      switch (report.type) {
        case 'daily':
          generateDailyReportPDF(report, student);
          break;
        case 'weekly':
          generateWeeklyReportPDF(report, student);
          break;
        case 'monthly':
          generateMonthlyReportPDF(report, student);
          break;
        default:
          console.log('未知の報告書タイプ:', report.type);
      }
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={handleBack}
              >
                ← 在宅支援評価一覧に戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">生徒詳細</h1>
                <span className="text-indigo-100 text-sm">{student.name}さんの詳細情報</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                {student.status === 'active' ? 'アクティブ' : '非アクティブ'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 生徒情報 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {student.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{student.name}</h2>
                <p className="text-gray-600">{student.email}</p>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">基本情報</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">指導員:</span>
                      <span className="text-gray-800">{student.instructorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">拠点:</span>
                      <span className="text-gray-800">{student.locationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">加入日:</span>
                      <span className="text-gray-800">{student.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最終ログイン:</span>
                      <span className="text-gray-800">{student.lastLogin}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">在宅学習</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">在宅学習:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.canStudyAtHome 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.canStudyAtHome ? '可能' : '不可'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ログイントークン:</span>
                      <span className="text-gray-800 font-mono text-xs">{student.loginToken}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {student.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム: 報告書一覧 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">報告書一覧</h2>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={() => handleCreateReport('daily')}
                  >
                    📝 日次報告書作成
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={() => handleCreateReport('weekly')}
                  >
                    📊 週次報告書作成
                  </button>
                  <button
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={() => handleCreateReport('monthly')}
                  >
                    📈 月次報告書作成
                  </button>
                </div>
              </div>

              <UnifiedReportsList
                reports={reports}
                onNavigateToReport={handleNavigateToReport}
                onEditReport={handleEditReport}
                onDeleteReport={handleDeleteReport}
                onDownloadPDF={handleDownloadPDFFromList}
                student={student}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage; 
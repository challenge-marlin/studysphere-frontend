import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CertificatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [certificateData, setCertificateData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (location.state) {
      const { lessonNumber, lessonTitle, score } = location.state;
      
      // モックアップ用の証明書データを生成
      const mockCertificate = {
        lessonNumber,
        lessonTitle,
        score,
        studentName: "田中 太郎",
        studentId: "STU001",
        completionDate: new Date().toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        certificateId: `CERT-${lessonNumber}-${Date.now()}`,
        instructorName: "山田 指導員",
        organization: "スタディスフィア東京校"
      };
      
      setCertificateData(mockCertificate);
    } else {
      // データがない場合はダッシュボードに戻る
      navigate('/student/dashboard');
    }
  }, [location.state, navigate]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleBackToDashboard = () => {
    navigate('/student/dashboard');
  };

  const handleBackToResults = () => {
    navigate(-1);
  };

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">証明書を準備中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={handleBackToResults}
              >
                ← 結果に戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">合格証明書</h1>
                <span className="text-blue-100 text-sm">{certificateData.lessonTitle}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? '印刷中...' : '🖨️ 印刷'}
              </button>
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={handleBackToDashboard}
              >
                🏠 ダッシュボード
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 証明書本体 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-8 border-gradient-to-r from-blue-500 to-cyan-600 relative overflow-hidden">
          {/* 装飾的な背景要素 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-4 border-cyan-200 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-4 border-cyan-200 rounded-full"></div>
          </div>

          {/* 証明書内容 */}
          <div className="relative z-10">
            {/* ヘッダー部分 */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  SS
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-800">スタディスフィア東京校</h2>
                  <p className="text-gray-600">Study Sphere Tokyo Campus</p>
                  <p className="text-sm text-gray-500">
                    〒100-0001 東京都千代田区千代田1-1-1<br />
                    TEL: 03-1234-5678
                  </p>
                </div>
              </div>
            </div>

            {/* メインタイトル */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                修了証明書
              </h1>
              <p className="text-gray-600 text-lg">Certificate of Completion</p>
            </div>

            {/* 証明書本文 */}
            <div className="mb-12">
              <p className="text-lg text-gray-700 text-center mb-8 leading-relaxed">
                この証明書は、下記の方が
                <span className="font-bold text-blue-600 mx-2">{certificateData.lessonTitle}</span>
                の学習を修了したことを証明します。
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">氏名</span>
                    <span className="text-gray-800">{certificateData.studentName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">生徒ID</span>
                    <span className="text-gray-800">{certificateData.studentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">修了日</span>
                    <span className="text-gray-800">{certificateData.completionDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">テスト結果</span>
                    <span className="text-blue-600 font-bold">{certificateData.score}点</span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-700 text-center leading-relaxed">
                上記の学習内容を理解し、効果テストに合格したことを確認いたします。
                今後の学習活動においても、この知識を活用していただくことを期待いたします。
              </p>
            </div>

            {/* 署名部分 */}
            <div className="flex justify-between items-end mb-8">
              <div className="text-center">
                <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                <p className="font-semibold text-gray-800">{certificateData.instructorName}</p>
                <p className="text-gray-600">指導員</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                <p className="font-semibold text-gray-800">スタディスフィア東京校</p>
                <p className="text-gray-600">代表者</p>
              </div>
            </div>

            {/* 証明書ID */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500">証明書ID: {certificateData.certificateId}</p>
            </div>

            {/* 装飾的な要素 */}
            <div className="absolute top-8 right-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                合格
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? '印刷中...' : '🖨️ 証明書を印刷'}
          </button>
          <button
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleBackToDashboard}
          >
            📊 ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage; 
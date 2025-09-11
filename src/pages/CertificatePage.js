import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCertificateData } from '../utils/api';
import { printCertificate } from '../utils/certificatePrint';

const CertificatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [certificateData, setCertificateData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (location.state) {
          const { userId, lessonId, examResultId } = location.state;
          
          if (!userId || !lessonId) {
            throw new Error('必要なパラメータが不足しています');
          }

          // APIから合格証明書データを取得
          const response = await getCertificateData(userId, lessonId, examResultId);
          
          if (response.success) {
            setCertificateData(response.data);
          } else {
            throw new Error(response.message || '合格証明書データの取得に失敗しました');
          }
        } else {
          // データがない場合はダッシュボードに戻る
          navigate('/student/dashboard');
        }
      } catch (error) {
        console.error('合格証明書データ取得エラー:', error);
        setError(error.message || '合格証明書データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [location.state, navigate]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      // A4サイズ1枚に最適化された印刷機能
      printCertificate(certificateData);
      setIsPrinting(false);
    }, 100);
  };

  const handleBackToDashboard = () => {
    navigate('/student/dashboard');
  };

  const handleBackToResults = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">証明書を準備中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/student/dashboard')}
            >
              ダッシュボードに戻る
            </button>
            <button 
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-gray-500 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">証明書データが見つかりません</h2>
          <p className="text-gray-600 mb-6">合格証明書のデータを取得できませんでした。</p>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/student/dashboard')}
          >
            ダッシュボードに戻る
          </button>
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
                  {certificateData.officeName ? certificateData.officeName.charAt(0) : 'S'}
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{certificateData.officeName}</h2>
                  <p className="text-gray-600">{certificateData.companyName}</p>
                  <p className="text-sm text-gray-500">
                    {certificateData.officeAddress || ''}
                    {certificateData.officePhone && (
                      <>
                        <br />
                        TEL: {certificateData.officePhone}
                      </>
                    )}
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
                    <span className="font-semibold text-gray-700">利用者ID</span>
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
              {certificateData.instructorName && (
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                  <p className="font-semibold text-gray-800">{certificateData.instructorName}</p>
                  <p className="text-gray-600">指導員</p>
                </div>
              )}
              {certificateData.managerNames && certificateData.managerNames.length > 0 && (
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                  <div className="font-semibold text-gray-800">
                    {certificateData.managerNames.map((name, index) => (
                      <div key={index}>{name}</div>
                    ))}
                  </div>
                  <p className="text-gray-600">拠点管理者</p>
                </div>
              )}
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
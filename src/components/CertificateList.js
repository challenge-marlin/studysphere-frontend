import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { printCertificate } from '../utils/certificatePrint';
import { API_BASE_URL } from '../config/apiConfig';

const CertificateList = () => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      console.log('fetchCertificates called, currentUser:', currentUser);
      console.log('currentUser.id:', currentUser?.id);
      
      if (!currentUser?.id) {
        console.log('currentUser.id が存在しないため、APIリクエストをスキップします');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/learning/certificates/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('終了証APIレスポンス:', data);
          console.log('終了証データ:', data.data);
          console.log('終了証データの長さ:', data.data?.length);
          if (data.success) {
            setCertificates(data.data);
            console.log('終了証をセットしました:', data.data);
          } else {
            setError(data.message || '終了証の取得に失敗しました');
          }
        } else {
          setError('終了証の取得に失敗しました');
        }
      } catch (error) {
        console.error('終了証取得エラー:', error);
        setError('終了証の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [currentUser?.id]);

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 終了証の確認</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-blue-600 text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 終了証の確認</h3>
        <div className="text-center py-8">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 終了証の確認</h3>
        
        {(() => {
          console.log('CertificateList render - certificates:', certificates);
          console.log('CertificateList render - certificates.length:', certificates.length);
          console.log('CertificateList render - loading:', loading);
          console.log('CertificateList render - error:', error);
          return null;
        })()}
        
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-lg mb-2">まだ終了証がありません</p>
            <p className="text-sm">レッスンを完了して終了証を獲得しましょう！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <div key={certificate.certificateId} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{certificate.lessonTitle}</h4>
                    <p className="text-sm text-blue-600 font-medium">{certificate.courseTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ✅ 合格
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {certificate.percentage}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">得点:</span> {certificate.score}/{certificate.totalQuestions}点
                  </div>
                  <div>
                    <span className="font-medium">完了日:</span> {formatDate(certificate.examDate)}
                  </div>
                </div>
                
                <button 
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-200"
                  onClick={() => handleViewCertificate(certificate)}
                >
                  📄 終了証を確認
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 終了証詳細モーダル */}
      {showModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">合格証明書</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* 証明書本体 */}
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
                        {selectedCertificate.officeName ? selectedCertificate.officeName.charAt(0) : 'S'}
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-gray-800">{selectedCertificate.officeName}</h3>
                        <p className="text-gray-600">{selectedCertificate.companyName}</p>
                        <p className="text-sm text-gray-500">
                          {selectedCertificate.officeAddress || ''}
                          {selectedCertificate.officePhone && (
                            <>
                              <br />
                              TEL: {selectedCertificate.officePhone}
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
                      <span className="font-bold text-blue-600 mx-2">{selectedCertificate.lessonTitle}</span>
                      の学習を修了したことを証明します。
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">氏名</span>
                          <span className="text-gray-800">{selectedCertificate.studentName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">利用者ID</span>
                          <span className="text-gray-800">{selectedCertificate.studentId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">修了日</span>
                          <span className="text-gray-800">{selectedCertificate.completionDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">テスト結果</span>
                          <span className="text-blue-600 font-bold">{selectedCertificate.score}点</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">正答率</span>
                          <span className="text-green-600 font-bold">{selectedCertificate.percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">証明書ID</span>
                          <span className="text-gray-600 font-mono text-sm">{selectedCertificate.certificateId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        {selectedCertificate.completionDate}
                      </p>
                      <div className="flex items-center justify-center gap-8">
                        {selectedCertificate.instructorName && (
                          <div className="text-center">
                            <div className="w-24 h-16 border-b-2 border-gray-400 mb-2"></div>
                            <p className="text-sm text-gray-600">指導員</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedCertificate.instructorName}</p>
                          </div>
                        )}
                        {selectedCertificate.managerNames && selectedCertificate.managerNames.length > 0 && (
                          <div className="text-center">
                            <div className="w-24 h-16 border-b-2 border-gray-400 mb-2"></div>
                            <p className="text-sm text-gray-600">拠点管理者</p>
                            <div className="text-sm font-semibold text-gray-800">
                              {selectedCertificate.managerNames.map((name, index) => (
                                <div key={index}>{name}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  閉じる
                </button>
                <button 
                  onClick={() => {
                    // A4サイズ1枚に最適化された印刷機能
                    printCertificate(selectedCertificate);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  🖨️ 印刷
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificateList;

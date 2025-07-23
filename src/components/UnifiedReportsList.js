import React, { useState, useEffect } from 'react';
import WeeklyEvaluationDetail from './WeeklyEvaluationDetail';
import MonthlyEvaluationDetail from './MonthlyEvaluationDetail';

const UnifiedReportsList = ({ student, reports, onNavigateToReport, onDownloadPDF }) => {
  const [filterType, setFilterType] = useState('all'); // all, daily, weekly, monthly
  const [sortBy, setSortBy] = useState('date'); // date, type, status
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // 統合された報告書リストを作成
  const createUnifiedReports = () => {
    const unified = [];
    
    // 日次報告書を追加
    if (reports.daily) {
      reports.daily.forEach(report => {
        unified.push({
          ...report,
          type: 'daily',
          typeLabel: '日次報告書',
          typeIcon: '📝',
          status: report.id ? 'completed' : 'pending'
        });
      });
    }
    
    // 週次報告書を追加
    if (reports.weekly) {
      reports.weekly.forEach(report => {
        unified.push({
          ...report,
          type: 'weekly',
          typeLabel: '週次報告書',
          typeIcon: '📅',
          status: report.id ? 'completed' : 'pending'
        });
      });
    }
    
    // 月次報告書を追加
    if (reports.monthly) {
      reports.monthly.forEach(report => {
        unified.push({
          ...report,
          type: 'monthly',
          typeLabel: '月次報告書',
          typeIcon: '📈',
          status: report.id ? 'completed' : 'pending'
        });
      });
    }
    
    return unified;
  };

  // フィルタリングとソート
  useEffect(() => {
    let filtered = createUnifiedReports();
    
    // タイプでフィルタリング
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType);
    }
    
    // 検索でフィルタリング
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.date.includes(searchTerm) ||
        report.typeLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.actualWork && report.actualWork.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.thoughts && report.thoughts.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'type':
          return a.typeLabel.localeCompare(b.typeLabel);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    setFilteredReports(filtered);
  }, [reports, filterType, sortBy, searchTerm]);

  // 報告書のステータスを取得
  const getReportStatus = (report) => {
    if (report.status === 'completed') {
      return { label: '作成済み', class: 'completed' };
    }
    
    const today = new Date();
    const reportDate = new Date(report.date);
    const daysDiff = (today - reportDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      return { label: '期限切れ', class: 'expired' };
    } else if (daysDiff > 3) {
      return { label: '要作成', class: 'urgent' };
    } else {
      return { label: '未作成', class: 'pending' };
    }
  };

  // 報告書をクリックした時の処理
  const handleReportClick = (report) => {
    if (report.type === 'weekly' || report.type === 'monthly') {
      setSelectedReport(report);
      setShowDetail(true);
    } else {
      onNavigateToReport(report.type, report.date, report);
    }
  };

  // 詳細表示を閉じる
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedReport(null);
  };

  // 週次・月次評価を保存
  const handleSaveEvaluation = (evaluationData) => {
    console.log('評価データを保存:', evaluationData);
    // 実際の実装では、ここでAPIを呼び出してデータを保存
    handleCloseDetail();
  };

  // 週次・月次評価を削除
  const handleDeleteEvaluation = (reportId) => {
    console.log('評価を削除:', reportId);
    // 実際の実装では、ここでAPIを呼び出してデータを削除
    handleCloseDetail();
  };

  // 新規作成ボタンの処理
  const handleCreateNew = (type) => {
    const today = new Date().toISOString().split('T')[0];
    onNavigateToReport(type, today, null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-800">📋 報告書一覧</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="daily">日次報告書</option>
                  <option value="weekly">週次報告書</option>
                  <option value="monthly">月次報告書</option>
                </select>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="date">日付順</option>
                  <option value="type">種類順</option>
                  <option value="status">ステータス順</option>
                </select>
              </div>
              
              <input
                type="text"
                placeholder="日付または内容で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button 
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
              onClick={() => handleCreateNew('daily')}
            >
              ➕ 日次報告書作成
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
              onClick={() => handleCreateNew('weekly')}
            >
              ➕ 週次報告書作成
            </button>
            <button 
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200"
              onClick={() => handleCreateNew('monthly')}
            >
              ➕ 月次報告書作成
            </button>
          </div>

          <div className="min-h-[400px]">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-gray-600 mb-4">該当する報告書が見つかりません。</p>
                <div>
                  <button 
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={() => handleCreateNew('daily')}
                  >
                    最初の報告書を作成
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report, index) => {
                  const status = getReportStatus(report);
                  return (
                    <div 
                      key={`${report.type}-${report.date}-${index}`} 
                      className={`border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${
                        status.class === 'expired' ? 'border-red-200 bg-red-50' :
                        status.class === 'urgent' ? 'border-yellow-200 bg-yellow-50' :
                        status.class === 'completed' ? 'border-green-200 bg-green-50' :
                        'border-gray-200 bg-white'
                      }`}
                      onClick={() => handleReportClick(report)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{report.typeIcon}</span>
                          <span className="font-semibold text-gray-800">{report.typeLabel}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status.class === 'completed' ? 'bg-green-100 text-green-800' :
                          status.class === 'expired' ? 'bg-red-100 text-red-800' :
                          status.class === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        {report.date}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {report.type === 'daily' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">体温:</span>
                              <span className="text-gray-800">{report.temperature || '--'}℃</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">体調:</span>
                              <span className="text-gray-800">
                                {report.healthCondition === 'good' ? '良好' : 
                                 report.healthCondition === 'normal' ? '普通' : '悪い'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">作業実績:</span>
                              <p className="text-gray-800 truncate">
                                {report.actualWork ? 
                                  (report.actualWork.length > 30 ? 
                                    report.actualWork.substring(0, 30) + '...' : 
                                    report.actualWork) : 
                                  '未入力'}
                              </p>
                            </div>
                          </>
                        )}
                        
                        {report.type === 'weekly' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">期間:</span>
                              <span className="text-gray-800">{report.period}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">進捗:</span>
                              <span className="text-gray-800">{report.overallProgress || '--'}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">成果:</span>
                              <p className="text-gray-800 truncate">
                                {report.achievements && report.achievements.length > 0 ? 
                                  report.achievements[0] : '未入力'}
                              </p>
                            </div>
                          </>
                        )}
                        
                        {report.type === 'monthly' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">期間:</span>
                              <span className="text-gray-800">{report.period}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">進捗:</span>
                              <span className="text-gray-800">{report.overallProgress || '--'}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">スキル向上:</span>
                              <p className="text-gray-800 truncate">
                                {report.skillImprovements && report.skillImprovements.length > 0 ? 
                                  report.skillImprovements[0] : '未入力'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReportClick(report);
                          }}
                        >
                          👁️ 表示
                        </button>
                        {report.status === 'completed' && (
                          <button 
                            className="flex-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReportClick(report);
                            }}
                          >
                            ✏️ 編集
                          </button>
                        )}
                        <button 
                          className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-sm font-medium transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadPDF && onDownloadPDF(report);
                          }}
                          title={`${report.typeLabel}をPDFでダウンロード`}
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 週次・月次評価の詳細表示 */}
      {showDetail && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{selectedReport.typeLabel} - {selectedReport.date}</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={handleCloseDetail}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedReport.type === 'weekly' && (
                <WeeklyEvaluationDetail
                  student={student}
                  report={selectedReport}
                  onSave={handleSaveEvaluation}
                  onDelete={handleDeleteEvaluation}
                  onDownloadPDF={onDownloadPDF}
                />
              )}
              {selectedReport.type === 'monthly' && (
                <MonthlyEvaluationDetail
                  student={student}
                  report={selectedReport}
                  onSave={handleSaveEvaluation}
                  onDelete={handleDeleteEvaluation}
                  onDownloadPDF={onDownloadPDF}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedReportsList; 
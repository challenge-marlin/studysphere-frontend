import React, { useState, useEffect } from 'react';

const DailyReportTab = ({ student, reports = [], onSave, onEdit, onDelete, onDownloadPDF }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [studentPhotos, setStudentPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [instructorRecord, setInstructorRecord] = useState({
    startTime: '10:00',
    endTime: '16:00',
    supportMethod: '電話',
    workContent: '',
    supportContent: '',
    healthStatus: ''
  });

  // 日次報告書の初期データ構造（HomeSupportDailyRecordsPageの本人入力部分を基に作成）
  const initialDailyReport = {
    date: selectedDate,
    temperature: '36.2',
    healthCondition: 'good', // good, normal, bad
    healthNotes: '体調は良好です。',
    plannedWork: student ? `${student.class}の学習を進めます。` : '',
    actualWork: '学習を継続し、新しい内容について理解を深めました。',
    thoughts: '学習が順調に進んでいます。',
    nextGoal: '次回はより高度な内容に挑戦したいと思います。'
  };

  // 写真を取得する処理
  const fetchStudentPhotos = async (date) => {
    setPhotoLoading(true);
    
    try {
      // モックデータ - 実際の実装ではS3から取得
      const mockPhotos = [
        {
          id: 'photo1',
          url: 'https://via.placeholder.com/400x300/007bff/ffffff?text=作業写真1',
          timestamp: `${date}T09:00:00`,
          description: '作業開始時の様子'
        },
        {
          id: 'photo2',
          url: 'https://via.placeholder.com/400x300/28a745/ffffff?text=作業写真2',
          timestamp: `${date}T09:30:00`,
          description: '作業中の様子'
        },
        {
          id: 'photo3',
          url: 'https://via.placeholder.com/400x300/ffc107/ffffff?text=作業写真3',
          timestamp: `${date}T10:00:00`,
          description: '作業進捗確認'
        },
        {
          id: 'photo4',
          url: 'https://via.placeholder.com/400x300/dc3545/ffffff?text=作業写真4',
          timestamp: `${date}T10:30:00`,
          description: '休憩時間'
        }
      ];

      // 実際の実装では以下のようなAPIコールを行う
      // const response = await fetch(`/api/photos/${student.id}?date=${date}`);
      // const photos = await response.json();
      
      setStudentPhotos(mockPhotos);
    } catch (error) {
      console.error('写真の取得に失敗しました:', error);
      setStudentPhotos([]);
    } finally {
      setPhotoLoading(false);
    }
  };

  // 日付変更時に写真を再取得
  useEffect(() => {
    if (student) {
      fetchStudentPhotos(selectedDate);
    }
  }, [selectedDate, student]);

  // 検索とフィルタリング
  useEffect(() => {
    let filtered = reports || [];
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.date.includes(searchTerm) ||
        (report.actualWork && report.actualWork.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.thoughts && report.thoughts.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.plannedWork && report.plannedWork.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, searchTerm]);

  // 日付変更時の処理
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const existingReport = (reports || []).find(r => r.date === newDate);
    
    if (existingReport) {
      setEditingReport(existingReport);
      setIsEditing(true);
    } else {
      setEditingReport({ ...initialDailyReport, date: newDate });
      setIsEditing(false);
    }
  };

  // 新規作成
  const handleCreateNew = () => {
    setEditingReport({ ...initialDailyReport, date: selectedDate });
    setIsEditing(true);
  };

  // 編集開始
  const handleStartEdit = (report) => {
    setEditingReport(report);
    setIsEditing(true);
  };

  // 保存
  const handleSave = () => {
    if (!editingReport) return;
    
    if (!editingReport.actualWork || !editingReport.thoughts) {
      alert('必須項目（作業実績、感想・次回目標）を入力してください。');
      return;
    }
    
    onSave(editingReport);
    setIsEditing(false);
    setEditingReport(null);
  };

  // キャンセル
  const handleCancel = () => {
    setIsEditing(false);
    setEditingReport(null);
  };

  // 削除
  const handleDelete = (reportId) => {
    if (window.confirm('この日次報告書を削除しますか？')) {
      onDelete(reportId);
    }
  };

  // AIアシスト機能
  const generateAIAssist = (field) => {
    const dailyInput = editingReport || initialDailyReport;
    
    if (!dailyInput.healthCondition) {
      return 'データが準備できていません。';
    }
    
    let suggestion = '';
    
    switch (field) {
      case 'workContent':
        suggestion = `・${dailyInput.actualWork || '作業内容を確認'}\n・${student?.class || 'コース'}の学習を継続\n・作業効率の向上を図る`;
        break;
      case 'supportContent':
        suggestion = `・9:00　利用者から作業開始の連絡。体調確認（体温${dailyInput.temperature || '--'}℃）\n・12:00　午前中の作業進捗を確認。${dailyInput.actualWork || '作業内容を確認'}\n・15:00　作業終了の確認。次回目標：${dailyInput.nextGoal || '目標を設定'}`;
        break;
      case 'healthStatus':
        const healthText = dailyInput.healthCondition === 'good' ? '良好' : 
                          dailyInput.healthCondition === 'normal' ? '普通' : '悪い';
        suggestion = `・体温${dailyInput.temperature || '--'}℃、体調は${healthText}\n・${dailyInput.healthNotes || '体調備考なし'}\n・適度な休憩を取るよう助言`;
        break;
      default:
        suggestion = 'AIアシストの提案を生成中...';
    }
    
    return suggestion;
  };

  // 指導員記録を更新
  const updateInstructorRecord = (field, value) => {
    setInstructorRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 指導員記録を保存
  const saveInstructorRecord = () => {
    if (!instructorRecord.workContent || !instructorRecord.supportContent || !instructorRecord.healthStatus) {
      alert('必須項目を入力してください。');
      return;
    }
    
    alert('指導員記録を保存しました。');
    // 実際の実装ではAPIに保存
  };

  // 現在の日付の報告書を取得
  const currentReport = (reports || []).find(r => r.date === selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">📝 日次報告書管理</h3>
              <p className="text-gray-600">在宅学習者の日次記録と支援内容の管理</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="日付または内容で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button 
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={handleCreateNew}
              >
                ➕ 新規作成
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 生徒基本情報 */}
          {student && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-800 mb-1">{student.name}</h4>
                    <span className="text-gray-600 font-medium">{student.class}</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {student.tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentReport?.healthCondition === 'good' ? 'bg-green-100 text-green-800' :
                    currentReport?.healthCondition === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentReport?.healthCondition === 'good' ? '良好' : 
                     currentReport?.healthCondition === 'normal' ? '普通' : '悪い'}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    {currentReport?.temperature || '36.2'}℃
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 日付選択とクイックアクセス */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">日付選択:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  今日
                </button>
                <button 
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    handleDateChange(yesterday.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  昨日
                </button>
                <button 
                  onClick={() => {
                    const lastWeek = new Date();
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    handleDateChange(lastWeek.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  1週間前
                </button>
              </div>
            </div>
          </div>

          {/* 写真セクション */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h5 className="text-lg font-bold text-gray-800 mb-4">📸 作業内容写真（30分ごと）</h5>
            <div className="min-h-[200px]">
              {photoLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                  <span className="text-gray-600">写真を読み込み中...</span>
                </div>
              ) : studentPhotos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {studentPhotos.map((photo) => (
                    <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.description}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          {new Date(photo.timestamp).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-600">{photo.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <span className="text-4xl mb-2">📷</span>
                  <span className="font-medium mb-1">この日の写真はありません</span>
                  <span className="text-sm">専用アプリから30分ごとに自動取得されます</span>
                </div>
              )}
            </div>
          </div>

          {/* 編集フォームまたは表示 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            {isEditing ? (
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-gray-800">{selectedDate} の日次報告書</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">体温</label>
                    <input
                      type="text"
                      value={editingReport.temperature}
                      onChange={(e) => setEditingReport(prev => ({ ...prev, temperature: e.target.value }))}
                      placeholder="例: 36.2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">体調</label>
                    <select
                      value={editingReport.healthCondition}
                      onChange={(e) => setEditingReport(prev => ({ ...prev, healthCondition: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="good">良好</option>
                      <option value="normal">普通</option>
                      <option value="bad">悪い</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">体調備考</label>
                  <textarea
                    value={editingReport.healthNotes}
                    onChange={(e) => setEditingReport(prev => ({ ...prev, healthNotes: e.target.value }))}
                    placeholder="体調についての詳細を記載してください"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">本日の作業内容（予定）</label>
                  <textarea
                    value={editingReport.plannedWork}
                    onChange={(e) => setEditingReport(prev => ({ ...prev, plannedWork: e.target.value }))}
                    placeholder="今日予定している作業内容を記載してください"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">作業実績 *</label>
                  <textarea
                    value={editingReport.actualWork}
                    onChange={(e) => setEditingReport(prev => ({ ...prev, actualWork: e.target.value }))}
                    placeholder="実際に行った作業内容を記載してください"
                    rows="3"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">感想・次回目標 *</label>
                  <textarea
                    value={editingReport.thoughts}
                    onChange={(e) => setEditingReport(prev => ({ ...prev, thoughts: e.target.value }))}
                    placeholder="今日の感想と次回の目標を記載してください"
                    rows="3"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">次回の目標</label>
                  <textarea
                    value={editingReport.nextGoal}
                    onChange={(e) => setEditingReport(prev => ({ ...prev, nextGoal: e.target.value }))}
                    placeholder="次回の具体的な目標を記載してください"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button 
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                    onClick={handleSave}
                  >
                    💾 保存
                  </button>
                  <button 
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                    onClick={handleCancel}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {currentReport ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-gray-800">{currentReport.date} の日次報告書</h4>
                      <div className="flex gap-2">
                        <button 
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                          onClick={() => handleStartEdit(currentReport)}
                        >
                          ✏️ 編集
                        </button>
                        <button 
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                          onClick={() => handleDelete(currentReport.id || currentReport.date)}
                        >
                          🗑️ 削除
                        </button>
                        <button 
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200"
                          onClick={() => onDownloadPDF && onDownloadPDF(currentReport)}
                          title="PDFでダウンロード"
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">体温:</span>
                          <span className="text-gray-800">{currentReport.temperature}℃</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">体調:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            currentReport.healthCondition === 'good' ? 'bg-green-100 text-green-800' :
                            currentReport.healthCondition === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {currentReport.healthCondition === 'good' ? '良好' : 
                             currentReport.healthCondition === 'normal' ? '普通' : '悪い'}
                          </span>
                        </div>
                        {currentReport.healthNotes && (
                          <div>
                            <span className="font-medium text-gray-700">体調備考:</span>
                            <p className="mt-1 text-gray-800">{currentReport.healthNotes}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">本日の作業内容（予定）:</span>
                          <p className="mt-1 text-gray-800">{currentReport.plannedWork}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-gray-700">作業実績:</span>
                          <p className="mt-1 text-gray-800">{currentReport.actualWork}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">感想・次回目標:</span>
                          <p className="mt-1 text-gray-800">{currentReport.thoughts}</p>
                        </div>
                        {currentReport.nextGoal && (
                          <div>
                            <span className="font-medium text-gray-700">次回の目標:</span>
                            <p className="mt-1 text-gray-800">{currentReport.nextGoal}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">{selectedDate} の日次報告書はまだ作成されていません。</p>
                    <button 
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                      onClick={handleCreateNew}
                    >
                      📝 新規作成
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 指導員記録セクション */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h5 className="text-lg font-bold text-gray-800 mb-6">指導員記録</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
                <input
                  type="time"
                  value={instructorRecord.startTime}
                  onChange={(e) => updateInstructorRecord('startTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了時間</label>
                <input
                  type="time"
                  value={instructorRecord.endTime}
                  onChange={(e) => updateInstructorRecord('endTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">支援方法</label>
                <select
                  value={instructorRecord.supportMethod}
                  onChange={(e) => updateInstructorRecord('supportMethod', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="電話">電話</option>
                  <option value="訪問">訪問</option>
                  <option value="その他">その他</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作業・訓練内容
                  <button 
                    className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                    onClick={() => updateInstructorRecord('workContent', generateAIAssist('workContent'))}
                    title="AIアシスト"
                  >
                    🤖 AI
                  </button>
                </label>
                <textarea
                  value={instructorRecord.workContent}
                  onChange={(e) => updateInstructorRecord('workContent', e.target.value)}
                  placeholder="実施した作業や訓練の内容を記載してください"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  支援内容（1日2回以上）
                  <button 
                    className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                    onClick={() => updateInstructorRecord('supportContent', generateAIAssist('supportContent'))}
                    title="AIアシスト"
                  >
                    🤖 AI
                  </button>
                </label>
                <textarea
                  value={instructorRecord.supportContent}
                  onChange={(e) => updateInstructorRecord('supportContent', e.target.value)}
                  placeholder="具体的な支援内容を時間順に記載してください"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象者の心身の状況及びそれに対する助言の内容
                  <button 
                    className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                    onClick={() => updateInstructorRecord('healthStatus', generateAIAssist('healthStatus'))}
                    title="AIアシスト"
                  >
                    🤖 AI
                  </button>
                </label>
                <textarea
                  value={instructorRecord.healthStatus}
                  onChange={(e) => updateInstructorRecord('healthStatus', e.target.value)}
                  placeholder="体調や精神状態、それに対する助言を記載してください"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button 
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200"
                onClick={() => alert('PDF出力機能（モックアップ）')}
                title="PDF出力"
              >
                📄 PDF出力
              </button>
              <button 
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                onClick={saveInstructorRecord}
              >
                💾 指導員記録を保存
              </button>
            </div>
          </div>

          {/* 過去の報告書一覧 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-6">📚 過去の報告書一覧</h4>
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>過去の報告書が見つかりません。</p>
                </div>
              ) : (
                filteredReports.map((report, index) => (
                  <div key={report.id || `report-${index}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-gray-700">{report.date}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {report.healthCondition === 'good' ? '🟢' : 
                           report.healthCondition === 'normal' ? '🟡' : '🔴'}
                        </span>
                        <span className="text-sm text-gray-600 max-w-md truncate">
                          {report.actualWork && report.actualWork.length > 50 
                            ? report.actualWork.substring(0, 50) + '...' 
                            : report.actualWork || '作業内容なし'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-all duration-200"
                        onClick={() => handleDateChange(report.date)}
                      >
                        表示
                      </button>
                      <button 
                        className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium transition-all duration-200"
                        onClick={() => handleStartEdit(report)}
                      >
                        編集
                      </button>
                      <button 
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-sm font-medium transition-all duration-200"
                        onClick={() => onDownloadPDF && onDownloadPDF(report)}
                        title="PDFでダウンロード"
                      >
                        📄
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReportTab; 
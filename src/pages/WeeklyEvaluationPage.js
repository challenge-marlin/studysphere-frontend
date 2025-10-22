import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import WeeklyEvaluationModal from '../components/WeeklyEvaluationModal';

/**
 * 評価(週次)作成画面
 * 左側：今週の日次記録一覧（折りたたみ可能）
 * 右側：評価(週次)フォーム
 */
const WeeklyEvaluationPage = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  
  // 期間の状態管理
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [prevEvalDate, setPrevEvalDate] = useState('');
  
  // 生徒情報
  const [student, setStudent] = useState(null);
  
  // 日次記録一覧
  const [dailyRecords, setDailyRecords] = useState([]);
  const [expandedRecords, setExpandedRecords] = useState({});
  
  // 評価(週次)フォーム
  const [evaluationData, setEvaluationData] = useState({
    method: '通所',
    methodOther: '',
    content: '',
    recorder: '',
    confirmer: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 指導員リスト
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    // 指導員リストを取得（モックデータ）
    setInstructors([
      { id: 'inst001', name: '佐藤指導員' },
      { id: 'inst002', name: '田中指導員' },
      { id: 'inst003', name: '山田指導員' },
      { id: 'inst004', name: '鈴木指導員' },
      { id: 'inst005', name: '高橋指導員' }
    ]);
  }, []);

  useEffect(() => {
    // URLパラメータから期間を取得、なければ今週を設定
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    if (start && end) {
      setPeriodStart(start);
      setPeriodEnd(end);
    } else {
      // 今週の期間を自動設定
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      setPeriodStart(monday.toISOString().split('T')[0]);
      setPeriodEnd(sunday.toISOString().split('T')[0]);
    }

    // 生徒情報を取得（モックデータ）
    setStudent({
      id: studentId || 'student001',
      name: '田中 太郎',
      recipientNumber: '1234567890',
      instructorName: '佐藤指導員'
    });

    // 前回評価日を設定（仮）
    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 7);
    setPrevEvalDate(prevDate.toISOString().split('T')[0]);
  }, [studentId, searchParams]);

  useEffect(() => {
    if (periodStart && periodEnd) {
      fetchDailyRecords();
    }
  }, [periodStart, periodEnd]);

  // 日次記録を取得
  const fetchDailyRecords = () => {
    // モックデータ
    const mockRecords = [
      {
        id: 'daily001',
        date: periodStart,
        startTime: '10:00',
        endTime: '16:00',
        supportMethod: '電話',
        workContent: '・ITリテラシー・AIの基本の学習を実施\n・HTML/CSS基礎学習とレスポンシブデザイン実習',
        supportContent: '・9:00 利用者から作業開始の連絡\n・12:00 午前中の進捗確認\n・15:00 午後の学習内容について助言\n・16:00 本日の成果確認',
        healthStatus: '・9:00 体温36.2℃、体調良好\n・16:00 軽い疲労感あり、適度な休憩を推奨',
        responder: '佐藤指導員'
      },
      {
        id: 'daily002',
        date: addDays(periodStart, 1),
        startTime: '10:00',
        endTime: '16:00',
        supportMethod: '電話',
        workContent: '・CSSレイアウトの応用学習\n・レスポンシブデザインの実践',
        supportContent: '・9:00 作業開始確認、本日の目標設定\n・12:00 進捗確認、午前の成果を評価\n・16:00 終了確認、次回の予定を確認',
        healthStatus: '・9:00 体温36.3℃、睡眠良好\n・16:00 集中できた様子、体調も安定',
        responder: '佐藤指導員'
      }
    ];
    
    setDailyRecords(mockRecords);
    
    // デフォルトで最初のレコードを展開
    if (mockRecords.length > 0) {
      setExpandedRecords({ [mockRecords[0].id]: true });
    }
  };

  // 日付に日数を追加
  const addDays = (dateStr, days) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // レコードの展開/折りたたみ
  const toggleRecord = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  // 全て展開/折りたたみ
  const toggleAllRecords = (expand) => {
    const newState = {};
    dailyRecords.forEach(record => {
      newState[record.id] = expand;
    });
    setExpandedRecords(newState);
  };

  // フォーム更新
  const updateEvaluation = (field, value) => {
    setEvaluationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // AIで評価案を生成
  const generateEvaluationWithAI = () => {
    setIsGenerating(true);
    
    // AIによる評価案生成のシミュレーション
    setTimeout(() => {
      const suggestion = `・対象期間中の作業の進め方や、設定した目標の達成度を確認しました。
・HTML/CSSの基礎学習は順調に進んでおり、レスポンシブデザインの理解も深まっています。
・毎日の進捗確認を通じて、計画的に学習を進める習慣が身についてきました。
・集中力が途切れることも少なく、適度な休憩を取りながら効率的に作業できています。
・生活面では、規則正しい生活リズムを維持できており、体調も安定しています。
・来週は、より実践的な課題に取り組み、スキルの定着を図っていく方針です。`;
      
      updateEvaluation('content', suggestion);
      setIsGenerating(false);
    }, 1500);
  };

  // 保存
  const handleSave = () => {
    const data = {
      studentId: student.id,
      studentName: student.name,
      periodStart,
      periodEnd,
      prevEvalDate,
      evalDate: new Date().toISOString().split('T')[0],
      ...evaluationData
    };
    
    console.log('評価(週次)を保存:', data);
    alert('評価(週次)を保存しました。');
    navigate('/instructor/dashboard?tab=home-support');
  };

  // 日付フォーマット
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-indigo-600 text-xl font-semibold">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-full mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={() => navigate('/instructor/dashboard?tab=home-support')}
              >
                ← 在宅支援管理に戻る
              </button>
              <div>
                <h1 className="text-3xl font-bold mb-1">📊 評価(週次)作成</h1>
                <p className="text-blue-100 text-sm">在宅における就労支援記録（評価）</p>
              </div>
            </div>
          </div>
          
          {/* 期間設定 */}
          <div className="mt-6 bg-white bg-opacity-10 rounded-xl p-4 border border-white border-opacity-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-blue-200">対象者:</span>
                  <span className="ml-2 font-semibold text-white">{student.name}</span>
                  <span className="ml-3 text-blue-200">受給者証番号:</span>
                  <span className="ml-2 font-semibold text-white">{student.recipientNumber}</span>
                </div>
                <div className="text-sm">
                  <span className="text-blue-200">前回評価日:</span>
                  <span className="ml-2 font-semibold text-white">{formatDate(prevEvalDate)}</span>
                </div>
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-2">📅 対象期間を設定</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(e) => {
                        setPeriodStart(e.target.value);
                        // 開始日を変更したら、自動的に6日後を終了日に設定（1週間）
                        const newStart = new Date(e.target.value);
                        const newEnd = new Date(newStart);
                        newEnd.setDate(newStart.getDate() + 6);
                        setPeriodEnd(newEnd.toISOString().split('T')[0]);
                      }}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 text-gray-800 rounded-lg border-2 border-blue-300 focus:ring-2 focus:ring-white focus:border-white font-semibold"
                    />
                    <p className="text-xs text-blue-100 mt-1">開始日</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 text-gray-800 rounded-lg border-2 border-blue-300 focus:ring-2 focus:ring-white focus:border-white font-semibold"
                    />
                    <p className="text-xs text-blue-100 mt-1">終了日</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：日次記録一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📝 今週の日次記録</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllRecords(true)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all duration-200"
                  >
                    全て展開
                  </button>
                  <button
                    onClick={() => toggleAllRecords(false)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all duration-200"
                  >
                    全て折りたたむ
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {dailyRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    この期間の日次記録がありません
                  </div>
                ) : (
                  dailyRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleRecord(record.id)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {expandedRecords[record.id] ? '📂' : '📁'}
                          </span>
                          <div className="text-left">
                            <div className="font-semibold text-gray-800">
                              {formatDate(record.date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.startTime} 〜 {record.endTime} ({record.supportMethod})
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400">
                          {expandedRecords[record.id] ? '▼' : '▶'}
                        </span>
                      </button>
                      
                      {expandedRecords[record.id] && (
                        <div className="p-4 bg-white space-y-3 text-sm">
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">作業・訓練内容</div>
                            <div className="text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded">
                              {record.workContent}
                            </div>
                          </div>
                          
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">支援内容</div>
                            <div className="text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded">
                              {record.supportContent}
                            </div>
                          </div>
                          
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">心身の状況</div>
                            <div className="text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded">
                              {record.healthStatus}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 border-t pt-2">
                            記録者: {record.responder}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右側：評価(週次)フォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">📋 評価(週次)フォーム</h2>

              {/* 注意事項 */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">※ 評価は作業・訓練対象日（期間最終日）の1週間以内に実施すること</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* 実施方法 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    実施方法 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {['通所', '訪問', 'その他'].map(method => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="method"
                          value={method}
                          checked={evaluationData.method === method}
                          onChange={(e) => updateEvaluation('method', e.target.value)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                  {evaluationData.method === 'その他' && (
                    <input
                      type="text"
                      value={evaluationData.methodOther}
                      onChange={(e) => updateEvaluation('methodOther', e.target.value)}
                      placeholder="実施方法の詳細を入力"
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* 評価内容 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      評価内容 <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={generateEvaluationWithAI}
                      disabled={isGenerating || dailyRecords.length === 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        isGenerating || dailyRecords.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          生成中...
                        </>
                      ) : (
                        <>
                          ✨ 今週の記録から評価案を生成
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    左側の日次記録を確認しながら、1週間の振り返りを記載してください
                  </p>
                  <textarea
                    value={evaluationData.content}
                    onChange={(e) => updateEvaluation('content', e.target.value)}
                    rows={12}
                    placeholder="例：&#10;・対象期間中の作業の進め方や、設定した個数目標の達成度をお互いに確認。&#10;・目標に届かなかった日がある。意欲はあるが、集中力が途切れたことが原因であり、効果的なリフレッシュ方法を考えていく。&#10;・生活面では、たまにスマホゲームに没頭してしまい、夜更かししてしまうことがあるため、特に夜間の生活リズムを崩さないよう助言する。"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 記録者 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    記録者 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="recorder-list"
                      value={evaluationData.recorder}
                      onChange={(e) => updateEvaluation('recorder', e.target.value)}
                      placeholder="リストから選択または手入力"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <datalist id="recorder-list">
                      {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.name} />
                      ))}
                    </datalist>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">指導員リストから選択、または直接入力できます</p>
                </div>

                {/* 確認者（サービス管理責任者） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    確認者（サービス管理責任者） <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="confirmer-list"
                      value={evaluationData.confirmer}
                      onChange={(e) => updateEvaluation('confirmer', e.target.value)}
                      placeholder="リストから選択または手入力"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <datalist id="confirmer-list">
                      {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.name} />
                      ))}
                    </datalist>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">※ 評価内容はサービス管理責任者が必ず確認すること</p>
                </div>
              </div>

              {/* ボタン */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => navigate('/instructor/dashboard?tab=home-support')}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  💾 保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyEvaluationPage;


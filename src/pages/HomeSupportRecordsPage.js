import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import InstructorHeader from '../components/InstructorHeader';

const HomeSupportRecordsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useInstructorGuard();
  
  // 日付範囲の初期値（今月の1日から今日まで）
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // モックデータ（利用者情報）
  const users = {
    'tanaka': { id: 'tanaka', name: '田中 太郎', recipientNumber: '1234567890' },
    'sato': { id: 'sato', name: '佐藤 花子', recipientNumber: '2345678901' },
    'suzuki': { id: 'suzuki', name: '鈴木 一郎', recipientNumber: '3456789012' },
    'takahashi': { id: 'takahashi', name: '高橋 美咲', recipientNumber: '4567890123' },
    'ito': { id: 'ito', name: '伊藤 健太', recipientNumber: '5678901234' }
  };

  const selectedUser = users[userId];

  // モックデータ（記録データ）
  const mockRecords = [
    {
      id: 1,
      date: '2025-01-15',
      type: 'daily',
      // DailySupportRecordModalの項目
      startTime: '10:00',
      endTime: '16:00',
      supportMethod: '電話',
      supportMethodOther: '',
      workContent: '・ITリテラシー・AIの基本の学習を実施\n・HTML/CSS基礎学習とレスポンシブデザイン実習を行い、基本概念を理解\n・Webページ作成の基礎を習得',
      supportContent: '・9:00　利用者から作業開始の連絡。本日の学習内容と目標を確認（田中 太郎さん）\n・12:00　午前中の学習進捗を電話で確認。HTML基礎の理解が進んでいることを確認\n・15:00　午後の学習内容について助言。CSS実習の注意点を説明\n・16:00　本日の学習成果を確認。次回の目標設定と、生活リズムを保つよう助言',
      healthStatus: '・9:00　体温36.2℃、睡眠時間7時間と確認。体調は良好な様子\n・16:00　長時間の学習でやや疲労感があるとのこと。適度な休憩を取りながら、メリハリをつけて学習することを助言\n・生活リズムを保つために、就寝・起床時間を守ることを助言',
      responder: '山田 指導員'
    },
    {
      id: 2,
      date: '2025-01-16',
      type: 'daily',
      startTime: '09:30',
      endTime: '16:00',
      supportMethod: '電話',
      supportMethodOther: '',
      workContent: '・JavaScript基礎の学習\n・変数、関数、配列などの基本文法を学習\n・簡単なプログラムを作成',
      supportContent: '・9:30　作業開始の連絡。昨日の復習と本日の目標を確認\n・13:00　昼休憩後の状態を確認。集中して作業できているとのこと\n・16:00　本日の成果を確認。理解が進んでいることを評価',
      healthStatus: '・9:30　体温36.0℃、睡眠時間8時間。体調良好\n・16:00　疲労感なく、意欲的に取り組めているとのこと',
      responder: '山田 指導員'
    },
    {
      id: 3,
      date: '2025-01-17',
      type: 'daily',
      startTime: '10:00',
      endTime: '15:30',
      supportMethod: '訪問',
      supportMethodOther: '',
      workContent: '・JavaScriptの応用学習\n・DOMの操作方法を学習\n・簡単なインタラクティブな要素を作成',
      supportContent: '・10:00　自宅訪問。今週の学習成果を確認\n・11:00　実際の作業を見ながら、効率的なコーディング方法をアドバイス\n・14:00　来週の学習計画を一緒に立案\n・15:30　訪問終了。次回の目標を確認',
      healthStatus: '・10:00　体調良好。今週は安定して学習できた様子\n・生活リズムも整っており、前向きに取り組めている',
      responder: '山田 指導員、佐藤 指導員'
    },
    {
      id: 4,
      date: '2025-01-13 - 2025-01-17',
      type: 'weekly',
      period: '第3週',
      // WeeklyEvaluationPageの項目
      method: '訪問',
      methodOther: '',
      content: '・対象期間中の作業の進め方や、設定した目標の達成度を確認しました。\n・HTML/CSSの基本を習得し、簡単なWebページを作成できるようになった\n・JavaScriptの基礎文法を理解し、簡単なプログラムが書けるようになった\n・学習意欲が高く、自主的に復習も行っている\n・長時間の集中作業で疲労感が出ることがあるため、適度な休憩を取りながら学習を進めることを助言\n・エラーが出た時の対処方法について、来週重点的に指導する方針',
      recorder: '山田 指導員',
      confirmer: '佐藤 サービス管理責任者'
    }
  ];

  // 記録を検索
  const searchRecords = () => {
    setLoading(true);
    // TODO: 実際のAPI呼び出しに置き換え
    setTimeout(() => {
      setRecords(mockRecords);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (selectedUser) {
      searchRecords();
    }
  }, []);

  // 印刷処理
  const handlePrint = () => {
    window.print();
  };

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">利用者が見つかりません</p>
          <button
            onClick={() => navigate('/instructor/home-support')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            在宅支援ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 印刷時は非表示 */}
      <div className="print:hidden">
        <InstructorHeader 
          user={currentUser} 
          showBackButton={true}
          backButtonText="在宅支援ダッシュボードに戻る"
          onBackClick={() => navigate('/instructor/home-support')}
        />
      </div>

      <div className="flex-1 p-8">
        {/* 検索・印刷エリア（印刷時は非表示） */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 print:hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">🔍 在宅支援記録確認</h1>
            <p className="text-lg text-gray-600">日次支援記録と週次評価を統合して確認・印刷できます</p>
          </div>

          {/* 利用者情報 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-200">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedUser.name}</h2>
                <p className="text-sm text-gray-600">受給者証番号: {selectedUser.recipientNumber}</p>
              </div>
            </div>
          </div>

          {/* 日付範囲選択 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button 
                onClick={searchRecords}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '検索中...' : '🔍 検索'}
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🖨️ 印刷
              </button>
            </div>
          </div>

          {/* クイック日付選択 */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              過去1週間
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(firstDay.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              今月
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                setStartDate(lastMonthStart.toISOString().split('T')[0]);
                setEndDate(lastMonthEnd.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              先月
            </button>
          </div>
        </div>

        {/* 印刷用ヘッダー（画面上は非表示） */}
        <div className="hidden print:block mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">在宅における就労支援記録</h1>
            <p className="text-sm text-gray-600 mt-2">
              期間: {new Date(startDate).toLocaleDateString('ja-JP')} ～ {new Date(endDate).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="border-2 border-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">利用者名:</span> {selectedUser.name}
              </div>
              <div>
                <span className="font-semibold">受給者証番号:</span> {selectedUser.recipientNumber}
              </div>
            </div>
          </div>
        </div>

        {/* 記録一覧 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 print:shadow-none print:rounded-none">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
              <p className="mt-4 text-gray-600">記録を読み込んでいます...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">記録が見つかりません</p>
              <p className="text-sm text-gray-500 mt-2">期間を変更して再度検索してください</p>
            </div>
          ) : (
            <div className="space-y-6">
              {records.map((record, index) => (
                <div key={record.id} className="border-2 border-gray-300 rounded-lg p-6 print:break-inside-avoid print:page-break-inside-avoid">
                  {record.type === 'daily' ? (
                    // 日次支援記録
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300">
                        <div className="flex items-center gap-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            📝 日次支援記録
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {new Date(record.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">記録者: {record.responder}</span>
                      </div>

                      {/* 基本情報 */}
                      <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">実施時間:</span>
                            <span className="ml-2 font-semibold text-gray-800">{record.startTime} 〜 {record.endTime}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">支援方法:</span>
                            <span className="ml-2 font-semibold text-gray-800">
                              {record.supportMethod}
                              {record.supportMethod === 'その他' && record.supportMethodOther && ` (${record.supportMethodOther})`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">対応者:</span>
                            <span className="ml-2 font-semibold text-gray-800">{record.responder}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">作業・訓練内容</span>
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                            {record.workContent}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">支援内容（1日2回以上）</span>
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                            {record.supportContent}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">対象者の心身の状況及びそれに対する助言の内容</span>
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                            {record.healthStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 週次評価
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            📊 週次評価
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {record.date} ({record.period})
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">記録者: {record.recorder}</span>
                      </div>

                      {/* 基本情報 */}
                      <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">実施方法:</span>
                            <span className="ml-2 font-semibold text-gray-800">
                              {record.method}
                              {record.method === 'その他' && record.methodOther && ` (${record.methodOther})`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">記録者:</span>
                            <span className="ml-2 font-semibold text-gray-800">{record.recorder}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">確認者:</span>
                            <span className="ml-2 font-semibold text-gray-800">{record.confirmer}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">評価内容</span>
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                            {record.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 印刷時のフッター */}
        <div className="hidden print:block mt-6 text-center text-sm text-gray-600">
          <p>発行日: {new Date().toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeSupportRecordsPage;


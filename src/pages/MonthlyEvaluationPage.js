import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

/**
 * 達成度評価作成画面（在宅における就労達成度評価シート）
 * 左側上：個別支援計画
 * 左側下：今月の評価(週次)一覧
 * 右側：達成度評価フォーム
 */
const MonthlyEvaluationPage = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  
  // 期間の状態管理
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [prevEvalDate, setPrevEvalDate] = useState('');
  
  // 生徒情報
  const [student, setStudent] = useState(null);
  
  // 個別支援計画
  const [supportPlan, setSupportPlan] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(true);
  
  // 週次評価一覧
  const [weeklyEvaluations, setWeeklyEvaluations] = useState([]);
  const [expandedWeekly, setExpandedWeekly] = useState({});
  
  // 達成度評価フォーム
  const [evaluationData, setEvaluationData] = useState({
    startTime: '',
    endTime: '',
    method: '通所',
    methodOther: '',
    trainingGoal: '',
    workContent: '',
    achievement: '',
    issues: '',
    improvementPlan: '',
    healthNotes: '',
    otherNotes: '',
    continuityValidity: '',
    evaluator: '',
    studentSignature: ''
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
    // URLパラメータから期間を取得、なければ今月の1日〜末日を設定
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    if (start && end) {
      setPeriodStart(start);
      setPeriodEnd(end);
    } else {
      // 今月の1日〜末日を設定
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setPeriodStart(firstDay.toISOString().split('T')[0]);
      setPeriodEnd(lastDay.toISOString().split('T')[0]);
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
    prevDate.setMonth(prevDate.getMonth() - 1);
    setPrevEvalDate(prevDate.toISOString().split('T')[0]);
  }, [studentId, searchParams]);

  useEffect(() => {
    if (periodStart && periodEnd) {
      fetchSupportPlan();
      fetchWeeklyEvaluations();
    }
  }, [periodStart, periodEnd]);

  // 個別支援計画を取得
  const fetchSupportPlan = () => {
    // モックデータ
    setSupportPlan({
      longTermGoal: 'しっかりと就労できるよう、心身の健康を維持する',
      shortTermGoal: '新しい環境や就労のスタイルに慣れる',
      needs: [
        'いずれはスキルアップしたい',
        '天候が悪くなると頭痛などで体調が悪くなることがある'
      ],
      supportContent: [
        '生成AIを使用したHP作成、及びアプリの開発がスムーズに行えるよう、声掛け、助言、アドバイスを行います。また、休憩などを取らずオーバーワーク気味の際には休憩を促し、体調のコントロールを図ります',
        '体調不良時には適宜休憩を促し、体調管理に努めます。また、在宅就労システムを導入した際には在宅の作業が出来るよう対応を行います'
      ],
      targetDate: '2025/07/31'
    });
  };

  // 週次評価一覧を取得
  const fetchWeeklyEvaluations = () => {
    // モックデータ
    const mockWeekly = [
      {
        id: 'weekly001',
        period: '2024-10-01 〜 2024-10-06',
        evalDate: '2024-10-07',
        method: '通所',
        content: '・HTML/CSS基礎学習を開始し、基本的なタグの理解が進んでいる\n・学習意欲が高く、自主的に質問する姿勢が見られる\n・生活リズムは概ね安定している',
        recorder: '佐藤指導員'
      },
      {
        id: 'weekly002',
        period: '2024-10-07 〜 2024-10-13',
        evalDate: '2024-10-14',
        method: '電話',
        content: '・レスポンシブデザインの学習に進み、理解が深まっている\n・作業時間の管理がうまくできるようになってきた\n・体調も安定しており、集中力も維持できている',
        recorder: '佐藤指導員'
      },
      {
        id: 'weekly003',
        period: '2024-10-14 〜 2024-10-20',
        evalDate: '2024-10-21',
        method: '電話',
        content: '・JavaScriptの基礎に入り、プログラミング的思考が身についてきた\n・課題に対して自分で調べて解決する力が向上している\n・継続的な学習習慣が確立されてきている',
        recorder: '佐藤指導員'
      }
    ];
    
    setWeeklyEvaluations(mockWeekly);
    
    // デフォルトで最初の評価を展開
    if (mockWeekly.length > 0) {
      setExpandedWeekly({ [mockWeekly[0].id]: true });
    }
  };

  // 週次評価の展開/折りたたみ
  const toggleWeekly = (weeklyId) => {
    setExpandedWeekly(prev => ({
      ...prev,
      [weeklyId]: !prev[weeklyId]
    }));
  };

  // 全て展開/折りたたみ
  const toggleAllWeekly = (expand) => {
    const newState = {};
    weeklyEvaluations.forEach(weekly => {
      newState[weekly.id] = expand;
    });
    setExpandedWeekly(newState);
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
      // 訓練目標の提案
      const goalSuggestion = `${supportPlan.shortTermGoal}を達成するため、具体的には以下を目標とします：\n・Webページ制作の基礎スキル（HTML/CSS/JavaScript）を習得する\n・学習時間の自己管理ができるようになる\n・規則正しい生活リズムを維持する`;
      
      // 取組内容の提案
      const workSuggestion = `・HTML/CSSの基礎から応用まで段階的に学習\n・レスポンシブデザインの実践的な演習\n・JavaScriptの基礎学習と簡単なプログラム作成\n・毎日の学習時間の記録と振り返り`;
      
      // 達成度の提案
      const achievementSuggestion = `・HTML/CSSの基礎スキルは概ね習得できた\n・レスポンシブデザインの理解も深まり、簡単なWebページを作成できるようになった\n・JavaScriptは基礎に入ったばかりで、継続学習が必要\n・学習時間の自己管理は徐々にできるようになってきた\n・生活リズムは安定して維持できている`;
      
      // 課題の提案
      const issuesSuggestion = `・JavaScriptのプログラミング的思考にまだ慣れていない部分がある\n・複雑な課題に取り組む際、時間配分に課題が残る\n・天候による体調への影響について、引き続き注意が必要`;
      
      // 改善方針の提案
      const improvementSuggestion = `・来月はJavaScriptの学習を重点的に進め、実践的なプログラム作成に取り組む\n・課題解決のためのタイムマネジメントスキルの向上を図る\n・天候と体調の関係を記録し、予防的な対策を検討する\n・引き続き規則正しい生活リズムの維持を支援する`;
      
      // 健康面の提案
      const healthSuggestion = `・体調は概ね良好で、安定した学習が継続できている\n・天候の変化による影響は見られるものの、適切に休憩を取ることで対応できている\n・生活リズムが安定しており、睡眠も十分に取れている`;
      
      // 継続妥当性の提案
      const validitySuggestion = `個別支援計画に掲げた目標に対し、着実に進捗しています。新しい環境での学習スタイルにも適応し、自主的な学習姿勢が身についてきています。体調面も安定しており、在宅での就労訓練が効果的に機能していると判断できます。今後も継続的な支援により、さらなるスキルアップが期待できるため、在宅就労による支援を継続することが妥当であると判断します。`;
      
      setEvaluationData(prev => ({
        ...prev,
        trainingGoal: goalSuggestion,
        workContent: workSuggestion,
        achievement: achievementSuggestion,
        issues: issuesSuggestion,
        improvementPlan: improvementSuggestion,
        healthNotes: healthSuggestion,
        continuityValidity: validitySuggestion
      }));
      
      setIsGenerating(false);
    }, 2000);
  };

  // 保存
  const handleSave = () => {
    const data = {
      studentId: student.id,
      studentName: student.name,
      recipientNumber: student.recipientNumber,
      periodStart,
      periodEnd,
      prevEvalDate,
      evalDate: new Date().toISOString().split('T')[0],
      ...evaluationData
    };
    
    console.log('達成度評価を保存:', data);
    alert('達成度評価を保存しました。');
    navigate('/instructor/dashboard?tab=home-support');
  };

  // 日付フォーマット
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  // 期間フォーマット
  const formatPeriod = (start, end) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日 〜 ${endDate.getFullYear()}年${endDate.getMonth() + 1}月${endDate.getDate()}日`;
  };

  if (!student || !supportPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-purple-600 text-xl font-semibold">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
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
                <h1 className="text-3xl font-bold mb-1">📈 達成度評価作成</h1>
                <p className="text-purple-100 text-sm">在宅における就労達成度評価シート</p>
              </div>
            </div>
          </div>
          
          {/* 期間設定 */}
          <div className="mt-6 bg-white bg-opacity-10 rounded-xl p-4 border border-white border-opacity-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-purple-200">対象者:</span>
                  <span className="ml-2 font-semibold text-white">{student.name}</span>
                  <span className="ml-3 text-purple-200">受給者証番号:</span>
                  <span className="ml-2 font-semibold text-white">{student.recipientNumber}</span>
                </div>
                <div className="text-sm">
                  <span className="text-purple-200">前回評価日:</span>
                  <span className="ml-2 font-semibold text-white">{formatDate(prevEvalDate)}</span>
                </div>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">📅 対象期間を設定</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 text-gray-800 rounded-lg border-2 border-purple-300 focus:ring-2 focus:ring-white focus:border-white font-semibold"
                    />
                    <p className="text-xs text-purple-100 mt-1">開始日</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 text-gray-800 rounded-lg border-2 border-purple-300 focus:ring-2 focus:ring-white focus:border-white font-semibold"
                    />
                    <p className="text-xs text-purple-100 mt-1">終了日</p>
                  </div>
                </div>
                <p className="text-xs text-purple-100 mt-2">
                  現在の期間: {formatPeriod(periodStart, periodEnd)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：個別支援計画 + 週次評価一覧 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 個別支援計画 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <button
                onClick={() => setExpandedPlan(!expandedPlan)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-xl font-bold text-gray-800">📋 個別支援計画</h2>
                <span className="text-gray-400">
                  {expandedPlan ? '▼' : '▶'}
                </span>
              </button>

              {expandedPlan && (
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">長期目標</div>
                    <div className="text-gray-600 bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                      {supportPlan.longTermGoal}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">短期目標</div>
                    <div className="text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      {supportPlan.shortTermGoal}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">本人のニーズ</div>
                    <div className="text-gray-600 bg-green-50 p-3 rounded space-y-1">
                      {supportPlan.needs.map((need, index) => (
                        <div key={index}>・{need}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">個別支援内容</div>
                    <div className="text-gray-600 bg-purple-50 p-3 rounded space-y-2">
                      {supportPlan.supportContent.map((content, index) => (
                        <div key={index}>・{content}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">目標達成時期</div>
                    <div className="text-gray-600 bg-gray-50 p-3 rounded font-semibold">
                      {supportPlan.targetDate}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 週次評価一覧 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📊 今月の評価(週次)</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllWeekly(true)}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-all duration-200"
                  >
                    全て展開
                  </button>
                  <button
                    onClick={() => toggleAllWeekly(false)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all duration-200"
                  >
                    折りたたむ
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {                  weeklyEvaluations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    この月の評価(週次)がありません
                  </div>
                ) : (
                  weeklyEvaluations.map((weekly) => (
                    <div key={weekly.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleWeekly(weekly.id)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {expandedWeekly[weekly.id] ? '📂' : '📁'}
                          </span>
                          <div className="text-left">
                            <div className="font-semibold text-gray-800 text-sm">
                              {weekly.period}
                            </div>
                            <div className="text-xs text-gray-500">
                              評価日: {formatDate(weekly.evalDate)} ({weekly.method})
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400">
                          {expandedWeekly[weekly.id] ? '▼' : '▶'}
                        </span>
                      </button>
                      
                      {expandedWeekly[weekly.id] && (
                        <div className="p-4 bg-white space-y-3 text-sm">
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">評価内容</div>
                            <div className="text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded">
                              {weekly.content}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 border-t pt-2">
                            記録者: {weekly.recorder}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右側：達成度評価フォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">📝 達成度評価フォーム</h2>
                <button
                  onClick={generateEvaluationWithAI}
                  disabled={isGenerating || !supportPlan || weeklyEvaluations.length === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    isGenerating || !supportPlan || weeklyEvaluations.length === 0
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
                      ✨ 計画と実績を照らして評価案を生成
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* 実施時間 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">実施時間（開始）</label>
                    <input
                      type="time"
                      value={evaluationData.startTime}
                      onChange={(e) => updateEvaluation('startTime', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">実施時間（終了）</label>
                    <input
                      type="time"
                      value={evaluationData.endTime}
                      onChange={(e) => updateEvaluation('endTime', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

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
                          className="mr-2 text-purple-600 focus:ring-purple-500"
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
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* 訓練目標 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    訓練目標 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">※ 在宅就労による支援効果を達成するために掲げた、当該月の具体的な目標を記載</p>
                  <textarea
                    value={evaluationData.trainingGoal}
                    onChange={(e) => updateEvaluation('trainingGoal', e.target.value)}
                    rows={3}
                    placeholder="個別支援計画の短期目標に基づいた、今月の具体的な目標を記載..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 取組内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    取組内容 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">※ 上記目標を達成するために行った、作業内容や支援内容を記載</p>
                  <textarea
                    value={evaluationData.workContent}
                    onChange={(e) => updateEvaluation('workContent', e.target.value)}
                    rows={4}
                    placeholder="週次評価を参考に、今月行った具体的な作業内容や支援内容を記載..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 訓練目標に対する達成度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    訓練目標に対する達成度 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">※ 上記目標に対し、達成できたこと、できなかったことを具体的に記載</p>
                  <textarea
                    value={evaluationData.achievement}
                    onChange={(e) => updateEvaluation('achievement', e.target.value)}
                    rows={4}
                    placeholder="訓練目標に対する達成度を具体的に記載..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 課題 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    課題 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">※ 達成できなかった内容を分析し、課題を抽出</p>
                  <textarea
                    value={evaluationData.issues}
                    onChange={(e) => updateEvaluation('issues', e.target.value)}
                    rows={3}
                    placeholder="達成できなかった内容を分析し、課題を抽出..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 今後における課題の改善方針 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    今後における課題の改善方針 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">※ 上記課題を克服するための、来月以降の目標設定の方向性や作業内容及び支援内容を記載</p>
                  <textarea
                    value={evaluationData.improvementPlan}
                    onChange={(e) => updateEvaluation('improvementPlan', e.target.value)}
                    rows={4}
                    placeholder="課題克服のための来月以降の方針を記載..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 健康・体調面での留意事項 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    健康・体調面での留意事項 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">※ 在宅就労の継続の妥当性を判断するうえで考慮すべき事項を記載</p>
                  <textarea
                    value={evaluationData.healthNotes}
                    onChange={(e) => updateEvaluation('healthNotes', e.target.value)}
                    rows={3}
                    placeholder="健康・体調面での留意事項を記載..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* その他特記事項 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    その他特記事項
                  </label>
                  <textarea
                    value={evaluationData.otherNotes}
                    onChange={(e) => updateEvaluation('otherNotes', e.target.value)}
                    rows={3}
                    placeholder="その他、特記すべき事項があれば記載..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 在宅就労継続の妥当性 */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    在宅就労継続の妥当性 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">※ 上記記載事項を総合的に勘案し、今後も在宅就労による支援効果が見込まれるかを慎重に検討し判断</p>
                  <textarea
                    value={evaluationData.continuityValidity}
                    onChange={(e) => updateEvaluation('continuityValidity', e.target.value)}
                    rows={4}
                    placeholder="個別支援計画と実績を照らし合わせて、在宅就労継続の妥当性を判断..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* 評価実施者 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    評価実施者 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="evaluator-list"
                      value={evaluationData.evaluator}
                      onChange={(e) => updateEvaluation('evaluator', e.target.value)}
                      placeholder="リストから選択または手入力"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <datalist id="evaluator-list">
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

                {/* 対象者署名（確認欄） */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    対象者署名（確認欄）
                  </label>
                  <p className="text-xs text-gray-600 mb-3">上記内容を確認し、評価実施者と共有しました。</p>
                  <input
                    type="text"
                    value={evaluationData.studentSignature}
                    onChange={(e) => updateEvaluation('studentSignature', e.target.value)}
                    placeholder="対象者名を入力してください"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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

export default MonthlyEvaluationPage;


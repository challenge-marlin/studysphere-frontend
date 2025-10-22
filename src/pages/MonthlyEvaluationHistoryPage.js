import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import InstructorHeader from '../components/InstructorHeader';

const MonthlyEvaluationHistoryPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useInstructorGuard();
  
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const [evaluations, setEvaluations] = useState([]);

  // モックデータ（利用者情報）
  const users = {
    'tanaka': { id: 'tanaka', name: '田中 太郎', recipientNumber: '1234567890' },
    'sato': { id: 'sato', name: '佐藤 花子', recipientNumber: '2345678901' },
    'suzuki': { id: 'suzuki', name: '鈴木 一郎', recipientNumber: '3456789012' },
    'takahashi': { id: 'takahashi', name: '高橋 美咲', recipientNumber: '4567890123' },
    'ito': { id: 'ito', name: '伊藤 健太', recipientNumber: '5678901234' }
  };

  const selectedUser = users[userId];

  // モックデータ（達成度評価履歴）
  const mockEvaluations = [
    {
      id: 1,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      createdDate: '2025-01-31',
      status: 'completed',
      
      // MonthlyEvaluationPageと同じ項目
      startTime: '09:00',
      endTime: '16:00',
      method: '通所',
      methodOther: '',
      trainingGoal: '新しい環境や就労のスタイルに慣れるを達成するため、具体的には以下を目標とします：\n・Webページ制作の基礎スキル（HTML/CSS/JavaScript）を習得する\n・学習時間の自己管理ができるようになる\n・規則正しい生活リズムを維持する',
      workContent: '・HTML/CSSの基礎から応用まで段階的に学習\n・レスポンシブデザインの実践的な演習\n・JavaScriptの基礎学習と簡単なプログラム作成\n・毎日の学習時間の記録と振り返り',
      achievement: '・HTML/CSSの基礎スキルは概ね習得できた\n・レスポンシブデザインの理解も深まり、簡単なWebページを作成できるようになった\n・JavaScriptは基礎に入ったばかりで、継続学習が必要\n・学習時間の自己管理は徐々にできるようになってきた\n・生活リズムは安定して維持できている',
      issues: '・JavaScriptのプログラミング的思考にまだ慣れていない部分がある\n・複雑な課題に取り組む際、時間配分に課題が残る\n・天候による体調への影響について、引き続き注意が必要',
      improvementPlan: '・来月はJavaScriptの学習を重点的に進め、実践的なプログラム作成に取り組む\n・課題解決のためのタイムマネジメントスキルの向上を図る\n・天候と体調の関係を記録し、予防的な対策を検討する\n・引き続き規則正しい生活リズムの維持を支援する',
      healthNotes: '・体調は概ね良好で、安定した学習が継続できている\n・天候の変化による影響は見られるものの、適切に休憩を取ることで対応できている\n・生活リズムが安定しており、睡眠も十分に取れている',
      otherNotes: '特になし',
      continuityValidity: '個別支援計画に掲げた目標に対し、着実に進捗しています。新しい環境での学習スタイルにも適応し、自主的な学習姿勢が身についてきています。体調面も安定しており、在宅での就労訓練が効果的に機能していると判断できます。今後も継続的な支援により、さらなるスキルアップが期待できるため、在宅就労による支援を継続することが妥当であると判断します。',
      evaluator: '山田 指導員',
      studentSignature: '田中 太郎'
    },
    {
      id: 2,
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      createdDate: '2024-12-31',
      status: 'completed',
      
      startTime: '09:00',
      endTime: '15:00',
      method: '通所',
      methodOther: '',
      trainingGoal: '在宅での就労に向けた基礎的な準備として、以下を目標とします：\n・パソコンの基本操作を習得する\n・在宅作業環境を整備する\n・学習習慣を確立する',
      workContent: '・パソコン基本操作の指導（Windows操作、タイピング練習）\n・在宅作業環境の整備支援\n・学習習慣の確立に向けた支援',
      achievement: '・パソコン基本操作を習得できた\n・在宅作業環境を整備できた\n・タイピング練習を継続的に実施できた\n・毎日の学習習慣が確立されてきた',
      issues: '・長時間作業への耐性がまだ不十分\n・自己管理能力の向上が必要',
      improvementPlan: '・来月から本格的な学習カリキュラムを開始する\n・作業時間を段階的に増やしていく\n・自己管理スキルの向上を図る',
      healthNotes: '・体調は良好\n・在宅作業に慣れるまで疲労感があったが、徐々に改善されている',
      otherNotes: '特になし',
      continuityValidity: '導入期として順調に進んでいます。基本的なスキルを習得し、在宅での学習スタイルにも適応できています。次期からの本格的な学習に向けて良い準備ができたため、在宅就労による支援を継続することが妥当であると判断します。',
      evaluator: '山田 指導員',
      studentSignature: '田中 太郎'
    }
  ];

  useEffect(() => {
    // TODO: 実際のAPI呼び出しに置き換え
    setEvaluations(mockEvaluations);
    // 最新の評価を選択
    if (mockEvaluations.length > 0) {
      setSelectedEvaluationId(mockEvaluations[0].id);
    }
  }, []);

  const selectedEvaluation = evaluations.find(e => e.id === selectedEvaluationId);

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
      {/* ヘッダー（印刷時は非表示） */}
      <div className="print:hidden">
        <InstructorHeader 
          user={currentUser} 
          showBackButton={true}
          backButtonText="在宅支援ダッシュボードに戻る"
          onBackClick={() => navigate('/instructor/home-support')}
        />
      </div>

      <div className="flex-1 p-8">
        {/* タイトルエリア（印刷時は非表示） */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 print:hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">📈 在宅における就労達成度評価</h1>
            <p className="text-lg text-gray-600">月次の達成度評価を確認できます</p>
          </div>

          {/* 利用者情報 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-600">受給者証番号: {selectedUser.recipientNumber}</p>
                </div>
              </div>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                🖨️ 印刷
              </button>
            </div>
          </div>

          {/* 評価期間ナビゲーション */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  const currentIndex = evaluations.findIndex(e => e.id === selectedEvaluationId);
                  if (currentIndex < evaluations.length - 1) {
                    setSelectedEvaluationId(evaluations[currentIndex + 1].id);
                  }
                }}
                disabled={evaluations.findIndex(e => e.id === selectedEvaluationId) >= evaluations.length - 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                ← 前回記録
              </button>
              
              <div className="flex-1 text-center">
                <div className="font-bold text-lg text-gray-800">
                  {selectedEvaluation && `${new Date(selectedEvaluation.startDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 〜 ${new Date(selectedEvaluation.endDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  評価作成日: {selectedEvaluation && new Date(selectedEvaluation.createdDate).toLocaleDateString('ja-JP')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {evaluations.length > 0 && `${evaluations.findIndex(e => e.id === selectedEvaluationId) + 1} / ${evaluations.length} 件`}
                </div>
              </div>
              
              <button
                onClick={() => {
                  const currentIndex = evaluations.findIndex(e => e.id === selectedEvaluationId);
                  if (currentIndex > 0) {
                    setSelectedEvaluationId(evaluations[currentIndex - 1].id);
                  }
                }}
                disabled={evaluations.findIndex(e => e.id === selectedEvaluationId) <= 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                次回記録 →
              </button>
            </div>
          </div>
        </div>

        {/* 印刷用ヘッダー（画面上は非表示） */}
        <div className="hidden print:block mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">在宅における就労達成度評価シート</h1>
          </div>
          <div className="border-2 border-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">利用者名:</span> {selectedUser.name}
              </div>
              <div>
                <span className="font-semibold">受給者証番号:</span> {selectedUser.recipientNumber}
              </div>
              <div>
                <span className="font-semibold">評価期間:</span> {selectedEvaluation && `${new Date(selectedEvaluation.startDate).toLocaleDateString('ja-JP')} 〜 ${new Date(selectedEvaluation.endDate).toLocaleDateString('ja-JP')}`}
              </div>
              <div>
                <span className="font-semibold">評価作成日:</span> {selectedEvaluation && new Date(selectedEvaluation.createdDate).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* 評価内容 */}
        {selectedEvaluation ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 print:shadow-none print:rounded-none">
            <div className="space-y-6 print:break-inside-avoid">
              {/* 1. 実施時間 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">実施時間</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">開始時間</div>
                    <div className="text-xl font-bold text-blue-600">{selectedEvaluation.startTime}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">終了時間</div>
                    <div className="text-xl font-bold text-blue-600">{selectedEvaluation.endTime}</div>
                  </div>
                </div>
              </section>

              {/* 2. 実施方法 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg">実施方法</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="inline-block px-4 py-2 bg-white border-2 border-green-500 rounded-lg font-semibold text-gray-800">
                    {selectedEvaluation.method}
                    {selectedEvaluation.method === 'その他' && selectedEvaluation.methodOther && ` (${selectedEvaluation.methodOther})`}
                  </span>
                </div>
              </section>

              {/* 3. 訓練目標 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg">訓練目標</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.trainingGoal}
                </div>
              </section>

              {/* 4. 取組内容 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg">取組内容</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.workContent}
                </div>
              </section>

              {/* 5. 訓練目標に対する達成度 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-lg">訓練目標に対する達成度</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.achievement}
                </div>
              </section>

              {/* 6. 課題 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg">課題</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.issues}
                </div>
              </section>

              {/* 7. 今後における課題の改善方針 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-lg">今後における課題の改善方針</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.improvementPlan}
                </div>
              </section>

              {/* 8. 健康・体調面での留意事項 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg">健康・体調面での留意事項</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.healthNotes}
                </div>
              </section>

              {/* 9. その他特記事項 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg">その他特記事項</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.otherNotes || '特になし'}
                </div>
              </section>

              {/* 10. 在宅就労継続の妥当性 */}
              <section className="border-b-2 border-gray-200 pb-6 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg">在宅就労継続の妥当性</span>
                </h3>
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {selectedEvaluation.continuityValidity}
                </div>
              </section>

              {/* 担当者情報 */}
              <section className="pt-6 border-t-2 border-gray-300 print:break-inside-avoid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">評価作成日</div>
                    <div className="font-semibold text-gray-800">{new Date(selectedEvaluation.createdDate).toLocaleDateString('ja-JP')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">評価実施者</div>
                    <div className="font-semibold text-gray-800">{selectedEvaluation.evaluator}</div>
                  </div>
                </div>
              </section>

              {/* 対象者署名欄（印刷後に手書き用） */}
              <section className="mt-8 pt-6 border-t-2 border-gray-300 print:break-inside-avoid">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">対象者署名（確認欄）</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    上記内容を確認し、評価実施者と共有しました。
                  </p>
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-6 min-h-[100px] flex items-end">
                    <div className="w-full border-b-2 border-gray-400 pb-2">
                      <div className="text-sm text-gray-500 mb-1">署名:</div>
                      <div className="h-8"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    ※ 印刷後、こちらに署名をお願いします
                  </p>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-xl text-gray-600">評価データがありません</p>
          </div>
        )}

        {/* 印刷時のフッター */}
        <div className="hidden print:block mt-6 text-center text-sm text-gray-600">
          <p>発行日: {new Date().toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEvaluationHistoryPage;


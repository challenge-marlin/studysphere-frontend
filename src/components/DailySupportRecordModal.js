import React, { useState } from 'react';

/**
 * 日次支援記録モーダル
 * (様式)在宅における就労支援記録（評価）.txt に基づく
 * 1日1データで、支援内容に時系列で複数回の支援を記録
 */
const DailySupportRecordModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  student,
  date = new Date().toISOString().split('T')[0],
  aiAssist 
}) => {
  const [record, setRecord] = useState({
    startTime: '10:00',
    endTime: '16:00',
    supportMethod: '電話',
    supportMethodOther: '',
    workContent: '',
    supportContent: '',
    healthStatus: '',
    responder: ''
  });

  if (!isOpen) return null;

  // 支援方法の選択肢
  const supportMethods = ['訪問', '電話', 'その他'];

  // 記録を更新
  const updateRecord = (field, value) => {
    setRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // AI提案機能
  const handleAIAssist = (field) => {
    if (!aiAssist) return;
    
    const suggestion = aiAssist(field, {
      student,
      record,
      date
    });
    
    updateRecord(field, suggestion);
  };

  // 保存
  const handleSave = () => {
    const data = {
      studentId: student.id,
      studentName: student.name,
      recipientNumber: student.recipientNumber || '',
      date,
      ...record
    };
    
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">📝 在宅における就労支援記録</h2>
          <div className="text-green-100 text-sm space-y-1">
            <p>対象者名: <span className="font-semibold text-white">{student?.name || '未設定'}</span></p>
            <p>受給者証番号: <span className="font-semibold text-white">{student?.recipientNumber || '未設定'}</span></p>
            <p>実施日: <span className="font-semibold text-white">{new Date(date).toLocaleDateString('ja-JP')}</span></p>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 注意事項 */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">※ 支援内容は1日2回以上の連絡・支援を時系列で記録してください</span>
                <br />
                <span className="text-xs mt-1 block">例：9:00 作業開始確認、12:00 進捗確認、15:00 助言、16:00 終了確認</span>
              </p>
            </div>

            {/* 基本情報 */}
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4">基本情報</h3>

              <div className="space-y-4">
                {/* 実施時間 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      実施時間（開始）
                    </label>
                    <input
                      type="time"
                      value={record.startTime}
                      onChange={(e) => updateRecord('startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      実施時間（終了）
                    </label>
                    <input
                      type="time"
                      value={record.endTime}
                      onChange={(e) => updateRecord('endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 支援方法 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支援方法 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {supportMethods.map(method => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="supportMethod"
                          value={method}
                          checked={record.supportMethod === method}
                          onChange={(e) => updateRecord('supportMethod', e.target.value)}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                  {record.supportMethod === 'その他' && (
                    <input
                      type="text"
                      value={record.supportMethodOther}
                      onChange={(e) => updateRecord('supportMethodOther', e.target.value)}
                      placeholder="支援方法の詳細を入力"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 作業・訓練内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                作業・訓練内容 <span className="text-red-500">*</span>
                <button
                  onClick={() => handleAIAssist('workContent')}
                  className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                >
                  🤖 AI提案
                </button>
              </label>
              <p className="text-xs text-gray-500 mb-2">実施した作業や訓練の内容を記録してください</p>
              <textarea
                value={record.workContent}
                onChange={(e) => updateRecord('workContent', e.target.value)}
                rows="4"
                placeholder="例：&#10;・ビーズ等を使ったアクセサリー作り（前回終えられなかった分も含む）&#10;・上記終了後、細かい作業の訓練のためのプログラム（簡単な手芸作品の作成）を実施"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            {/* 支援内容（1日2回以上） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支援内容（1日2回以上） <span className="text-red-500">*</span>
                <button
                  onClick={() => handleAIAssist('supportContent')}
                  className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                >
                  🤖 AI提案
                </button>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                時系列で複数回（2回以上）の支援・連絡内容を記録してください
              </p>
              <textarea
                value={record.supportContent}
                onChange={(e) => updateRecord('supportContent', e.target.value)}
                rows="10"
                placeholder="例：&#10;・9:00　利用者から作業開始の電話あり。前回作成予定の個数が終わらなかったのは、集中力が続かなかったことが原因のようであり、30分ごとに少し休憩をはさむなどしてリフレッシュの時間を設けることを提案。今日は、前回の残り分を含め、30個の作成を目標とする。（母親へも報告）&#10;・12:00　利用者へ電話。午前中の作業進捗を確認。目標の半分（15個）を作成済み。13:00まで昼休みを取り、13:00から再開することを確認。&#10;・13:00　利用者から電話あり、作業が慣れてきたので、目標の30個が終わったら、残りの時間で、作業能率をさらにアップさせるため、細かな作業の訓練プログラムをやりたいとの提案があり、了承する。&#10;・15:20　30個の作成が終了したとの報告。成果物の画像をLINEで送信してもらい、丁寧に仕上がっていることを確認。残りの時間で、先週渡した訓練プログラム（見本どおりに刺繍する訓練）を実施。&#10;・16:00　利用者へ電話。訓練プログラムの成果物をLINEで確認。次回の作業内容の確認と、目標個数を10個増やすことを確認する。就寝までの生活リズムも崩さないよう助言する。&#10;・全体をとおして、前回より作業能率が上がっており、次回以降もこの状態を維持できるよう助言していきたい。"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            {/* 対象者の心身の状況及びそれに対する助言の内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                対象者の心身の状況及びそれに対する助言の内容 <span className="text-red-500">*</span>
                <button
                  onClick={() => handleAIAssist('healthStatus')}
                  className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                >
                  🤖 AI提案
                </button>
              </label>
              <p className="text-xs text-gray-500 mb-2">時系列で体調確認と助言内容を記録してください</p>
              <textarea
                value={record.healthStatus}
                onChange={(e) => updateRecord('healthStatus', e.target.value)}
                rows="6"
                placeholder="例：&#10;・9:00　体温36.2℃、睡眠時間6時間と確認。体調も良好な様子。いつもどおりストレッチを行うことを助言。&#10;・16:00　いつも以上に作業を頑張ったせいか、軽い頭痛を感じるとのこと。ペースを考え、適宜休憩をとりながら、メリハリをつけて作業することを助言。また、生活リズムを保つために、夜更かしをせず、起床時間を守ることを助言。"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            {/* 対応・記録者 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                対応・記録者 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={record.responder}
                onChange={(e) => updateRecord('responder', e.target.value)}
                placeholder="例：○○○　○○（午前）、△△△　△△（午後）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200"
            >
              💾 保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySupportRecordModal;

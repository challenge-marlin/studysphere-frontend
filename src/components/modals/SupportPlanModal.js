import React from 'react';

const SupportPlanModal = ({ isOpen, onClose, selectedUser }) => {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{selectedUser.name} 個別支援計画</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 長期目標 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">長期目標</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="就労移行支援の長期目標を入力してください"
              defaultValue="就労継続支援A型事業所への就職を目指す"
            />
          </div>

          {/* 短期目標 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">短期目標</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="3ヶ月以内の短期目標を入力してください"
              defaultValue="パソコン操作スキルの向上とコミュニケーション能力の向上"
            />
          </div>

          {/* 本人のニーズ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">本人のニーズ</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="利用者のニーズや希望を入力してください"
              defaultValue="在宅での作業を通じて社会参加したい。パソコンを使った仕事に興味がある。"
            />
          </div>

          {/* 個別支援内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">個別支援内容</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              placeholder="具体的な支援内容を入力してください"
              defaultValue="1. パソコン基本操作の指導\n2. 在宅での作業環境整備\n3. コミュニケーションスキルの向上\n4. 就労に向けた準備支援"
            />
          </div>

          {/* 目標達成時期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">目標達成時期</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="2025-12-31"
            />
          </div>

          {/* 備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="利用者に関する特記事項や注意点を入力してください"
              defaultValue="在宅での作業環境が整っており、パソコン操作に積極的に取り組んでいる。コミュニケーション能力の向上が課題。"
            />
          </div>

          {/* 支援計画の状況 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-3">支援計画の状況</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-xs text-gray-500">個別支援計画書作成日</div>
                <input 
                  type="date" 
                  className="w-full text-sm font-medium border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  defaultValue="2025-01-15"
                  onChange={(e) => {
                    // 作成日が変更されたら、3ヶ月後の日付を次回更新日に設定
                    const createDate = new Date(e.target.value);
                    const updateDate = new Date(createDate);
                    updateDate.setMonth(updateDate.getMonth() + 3);
                    const updateDateInput = document.querySelector('input[data-field="next-update"]');
                    if (updateDateInput) {
                      updateDateInput.value = updateDate.toISOString().split('T')[0];
                    }
                  }}
                />
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-xs text-gray-500">次回更新日</div>
                <input 
                  type="date" 
                  className="w-full text-sm font-medium border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  defaultValue="2025-04-15"
                  data-field="next-update"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              // 保存処理
              onClose();
              alert('個別支援計画を保存しました');
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportPlanModal;

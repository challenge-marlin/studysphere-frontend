import React, { useState, useEffect } from 'react';
import { getOfficeVisitRecord, deleteOfficeVisitRecord } from '../../utils/api';

/**
 * 通所記録モーダル
 */
const OfficeVisitModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  student
}) => {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [checking, setChecking] = useState(false);

  // 日付が変更されたときに通所記録の存在をチェック
  useEffect(() => {
    if (isOpen && student?.id && visitDate) {
      checkExistingRecord();
    }
  }, [isOpen, visitDate, student?.id]);

  const checkExistingRecord = async () => {
    if (!student?.id || !visitDate) return;
    
    console.log('通所記録チェック開始:', { userId: student.id, visitDate });
    setChecking(true);
    try {
      const response = await getOfficeVisitRecord(student.id, visitDate);
      console.log('通所記録API応答:', response);
      if (response.success && response.data) {
        console.log('既存の通所記録を発見:', response.data);
        setExistingRecord(response.data);
      } else {
        console.log('通所記録なし');
        setExistingRecord(null);
      }
    } catch (err) {
      console.error('通所記録チェックエラー:', err);
      setExistingRecord(null);
    } finally {
      setChecking(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!visitDate) {
      setError('通所日を選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        userId: student.id,
        userName: student.name,
        visitDate
      });
    } catch (err) {
      setError('通所記録の設定に失敗しました');
      console.error('通所記録保存エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!existingRecord) return;

    if (!window.confirm(`${visitDate}の通所記録を解除しますか？`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await deleteOfficeVisitRecord(existingRecord.id);
      
      if (response.success) {
        setExistingRecord(null);
        if (onSave) {
          await onSave({
            userId: student.id,
            userName: student.name,
            visitDate,
            action: 'remove'
          });
        } else {
          onClose();
        }
      } else {
        setError(response.message || '通所記録の解除に失敗しました');
      }
    } catch (err) {
      setError('通所記録の解除に失敗しました');
      console.error('通所記録削除エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold mb-2">🏢 通所記録</h2>
          <div className="text-blue-100 text-sm">
            <p>対象者名: <span className="font-semibold text-white">{student?.name || '未設定'}</span></p>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                通所日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={loading || checking}
              />
              {checking && (
                <p className="text-sm text-gray-500 mt-1">確認中...</p>
              )}
              {!checking && existingRecord && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ {visitDate}は既に通所記録が登録されています
                  </p>
                </div>
              )}
              {/* デバッグ用ログ */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded text-xs">
                  <p>デバッグ情報:</p>
                  <p>existingRecord: {JSON.stringify(existingRecord)}</p>
                  <p>checking: {checking.toString()}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ 通所記録について</p>
              <p>選択した日付で通所（事業所への来所）を記録します。</p>
              {existingRecord && (
                <p className="mt-2 text-orange-800 font-medium">
                  ⚠️ この日は既に通所記録があります。通所解除ボタンで解除できます。
                </p>
              )}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading || checking}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              キャンセル
            </button>
            {/* デバッグ用ログ */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mr-4">
                解除ボタン表示条件: existingRecord={existingRecord ? 'true' : 'false'}
              </div>
            )}
            {existingRecord ? (
              <button
                onClick={handleRemove}
                disabled={loading || checking}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>解除中...</span>
                  </>
                ) : (
                  <>
                    🗑️ 通所解除
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading || checking}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>設定中...</span>
                  </>
                ) : (
                  <>
                    ✅ 通所設定
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeVisitModal;


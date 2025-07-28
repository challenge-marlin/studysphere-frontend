import React, { useState } from 'react';
import SanitizedInput from './SanitizedInput';
import SanitizedTextarea from './SanitizedTextarea';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';

/**
 * サニタイズ機能の使用例を示すサンプルコンポーネント
 */
const SanitizeExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    htmlContent: '',
    numberInput: ''
  });

  const [sanitizeMode, setSanitizeMode] = useState(SANITIZE_OPTIONS.FULL);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('送信されるデータ:', formData);
    alert('フォームが送信されました！コンソールでデータを確認してください。');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">サニタイズ機能デモ</h1>
      
      {/* サニタイズモード選択 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">サニタイズモード選択</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(SANITIZE_OPTIONS).map(mode => (
            <label key={mode} className="flex items-center space-x-2">
              <input
                type="radio"
                name="sanitizeMode"
                value={mode}
                checked={sanitizeMode === mode}
                onChange={(e) => setSanitizeMode(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm">
                {mode === SANITIZE_OPTIONS.FULL && '完全サニタイズ'}
                {mode === SANITIZE_OPTIONS.LIGHT && '軽量サニタイズ'}
                {mode === SANITIZE_OPTIONS.HTML_ONLY && 'HTML除去のみ'}
                {mode === SANITIZE_OPTIONS.NONE && 'サニタイズなし'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お名前 *
            </label>
            <SanitizedInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="山田太郎"
              required
              sanitizeMode={sanitizeMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス *
            </label>
            <SanitizedInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              required
              sanitizeMode={sanitizeMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 数値入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            数値入力（テスト用）
          </label>
          <SanitizedInput
            type="text"
            name="numberInput"
            value={formData.numberInput}
            onChange={handleInputChange}
            placeholder="数値のみ入力可能"
            sanitizeMode={sanitizeMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* メッセージ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メッセージ *
          </label>
          <SanitizedTextarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="メッセージを入力してください..."
            rows="4"
            required
            sanitizeMode={sanitizeMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* HTMLコンテンツテスト */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTMLコンテンツテスト（危険なコードを含む）
          </label>
          <SanitizedTextarea
            name="htmlContent"
            value={formData.htmlContent}
            onChange={handleInputChange}
            placeholder="<script>alert('危険')</script> や <img src=x onerror=alert('XSS')> などを入力してテスト"
            rows="3"
            sanitizeMode={sanitizeMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            送信
          </button>
        </div>
      </form>

      {/* 現在のデータ表示 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">現在のフォームデータ</h3>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      {/* テスト用の危険なコード例 */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-3">テスト用の危険なコード例</h3>
        <p className="text-sm text-red-700 mb-2">以下のコードをコピーして入力フィールドに貼り付けてテストしてください：</p>
        <div className="space-y-2">
          <code className="block text-xs bg-red-100 p-2 rounded">
            &lt;script&gt;alert('XSS攻撃')&lt;/script&gt;
          </code>
          <code className="block text-xs bg-red-100 p-2 rounded">
            &lt;img src=x onerror=alert('XSS')&gt;
          </code>
          <code className="block text-xs bg-red-100 p-2 rounded">
            javascript:alert('危険なプロトコル')
          </code>
          <code className="block text-xs bg-red-100 p-2 rounded">
            &lt;div onclick="alert('イベントハンドラー')"&gt;クリックしてください&lt;/div&gt;
          </code>
        </div>
      </div>
    </div>
  );
};

export default SanitizeExample; 
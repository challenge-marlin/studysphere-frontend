import React, { useState, useEffect, useRef } from 'react';
import SanitizedInput from '../SanitizedInput';
import { SANITIZE_OPTIONS } from '../../utils/sanitizeUtils';
import { convertMarkdownToHTML } from '../../utils/markdownUtils';

const ChatSection = ({
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  currentLessonData,
  currentSectionText, // 現在のセクションのテキスト内容
  isAILoading, // AI応答の読み込み状態
  isAIEnabled = true, // AI機能が有効かどうか
  aiStatus = null // { type: 'loading' | 'error', message: string }
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  // 新しいメッセージが追加された際に自動スクロール
  useEffect(() => {
    if (chatContainerRef.current && chatMessages.length > 0) {
      // flex-col-reverseを使用しているため、スクロール位置を0に設定
      chatContainerRef.current.scrollTop = 0;
    }
  }, [chatMessages]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="text-xl font-bold text-gray-800">AIアシスタント</h3>
        {!isAIEnabled && (
          <span
            className={`px-2 py-1 text-xs rounded-full border ${
              aiStatus?.type === 'error'
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}
          >
            {aiStatus?.type === 'error' ? '利用不可' : '準備中'}
          </span>
        )}
      </div>
      
      {/* AI機能の状態表示 */}
      {!isAIEnabled && aiStatus && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            aiStatus.type === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm ${
              aiStatus.type === 'error' ? 'text-red-700' : 'text-yellow-700'
            }`}
          >
            {aiStatus.type === 'error' ? (
              <span className="text-red-500">⚠️</span>
            ) : (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
            )}
            <span>{aiStatus.message}</span>
          </div>
        </div>
      )}
      
      {/* チャットメッセージ表示エリア */}
      <div ref={chatContainerRef} className="h-64 overflow-y-auto mb-4 space-y-3 custom-scrollbar flex flex-col-reverse">
        {/* AI入力中インジケーター */}
        {isAILoading && (
          <div className="flex justify-start">
            <div className="bg-green-100 text-gray-800 border border-green-200 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">AIが回答を生成中...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* チャットメッセージ（逆順で表示） */}
        {chatMessages.slice().reverse().map(message => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${message.sender === 'user' 
              ? 'max-w-xs bg-blue-500 text-white' 
              : message.sender === 'ai'
              ? 'max-w-md bg-green-100 text-gray-800 border border-green-200'
              : 'max-w-xs bg-gray-100 text-gray-800'
            } px-4 py-2 rounded-lg`}>
              {message.sender === 'ai' ? (
                <div 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: convertMarkdownToHTML(message.text) 
                  }}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              )}
              <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* チャット入力フォーム */}
      <div className="space-y-3">
        <SanitizedInput
          type="text"
          value={chatInput}
          onChange={onChatInputChange}
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          placeholder={
            isAIEnabled
              ? "学習内容について質問してください..."
              : aiStatus?.message || "AI機能の準備が完了するまでお待ちください..."
          }
          sanitizeMode={SANITIZE_OPTIONS.FULL}
          debounceMs={300}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
            isAIEnabled 
              ? 'border-gray-300 focus:ring-green-500' 
              : 'border-gray-200 bg-gray-50 text-gray-500'
          }`}
          disabled={isAILoading || !isAIEnabled}
        />
        <div className="flex justify-center">
          <button 
            onClick={onSendMessage}
            disabled={isAILoading || !chatInput.trim() || !isAIEnabled}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              isAIEnabled
                ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAILoading
              ? '送信中...'
              : !isAIEnabled
              ? aiStatus?.type === 'error'
                ? '利用不可'
                : '準備中...'
              : '送信'}
          </button>
        </div>
      </div>
      
      {/* AI機能の説明 */}
      {isAIEnabled && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-xs">
            💡 AIアシスタントが利用可能です。学習内容について質問してください。
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatSection;

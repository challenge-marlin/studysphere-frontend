import React, { useState, useEffect } from 'react';

const StudentVoiceCareView = ({ studentId, studentName }) => {
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [newPrivateMessage, setNewPrivateMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  useEffect(() => {
    // アナウンスメッセージと1対1メッセージを統合して取得
    loadVoiceMessages();
  }, [studentId]);

  const loadVoiceMessages = () => {
    // アナウンスメッセージの取得（モックデータ）
    const announcements = [
      {
        id: 'announce_1',
        type: 'announcement',
        title: '明日の授業について',
        message: '明日の授業は10:00開始です。資料の準備をお願いします。',
        sentDate: '2024-01-15 14:30',
        instructorName: '山田 指導員',
        hasReplied: true,
        myReply: '承知いたしました。',
        replyDate: '2024-01-15 15:00'
      },
      {
        id: 'announce_2',
        type: 'announcement',
        title: 'テスト範囲について',
        message: '来週のテストの範囲について質問がある方は個別にご相談ください。',
        sentDate: '2024-01-14 11:20',
        instructorName: '田中 指導員',
        hasReplied: false,
        myReply: '',
        replyDate: ''
      }
    ];

    // 1対1メッセージの取得（モックデータ）
    const privateMessages = [
      {
        id: 'private_1',
        type: 'private',
        title: '学習進捗について',
        message: '最近の学習進捗が良好ですね。この調子で頑張ってください！',
        sentDate: '2024-01-15 10:30',
        instructorName: '山田 指導員',
        hasReplied: true,
        myReply: 'ありがとうございます！頑張ります。',
        replyDate: '2024-01-15 11:00',
        canReply: false
      },
      {
        id: 'private_2',
        type: 'private',
        title: '課題について',
        message: '課題の提出期限を延長しました。無理をせず、丁寧に取り組んでください。',
        sentDate: '2024-01-14 16:45',
        instructorName: '田中 指導員',
        hasReplied: false,
        myReply: '',
        replyDate: '',
        canReply: true
      }
    ];

    // 送信日時順にソート（新しい順）
    const allMessages = [...announcements, ...privateMessages].sort((a, b) => 
      new Date(b.sentDate) - new Date(a.sentDate)
    );

    setVoiceMessages(allMessages);
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const sendReply = () => {
    if (replyMessage.trim() && selectedMessage) {
      const updatedMessages = voiceMessages.map(msg => {
        if (msg.id === selectedMessage.id) {
          return {
            ...msg,
            hasReplied: true,
            myReply: replyMessage,
            replyDate: new Date().toLocaleString('ja-JP'),
            canReply: msg.type === 'announcement' // アナウンスは常に返信可能、1対1は1回のみ
          };
        }
        return msg;
      });
      setVoiceMessages(updatedMessages);
      setReplyMessage('');
      setShowMessageModal(false);
    }
  };

  const sendNewPrivateMessage = () => {
    if (newPrivateMessage.trim()) {
      const newMsg = {
        id: `private_${Date.now()}`,
        type: 'private',
        title: '利用者からのメッセージ',
        message: newPrivateMessage,
        sentDate: new Date().toLocaleString('ja-JP'),
        instructorName: '送信先: 担当指導員',
        hasReplied: false,
        myReply: '',
        replyDate: '',
        canReply: false,
        fromStudent: true
      };
      setVoiceMessages([newMsg, ...voiceMessages]);
      setNewPrivateMessage('');
      setShowNewMessageModal(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            💬 指導員からの声かけ
          </h3>
          <p className="text-gray-600">指導員からのメッセージを確認できます</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            ✉️ 指導員に相談
          </button>
          <a
            href="https://discord.gg/9N5wpBUmDQ"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord で相談
          </a>
        </div>
      </div>

      {/* Discordサポート説明 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <div className="flex items-start gap-3">
          <span className="text-indigo-600 text-lg flex-shrink-0">💡</span>
          <div>
            <h4 className="font-semibold text-indigo-800 mb-2">外部専門サポートについて</h4>
            <p className="text-indigo-700 text-sm leading-relaxed">
              学習でわからないことがあれば、まず<strong>AI機能</strong>にご質問ください。
              AI で解決できない場合は<strong>担当指導員</strong>にご相談いただけます。
              さらに、指導員だけでは対応が難しい専門的な内容については、
              <strong>Discordサーバー</strong>で外部の専門指導員に直接質問することができます。
            </p>
            <div className="mt-2 text-xs text-indigo-600 bg-white bg-opacity-50 rounded px-2 py-1 inline-block">
              AI → 担当指導員 → 外部専門指導員 の順でサポートを受けられます
            </div>
          </div>
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {voiceMessages.length > 0 ? (
          voiceMessages.map(message => (
            <div key={message.id} className={`rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${
              message.type === 'announcement' 
                ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' 
                : message.fromStudent
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      message.type === 'announcement'
                        ? 'bg-blue-200 text-blue-800'
                        : message.fromStudent
                        ? 'bg-green-200 text-green-800'
                        : 'bg-purple-200 text-purple-800'
                    }`}>
                      {message.type === 'announcement' ? '📢 アナウンス' : 
                       message.fromStudent ? '📤 送信済み' : '💬 個人メッセージ'}
                    </span>
                    {message.hasReplied && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                        ✅ 返信済み
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{message.title}</h4>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">{message.message}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <div>{message.instructorName}</div>
                  <div>{message.sentDate}</div>
                </div>
                <button
                  onClick={() => openMessageModal(message)}
                  className={`px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                    message.type === 'announcement'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      : message.fromStudent
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                  }`}
                >
                  詳細を見る
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>メッセージはありません</p>
          </div>
        )}
      </div>

      {/* メッセージ詳細モーダル */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedMessage.title}</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800 mb-2">{selectedMessage.message}</p>
              <div className="text-sm text-gray-600">
                <div>送信者: {selectedMessage.instructorName}</div>
                <div>送信日時: {selectedMessage.sentDate}</div>
              </div>
            </div>

            {/* 自分の返信表示 */}
            {selectedMessage.hasReplied && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-blue-700">あなたの返信</span>
                  <span className="text-xs text-gray-500">{selectedMessage.replyDate}</span>
                </div>
                <p className="text-gray-800 text-sm">{selectedMessage.myReply}</p>
              </div>
            )}

            {/* 返信エリア */}
            {!selectedMessage.hasReplied && !selectedMessage.fromStudent && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">返信する:</label>
                <div className="flex gap-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="返信を入力..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={sendReply}
                    disabled={!replyMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors self-end"
                  >
                    返信
                  </button>
                </div>
              </div>
            )}

            {selectedMessage.fromStudent && (
              <div className="border-t pt-4 text-center text-gray-500 text-sm">
                送信したメッセージです。指導員からの返信をお待ちしています。
              </div>
            )}
          </div>
        </div>
      )}

      {/* 新規メッセージモーダル */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">指導員に相談</h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">相談内容:</label>
              <textarea
                value={newPrivateMessage}
                onChange={(e) => setNewPrivateMessage(e.target.value)}
                placeholder="相談したいことを入力してください..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={sendNewPrivateMessage}
                disabled={!newPrivateMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentVoiceCareView; 
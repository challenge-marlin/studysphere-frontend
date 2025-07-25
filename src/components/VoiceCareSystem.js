import React, { useState } from 'react';

const VoiceCareSystem = ({ instructorId }) => {
  // アナウンスメッセージの状態管理
  const [announcements, setAnnouncements] = useState([]);

  // コンポーネントマウント時にローカルストレージからアナウンスを読み込み
  React.useEffect(() => {
    const storedAnnouncements = localStorage.getItem('voiceCareAnnouncements');
    if (storedAnnouncements) {
      setAnnouncements(JSON.parse(storedAnnouncements));
    } else {
      // デフォルトのアナウンスメッセージ
      const defaultAnnouncements = [
        {
          id: 1,
          message: "明日の授業は10:00開始です。資料の準備をお願いします。",
          sentDate: "2024-01-15 14:30",
          recipients: ['鈴木太郎', '田中花子', '山田次郎', '佐藤美香'],
          replies: [
            { studentName: '鈴木太郎', message: "承知いたしました。", time: "2024-01-15 15:00" },
            { studentName: '田中花子', message: "資料の準備完了しています。", time: "2024-01-15 16:15" }
          ]
        },
        {
          id: 2,
          message: "来週のテストの範囲について質問がある方は個別にご相談ください。",
          sentDate: "2024-01-14 11:20",
          recipients: ['鈴木太郎', '田中花子', '山田次郎'],
          replies: [
            { studentName: '山田次郎', message: "Excel の関数について質問があります。", time: "2024-01-14 13:45" }
          ]
        }
      ];
      setAnnouncements(defaultAnnouncements);
      localStorage.setItem('voiceCareAnnouncements', JSON.stringify(defaultAnnouncements));
    }
  }, []);

  // 1対1メッセージのモックデータ
  const [privateMessages, setPrivateMessages] = useState([
    {
      id: 1,
      studentName: '鈴木太郎',
      lastMessage: "課題の提出期限について相談があります。",
      lastMessageTime: "2024-01-15 16:45",
      isFromStudent: true,
      hasReply: false,
      conversation: [
        { sender: 'student', message: "課題の提出期限について相談があります。", time: "2024-01-15 16:45", canEdit: true }
      ]
    },
    {
      id: 2,
      studentName: '田中花子',
      lastMessage: "明日の授業、頑張ってください！",
      lastMessageTime: "2024-01-15 10:30",
      isFromStudent: false,
      hasReply: true,
      conversation: [
        { sender: 'instructor', message: "明日の授業、頑張ってください！", time: "2024-01-15 10:30", canEdit: true },
        { sender: 'student', message: "ありがとうございます！準備して臨みます。", time: "2024-01-15 11:00", canEdit: false }
      ]
    }
  ]);

  // モーダル状態管理
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedPrivateMessage, setSelectedPrivateMessage] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPrivateMessageModal, setShowPrivateMessageModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // 新規メッセージ作成状態
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [newPrivateMessage, setNewPrivateMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  // 利用者リスト（モック）
  const students = ['鈴木太郎', '田中花子', '山田次郎', '佐藤美香', '高橋一郎'];

  // アナウンス詳細モーダルを開く
  const openAnnouncementModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  // 1対1メッセージモーダルを開く
  const openPrivateMessageModal = (message) => {
    setSelectedPrivateMessage(message);
    setShowPrivateMessageModal(true);
  };

  // アナウンス送信
  const sendAnnouncement = () => {
    if (newAnnouncement.trim() && selectedRecipients.length > 0) {
      const newMsg = {
        id: Date.now(),
        message: newAnnouncement,
        sentDate: new Date().toLocaleString('ja-JP'),
        recipients: [...selectedRecipients],
        replies: []
      };
      const updatedAnnouncements = [newMsg, ...announcements];
      setAnnouncements(updatedAnnouncements);
      localStorage.setItem('voiceCareAnnouncements', JSON.stringify(updatedAnnouncements));
      setNewAnnouncement('');
      setSelectedRecipients([]);
    }
  };

  // 1対1メッセージ送信
  const sendPrivateMessage = () => {
    if (newPrivateMessage.trim() && selectedStudent) {
      const newMsg = {
        id: privateMessages.length + 1,
        studentName: selectedStudent,
        lastMessage: newPrivateMessage,
        lastMessageTime: new Date().toLocaleString('ja-JP'),
        isFromStudent: false,
        hasReply: false,
        conversation: [
          { sender: 'instructor', message: newPrivateMessage, time: new Date().toLocaleString('ja-JP'), canEdit: true }
        ]
      };
      setPrivateMessages([newMsg, ...privateMessages]);
      setNewPrivateMessage('');
      setSelectedStudent('');
    }
  };

  // 返信送信
  const sendReply = (messageId) => {
    if (replyMessage.trim()) {
      const updatedMessages = privateMessages.map(msg => {
        if (msg.id === messageId) {
          const newConversation = [...msg.conversation, {
            sender: 'instructor',
            message: replyMessage,
            time: new Date().toLocaleString('ja-JP'),
            canEdit: true
          }];
          return {
            ...msg,
            hasReply: true,
            lastMessage: replyMessage,
            lastMessageTime: new Date().toLocaleString('ja-JP'),
            isFromStudent: false,
            conversation: newConversation
          };
        }
        return msg;
      });
      setPrivateMessages(updatedMessages);
      setReplyMessage('');
      setShowPrivateMessageModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      {/* ヘッダー部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              💬 声かけ・メッセージ管理
            </h2>
            <p className="text-lg text-gray-600">利用者とのコミュニケーションを管理できます</p>
          </div>
          <div className="flex gap-3">
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
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-blue-600 text-lg">💡</span>
            <h3 className="font-semibold text-blue-800">外部サポートについて</h3>
          </div>
          <p className="text-blue-700 text-sm">
            画面共有やAI以外の技術的な質問については、Discordサーバーで直接サポートを受けることができます。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アナウンスメッセージ（左カラム） */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            📢 アナウンスメッセージ
          </h3>
          
          {/* 新規アナウンス作成 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 mb-6 border border-blue-200">
            <textarea
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="複数の利用者に向けたアナウンスメッセージを入力..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">送信先選択:</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {students.map(student => (
                  <label key={student} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(student)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRecipients([...selectedRecipients, student]);
                        } else {
                          setSelectedRecipients(selectedRecipients.filter(s => s !== student));
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{student}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={sendAnnouncement}
              disabled={!newAnnouncement.trim() || selectedRecipients.length === 0}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              📤 送信
            </button>
          </div>

          {/* アナウンス一覧 */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {announcements.map(announcement => (
              <div key={announcement.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                <p className="text-gray-800 mb-2">{announcement.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>{announcement.sentDate}</span>
                  <span>{announcement.recipients.length}名に送信</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">
                    {announcement.replies.length}件の返信
                  </span>
                  <button
                    onClick={() => openAnnouncementModal(announcement)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    詳細を見る
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1対1メッセージ（右カラム） */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            💬 1対1メッセージ
          </h3>

          {/* 新規1対1メッセージ作成 */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 mb-6 border border-green-200">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">利用者を選択...</option>
              {students.map(student => (
                <option key={student} value={student}>{student}</option>
              ))}
            </select>
            
            <textarea
              value={newPrivateMessage}
              onChange={(e) => setNewPrivateMessage(e.target.value)}
              placeholder="個人メッセージを入力..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <button
              onClick={sendPrivateMessage}
              disabled={!newPrivateMessage.trim() || !selectedStudent}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-3"
            >
              📤 送信
            </button>
          </div>

          {/* 1対1メッセージ一覧 */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {privateMessages.map(message => (
              <div key={message.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-green-700">{message.studentName}</h4>
                  <span className="text-xs text-gray-500">{message.lastMessageTime}</span>
                </div>
                <p className="text-gray-800 text-sm mb-2 line-clamp-2">{message.lastMessage}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${message.isFromStudent ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {message.isFromStudent ? '利用者→' : '指導員→'}
                    </span>
                    {message.hasReply && (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">返信済み</span>
                    )}
                  </div>
                  <button
                    onClick={() => openPrivateMessageModal(message)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    会話を見る
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* アナウンス詳細モーダル */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">アナウンス詳細</h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-800 mb-2">{selectedAnnouncement.message}</p>
              <p className="text-sm text-gray-600">送信日時: {selectedAnnouncement.sentDate}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">送信先 ({selectedAnnouncement.recipients.length}名)</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAnnouncement.recipients.map(recipient => (
                  <span key={recipient} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {recipient}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">返信 ({selectedAnnouncement.replies.length}件)</h4>
              {selectedAnnouncement.replies.length > 0 ? (
                <div className="space-y-3">
                  {selectedAnnouncement.replies.map((reply, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-green-700">{reply.studentName}</span>
                        <span className="text-xs text-gray-500">{reply.time}</span>
                      </div>
                      <p className="text-gray-800 text-sm">{reply.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">まだ返信はありません</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1対1メッセージ詳細モーダル */}
      {showPrivateMessageModal && selectedPrivateMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedPrivateMessage.studentName} との会話
              </h3>
              <button
                onClick={() => setShowPrivateMessageModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {selectedPrivateMessage.conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.sender === 'instructor' 
                      ? 'bg-blue-50 border-l-4 border-blue-500 ml-4' 
                      : 'bg-green-50 border-l-4 border-green-500 mr-4'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {msg.sender === 'instructor' ? '指導員' : selectedPrivateMessage.studentName}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-500">{msg.time}</span>
                      {msg.canEdit && (
                        <div className="flex gap-1">
                          <button className="text-blue-500 hover:text-blue-700 text-xs">編集</button>
                          <button className="text-red-500 hover:text-red-700 text-xs">削除</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-800 text-sm">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* 返信エリア */}
            {!selectedPrivateMessage.hasReply && (
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="返信を入力..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => sendReply(selectedPrivateMessage.id)}
                    disabled={!replyMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors self-end"
                  >
                    返信
                  </button>
                </div>
              </div>
            )}
            
            {selectedPrivateMessage.hasReply && (
              <div className="border-t pt-4 text-center text-gray-500 text-sm">
                この会話は既に完了しています（1送信1返信制限）
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCareSystem; 
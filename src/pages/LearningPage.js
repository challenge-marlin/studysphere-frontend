import React, { useState, useRef, useEffect } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LessonVideoPlayer from '../components/LessonVideoPlayer';
import LessonPdfViewer from '../components/LessonPdfViewer';

// eslint-disable-next-line no-unused-vars

const LearningPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  // const [numPages, setNumPages] = useState(null);
  // const [pageNumber, setPageNumber] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // YouTube動画IDを抽出する関数
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  };

  // URLパラメータからレッスン番号を取得
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      const lessonNumber = parseInt(lessonParam);
      if (lessonNumber >= 1 && lessonNumber <= 6) {
        setCurrentLesson(lessonNumber);
        setVideoLoading(true);
        setVideoError(false);
      }
    }
  }, [searchParams]);

  // レッスンデータ（動画URLとPDFファイルの対応）
  const lessonData = {
    1: {
      title: "第1回　Windows11の基本操作とソフトウェアの活用",
      videoUrl: "https://www.youtube.com/watch?v=j4yNkF1w6L8",
      pdfFile: "/reactStudySphereMockup/doc/pdf-samples/lesson1.pdf"
    },
    2: {
      title: "第2回　インターネットの基礎と安全な利用",
      videoUrl: "https://www.youtube.com/watch?v=AtDQST1SQ5A",
      pdfFile: "/reactStudySphereMockup/doc/pdf-samples/lesson2.pdf"
    },
    3: {
      title: "第3回　AIの仕組みや基本用語を学ぶ",
      videoUrl: "https://www.youtube.com/watch?v=QkJCPOWwdwI",
      pdfFile: "/reactStudySphereMockup/doc/pdf-samples/lesson3.pdf"
    },
    4: {
      title: "第4回　AIの活用例と実践体験",
      videoUrl: "https://www.youtube.com/watch?v=75UHkx4WZh0",
      pdfFile: "/reactStudySphereMockup/doc/pdf-samples/lesson4.pdf"
    },
    5: {
      title: "第5回　簡単なプログラミングとAIアシスタント活用",
      videoUrl: "https://www.youtube.com/watch?v=vQqMk3gFZJ0",
      pdfFile: "/reactStudySphereMockup/doc/pdf-samples/lesson5.pdf"
    },
    6: {
      title: "第6回　AIの活用例と実践体験",
      videoUrl: "",
      pdfFile: "/reactStudySphereMockup/doc/pdf-samples/lesson6.pdf"
    }
  };

  const currentLessonData = lessonData[currentLesson];

  // PDF読み込み完了時の処理（一時的に無効化）
  // const onDocumentLoadSuccess = ({ numPages }) => {
  //   setNumPages(numPages);
  //   setPageNumber(1);
  // };

  // チャットメッセージ送信
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now(),
        text: chatInput,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');

      // AIの応答をシミュレート
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: `「${currentLessonData.title}」についてのご質問ですね。どのような点でお困りでしょうか？`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  // レッスン切り替え
  const changeLesson = (lessonNumber) => {
    setCurrentLesson(lessonNumber);
    // setPageNumber(1);
    setChatMessages([]);
    setVideoLoading(true);
    setVideoError(false);
  };

  // 成果物アップロード処理
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toLocaleString(),
      status: 'uploaded'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setShowUploadModal(false);
    
    // 成功メッセージを表示
    alert(`${files.length}個のファイルがアップロードされました！`);
  };

  // ファイル削除処理
  const handleFileDelete = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={() => navigate('/student/dashboard')}
              >
                ← ダッシュボードに戻る
              </button>
              <h1 className="text-2xl font-bold">学習画面 - {currentLessonData.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">レッスン選択: </label>
                <select 
                  value={currentLesson} 
                  onChange={(e) => changeLesson(parseInt(e.target.value))}
                  className="px-3 py-1 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  {Object.keys(lessonData).map(lessonNum => (
                    <option key={lessonNum} value={lessonNum} className="text-gray-800">
                      {lessonData[lessonNum].title}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => setShowUploadModal(true)}
              >
                📁 成果物アップロード
              </button>
              <button 
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => navigate(`/student/test?lesson=${currentLesson}`)}
              >
                📝 学習効果テスト
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 動画 + PDF */}
          <div className="lg:col-span-2 space-y-6">
            {/* 上: 動画 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎥</span>
                <h3 className="text-xl font-bold text-gray-800">動画学習</h3>
              </div>
              {currentLessonData.videoUrl ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-800 mb-1">{currentLessonData.title}</p>
                    <p className="text-sm text-blue-600">URL: {currentLessonData.videoUrl}</p>
                  </div>
                  <LessonVideoPlayer videoUrl={currentLessonData.videoUrl} title={currentLessonData.title} />
                </>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>このレッスンには動画がありません。</p>
                </div>
              )}
            </div>

            {/* 下: PDF */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📄</span>
                <h3 className="text-xl font-bold text-gray-800">教材PDF</h3>
              </div>
              <LessonPdfViewer pdfUrl={currentLessonData.pdfFile} title={currentLessonData.title} />
            </div>
          </div>

          {/* 右カラム: チャット + アップロード */}
          <div className="space-y-6">
            {/* チャット */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💬</span>
                <h3 className="text-xl font-bold text-gray-800">AIアシスタント</h3>
              </div>
              <div className="h-64 overflow-y-auto mb-4 space-y-3">
                {chatMessages.map(message => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="質問を入力..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  送信
                </button>
              </div>
            </div>

            {/* アップロード済みファイル */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📁</span>
                <h3 className="text-xl font-bold text-gray-800">アップロード済みファイル</h3>
              </div>
              <div className="space-y-3">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.uploadDate}</p>
                    </div>
                    <button 
                      onClick={() => handleFileDelete(file.id)}
                      className="ml-2 px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {uploadedFiles.length === 0 && (
                  <p className="text-gray-500 text-center py-4">アップロードされたファイルはありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* アップロードモーダル */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">成果物アップロード</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowUploadModal(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ファイルを選択してください
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowUploadModal(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPage; 
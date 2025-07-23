import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LessonVideoPlayer from '../components/LessonVideoPlayer';

const EnhancedLearningPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(true);
  const [textScrollPosition, setTextScrollPosition] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const textContainerRef = useRef(null);



  // URLパラメータからレッスン番号を取得
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      const lessonNumber = parseInt(lessonParam);
      if (lessonNumber >= 1 && lessonNumber <= 6) {
        setCurrentLesson(lessonNumber);
        setTextLoading(true);
      }
    }
  }, [searchParams]);

  // レッスンデータ（動画URLとテキストファイルの対応）
  const lessonData = {
    1: {
      title: "第1回　Windows11の基本操作とソフトウェアの活用",
      videoUrl: "https://www.youtube.com/watch?v=j4yNkF1w6L8",
      textFile: "/reactStudySphereMockup/doc/text-samples/lesson1.md",
      description: "コンピュータの基本構造とWindows 11の操作方法を学びます"
    },
    2: {
      title: "第2回　インターネットの基礎と安全な利用",
      videoUrl: "https://www.youtube.com/watch?v=AtDQST1SQ5A",
      textFile: "/reactStudySphereMockup/doc/text-samples/lesson1.md",
      description: "インターネットの仕組みと安全な利用方法を学びます"
    },
    3: {
      title: "第3回　AIの仕組みや基本用語を学ぶ",
      videoUrl: "https://www.youtube.com/watch?v=QkJCPOWwdwI",
      textFile: "/reactStudySphereMockup/doc/text-samples/lesson1.md",
      description: "AIの基本概念と用語について理解を深めます"
    },
    4: {
      title: "第4回　AIの活用例と実践体験",
      videoUrl: "https://www.youtube.com/watch?v=75UHkx4WZh0",
      textFile: "/reactStudySphereMockup/doc/text-samples/lesson1.md",
      description: "実際のAI活用事例を体験します"
    },
    5: {
      title: "第5回　簡単なプログラミングとAIアシスタント活用",
      videoUrl: "https://www.youtube.com/watch?v=vQqMk3gFZJ0",
      textFile: "/reactStudySphereMockup/doc/text-samples/lesson1.md",
      description: "プログラミングの基礎とAIアシスタントの活用方法を学びます"
    },
    6: {
      title: "第6回　AIの活用例と実践体験",
      videoUrl: "",
      textFile: "/reactStudySphereMockup/doc/text-samples/lesson1.md",
      description: "総合的なAI活用の実践演習を行います"
    }
  };

  const currentLessonData = lessonData[currentLesson];

  // テキストファイルを読み込む
  useEffect(() => {
    const loadTextContent = async () => {
      try {
        setTextLoading(true);
        const response = await fetch(currentLessonData.textFile);
        if (response.ok) {
          const content = await response.text();
          setTextContent(content);
        } else {
          setTextContent('テキストファイルの読み込みに失敗しました。');
        }
      } catch (error) {
        console.error('テキストファイル読み込みエラー:', error);
        setTextContent('テキストファイルの読み込みに失敗しました。');
      } finally {
        setTextLoading(false);
      }
    };

    loadTextContent();
  }, [currentLessonData.textFile]);

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
    setChatMessages([]);
    setTextLoading(true);
    setTextScrollPosition(0);
  };

  // MarkdownをHTMLに変換して表示する関数 - react-markdownを使用
  const renderMarkdown = (markdown) => {
    // 見出しのIDを生成する関数
    const generateId = (text) => {
      if (!text) return '';
      
      const textStr = text.toString();
      
      // Markdownの {#id} 形式をチェック
      const idMatch = textStr.match(/\{#([^}]+)\}$/);
      if (idMatch) {
        return idMatch[1];
      }
      
      // 日本語の見出しを英数字に変換するマッピング
      const japaneseToEnglish = {
        '第1章': 'chapter-1',
        '第2章': 'chapter-2', 
        '第3章': 'chapter-3',
        '第4章': 'chapter-4',
        '第5章': 'chapter-5',
        'コンピュータの基本構造と役割': 'computer-basics',
        'Windows 11の基本操作': 'windows-11-basics',
        'ソフトウェアの基本操作': 'software-basics',
        '外付けハードウェアデバイスの使用方法': 'external-devices',
        'Q&Aセッション': 'qa-session',
        'はじめに': 'introduction',
        'まとめ': 'summary',
        '総論': 'conclusion'
      };
      
      // マッピングに一致する場合は変換
      for (const [japanese, english] of Object.entries(japaneseToEnglish)) {
        if (textStr.includes(japanese)) {
          return english;
        }
      }
      
      // マッピングにない場合は、英数字のみを抽出してIDを生成
      return textStr
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 特殊文字を削除
        .replace(/\s+/g, '-') // スペースをハイフンに変換
        .replace(/-+/g, '-') // 連続するハイフンを1つに
        .replace(/^-|-$/g, '') // 先頭と末尾のハイフンを削除
        .replace(/[^\w-]/g, '') // 英数字とハイフン以外を削除
        || 'section-' + Math.random().toString(36).substr(2, 9); // フォールバック
    };

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => {
            const id = generateId(children);
            return (
              <h1 
                id={id} 
                className="text-3xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b-2 border-blue-200 scroll-mt-20"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const id = generateId(children);
            return (
              <h2 
                id={id} 
                className="text-2xl font-bold text-gray-700 mt-6 mb-3 pb-1 border-b border-blue-100 scroll-mt-16"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const id = generateId(children);
            return (
              <h3 
                id={id} 
                className="text-xl font-semibold text-gray-700 mt-4 mb-2 scroll-mt-12"
                {...props}
              >
                {children}
              </h3>
            );
          },
          p: ({ children, ...props }) => (
            <p className="text-gray-700 leading-relaxed mb-4" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="ml-4" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-4" {...props}>
              {children}
            </blockquote>
          ),
          code: ({ children, className, ...props }) => {
            if (className && className.startsWith('language-')) {
              return (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                  <code className={`${className} text-sm`} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-300" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-gray-300 px-4 py-2" {...props}>
              {children}
            </td>
          ),
          a: ({ children, href, ...props }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg shadow-md my-4" 
              {...props}
            />
          )
        }}
      >
        {markdown}
      </ReactMarkdown>
    );
  };

  // テキストスクロール位置を保存・復元
  const scrollToTextPosition = (position) => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = position;
    }
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
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={() => navigate('/student/dashboard')}
              >
                ← ダッシュボードに戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">改善版学習画面 - {currentLessonData.title}</h1>
                <span className="text-blue-100 text-sm">{currentLessonData.description}</span>
              </div>
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

      {/* メインコンテンツ - 3カラムレイアウト */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 動画 */}
          <div className="lg:col-span-1">
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
          </div>

          {/* 中央カラム: テキスト */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📄</span>
                <h3 className="text-xl font-bold text-gray-800">教材テキスト</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 h-[70vh] overflow-y-auto custom-scrollbar">
                {textLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">テキストを読み込み中...</p>
                  </div>
                ) : (
                  <div 
                    ref={textContainerRef}
                    className="prose prose-blue max-w-none"
                  >
                    {renderMarkdown(textContent)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右カラム: AIチャット */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💬</span>
                <h3 className="text-xl font-bold text-gray-800">AIアシスタント</h3>
              </div>
              <div className="h-64 overflow-y-auto mb-4 space-y-3 custom-scrollbar">
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
            <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
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

export default EnhancedLearningPage; 
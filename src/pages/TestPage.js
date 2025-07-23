import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URLパラメータからレッスン番号を取得
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      const lessonNumber = parseInt(lessonParam);
      if (lessonNumber >= 1 && lessonNumber <= 6) {
        setCurrentLesson(lessonNumber);
      }
    }
  }, [searchParams]);

  // レッスンデータ
  const lessonData = {
    1: {
      title: "第1回　Windows11の基本操作とソフトウェアの活用",
      description: "コンピュータの基本構造とWindows 11の操作方法を学びます"
    },
    2: {
      title: "第2回　インターネットの基礎と安全な利用",
      description: "インターネットの仕組みと安全な利用方法を学びます"
    },
    3: {
      title: "第3回　AIの仕組みや基本用語を学ぶ",
      description: "AIの基本概念と用語について理解を深めます"
    },
    4: {
      title: "第4回　AIの活用例と実践体験",
      description: "実際のAI活用事例を体験します"
    },
    5: {
      title: "第5回　簡単なプログラミングとAIアシスタント活用",
      description: "プログラミングの基礎とAIアシスタントの活用方法を学びます"
    },
    6: {
      title: "第6回　AIの活用例と実践体験",
      description: "総合的なAI活用の実践演習を行います"
    }
  };

  // サンプルテストデータ（AIが生成した問題）
  const sampleTestData = {
    title: `記述式理解度テスト\nカリキュラム1・第${currentLesson}回・第2章`,
    questions: [
      {
        id: 1,
        question: "ニューラルネットワークの基本的な構造について説明してください。",
        placeholder: "ニューラルネットワークの構造について説明してください..."
      },
      {
        id: 2,
        question: "活性化関数の役割とその種類について説明してください。",
        placeholder: "活性化関数の役割や種類について説明してください..."
      },
      {
        id: 3,
        question: "誤差逆伝播法（バックプロパゲーション）とは何か、説明してください。",
        placeholder: "誤差逆伝播法について説明してください..."
      },
      {
        id: 4,
        question: "過学習（オーバーフィッティング）とは何か、またそれを防ぐ方法について説明してください。",
        placeholder: "過学習の定義と防止策について説明してください..."
      },
      {
        id: 5,
        question: "畳み込みニューラルネットワーク（CNN）の基本的な仕組みについて説明してください。",
        placeholder: "CNNの基本的な仕組みについて説明してください..."
      },
      {
        id: 6,
        question: "自然言語処理における「ベクトル化」とは何か、説明してください。",
        placeholder: "ベクトル化について説明してください..."
      },
      {
        id: 7,
        question: "トランスフォーマー技術の特徴とその応用例について説明してください。",
        placeholder: "トランスフォーマー技術の特徴や応用例について説明してください..."
      },
      {
        id: 8,
        question: "ディープラーニングが従来の機械学習技術と比べて優れている点を説明してください。",
        placeholder: "ディープラーニングの特徴や利点について具体的に説明してください..."
      },
      {
        id: 9,
        question: "AIの画像認識技術が応用されている具体例を3つ挙げて説明してください。",
        placeholder: "画像認識技術の具体例を3つ挙げて説明してください..."
      },
      {
        id: 10,
        question: "AIと人間が協力し合うことで生まれる価値や可能性について、あなたの考えを述べてください。",
        placeholder: "AIと人間の協力についての考えを述べてください..."
      }
    ]
  };

  // テストデータを設定
  useEffect(() => {
    setTestData(sampleTestData);
  }, [currentLesson]);

  // 回答の更新
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // テスト提出
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // モックアップなので、少し待ってから結果画面に遷移
    setTimeout(() => {
      navigate('/student/test-result', {
        state: {
          lessonNumber: currentLesson,
          lessonTitle: lessonData[currentLesson].title,
          answers: answers,
          testData: testData
        }
      });
    }, 1500);
  };

  // 回答済みの問題数を計算
  const answeredCount = Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== '').length;

  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">テストを準備中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={() => navigate(-1)}
              >
                ← 学習画面に戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">学習効果テスト</h1>
                <span className="text-blue-100 text-sm">
                  {lessonData[currentLesson].title} - {lessonData[currentLesson].description}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium mb-2 block">
                回答済み: {answeredCount} / {testData.questions.length} 問
              </span>
              <div className="w-48 bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / testData.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* テスト内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 whitespace-pre-line">{testData.title}</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 テストの注意事項</h3>
              <ul className="text-left space-y-2 text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>各問題について、できるだけ詳しく回答してください</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>分からない場合は「分かりません」と記入してください</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>回答は自動保存されます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>すべての問題に回答してから「回答を提出」ボタンを押してください</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            {testData.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {question.id}
                  </span>
                  <span className="text-lg font-medium text-gray-800 leading-relaxed">{question.question}</span>
                </div>
                <div className="ml-12">
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="6"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    {answers[question.id] && answers[question.id].trim() !== '' ? (
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-sm">✓</span>
                        回答済み
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-500">
                        <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-sm">○</span>
                        未回答
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 提出ボタン */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-lg font-medium text-gray-700">
                  回答済み: <span className="text-blue-600 font-bold">{answeredCount}</span> / {testData.questions.length} 問
                </p>
                {answeredCount < testData.questions.length && (
                  <p className="text-orange-600 text-sm mt-1">
                    ⚠️ すべての問題に回答してから提出してください
                  </p>
                )}
              </div>
              <button
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  answeredCount === testData.questions.length && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleSubmit}
                disabled={answeredCount < testData.questions.length || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    採点中...
                  </div>
                ) : (
                  '📝 回答を提出'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 
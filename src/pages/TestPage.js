import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URLパラメータからレッスン番号を取得
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      const lessonNumber = parseInt(lessonParam);
      if (lessonNumber >= 1) {
        setCurrentLesson(lessonNumber);
      }
    }
  }, [searchParams]);

  // レッスンデータをAPIから取得
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const lessonId = currentLesson;
        
        const response = await fetch(`/api/learning/lesson/${lessonId}/content`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('レッスンデータの取得に失敗しました');
        }

        const data = await response.json();
        if (data.success) {
          setLessonData(data.data);
          // テストデータを生成（実際のシステムでは、テスト問題もDBから取得する）
          generateTestData(data.data);
        } else {
          throw new Error(data.message || 'レッスンデータの取得に失敗しました');
        }
      } catch (error) {
        console.error('レッスンデータ取得エラー:', error);
        setError(error.message);
        // フォールバック: モックデータを使用
        setLessonData({
          title: `第${currentLesson}回　学習内容`,
          description: 'レッスンの説明が読み込めませんでした。'
        });
        generateMockTestData();
      } finally {
        setLoading(false);
      }
    };

    if (currentLesson) {
      fetchLessonData();
    }
  }, [currentLesson]);

  // テストデータを生成（実際のシステムでは、テスト問題もDBから取得する）
  const generateTestData = (lesson) => {
    const mockTestData = {
      title: `${lesson.title} - 理解度テスト`,
      description: `${lesson.description}についての理解度を確認するテストです。`,
      questions: [
        {
          id: 1,
          question: `${lesson.title}の主要なポイントについて説明してください。`,
          placeholder: "学習した内容の要点をまとめて説明してください..."
        },
        {
          id: 2,
          question: "このレッスンで学んだ内容を実際の業務にどのように活かせますか？",
          placeholder: "具体的な活用方法や応用例について説明してください..."
        },
        {
          id: 3,
          question: "学習中に疑問に思った点や、さらに深く学びたい内容はありますか？",
          placeholder: "疑問点や興味のある内容について述べてください..."
        }
      ]
    };
    setTestData(mockTestData);
  };

  // モックテストデータ（フォールバック用）
  const generateMockTestData = () => {
    const mockTestData = {
      title: `第${currentLesson}回　理解度テスト`,
      description: "学習内容についての理解度を確認するテストです。",
      questions: [
        {
          id: 1,
          question: "このレッスンで学んだ内容の要点を説明してください。",
          placeholder: "学習した内容の要点をまとめて説明してください..."
        },
        {
          id: 2,
          question: "学習した内容を実際にどのように活用できますか？",
          placeholder: "具体的な活用方法について説明してください..."
        }
      ]
    };
    setTestData(mockTestData);
  };

  // 回答の更新
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // テスト提出
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const userId = localStorage.getItem('userId') || '1';
      const lessonId = currentLesson;
      
      // テスト結果を提出
      const response = await fetch('/api/learning/test/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          lessonId: parseInt(lessonId),
          answers: answers,
          score: 0, // 現在は採点機能なし
          totalQuestions: testData.questions.length
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // テスト結果画面に遷移
          navigate('/student/test-result', {
            state: {
              lessonNumber: currentLesson,
              lessonTitle: lessonData?.title || `第${currentLesson}回`,
              answers: answers,
              testData: testData
            }
          });
        } else {
          throw new Error(data.message || 'テスト結果の提出に失敗しました');
        }
      } else {
        throw new Error('テスト結果の提出に失敗しました');
      }
    } catch (error) {
      console.error('テスト提出エラー:', error);
      alert('テストの提出に失敗しました: ' + error.message);
      setIsSubmitting(false);
    }
  };

  // 回答済みの問題数を計算
  const answeredCount = Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== '').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">テストデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">テストデータが見つかりません</p>
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
                  {lessonData?.title} - {lessonData?.description}
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
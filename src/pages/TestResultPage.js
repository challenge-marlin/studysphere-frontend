import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TestResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultData, setResultData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // サンプル模範解答（実際のシステムでは、DBから取得する）
  const sampleAnswers = {
    1: "学習した内容の要点をまとめて説明してください。具体的なポイントや重要な概念について述べてください。",
    2: "実際の業務での活用方法について、具体的な例を挙げて説明してください。",
    3: "学習中に疑問に思った点や、さらに深く学びたい内容について述べてください。"
  };

  const sampleFeedback = {
    1: "基本的な理解はできていますが、より具体的な例を挙げると理解度が高まります。",
    2: "実践的な視点がよく表現されています。さらに具体的な応用例を考えてみましょう。",
    3: "学習意欲が感じられます。疑問点を解決することで、より深い理解につながります。"
  };

  useEffect(() => {
    if (location.state) {
      const { lessonNumber, lessonTitle, answers, testData } = location.state;
      
      // テスト結果データを生成
      const mockResult = {
        lessonNumber,
        lessonTitle,
        testData,
        answers,
        correctAnswers: 0,
        totalQuestions: testData.questions.length,
        score: 0,
        grade: "もう少し理解度を深めて再試験を行って下さい",
        gradeEmoji: "📘",
        results: []
      };

      // 各問題の結果を生成
      testData.questions.forEach(question => {
        const userAnswer = answers[question.id] || "利用者の回答";
        const correctAnswer = sampleAnswers[question.id] || "模範解答";
        const feedback = sampleFeedback[question.id] || "フィードバック";
        const isCorrect = false; // 現在は採点機能なし

        mockResult.results.push({
          questionId: question.id,
          question: question.question,
          userAnswer,
          correctAnswer,
          feedback,
          isCorrect,
          score: 0
        });
      });

      setResultData(mockResult);
      setLoading(false);
    } else {
      // データがない場合はダッシュボードに戻る
      navigate('/student/dashboard');
    }
  }, [location.state, navigate]);

  // テスト結果をDBに保存（必要に応じて）
  useEffect(() => {
    if (resultData) {
      const saveTestResult = async () => {
        try {
          const userId = localStorage.getItem('userId') || '1';
          const lessonId = resultData.lessonNumber;
          
          // テスト結果を保存（既にテスト提出時に保存済みの場合は不要）
          const response = await fetch('/api/learning/test/submit', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: parseInt(userId),
              lessonId: parseInt(lessonId),
              answers: resultData.answers,
              score: resultData.score,
              totalQuestions: resultData.totalQuestions
            })
          });

          if (response.ok) {
            console.log('テスト結果が保存されました');
          }
        } catch (error) {
          console.error('テスト結果保存エラー:', error);
          // エラーが発生しても結果表示は継続
        }
      };

      saveTestResult();
    }
  }, [resultData]);

  const handleRetakeTest = () => {
    navigate(`/student/test?lesson=${resultData.lessonNumber}`);
  };

  const handleGoToCertificate = () => {
    navigate('/student/certificate', {
      state: {
        lessonNumber: resultData.lessonNumber,
        lessonTitle: resultData.lessonTitle,
        score: resultData.score
      }
    });
  };

  const handleBackToDashboard = () => {
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">テスト結果を処理中...</p>
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
            onClick={() => navigate('/student/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">テスト結果が見つかりません</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 mt-4"
          >
            ダッシュボードに戻る
          </button>
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
                onClick={handleBackToDashboard}
              >
                ← ダッシュボードに戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">テスト結果</h1>
                <span className="text-blue-100 text-sm">{resultData.lessonTitle}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{resultData.gradeEmoji}</span>
                <span className="text-lg font-semibold">{resultData.grade}</span>
              </div>
              <div className="text-sm">
                正答数：{resultData.correctAnswers} / {resultData.totalQuestions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 結果詳細 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              出題範囲：カリキュラム1・第{resultData.lessonNumber}回・第2章
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{resultData.correctAnswers}</div>
                <div className="text-blue-800 font-medium">正答数</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-600 mb-2">{resultData.totalQuestions}</div>
                <div className="text-gray-800 font-medium">総問題数</div>
              </div>
              <div className="bg-cyan-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-cyan-600 mb-2">
                  {Math.round((resultData.correctAnswers / resultData.totalQuestions) * 100)}%
                </div>
                <div className="text-cyan-800 font-medium">正答率</div>
              </div>
            </div>
          </div>

          {/* 問題別結果 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">問題別結果</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {resultData.results.map((result, index) => (
                <button
                  key={result.questionId}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentQuestion === index
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                      : result.isCorrect
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  Q{result.questionId}
                </button>
              ))}
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              {resultData.results[currentQuestion] && (
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {resultData.results[currentQuestion].questionId}
                    </span>
                    <span className="text-lg font-medium text-gray-800 leading-relaxed">
                      {resultData.results[currentQuestion].question}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="font-semibold text-red-800 mb-3">あなたの解答</h4>
                      <div className="text-red-700 bg-white rounded-lg p-3 min-h-[100px]">
                        {resultData.results[currentQuestion].userAnswer || "回答がありません"}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-800 mb-3">模範解答</h4>
                      <div className="text-green-700 bg-white rounded-lg p-3 min-h-[100px]">
                        {resultData.results[currentQuestion].correctAnswer}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-yellow-600">💡</span>
                      <h4 className="font-semibold text-yellow-800">フィードバック</h4>
                    </div>
                    <p className="text-yellow-700">{resultData.results[currentQuestion].feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleRetakeTest}
          >
            🔄 再試験を受ける
          </button>
          <button
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleGoToCertificate}
          >
            🏆 修了証を確認
          </button>
          <button
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleBackToDashboard}
          >
            📊 ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage; 
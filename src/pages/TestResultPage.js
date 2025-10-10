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

  // 動的フィードバック生成関数
  const generateDynamicFeedback = async (question, userAnswerIndex, correctAnswerIndex) => {
    try {
      const userAnswer = question.options[userAnswerIndex];
      const correctAnswer = question.options[correctAnswerIndex];
      
      const response = await fetch('http://localhost:5050/api/learning/generate-feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          allOptions: question.options
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.feedback;
        }
      }
    } catch (error) {
      console.error('フィードバック生成エラー:', error);
    }
    
    // フォールバック: より詳細なデフォルトフィードバック
    const userAnswerText = question.options[userAnswerIndex];
    const correctAnswerText = question.options[correctAnswerIndex];
    
    const fallbackFeedbacks = [
      `残念ながら不正解でした。選択肢「${userAnswerText}」は正しくありません。正解は「${correctAnswerText}」です。\n\nこの問題では、学習内容の重要なポイントを理解することが求められています。正しい答えの理由を考えてみて、なぜ他の選択肢が間違っているのかも確認してみましょう。\n\n次回は必ず正解できるよう、学習内容を復習して理解を深めてください。頑張りましょう！`,
      `間違えてしまいましたね。あなたの回答「${userAnswerText}」は正解ではありません。正しい答えは「${correctAnswerText}」です。\n\nこの問題を通じて、学習した内容の理解度を確認できました。間違いは学習の機会です。正解の理由をしっかりと理解し、関連する知識も一緒に復習してみてください。\n\n継続的な学習で必ずスキルアップできます。応援しています！`,
      `正解ではありませんでした。選択肢「${userAnswerText}」ではなく、「${correctAnswerText}」が正解です。\n\nこの問題のポイントを再度確認してみてください。学習内容のどの部分が関連しているか、なぜその答えが正しいのかを考えてみましょう。\n\n間違いから学ぶことで、より深い理解が得られます。次回は正解できるよう、頑張ってください！`,
      `不正解でした。あなたの選択「${userAnswerText}」は正しくありません。正解は「${correctAnswerText}」です。\n\nこの問題は学習内容の重要な概念を問うています。正しい答えの理由を理解し、なぜ他の選択肢が適切でないのかも考えてみてください。\n\n学習は継続が大切です。この経験を活かして、より確実な知識を身につけていきましょう。`
    ];
    
    return fallbackFeedbacks[Math.floor(Math.random() * fallbackFeedbacks.length)];
  };

  useEffect(() => {
    const processTestResults = async () => {
      if (location.state) {
        // LessonListから渡されるテスト結果データの場合
        if (location.state.testResult) {
          const { testResult, lessonTitle, courseTitle } = location.state;
          console.log('TestResultPage: LessonListからのテスト結果データ:', testResult);
          
          // 実際のテスト結果詳細データを取得
          try {
            const response = await fetch(`/api/learning/test-results/${testResult.lessonId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            
            if (response.ok) {
              const detailedResult = await response.json();
              console.log('TestResultPage: 詳細テスト結果データ:', detailedResult);
              
              if (detailedResult.success && detailedResult.data) {
                const detailData = detailedResult.data;
                
                // 詳細データから問題別結果を生成
                const questionsToUse = detailData.shuffledQuestions || detailData.testData?.questions || [];
                const answers = detailData.answers || {};
                
                const results = [];
                for (let index = 0; index < questionsToUse.length; index++) {
                  const question = questionsToUse[index];
                  const userAnswerIndex = answers[question.id];
                  const userAnswer = userAnswerIndex !== undefined ? 
                    `${userAnswerIndex + 1}. ${question.options[userAnswerIndex]}` : 
                    "未回答";
                  const correctAnswer = `${question.correctAnswer + 1}. ${question.options[question.correctAnswer]}`;
                  const isCorrect = userAnswerIndex === question.correctAnswer;
                  
                  results.push({
                    questionId: index + 1,
                    question: question.question,
                    userAnswer,
                    correctAnswer,
                    feedback: isCorrect ? "正解です！よく理解できています。" : "不正解でした。",
                    isCorrect,
                    score: isCorrect ? 1 : 0
                  });
                }
                
                // スコアの整合性を確認
                const calculatedScore = results.filter(r => r.isCorrect).length;
                const finalScore = calculatedScore || testResult.score || 0;
                
                const result = {
                  testType: testResult.testType || 'lesson',
                  lessonId: testResult.lessonId || 0,
                  sectionIndex: testResult.sectionIndex || null,
                  lessonTitle: lessonTitle || 'レッスン名不明',
                  sectionTitle: testResult.sectionTitle || '',
                  score: finalScore,
                  correctAnswers: finalScore,
                  totalQuestions: testResult.totalQuestions || 0,
                  passed: testResult.passed || false,
                  percentage: testResult.totalQuestions > 0 ? Math.round((finalScore / testResult.totalQuestions) * 100) : 0,
                  grade: testResult.passed ? "合格" : "不合格",
                  gradeEmoji: testResult.passed ? "🎉" : "📘",
                  submittedAt: testResult.submittedAt || new Date().toISOString(),
                  testData: { questions: questionsToUse },
                  answers: answers,
                  results: results
                };
                
                setResultData(result);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('TestResultPage: 詳細テスト結果取得エラー:', error);
          }
          
          // フォールバック: 基本データのみで表示
          const result = {
            testType: testResult.testType || 'lesson',
            lessonId: testResult.lessonId || 0,
            sectionIndex: testResult.sectionIndex || null,
            lessonTitle: lessonTitle || 'レッスン名不明',
            sectionTitle: testResult.sectionTitle || '',
            score: testResult.score || 0,
            correctAnswers: testResult.score || 0,
            totalQuestions: testResult.totalQuestions || 0,
            passed: testResult.passed || false,
            percentage: testResult.totalQuestions > 0 ? Math.round((testResult.score / testResult.totalQuestions) * 100) : 0,
            grade: testResult.passed ? "合格" : "不合格",
            gradeEmoji: testResult.passed ? "🎉" : "📘",
            submittedAt: testResult.submittedAt || new Date().toISOString(),
            testData: { questions: [] },
            answers: {},
            results: []
          };
          
          setResultData(result);
          setLoading(false);
          return;
        }
        
        // 従来のテスト結果データの場合
        const { 
          testType, 
          lessonId, 
          sectionIndex, 
          lessonTitle, 
          sectionTitle, 
          answers, 
          testData, 
          shuffledQuestions,
          score, 
          totalQuestions,
          examResultId,
          s3Key
        } = location.state;
        
        console.log('TestResultPage: テスト完了直後のデータ:', {
          testType,
          lessonId,
          sectionIndex,
          lessonTitle,
          sectionTitle,
          hasAnswers: !!answers,
          answersCount: answers ? Object.keys(answers).length : 0,
          hasTestData: !!testData,
          testDataQuestionsCount: testData?.questions?.length || 0,
          hasShuffledQuestions: !!shuffledQuestions,
          shuffledQuestionsCount: shuffledQuestions?.length || 0,
          score,
          totalQuestions,
          examResultId,
          s3Key,
          locationState: location.state
        });
      
      // 正答数を計算（シャッフルされた問題データを使用して結果表示の整合性を保つ）
      const questionsToUse = shuffledQuestions && shuffledQuestions.length > 0 ? shuffledQuestions : testData.questions;
      const correctAnswers = score || 0;
      const total = totalQuestions || questionsToUse.length;
      const percentage = Math.round((correctAnswers / total) * 100);
      
      // 合格判定（レッスンテスト: 30問中29問以上、セクションテスト: 10問中9問以上）
      const passed = testType === 'lesson' 
        ? correctAnswers >= 29  // レッスンテスト: 30問中29問以上
        : correctAnswers >= (total - 1);  // セクションテスト: 全問正解または1問誤答まで
      
      // テスト結果データを生成
      const result = {
        testType,
        lessonId,
        sectionIndex,
        lessonTitle,
        sectionTitle,
        testData: {
          ...testData,
          questions: questionsToUse
        },
        answers,
        correctAnswers,
        totalQuestions: total,
        score: correctAnswers,
        percentage,
        passed,
        grade: passed ? "合格" : "不合格",
        gradeEmoji: passed ? "🎉" : "📘",
        examResultId,
        s3Key,
        results: []
      };

      // 各問題の結果を生成（シャッフルされた問題データを使用）
      console.log('TestResultPage: 問題別結果生成開始', {
        questionsCount: questionsToUse.length,
        answersCount: Object.keys(answers).length,
        answers: answers
      });
      
      for (let index = 0; index < questionsToUse.length; index++) {
        const question = questionsToUse[index];
        const userAnswerIndex = answers[question.id];
        const userAnswer = userAnswerIndex !== undefined ? 
          `${userAnswerIndex + 1}. ${question.options[userAnswerIndex]}` : 
          "未回答";
        const correctAnswer = `${question.correctAnswer + 1}. ${question.options[question.correctAnswer]}`;
        const isCorrect = userAnswerIndex === question.correctAnswer;
        
        console.log(`TestResultPage: 問題${index + 1} (ID: ${question.id})`, {
          userAnswerIndex,
          correctAnswerIndex: question.correctAnswer,
          isCorrect,
          userAnswer,
          correctAnswer
        });
        
        let feedback = "";
        if (isCorrect) {
          feedback = "正解です！よく理解できています。";
        } else if (userAnswerIndex !== undefined) {
          // 不正解の場合は動的フィードバックを生成
          feedback = await generateDynamicFeedback(question, userAnswerIndex, question.correctAnswer);
        } else {
          feedback = "未回答です。学習内容を確認して再受験してください。";
        }

        result.results.push({
          questionId: result.results.length + 1, // 順序番号を使用
          question: question.question,
          userAnswer,
          correctAnswer,
          feedback,
          isCorrect,
          score: isCorrect ? 1 : 0
        });
      }
      
      console.log('TestResultPage: 問題別結果生成完了', {
        totalResults: result.results.length,
        correctResults: result.results.filter(r => r.isCorrect).length,
        incorrectResults: result.results.filter(r => !r.isCorrect).length,
        results: result.results.map(r => ({ questionId: r.questionId, isCorrect: r.isCorrect }))
      });
      
      // スコアの整合性を確認
      const calculatedCorrectAnswers = result.results.filter(r => r.isCorrect).length;
      console.log('TestResultPage: スコア整合性チェック', {
        originalScore: result.score,
        calculatedScore: calculatedCorrectAnswers,
        totalQuestions: result.totalQuestions,
        isConsistent: result.score === calculatedCorrectAnswers
      });
      
      // スコアが不一致の場合は再計算
      if (result.score !== calculatedCorrectAnswers) {
        console.warn('TestResultPage: スコア不一致を検出、再計算します', {
          original: result.score,
          calculated: calculatedCorrectAnswers
        });
        result.score = calculatedCorrectAnswers;
        result.correctAnswers = calculatedCorrectAnswers;
        result.percentage = Math.round((calculatedCorrectAnswers / result.totalQuestions) * 100);
      }

        setResultData(result);
        setLoading(false);
      } else {
        // データがない場合はダッシュボードに戻る
        navigate('/student/dashboard');
      }
    };

    processTestResults();
  }, [location.state, navigate]);

  // テスト結果をDBに保存（必要に応じて）
  useEffect(() => {
    if (resultData) {
      const saveTestResult = async () => {
        try {
          const lessonId = resultData.lessonId || resultData.lessonNumber;
          
          // 既にexamResultIdが存在する場合は再提出をスキップ
          if (resultData.examResultId) {
            console.log('既にテスト結果が保存済みのため、再提出をスキップします:', resultData.examResultId);
            return;
          }
          
          // デバッグログ
          console.log('TestResultPage再提出データ:', {
            lessonId,
            sectionIndex: resultData.sectionIndex,
            hasAnswers: !!resultData.answers,
            hasTestData: !!resultData.testData,
            hasShuffledQuestions: !!resultData.shuffledQuestions,
            answersCount: Object.keys(resultData.answers || {}).length,
            testDataQuestions: resultData.testData?.questions?.length,
            shuffledQuestionsLength: resultData.shuffledQuestions?.length,
            examResultId: resultData.examResultId
          });
          
          // テスト結果を保存（既にテスト提出時に保存済みの場合は不要）
          const response = await fetch('/api/learning/test/submit', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lessonId: parseInt(lessonId),
              sectionIndex: resultData.sectionIndex || 0,
              testType: 'section',
              answers: resultData.answers,
              testData: resultData.testData,
              shuffledQuestions: resultData.shuffledQuestions,
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
    if (resultData.testType === 'section') {
      // セクションテストのキャッシュをクリア
      const sectionCacheKey = `test_data_${resultData.lessonId}_${resultData.sectionIndex}`;
      sessionStorage.removeItem(sectionCacheKey);
      console.log('再試験: セクションテストのキャッシュをクリア:', sectionCacheKey);
      navigate(`/student/section-test?lesson=${resultData.lessonId}&section=${resultData.sectionIndex}`);
    } else {
      // レッスンテストのキャッシュをクリア
      const lessonCacheKey = `test_data_lesson_${resultData.lessonId}`;
      sessionStorage.removeItem(lessonCacheKey);
      console.log('再試験: レッスンテストのキャッシュをクリア:', lessonCacheKey);
      navigate(`/student/lesson-test?lesson=${resultData.lessonId}`);
    }
  };

  const handleGoToCertificate = () => {
    if (resultData.passed) {
      // 現在のユーザーIDを取得
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser.user_id || currentUser.id;
      
      if (!userId) {
        alert('ユーザー情報が取得できません。再度ログインしてください。');
        return;
      }

      navigate('/student/certificate', {
        state: {
          userId: userId,
          lessonId: resultData.lessonId,
          lessonTitle: resultData.lessonTitle,
          sectionTitle: resultData.sectionTitle,
          testType: resultData.testType,
          score: resultData.score,
          totalQuestions: resultData.totalQuestions,
          examResultId: resultData.examResultId // 試験結果IDも渡す
        }
      });
    } else {
      alert('合格していないため、修了証は発行できません。再受験してください。');
    }
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
                <span className="text-blue-100 text-sm">
                  {resultData.lessonTitle}
                  {resultData.sectionTitle && ` - ${resultData.sectionTitle}`}
                </span>
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
              出題範囲：{resultData.lessonTitle}
              {resultData.sectionTitle && ` - ${resultData.sectionTitle}`}
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
              {resultData.results.map((result, index) => {
                console.log(`TestResultPage: 問題${index + 1}の色分け`, {
                  questionId: result.questionId,
                  isCorrect: result.isCorrect,
                  currentQuestion: currentQuestion,
                  index: index
                });
                
                return (
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
                    Q{index + 1}
                  </button>
                );
              })}
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              {resultData.results[currentQuestion] && (
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {currentQuestion + 1}
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
          {!resultData.passed && (
            <button
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={handleRetakeTest}
            >
              🔄 再受験する
            </button>
          )}
          {resultData.passed && resultData.testType === 'lesson' && (
            <button
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={handleGoToCertificate}
            >
              🏆 修了証を確認
            </button>
          )}
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
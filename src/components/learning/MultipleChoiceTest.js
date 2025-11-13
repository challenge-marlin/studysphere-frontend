import React, { useState, useEffect } from 'react';

const MultipleChoiceTest = ({ 
  testData, 
  onAnswerChange, 
  onComplete, 
  isSubmitting = false 
}) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  // 問題のシャッフル処理（テスト開始時のみ実行）
  useEffect(() => {
    if (testData && testData.questions && !testStarted && shuffledQuestions.length === 0) {
      const shuffled = testData.questions.map(question => {
        // 選択肢をシャッフル
        const shuffledOptions = [...question.options];
        const correctAnswerIndex = question.correctAnswer;
        const correctAnswer = shuffledOptions[correctAnswerIndex];
        
        // Fisher-Yates シャッフルアルゴリズム
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        // 正解の新しいインデックスを取得
        const newCorrectAnswerIndex = shuffledOptions.findIndex(option => option === correctAnswer);
        
        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswerIndex,
          originalCorrectAnswer: correctAnswerIndex // 元の正解インデックスを保存
        };
      });
      
      setShuffledQuestions(shuffled);
    }
  }, [testData, testStarted, shuffledQuestions.length]);

  // 回答の更新（選択クリック）
  const handleAnswerSelect = (questionId, answerIndex) => {
    const newAnswers = {
      ...answers,
      [questionId]: answerIndex
    };
    setAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  // 次の問題へ
  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // 前の問題へ
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 問題番号をクリックして直接移動
  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  // テスト提出
  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < shuffledQuestions.length) {
      const confirmSubmit = window.confirm(
        `まだ${shuffledQuestions.length - answeredCount}問が未回答です。\nこのまま提出しますか？`
      );
      if (!confirmSubmit) return;
    }
    
    // シャッフル情報を含めて送信
    const submissionData = {
      answers: answers,
      shuffledQuestions: shuffledQuestions // シャッフルされた問題データを送信
    };
    
    onComplete(submissionData);
  };

  // テスト開始
  const handleStartTest = () => {
    setTestStarted(true);
  };


  // 回答済み問題数
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (!testData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">テストデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  // テスト開始前の画面
  if (!testStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{testData.title}</h2>
            <p className="text-lg text-gray-600 mb-6">{testData.description}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 テストの詳細</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
              <div className="flex items-center gap-2">
                <span className="font-medium">問題数:</span>
                <span>{testData.questions.length}問</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">形式:</span>
                <span>4択問題（選択クリック）</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 注意事項</h3>
            <ul className="text-left space-y-2 text-yellow-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>各問題の選択肢をクリックして回答してください</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>回答は自動保存されます</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>不合格の場合は再受験可能です</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={handleStartTest}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              🚀 テストを開始する
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{testData.title}</h2>
            <p className="text-sm text-gray-600">問題 {currentQuestionIndex + 1} / {shuffledQuestions.length}</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* 進捗バー */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">進捗:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{Math.round(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100)}%</span>
            </div>

            {/* 回答済み数 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">回答済み:</span>
              <span className="text-sm font-bold text-blue-600">{answeredCount}/{shuffledQuestions.length}</span>
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 問題ナビゲーション */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
            <h3 className="font-semibold text-gray-800 mb-4">問題一覧</h3>
            <div className="grid grid-cols-5 lg:grid-cols-2 gap-2">
              {shuffledQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionJump(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                    index === currentQuestionIndex
                      ? 'bg-blue-500 text-white'
                      : answers[shuffledQuestions[index].id] !== undefined
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">現在の問題</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span className="text-gray-600">回答済み</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span className="text-gray-600">未回答</span>
              </div>
            </div>
          </div>
        </div>

        {/* 問題表示エリア */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {currentQuestion && (
              <>
                <div className="mb-8">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                      {currentQuestionIndex + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                        {currentQuestion.question}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion.id] === index;
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                          className={`w-full flex items-center p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className={`flex-1 text-left font-medium transition-colors duration-200 ${
                            isSelected
                              ? 'text-blue-800'
                              : 'text-gray-800'
                          }`}>
                            {option}
                          </span>
                          {isSelected && (
                            <div className="ml-2">
                              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ナビゲーションボタン */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ← 前の問題
                  </button>

                  <div className="flex items-center gap-4">
                    {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          isSubmitting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            提出中...
                          </div>
                        ) : (
                          '📝 テストを提出'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        次の問題 →
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceTest;


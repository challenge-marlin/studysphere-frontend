import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TestResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultData, setResultData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // サンプル模範解答
  const sampleAnswers = {
    1: "ニューラルネットワークは主に3つの層から構成されています。入力層では外部から得られた情報が数値として取り込まれ、隠れ層では多数の人工ニューロンが情報を処理し、出力層で最終的な予測結果が得られます。",
    2: "活性化関数は、ニューラルネットワークが複雑なパターンを学習できるようにするための鍵となる部分です。ReLU、シグモイド関数、tanh関数などがあります。ReLUは計算が軽く高速で学習が進むため、ディープラーニングでよく使われます。",
    3: "誤差逆伝播法は、ニューラルネットワークの学習過程で誤差を出発点に各重みやバイアスを調整し、モデルの予測精度を向上させる手法です。誤差は出力層から始まり、隠れ層を通して逆方向に伝播されます。",
    4: "過学習とは、学習用のデータに対しては高い精度で答えられるものの、未知のデータでは正しく機能しなくなる状態です。防ぐためには、データを訓練用、検証用、テスト用に分けたり、ドロップアウトやデータ拡張を行うことが有効です。",
    5: "CNNは、視覚情報の処理に長けた人間の脳の構造にヒントを得たアルゴリズムで、畳み込み層とプーリング層を通じて特徴を抽出し、全結合層で分類を行います。畳み込み層ではフィルターを使って特徴を抽出し、プーリング層で情報を圧縮します。",
    6: "ベクトル化とは、言葉を数値に変換するプロセスで、コンピューターが扱える形にします。単語の意味や使われ方の特徴を数値として捉え、コンピューターが言葉の意味を理解できるようにします。",
    7: "トランスフォーマーは、文章内の単語同士の関係性を効率的に分析する技術で、特に長文の意味理解に優れています。ChatGPTのような対話型AIに応用され、文脈や意図をくみ取って自然な返答を生成します。",
    8: "ディープラーニングは、隠れ層の数が多く、より複雑で微細な特徴を捉えることができるため、大規模なデータセットを処理する能力に優れています。これにより、医療画像の解析や自動運転車の識別など高度な処理が可能です。",
    9: "画像認識技術は、スマートフォンの顔認証機能、自動運転車の歩行者や信号の検知、医療分野でのX線画像やMRIスキャンの解析に応用されています。これにより、個人認証や疾患の早期発見が可能になっています。",
    10: "AIは人の力を補うサポーターであり、共に支え合うことで新しい価値や可能性が生まれます。AIの活用により効率が向上し、人間は創造性や感性を活かした活動に集中できるようになります。これにより、より良い社会や未来が実現されると考えます。"
  };

  // サンプルフィードバック
  const sampleFeedback = {
    1: "解答がありません。ニューラルネットワークの基本構造について説明してください。",
    2: "解答がありません。活性化関数の役割や種類について説明してください。",
    3: "回答がありません。誤差逆伝播法について説明してください。",
    4: "解答がありません。過学習の定義と防止策について説明してください。",
    5: "解答がありません。基本的な仕組みについて説明してください。",
    6: "解答がありません。次回は問題に対する具体的な説明を心がけましょう。",
    7: "解答がありません。トランスフォーマー技術の特徴や応用例について説明してください。",
    8: "解答がありません。ディープラーニングの特徴や利点について具体的に説明してください。",
    9: "解答がありません。具体例を3つ挙げて説明してください。",
    10: "解答がありません。AIと人間の協力についての考えを述べてください。"
  };

  useEffect(() => {
    if (location.state) {
      const { lessonNumber, lessonTitle, answers, testData } = location.state;
      
      // モックアップ用の結果データを生成
      const mockResult = {
        lessonNumber,
        lessonTitle,
        testData,
        answers,
        correctAnswers: 0,
        totalQuestions: 10,
        score: 0,
        grade: "もう少し理解度を深めて再試験を行って下さい",
        gradeEmoji: "📘",
        results: []
      };

      // 各問題の結果を生成
      testData.questions.forEach(question => {
        const userAnswer = answers[question.id] || "生徒の回答";
        const correctAnswer = sampleAnswers[question.id];
        const feedback = sampleFeedback[question.id];
        const isCorrect = false; // モックアップなので全て不正解

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
    } else {
      // データがない場合はダッシュボードに戻る
      navigate('/student/dashboard');
    }
  }, [location.state, navigate]);

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

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">結果を読み込み中...</p>
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
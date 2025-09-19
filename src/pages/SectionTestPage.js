import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MultipleChoiceTest from '../components/learning/MultipleChoiceTest';
import { SessionStorageManager } from '../utils/sessionStorage';

const SectionTestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentSection, setCurrentSection] = useState(0);
  
  // 初期化時のURLパラメータ確認（デバッグ時のみ）
  console.log('SectionTestPage初期化:', {
    url: window.location.href,
    search: window.location.search,
    lessonParam: searchParams.get('lesson'),
    sectionParam: searchParams.get('section'),
    allParams: Object.fromEntries(searchParams.entries())
  });
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // URLパラメータからレッスン番号とセクション番号を取得
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    const sectionParam = searchParams.get('section');
    
    console.log('URLパラメータ取得:', {
      lessonParam,
      sectionParam,
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    if (lessonParam) {
      const lessonNumber = parseInt(lessonParam);
      if (lessonNumber >= 1) {
        console.log('レッスン番号設定:', lessonNumber);
        setCurrentLesson(lessonNumber);
      }
    } else {
      console.warn('レッスンパラメータが見つかりません。デフォルト値(1)を使用します。');
    }
    
    if (sectionParam) {
      const sectionNumber = parseInt(sectionParam);
      if (sectionNumber >= 0) {
        console.log('セクション番号設定:', sectionNumber);
        setCurrentSection(sectionNumber);
      }
    } else {
      console.warn('セクションパラメータが見つかりません。デフォルト値(0)を使用します。');
    }
  }, [searchParams]);

  // レッスンデータとセクションデータを取得
  useEffect(() => {
    // レッスン番号が設定されていない場合は実行しない
    if (!currentLesson) {
      console.log('レッスン番号が未設定のため、データ取得をスキップします');
      return;
    }
    
    // 既に実行中の場合は実行しない
    if (isFetching) {
      console.log('既にデータ取得中です。重複実行をスキップします');
      return;
    }
    
    // 既にテストデータが存在する場合は再生成しない
    if (testData) {
      console.log('既にテストデータが存在するため、再生成をスキップします');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setIsFetching(true);
        setLoading(true);
        setError(null);
        
        console.log('データ取得開始:', {
          currentLesson,
          currentSection,
          lessonData,
          sectionData
        });
        
        // レッスンデータを取得
        const lessonResponse = await fetch(`http://localhost:5050/api/learning/lesson/${currentLesson}/content`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!lessonResponse.ok) {
          throw new Error('レッスンデータの取得に失敗しました');
        }

        const lessonResult = await lessonResponse.json();
        if (lessonResult.success) {
          setLessonData(lessonResult.data);
        }

        // セクションデータを取得
        const sectionResponse = await fetch(`http://localhost:5050/api/lesson-text-video-links/lesson/${currentLesson}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (sectionResponse.ok) {
          const sectionResult = await sectionResponse.json();
          if (sectionResult.success) {
            setSectionData(sectionResult.data);
            
            // セクションが指定されていない場合は最初のセクションを使用
            if (sectionResult.data.length > 0 && currentSection >= sectionResult.data.length) {
              setCurrentSection(0);
            }
          }
        }
        
        // セッションストレージから直接テストデータを生成
        await generateTestDataFromSessionStorage();
        
      } catch (error) {
        console.error('データ取得エラー:', error);
        setError(error.message);
        // フォールバック: モックデータを使用
        generateMockTestData();
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchData();
  }, [currentLesson, currentSection]);

  // セッションストレージから直接コンテキストを取得してテスト生成
  const generateTestDataFromSessionStorage = async (forceRefresh = false) => {
    try {
      console.log('セッションストレージから直接テスト生成開始:', {
        currentLesson,
        currentSection,
        forceRefresh
      });
      
      // テスト問題のキャッシュキーを生成
      const testCacheKey = `test_data_${currentLesson}_${currentSection}`;
      
      // 強制リフレッシュが指定されていない場合のみキャッシュをチェック
      if (!forceRefresh) {
        const cachedTestData = sessionStorage.getItem(testCacheKey);
        if (cachedTestData) {
          console.log('キャッシュされたテスト問題を使用:', {
            key: testCacheKey,
            dataLength: cachedTestData.length
          });
          const parsedTestData = JSON.parse(cachedTestData);
          setTestData(parsedTestData);
          setLoading(false);
          return;
        }
      } else {
        // 強制リフレッシュの場合はキャッシュをクリア
        console.log('キャッシュをクリアして新しい問題を生成:', {
          key: testCacheKey
        });
        sessionStorage.removeItem(testCacheKey);
      }
      
      // セッションストレージの全コンテキストキーを確認
      const allKeys = Object.keys(sessionStorage).filter(key => key.startsWith('pdf_context_'));
      console.log('利用可能なコンテキストキー:', allKeys);
      
      // 現在のレッスンに対応するコンテキストを探す（改善されたマッチング）
      let currentLessonKey = null;
      
      // 1. 完全一致を試す（例: pdf_context_4_4_xxx.pdf）
      currentLessonKey = allKeys.find(key => key.includes(`_${currentLesson}_${currentLesson}_`));
      if (currentLessonKey) {
        console.log(`完全一致でコンテキスト発見: ${currentLessonKey}`);
      }
      
      // 2. 部分一致を試す（例: pdf_context_1_xxx.pdf）
      if (!currentLessonKey) {
        currentLessonKey = allKeys.find(key => key.includes(`_${currentLesson}_`));
        if (currentLessonKey) {
          console.log(`部分一致でコンテキスト発見: ${currentLessonKey}`);
        }
      }
      
      // 3. セッションストレージのメタデータから正確なレッスンIDを確認
      if (!currentLessonKey) {
        console.log('メタデータからレッスンIDを確認中...');
        for (const key of allKeys) {
          try {
            const storedData = sessionStorage.getItem(key);
            if (storedData) {
              const contextData = JSON.parse(storedData);
              console.log(`キー ${key} のメタデータ:`, {
                lessonId: contextData.metadata?.lessonId,
                lessonTitle: contextData.metadata?.lessonTitle,
                fileType: contextData.metadata?.fileType
              });
              
              if (contextData.metadata && contextData.metadata.lessonId === currentLesson) {
                currentLessonKey = key;
                console.log(`メタデータから正確なレッスンIDでマッチ: ${key} (lessonId: ${contextData.metadata.lessonId})`);
                break;
              }
            }
          } catch (error) {
            console.warn(`キー ${key} のメタデータ解析に失敗:`, error);
          }
        }
      }
      
      // 4. レッスン番号の部分文字列マッチを試す（最後の手段）
      if (!currentLessonKey) {
        console.log('キーの部分文字列からレッスン番号を抽出中...');
        currentLessonKey = allKeys.find(key => {
          // キーからレッスン番号を抽出して比較
          const keyParts = key.split('_');
          if (keyParts.length >= 3) {
            const keyLessonId = parseInt(keyParts[2]);
            console.log(`キー ${key} から抽出したレッスンID: ${keyLessonId}, 検索対象: ${currentLesson}`);
            return keyLessonId === currentLesson;
          }
          return false;
        });
        if (currentLessonKey) {
          console.log(`部分文字列マッチでコンテキスト発見: ${currentLessonKey}`);
        }
      }
      
      // 5. フォールバック: 利用可能なコンテキストの最初のものを使用（デバッグ用）
      if (!currentLessonKey && allKeys.length > 0) {
        console.warn(`レッスン${currentLesson}のコンテキストが見つからないため、利用可能な最初のコンテキストを使用します`);
        currentLessonKey = allKeys[0];
        console.log(`フォールバックコンテキスト: ${currentLessonKey}`);
      }
      
      if (!currentLessonKey) {
        // 利用可能なコンテキストの詳細情報を表示
        const availableContexts = [];
        for (const key of allKeys) {
          try {
            const storedData = sessionStorage.getItem(key);
            if (storedData) {
              const contextData = JSON.parse(storedData);
              availableContexts.push({
                key,
                lessonId: contextData.metadata?.lessonId,
                lessonTitle: contextData.metadata?.lessonTitle,
                fileType: contextData.metadata?.fileType
              });
            }
          } catch (error) {
            console.warn(`キー ${key} の解析に失敗:`, error);
          }
        }
        
        console.warn(`レッスン${currentLesson}に対応するコンテキストが見つかりません。利用可能なコンテキスト:`, availableContexts);
        
        // フォールバック: レッスン1のコンテキストを動的に生成する
        if (currentLesson === 1 && availableContexts.length > 0) {
          console.log('レッスン1のコンテキストを動的に生成します...');
          await generateLesson1ContextFromAvailableData(availableContexts);
          return;
        }
        
        // フォールバック: レッスン4のコンテキストが見つからない場合の処理
        if (currentLesson === 4 && availableContexts.length > 0) {
          console.log('レッスン4のコンテキストが見つからないため、利用可能なコンテキストを使用します...');
          const fallbackContext = availableContexts[0];
          console.log('フォールバックコンテキストを使用:', fallbackContext);
          
          // フォールバックコンテキストを使用してテストを生成
          const storedData = sessionStorage.getItem(fallbackContext.key);
          if (storedData) {
            const contextData = JSON.parse(storedData);
            const textContent = contextData.context;
            
            const sectionTitle = `セクション${currentSection + 1}`;
            const sectionDescription = 'セクションの説明';
            
            const requestBody = {
              type: 'section',
              lessonId: currentLesson,
              sectionIndex: currentSection,
              sectionTitle: sectionTitle,
              sectionDescription: sectionDescription,
              textContent: textContent,
              fileType: contextData.metadata?.fileType || 'text/plain',
              fileName: `lesson_${currentLesson}_section_${currentSection}_fallback`,
              questionCount: 10
            };
            
            console.log('フォールバックコンテキストでAPIリクエスト送信:', requestBody);
            
            const response = await fetch('http://localhost:5050/api/test/learning/generate-test', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                const testCacheKey = `test_data_${currentLesson}_${currentSection}`;
                sessionStorage.setItem(testCacheKey, JSON.stringify(result.data));
                console.log('フォールバックコンテキストでテスト問題をキャッシュに保存:', {
                  key: testCacheKey,
                  dataLength: JSON.stringify(result.data).length
                });
                
                setTestData(result.data);
                return;
              }
            }
          }
        }
        
        console.warn('モックデータを使用してテストを生成します');
        generateMockTestData();
        return;
      }
      
      // セッションストレージからコンテキストを取得
      const storedData = sessionStorage.getItem(currentLessonKey);
      if (!storedData) {
        console.warn('セッションストレージからコンテキストデータを取得できません');
        generateMockTestData();
        return;
      }
      
      const contextData = JSON.parse(storedData);
      const textContent = contextData.context;
      
      console.log('セッションストレージからコンテキスト取得:', {
        key: currentLessonKey,
        contextLength: textContent?.length || 0,
        metadata: contextData.metadata,
        searchLesson: currentLesson,
        foundLesson: contextData.metadata?.lessonId
      });
      
      const sectionTitle = `セクション${currentSection + 1}`;
      const sectionDescription = 'セクションの説明';
      
      console.log('テスト生成用データ:', {
        sectionTitle,
        sectionDescription,
        textContentLength: textContent?.length || 0,
        textContentPreview: textContent?.substring(0, 200) + '...',
        currentLesson,
        currentSection,
        sessionStorageKey: currentLessonKey
      });
      
      // テキストコンテンツが空の場合は警告
      if (!textContent || textContent.trim().length === 0) {
        console.warn('⚠️ テキストコンテンツが空です。フォールバック用のモックデータを使用します。');
        generateMockTestData();
        return;
      }
      
      const requestBody = {
        type: 'section',
        lessonId: currentLesson,
        sectionIndex: currentSection,
        sectionTitle: sectionTitle,
        sectionDescription: sectionDescription,
        textContent: textContent,
        fileType: lessonData?.file_type || 'text/plain',
        fileName: lessonData?.s3_key || `lesson_${currentLesson}_section_${currentSection}`,
        questionCount: 10
      };
      
      console.log('APIリクエスト送信:', {
        url: 'http://localhost:5050/api/test/learning/generate-test',
        body: requestBody
      });
      
      const response = await fetch('http://localhost:5050/api/test/learning/generate-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // テスト問題をキャッシュに保存
          sessionStorage.setItem(testCacheKey, JSON.stringify(result.data));
          console.log('テスト問題をキャッシュに保存:', {
            key: testCacheKey,
            dataLength: JSON.stringify(result.data).length
          });
          
          setTestData(result.data);
        } else {
          throw new Error(result.message || 'テストデータの生成に失敗しました');
        }
      } else {
        throw new Error('テストデータの生成に失敗しました');
      }
    } catch (error) {
      console.error('テストデータ生成エラー:', error);
      // フォールバック: モックデータを使用
      generateMockTestData();
    }
  };

  // レッスン1のコンテキストを動的に生成する関数
  const generateLesson1ContextFromAvailableData = async (availableContexts) => {
    try {
      console.log('レッスン1のコンテキストを動的に生成開始:', availableContexts);
      
      // 利用可能なコンテキストから最も適切なものを選択
      // 優先順位: 1. レッスン4のコンテキスト, 2. 最初のコンテキスト
      let selectedContext = availableContexts.find(ctx => ctx.lessonId === 4) || availableContexts[0];
      
      if (!selectedContext) {
        console.warn('利用可能なコンテキストがありません');
        generateMockTestData();
        return;
      }
      
      console.log('選択されたコンテキスト:', selectedContext);
      
      // 選択されたコンテキストのデータを取得
      const storedData = sessionStorage.getItem(selectedContext.key);
      if (!storedData) {
        console.warn('選択されたコンテキストのデータを取得できません');
        generateMockTestData();
        return;
      }
      
      const contextData = JSON.parse(storedData);
      const textContent = contextData.context;
      
      // レッスン1用のコンテキストを生成（既存のコンテキストをベースに）
      const lesson1Context = `レッスン1の学習内容:\n\n${textContent}`;
      
      // レッスン1用のキーを生成
      const lesson1Key = `pdf_context_1_1_lesson1_generated`;
      
      // レッスン1のコンテキストをセッションストレージに保存
      const lesson1Data = {
        context: lesson1Context,
        metadata: {
          ...contextData.metadata,
          lessonId: 1,
          lessonTitle: 'レッスン1',
          fileType: 'generated',
          generatedFrom: selectedContext.key,
          generatedAt: new Date().toISOString()
        }
      };
      
      sessionStorage.setItem(lesson1Key, JSON.stringify(lesson1Data));
      console.log('レッスン1のコンテキストを生成して保存:', {
        key: lesson1Key,
        contextLength: lesson1Context.length,
        generatedFrom: selectedContext.key
      });
      
      // 生成したコンテキストを使用してテストを生成
      const sectionTitle = `セクション${currentSection + 1}`;
      const sectionDescription = 'セクションの説明';
      
      const requestBody = {
        type: 'section',
        lessonId: currentLesson,
        sectionIndex: currentSection,
        sectionTitle: sectionTitle,
        sectionDescription: sectionDescription,
        textContent: lesson1Context,
        fileType: 'generated',
        fileName: `lesson_${currentLesson}_section_${currentSection}_generated`,
        questionCount: 10
      };
      
      console.log('生成されたコンテキストでAPIリクエスト送信:', {
        url: 'http://localhost:5050/api/test/learning/generate-test',
        body: requestBody
      });
      
      const response = await fetch('http://localhost:5050/api/test/learning/generate-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // テスト問題をキャッシュに保存
          const testCacheKey = `test_data_${currentLesson}_${currentSection}`;
          sessionStorage.setItem(testCacheKey, JSON.stringify(result.data));
          console.log('生成されたコンテキストでテスト問題をキャッシュに保存:', {
            key: testCacheKey,
            dataLength: JSON.stringify(result.data).length
          });
          
          setTestData(result.data);
        } else {
          throw new Error(result.message || 'テストデータの生成に失敗しました');
        }
      } else {
        throw new Error('テストデータの生成に失敗しました');
      }
    } catch (error) {
      console.error('レッスン1コンテキスト生成エラー:', error);
      // フォールバック: モックデータを使用
      generateMockTestData();
    }
  };

  // モックテストデータ（フォールバック用）
  const generateMockTestData = () => {
    const currentSectionInfo = sectionData?.[currentSection];
    const sectionTitle = currentSectionInfo?.section_title || `セクション${currentSection + 1}`;
    
    const mockTestData = {
      title: `${sectionTitle} - セクションまとめテスト`,
      description: `${sectionTitle}の学習内容について理解度を確認するテストです。`,
      type: 'section',
      lessonId: currentLesson,
      sectionIndex: currentSection,
      questionCount: 10,
      passingScore: 90,
      questions: [
        {
          id: 1,
          question: `${sectionTitle}の主要なポイントは何ですか？`,
          options: [
            '基本的な概念の理解',
            '実践的な応用方法',
            '理論的な背景',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 2,
          question: 'このセクションで学んだ内容を実際に活用する際の注意点は？',
          options: [
            '特に注意点はない',
            '基本的なルールを守る',
            '専門家の指導を受ける',
            '自己判断で進める'
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          question: '学習内容の理解度を深めるために重要なことは？',
          options: [
            '暗記すること',
            '実践すること',
            '理論を学ぶこと',
            '他人に教えること'
          ],
          correctAnswer: 1
        },
        {
          id: 4,
          question: 'このセクションの内容を復習する際の効果的な方法は？',
          options: [
            '一度だけ読む',
            '定期的に復習する',
            '暗記する',
            '他人に説明する'
          ],
          correctAnswer: 1
        },
        {
          id: 5,
          question: '学習した内容を応用する際に考慮すべき点は？',
          options: [
            '理論的な正確性',
            '実践的な効果',
            '時間的な効率',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 6,
          question: 'このセクションで最も重要な学習目標は？',
          options: [
            '知識の習得',
            'スキルの向上',
            '理解の深化',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 7,
          question: '学習内容を他者に説明する際のポイントは？',
          options: [
            '専門用語を多用する',
            '分かりやすい言葉で説明する',
            '詳細に説明する',
            '簡潔に説明する'
          ],
          correctAnswer: 1
        },
        {
          id: 8,
          question: 'このセクションの内容を実践する際の準備として必要なことは？',
          options: [
            '理論の完全な理解',
            '実践的な準備',
            '専門家の指導',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 9,
          question: '学習した内容の効果を測定する方法は？',
          options: [
            'テストの点数',
            '実践的な成果',
            '理解度の確認',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 10,
          question: 'このセクションの学習を完了した後の次のステップは？',
          options: [
            '次のセクションに進む',
            '復習を繰り返す',
            '実践を開始する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        }
      ]
    };
    setTestData(mockTestData);
  };

  // 回答の変更
  const handleAnswerChange = (answers) => {
    // 回答の変更を処理（必要に応じて）
    console.log('回答が変更されました:', answers);
  };

  // テスト完了
  const handleTestComplete = async (submissionData) => {
    setIsSubmitting(true);
    
    try {
      // 認証されたユーザーIDを使用するため、userIdはリクエストボディに含めない
      
      // デバッグログ
      console.log('テスト提出データ:', {
        currentLesson,
        sectionIndex: currentSection,
        hasAnswers: !!submissionData.answers,
        hasTestData: !!testData,
        hasShuffledQuestions: !!submissionData.shuffledQuestions,
        answersCount: Object.keys(submissionData.answers || {}).length,
        testDataQuestions: testData?.questions?.length,
        shuffledQuestionsLength: submissionData.shuffledQuestions?.length
      });
      
      // テスト結果を提出
      const response = await fetch('http://localhost:5050/api/learning/test/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId: parseInt(currentLesson),
          sectionIndex: currentSection,
          testType: 'section',
          answers: submissionData.answers,
          testData: testData,
          shuffledQuestions: submissionData.shuffledQuestions // シャッフル情報を送信
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // テスト結果画面に遷移
          navigate('/student/test-result', {
            state: {
              testType: 'section',
              lessonId: currentLesson,
              sectionIndex: currentSection,
              lessonTitle: lessonData?.title || `第${currentLesson}回`,
              sectionTitle: sectionData?.[currentSection]?.section_title || `セクション${currentSection + 1}`,
              answers: submissionData.answers,
              testData: testData,
              shuffledQuestions: submissionData.shuffledQuestions,
              score: result.data?.score || 0,
              totalQuestions: testData.questions.length,
              examResultId: result.data?.examResultId,
              s3Key: result.data?.s3Key
            }
          });
        } else {
          throw new Error(result.message || 'テスト結果の提出に失敗しました');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 text-xl font-semibold">
            セクションテストを準備中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">エラーが発生しました</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            再読み込み
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
                onClick={() => navigate(-1)}
              >
                ← 学習画面に戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">セクションまとめテスト</h1>
                <span className="text-blue-100 text-sm">
                  {lessonData?.title} - {sectionData?.[currentSection]?.section_title || `セクション${currentSection + 1}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* テストコンテンツ */}
      <div className="py-8">
        <MultipleChoiceTest
          testData={testData}
          onAnswerChange={handleAnswerChange}
          onComplete={handleTestComplete}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default SectionTestPage;


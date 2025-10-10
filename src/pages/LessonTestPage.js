import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MultipleChoiceTest from '../components/learning/MultipleChoiceTest';
import { SessionStorageManager } from '../utils/sessionStorage';

const LessonTestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [sectionData, setSectionData] = useState(null);

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

  // レッスンデータとセクションデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
          }
        }
        
      } catch (error) {
        console.error('データ取得エラー:', error);
        setError(error.message);
        // フォールバック: モックデータを使用
        generateMockTestData();
        setLoading(false);
      }
    };

    if (currentLesson) {
      fetchData();
    }
  }, [currentLesson]);

  // セクションデータが取得された後にテストデータを生成
  useEffect(() => {
    if (sectionData && sectionData.length > 0 && lessonData) {
      console.log('セクションデータ取得完了、テストデータ生成開始:', {
        sectionCount: sectionData.length,
        lessonTitle: lessonData.title
      });
      generateTestData();
    }
  }, [sectionData, lessonData, currentLesson]);

  // テストデータを生成（OpenAI APIを使用）
  const generateTestData = async (forceRefresh = false) => {
    try {
      // テスト問題のキャッシュキーを生成
      const testCacheKey = `test_data_lesson_${currentLesson}`;
      
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
      
      // レッスン全体のテキスト内容を取得（コンテキスト化の完了を確実に待機）
      console.log('レッスンテキスト内容の取得を開始...');
      const textContent = await getLessonTextContent();
      
      // テキストコンテンツの検証（最小長さを50文字に緩和）
      if (!textContent || textContent.trim().length < 50) {
        throw new Error(`テキストコンテンツが不足しています: 長さ=${textContent?.length || 0}`);
      }
      
      // テキストコンテンツが有効な内容を含んでいるかチェック（より柔軟な検証）
      const hasValidContent = textContent.includes('AI') || 
                            textContent.includes('Google') || 
                            textContent.includes('検索') || 
                            textContent.includes('音声') ||
                            textContent.includes('翻訳') ||
                            textContent.includes('画像') ||
                            textContent.includes('DALL') ||
                            textContent.includes('Perplexity') ||
                            textContent.includes('倫理') ||
                            textContent.includes('バイアス') ||
                            textContent.includes('Windows') ||
                            textContent.includes('ソフトウェア') ||
                            textContent.includes('コンピュータ') ||
                            textContent.includes('基本操作') ||
                            textContent.length > 200; // 長いテキストの場合は有効とみなす
      
      if (!hasValidContent) {
        console.warn('テキストコンテンツに有効な学習内容が含まれていない可能性があります:', {
          textContentPreview: textContent.substring(0, 1000),
          textContentLength: textContent.length
        });
      }
      
      console.log('テキストコンテンツの検証完了:', {
        textContentLength: textContent.length,
        hasValidContent,
        textContentPreview: textContent.substring(0, 500),
        textContentEnd: textContent.substring(textContent.length - 500)
      });
      
      const requestBody = {
        type: 'lesson',
        lessonId: currentLesson,
        lessonTitle: lessonData?.title || `第${currentLesson}回`,
        lessonDescription: lessonData?.description || '',
        textContent: textContent,
        fileType: lessonData?.file_type || 'text/plain',
        fileName: lessonData?.s3_key || `lesson_${currentLesson}`,
        questionCount: 30
      };
      
      console.log('テスト生成APIリクエスト送信:', {
        url: 'http://localhost:5050/api/test/learning/generate-test',
        requestBody: {
          ...requestBody,
          textContentLength: textContent?.length || 0,
          textContentPreview: textContent?.substring(0, 200) + '...',
          textContentEnd: textContent ? textContent.substring(textContent.length - 200) : 'null',
          textContentFull: textContent // 完全なテキストコンテンツをログ出力
        }
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
        console.log('テスト生成APIレスポンス:', {
          success: result.success,
          dataLength: result.data ? JSON.stringify(result.data).length : 0,
          dataPreview: result.data ? JSON.stringify(result.data).substring(0, 500) + '...' : 'null',
          firstQuestion: result.data?.questions?.[0]?.question || 'null'
        });
        
        if (result.success && result.data && result.data.questions && result.data.questions.length > 0) {
          // テスト問題をキャッシュに保存（成功した場合のみ）
          sessionStorage.setItem(testCacheKey, JSON.stringify(result.data));
          console.log('テスト問題をキャッシュに保存:', {
            key: testCacheKey,
            dataLength: JSON.stringify(result.data).length,
            questionCount: result.data?.questions?.length || 0,
            firstQuestion: result.data.questions[0]?.question || 'null'
          });
          
          setTestData(result.data);
        } else {
          console.warn('APIレスポンスが無効です:', {
            success: result.success,
            hasData: !!result.data,
            hasQuestions: !!(result.data?.questions),
            questionCount: result.data?.questions?.length || 0
          });
          throw new Error(result.message || 'テストデータの生成に失敗しました');
        }
      } else {
        const errorText = await response.text();
        console.error('API呼び出し失敗:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`テストデータの生成に失敗しました: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('テストデータ生成エラー:', {
        error: error.message,
        stack: error.stack,
        currentLesson: currentLesson
      });
      // フォールバック: モックデータを使用
      console.warn('モックデータを使用します');
      generateMockTestData();
    } finally {
      setLoading(false);
    }
  };

  // レッスン全体のテキスト内容を取得（全セクションを結合）
  const getLessonTextContent = async () => {
    try {
      let allTextContent = '';
      
      console.log('レッスンテキスト内容取得開始:', {
        lessonId: currentLesson,
        sectionCount: sectionData?.length || 0,
        lessonTitle: lessonData?.title
      });
      
      // セッションストレージの状態を確認
      const allContextKeys = Object.keys(sessionStorage).filter(key => key.startsWith('pdf_context_'));
      console.log('現在のセッションストレージのコンテキストキー:', allContextKeys);
      
      // 各コンテキストの詳細情報を表示
      allContextKeys.forEach(key => {
        try {
          const data = JSON.parse(sessionStorage.getItem(key));
          console.log(`コンテキストキー ${key}:`, {
            lessonId: data.metadata?.lessonId,
            lessonTitle: data.metadata?.lessonTitle,
            contextLength: data.context?.length || 0,
            contextPreview: data.context?.substring(0, 100) + '...'
          });
        } catch (error) {
          console.warn(`コンテキストキー ${key} の解析に失敗:`, error);
        }
      });
      
      // レッスンの基本情報
      if (lessonData?.description) {
        allTextContent += `# ${lessonData.title || `第${currentLesson}回`}\n\n`;
        allTextContent += lessonData.description + '\n\n';
      }
      
      // 各セクションのテキスト内容を取得
      if (sectionData && sectionData.length > 0) {
        for (let i = 0; i < sectionData.length; i++) {
          const section = sectionData[i];
          console.log(`セクション${i + 1}のテキスト取得開始:`, {
            sectionTitle: section.section_title,
            textFileKey: section.text_file_key,
            hasTextFileKey: !!section.text_file_key
          });
          
          if (section.text_file_key) {
            try {
              // まずセッションストレージからコンテキスト化されたテキストを取得（厳密なマッチング）
              let storedContext = SessionStorageManager.getContext(currentLesson, section.text_file_key, 'md');
              
              // メタデータから正確なレッスンIDを確認
              if (storedContext && storedContext.metadata && storedContext.metadata.lessonId !== currentLesson) {
                console.warn(`セクション${i + 1}のコンテキストのレッスンIDが一致しません:`, {
                  expectedLessonId: currentLesson,
                  actualLessonId: storedContext.metadata.lessonId,
                  sectionTitle: section.section_title,
                  textFileKey: section.text_file_key
                });
                storedContext = null; // 間違ったレッスンのコンテキストは使用しない
              }
              
              if (storedContext && storedContext.context) {
                // コンテキストが有効かどうかを検証
                const contextLength = storedContext.context.length;
                const hasValidContent = storedContext.context.includes('AI') || 
                                      storedContext.context.includes('Google') || 
                                      storedContext.context.includes('検索') || 
                                      storedContext.context.includes('音声') ||
                                      storedContext.context.includes('翻訳') ||
                                      storedContext.context.includes('画像') ||
                                      storedContext.context.includes('DALL') ||
                                      storedContext.context.includes('Perplexity') ||
                                      storedContext.context.includes('倫理') ||
                                      storedContext.context.includes('バイアス') ||
                                      storedContext.context.includes('Windows') ||
                                      storedContext.context.includes('ソフトウェア') ||
                                      storedContext.context.includes('コンピュータ') ||
                                      storedContext.context.includes('基本操作') ||
                                      storedContext.context.length > 200;
                
                if (contextLength > 50 && hasValidContent) {
                  allTextContent += `\n\n## セクション${i + 1}: ${section.section_title || 'セクション'}\n\n`;
                  allTextContent += storedContext.context;
                  console.log(`セクション${i + 1}のコンテキスト取得完了:`, {
                    contextLength: storedContext.context.length,
                    sectionTitle: section.section_title,
                    lessonId: storedContext.metadata?.lessonId,
                    expectedLessonId: currentLesson,
                    hasValidContent
                  });
                  continue; // セッションストレージから取得できた場合は次のセクションへ
                } else {
                  console.warn(`セクション${i + 1}のコンテキストが無効です:`, {
                    contextLength,
                    hasValidContent,
                    contextPreview: storedContext.context.substring(0, 200)
                  });
                  storedContext = null; // 無効なコンテキストは使用しない
                }
              }
              
              // セッションストレージにない場合は、レッスンIDに基づいてコンテンツを取得
              console.log(`セクション${i + 1}のコンテンツ取得:`, {
                currentLesson: currentLesson,
                sectionTitle: section.section_title,
                note: 'セッションストレージにコンテンツがないため、レッスンコンテンツAPIを使用'
              });
              
              // レッスンコンテンツAPIを呼び出してテキストコンテンツを取得
              const response = await fetch(`http://localhost:5050/api/learning/lesson/${currentLesson}/content`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.ok) {
                const result = await response.json();
                if (result.success && result.data?.textContent) {
                  // レッスンコンテンツが有効かどうかを検証
                  const extractedText = result.data.textContent;
                  const textLength = extractedText.length;
                  const hasValidContent = extractedText.includes('AI') || 
                                        extractedText.includes('Google') || 
                                        extractedText.includes('検索') || 
                                        extractedText.includes('音声') ||
                                        extractedText.includes('翻訳') ||
                                        extractedText.includes('画像') ||
                                        extractedText.includes('DALL') ||
                                        extractedText.includes('Perplexity') ||
                                        extractedText.includes('倫理') ||
                                        extractedText.includes('バイアス') ||
                                        extractedText.includes('Windows') ||
                                        extractedText.includes('ソフトウェア') ||
                                        extractedText.includes('コンピュータ') ||
                                        extractedText.includes('基本操作') ||
                                        extractedText.length > 200;
                  
                  if (textLength > 50 && hasValidContent) {
                    allTextContent += `\n\n## セクション${i + 1}: ${section.section_title || 'セクション'}\n\n`;
                    allTextContent += extractedText;
                    
                    // 取得したテキストをセッションストレージに保存
                    const saveSuccess = SessionStorageManager.saveContext(
                      currentLesson,
                      `lesson_${currentLesson}_content`,
                      extractedText,
                      {
                        fileType: 'lesson_content',
                        lessonTitle: lessonData?.title,
                        sectionTitle: section.section_title,
                        source: 'lesson_content_api'
                      }
                    );
                    
                    if (saveSuccess) {
                      console.log(`セクション${i + 1}のコンテキストをセッションストレージに保存完了`);
                    }
                    
                    console.log(`セクション${i + 1}のレッスンコンテンツ取得完了:`, {
                      textLength: extractedText.length,
                      sectionTitle: section.section_title,
                      savedToSessionStorage: saveSuccess,
                      hasValidContent
                    });
                  } else {
                    console.warn(`セクション${i + 1}のレッスンコンテンツが無効です:`, {
                      textLength,
                      hasValidContent,
                      textPreview: extractedText.substring(0, 200)
                    });
                  }
                } else {
                  console.warn(`セクション${i + 1}のレッスンコンテンツ取得結果が空:`, result);
                }
              } else {
                console.warn(`セクション${i + 1}のレッスンコンテンツAPI失敗:`, {
                  status: response.status,
                  statusText: response.statusText,
                  sectionTitle: section.section_title
                });
              }
            } catch (error) {
              console.error(`セクション${i + 1}のレッスンコンテンツ取得エラー:`, {
                error: error.message,
                sectionTitle: section.section_title,
                currentLesson: currentLesson
              });
            }
          } else {
            console.warn(`セクション${i + 1}にtext_file_keyがありません:`, {
              sectionTitle: section.section_title,
              section: section
            });
          }
        }
      } else {
        console.warn('セクションデータがありません:', {
          sectionData,
          currentLesson
        });
      }
      
      // コンテキスト化の完了を確認
      const finalTextLength = allTextContent.length;
      const hasValidFinalContent = allTextContent.includes('AI') || 
                                   allTextContent.includes('Google') || 
                                   allTextContent.includes('検索') || 
                                   allTextContent.includes('音声') ||
                                   allTextContent.includes('翻訳') ||
                                   allTextContent.includes('画像') ||
                                   allTextContent.includes('DALL') ||
                                   allTextContent.includes('Perplexity') ||
                                   allTextContent.includes('倫理') ||
                                   allTextContent.includes('バイアス') ||
                                   allTextContent.includes('Windows') ||
                                   allTextContent.includes('ソフトウェア') ||
                                   allTextContent.includes('コンピュータ') ||
                                   allTextContent.includes('基本操作') ||
                                   allTextContent.length > 200;
      
      console.log('レッスン全体のテキスト内容取得完了:', {
        totalLength: allTextContent.length,
        sectionCount: sectionData?.length || 0,
        hasValidFinalContent,
        textPreview: allTextContent.substring(0, 500),
        textEnd: allTextContent.substring(allTextContent.length - 500),
        hasContent: allTextContent.length > 0,
        contentPreview: allTextContent.substring(0, 200) + '...',
        currentLesson: currentLesson,
        lessonTitle: lessonData?.title
      });
      
      return allTextContent;
    } catch (error) {
      console.error('レッスンテキスト内容取得エラー:', error);
      return '';
    }
  };

  // モックテストデータ（フォールバック用）
  const generateMockTestData = () => {
    const lessonTitle = lessonData?.title || `第${currentLesson}回`;
    
    const mockTestData = {
      title: `${lessonTitle} - レッスンまとめテスト`,
      description: `${lessonTitle}の全セクションの学習内容について理解度を確認するテストです。`,
      type: 'lesson',
      lessonId: currentLesson,
      questionCount: 30,
      passingScore: 90,
      questions: [
        {
          id: 1,
          question: `${lessonTitle}の学習目標は何ですか？`,
          options: [
            '基本的な知識の習得',
            '実践的なスキルの向上',
            '理論的な理解の深化',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 2,
          question: 'このレッスンで最も重要な学習ポイントは？',
          options: [
            '理論の理解',
            '実践の習得',
            '応用力の向上',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 3,
          question: '学習内容を実際の業務に活用する際の注意点は？',
          options: [
            '基本的なルールを守る',
            '専門家の指導を受ける',
            '段階的に実践する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 4,
          question: 'このレッスンの内容を復習する効果的な方法は？',
          options: [
            '一度だけ読む',
            '定期的に復習する',
            '実践と組み合わせる',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 5,
          question: '学習した内容の理解度を確認する方法は？',
          options: [
            'テストを受ける',
            '実践で確認する',
            '他人に説明する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 6,
          question: 'このレッスンで学んだ内容を他者に教える際のポイントは？',
          options: [
            '専門用語を多用する',
            '分かりやすい言葉で説明する',
            '実例を交えて説明する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 7,
          question: '学習内容を応用する際に考慮すべき点は？',
          options: [
            '理論的な正確性',
            '実践的な効果',
            '時間的な効率',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 8,
          question: 'このレッスンの内容を実践する際の準備として必要なことは？',
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
          question: 'このレッスンの学習を完了した後の次のステップは？',
          options: [
            '次のレッスンに進む',
            '復習を繰り返す',
            '実践を開始する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 11,
          question: '学習内容の理解を深めるために重要なことは？',
          options: [
            '暗記すること',
            '実践すること',
            '理論を学ぶこと',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 12,
          question: 'このレッスンで学んだ内容を実際に活用する際の注意点は？',
          options: [
            '特に注意点はない',
            '基本的なルールを守る',
            '専門家の指導を受ける',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 13,
          question: '学習した内容の効果を最大化する方法は？',
          options: [
            '理論を完璧に理解する',
            '実践を繰り返す',
            '継続的に学習する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 14,
          question: 'このレッスンの内容を復習する際の効果的な方法は？',
          options: [
            '一度だけ読む',
            '定期的に復習する',
            '実践と組み合わせる',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 15,
          question: '学習した内容の理解度を確認する方法は？',
          options: [
            'テストを受ける',
            '実践で確認する',
            '他人に説明する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 16,
          question: 'このレッスンで学んだ内容を他者に教える際のポイントは？',
          options: [
            '専門用語を多用する',
            '分かりやすい言葉で説明する',
            '実例を交えて説明する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 17,
          question: '学習内容を応用する際に考慮すべき点は？',
          options: [
            '理論的な正確性',
            '実践的な効果',
            '時間的な効率',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 18,
          question: 'このレッスンの内容を実践する際の準備として必要なことは？',
          options: [
            '理論の完全な理解',
            '実践的な準備',
            '専門家の指導',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 19,
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
          id: 20,
          question: 'このレッスンの学習を完了した後の次のステップは？',
          options: [
            '次のレッスンに進む',
            '復習を繰り返す',
            '実践を開始する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 21,
          question: '学習内容の理解を深めるために重要なことは？',
          options: [
            '暗記すること',
            '実践すること',
            '理論を学ぶこと',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 22,
          question: 'このレッスンで学んだ内容を実際に活用する際の注意点は？',
          options: [
            '特に注意点はない',
            '基本的なルールを守る',
            '専門家の指導を受ける',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 23,
          question: '学習した内容の効果を最大化する方法は？',
          options: [
            '理論を完璧に理解する',
            '実践を繰り返す',
            '継続的に学習する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 24,
          question: 'このレッスンの内容を復習する際の効果的な方法は？',
          options: [
            '一度だけ読む',
            '定期的に復習する',
            '実践と組み合わせる',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 25,
          question: '学習した内容の理解度を確認する方法は？',
          options: [
            'テストを受ける',
            '実践で確認する',
            '他人に説明する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 26,
          question: 'このレッスンで学んだ内容を他者に教える際のポイントは？',
          options: [
            '専門用語を多用する',
            '分かりやすい言葉で説明する',
            '実例を交えて説明する',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 27,
          question: '学習内容を応用する際に考慮すべき点は？',
          options: [
            '理論的な正確性',
            '実践的な効果',
            '時間的な効率',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 28,
          question: 'このレッスンの内容を実践する際の準備として必要なことは？',
          options: [
            '理論の完全な理解',
            '実践的な準備',
            '専門家の指導',
            'すべての選択肢が正しい'
          ],
          correctAnswer: 3
        },
        {
          id: 29,
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
          id: 30,
          question: 'このレッスンの学習を完了した後の次のステップは？',
          options: [
            '次のレッスンに進む',
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
      
      // テスト結果を提出
      const response = await fetch('http://localhost:5050/api/learning/test/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId: parseInt(currentLesson),
          testType: 'lesson',
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
              testType: 'lesson',
              lessonId: currentLesson,
              lessonTitle: lessonData?.title || `第${currentLesson}回`,
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
            レッスンテストを準備中...
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
                <h1 className="text-2xl font-bold">レッスンまとめテスト</h1>
                <span className="text-blue-100 text-sm">
                  {lessonData?.title} - 全セクション
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

export default LessonTestPage;


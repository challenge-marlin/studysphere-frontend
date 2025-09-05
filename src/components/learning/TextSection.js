import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SessionStorageManager } from '../../utils/sessionStorage';

const TextSection = ({
  lessonData,
  textContent,
  textLoading,
  textContainerRef,
  onTextContentUpdate // テキスト内容更新のコールバック
}) => {
  const [pdfTextContent, setPdfTextContent] = useState('');
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [pdfProcessingError, setPdfProcessingError] = useState(null);
  
  // 処理のキャンセル用のAbortController
  const abortControllerRef = useRef(null);
  // 処理のタイムアウト用のタイマー
  const timeoutRef = useRef(null);
  // 処理済みのS3キーを記録（無限ループ防止）
  const processedS3KeyRef = useRef(null);

  // PDFファイルの場合はテキスト抽出を試行
  useEffect(() => {
    console.log('TextSection useEffect - 実行開始');
    console.log('TextSection - 受け取ったlessonData:', lessonData);
    console.log('TextSection - lessonData.file_type:', lessonData?.file_type);
    console.log('TextSection - lessonData.s3_key:', lessonData?.s3_key);
    console.log('TextSection - pdfTextContent:', pdfTextContent);
    
    // S3キーの詳細なデバッグ情報
    if (lessonData?.s3_key) {
      console.log('S3キーの詳細:', {
        s3_key: lessonData.s3_key,
        keyType: typeof lessonData.s3_key,
        keyLength: lessonData.s3_key.length,
        isEmpty: lessonData.s3_key.trim() === '',
        containsSpaces: lessonData.s3_key.includes(' '),
        containsSpecialChars: /[<>:"|?*]/.test(lessonData.s3_key)
      });
      
      // セッションストレージの状態を確認
      const hasStoredContext = SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key);
      console.log('セッションストレージ状態:', {
        hasStoredContext,
        lessonId: lessonData.id,
        s3Key: lessonData.s3_key
      });
      
           if (hasStoredContext) {
       const storedContext = SessionStorageManager.getContext(lessonData.id, lessonData.s3_key);
       console.log('保存済みコンテキスト情報:', storedContext.metadata);
       
       // 既存のコンテキストがある場合は、親コンポーネントに完了状態を通知
       if (onTextContentUpdate) {
         console.log('既存コンテキストを親コンポーネントに通知:', { contextLength: storedContext.context.length });
         onTextContentUpdate(storedContext.context);
       }
       
       // 処理済みのS3キーを記録
       processedS3KeyRef.current = lessonData.s3_key;
       
       return; // 既存のコンテキストがある場合は処理をスキップ
     }
    }
    
         console.log('TextSection useEffect - 条件チェック:', {
       fileType: lessonData?.file_type,
       s3Key: lessonData?.s3_key,
       pdfTextContent: pdfTextContent,
       hasS3Key: !!lessonData?.s3_key,
       shouldExtract: lessonData?.file_type === 'pdf' && lessonData?.s3_key && !pdfTextContent
     });
     
     if (lessonData?.file_type === 'pdf' && lessonData?.s3_key && !pdfTextContent) {
       console.log('PDFテキスト抽出を開始します:', lessonData.s3_key);
       extractPdfText(lessonData.s3_key);
     } else {
       console.log('PDFテキスト抽出の条件が満たされていません');
     }
   }, [lessonData]); // pdfTextContentを依存配列から削除

  // コンポーネントのアンマウント時に処理をクリーンアップ
  useEffect(() => {
    return () => {
      // タイムアウトタイマーをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 進行中の処理をキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // PDFからテキストを抽出
  const extractPdfText = async (s3Key, retryCount = 0) => {
    if (!s3Key) {
      console.error('extractPdfText: s3Keyが提供されていません');
      setPdfProcessingError('S3キーが提供されていません');
      return;
    }
    
    // セッションストレージから既存のコンテキストを確認
    const existingContext = SessionStorageManager.getContext(lessonData?.id, s3Key);
    if (existingContext) {
      console.log('セッションストレージから既存のコンテキストを使用:', {
        contextLength: existingContext.context.length,
        savedAt: existingContext.metadata.savedAt
      });
      
      setPdfTextContent(existingContext.context);
      processedS3KeyRef.current = s3Key;
      
      if (onTextContentUpdate) {
        onTextContentUpdate(existingContext.context);
      }
      
           return; // 既存のコンテキストがある場合は処理をスキップ
   }
    
    console.log('extractPdfText: 開始', {
      s3Key,
      lessonId: lessonData?.id,
      lessonTitle: lessonData?.title,
      retryCount
    });
    
    // 既に処理中の場合は新しい処理を開始しない
    if (isPdfProcessing) {
      console.log('既にPDF処理が進行中です。新しい処理を開始しません。');
      return;
    }
    
    setIsPdfProcessing(true);
    setPdfProcessingError(null);
    
    // 新しいAbortControllerを作成
    abortControllerRef.current = new AbortController();
    
    try {
      console.log(`PDFテキスト抽出開始 (試行回数: ${retryCount + 1})`, { 
        s3Key,
        lessonId: lessonData?.id,
        lessonTitle: lessonData?.title
      });
      
      // タイムアウト処理を設定（5分に短縮）
      timeoutRef.current = setTimeout(() => {
        console.warn('PDFテキスト抽出がタイムアウトしました');
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const timeoutMessage = 'PDFテキスト抽出がタイムアウトしました。ファイルサイズが大きすぎる可能性があります。';
        setPdfProcessingError(timeoutMessage);
        setIsPdfProcessing(false);
        // タイムアウト時も親コンポーネントに通知
        if (onTextContentUpdate) {
          onTextContentUpdate(`エラー: ${timeoutMessage}`);
        }
      }, 5 * 60 * 1000); // 5分に短縮
      
      // PDFテキスト抽出APIを呼び出し
      const response = await fetch(`/api/learning/extract-pdf-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          s3Key: s3Key,
          lessonId: lessonData?.id
        }),
        signal: abortControllerRef.current.signal
      });

      // タイムアウトタイマーをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('PDFテキスト抽出API応答:', data);
        
        if (data.success && data.textContent) {
          setPdfTextContent(data.textContent);
          // 処理済みのS3キーを記録
          processedS3KeyRef.current = s3Key;
          
          // セッションストレージにコンテキストを保存
          const saveSuccess = SessionStorageManager.saveContext(
            lessonData?.id,
            s3Key,
            data.textContent,
            {
              fileType: lessonData?.file_type,
              lessonTitle: lessonData?.title,
              processingTime: data.processingTime || 0
            }
          );
          
          if (saveSuccess) {
            console.log('コンテキストをセッションストレージに保存完了');
          }
          
          // 親コンポーネントにテキスト内容を通知
          if (onTextContentUpdate) {
            onTextContentUpdate(data.textContent);
          }
          console.log('PDFテキスト抽出成功:', { textLength: data.textContent.length });
        } else {
          console.warn('PDFテキスト抽出失敗:', data.message);
          const errorMessage = `テキスト抽出に失敗しました: ${data.message}`;
          setPdfProcessingError(errorMessage);
          setPdfTextContent(errorMessage);
          // エラー時も親コンポーネントに通知
          if (onTextContentUpdate) {
            onTextContentUpdate(errorMessage);
          }
        }
      } else {
        const errorMessage = `PDFテキスト抽出API呼び出し失敗: ${response.status}`;
        console.error(errorMessage);
        
        // エラーレスポンスの詳細を確認
        try {
          const errorData = await response.json();
          console.error('エラー詳細:', errorData);
          
          // S3キーが存在しない場合の詳細なエラーメッセージ
          if (errorData.error === 'The specified key does not exist.') {
            const detailedError = `PDFファイルが見つかりません。S3キー: ${s3Key}`;
            console.error(detailedError);
            setPdfProcessingError(detailedError);
            setPdfTextContent(detailedError);
            // エラー時も親コンポーネントに通知
            if (onTextContentUpdate) {
              onTextContentUpdate(detailedError);
            }
          } else {
            const errorMsg = `テキスト抽出に失敗しました: ${errorData.message || '不明なエラー'}`;
            setPdfProcessingError(errorMsg);
            setPdfTextContent(errorMsg);
            // エラー時も親コンポーネントに通知
            if (onTextContentUpdate) {
              onTextContentUpdate(errorMsg);
            }
          }
                  } catch (parseError) {
            console.error('エラーレスポンスの解析に失敗:', parseError);
            const errorMsg = `テキスト抽出に失敗しました (HTTP ${response.status})`;
            setPdfProcessingError(errorMsg);
            setPdfTextContent(errorMsg);
            // エラー時も親コンポーネントに通知
            if (onTextContentUpdate) {
              onTextContentUpdate(errorMsg);
            }
          }
        
        // リトライロジック（最大3回）
        if (retryCount < 2 && response.status >= 500) {
          console.log(`${retryCount + 1}回目のリトライを実行します...`);
          setTimeout(() => {
            extractPdfText(s3Key, retryCount + 1);
          }, 2000 * (retryCount + 1)); // 指数バックオフ
          return;
        }
      }
    } catch (error) {
      // タイムアウトタイマーをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // AbortErrorの場合は処理を中断
      if (error.name === 'AbortError') {
        console.log('PDFテキスト抽出がキャンセルされました');
        setPdfProcessingError('PDFテキスト抽出がキャンセルされました');
        return;
      }
      
      console.error('PDFテキスト抽出エラー:', error);
      
      // リトライロジック（ネットワークエラーの場合）
      if (retryCount < 2 && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
        console.log(`${retryCount + 1}回目のリトライを実行します...`);
        setTimeout(() => {
          extractPdfText(s3Key, retryCount + 1);
        }, 2000 * (retryCount + 1));
        return;
      }
      
              const errorMessage = `テキスト抽出中にエラーが発生しました: ${error.message}`;
        setPdfProcessingError(errorMessage);
        setPdfTextContent(errorMessage);
        // エラー時も親コンポーネントに通知
        if (onTextContentUpdate) {
          onTextContentUpdate(errorMessage);
        }
    } finally {
      setIsPdfProcessing(false);
      // AbortControllerをクリア
      abortControllerRef.current = null;
    }
  };

  // 処理をキャンセル
  const cancelPdfProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('PDFテキスト抽出をキャンセルしました');
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPdfProcessing(false);
    setPdfProcessingError(null);
  };

  // 表示するテキスト内容を決定
  const displayTextContent = () => {
    if (lessonData?.file_type === 'pdf') {
      if (pdfProcessingError) {
        return `エラー: ${pdfProcessingError}`;
      }
      if (isPdfProcessing) {
        return 'PDFファイルの処理中...';
      }
      return pdfTextContent || 'PDFファイルの読み込み中...';
    }
    return textContent || 'テキスト内容がありません';
  };

  // テキスト内容の長さを取得（AIアシスタント用）
  const getTextLength = () => {
    const content = displayTextContent();
    return content ? content.length : 0;
  };

  if (textLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📄</span>
          <h3 className="text-xl font-bold text-gray-800">テキスト内容</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-medium">テキストを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📄</span>
        <h3 className="text-xl font-bold text-gray-800">テキスト内容</h3>
        {lessonData?.file_type === 'pdf' && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            PDF
          </span>
        )}
                 {/* PDF処理中のキャンセルボタン */}
         {lessonData?.file_type === 'pdf' && isPdfProcessing && (
           <button
             onClick={cancelPdfProcessing}
             className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
             title="処理をキャンセル"
           >
             キャンセル
           </button>
         )}
         

      </div>
      
      {/* エラーメッセージ表示 */}
      {pdfProcessingError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-700 text-sm">{pdfProcessingError}</p>
          </div>
                     <button
             onClick={() => {
               setPdfProcessingError(null);
               if (lessonData?.s3_key) {
                 extractPdfText(lessonData.s3_key);
               }
             }}
             className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
           >
             再試行
           </button>
        </div>
      )}
      
      {/* テキスト内容表示 */}
      <div 
        ref={textContainerRef}
        className="h-[85vh] overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg p-2 bg-gray-50"
      >
        {lessonData?.file_type === 'pdf' ? (
          <div className="h-full">
            {/* PDFをiframeで表示 */}
            <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden relative">
              <iframe
                src={lessonData.pdfUrl || `${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learning/pdf-viewer?key=${encodeURIComponent(lessonData.s3_key)}`}
                title="PDF Viewer"
                className="w-full h-full"
                frameBorder="0"
                allow="fullscreen"
                onError={(e) => {
                  console.error('PDF iframe 読み込みエラー:', e);
                  document.getElementById('pdf-error-fallback').classList.remove('hidden');
                }}
                onLoad={() => {
                  console.log('PDF iframe 読み込み完了');
                  document.getElementById('pdf-error-fallback').classList.add('hidden');
                }}
              />
              {/* エラー時のフォールバック */}
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" id="pdf-error-fallback">
                <div className="text-center">
                  <p className="text-gray-600 mb-3">PDFの表示に失敗しました</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.open(lessonData.pdfUrl || `${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learning/pdf-viewer?key=${encodeURIComponent(lessonData.s3_key)}`, '_blank')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                    >
                      新しいタブで開く
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      再読み込み
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    S3キー: {lessonData.s3_key}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 id={`h1-${Date.now()}-${Math.random()}`} className="text-xl font-bold text-gray-800 mb-3" {...props} />,
                h2: ({node, ...props}) => <h2 id={`h2-${Date.now()}-${Math.random()}`} className="text-lg font-semibold text-gray-700 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 id={`h3-${Date.now()}-${Math.random()}`} className="text-base font-medium text-gray-600 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-700 mb-2 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-700 mb-2 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-700 mb-2 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />,
                em: ({node, ...props}) => <em className="italic text-gray-600" {...props} />,
                code: ({node, ...props}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600" {...props} />
              }}
            >
              {textContent || 'テキスト内容がありません'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* テキスト情報 */}
      <div className="mt-3 text-xs text-gray-500">
        文字数: {getTextLength()}文字
        {lessonData?.file_type === 'pdf' && pdfTextContent && (
          <span className="ml-2 text-blue-600">
            ✓ AIアシスタントで利用可能
          </span>
        )}
      </div>
    </div>
  );
};

export default TextSection;

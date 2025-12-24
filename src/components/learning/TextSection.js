import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownRenderer from './MarkdownRenderer';
import { SessionStorageManager } from '../../utils/sessionStorage';
import { API_BASE_URL } from '../../config/apiConfig';

const TextSection = ({
  lessonData,
  textContent,
  textLoading,
  textContainerRef,
  onTextContentUpdate, // テキスト内容更新のコールバック
  sectionData, // セクションデータ
  currentSection // 現在のセクションインデックス
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

  // 複数テキストが存在するかどうかを判定する関数
  const hasMultipleTexts = (sections) => {
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return false;
    }
    
    // text_file_keyを持つセクションを抽出
    const sectionsWithText = sections.filter(section => section.text_file_key);
    
    // text_file_keyを持つセクションが2つ以上ある場合、複数テキストと判定
    if (sectionsWithText.length >= 2) {
      // 異なるtext_file_keyが存在するか確認
      const uniqueTextFileKeys = new Set(
        sectionsWithText.map(section => section.text_file_key)
      );
      return uniqueTextFileKeys.size > 1;
    }
    
    return false;
  };

  // file_typeがPDFかどうかを判定する関数
  const isPdfFile = (fileType, s3Key) => {
    if (!fileType && !s3Key) return false;
    const lowerFileType = fileType?.toLowerCase() || '';
    const lowerS3Key = s3Key?.toLowerCase() || '';
    
    // MD、TXT、RTFファイルの場合はPDFではない
    if (lowerFileType === 'text/markdown' || lowerFileType === 'md' || 
        lowerFileType === 'text/plain' || lowerFileType === 'txt' ||
        lowerFileType === 'application/rtf' || lowerFileType === 'rtf') {
      console.log('isPdfFile: テキストファイルとして判定（PDFではない）', {
        fileType: lowerFileType,
        s3Key: lowerS3Key
      });
      return false;
    }
    
    // PDF判定
    const isPdf = lowerFileType === 'pdf' || 
                  lowerFileType === 'application/pdf' ||
                  lowerS3Key.endsWith('.pdf');
    
    console.log('isPdfFile: PDF判定結果', {
      fileType: lowerFileType,
      s3Key: lowerS3Key,
      isPdf: isPdf
    });
    
    return isPdf;
  };

  // テキストファイルの処理（PDF、TXT、MD、RTFすべてに対応）
  useEffect(() => {
    console.log('TextSection useEffect - 実行開始');
    console.log('TextSection - 受け取ったlessonData:', lessonData);
    console.log('TextSection - lessonData.file_type:', lessonData?.file_type);
    console.log('TextSection - lessonData.s3_key:', lessonData?.s3_key);
    console.log('TextSection - pdfTextContent:', pdfTextContent);
    console.log('TextSection - textContent:', textContent);
    console.log('TextSection - sectionData:', sectionData);
    console.log('TextSection - sectionData type:', typeof sectionData);
    console.log('TextSection - sectionData isArray:', Array.isArray(sectionData));
    console.log('TextSection - sectionData length:', Array.isArray(sectionData) ? sectionData.length : 'N/A');
    console.log('TextSection - currentSection:', currentSection);
    
    // セクションデータの確認を最初に行う
    // 複数のテキストを持たない学習画面では、セクションにtext_file_keyが存在しない場合がある
    
    // セクションデータがnullの場合（まだ読み込まれていない）は、セクションデータが読み込まれるまで待つ
    if (sectionData === null || sectionData === undefined) {
      console.log('⚠️ セクションデータがまだ読み込まれていません。セクションデータの読み込みを待ちます');
      return;
    }
    
    // セクションデータが空配列の場合（複数のテキストを持たない学習画面）
    // この場合、lessonData.s3_keyがあっても処理をスキップする
    if (Array.isArray(sectionData) && sectionData.length === 0) {
      console.log('⚠️ セクションデータが空です。テキストファイルの読み込みをスキップします（複数のテキストを持たない学習画面）', {
        sectionDataLength: sectionData.length,
        lessonDataS3Key: lessonData?.s3_key,
        lessonDataFileType: lessonData?.file_type
      });
      // テキストファイルが存在しない場合は、親コンポーネントに空のコンテンツを通知
      if (onTextContentUpdate) {
        onTextContentUpdate('');
      }
      return;
    }
    
    // セクションデータが存在する場合、現在のセクションにtext_file_keyが存在するか確認
    if (Array.isArray(sectionData) && sectionData.length > 0) {
      const currentSectionData = sectionData[currentSection];
      if (currentSectionData && !currentSectionData.text_file_key) {
        console.log('⚠️ 現在のセクションにtext_file_keyが存在しません。テキストファイルの読み込みをスキップします:', {
          currentSection,
          sectionTitle: currentSectionData.section_title,
          hasTextFileKey: !!currentSectionData.text_file_key
        });
        // テキストファイルが存在しない場合は、既存のtextContentを保持（空で上書きしない）
        // レッスンデータから取得したtextContentがある場合は保持する
        if (!textContent && onTextContentUpdate) {
          onTextContentUpdate('');
        }
        return;
      }
      
      // 複数テキストが存在するかどうかを判定
      const multipleTexts = hasMultipleTexts(sectionData);
      
      // セクションデータが存在する場合、セクションのtext_file_keyとlessonData.s3_keyが一致するか確認
      // ただし、複数テキストが存在する場合は、このチェックをスキップ（セクション切り替え時に常に読み込む）
      // セクションのtext_file_keyはファイル名のみ、lessonData.s3_keyは完全パスの可能性がある
      if (!multipleTexts && currentSectionData && currentSectionData.text_file_key && lessonData?.s3_key) {
        const sectionTextFileKey = currentSectionData.text_file_key;
        const lessonS3Key = lessonData.s3_key;
        
        // ファイル名を抽出して比較
        const extractFileName = (key) => {
          if (!key) return '';
          const parts = key.split('/');
          return parts[parts.length - 1].trim().toLowerCase();
        };
        
        const sectionFileName = extractFileName(sectionTextFileKey);
        const lessonFileName = extractFileName(lessonS3Key);
        
        // ファイル名が一致しない場合、テキストファイルの読み込みをスキップ
        if (sectionFileName !== lessonFileName) {
          console.log('⚠️ セクションのtext_file_keyとlessonData.s3_keyが一致しません。テキストファイルの読み込みをスキップします:', {
            sectionTextFileKey,
            lessonS3Key,
            sectionFileName,
            lessonFileName,
            currentSection
          });
          // 既存のtextContentを保持（空で上書きしない）
          if (!textContent && onTextContentUpdate) {
            onTextContentUpdate('');
          }
          return;
        }
      }
      
      // 複数テキストが存在する場合のログ
      if (multipleTexts) {
        console.log('複数テキストが存在するため、ファイル名一致チェックをスキップします:', {
          currentSection,
          sectionTextFileKey: currentSectionData?.text_file_key,
          lessonS3Key: lessonData?.s3_key
        });
      }
      
      // すべてのセクションにtext_file_keyがない場合もスキップ
      const hasAnyTextFileKey = sectionData.some(section => section.text_file_key);
      if (!hasAnyTextFileKey) {
        console.log('⚠️ すべてのセクションにtext_file_keyが存在しません。テキストファイルの読み込みをスキップします');
        // 既存のtextContentを保持（空で上書きしない）
        if (!textContent && onTextContentUpdate) {
          onTextContentUpdate('');
        }
        return;
      }
    }
    
    // レッスンデータが存在しない場合は処理をスキップ
    if (!lessonData || !lessonData.s3_key) {
      console.log('⚠️ レッスンデータまたはS3キーが存在しません');
      return;
    }
    
    // セクションデータが空配列の場合、lessonData.s3_keyがあっても処理をスキップ（二重チェック）
    // これは、セクションデータが空配列に設定される前に処理が実行される可能性があるため
    if (Array.isArray(sectionData) && sectionData.length === 0) {
      console.log('⚠️ セクションデータが空です（二重チェック）。テキストファイルの読み込みをスキップします');
      if (onTextContentUpdate) {
        onTextContentUpdate('');
      }
      return;
    }
    
    // PDF判定
    const isPdf = isPdfFile(lessonData.file_type, lessonData.s3_key);
    console.log('TextSection - PDF判定結果:', {
      fileType: lessonData.file_type,
      fileTypeType: typeof lessonData.file_type,
      s3Key: lessonData.s3_key,
      s3KeyEndsWithMd: lessonData.s3_key?.toLowerCase().endsWith('.md'),
      s3KeyEndsWithPdf: lessonData.s3_key?.toLowerCase().endsWith('.pdf'),
      isPdf: isPdf,
      lessonData: {
        id: lessonData.id,
        title: lessonData.title,
        file_type: lessonData.file_type,
        s3_key: lessonData.s3_key
      }
    });
    
    // S3キーの詳細なデバッグ情報
    console.log('S3キーの詳細:', {
      s3_key: lessonData.s3_key,
      keyType: typeof lessonData.s3_key,
      keyLength: lessonData.s3_key.length,
      isEmpty: lessonData.s3_key.trim() === '',
      containsSpaces: lessonData.s3_key.includes(' '),
      containsSpecialChars: /[<>:"|?*]/.test(lessonData.s3_key)
    });
    
    // セッションストレージの状態を確認
    const hasStoredContext = SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key, lessonData.file_type);
    console.log('セッションストレージ状態:', {
      hasStoredContext,
      lessonId: lessonData.id,
      s3Key: lessonData.s3_key
    });
    
    // 既存のコンテキストがある場合は、親コンポーネントに完了状態を通知
    if (hasStoredContext) {
      const storedContext = SessionStorageManager.getContext(lessonData.id, lessonData.s3_key, lessonData.file_type);
      console.log('保存済みコンテキスト情報:', storedContext.metadata);
      
      if (onTextContentUpdate) {
        console.log('既存コンテキストを親コンポーネントに通知:', { contextLength: storedContext.context.length });
        onTextContentUpdate(storedContext.context);
      }
      
      // 処理済みのS3キーを記録
      processedS3KeyRef.current = lessonData.s3_key;
      
      return; // 既存のコンテキストがある場合は処理をスキップ
    }
    
    // PDFファイルの場合はテキスト抽出を実行
    // ただし、既に処理済みのS3キーの場合は再実行しない
    if (isPdf && lessonData?.s3_key && !pdfTextContent && processedS3KeyRef.current !== lessonData.s3_key) {
      console.log('PDFテキスト抽出を開始します:', {
        s3Key: lessonData.s3_key,
        fileType: lessonData.file_type,
        isPdf: isPdf,
        processedS3Key: processedS3KeyRef.current
      });
      extractPdfText(lessonData.s3_key);
    } else if (isPdf && lessonData?.s3_key && processedS3KeyRef.current === lessonData.s3_key) {
      console.log('PDF処理は既に完了しています。再実行しません:', {
        s3Key: lessonData.s3_key,
        processedS3Key: processedS3KeyRef.current
      });
    } else if (isPdf && lessonData?.s3_key && pdfTextContent) {
      console.log('PDFテキストは既に取得済みです。再取得しません:', {
        s3Key: lessonData.s3_key,
        pdfTextContentLength: pdfTextContent.length
      });
    }
    // TXT、MD、RTFファイルの場合（PDF以外のテキストファイル）
    else if (!isPdf && (lessonData?.file_type === 'txt' || lessonData?.file_type === 'md' || lessonData?.file_type === 'text/markdown' || lessonData?.file_type === 'text/plain' || lessonData?.file_type === 'application/rtf')) {
      // textContentが存在する場合はセッションストレージに保存
      if (textContent && textContent.length > 0) {
        console.log('テキストファイルのコンテキストをセッションストレージに保存:', {
          fileType: lessonData.file_type,
          textLength: textContent.length,
          s3Key: lessonData.s3_key
        });
        
        // セッションストレージにコンテキストを保存
        const saveSuccess = SessionStorageManager.saveContext(
          lessonData.id,
          lessonData.s3_key,
          textContent,
          {
            fileType: lessonData.file_type,
            lessonTitle: lessonData.title,
            processingTime: 0 // テキストファイルは即座に利用可能
          }
        );
        
        if (saveSuccess) {
          console.log('テキストファイルのコンテキストをセッションストレージに保存完了');
          // 親コンポーネントにテキスト内容を通知
          if (onTextContentUpdate) {
            onTextContentUpdate(textContent);
          }
          // 処理済みのS3キーを記録
          processedS3KeyRef.current = lessonData.s3_key;
        } else {
          console.error('テキストファイルのコンテキスト保存に失敗');
        }
        // textContentが存在する場合は、テキストファイルの読み込みをスキップ
        return;
      } 
      // textContentが空で、s3_keyが変更された場合は、APIからテキストファイルを読み込む
      else if (lessonData?.s3_key && processedS3KeyRef.current !== lessonData.s3_key) {
        // セクションデータが空配列の場合、テキストファイルの読み込みをスキップ（最終チェック）
        if (Array.isArray(sectionData) && sectionData.length === 0) {
          console.log('⚠️ セクションデータが空です（最終チェック）。テキストファイルの読み込みをスキップします');
          if (onTextContentUpdate) {
            onTextContentUpdate('');
          }
          return;
        }
        
        // 複数テキストが存在するかどうかを判定
        const multipleTexts = hasMultipleTexts(sectionData);
        
        // セクションデータが存在する場合、セクションのtext_file_keyとlessonData.s3_keyが一致するか確認
        // ただし、複数テキストが存在する場合は、このチェックをスキップ（セクション切り替え時に常に読み込む）
        if (!multipleTexts && Array.isArray(sectionData) && sectionData.length > 0) {
          const currentSectionData = sectionData[currentSection];
          if (currentSectionData && currentSectionData.text_file_key && lessonData?.s3_key) {
            const sectionTextFileKey = currentSectionData.text_file_key;
            const lessonS3Key = lessonData.s3_key;
            
            // ファイル名を抽出して比較
            const extractFileName = (key) => {
              if (!key) return '';
              const parts = key.split('/');
              return parts[parts.length - 1].trim().toLowerCase();
            };
            
            const sectionFileName = extractFileName(sectionTextFileKey);
            const lessonFileName = extractFileName(lessonS3Key);
            
            // ファイル名が一致しない場合、テキストファイルの読み込みをスキップ
            if (sectionFileName !== lessonFileName) {
              console.log('⚠️ セクションのtext_file_keyとlessonData.s3_keyが一致しません（最終チェック）。テキストファイルの読み込みをスキップします:', {
                sectionTextFileKey,
                lessonS3Key,
                sectionFileName,
                lessonFileName,
                currentSection
              });
              // 既存のtextContentを保持（空で上書きしない）
              if (!textContent && onTextContentUpdate) {
                onTextContentUpdate('');
              }
              return;
            }
          }
        }
        
        // 複数テキストが存在する場合のログ（最終チェック）
        if (multipleTexts) {
          console.log('複数テキストが存在するため、ファイル名一致チェックをスキップします（最終チェック）:', {
            currentSection,
            sectionTextFileKey: sectionData?.[currentSection]?.text_file_key,
            lessonS3Key: lessonData?.s3_key
          });
        }
        
        console.log('テキストファイルをAPIから読み込みます:', {
          s3Key: lessonData.s3_key,
          fileType: lessonData.file_type,
          sectionDataLength: sectionData?.length,
          hasSectionData: !!sectionData,
          hasTextContent: !!textContent,
          textContentLength: textContent?.length || 0
        });
        
        // テキストファイルを読み込む
        fetchTextFile(lessonData.s3_key, lessonData.file_type);
      }
    } else {
      console.log('テキスト処理の条件が満たされていません:', {
        isPdf: isPdf,
        fileType: lessonData?.file_type,
        s3Key: lessonData?.s3_key,
        hasTextContent: !!textContent,
        hasPdfTextContent: !!pdfTextContent
      });
    }
   }, [lessonData, textContent, pdfTextContent, sectionData, currentSection]); // textContent、pdfTextContent、sectionData、currentSectionを依存配列に追加

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

  // テキストファイルを読み込む
  const fetchTextFile = async (s3Key, fileType) => {
    if (!s3Key) {
      console.error('fetchTextFile: s3Keyが提供されていません');
      return;
    }
    
    // セクションデータが空配列の場合、テキストファイルの読み込みをスキップ（関数内チェック）
    if (Array.isArray(sectionData) && sectionData.length === 0) {
      console.log('⚠️ fetchTextFile: セクションデータが空です。テキストファイルの読み込みをスキップします');
      if (onTextContentUpdate) {
        onTextContentUpdate('');
      }
      return;
    }
    
    console.log('fetchTextFile: 開始', {
      s3Key,
      fileType,
      lessonId: lessonData?.id,
      sectionDataLength: sectionData?.length,
      hasSectionData: !!sectionData
    });
    
    try {
      // テキスト抽出APIを使用してテキストファイルを読み込む
      // クエリパラメータとして送信することで、CORSエラーを回避（日本語を含む長いパスの問題を解決）
      const response = await fetch(`${API_BASE_URL}/api/test/learning/extract-text?s3Key=${encodeURIComponent(s3Key)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.text) {
          const fileContent = data.data.text;
          
          console.log('テキストファイル読み込み成功:', {
            s3Key,
            fileType,
            contentLength: fileContent.length
          });
          
          // セッションストレージにコンテキストを保存
          const saveSuccess = SessionStorageManager.saveContext(
            lessonData?.id,
            s3Key,
            fileContent,
            {
              fileType: fileType,
              lessonTitle: lessonData?.title,
              processingTime: 0
            }
          );
          
          if (saveSuccess) {
            console.log('テキストファイルのコンテキストをセッションストレージに保存完了');
          }
          
          // 親コンポーネントにテキスト内容を通知（これによりtextLoadingがfalseになる）
          if (onTextContentUpdate) {
            onTextContentUpdate(fileContent);
          }
          
          // 処理済みのS3キーを記録
          processedS3KeyRef.current = s3Key;
        } else {
          console.error('テキストファイル読み込み失敗:', data.message);
          // エラー時も親コンポーネントに通知（textLoadingをfalseにするため）
          if (onTextContentUpdate) {
            onTextContentUpdate(`エラー: テキストファイルの読み込みに失敗しました: ${data.message || '不明なエラー'}`);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('テキストファイル読み込みAPIエラー:', response.status, errorData);
        
        // 404エラー（ファイルが見つからない）の場合は、空のコンテンツを通知
        // 複数のテキストを持たない学習画面では、テキストファイルが存在しないことが正常な状態である可能性がある
        if (response.status === 404) {
          console.log('テキストファイルが見つかりませんでした（404）。これは正常な状態である可能性があります:', {
            s3Key,
            fileType,
            lessonId: lessonData?.id
          });
          // エラー時も親コンポーネントに通知（textLoadingをfalseにするため）
          if (onTextContentUpdate) {
            onTextContentUpdate(''); // 空のコンテンツを通知
          }
        } else {
          // その他のエラーの場合はエラーメッセージを表示
          if (onTextContentUpdate) {
            onTextContentUpdate(`エラー: テキストファイルの読み込みに失敗しました (HTTP ${response.status})`);
          }
        }
      }
    } catch (error) {
      console.error('テキストファイル読み込みエラー:', error);
      
      // ネットワークエラーやCORSエラーの場合も適切に処理
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.warn('テキストファイルの読み込みに失敗しました（ネットワークエラーまたはCORSエラー）:', {
          s3Key,
          fileType,
          error: error.message
        });
        // エラー時も親コンポーネントに通知（textLoadingをfalseにするため）
        if (onTextContentUpdate) {
          onTextContentUpdate(''); // 空のコンテンツを通知（エラーメッセージを表示しない）
        }
      } else {
        // その他のエラーの場合はエラーメッセージを表示
        if (onTextContentUpdate) {
          onTextContentUpdate(`エラー: テキストファイルの読み込み中にエラーが発生しました: ${error.message}`);
        }
      }
    }
  };

  // PDFからテキストを抽出
  const extractPdfText = async (s3Key, retryCount = 0) => {
    if (!s3Key) {
      console.error('extractPdfText: s3Keyが提供されていません');
      setPdfProcessingError('S3キーが提供されていません');
      return;
    }
    
    // セッションストレージから既存のコンテキストを確認
    const existingContext = SessionStorageManager.getContext(lessonData?.id, s3Key, lessonData?.file_type);
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
      const response = await fetch(`${API_BASE_URL}/api/learning/extract-pdf-text`, {
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

  // RTFタグを除去してプレーンテキストに変換する関数
  const stripRtfTags = (rtfText) => {
    if (!rtfText) return '';
    
    // RTFタグを除去（基本的なRTFタグのみ）
    return rtfText
      .replace(/\\[a-z]+\d*\s?/g, '') // RTFコマンドを除去
      .replace(/[{}]/g, '') // 中括弧を除去
      .replace(/\\\s/g, ' ') // エスケープされたスペースを通常のスペースに
      .replace(/\s+/g, ' ') // 連続するスペースを1つに
      .trim();
  };

  // 表示するテキスト内容を決定
  const displayTextContent = () => {
    const isPdf = isPdfFile(lessonData?.file_type, lessonData?.s3_key);
    if (isPdf) {
      if (pdfProcessingError) {
        return `エラー: ${pdfProcessingError}`;
      }
      if (isPdfProcessing) {
        return 'PDFファイルの処理中...';
      }
      return pdfTextContent || 'PDFファイルの読み込み中...';
    }
    
    // RTFファイルの場合はタグを除去
    if (lessonData?.file_type === 'application/rtf' || lessonData?.s3_key?.toLowerCase().endsWith('.rtf')) {
      return stripRtfTags(textContent) || 'テキスト内容がありません';
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
      <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-4 workspace-widget-handle cursor-move select-none">
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
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-4 workspace-widget-handle cursor-move select-none">
        <span className="text-2xl">📄</span>
        <h3 className="text-xl font-bold text-gray-800">テキスト内容</h3>
        {isPdfFile(lessonData?.file_type, lessonData?.s3_key) && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            PDF
          </span>
        )}
                 {/* PDF処理中のキャンセルボタン */}
         {isPdfFile(lessonData?.file_type, lessonData?.s3_key) && isPdfProcessing && (
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
        className="flex-1 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg p-2 bg-gray-50 max-h-[1000px]"
      >
        {isPdfFile(lessonData?.file_type, lessonData?.s3_key) ? (
          <div className="h-full">
            {/* PDFをiframeで表示 */}
            <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden relative">
              <iframe
                src={lessonData.pdfUrl || `${API_BASE_URL}/api/learning/pdf-viewer?key=${encodeURIComponent(lessonData.s3_key)}`}
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
                      onClick={() => window.open(lessonData.pdfUrl || `${API_BASE_URL}/api/learning/pdf-viewer?key=${encodeURIComponent(lessonData.s3_key)}`, '_blank')}
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
            {/* MDファイルの場合はMarkdownとしてレンダリング */}
            {lessonData?.file_type === 'md' || lessonData?.file_type === 'text/markdown' || lessonData?.s3_key?.toLowerCase().endsWith('.md') ? (
              <MarkdownRenderer 
                content={displayTextContent()}
                showToc={false}
              />
            ) : (
              /* RTFファイルやその他のテキストファイルはプレーンテキストとして表示 */
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {displayTextContent()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* テキスト情報 */}
      {(isPdfFile(lessonData?.file_type, lessonData?.s3_key) && pdfTextContent) || 
       (lessonData?.file_type === 'txt' && textContent) ||
       (lessonData?.file_type === 'md' && textContent) ||
       (lessonData?.file_type === 'text/markdown' && textContent) ||
       (lessonData?.file_type === 'application/rtf' && textContent) ||
       (lessonData?.file_type === 'text/plain' && textContent) ? (
        <div className="mt-3 text-xs text-gray-500">
          <span className="text-blue-600">
            ✓ AIアシスタントで利用可能
          </span>
          {lessonData?.file_type === 'txt' && (
            <span className="ml-2 text-blue-600">
              📄 テキスト形式
            </span>
          )}
          {lessonData?.file_type === 'md' && (
            <span className="ml-2 text-green-600">
              📝 Markdown形式
            </span>
          )}
          {lessonData?.file_type === 'application/rtf' && (
            <span className="ml-2 text-orange-600">
              📄 RTF形式
            </span>
          )}
          {lessonData?.file_type === 'text/plain' && (
            <span className="ml-2 text-gray-600">
              📄 プレーンテキスト形式
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default TextSection;

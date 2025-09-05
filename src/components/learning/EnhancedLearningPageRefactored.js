import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useLearningProgress } from './LearningProgressManager';
import LearningHeader from './LearningHeader';
import VideoSection from './VideoSection';
import TextSection from './TextSection';
import ChatSection from './ChatSection';
import FileUploadSection from './FileUploadSection';
import UploadModal from './UploadModal';
import AIAssistantService from './AIAssistantService';
import { SessionStorageManager } from '../../utils/sessionStorage';

const EnhancedLearningPageRefactored = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [textContent, setTextContent] = useState('');
  const [pdfTextContent, setPdfTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(true);
  const [textScrollPosition, setTextScrollPosition] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [pdfTextExtracted, setPdfTextExtracted] = useState(false);
  const [pdfProcessingStatus, setPdfProcessingStatus] = useState('idle'); // 'idle', 'processing', 'completed', 'error'
  const [assignmentStatus, setAssignmentStatus] = useState({ hasAssignment: false, assignmentSubmitted: false });
  const textContainerRef = useRef(null);

  // 学習進捗管理フックを使用
  const {
    updateLearningProgress,
    handleStartLearning: progressHandleStartLearning,
    handleTestCompleted: progressHandleTestCompleted,
    handleAssignmentSubmitted
  } = useLearningProgress();

  // currentLessonの状態変化を追跡
  useEffect(() => {
    console.log(`🔄 currentLesson状態変化: ${currentLesson}`);
  }, [currentLesson]);

  // URLパラメータからコースIDとレッスンIDを取得
  useEffect(() => {
    const courseParam = searchParams.get('course');
    const lessonParam = searchParams.get('lesson');
    
    console.log('🔍 URLパラメータ解析:', { courseParam, lessonParam });
    
    if (courseParam) {
      fetchCourseData(courseParam);
    }
    
    if (lessonParam) {
      const lessonId = parseInt(lessonParam);
      console.log('📚 レッスンID解析:', { lessonParam, lessonId, isValid: lessonId >= 1 });
      if (lessonId >= 1) {
        console.log(`🔄 setCurrentLesson呼び出し前: currentLesson = ${currentLesson}, 新しい値 = ${lessonId}`);
        setCurrentLesson(lessonId);
        setTextLoading(true);
        console.log('✅ レッスンID設定完了:', lessonId);
      }
    }
  }, [searchParams]);

  // 学習開始時の進捗更新（初回のみ実行）
  useEffect(() => {
    let isFirstRun = true;
    if (isFirstRun && currentLesson && courseData) {
      isFirstRun = false;
      updateLearningProgress(currentLesson, courseData, currentUser);
    }
  }, [currentLesson, courseData, currentUser, updateLearningProgress]);

  // 課題提出状況を確認
  const checkAssignmentStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5050/api/learning/lesson/${currentLesson}/assignment-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignmentStatus(data.data);
        }
      }
    } catch (error) {
      console.error('課題提出状況確認エラー:', error);
    }
  };

  // レッスンデータをAPIから取得
  const fetchLessonData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const lessonId = currentLesson;
      const userId = localStorage.getItem('userId') || '1';
      
      console.log(`🚀 レッスンデータ取得開始:`, {
        currentLesson,
        lessonId,
        userId,
        retryCount: retryCount + 1,
        url: `http://localhost:5050/api/learning/lesson/${lessonId}/content`
      });
      
      const response = await fetch(`http://localhost:5050/api/learning/lesson/${lessonId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📡 APIレスポンス:`, {
        status: response.status,
        ok: response.ok,
        lessonId
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `レッスンデータの取得に失敗しました: ${response.status} ${errorData.message || ''}`;
        
        console.error(`❌ APIエラー:`, {
          status: response.status,
          errorData,
          lessonId
        });
        
        // サーバーエラーの場合はリトライ
        if (response.status >= 500 && retryCount < 2) {
          console.log(`${retryCount + 1}回目のリトライを実行します...`);
          setTimeout(() => {
            fetchLessonData(retryCount + 1);
          }, 2000 * (retryCount + 1));
          return;
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      console.log(`📊 レスポンスデータ:`, {
        success: data.success,
        lessonId: data.data?.id,
        lessonTitle: data.data?.title,
        courseId: data.data?.course_id
      });
      
      // レスポンスデータの完全な内容をログ出力
      console.log(`🔍 完全なレスポンスデータ:`, JSON.stringify(data, null, 2));
      
      if (data.success) {
        setLessonData(data.data);
        setTextLoading(false);
        
        // 課題提出状況を確認
        await checkAssignmentStatus();
        
        console.log('レッスンデータ取得成功:', data.data);
      } else {
        setError(data.message || 'レッスンデータの取得に失敗しました');
      }
    } catch (error) {
      console.error('レッスンデータ取得エラー:', error);
      
      // ネットワークエラーの場合はリトライ
      if (retryCount < 2 && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
        console.log(`${retryCount + 1}回目のリトライを実行します...`);
        setTimeout(() => {
          fetchLessonData(retryCount + 1);
        }, 2000 * (retryCount + 1));
        return;
      }
      
      setError('レッスンデータの取得中にエラーが発生しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // レッスンデータをAPIから取得（useEffect）
  useEffect(() => {
    if (currentLesson) {
      console.log(`🔄 useEffect: currentLesson変更検知 - レッスンID ${currentLesson}`);
      fetchLessonData();
    }
  }, [currentLesson]);

  // currentLessonが変更された時にレッスンデータを取得
  useEffect(() => {
    if (currentLesson) {
      console.log(`🔄 useEffect: currentLesson変更検知 - レッスンID ${currentLesson}`);
      
      // 前のレッスンの状態をクリア
      if (lessonData && lessonData.id !== currentLesson) {
        console.log(`🗑️ 前のレッスン${lessonData.id}の状態をクリア中...`);
        setLessonData(null);
        setTextContent('');
        setPdfTextContent('');
        setChatMessages([]);
        setCurrentSection(0);
        setPdfTextExtracted(false);
        setPdfProcessingStatus('idle');
      }
      
      // 新しいレッスンのデータを取得
      fetchLessonData();
    }
  }, [currentLesson]); // currentLessonのみに依存

  // コンポーネントのアンマウント時にセッションストレージをクリーンアップ
  useEffect(() => {
    return () => {
      // 必要に応じてセッションストレージをクリーンアップ
      // 注意: 他のタブにも影響する可能性があるため、慎重に使用
      // SessionStorageManager.clearAllContexts();
    };
  }, []);

  // レッスン変更処理
  const changeLesson = (lessonId) => {
    // 前のレッスンのコンテキストをクリア
    if (currentLesson) {
      SessionStorageManager.clearLessonContext(currentLesson);
    }
    
    setCurrentLesson(lessonId);
    setCurrentSection(0);
    setTextLoading(true);
    setChatMessages([]);
    setTextScrollPosition(0);
    setPdfTextExtracted(false);
    setPdfProcessingStatus('idle'); // PDF処理状態をリセット
    
    if (courseData) {
      navigate(`/student/enhanced-learning?course=${courseData.id}&lesson=${lessonId}`);
    }
    
    setTimeout(() => {
      fetchLessonData();
    }, 100);
  };

     // セクション変更処理
   const changeSection = (sectionIndex) => {
     if (!sectionData || !Array.isArray(sectionData)) return;
     
     const newSection = sectionData[sectionIndex];
     if (!newSection) return;
     
     setCurrentSection(sectionIndex);
     
     // 動画がある場合のみ更新
     if (newSection.video_id && newSection.youtube_url) {
       const sectionVideo = {
         id: newSection.video_id,
         title: newSection.video_title || 'セクション動画',
         description: newSection.video_description || '',
         youtube_url: newSection.youtube_url,
         duration: newSection.video_duration || ''
       };
       
       setLessonData(prev => ({
         ...prev,
         videos: [sectionVideo]
       }));
     }
     
     // セクション固有のテキストファイルがある場合は、新しいコンテキストで処理
     if (newSection.text_file_key && newSection.text_file_key !== lessonData?.s3_key) {
       console.log('セクション変更: 新しいテキストファイルを検出:', newSection.text_file_key);
       
       // 新しいセクション用のlessonDataを設定
       setLessonData(prev => ({
         ...prev,
         s3_key: newSection.text_file_key, // セクション固有のS3キー
         file_type: 'pdf'
       }));
       
       // PDF処理状態をリセット
       setPdfProcessingStatus('processing');
       setPdfTextExtracted(false);
       setTextContent('');
       setPdfTextContent('');
       
       // 前のセクションのコンテキストをクリア
       if (lessonData?.id) {
         SessionStorageManager.clearLessonContext(lessonData.id);
       }
     }
   };

  // セクションデータを取得
  const fetchSectionData = async (lessonId, retryCount = 0) => {
    try {
      console.log(`セクションデータを取得中: レッスンID ${lessonId} (試行回数: ${retryCount + 1})`);
      
      const response = await fetch(`http://localhost:5050/api/lesson-text-video-links/lesson/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
               if (data.success) {
         console.log('セクションデータ取得成功:', data.data);
         console.log('セクションデータ - text_file_key詳細:', {
           text_file_key: data.data[0]?.text_file_key,
           text_file_key_type: typeof data.data[0]?.text_file_key,
           text_file_key_length: data.data[0]?.text_file_key?.length,
           text_file_key_starts_with_lessons: data.data[0]?.text_file_key?.startsWith('lessons/'),
           first_section: data.data[0]
         });
         setSectionData(data.data);
          
                     if (data.data.length > 0) {
             setCurrentSection(0);
             
             // 最初のセクションのテキストファイルがある場合は、lessonDataを更新
             const firstSection = data.data[0];
             if (firstSection.text_file_key && firstSection.text_file_key !== lessonData?.s3_key) {
               console.log('セクションデータ取得: 最初のセクションのテキストファイルを設定:', firstSection.text_file_key);
               
               setLessonData(prev => ({
                 ...prev,
                 s3_key: firstSection.text_file_key, // セクション固有のS3キー
                 file_type: 'pdf'
               }));
               
               // PDF処理状態をリセット
               setPdfProcessingStatus('processing');
               setPdfTextExtracted(false);
               setTextContent('');
               setPdfTextContent('');
             }
             
             displaySectionContent(firstSection);
           }
        } else {
          console.error('セクションデータ取得失敗:', data.message);
        }
      } else {
        const errorMessage = `セクションデータ取得失敗: ${response.status}`;
        console.error(errorMessage);
        
        // サーバーエラーの場合はリトライ
        if (response.status >= 500 && retryCount < 2) {
          console.log(`${retryCount + 1}回目のリトライを実行します...`);
          setTimeout(() => {
            fetchSectionData(lessonId, retryCount + 1);
          }, 2000 * (retryCount + 1));
          return;
        }
      }
    } catch (error) {
      console.error('セクションデータ取得エラー:', error);
      
      // ネットワークエラーの場合はリトライ
      if (retryCount < 2 && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
        console.log(`${retryCount + 1}回目のリトライを実行します...`);
        setTimeout(() => {
          fetchSectionData(lessonId, retryCount + 1);
        }, 2000 * (retryCount + 1));
        return;
      }
    }
  };

     // セクションの内容を表示（動画のみ）
   const displaySectionContent = (section) => {
     if (!section) return;
     
     console.log('セクション内容を表示:', section);
     
     // 動画がある場合のみ更新
     if (section.video_id && section.youtube_url) {
       const sectionVideo = {
         id: section.video_id,
         title: section.video_title || 'セクション動画',
         description: section.video_description || '',
         youtube_url: section.youtube_url,
         duration: section.video_duration || ''
       };
       
       setLessonData(prev => ({
         ...prev,
         videos: [sectionVideo]
       }));
     }
   };

     // セクションテキストコンテンツ取得は不要（PDF処理はTextSectionで自動実行）

  // コースデータを取得
  const fetchCourseData = async (courseId, retryCount = 0) => {
    try {
      const userId = localStorage.getItem('userId') || '1';
      
      console.log(`コースデータを取得中: コースID ${courseId}, 利用者ID ${userId} (試行回数: ${retryCount + 1})`);
      
      const response = await fetch(`http://localhost:5050/api/learning/progress/${userId}/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourseData(data.data);
          console.log('コースデータ取得成功:', data.data);
          
          if (!currentLesson && data.data.lessons && data.data.lessons.length > 0) {
            const firstLesson = data.data.lessons[0];
            setCurrentLesson(firstLesson.id);
            console.log(`最初のレッスンを設定: ${firstLesson.id}`);
          }
        } else {
          console.error('コースデータ取得失敗:', data.message);
        }
      } else {
        const errorMessage = `コースデータ取得失敗: ${response.status}`;
        console.error(errorMessage);
        const errorData = await response.json().catch(() => ({}));
        console.error('エラー詳細:', errorData);
        
        // サーバーエラーの場合はリトライ
        if (response.status >= 500 && retryCount < 2) {
          console.log(`${retryCount + 1}回目のリトライを実行します...`);
          setTimeout(() => {
            fetchCourseData(courseId, retryCount + 1);
          }, 2000 * (retryCount + 1));
          return;
        }
      }
    } catch (error) {
      console.error('コースデータ取得エラー:', error);
      
      // ネットワークエラーの場合はリトライ
      if (retryCount < 2 && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
        console.log(`${retryCount + 1}回目のリトライを実行します...`);
        setTimeout(() => {
          fetchCourseData(courseId, retryCount + 1);
        }, 2000 * (retryCount + 1));
        return;
      }
    }
  };

  // 学習開始処理
  const handleStartLearningLocal = async () => {
    const success = await progressHandleStartLearning(currentLesson, courseData, currentUser);
    if (success) {
      fetchLessonData();
    }
  };

  // チャットメッセージ送信
  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const question = chatInput.trim();
      
      // 質問の品質チェック
      const questionValidation = AIAssistantService.validateQuestion(question);
      if (!questionValidation.isValid) {
        alert(questionValidation.error);
        return;
      }

             // PDFテキストの読み込み状態をチェック
       if (lessonData?.file_type === 'pdf' && !pdfTextContent) {
         // セッションストレージからコンテキストを確認
         const hasStoredContext = SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key);
         if (!hasStoredContext) {
           alert('PDFファイルの読み込みが完了していません。しばらくお待ちください。');
           return;
         }
       }

      // 現在のセクションのテキスト内容を取得
      const currentSectionText = getCurrentSectionText();
      
      // デバッグログを追加
      console.log('handleSendMessage - テキスト内容検証:', {
        question,
        currentSectionTextLength: currentSectionText.length,
        currentSectionTextPreview: currentSectionText.substring(0, 100) + '...',
        textContentLength: textContent?.length || 0,
        pdfTextContentLength: pdfTextContent?.length || 0,
        lessonDescriptionLength: lessonData?.description?.length || 0
      });
      
      // コンテキストの品質チェック
      const contextValidation = AIAssistantService.validateContext(currentSectionText);
      if (!contextValidation.isValid) {
        console.error('コンテキスト検証エラー:', contextValidation);
        
        // より詳細なエラーメッセージを表示
        if (lessonData?.file_type === 'pdf') {
          alert('PDFファイルの読み込みが完了していないか、テキスト内容が短すぎます。しばらくお待ちください。');
        } else {
          alert(`AIアシスタントが利用できません: ${contextValidation.error}`);
        }
        return;
      }

      // ユーザーメッセージを追加
      const userMessage = {
        id: Date.now(),
        text: question,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsAILoading(true);

      try {
        // AIアシスタントに質問を送信
        const aiResponse = await AIAssistantService.askQuestion(
          question,
          currentSectionText,
          lessonData?.title || `レッスン${currentLesson}`
        );

        if (aiResponse.success) {
          // AIの回答を追加
          const aiMessage = {
            id: Date.now() + 1,
            text: aiResponse.answer,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString()
          };
          setChatMessages(prev => [...prev, aiMessage]);
        } else {
          // エラー時のフォールバック回答
          const fallbackMessage = {
            id: Date.now() + 1,
            text: aiResponse.fallbackAnswer,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString()
          };
          setChatMessages(prev => [...prev, fallbackMessage]);
        }
      } catch (error) {
        console.error('AIアシスタントエラー:', error);
        // エラーメッセージを追加
        const errorMessage = {
          id: Date.now() + 1,
          text: 'AIアシスタントの応答を取得できませんでした。しばらく時間をおいて再度お試しください。',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAILoading(false);
      }
    }
  };

  // 現在のセクションのテキスト内容を取得
  const getCurrentSectionText = () => {
    // セッションストレージからコンテキストを確認
    if (lessonData?.s3_key && lessonData?.id) {
      const storedContext = SessionStorageManager.getContext(lessonData.id, lessonData.s3_key);
      if (storedContext) {
        console.log('AIサポート用にセッションストレージからコンテキスト取得:', {
          contextLength: storedContext.context.length
        });
        return storedContext.context;
      }
    }
    
    // フォールバック: 既存のロジック
    if (currentSection >= 0 && sectionData && sectionData[currentSection]) {
      // セクション固有のテキストがある場合はそれを返す
      return textContent || pdfTextContent || lessonData?.description || 'テキスト内容が利用できません';
    }
    
    // デフォルトはレッスンのテキスト内容
    return textContent || pdfTextContent || lessonData?.description || 'テキスト内容が利用できません';
  };

  // PDFテキスト更新ハンドラー
  const handlePdfTextUpdate = (newPdfText) => {
    console.log('handlePdfTextUpdate 呼び出し:', { 
      textLength: newPdfText?.length,
      isError: newPdfText?.startsWith('エラー:'),
      isCancel: newPdfText?.includes('キャンセル')
    });
    
    if (newPdfText && newPdfText.length > 0) {
      // エラーメッセージの場合は処理状態をerrorに設定
      if (newPdfText.startsWith('エラー:') || newPdfText.includes('失敗') || newPdfText.includes('タイムアウト')) {
        setPdfProcessingStatus('error');
        console.log('PDF処理でエラーが発生しました:', newPdfText);
      } else if (newPdfText.includes('キャンセル')) {
        setPdfProcessingStatus('idle');
        console.log('PDF処理がキャンセルされました');
      } else {
        // 正常にテキストが抽出された場合
        setPdfTextExtracted(true);
        setPdfProcessingStatus('completed');
        console.log('PDFテキスト抽出完了:', { textLength: newPdfText.length });
      }
    } else {
      // 空のテキストの場合はエラーとして扱う
      setPdfProcessingStatus('error');
      console.log('PDF処理で空のテキストが返されました');
    }
  };

  // テキストスクロール位置を保存・復元
  const scrollToTextPosition = (position) => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = position;
    }
  };

  // 成果物アップロード処理
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // ZIPファイルのみ許可
    const zipFiles = files.filter(file => 
      file.type.includes('zip') || file.name.toLowerCase().endsWith('.zip')
    );
    
    if (zipFiles.length === 0) {
      alert('ZIPファイルのみアップロード可能です');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', zipFiles[0]);

      const response = await fetch(`http://localhost:5050/api/learning/lesson/${currentLesson}/upload-assignment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // アップロード成功
          const newFile = {
            id: Date.now() + Math.random(),
            name: data.data.fileName,
            originalName: data.data.originalFileName,
            size: data.data.fileSize,
            type: 'application/zip',
            uploadDate: new Date().toLocaleString(),
            status: 'uploaded',
            s3Key: data.data.s3Key
          };
          
          setUploadedFiles(prev => [...prev, newFile]);
          setShowUploadModal(false);
          
          // 課題提出状況を更新
          setAssignmentStatus(prev => ({ ...prev, assignmentSubmitted: true }));
          
          alert('成果物のアップロードが完了しました！');
          
          // 提出物として提出完了の処理
          handleAssignmentSubmitted(currentLesson, currentUser);
        } else {
          alert('アップロードに失敗しました: ' + data.message);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('アップロードに失敗しました: ' + (errorData.message || 'エラーが発生しました'));
      }
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      alert('アップロード中にエラーが発生しました: ' + error.message);
    }
  };

  // ファイル削除処理
  const handleFileDelete = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // テスト完了時の処理
  const handleTestCompletedLocal = async (testScore) => {
    await progressHandleTestCompleted(testScore, currentLesson, currentUser);
  };

  // 現在のレッスンデータ
  const currentLessonData = lessonData || {
    title: `第${currentLesson}回　学習内容`,
    description: 'レッスンの説明が読み込めませんでした。',
    videos: []
  };

  // レンダリング時の状態確認
  console.log(`🎨 レンダリング時の状態:`, {
    currentLesson,
    lessonDataId: lessonData?.id,
    lessonDataTitle: lessonData?.title,
    lessonDataS3Key: lessonData?.s3_key,
    isDataConsistent: currentLesson === lessonData?.id
  });

  // 学習画面表示条件を変更: 学習データ読み込み完了後は表示、PDF処理は並行継続
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 text-xl font-semibold">
            学習データを読み込み中...
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
      <LearningHeader
        lessonData={lessonData}
        courseData={courseData}
        currentLesson={currentLesson}
        currentSection={currentSection}
        sectionData={sectionData}
        onSectionChange={changeSection}
        onUploadModalOpen={() => setShowUploadModal(true)}
        onTestNavigate={(lessonId) => navigate(`/student/test?lesson=${lessonId}`)}
        isTestEnabled={pdfProcessingStatus === 'completed'} // PDF処理完了時のみテスト有効
        hasAssignment={assignmentStatus.hasAssignment}
        assignmentSubmitted={assignmentStatus.assignmentSubmitted}
      />

      {/* PDF処理状態表示 */}
      {pdfProcessingStatus === 'processing' && (
        <div className="w-full bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-center text-blue-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            PDFファイルのコンテキスト化を処理中... AIサポート機能は準備完了までお待ちください
          </div>
        </div>
      )}
      
      {/* PDF処理エラー表示 */}
      {pdfProcessingStatus === 'error' && (
        <div className="w-full bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="flex items-center justify-center text-red-600 text-sm">
            <span className="mr-2">⚠️</span>
            PDFファイルの処理でエラーが発生しました。AIサポート機能は利用できません
            <button 
              onClick={() => {
                setPdfProcessingStatus('idle');
                if (lessonData?.file_type === 'pdf' && lessonData?.s3_key) {
                  // 再処理を試行
                  setTimeout(() => {
                    setPdfProcessingStatus('processing');
                  }, 100);
                }
              }}
              className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      )}
      
      {/* PDF処理完了表示 */}
      {pdfProcessingStatus === 'completed' && (
        <div className="w-full bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-center text-green-600 text-sm">
            <span className="mr-2">✓</span>
            PDFファイルの処理が完了しました。AIサポート機能が利用可能です
          </div>
        </div>
      )}

      {/* メインコンテンツ - 3カラムレイアウト */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 動画 */}
          <div className="lg:col-span-1">
            <VideoSection lessonData={lessonData} />
          </div>

          {/* 中央カラム: テキスト */}
          <div className="lg:col-span-1">
                         {console.log('TextSection呼び出し前 - lessonData:', lessonData)}
             {console.log('TextSection呼び出し前 - lessonData.file_type:', lessonData?.file_type)}
             {console.log('TextSection呼び出し前 - lessonData.s3_key:', lessonData?.s3_key)}
             {console.log('セッションストレージ状態:', SessionStorageManager.getStoredContexts())}
             <TextSection
              lessonData={lessonData}
              textContent={textContent}
              textLoading={textLoading}
              textContainerRef={textContainerRef}
              onTextContentUpdate={handlePdfTextUpdate}
            />
          </div>

          {/* 右カラム: AIチャット */}
          <div className="lg:col-span-1">
                         <ChatSection
               chatMessages={chatMessages}
               chatInput={chatInput}
               onChatInputChange={(e) => setChatInput(e.target.value)}
               onSendMessage={handleSendMessage}
               currentLessonData={currentLessonData}
               currentSectionText={getCurrentSectionText()}
               isAILoading={isAILoading}
               isAIEnabled={
                 pdfProcessingStatus === 'completed' || 
                 (lessonData?.file_type === 'pdf' && SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key)) ||
                 (lessonData?.file_type !== 'pdf' && lessonData?.textContent) // 通常のテキストファイルの場合
               }
             />

            {/* アップロード済みファイル（課題がある場合のみ表示） */}
            {assignmentStatus.hasAssignment && (
              <FileUploadSection
                uploadedFiles={uploadedFiles}
                onFileDelete={handleFileDelete}
              />
            )}
          </div>
        </div>
      </div>

      {/* アップロードモーダル（課題がある場合のみ表示） */}
      {assignmentStatus.hasAssignment && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
};

export default EnhancedLearningPageRefactored;

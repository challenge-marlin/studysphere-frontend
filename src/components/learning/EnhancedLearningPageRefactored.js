import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
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
import { API_BASE_URL } from '../../config/apiConfig';
import LearningWorkspaceLayout, { createDefaultLayouts, normalizeLayouts } from './LearningWorkspaceLayout';

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
  const [workspaceLayouts, setWorkspaceLayouts] = useState(() => ({
    withAssignment: createDefaultLayouts(true),
    withoutAssignment: createDefaultLayouts(false)
  }));
  // ウィジェットの表示/非表示を管理
  const [widgetVisibility, setWidgetVisibility] = useState({ video: true, text: true, chat: true, assignment: true });
  const textContainerRef = useRef(null);
  const latestFetchId = useRef(0); // レースコンディション防止用
  const abortControllerRef = useRef(null); // リクエストキャンセル用
  const layoutStorageKeyRef = useRef(null);
  const layoutInitializedRef = useRef(false);

  const getUserId = useCallback(() => {
    // 1. 認証コンテキストから取得
    if (currentUser && currentUser.id) {
      console.log('認証コンテキストからユーザーID取得:', currentUser.id);
      return currentUser.id;
    }
    
    // 2. localStorageのcurrentUserから取得
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id) {
          console.log('localStorageのcurrentUserからユーザーID取得:', userData.id);
          return userData.id;
        }
      } catch (error) {
        console.error('localStorageのcurrentUserパースエラー:', error);
      }
    }
    
    // 3. フォールバック: localStorageのuserIdから取得
    const fallbackUserId = localStorage.getItem('userId');
    if (fallbackUserId) {
      console.log('localStorageのuserIdからユーザーID取得:', fallbackUserId);
      return fallbackUserId;
    }
    
    // 4. 最終フォールバック
    console.warn('ユーザーIDが取得できません。デフォルト値24を使用します。');
    return '24'; // 現在受講しているユーザーID
  }, [currentUser]);

  const buildLayoutStorageKey = (userId) => `studysphere:workspaceLayouts:user:${userId}`;

  const getLayoutStorageKey = useCallback(() => {
    if (layoutStorageKeyRef.current) {
      return layoutStorageKeyRef.current;
    }
    const userId = getUserId();
    const storageKey = buildLayoutStorageKey(userId);
    layoutStorageKeyRef.current = storageKey;
    return storageKey;
  }, [getUserId]);

  const persistWorkspaceLayouts = useCallback((layouts) => {
    try {
      const storageKey = getLayoutStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(layouts));
      console.log('学習ワークスペースレイアウトを保存しました:', storageKey);
    } catch (error) {
      console.error('学習ワークスペースレイアウトの保存に失敗しました:', error);
    }
  }, [getLayoutStorageKey]);

  // 学習進捗管理フックを使用
  const {
    updateLearningProgress,
    handleStartLearning: progressHandleStartLearning,
    handleTestCompleted: progressHandleTestCompleted
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
      fetchCourseData(courseParam, 0, searchParams);
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
  }, [searchParams]); // searchParamsのみに依存

  // 学習開始時の進捗更新は削除（LessonList.jsのhandleStartLessonで実行されるため）

  // 提出物確認ファイルを取得
  const fetchUploadedFiles = async (lessonId = null) => {
    const targetLessonId = lessonId || currentLesson;
    
    try {
      console.log(`📁 提出物確認ファイル取得開始: レッスンID ${targetLessonId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/learning/lesson/${targetLessonId}/uploaded-files`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📁 提出物確認ファイルデータ:`, data);
        
        if (data.success) {
          setUploadedFiles(data.data);
          console.log(`✅ 提出物確認ファイル設定完了: ${data.data.length}件`);
        } else {
          console.error('提出物確認ファイル取得失敗:', data.message);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('提出物確認ファイルAPIエラー:', {
          status: response.status,
          error: errorData.message
        });
      }
    } catch (error) {
      console.error('提出物確認ファイル取得エラー:', error);
    }
  };

  // 課題提出状況を確認
  const checkAssignmentStatus = async (lessonId = null) => {
    const targetLessonId = lessonId || currentLesson;
    
    // レースコンディション防止: リクエストIDを生成
    const requestId = ++latestFetchId.current;
    
    try {
      console.log(`🔍 課題提出状況確認開始: レッスンID ${targetLessonId} (currentLesson: ${currentLesson}), requestId: ${requestId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/learning/lesson/${targetLessonId}/assignment-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📡 課題提出状況APIレスポンス:`, {
        status: response.status,
        ok: response.ok,
        targetLessonId,
        currentLesson,
        requestId
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 課題提出状況データ:`, data);
        
        if (data.success) {
          setAssignmentStatus(data.data);
          console.log(`✅ 課題提出状況設定完了:`, {
            hasAssignment: data.data.hasAssignment,
            assignmentSubmitted: data.data.assignmentSubmitted
          });
        } else {
          console.error('課題提出状況取得失敗:', data.message);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('課題提出状況APIエラー:', {
          status: response.status,
          error: errorData.message,
          targetLessonId,
          currentLesson
        });
      }
    } catch (error) {
      console.error('課題提出状況確認エラー:', error);
    }
  };

  // レッスンデータをAPIから取得
  const fetchLessonData = async (retryCount = 0, lessonId = null) => {
    const targetLessonId = lessonId || currentLesson;
    
    // レースコンディション防止: リクエストIDを生成
    const requestId = ++latestFetchId.current;
    
    // 前のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 新しいAbortControllerを作成
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      setLoading(true);
      setError(null);
      
      const userId = getUserId();
      
      console.log(`🚀 レッスンデータ取得開始:`, {
        currentLesson,
        targetLessonId,
        userId,
        retryCount: retryCount + 1,
        requestId,
        url: `${API_BASE_URL}/api/learning/lesson/${targetLessonId}/content`
      });
      
      const response = await fetch(`${API_BASE_URL}/api/learning/lesson/${targetLessonId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        signal: abortController.signal
      });

      console.log(`📡 APIレスポンス:`, {
        status: response.status,
        ok: response.ok,
        targetLessonId
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `レッスンデータの取得に失敗しました: ${response.status} ${errorData.message || ''}`;
        
        console.error(`❌ APIエラー:`, {
          status: response.status,
          errorData,
          targetLessonId
        });
        
        // サーバーエラーの場合はリトライ
        if (response.status >= 500 && retryCount < 2) {
          console.log(`${retryCount + 1}回目のリトライを実行します...`);
          setTimeout(() => {
            fetchLessonData(retryCount + 1, targetLessonId);
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
        courseId: data.data?.course_id,
        requestId
      });
      
      // レスポンスデータの完全な内容をログ出力
      console.log(`🔍 完全なレスポンスデータ:`, JSON.stringify(data, null, 2));
      
      if (data.success) {
        // データの整合性チェックを追加
        if (data.data && data.data.id !== targetLessonId) {
          console.error(`❌ データ整合性エラー: 要求したレッスンID ${targetLessonId} とレスポンスのレッスンID ${data.data.id} が一致しません`);
          setError(`レッスンデータの整合性エラー: 要求したレッスンID ${targetLessonId} とレスポンスのレッスンID ${data.data.id} が一致しません`);
          setLoading(false);
          return;
        }
        
        setLessonData(data.data);
        setTextLoading(false);
        
        // レッスンデータにtextContentが含まれている場合は、textContentステートに設定
        if (data.data.textContent) {
          console.log('レッスンデータからtextContentを設定:', {
            textContentLength: data.data.textContent.length,
            fileType: data.data.file_type,
            s3Key: data.data.s3_key
          });
          setTextContent(data.data.textContent);
        } else {
          console.log('レッスンデータにtextContentが含まれていません:', {
            hasTextContent: !!data.data.textContent,
            fileType: data.data.file_type,
            s3Key: data.data.s3_key
          });
        }
        
        // 課題提出状況を確認
        console.log(`🔍 課題提出状況確認開始: レッスンID ${targetLessonId}`);
        await checkAssignmentStatus(targetLessonId);
        
        // 提出物確認ファイルを取得
        await fetchUploadedFiles(targetLessonId);
        
        // レッスンデータ取得成功後、セクションデータを取得
        console.log('レッスンデータ取得成功、セクションデータを取得開始:', data.data);
        await fetchSectionData(targetLessonId, 0, data.data);
        
        console.log('レッスンデータ取得成功:', data.data);
      } else {
        setError(data.message || 'レッスンデータの取得に失敗しました');
      }
    } catch (error) {
      // AbortErrorの場合は無視（リクエストがキャンセルされた）
      if (error.name === 'AbortError') {
        console.log(`⏹️ リクエストがキャンセルされました: レッスンID ${targetLessonId}`);
        return;
      }
      
      console.error('レッスンデータ取得エラー:', error);
      
      // ネットワークエラーの場合はリトライ
      if (retryCount < 2 && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
        console.log(`${retryCount + 1}回目のリトライを実行します...`);
        setTimeout(() => {
          fetchLessonData(retryCount + 1, targetLessonId);
        }, 2000 * (retryCount + 1));
        return;
      }
      
      setError('レッスンデータの取得中にエラーが発生しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


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
        setAssignmentStatus({ hasAssignment: false, assignmentSubmitted: false }); // 課題状況もクリア
      }
      
      // 新しいレッスンのデータを取得
      const targetLessonId = currentLesson; // 現在の値を保存
      console.log(`🚀 即座にレッスンデータ取得開始: レッスンID ${targetLessonId}`);
      fetchLessonData(0, targetLessonId);
      checkAssignmentStatus(targetLessonId); // 課題提出状況も確認
    }
  }, [currentLesson]); // currentLessonのみに依存

  // レッスンデータが設定された時点で、セッションストレージにコンテキストがある場合は完了状態に設定
  useEffect(() => {
    if (lessonData && lessonData.file_type === 'pdf' && lessonData.s3_key) {
      const hasContext = SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key, lessonData.file_type);
      if (hasContext) {
        console.log('セッションストレージにコンテキストが存在するため、PDF処理状態を完了に設定');
        setPdfProcessingStatus('completed');
        setPdfTextExtracted(true);
      } else {
        console.log('セッションストレージにコンテキストが存在しないため、PDF処理状態をidleに設定');
        setPdfProcessingStatus('idle');
      }
    }
  }, [lessonData]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      return;
    }

    const storageKey = buildLayoutStorageKey(userId);

    if (layoutStorageKeyRef.current !== storageKey) {
      layoutStorageKeyRef.current = storageKey;
      layoutInitializedRef.current = false;
    }

    if (layoutInitializedRef.current) {
      return;
    }

    try {
      const storedLayouts = localStorage.getItem(storageKey);
      if (storedLayouts) {
        const parsedLayouts = JSON.parse(storedLayouts);
        console.log('保存済みワークスペースレイアウトを読み込みます:', parsedLayouts);
        setWorkspaceLayouts(prevLayouts => ({
          withAssignment: parsedLayouts.withAssignment
            ? normalizeLayouts(parsedLayouts.withAssignment, true, null)
            : prevLayouts.withAssignment,
          withoutAssignment: parsedLayouts.withoutAssignment
            ? normalizeLayouts(parsedLayouts.withoutAssignment, false, null)
            : prevLayouts.withoutAssignment
        }));
      }
    } catch (error) {
      console.error('学習ワークスペースレイアウトの読み込みに失敗しました:', error);
    } finally {
      layoutInitializedRef.current = true;
    }
  }, [currentUser, getUserId]);

  // ウィジェット表示状態をlocalStorageから読み込み
  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      return;
    }

    const storageKey = `studysphere:widgetVisibility:user:${userId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWidgetVisibility(parsed);
      }
    } catch (error) {
      console.error('ウィジェット表示状態の読み込みに失敗しました:', error);
    }
  }, [currentUser, getUserId]);

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
    console.log(`🔄 レッスン変更処理開始: ${currentLesson} → ${lessonId}`);
    
    // 前のレッスンのコンテキストをクリア
    if (currentLesson) {
      SessionStorageManager.clearLessonContext(currentLesson);
    }
    
    // 状態をリセット
    setCurrentLesson(lessonId);
    setCurrentSection(0);
    setTextLoading(true);
    setChatMessages([]);
    setTextScrollPosition(0);
    setPdfTextExtracted(false);
    setPdfProcessingStatus('idle'); // PDF処理状態をリセット
    setLessonData(null); // レッスンデータをクリア
    setError(null); // エラー状態をクリア
    setAssignmentStatus({ hasAssignment: false, assignmentSubmitted: false }); // 課題状況をクリア
    
    if (courseData) {
      navigate(`/student/enhanced-learning?course=${courseData.id}&lesson=${lessonId}`);
    }
    
    // 新しいレッスンデータの取得はuseEffectで自動実行される
    console.log(`✅ レッスン変更処理完了: ${lessonId}`);
  };

     // セクション変更処理
   const changeSection = (sectionIndex) => {
     if (!sectionData || !Array.isArray(sectionData)) return;
     
     const newSection = sectionData[sectionIndex];
     if (!newSection) return;
     
     setCurrentSection(sectionIndex);
     
     // 修正: レッスンのテキストファイル（lessonData.s3_key）を基準にする
     // セクション変更時は、そのテキストファイルに紐づいた動画のみを更新
     // text_file_keyでlessonData.s3_keyを上書きしない
     console.log('セクション変更:', {
       sectionIndex,
       newSection,
       lessonS3Key: lessonData?.s3_key,
       sectionTextFileKey: newSection?.text_file_key
     });
     
     // 動画がある場合のみ更新
     if (newSection.video_id && newSection.youtube_url) {
       const sectionVideo = {
         id: newSection.video_id,
         title: newSection.video_title || 'セクション動画',
         description: newSection.video_description || '',
         youtube_url: newSection.youtube_url,
         duration: newSection.video_duration || ''
       };
       
       setLessonData(prev => {
         if (!prev) {
           console.warn('lessonDataがnullのため、動画を設定できません');
           return prev;
         }
         return {
           ...prev,
           videos: [sectionVideo]
         };
       });
     } else {
       // 動画がない場合は空の配列に設定
       setLessonData(prev => {
         if (!prev) {
           console.warn('lessonDataがnullのため、動画配列を設定できません');
           return prev;
         }
         return {
           ...prev,
           videos: []
         };
       });
     }
   };

  // セクションデータを取得
  const fetchSectionData = async (lessonId, retryCount = 0, currentLessonData = null) => {
    try {
      console.log(`セクションデータを取得中: レッスンID ${lessonId} (試行回数: ${retryCount + 1})`);
      
      const response = await fetch(`${API_BASE_URL}/api/lesson-text-video-links/lesson/${lessonId}`, {
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
          
         // セクションデータが空の場合（動画がない場合）でも処理を続行
         if (data.data.length > 0) {
           setCurrentSection(0);
           
           // 修正: レッスンのテキストファイル（lessonData.s3_key）を基準にする
           // セクションデータは、そのテキストファイルに紐づいた動画のリストとして扱う
           // text_file_keyでlessonData.s3_keyを上書きしない
           const firstSection = data.data[0];
           const lessonS3Key = currentLessonData?.s3_key || lessonData?.s3_key;
           console.log('セクションデータ取得成功:', {
             sectionCount: data.data.length,
             firstSection: firstSection,
             lessonS3Key: lessonS3Key,
             sectionTextFileKey: firstSection?.text_file_key,
             currentLessonData: currentLessonData,
             hasVideoId: !!firstSection?.video_id,
             hasYoutubeUrl: !!firstSection?.youtube_url,
             videoId: firstSection?.video_id,
             youtubeUrl: firstSection?.youtube_url
           });
           
           // 動画がある場合のみ更新
           if (firstSection.video_id && firstSection.youtube_url) {
             const sectionVideo = {
               id: firstSection.video_id,
               title: firstSection.video_title || 'セクション動画',
               description: firstSection.video_description || '',
               youtube_url: firstSection.youtube_url,
               duration: firstSection.video_duration || ''
             };
             
             console.log('🎬 動画を設定します:', {
               sectionVideo,
               currentLessonData,
               hasCurrentLessonData: !!currentLessonData
             });
             
             setLessonData(prev => {
               // currentLessonDataが存在する場合はそれを優先（fetchLessonDataから渡された最新データ）
               const baseData = currentLessonData || prev;
               if (!baseData) {
                 console.warn('lessonDataがnullのため、動画を設定できません');
                 return prev;
               }
               const updatedData = {
                 ...baseData,
                 videos: [sectionVideo]
               };
               console.log('🎬 動画設定後のlessonData:', {
                 videos: updatedData.videos,
                 videoCount: updatedData.videos.length,
                 lessonId: updatedData.id,
                 usedCurrentLessonData: !!currentLessonData,
                 prevVideos: prev?.videos
               });
               return updatedData;
             });
           } else {
             // セクションに動画がない場合: 既存の動画を保持（上書きしない）
             console.log('🎬 セクションに動画がありません。既存の動画を保持します');
             setLessonData(prev => {
               const baseData = currentLessonData || prev;
               if (!baseData) {
                 console.warn('lessonDataがnullのため、動画配列を設定できません');
                 return prev;
               }
               // 既存の動画がある場合は保持、ない場合のみ空配列に設定
               const existingVideos = baseData.videos || [];
               if (existingVideos.length > 0) {
                 console.log('🎬 既存の動画を保持します:', existingVideos);
                 return baseData; // 既存のデータをそのまま返す
               }
               console.log('🎬 既存の動画がないため、空配列に設定します');
               return {
                 ...baseData,
                 videos: [] // 既存の動画がない場合のみ空配列
               };
             });
           }
         } else {
           // セクションデータが空の場合: 既存の動画を保持（上書きしない）
           console.log('セクションデータが空です。既存の動画を保持します:', {
             lessonId: lessonId,
             lessonS3Key: currentLessonData?.s3_key || lessonData?.s3_key,
             existingVideos: currentLessonData?.videos || lessonData?.videos,
             existingVideoCount: (currentLessonData?.videos || lessonData?.videos || []).length
           });
           setCurrentSection(0);
           // セクションデータが空でも、既存の動画がある場合は保持するため、lessonDataを更新しない
           // 動画がない場合のみ空配列に設定（既存の動画がない場合のみ）
           setLessonData(prev => {
             const baseData = currentLessonData || prev;
             if (!baseData) {
               console.warn('lessonDataがnullのため、動画配列を設定できません');
               return prev;
             }
             // 既存の動画がある場合は保持、ない場合のみ空配列に設定
             const existingVideos = baseData.videos || [];
             if (existingVideos.length > 0) {
               console.log('🎬 既存の動画を保持します:', existingVideos);
               return baseData; // 既存のデータをそのまま返す
             }
             console.log('🎬 既存の動画がないため、空配列に設定します');
             return {
               ...baseData,
               videos: [] // 既存の動画がない場合のみ空配列
             };
           });
           // PDFの処理はTextSectionコンポーネントで自動的に開始されるため、ここでは何もしない
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
            fetchSectionData(lessonId, retryCount + 1, currentLessonData);
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
          fetchSectionData(lessonId, retryCount + 1, currentLessonData);
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
       
       setLessonData(prev => {
         if (!prev) {
           console.warn('lessonDataがnullのため、動画を設定できません');
           return prev;
         }
         return {
           ...prev,
           videos: [sectionVideo]
         };
       });
     } else {
       // 動画がない場合は空の配列に設定
       setLessonData(prev => {
         if (!prev) {
           console.warn('lessonDataがnullのため、動画配列を設定できません');
           return prev;
         }
         return {
           ...prev,
           videos: []
         };
       });
     }
   };

     // セクションテキストコンテンツ取得は不要（PDF処理はTextSectionで自動実行）

  // ユーザーIDを取得する関数
  // コースデータを取得
  const fetchCourseData = async (courseId, retryCount = 0, searchParams = null) => {
    try {
      const userId = getUserId();
      
      console.log(`コースデータを取得中: コースID ${courseId}, 利用者ID ${userId} (試行回数: ${retryCount + 1})`);
      
      const response = await fetch(`${API_BASE_URL}/api/learning/progress/${userId}/course/${courseId}`, {
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
          
          // URLパラメータでレッスンが指定されていない場合のみ最初のレッスンを設定
          const lessonParam = searchParams ? searchParams.get('lesson') : null;
          if (!lessonParam && !currentLesson && data.data.lessons && data.data.lessons.length > 0) {
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
         const hasStoredContext = SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key, lessonData.file_type);
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
      const storedContext = SessionStorageManager.getContext(lessonData.id, lessonData.s3_key, lessonData.file_type);
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
      isCancel: newPdfText?.includes('キャンセル'),
      textPreview: newPdfText?.substring(0, 100)
    });
    
    if (newPdfText && newPdfText.length > 0) {
      // エラーメッセージの判定をより厳密にする
      // 「失敗」や「タイムアウト」という文字列が含まれていても、エラーメッセージの形式でない場合は正常とみなす
      const isError = newPdfText.startsWith('エラー:') || 
                     newPdfText.startsWith('PDFファイルが見つかりません') ||
                     newPdfText.startsWith('テキスト抽出に失敗しました') ||
                     (newPdfText.includes('失敗') && newPdfText.length < 200) || // 短いエラーメッセージの場合
                     (newPdfText.includes('タイムアウト') && newPdfText.length < 200); // 短いエラーメッセージの場合
      
      if (isError) {
        setPdfProcessingStatus('error');
        console.log('PDF処理でエラーが発生しました:', newPdfText);
      } else if (newPdfText.includes('キャンセル')) {
        setPdfProcessingStatus('idle');
        console.log('PDF処理がキャンセルされました');
      } else {
        // 正常にテキストが抽出された場合（セッションストレージから取得した場合も含む）
        setPdfTextExtracted(true);
        setPdfProcessingStatus('completed');
        console.log('PDFテキスト抽出完了:', { textLength: newPdfText.length });
      }
    } else {
      // 空のテキストの場合はエラーとして扱わない（まだ処理中の可能性がある）
      console.log('PDFテキストが空です（処理中または未処理）');
      // エラー状態に設定しない（処理中または未処理の可能性があるため）
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
      formData.append('lessonId', currentLesson);

      const response = await fetch(`${API_BASE_URL}/api/learning/upload-assignment`, {
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
          
          // 課題提出完了の処理（既にassignmentStatusが更新されているため、追加処理は不要）
          
          // 課題提出状況と提出物確認ファイルを再確認
          setTimeout(() => {
            checkAssignmentStatus();
            fetchUploadedFiles();
          }, 500);
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
  const handleFileDelete = async (fileId) => {
    try {
      console.log(`🗑️ ファイル削除開始: ファイルID ${fileId}, レッスンID ${currentLesson}`);
      
      const response = await fetch(`${API_BASE_URL}/api/learning/lesson/${currentLesson}/uploaded-files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('ファイル削除成功:', data);
        
        // フロントエンドの状態を更新
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        
        // 課題提出状況がリセットされた場合は、課題提出状況を再取得
        if (data.data && data.data.assignmentStatusReset) {
          console.log('課題提出状況がリセットされました。再取得します。');
          await checkAssignmentStatus(currentLesson);
        }
        
        console.log('✅ ファイル削除完了');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('ファイル削除APIエラー:', {
          status: response.status,
          error: errorData.message
        });
        alert('ファイルの削除に失敗しました: ' + (errorData.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('ファイル削除エラー:', error);
      alert('ファイルの削除中にエラーが発生しました');
    }
  };

  const handleWorkspaceLayoutChange = useCallback((newLayouts) => {
    setWorkspaceLayouts(prevLayouts => {
      if (assignmentStatus.hasAssignment) {
        const updatedLayouts = {
          ...prevLayouts,
          withAssignment: normalizeLayouts(newLayouts, true, widgetVisibility)
        };
        persistWorkspaceLayouts(updatedLayouts);
        return updatedLayouts;
      }
      const updatedLayouts = {
        ...prevLayouts,
        withoutAssignment: normalizeLayouts(newLayouts, false, widgetVisibility)
      };
      persistWorkspaceLayouts(updatedLayouts);
      return updatedLayouts;
    });
  }, [assignmentStatus.hasAssignment, persistWorkspaceLayouts, widgetVisibility]);

  // ウィジェットの表示/非表示を切り替え
  const toggleWidgetVisibility = useCallback((widgetKey) => {
    setWidgetVisibility(prev => {
      const newVisibility = {
        ...prev,
        [widgetKey]: !prev[widgetKey]
      };
      // localStorageに保存
      const userId = getUserId();
      const storageKey = `studysphere:widgetVisibility:user:${userId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(newVisibility));
      } catch (error) {
        console.error('ウィジェット表示状態の保存に失敗しました:', error);
      }
      return newVisibility;
    });
  }, [getUserId]);

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

  // 表示状態に基づいてウィジェットをフィルタリング
  const workspaceWidgets = {
    video: widgetVisibility.video ? (
      <VideoSection lessonData={lessonData} />
    ) : null,
    text: widgetVisibility.text ? (
      <TextSection
        lessonData={lessonData}
        textContent={textContent}
        textLoading={textLoading}
        textContainerRef={textContainerRef}
        onTextContentUpdate={handlePdfTextUpdate}
      />
    ) : null,
    chat: widgetVisibility.chat ? (
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
          (lessonData?.file_type === 'pdf' && SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key, lessonData.file_type)) ||
          (lessonData?.file_type === 'txt' && SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key, lessonData.file_type)) ||
          (lessonData?.file_type === 'md' && SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key, lessonData.file_type)) ||
          (lessonData?.file_type === 'application/rtf' && SessionStorageManager.hasContext(lessonData.id, lessonData.s3_key, lessonData.file_type)) ||
          (lessonData?.file_type !== 'pdf' && lessonData?.textContent)
        }
      />
    ) : null,
    assignment: (assignmentStatus.hasAssignment && widgetVisibility.assignment) ? (
      <FileUploadSection
        uploadedFiles={uploadedFiles}
        onFileDelete={handleFileDelete}
      />
    ) : null
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
        isTestEnabled={
          pdfProcessingStatus === 'completed' || // PDF処理完了時
          (lessonData?.file_type !== 'pdf' && lessonData?.textContent) // テキストファイルの場合
        }
        hasAssignment={assignmentStatus.hasAssignment}
        assignmentSubmitted={assignmentStatus.assignmentSubmitted}
      />

      {/* PDF処理状態表示 - PDFファイルの場合のみ表示 */}
      {pdfProcessingStatus === 'processing' && lessonData?.file_type === 'pdf' && (
        <div className="w-full bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-center text-blue-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            PDFファイルのコンテキスト化を処理中... AIサポート機能は準備完了までお待ちください
          </div>
        </div>
      )}
      
      {/* PDF処理エラー表示 - PDFファイルの場合のみ表示 */}
      {pdfProcessingStatus === 'error' && lessonData?.file_type === 'pdf' && (
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
      
      {/* PDF処理完了表示 - PDFファイルの場合のみ表示 */}
      {pdfProcessingStatus === 'completed' && lessonData?.file_type === 'pdf' && (
        <div className="w-full bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-center text-green-600 text-sm">
            <span className="mr-2">✓</span>
            PDFファイルの処理が完了しました。AIサポート機能が利用可能です
          </div>
        </div>
      )}

      {/* テキストファイル（MD、TXT、RTF）のAI利用可能表示 */}
      {(lessonData?.file_type === 'md' || lessonData?.file_type === 'text/markdown' || lessonData?.file_type === 'txt' || lessonData?.file_type === 'application/rtf') && lessonData?.textContent && (
        <div className="w-full bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-center text-green-600 text-sm">
            <span className="mr-2">💡</span>
            AIアシスタントが利用可能です。学習内容について質問してください。
          </div>
        </div>
      )}

      {/* ウィジェット表示切り替えバー - 一時的に無効化（将来的には戻す予定） */}
      {/* TODO: 表示切替機能を再度有効化する場合は、以下のコメントを解除してください */}
      {/*
      <div className="w-full bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <span className="text-sm font-medium text-gray-700">表示切替:</span>
          <button
            onClick={() => toggleWidgetVisibility('video')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              widgetVisibility.video
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            🎥 動画学習 {widgetVisibility.video ? '✓' : '✗'}
          </button>
          <button
            onClick={() => toggleWidgetVisibility('text')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              widgetVisibility.text
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            📄 テキスト教材 {widgetVisibility.text ? '✓' : '✗'}
          </button>
          <button
            onClick={() => toggleWidgetVisibility('chat')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              widgetVisibility.chat
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            🤖 AIアシスタント {widgetVisibility.chat ? '✓' : '✗'}
          </button>
          {assignmentStatus.hasAssignment && (
            <button
              onClick={() => toggleWidgetVisibility('assignment')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                widgetVisibility.assignment
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              📁 課題提出 {widgetVisibility.assignment ? '✓' : '✗'}
            </button>
          )}
        </div>
      </div>
      */}

      {/* メインコンテンツ - 固定レイアウト（フリーレイアウト機能は一時的に無効化） */}
      {/* TODO: フリーレイアウト機能を再度有効化する場合は、以下の固定レイアウトをコメントアウトし、
          元のLearningWorkspaceLayoutコンポーネントのコメントを解除してください */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 固定レイアウト（3列グリッド） */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左列：動画学習 */}
          {workspaceWidgets.video && (
            <div className="lg:col-span-1 self-start w-full min-h-[500px]">
              {workspaceWidgets.video}
            </div>
          )}
          {/* 中央列：テキスト教材 */}
          {workspaceWidgets.text && (
            <div className="lg:col-span-1 min-h-[800px]">
              {workspaceWidgets.text}
            </div>
          )}
          {/* 右列：AIアシスタント＆提出物確認 */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* AIアシスタント */}
            {workspaceWidgets.chat && (
              <div className="min-h-[800px]">
                {workspaceWidgets.chat}
              </div>
            )}
            {/* 提出物確認 */}
            {workspaceWidgets.assignment && (
              <div>
                {workspaceWidgets.assignment}
              </div>
            )}
          </div>
        </div>
        {/* 元のフリーレイアウト（一時的に無効化） */}
        {/*
        <LearningWorkspaceLayout
          widgets={workspaceWidgets}
          layouts={assignmentStatus.hasAssignment ? workspaceLayouts.withAssignment : workspaceLayouts.withoutAssignment}
          hasAssignment={assignmentStatus.hasAssignment}
          widgetVisibility={widgetVisibility}
          onLayoutsChange={handleWorkspaceLayoutChange}
        />
        */}
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

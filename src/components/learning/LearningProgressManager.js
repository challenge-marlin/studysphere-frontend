import React, { useRef, useCallback } from 'react';

// 学習進捗管理のカスタムフック
export const useLearningProgress = () => {
  const updateInProgress = useRef(false);
  const lastUpdateTime = useRef(0);
  const updateTimeoutRef = useRef(null);

  // ユーザーIDを取得する関数
  const getUserId = (currentUser) => {
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
    console.warn('ユーザーIDが取得できません。デフォルト値1を使用します。');
    return '1';
  };

  // デバウンス付きの学習進捗更新
  const debouncedUpdateLearningProgress = useCallback((currentLesson, courseData, currentUser) => {
    // 前回の更新から5秒以内の場合はスキップ
    const now = Date.now();
    if (now - lastUpdateTime.current < 5000) {
      console.log('学習進捗更新をスキップ（前回の更新から5秒以内）');
      return;
    }

    // 既に更新中の場合はスキップ
    if (updateInProgress.current) {
      console.log('学習進捗更新をスキップ（既に更新中）');
      return;
    }

    // 前回のタイマーをクリア
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // 1秒後に実行
    updateTimeoutRef.current = setTimeout(() => {
      updateLearningProgress(currentLesson, courseData, currentUser);
    }, 1000);
  }, []);

  // 学習開始時の進捗更新
  const updateLearningProgress = async (currentLesson, courseData, currentUser) => {
    if (currentLesson && courseData) {
      try {
        // 更新中フラグを設定
        updateInProgress.current = true;
        lastUpdateTime.current = Date.now();
        
        const userId = getUserId(currentUser);
        const courseId = courseData.id || 1;
        
        console.log('学習進捗更新処理開始:', { userId, courseId, currentLesson });
        
        // まず、利用者とコースの関連付けを確認・作成
        const assignResponse = await fetch('http://localhost:5050/api/learning/assign-course', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            courseId: parseInt(courseId)
          })
        });
        
        if (assignResponse.ok) {
          console.log('コース割り当て完了');
        } else {
          console.error('コース割り当て失敗:', assignResponse.status);
        }
        
        // レッスン進捗を「学習中」に更新
        const progressResponse = await fetch('http://localhost:5050/api/learning/progress/lesson', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            lessonId: parseInt(currentLesson),
            status: 'in_progress'
            // testScore、assignmentSubmitted等は指定せず、既存の値を保持
          })
        });
        
        if (progressResponse.ok) {
          console.log('学習進捗が正常に更新されました');
        } else {
          console.error('学習進捗の更新に失敗しました:', progressResponse.status);
          const errorData = await progressResponse.json().catch(() => ({}));
          console.error('エラー詳細:', errorData);
        }
      } catch (error) {
        console.error('学習進捗更新エラー:', error);
      } finally {
        // 更新中フラグをリセット
        updateInProgress.current = false;
      }
    }
  };

  // 学習開始処理
  const handleStartLearning = async (currentLesson, courseData, currentUser) => {
    try {
      const userId = getUserId(currentUser);
      const courseId = courseData?.id || 1;
      
      console.log('=== 学習開始処理 ===');
      console.log('認証コンテキストのユーザー:', currentUser);
      console.log('取得したユーザーID:', userId);
      console.log('コースID:', courseId);
      console.log('レッスンID:', currentLesson);
      console.log('localStorageのuserId:', localStorage.getItem('userId'));
      
      // まず、利用者とコースの関連付けを確認・作成
      console.log('1. コース割り当て処理開始...');
      const assignResponse = await fetch('http://localhost:5050/api/learning/assign-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          courseId: parseInt(courseId)
        })
      });
      
      console.log('コース割り当てレスポンス:', assignResponse.status, assignResponse.statusText);
      
      if (assignResponse.ok) {
        const assignData = await assignResponse.json();
        console.log('利用者とコースの関連付けが完了しました:', assignData);
      } else {
        console.error('利用者とコースの関連付けに失敗しました');
        const errorData = await assignResponse.json().catch(() => ({}));
        console.error('エラー詳細:', errorData);
      }
      
      // 現在のレッスンの進捗レコードを作成・更新
      console.log('2. レッスン進捗更新処理開始...');
      const progressResponse = await fetch('http://localhost:5050/api/learning/progress/lesson', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          lessonId: parseInt(currentLesson),
          status: 'in_progress'
          // testScore、assignmentSubmitted等は指定せず、既存の値を保持
        })
      });
      
      console.log('レッスン進捗更新レスポンス:', progressResponse.status, progressResponse.statusText);
      
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        console.log('レッスン進捗の更新が完了しました:', progressData);
      } else {
        console.error('レッスン進捗の更新に失敗しました');
        const errorData = await progressResponse.json().catch(() => ({}));
        console.error('エラー詳細:', errorData);
      }
      
      console.log('=== 学習開始処理完了 ===');
      
    } catch (error) {
      console.error('学習開始処理エラー:', error);
    }
  };

  return {
    updateLearningProgress: debouncedUpdateLearningProgress,
    handleStartLearning
  };
};

export default useLearningProgress;

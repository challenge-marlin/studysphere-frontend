  // セッションストレージ管理用のユーティリティ
  export const SessionStorageManager = {
    // エラーハンドリング用のヘルパー関数
    _safeExecute: (operation, fallback) => {
      try {
        return operation();
      } catch (error) {
        console.error('SessionStorageManager エラー:', error);
        return fallback;
      }
    },
  // キー生成
  generateKey: (lessonId, s3Key) => {
    try {
      if (!s3Key) {
        return `pdf_context_${lessonId}_unknown`;
      }
      
      // レッスンIDとS3キーの組み合わせでユニークなキーを生成
      // セクション変更時も異なるキーになるように
      const key = `pdf_context_${lessonId}_${lessonId}_${s3Key.split('/').pop()}`;
      return key;
    } catch (error) {
      console.error('キー生成エラー:', error);
      // フォールバック: タイムスタンプベースのキー生成
      const fallbackKey = `pdf_context_${lessonId}_${Date.now()}`;
      return fallbackKey;
    }
  },
  
  // コンテキスト保存
  saveContext: (lessonId, s3Key, context, metadata = {}) => {
    const key = SessionStorageManager.generateKey(lessonId, s3Key);
    
    // デバッグ情報を追加
    console.log('SessionStorageManager.saveContext - キー生成:', {
      lessonId,
      s3Key,
      generatedKey: key,
      keyLength: key.length
    });
    
    const data = {
      context,
      metadata: {
        ...metadata,
        savedAt: new Date().toISOString(),
        lessonId,
        s3Key,
        contextSize: context.length
      }
    };
    
    try {
      // セッションストレージの容量制限をチェック（5MB制限）
      const dataSize = JSON.stringify(data).length;
      if (dataSize > 5 * 1024 * 1024) {
        console.warn('コンテキストが大きすぎます（5MB制限）:', dataSize);
        // コンテキストを切り詰める
        data.context = data.context.substring(0, 2 * 1024 * 1024); // 2MBに制限
        data.metadata.truncated = true;
      }
      
      sessionStorage.setItem(key, JSON.stringify(data));
      console.log('コンテキストをセッションストレージに保存:', { 
        key, 
        contextLength: data.context.length,
        dataSize: JSON.stringify(data).length
      });
      return true;
    } catch (error) {
      console.error('セッションストレージ保存エラー:', error);
      return false;
    }
  },
  
  // コンテキスト取得
  getContext: (lessonId, s3Key) => {
    const key = SessionStorageManager.generateKey(lessonId, s3Key);
    
    // デバッグ情報を追加
    console.log('SessionStorageManager.getContext - キー生成:', {
      lessonId,
      s3Key,
      generatedKey: key
    });
    
    try {
      const data = sessionStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        console.log('セッションストレージからコンテキスト取得:', { key, contextLength: parsed.context.length });
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('セッションストレージ取得エラー:', error);
      return null;
    }
  },
  
  // コンテキスト存在確認
  hasContext: (lessonId, s3Key) => {
    const key = SessionStorageManager.generateKey(lessonId, s3Key);
    
    // デバッグ情報を追加
    console.log('SessionStorageManager.hasContext - キー生成:', {
      lessonId,
      s3Key,
      generatedKey: key,
      exists: sessionStorage.getItem(key) !== null
    });
    
    return sessionStorage.getItem(key) !== null;
  },
  
  // 特定のレッスンのコンテキストをクリア
  clearLessonContext: (lessonId) => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(`pdf_context_${lessonId}_`)) {
        sessionStorage.removeItem(key);
        console.log('レッスンコンテキストをクリア:', key);
      }
    });
  },
  
  // 全コンテキストをクリア
  clearAllContexts: () => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('pdf_context_')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('全コンテキストをクリア');
  },
  
  // 保存されているコンテキストの一覧を取得
  getStoredContexts: () => {
    const contexts = [];
    const keys = Object.keys(sessionStorage);
    
    keys.forEach(key => {
      if (key.startsWith('pdf_context_')) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key));
          contexts.push({
            key,
            ...data.metadata,
            contextLength: data.context.length
          });
        } catch (error) {
          console.error('コンテキスト解析エラー:', error);
        }
      }
    });
    
    return contexts;
  }
};
